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
  const [duplicateData, setDuplicateData] = useState<{ suggestedResponse: string; existingQuestion: Question } | null>(null);
  const { getToken } = useAuth();

  const handleSubmit = async (bypass: boolean = false) => {

    if (!title.trim()) return;

    try {

      setIsGeneratingImage(true);

      const token = await getToken();

      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/questions`,
        {
          title,
          content,
          topic,
          bypassDeduplication: bypass
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (response.data.existingQuestion) {
        setDuplicateData({
          suggestedResponse: response.data.suggestedResponse,
          existingQuestion: response.data.existingQuestion
        });
      } else {
        onSubmit(response.data);
        onClose();
      }

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

        {duplicateData ? (
          <div className="animate-fade-in">
            <div className={`p-4 rounded-xl border-l-4 mb-6 ${theme === 'dark' ? 'bg-emerald-950/20 border-emerald-500' : 'bg-emerald-50 border-emerald-500'}`}>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                  <i className="fa-solid fa-robot text-xs text-white"></i>
                </div>
                <h3 className="text-sm font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
                  Similarity Detected
                </h3>
              </div>
              <p className={`text-sm mb-4 font-medium ${theme === 'dark' ? 'text-slate-200' : 'text-slate-800'}`}>
                A similar issue has already been resolved by an expert. Here is the definitive solution:
              </p>
              <div className={`p-4 rounded-xl text-sm leading-relaxed border ${theme === 'dark' ? 'bg-slate-950 border-slate-800 text-slate-300' : 'bg-white border-slate-200 text-slate-700'}`}>
                {duplicateData.suggestedResponse}
              </div>
            </div>

            <div className="flex flex-col gap-3 font-bold">
              <button
                onClick={onClose}
                className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl transition-all shadow-xl shadow-emerald-500/20"
              >
                Accept Resolution & Close
              </button>
              <button
                onClick={() => handleSubmit(true)}
                className={`w-full py-3.5 rounded-2xl transition-all border ${theme === 'dark' ? 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700' : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100'
                  }`}
              >
                Not what I'm looking for, post anyway
              </button>
            </div>
          </div>
        ) : (
          <>
            <h2 className={`text-xl font-black font-outfit mb-6 ${theme === "dark" ? "text-white" : "text-slate-900"}`}>
              {mode === "ask" && "Launch Security Inquiry"}
              {mode === "analyze" && "Perform Vulnerability Analysis"}
              {mode === "broadcast" && "Broadcast Intelligence"}
            </h2>

            <div className="space-y-4">
              <div className="group">
                <label className={`text-[10px] font-black uppercase tracking-[0.2em] mb-2 block ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>
                  Issue Title
                </label>
                <input
                  type="text"
                  placeholder="e.g. Unusual lateral movement in Segment 4"
                  className={`w-full p-4 rounded-2xl border text-sm font-bold focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all ${theme === "dark" ? "bg-slate-950 border-slate-700 text-white placeholder-slate-700" : "bg-slate-50 border-slate-200 text-slate-900"
                    }`}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              <div className="group">
                <label className={`text-[10px] font-black uppercase tracking-[0.2em] mb-2 block ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>
                  Technical Details
                </label>
                <textarea
                  placeholder="Provide logs, traces, or specific symptoms..."
                  className={`w-full p-4 rounded-2xl border text-sm focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all min-h-[150px] ${theme === "dark" ? "bg-slate-950 border-slate-700 text-white placeholder-slate-700" : "bg-slate-50 border-slate-200 text-slate-900"
                    }`}
                  rows={5}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                />
              </div>

              <div className="flex items-center justify-between pt-4">
                <button
                  onClick={onClose}
                  className={`px-6 py-2.5 font-bold text-sm transition-colors ${theme === 'dark' ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-900'}`}
                >
                  Cancel
                </button>

                <button
                  onClick={() => handleSubmit(false)}
                  disabled={!title.trim() || isGeneratingImage}
                  className={`px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-2xl font-black text-sm transition-all shadow-xl shadow-blue-500/20 transform hover:-translate-y-0.5 active:translate-y-0 ${(!title.trim() || isGeneratingImage) ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                >
                  <div className="flex items-center gap-2">
                    {isGeneratingImage ? <i className="fa-solid fa-spinner fa-spin"></i> : <i className="fa-solid fa-bolt"></i>}
                    {isGeneratingImage ? "Analyzing..." : "Post Inquiry"}
                  </div>
                </button>
              </div>
            </div>
          </>
        )}

      </div>

    </div>
  );
};

export default CreateQuestionModal;