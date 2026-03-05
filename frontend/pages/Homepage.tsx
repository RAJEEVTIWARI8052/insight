import React, { useState } from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import Feed from "../components/Feed";
import CreateQuestionModal from "../components/CreateQuestionModal";
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
}

const Homepage: React.FC<Props> = ({
  user,
  theme,
  questions,
  onLogout,
  onAddQuestion,
  onThemeToggle,
  searchQuery,
  onSearchChange
}) => {

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [postMode, setPostMode] = useState<"ask" | "analyze" | "broadcast">("ask");

  // TEST USER so modal always shows
  const testUser: User = user ?? {
  _id: "test-user",
  username: "tester",
  avatar: "https://i.pravatar.cc/40",
  email: "test@test.com"
} as unknown as User;
  const openModal = (mode: "ask" | "analyze" | "broadcast") => {
    setPostMode(mode);
    setIsModalOpen(true);
  };

  return (
    <>

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
            onOpenModal={openModal}
          />
        </div>

        <div className="hidden lg:block w-72 shrink-0">
          {/* Right panel */}
        </div>

      </main>

      {isModalOpen && (
        <CreateQuestionModal
          mode={postMode}
          onClose={() => setIsModalOpen(false)}
          onSubmit={onAddQuestion}
          user={testUser}
          theme={theme}
        />
      )}
    </>
  );
};

export default Homepage;