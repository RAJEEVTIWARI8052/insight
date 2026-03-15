import React from "react";
import { Question, User } from "../types";
import QuestionCard from "./QuestionCard";

interface FeedProps {
  questions: Question[];
  theme: "light" | "dark";
  onOpenModal: (mode: "ask" | "analyze" | "broadcast") => void;
  user: User | null;
  onDelete: (id: string) => void;
  onUpdate: (q: Question) => void;
}

const Feed: React.FC<FeedProps> = ({ questions = [], theme, onOpenModal, user, onDelete, onUpdate }) => {

  const handleAsk = () => onOpenModal("ask");
  const handleAnalyze = () => onOpenModal("analyze");
  const handleBroadcast = () => onOpenModal("broadcast");

  return (
    <div className="flex flex-col gap-4 mb-8 w-full">

      {/* Grid of Readouts */}
      <div className="grid grid-cols-1 gap-4">
        {questions.map((question) => (
          <QuestionCard
            key={question._id || question.id}
            question={question}
            theme={theme}
            currentUser={user}
            onDelete={onDelete}
            onUpdate={onUpdate}
          />
        ))}
      </div>

      {/* Empty State */}
      {questions.length === 0 && (
        <div
          className={`p-16 text-center rounded-sm border flex flex-col items-center justify-center ${theme === "dark"
            ? "bg-slate-950 border-dashed border-cyan-900/50"
            : "bg-slate-50 border-dashed border-slate-300"
            }`}
        >
          <div className="relative mb-6">
            <i className={`fa-solid fa-radar text-5xl opacity-20 ${theme === 'dark' ? 'text-cyan-500' : 'text-slate-400'}`}></i>
            <div className={`absolute inset-0 rounded-full border border-current animate-ping opacity-20 ${theme === 'dark' ? 'text-cyan-500' : 'text-slate-400'}`}></div>
          </div>
          <p className={`font-mono text-xs tracking-widest uppercase ${theme === 'dark' ? 'text-cyan-600' : 'text-slate-500'}`}>
            [ NO SECTOR DATA FOUND ]
          </p>
        </div>
      )}

    </div>
  );
};

export default Feed;