import React from "react";
import { Question, User } from "../types";
import QuestionCard from "./QuestionCard";

interface FeedProps {
  questions: Question[];
  theme: "light" | "dark";
  onOpenModal: (mode: "ask" | "analyze" | "broadcast") => void;
  user: User | null;
  onDelete: (id: string) => void;
}

const Feed: React.FC<FeedProps> = ({ questions = [], theme, onOpenModal, user, onDelete }) => {

  const handleAsk = () => onOpenModal("ask");
  const handleAnalyze = () => onOpenModal("analyze");
  const handleBroadcast = () => onOpenModal("broadcast");

  return (
    <div className="flex flex-col gap-4 mb-8">

      {/* Create Post Box */}
      <div
        className={`rounded-lg p-4 border shadow-sm flex flex-col gap-3 transition-colors ${theme === "dark"
          ? "bg-slate-900 border-slate-800"
          : "bg-white border-slate-200"
          }`}
      >

        {/* Input Row */}
        <div className="flex gap-3">

          <img
            src="https://picsum.photos/seed/cyber-user/100/100"
            className="w-10 h-10 rounded-full"
            alt="avatar"
          />

          <input
            type="text"
            placeholder="Discovered a vulnerability? Document it here..."
            readOnly
            onClick={handleAsk}
            className={`flex-1 border rounded-full px-4 text-sm cursor-pointer transition-colors ${theme === "dark"
              ? "bg-slate-800 border-slate-700 hover:bg-slate-700 text-slate-300"
              : "bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-600"
              }`}
          />

        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between text-sm font-medium px-4 text-slate-500">

          <button
            onClick={handleAsk}
            className="flex items-center gap-2 hover:text-blue-500 transition-colors"
          >
            <i className="fa-solid fa-shield-halved"></i>
            Ask
          </button>

          <div className="h-4 w-px bg-slate-200 dark:bg-slate-700"></div>

          <button
            onClick={handleAnalyze}
            className="flex items-center gap-2 hover:text-blue-500 transition-colors"
          >
            <i className="fa-solid fa-code-merge"></i>
            Analyze
          </button>

          <div className="h-4 w-px bg-slate-200 dark:bg-slate-700"></div>

          <button
            onClick={handleBroadcast}
            className="flex items-center gap-2 hover:text-blue-500 transition-colors"
          >
            <i className="fa-solid fa-bolt"></i>
            Broadcast
          </button>

        </div>
      </div>

      {/* Questions */}
      {questions.map((question) => (
        <QuestionCard
          key={question._id || question.id}
          question={question}
          theme={theme}
          currentUser={user}
          onDelete={onDelete}
        />
      ))}

      {/* Empty State */}
      {questions.length === 0 && (
        <div
          className={`p-12 text-center rounded-lg border ${theme === "dark"
            ? "bg-slate-900 border-slate-800"
            : "bg-white border-slate-200"
            }`}
        >
          <i className="fa-solid fa-radar text-4xl text-slate-300 mb-4"></i>

          <p className="text-slate-500">
            No active logs matching your criteria.
          </p>

        </div>
      )}

    </div>
  );
};

export default Feed;