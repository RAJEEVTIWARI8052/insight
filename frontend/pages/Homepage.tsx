import React from "react";
import Sidebar from "../components/Sidebar";
import Feed from "../components/Feed";
import { Question, User } from "../types";

interface Props {
  user: User | null;
  theme: "light" | "dark";
  questions: Question[];
  onLogout: () => void;
  onAddQuestion: (q: Question) => void;
  onThemeToggle: () => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onOpenModal: (mode: "ask" | "analyze" | "broadcast") => void;
  onDelete: (id: string) => void;
  onUpdate: (q: Question) => void;
}

const Homepage: React.FC<Props> = ({
  user,
  theme,
  questions,
  onSearchChange,
  onOpenModal,
  onDelete,
  onUpdate
}) => {
  return (
    <main className="max-w-6xl mx-auto pt-20 px-4 flex gap-6">
      <div className="hidden md:block w-48 shrink-0">
        <Sidebar
          theme={theme}
          onTopicSelect={(topic) => onSearchChange(topic)}
        />
      </div>

      <div className="flex-1 max-w-2xl">
        <Feed
          questions={questions}
          theme={theme}
          onOpenModal={onOpenModal}
          user={user}
          onDelete={onDelete}
          onUpdate={onUpdate}
        />
      </div>

      <div className="hidden lg:block w-72 shrink-0">
        {/* Right panel */}
      </div>
    </main>
  );
};

export default Homepage;