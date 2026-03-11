import Question from "../models/Question.js";

// Basic classifier function
const classifyIssue = (title, content) => {
  const text = `${title} ${content}`.toLowerCase();
  if (text.includes("bug") || text.includes("error") || text.includes("fail")) return "Bug";
  if (text.includes("feature") || text.includes("add") || text.includes("improve")) return "Feature Request";
  if (text.includes("how") || text.includes("question") || text.includes("help")) return "Support";
  return "General";
};

export const createQuestion = async (req, res) => {
  try {
    const { title, content, topic, imageUrl } = req.body;

    console.log("--- CREATE QUESTION START ---");
    console.log("Body:", req.body);
    console.log("User:", req.user ? req.user._id : "NO USER");

    if (!title) {
      console.log("Validation failed: Title missing");
      return res.status(400).json({ message: "Title is required" });
    }

    // Check for duplicates (safer search)
    const normalizedTitle = title.trim();
    const existingQuestion = await Question.findOne({
      title: { $regex: new RegExp(normalizedTitle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i') },
      status: "answered"
    }).sort({ createdAt: -1 });

    if (existingQuestion) {
      console.log("Duplicate found:", existingQuestion._id);
      return res.status(200).json({
        message: "A similar issue was previously answered.",
        existingQuestion,
        suggestedResponse: existingQuestion.expertResponse || "No specific response found, but this topic has been covered."
      });
    }

    // Classify the issue
    console.log("Classifying issue...");
    const category = classifyIssue(title, content);

    console.log("Saving to MongoDB...");
    const question = await Question.create({
      title,
      content,
      topic,
      category,
      imageUrl: imageUrl || "",
      author: req.user?._id
    });

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
    const questions = await Question.find().populate("author", "name email").sort({ createdAt: -1 });
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

    // Allow author or expert to delete
    if (question.author.toString() !== req.user?._id.toString() && req.user?.role !== "expert") {
      return res.status(403).json({ message: "Not authorized to delete this issue." });
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