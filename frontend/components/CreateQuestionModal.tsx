import React, { useState } from "react";
import { createPortal } from "react-dom";
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

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 overflow-hidden">

      {/* Background overlay */}
      <div
        className="absolute inset-0 bg-slate-950/60 backdrop-blur-md animate-fade-in"
        onClick={onClose}
      />

      {/* Modal panel */}
      <div
        className={`relative z-[10000] w-full max-w-xl rounded-[2.5rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)] border animate-scale-in p-8 ${theme === "dark"
          ? "bg-slate-900 border-slate-700/50 text-white"
          : "bg-white border-slate-200 text-black"
          }`}
      >
        {/* Accent Line */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-500 via-indigo-500 to-violet-500"></div>

        {duplicateData ? (
          <div className="animate-fade-in">
            <div className={`p-6 rounded-3xl border-l-[6px] mb-8 relative overflow-hidden group/dupe ${theme === 'dark' ? 'bg-emerald-950/20 border-emerald-500' : 'bg-emerald-50 border-emerald-500'}`}>
              <div className="absolute top-0 right-0 p-4 opacity-5 group-hover/dupe:opacity-10 transition-opacity">
                <i className="fa-solid fa-clone text-6xl text-emerald-500"></i>
              </div>

              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center shadow-xl shadow-emerald-500/30">
                  <i className="fa-solid fa-robot text-sm text-white"></i>
                </div>
                <div>
                  <h3 className="text-xs font-black uppercase tracking-[0.2em] text-emerald-600 dark:text-emerald-400">
                    Similarity Detected
                  </h3>
                  <p className="text-[10px] font-bold text-emerald-500/60 uppercase tracking-widest leading-none mt-1">Found in Security Database</p>
                </div>
              </div>

              <p className={`text-sm mb-5 font-bold leading-relaxed ${theme === 'dark' ? 'text-slate-200' : 'text-slate-700'}`}>
                A technical expert has already addressed this inquiry. Here is the verified solution:
              </p>

              <div className={`p-5 rounded-[1.5rem] text-sm leading-relaxed border font-medium relative z-10 ${theme === 'dark' ? 'bg-slate-950/50 border-slate-800 text-slate-300' : 'bg-white border-slate-200 text-slate-600'}`}>
                {duplicateData.suggestedResponse}
              </div>
            </div>

            <div className="flex flex-col gap-3 font-black">
              <button
                onClick={onClose}
                className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-[1.5rem] transition-all shadow-xl shadow-emerald-500/20 text-sm uppercase tracking-widest"
              >
                Accept Resolution & Exit
              </button>
              <button
                onClick={() => handleSubmit(true)}
                className={`w-full py-4 rounded-[1.5rem] transition-all border text-sm uppercase tracking-widest ${theme === 'dark' ? 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700 hover:text-white' : 'bg-slate-100 border-slate-200 text-slate-500 hover:bg-slate-200'
                  }`}
              >
                Not Quite, Post My Inquiry
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-500 border border-blue-500/20">
                  <i className={`fa-solid ${mode === 'ask' ? 'fa-shield-halved' : mode === 'analyze' ? 'fa-code-merge' : 'fa-bolt'} text-xl`}></i>
                </div>
                <div>
                  <h2 className={`text-2xl font-black font-outfit leading-none mb-1 ${theme === "dark" ? "text-white" : "text-slate-900"}`}>
                    {mode === "ask" && "Launch Inquiry"}
                    {mode === "analyze" && "Analyze Threat"}
                    {mode === "broadcast" && "Broadcast Intel"}
                  </h2>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-500/80">Cyber Intelligence Network</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className={`w-10 h-10 flex items-center justify-center rounded-2xl transition-all ${theme === 'dark' ? 'hover:bg-slate-800 text-slate-500' : 'hover:bg-slate-100 text-slate-400'
                  }`}
              >
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>

            <div className="space-y-6">
              <div>
                <label className={`text-[10px] font-black uppercase tracking-[0.2em] mb-2 px-1 block ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>
                  Inquiry Title
                </label>
                <input
                  type="text"
                  placeholder="e.g. Lateral movement detected in VLAN 4"
                  className={`w-full p-4 rounded-[1.5rem] border text-sm font-bold focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all ${theme === "dark" ? "bg-slate-950/80 border-slate-700 text-white placeholder-slate-800" : "bg-slate-50 border-slate-200 text-slate-900"
                    }`}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  autoFocus
                />
              </div>

              <div>
                <label className={`text-[10px] font-black uppercase tracking-[0.2em] mb-2 px-1 block ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>
                  Intelligence Data
                </label>
                <textarea
                  placeholder="Paste logs, signatures, or specific symptoms..."
                  className={`w-full p-4 rounded-[1.5rem] border text-sm focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all min-h-[160px] leading-relaxed ${theme === "dark" ? "bg-slate-950/80 border-slate-700 text-white placeholder-slate-800" : "bg-slate-50 border-slate-200 text-slate-900"
                    }`}
                  rows={5}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                />
              </div>

              <div className="flex items-center justify-between pt-4">
                <button
                  onClick={onClose}
                  className={`px-6 py-2.5 font-black text-xs uppercase tracking-widest transition-colors ${theme === 'dark' ? 'text-slate-500 hover:text-white' : 'text-slate-400 hover:text-slate-900'}`}
                >
                  Cancel
                </button>

                <button
                  onClick={() => handleSubmit(false)}
                  disabled={!title.trim() || isGeneratingImage}
                  className={`px-8 py-3.5 bg-gradient-to-br from-blue-600 to-indigo-700 hover:from-blue-500 hover:to-indigo-600 text-white rounded-[1.5rem] font-black text-xs uppercase tracking-[0.2em] transition-all shadow-2xl shadow-blue-500/30 transform hover:-translate-y-1 active:scale-[0.98] ${(!title.trim() || isGeneratingImage) ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                >
                  <div className="flex items-center gap-2">
                    {isGeneratingImage ? <i className="fa-solid fa-spinner fa-spin"></i> : <i className="fa-solid fa-paper-plane"></i>}
                    {isGeneratingImage ? "Broadcasting..." : "Broadcast Inquiry"}
                  </div>
                </button>
              </div>
            </div>
          </>
        )}

      </div>

      <style>{`
                @keyframes fade-in {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                @keyframes scale-in {
                    from { opacity: 0; transform: scale(0.95) translateY(10px); }
                    to { opacity: 1; transform: scale(1) translateY(0); }
                }
                .animate-fade-in { animation: fade-in 0.3s ease-out forwards; }
                .animate-scale-in { animation: scale-in 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards; }
            `}</style>

    </div>,
    document.body
  );
};

export default CreateQuestionModal;