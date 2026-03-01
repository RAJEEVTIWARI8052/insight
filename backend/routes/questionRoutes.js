import express from "express";
import { createQuestion, getAllQuestions } from "../controllers/questionController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();
router.post("/", createQuestion);
router.get("/", getAllQuestions);
export default router;