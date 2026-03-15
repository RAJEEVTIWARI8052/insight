import React, { useState } from "react";
import { createPortal } from "react-dom";

interface Props {
  onClose: () => void;
  onSubmit: (experience: number, expertise: string[]) => void;
  theme: "light" | "dark";
}

const RoleTransitionModal: React.FC<Props> = ({ onClose, onSubmit, theme }) => {
  const [experience, setExperience] = useState("");
  const [expertiseStr, setExpertiseStr] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const expNum = Number(experience);
    if (isNaN(expNum) || expNum < 0) {
      setError("Please enter a valid number of years.");
      return;
    }
    if (expNum < 4) {
      setError("A minimum of 4 years of experience is required to become an expert.");
      return;
    }
    const expertiseArray = expertiseStr.split(',').map(s => s.trim()).filter(Boolean);
    if (expertiseArray.length === 0) {
      setError("Please specify at least one area of expertise.");
      return;
    }
    onSubmit(expNum, expertiseArray);
  };

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-md" onClick={onClose} />
      <div className={`relative z-10 w-full max-w-md rounded-3xl p-8 border shadow-2xl ${theme === "dark" ? "bg-slate-900 border-slate-800 text-white" : "bg-white border-slate-200 text-slate-900"}`}>
        <h2 className="text-2xl font-black mb-2">Become an Expert</h2>
        <p className={`text-sm mb-6 ${theme === "dark" ? "text-slate-400" : "text-slate-500"}`}>
          Experts represent verified professionals with significant field experience. We require at least 4 years of experience to qualify.
        </p>

        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label className={`block text-xs font-bold uppercase tracking-widest mb-2 ${theme === "dark" ? "text-slate-400" : "text-slate-500"}`}>
              Years of Experience
            </label>
            <input
              type="number"
              value={experience}
              onChange={(e) => {
                setExperience(e.target.value);
                setError("");
              }}
              className={`w-full p-4 rounded-xl border text-lg font-bold focus:outline-none focus:ring-4 focus:ring-blue-500/20 transition-all ${theme === "dark" ? "bg-slate-950/50 border-slate-700 text-white" : "bg-slate-50 border-slate-200 text-slate-900"}`}
              placeholder="e.g. 5"
              autoFocus
            />
          </div>

          <div className="mb-6">
            <label className={`block text-xs font-bold uppercase tracking-widest mb-2 ${theme === "dark" ? "text-slate-400" : "text-slate-500"}`}>
              Areas of Expertise
            </label>
            <input
              type="text"
              value={expertiseStr}
              onChange={(e) => {
                setExpertiseStr(e.target.value);
                setError("");
              }}
              className={`w-full p-4 rounded-xl border font-medium focus:outline-none focus:ring-4 focus:ring-blue-500/20 transition-all ${theme === "dark" ? "bg-slate-950/50 border-slate-700 text-white" : "bg-slate-50 border-slate-200 text-slate-900"}`}
              placeholder="e.g. Threat Hunting, Cryptography, React"
            />
            {error && <p className="text-red-500 text-sm mt-3 font-bold">{error}</p>}
          </div>

          <div className="flex gap-4">
            <button
              type="button"
              onClick={onClose}
              className={`flex-1 py-3 rounded-xl font-bold transition-all ${theme === "dark" ? "bg-slate-800 hover:bg-slate-700 text-white" : "bg-slate-100 hover:bg-slate-200 text-slate-900"}`}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-all"
            >
              Confirm
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};

export default RoleTransitionModal;
