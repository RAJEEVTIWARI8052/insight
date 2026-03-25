import prisma from "../prisma.js";
import { containsAbusiveWord, findAbusiveWord } from "../utils/profanityFilter.js";

// Intelligent classifier function for Cyber Intelligence
const classifyIssue = (title, content) => {
  const text = `${title} ${content}`.toLowerCase();

  const mappings = [
    { topic: "Malware Analysis", keywords: ["virus", "worm", "ransomware", "trojan", "malware", "reverse", "forensic", "payload", "obfuscation", "spyware", "adware", "rootkit", "backdoor", "emotet", "cobalt strike", "binary", "assembly"] },
    { topic: "Network Security", keywords: ["firewall", "vlan", "network", "dns", "ip", "proxy", "packet", "sniffing", "wifi", "port", "vpn", "router", "switch", "ips", "ids", "tcp", "udp", "icmp", "arp"] },
    { topic: "Penetration Testing", keywords: ["kali", "metasploit", "pentest", "vulnerability", "scanner", "exploit", "red team", "burp", "nmap", "privilege escalation", "lateral movement", "bypass", "payload", "poc"] },
    { topic: "Cryptography", keywords: ["encryption", "decryption", "hash", "crypto", "sha256", "aes", "rsa", "kyber", "quantum", "tls", "ssl", "cipher", "pkc", "steganography", "signature", "md5"] },
    { topic: "DevSecOps", keywords: ["ci/cd", "pipeline", "docker", "kubernetes", "terraform", "automation", "jenkins", "github actions", "k8s", "container", "microservices", "sast", "dast", "iac"] },
    { topic: "Web Exploitation", keywords: ["xss", "sql", "injection", "csrf", "owasp", "header", "cookie", "bypass", "web", "appsec", "html", "js", "directory traversal", "lfi", "rfi", "brute force", "ssrf"] },
    { topic: "Incident Response", keywords: ["attack", "breached", "alert", "soc", "log", "monitor", "response", "triage", "incident", "siem", "splunk", "forensics", "endpoint", "edr", "compromise", "threat hunting"] }
  ];

  for (const mapping of mappings) {
    if (mapping.keywords.some(kw => text.includes(kw))) {
      return mapping.topic;
    }
  }

  return "General";
};

export const checkDuplicate = async (req, res) => {
  try {
    const { title } = req.query;
    if (!title || title.length < 5) return res.status(200).json(null);

    const normalizedTitle = title.trim();

    // 1. Exact match
    const exactMatch = await prisma.question.findFirst({
      where: {
        title: { contains: normalizedTitle },
        status: "answered",
        expertResponse: { not: "" }
      },
      orderBy: { createdAt: 'desc' }
    });

    if (exactMatch) {
      return res.status(200).json({
        expertResponse: exactMatch.expertResponse,
        originalTitle: exactMatch.title
      });
    }

    // 2. Keyword-based fuzzy match
    const STOPWORDS = new Set(["the", "a", "an", "is", "in", "on", "of", "to", "and", "or", "how",
      "why", "what", "when", "where", "i", "my", "me", "we", "can", "do", "does",
      "for", "with", "this", "that", "it", "be", "was", "are", "not", "has", "have"]);

    const keywords = normalizedTitle
      .toLowerCase()
      .replace(/[^\w\s]/g, "")
      .split(/\s+/)
      .filter(w => w.length >= 3 && !STOPWORDS.has(w));

    if (keywords.length === 0) return res.status(200).json(null);

    const keywordConditions = keywords.map(kw => ({
      title: { contains: kw }
    }));

    const candidates = await prisma.question.findMany({
      where: {
        OR: keywordConditions,
        status: "answered",
        expertResponse: { not: "" }
      },
      take: 20
    });

    const scored = candidates.map(q => {
      const tl = q.title.toLowerCase();
      const score = keywords.filter(kw => tl.includes(kw)).length;
      return { q, score };
    }).filter(({ score }) => score >= Math.min(2, keywords.length));

    if (scored.length === 0) return res.status(200).json(null);

    scored.sort((a, b) => b.score - a.score);
    const best = scored[0].q;

    return res.status(200).json({
      expertResponse: best.expertResponse,
      originalTitle: best.title
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createQuestion = async (req, res) => {
  try {
    const { title, content, topic, imageUrl, mentionedExpertId } = req.body;

    if (!title) {
      return res.status(400).json({ message: "Title is required" });
    }

    const abusiveInTitle = findAbusiveWord(title);
    const abusiveInContent = findAbusiveWord(content);
    if (abusiveInTitle || abusiveInContent) {
      return res.status(400).json({
        message: "Your post contains inappropriate language.",
        abusiveWord: abusiveInTitle || abusiveInContent
      });
    }

    const normalizedTitle = title.trim();
    const existingQuestion = await prisma.question.findFirst({
      where: {
        title: { contains: normalizedTitle },
        status: "answered"
      },
      orderBy: { createdAt: 'desc' }
    });

    if (existingQuestion && !req.body.bypassDeduplication) {
      const category = classifyIssue(title, content);

      const question = await prisma.question.create({
        data: {
          title,
          content,
          topic: topic || category,
          category,
          imageUrl: imageUrl || "",
          authorId: req.user?.id,
          mentionedExpertId: mentionedExpertId || null,
          expertResponse: existingQuestion.expertResponse,
          status: "answered"
        }
      });

      return res.status(201).json({
        ...question,
        autoResolved: true,
        originalResolutionId: existingQuestion.id
      });
    }

    const category = classifyIssue(title, content);

    const question = await prisma.question.create({
      data: {
        title,
        content,
        topic: topic || category,
        category,
        imageUrl: imageUrl || "",
        authorId: req.user?.id,
        mentionedExpertId: mentionedExpertId || null
      }
    });

    if (mentionedExpertId) {
      await prisma.notification.create({
        data: {
          recipientId: mentionedExpertId,
          senderId: req.user?.id,
          type: "mention",
          message: `You were mentioned in a new inquiry: "${title}"`,
          link: `/question/${question.id}`
        }
      });
    }

    res.status(201).json(question);

  } catch (error) {
    console.error("Create Question Error:", error);
    res.status(500).json({ message: error.message });
  }
};

export const getAllQuestions = async (req, res) => {
  try {
    const questions = await prisma.question.findMany({
      include: {
        author: { select: { name: true, email: true } },
        responses: {
          include: { author: { select: { name: true, email: true } } }
        },
        upvotes: {
          select: { userId: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    const formattedQuestions = questions.map(q => ({
      ...q,
      upvotes: q.upvotes.map(uv => uv.userId)
    }));

    res.status(200).json(formattedQuestions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const addExpertResponse = async (req, res) => {
  try {
    const { id } = req.params;
    const { response } = req.body;

    if (req.user?.role !== "expert") {
      return res.status(403).json({ message: "Only experts can respond to issues." });
    }

    const question = await prisma.question.update({
      where: { id },
      data: {
        expertResponse: response,
        status: "answered"
      }
    });

    if (question.authorId && question.authorId !== req.user.id) {
      await prisma.notification.create({
        data: {
          recipientId: question.authorId,
          senderId: req.user.id,
          type: "expert_response",
          message: `An expert has provided a definitive solution to your inquiry: "${question.title}"`,
          link: `/question/${question.id}`
        }
      });
    }

    res.status(200).json(question);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteQuestion = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.question.delete({ where: { id } });
    res.status(200).json({ message: "Issue deleted successfully." });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const upvoteQuestion = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const existingUpvote = await prisma.questionUpvote.findUnique({
      where: { questionId_userId: { questionId: id, userId } }
    });

    if (existingUpvote) {
      await prisma.questionUpvote.delete({
        where: { questionId_userId: { questionId: id, userId } }
      });
    } else {
      await prisma.questionUpvote.create({
        data: { questionId: id, userId }
      });

      const question = await prisma.question.findUnique({ where: { id } });
      if (question.authorId && question.authorId !== userId) {
        await prisma.notification.create({
          data: {
            recipientId: question.authorId,
            senderId: userId,
            type: "upvote",
            message: `Your inquiry "${question.title}" received a new upvote.`,
            link: `/question/${question.id}`
          }
        });
      }
    }

    const updatedQuestion = await prisma.question.findUnique({
      where: { id },
      include: {
        author: { select: { name: true, email: true } },
        responses: { include: { author: { select: { name: true, email: true } } } },
        upvotes: { select: { userId: true } }
      }
    });

    res.status(200).json({
      ...updatedQuestion,
      upvotes: updatedQuestion.upvotes.map(uv => uv.userId)
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const downvoteQuestion = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const existingUpvote = await prisma.questionUpvote.findUnique({
      where: { questionId_userId: { questionId: id, userId } }
    });

    if (existingUpvote) {
      await prisma.questionUpvote.delete({
        where: { questionId_userId: { questionId: id, userId } }
      });
    }

    const updatedQuestion = await prisma.question.findUnique({
      where: { id },
      include: {
        author: { select: { name: true, email: true } },
        responses: { include: { author: { select: { name: true, email: true } } } },
        upvotes: { select: { userId: true } }
      }
    });

    res.status(200).json({
      ...updatedQuestion,
      upvotes: updatedQuestion.upvotes.map(uv => uv.userId)
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const addAnswer = async (req, res) => {
  try {
    const { id } = req.params;
    const { content } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({ message: "Answer content is required." });
    }

    const abusiveWord = findAbusiveWord(content);
    if (abusiveWord) {
      return res.status(400).json({
        message: "Your answer contains inappropriate language.",
        abusiveWord
      });
    }

    await prisma.response.create({
      data: {
        text: content.trim(),
        questionId: id,
        authorId: req.user.id
      }
    });

    const question = await prisma.question.update({
      where: { id },
      data: { answerCount: { increment: 1 } },
      include: {
        author: { select: { name: true, email: true } },
        responses: { include: { author: { select: { name: true, email: true } } } },
        upvotes: { select: { userId: true } }
      }
    });

    if (question.authorId && question.authorId !== req.user.id) {
      await prisma.notification.create({
        data: {
          recipientId: question.authorId,
          senderId: req.user.id,
          type: "general", // "answer" not in enum, fallback to general
          message: `Someone answered your question: "${question.title}"`,
          link: `/question/${question.id}`
        }
      });
    }

    res.status(200).json({
      ...question,
      upvotes: question.upvotes.map(uv => uv.userId)
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteAnswer = async (req, res) => {
  try {
    const { questionId, answerId } = req.params;
    const userId = req.user.id;

    const answer = await prisma.response.findUnique({ where: { id: answerId } });
    if (!answer) return res.status(404).json({ message: "Answer not found" });

    if (answer.authorId !== userId && req.user?.role !== "expert") {
      return res.status(403).json({ message: "Not authorized to delete this answer" });
    }

    await prisma.response.delete({ where: { id: answerId } });

    const question = await prisma.question.update({
      where: { id: questionId },
      data: { answerCount: { decrement: 1 } },
      include: {
        author: { select: { name: true, email: true } },
        responses: { include: { author: { select: { name: true, email: true } } } },
        upvotes: { select: { userId: true } }
      }
    });

    res.status(200).json({
      ...question,
      upvotes: question.upvotes.map(uv => uv.userId)
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};