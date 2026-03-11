import React, { useState } from "react";
import { User, Question } from "../types";
import axios from "axios";
import { useAuth } from "@clerk/clerk-react";

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
  const { getToken } = useAuth();

  const handleSubmit = async () => {

    if (!title.trim()) return;

    try {

      setIsGeneratingImage(true);

      const token = await getToken();

      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/questions`,
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
        className={`relative z-50 w-full max-w-xl rounded-xl shadow-xl border p-6 ${theme === "dark"
          ? "bg-slate-900 border-slate-700 text-white"
          : "bg-white border-slate-200 text-black"
          }`}
      >

        <h2 className="text-lg font-bold mb-4">
          {mode === "ask" && "Ask Question"}
          {mode === "analyze" && "Analyze Vulnerability"}
          {mode === "broadcast" && "Broadcast Intelligence"}
        </h2>

        <input
          type="text"
          placeholder="Question Title (e.g. How to analyze Emotet?)"
          className={`w-full p-3 rounded mb-4 focus:ring-2 focus:ring-blue-500 outline-none ${theme === "dark" ? "bg-slate-800 text-white" : "bg-gray-100 text-black"
            }`}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <textarea
          placeholder="State your security inquiry in detail..."
          className={`w-full p-3 rounded mb-4 focus:ring-2 focus:ring-blue-500 outline-none ${theme === "dark" ? "bg-slate-800 text-white" : "bg-gray-100 text-black"
            }`}
          rows={5}
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />

        <div className="flex justify-end gap-3">

          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-500 rounded"
          >
            Cancel
          </button>

          <button
            onClick={handleSubmit}
            disabled={!title.trim() || isGeneratingImage}
            className={`px-6 py-2 bg-blue-600 text-white rounded-full font-semibold transition-all ${(!title.trim() || isGeneratingImage) ? "opacity-50 cursor-not-allowed" : "hover:bg-blue-700"
              }`}
          >
            {isGeneratingImage ? "Posting..." : "Post"}
          </button>

        </div>

      </div>

    </div>
  );
};

export default CreateQuestionModal;