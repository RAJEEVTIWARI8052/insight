import { Router } from "express";
import { db } from "../db.js";
import { authenticate } from "../middleware/auth.js";
import { findAbusiveWord } from "../utils/profanity.js";

const router = Router();

const STOPWORDS = new Set([
  "the", "a", "an", "is", "in", "on", "of", "to", "and", "or", "how",
  "why", "what", "when", "where", "i", "my", "me", "we", "can", "do", "does",
  "for", "with", "this", "that", "it", "be", "was", "are", "not", "has", "have"
]);

const TOPIC_MAPPINGS = [
  ["Malware Analysis", ["virus", "worm", "ransomware", "trojan", "malware", "reverse", "forensic", "payload", "obfuscation", "spyware", "adware", "rootkit", "backdoor", "emotet", "cobalt strike", "binary", "assembly"]],
  ["Network Security", ["firewall", "vlan", "network", "dns", "ip", "proxy", "packet", "sniffing", "wifi", "port", "vpn", "router", "switch", "ips", "ids", "tcp", "udp", "icmp", "arp"]],
  ["Penetration Testing", ["kali", "metasploit", "pentest", "vulnerability", "scanner", "exploit", "red team", "burp", "nmap", "privilege escalation", "lateral movement", "bypass", "payload", "poc"]],
  ["Cryptography", ["encryption", "decryption", "hash", "crypto", "sha256", "aes", "rsa", "kyber", "quantum", "tls", "ssl", "cipher", "pkc", "steganography", "signature", "md5"]],
  ["DevSecOps", ["ci/cd", "pipeline", "docker", "kubernetes", "terraform", "automation", "jenkins", "github actions", "k8s", "container", "microservices", "sast", "dast", "iac"]],
  ["Web Exploitation", ["xss", "sql", "injection", "csrf", "owasp", "header", "cookie", "bypass", "web", "appsec", "html", "js", "directory traversal", "lfi", "rfi", "brute force", "ssrf"]],
  ["Incident Response", ["attack", "breached", "alert", "soc", "log", "monitor", "response", "triage", "incident", "siem", "splunk", "forensics", "endpoint", "edr", "compromise", "threat hunting"]]
];

function classifyIssue(title, content) {
  const text = `${title} ${content || ""}`.toLowerCase();
  for (const [topic, keywords] of TOPIC_MAPPINGS) {
    if (keywords.some(kw => text.includes(kw))) {
      return topic;
    }
  }
  return "General";
}

// GET /api/questions/check-duplicate
router.get("/check-duplicate", (req, res) => {
  const title = (req.query.title || "").toString().trim().toLowerCase();
  if (!title) {
    return res.json({ isDuplicate: false, count: 0, keywordsMatched: [], sampleMatches: [] });
  }

  const queryWords = title
    .replace(/[^\w\s]/gi, "")
    .split(/\s+/)
    .filter(w => w.length > 2 && !STOPWORDS.has(w));

  if (queryWords.length === 0) {
    return res.json({ isDuplicate: false, count: 0, keywordsMatched: [], sampleMatches: [] });
  }

  const allQuestions = db.listQuestions();
  const sampleMatches = [];
  const matchedKeywordSet = new Set();

  for (const q of allQuestions) {
    const qText = `${q.title} ${q.content || ""}`.toLowerCase();
    const matchesInQ = queryWords.filter(w => qText.includes(w));
    if (matchesInQ.length >= 2 || (queryWords.length === 1 && matchesInQ.length === 1)) {
      sampleMatches.push(q.title);
      matchesInQ.forEach(w => matchedKeywordSet.add(w));
    }
  }

  return res.json({
    isDuplicate: sampleMatches.length > 0,
    count: sampleMatches.length,
    keywordsMatched: Array.from(matchedKeywordSet),
    sampleMatches: sampleMatches.slice(0, 3)
  });
});

// GET /api/questions
router.get("/", (req, res) => {
  const questions = db.listQuestions();
  return res.json(questions);
});

// POST /api/questions
router.post("/", authenticate, (req, res) => {
  const { title, content, imageUrl, mentionedExpertId, category } = req.body;
  if (!title) {
    return res.status(400).json({ detail: "Title is required" });
  }

  const abusiveTitle = findAbusiveWord(title);
  const abusiveContent = findAbusiveWord(content);
  if (abusiveTitle || abusiveContent) {
    const word = abusiveTitle || abusiveContent;
    return res.status(400).json({
      detail: `Your question contains restricted language ("${word}"). Please keep discussions professional.`
    });
  }

  const topic = classifyIssue(title, content);
  const question = db.createQuestion({
    title,
    content,
    topic,
    imageUrl,
    authorId: req.user.id,
    mentionedExpertId,
    category
  });

  if (mentionedExpertId) {
    db.createNotification({
      recipientId: mentionedExpertId,
      senderId: req.user.id,
      type: "mention",
      message: `${req.user.name || "A user"} tagged you in a cybersecurity question: "${title}"`,
      link: `/question/${question.id}`
    });
  }

  return res.status(201).json(question);
});

// GET /api/questions/:id
router.get("/:id", (req, res) => {
  const q = db.getQuestionById(req.params.id);
  if (!q) {
    return res.status(404).json({ detail: "Question not found" });
  }
  return res.json(q);
});

// POST /api/questions/:id/upvote
router.post("/:id/upvote", authenticate, (req, res) => {
  const q = db.getQuestionById(req.params.id);
  if (!q) {
    return res.status(404).json({ detail: "Question not found" });
  }

  const result = db.toggleUpvote(req.params.id, req.user.id);
  const updated = db.getQuestionById(req.params.id);
  return res.json({ upvoted: result.upvoted, upvotes: updated.upvotes });
});

// POST /api/questions/:id/respond
router.post("/:id/respond", authenticate, (req, res) => {
  const { response } = req.body;
  if (!response) {
    return res.status(400).json({ detail: "Response text is required" });
  }

  const abusiveWord = findAbusiveWord(response);
  if (abusiveWord) {
    return res.status(400).json({
      detail: `Your response contains restricted language ("${abusiveWord}"). Please keep discussions professional.`
    });
  }

  const q = db.getQuestionById(req.params.id);
  if (!q) {
    return res.status(404).json({ detail: "Question not found" });
  }

  const updated = db.updateQuestion(req.params.id, {
    expertResponse: response,
    status: "answered"
  });

  if (q.authorId) {
    db.createNotification({
      recipientId: q.authorId,
      senderId: req.user.id,
      type: "expert_response",
      message: `An expert responded to your question: "${q.title}"`,
      link: `/question/${q.id}`
    });
  }

  return res.json(updated);
});

// POST /api/questions/:id/answers
router.post("/:id/answers", authenticate, (req, res) => {
  const { text } = req.body;
  if (!text) {
    return res.status(400).json({ detail: "Answer text is required" });
  }

  const abusiveWord = findAbusiveWord(text);
  if (abusiveWord) {
    return res.status(400).json({
      detail: `Your answer contains restricted language ("${abusiveWord}"). Please keep discussions professional.`
    });
  }

  const q = db.getQuestionById(req.params.id);
  if (!q) {
    return res.status(404).json({ detail: "Question not found" });
  }

  const answer = db.addResponse(req.params.id, req.user.id, text);

  if (q.authorId && q.authorId !== req.user.id) {
    db.createNotification({
      recipientId: q.authorId,
      senderId: req.user.id,
      type: "answer",
      message: `${req.user.name || "A user"} answered your question: "${q.title}"`,
      link: `/question/${q.id}`
    });
  }

  return res.status(201).json(answer);
});

// DELETE /api/questions/:id/answers/:answerId
router.delete("/:id/answers/:answerId", authenticate, (req, res) => {
  const deleted = db.deleteResponse(req.params.answerId);
  if (!deleted) {
    return res.status(404).json({ detail: "Answer not found" });
  }
  return res.json({ message: "Answer deleted successfully" });
});

export default router;
