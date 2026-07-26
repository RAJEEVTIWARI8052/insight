import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { OAuth2Client } from "google-auth-library";
import { db } from "../db.js";
import { authenticate } from "../middleware/auth.js";
import { sendOtpEmail } from "../utils/mailer.js";

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || "codevirus_secret";
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || "";
const googleClient = new OAuth2Client(GOOGLE_CLIENT_ID);

function createToken(userId) {
  return jwt.sign({ id: userId }, JWT_SECRET, { expiresIn: "7d" });
}

function userToDict(user) {
  let expertise = [];
  try {
    expertise = typeof user.expertise === "string" ? JSON.parse(user.expertise) : user.expertise || [];
  } catch (e) {
    expertise = [];
  }

  return {
    id: user.id,
    _id: user.id,
    name: user.name,
    username: user.username,
    email: user.email,
    avatar: user.avatar,
    bio: user.bio,
    isVerified: user.isVerified,
    role: user.role,
    experience: user.experience,
    expertise,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt
  };
}

// POST /api/auth/send-otp
router.post("/send-otp", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ detail: "Email is required" });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiry = new Date(Date.now() + 5 * 60 * 1000).toISOString();

    let user = db.findUserByEmail(email);
    if (!user) {
      user = db.createUser({ email, otp, otpExpiry, isVerified: false });
    } else {
      user = db.updateUser(user.id, { otp, otpExpiry });
    }

    await sendOtpEmail(email, otp);
    return res.json({ message: "Verification code sent to your email" });
  } catch (err) {
    console.error("send-otp error:", err);
    return res.status(500).json({ detail: "Failed to send verification code" });
  }
});

// POST /api/auth/verify-otp
router.post("/verify-otp", (req, res) => {
  const { email, otp } = req.body;
  const user = db.findUserByEmail(email);

  if (!user || user.otp !== otp || !user.otpExpiry || new Date(user.otpExpiry) < new Date()) {
    return res.status(400).json({ detail: "Invalid or expired verification code" });
  }

  db.updateUser(user.id, { isVerified: true, otp: null, otpExpiry: null });
  return res.json({ message: "Email verified successfully" });
});

// POST /api/auth/register
router.post("/register", async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ detail: "Name, email, and password are required" });
  }

  const existing = db.findUserByEmail(email);
  if (existing && existing.password) {
    return res.status(400).json({ detail: "User already registered with this email" });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  let user;
  if (existing) {
    user = db.updateUser(existing.id, { name, password: hashedPassword, isVerified: true });
  } else {
    user = db.createUser({ name, email, password: hashedPassword, isVerified: true });
  }

  const token = createToken(user.id);
  return res.json({
    message: "Registration successful! Welcome to Insight.",
    token,
    user: { id: user.id, name: user.name, email: user.email }
  });
});

// POST /api/auth/login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const user = db.findUserByEmail(email);

  if (!user || !user.password) {
    return res.status(400).json({ detail: "User not registered" });
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return res.status(400).json({ detail: "Invalid credentials" });
  }

  const token = createToken(user.id);
  return res.json({
    message: "Login successful",
    token,
    user: { id: user.id, name: user.name, email: user.email }
  });
});

// GET /api/auth/me
router.get("/me", authenticate, (req, res) => {
  return res.json(userToDict(req.user));
});

// POST /api/auth/toggle-role
router.post("/toggle-role", authenticate, (req, res) => {
  const user = req.user;
  if (user.role === "user") {
    const { experience = 0, expertise = [] } = req.body;
    if (experience < 4) {
      return res.status(400).json({ detail: "You need at least 4 years of experience to become an expert." });
    }
    if (!expertise || expertise.length === 0) {
      return res.status(400).json({ detail: "You must provide at least one area of expertise." });
    }

    const updated = db.updateUser(user.id, { role: "expert", experience, expertise });
    return res.json(userToDict(updated));
  } else {
    const updated = db.updateUser(user.id, { role: "user" });
    return res.json(userToDict(updated));
  }
});

// POST /api/auth/google
router.post("/google", async (req, res) => {
  try {
    const { credential } = req.body;
    if (!credential) {
      return res.status(400).json({ detail: "Google credential is required" });
    }

    let email = "";
    let name = "";
    let avatar = "";

    try {
      const ticket = await googleClient.verifyIdToken({
        idToken: credential,
        audience: GOOGLE_CLIENT_ID
      });
      const payload = ticket.getPayload();
      email = payload?.email;
      name = payload?.name || "";
      avatar = payload?.picture || "";
    } catch (e) {
      // Decode JWT fallback if offline / dev mode
      const decoded = jwt.decode(credential);
      email = decoded?.email;
      name = decoded?.name || "";
      avatar = decoded?.picture || "";
    }

    if (!email) {
      return res.status(400).json({ detail: "Google account has no email" });
    }

    let user = db.findUserByEmail(email);
    if (!user) {
      user = db.createUser({ name, email, avatar, isVerified: true });
    } else {
      const updates = {};
      if (!user.avatar && avatar) updates.avatar = avatar;
      if (!user.name && name) updates.name = name;
      user = db.updateUser(user.id, updates) || user;
    }

    const token = createToken(user.id);
    return res.json({
      message: "Google login successful",
      token,
      user: { id: user.id, name: user.name, email: user.email, avatar: user.avatar }
    });
  } catch (err) {
    console.error("Google auth error:", err);
    return res.status(401).json({ detail: "Invalid Google token" });
  }
});

// GET /api/auth/experts
router.get("/experts", authenticate, (req, res) => {
  const experts = db.listExperts().map(userToDict);
  return res.json(experts);
});

export default router;
