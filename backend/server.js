import "dotenv/config";
import express from "express";

import cors from "cors";
import authRoutes from "./routes/authRoutes.js";
import questionRoutes from "./routes/questionRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import prisma from "./prisma.js";

const app = express();

app.use(
  cors({
    origin: ["http://localhost:5173", "http://localhost:3000"],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

app.use(express.json());

prisma.$connect()
  .then(() => console.log("Database Connected via Prisma"))
  .catch((err) => console.log("Prisma connecting error:", err));

app.use("/api/auth", authRoutes);
app.use("/api/questions", questionRoutes);
app.use("/api/notifications", notificationRoutes);

app.get("/", (req, res) => {
  res.send("Backend running ");
});

app.listen(process.env.PORT || 5001, () =>
  console.log(`Server running on port ${process.env.PORT || 5001}`)
);

// Global Error Handler
app.use((err, req, res, next) => {
  console.error("Unhandled Error:", err);
  res.status(500).json({ message: "Internal Server Error", error: err.message });
});
