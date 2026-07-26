import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import authRouter from "./routes/auth.js";
import questionsRouter from "./routes/questions.js";
import notificationsRouter from "./routes/notifications.js";

dotenv.config();

const app = express();

// Middleware
app.use(cors({
  origin: true,
  credentials: true
}));
app.use(express.json());

// Routes
app.use("/api/auth", authRouter);
app.use("/api/questions", questionsRouter);
app.use("/api/notifications", notificationsRouter);

// Health check endpoint
app.get("/api", (req, res) => {
  res.json({ message: "Insight Node.js Backend Running 🚀", version: "2.0.0" });
});

app.get("/", (req, res) => {
  res.json({ message: "Insight API — Node.js Backend" });
});

// Start local dev server if executed directly
if (process.env.NODE_ENV !== "production" && !process.env.VERCEL) {
  const PORT = process.env.PORT || 5001;
  app.listen(PORT, () => {
    console.log(`🚀 Insight Node.js Backend listening on http://localhost:${PORT}`);
  });
}

export default app;
