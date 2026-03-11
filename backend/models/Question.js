import mongoose from "mongoose";

const questionSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String },
  topic: { type: String },
  imageUrl: {
    type: String,
    default: ""
  },

  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },

  upvotes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  }],

  answerCount: {
    type: Number,
    default: 0
  },
  category: { type: String, default: "General" },
  expertResponse: { type: String, default: "" },
  status: { type: String, enum: ["open", "answered", "closed"], default: "open" },
  responses: [{
    text: String,
    author: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    createdAt: { type: Date, default: Date.now }
  }]

}, { timestamps: true });

export default mongoose.model("Question", questionSchema);
