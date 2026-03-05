import React, { useState } from "react";
import { User, Question } from "../types";
import axios from "axios";

interface CreateQuestionModalProps {
  mode: "ask" | "analyze" | "broadcast";
  onClose: () => void;
  onSubmit: (q: Question) => void;
  user: User;
  theme: "light" | "dark";
}

const CreateQuestionModal: React.FC<CreateQuestionModalProps> = ({
  mode,
  onClose,
  onSubmit,
  user,
  theme
}) => {

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [topic, setTopic] = useState("Malware Analysis");
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);

  const handleSubmit = async () => {

    if (!title.trim()) return;

    try {

      setIsGeneratingImage(true);

      const token = localStorage.getItem("token");

      const response = await axios.post(
        "https://codevirus-insights-1.onrender.com/api/questions",
        {
          title,
          content,
          topic
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      onSubmit(response.data);
      onClose();

    } catch (error: any) {

      console.error(
        "Broadcast failed:",
        error.response?.data?.message || error.message
      );

      alert("Security Inquiry failed to broadcast");

    } finally {

      setIsGeneratingImage(false);

    }
  };

return (
  <div className="fixed inset-0 z-50 flex items-center justify-center">

    {/* Background overlay */}
    <div
      className="absolute inset-0 bg-black/70 backdrop-blur-sm"
      onClick={onClose}
    />

    {/* Modal panel */}
    <div
      className={`relative z-50 w-full max-w-xl rounded-xl shadow-xl border p-6 ${
        theme === "dark"
          ? "bg-slate-900 border-slate-700 text-white"
          : "bg-white border-slate-200 text-black"
      }`}
    >

      <h2 className="text-lg font-bold mb-4">
        {mode === "ask" && "Ask Question"}
        {mode === "analyze" && "Analyze Vulnerability"}
        {mode === "broadcast" && "Broadcast Intelligence"}
      </h2>

      <textarea
        placeholder="State your security inquiry..."
        className="w-full p-3 rounded bg-slate-800 text-white mb-4"
      />

      <div className="flex justify-end gap-3">

        <button
          onClick={onClose}
          className="px-4 py-2 bg-gray-500 rounded"
        >
          Cancel
        </button>

        <button className="px-4 py-2 bg-blue-600 rounded">
          Post
        </button>

      </div>

    </div>

  </div>
);
};

export default CreateQuestionModal;