import fs from "fs";
import path from "path";
import os from "os";
import { v4 as uuidv4 } from "uuid";

// Store path: use /tmp in serverless environment or local root
const DB_FILE = process.env.VERCEL
  ? path.join(os.tmpdir(), "insight_db.json")
  : path.join(process.cwd(), "insight_db.json");

let memoryData = {
  users: [],
  questions: [],
  upvotes: [],
  responses: [],
  notifications: []
};

function loadDb() {
  try {
    if (fs.existsSync(DB_FILE)) {
      const raw = fs.readFileSync(DB_FILE, "utf-8");
      memoryData = JSON.parse(raw);
    }
  } catch (e) {
    console.error("Error reading database file:", e.message);
  }
}

function saveDb() {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(memoryData, null, 2), "utf-8");
  } catch (e) {
    console.error("Error saving database file:", e.message);
  }
}

// Initial load
loadDb();

export const db = {
  // ── Users ──
  findUserByEmail(email) {
    return memoryData.users.find(u => u.email?.toLowerCase() === email?.toLowerCase());
  },

  findUserById(id) {
    return memoryData.users.find(u => u.id === id);
  },

  createUser(data) {
    const user = {
      id: uuidv4(),
      name: data.name || "",
      username: data.username || "",
      email: data.email,
      clerkId: data.clerkId || null,
      password: data.password || null,
      avatar: data.avatar || "",
      bio: data.bio || "",
      otp: data.otp || null,
      otpExpiry: data.otpExpiry || null,
      isVerified: data.isVerified ?? false,
      role: data.role || "user",
      experience: data.experience || 0,
      expertise: data.expertise ? JSON.stringify(data.expertise) : "[]",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    memoryData.users.push(user);
    saveDb();
    return user;
  },

  updateUser(id, updates) {
    const index = memoryData.users.findIndex(u => u.id === id);
    if (index !== -1) {
      if (updates.expertise && Array.isArray(updates.expertise)) {
        updates.expertise = JSON.stringify(updates.expertise);
      }
      memoryData.users[index] = {
        ...memoryData.users[index],
        ...updates,
        updatedAt: new Date().toISOString()
      };
      saveDb();
      return memoryData.users[index];
    }
    return null;
  },

  listExperts() {
    return memoryData.users.filter(u => u.role === "expert");
  },

  // ── Questions ──
  listQuestions() {
    return memoryData.questions
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .map(q => this.formatQuestion(q));
  },

  getQuestionById(id) {
    const q = memoryData.questions.find(item => item.id === id);
    return q ? this.formatQuestion(q) : null;
  },

  createQuestion(data) {
    const question = {
      id: uuidv4(),
      title: data.title,
      content: data.content || "",
      topic: data.topic || "General",
      imageUrl: data.imageUrl || "",
      authorId: data.authorId || null,
      mentionedExpertId: data.mentionedExpertId || null,
      answerCount: 0,
      category: data.category || "General",
      expertResponse: "",
      status: "open",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    memoryData.questions.push(question);
    saveDb();
    return this.formatQuestion(question);
  },

  updateQuestion(id, updates) {
    const index = memoryData.questions.findIndex(q => q.id === id);
    if (index !== -1) {
      memoryData.questions[index] = {
        ...memoryData.questions[index],
        ...updates,
        updatedAt: new Date().toISOString()
      };
      saveDb();
      return this.formatQuestion(memoryData.questions[index]);
    }
    return null;
  },

  deleteQuestion(id) {
    memoryData.questions = memoryData.questions.filter(q => q.id !== id);
    memoryData.responses = memoryData.responses.filter(r => r.questionId !== id);
    memoryData.upvotes = memoryData.upvotes.filter(u => u.questionId !== id);
    saveDb();
    return true;
  },

  formatQuestion(q) {
    const author = memoryData.users.find(u => u.id === q.authorId);
    const authorData = author ? { name: author.name, email: author.email } : null;

    const qResponses = memoryData.responses
      .filter(r => r.questionId === q.id)
      .map(r => {
        const rAuthor = memoryData.users.find(u => u.id === r.authorId);
        return {
          id: r.id,
          text: r.text,
          questionId: r.questionId,
          authorId: r.authorId,
          author: rAuthor ? { name: rAuthor.name, email: rAuthor.email } : null,
          createdAt: r.createdAt
        };
      });

    const upvoteUserIds = memoryData.upvotes
      .filter(u => u.questionId === q.id)
      .map(u => u.userId);

    return {
      id: q.id,
      title: q.title,
      content: q.content,
      topic: q.topic,
      imageUrl: q.imageUrl,
      authorId: q.authorId,
      author: authorData,
      mentionedExpertId: q.mentionedExpertId,
      answerCount: qResponses.length,
      category: q.category,
      expertResponse: q.expertResponse,
      status: q.status,
      createdAt: q.createdAt,
      updatedAt: q.updatedAt,
      responses: qResponses,
      upvotes: upvoteUserIds
    };
  },

  // ── Upvotes ──
  toggleUpvote(questionId, userId) {
    const existingIndex = memoryData.upvotes.findIndex(
      u => u.questionId === questionId && u.userId === userId
    );
    if (existingIndex !== -1) {
      memoryData.upvotes.splice(existingIndex, 1);
      saveDb();
      return { upvoted: false };
    } else {
      memoryData.upvotes.push({ questionId, userId });
      saveDb();
      return { upvoted: true };
    }
  },

  // ── Responses ──
  addResponse(questionId, authorId, text) {
    const response = {
      id: uuidv4(),
      questionId,
      authorId,
      text,
      createdAt: new Date().toISOString()
    };
    memoryData.responses.push(response);

    // Update question answer count
    const qIndex = memoryData.questions.findIndex(q => q.id === questionId);
    if (qIndex !== -1) {
      memoryData.questions[qIndex].answerCount = memoryData.responses.filter(r => r.questionId === questionId).length;
    }
    saveDb();
    return response;
  },

  deleteResponse(responseId) {
    const resp = memoryData.responses.find(r => r.id === responseId);
    if (resp) {
      memoryData.responses = memoryData.responses.filter(r => r.id !== responseId);
      const qIndex = memoryData.questions.findIndex(q => q.id === resp.questionId);
      if (qIndex !== -1) {
        memoryData.questions[qIndex].answerCount = memoryData.responses.filter(r => r.questionId === resp.questionId).length;
      }
      saveDb();
      return true;
    }
    return false;
  },

  // ── Notifications ──
  createNotification({ recipientId, senderId = null, type = "general", message, link = null }) {
    const notification = {
      id: uuidv4(),
      recipientId,
      senderId,
      type,
      message,
      link,
      isRead: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    memoryData.notifications.push(notification);
    saveDb();
    return notification;
  },

  listNotifications(recipientId) {
    return memoryData.notifications
      .filter(n => n.recipientId === recipientId)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 20);
  },

  getUnreadNotificationCount(recipientId) {
    return memoryData.notifications.filter(
      n => n.recipientId === recipientId && !n.isRead
    ).length;
  },

  markNotificationsAsRead(recipientId) {
    memoryData.notifications.forEach(n => {
      if (n.recipientId === recipientId) {
        n.isRead = true;
        n.updatedAt = new Date().toISOString();
      }
    });
    saveDb();
    return true;
  }
};
