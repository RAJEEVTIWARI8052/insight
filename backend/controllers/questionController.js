import Question from "../models/Question.js";
export const createQuestion = async (req, res) => {
  try {
    const { title, content, topic, imageUrl } = req.body;

    if (!title) {
      return res.status(400).json({ message: "Title is required" });
    }

    const question = await Question.create({
      title,
      content,
      topic,
      imageUrl: imageUrl || ""
    });

    res.status(201).json(question);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};







export const getAllQuestions = async (req, res) => {
  try {
    const questions = await Question.find().sort({ createdAt: -1 });

    res.status(200).json(questions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};