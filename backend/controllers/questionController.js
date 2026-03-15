import Question from "../models/Question.js";
import Notification from "../models/Notification.js";

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
    // Use a more flexible regex for better discovery
    const existingQuestion = await Question.findOne({
      title: { $regex: new RegExp(normalizedTitle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i') },
      status: "answered"
    }).sort({ createdAt: -1 });

    if (existingQuestion) {
      return res.status(200).json({
        expertResponse: existingQuestion.expertResponse,
        originalTitle: existingQuestion.title
      });
    }
    res.status(200).json(null);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createQuestion = async (req, res) => {
  try {
    const { title, content, topic, imageUrl, mentionedExpertId } = req.body;

    console.log("--- CREATE QUESTION START ---");
    console.log("Body:", req.body);
    console.log("User:", req.user ? req.user._id : "NO USER");

    if (!title) {
      console.log("Validation failed: Title missing");
      return res.status(400).json({ message: "Title is required" });
    }

    // Check for duplicates (flexible search)
    const normalizedTitle = title.trim();
    const existingQuestion = await Question.findOne({
      title: { $regex: new RegExp(normalizedTitle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i') },
      status: "answered"
    }).sort({ createdAt: -1 });

    if (existingQuestion && !req.body.bypassDeduplication) {
      console.log("Automatic Resolution Found:", existingQuestion._id);

      // Classify the issue (reuse or re-classify)
      const category = classifyIssue(title, content);

      // Create the question but with existing expert response
      const question = await Question.create({
        title,
        content,
        topic: topic || category,
        category,
        imageUrl: imageUrl || "",
        author: req.user?._id,
        mentionedExpertId: mentionedExpertId || null,
        expertResponse: existingQuestion.expertResponse,
        status: "answered"
      });

      return res.status(201).json({
        ...question._doc,
        autoResolved: true,
        originalResolutionId: existingQuestion._id
      });
    }

    // Classify the issue
    console.log("Classifying issue...");
    const category = classifyIssue(title, content);

    console.log("Saving to MongoDB...");
    const question = await Question.create({
      title,
      content,
      topic: topic || category,
      category,
      imageUrl: imageUrl || "",
      author: req.user?._id,
      mentionedExpertId: mentionedExpertId || null
    });

    if (mentionedExpertId) {
      await Notification.create({
        recipient: mentionedExpertId,
        sender: req.user?._id,
        type: "mention",
        message: `You were mentioned in a new inquiry: "${title}"`,
        link: `/question/${question._id}`
      });
    }

    console.log("Successfully created question:", question._id);
    console.log("--- CREATE QUESTION END ---");
    res.status(201).json(question);

  } catch (error) {
    console.error("Create Question Error:", error);
    res.status(500).json({ message: error.message });
  }
};

export const getAllQuestions = async (req, res) => {
  try {
    const questions = await Question.find()
      .populate("author", "name email")
      .populate("responses.author", "name email")
      .sort({ createdAt: -1 });
    res.status(200).json(questions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const addExpertResponse = async (req, res) => {
  try {
    const { id } = req.params;
    const { response } = req.body;

    // Check if user is an expert (logic should be in middleware but adding here for safety)
    if (req.user?.role !== "expert") {
      return res.status(403).json({ message: "Only experts can respond to issues." });
    }

    const question = await Question.findByIdAndUpdate(
      id,
      {
        expertResponse: response,
        status: "answered"
      },
      { new: true }
    );

    if (!question) {
      return res.status(404).json({ message: "Issue not found." });
    }

    // Trigger Notification for author
    if (question.author && question.author.toString() !== req.user._id.toString()) {
      await Notification.create({
        recipient: question.author,
        sender: req.user._id,
        type: "expert_response",
        message: `An expert has provided a definitive solution to your inquiry: "${question.title}"`,
        link: `/question/${question._id}`
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
    const question = await Question.findById(id);

    if (!question) {
      return res.status(404).json({ message: "Issue not found." });
    }

    await Question.findByIdAndDelete(id);
    res.status(200).json({ message: "Issue deleted successfully." });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const upvoteQuestion = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const question = await Question.findById(id);
    if (!question) return res.status(404).json({ message: "Question not found" });

    // Toggle upvote
    const index = question.upvotes.indexOf(userId);
    if (index === -1) {
      question.upvotes.push(userId);
    } else {
      question.upvotes.splice(index, 1);
    }

    await question.save();

    // Trigger Notification if upvoted (index was -1 before push)
    if (index === -1 && question.author && question.author.toString() !== userId.toString()) {
      await Notification.create({
        recipient: question.author,
        sender: userId,
        type: "upvote",
        message: `Your inquiry "${question.title}" received a new upvote.`,
        link: `/question/${question._id}`
      });
    }

    res.status(200).json(question);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const downvoteQuestion = async (req, res) => {
  try {
    // Basic implementation: if you downvote, we just ensure you're not in upvotes
    // In a more complex system, you'd have a separate downvotes array
    const { id } = req.params;
    const userId = req.user._id;

    const question = await Question.findById(id);
    if (!question) return res.status(404).json({ message: "Question not found" });

    const index = question.upvotes.indexOf(userId);
    if (index !== -1) {
      question.upvotes.splice(index, 1);
      await question.save();
    }

    res.status(200).json(question);
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

    const question = await Question.findById(id);
    if (!question) return res.status(404).json({ message: "Question not found." });

    const newResponse = { text: content.trim(), author: req.user._id, createdAt: new Date() };
    question.responses.push(newResponse);
    question.answerCount = question.responses.length;
    await question.save();

    // Populate author info for the full response
    const updatedQuestion = await Question.findById(id)
      .populate("author", "name email")
      .populate("responses.author", "name email");

    // Notify the question author (if different user)
    if (question.author && question.author.toString() !== req.user._id.toString()) {
      await Notification.create({
        recipient: question.author,
        sender: req.user._id,
        type: "answer",
        message: `Someone answered your question: "${question.title}"`,
        link: `/question/${question._id}`
      });
    }

    res.status(200).json(updatedQuestion);
  } catch (error) {
    console.error("Add Answer Error:", error);
    res.status(500).json({ message: error.message });
  }
};

export const deleteAnswer = async (req, res) => {
  try {
    const { questionId, answerId } = req.params;
    const userId = req.user._id;

    const question = await Question.findById(questionId);
    if (!question) return res.status(404).json({ message: "Question not found" });

    // Assuming answers are in 'responses' array based on the schema
    const answerIndex = question.responses.findIndex(r => r._id.toString() === answerId);
    if (answerIndex === -1) return res.status(404).json({ message: "Answer not found" });

    const answer = question.responses[answerIndex];

    // Author of answer or expert can delete
    if (answer.author.toString() !== userId.toString() && req.user?.role !== "expert") {
      return res.status(403).json({ message: "Not authorized to delete this answer" });
    }

    question.responses.splice(answerIndex, 1);
    await question.save();

    res.status(200).json(question);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};