import React, { useState, useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import FollowingPage from "./pages/FollowingPage";
import SpacePage from "./pages/SpacePage";
import Homepage from "./pages/Homepage";
import QuestionDetail from "./components/QuestionDetail";
import { SignIn, SignUp, SignedIn, SignedOut, useUser } from "@clerk/clerk-react";
import CreateQuestionModal from "./components/CreateQuestionModal";

import { Question, User as LocalUser } from "./types";
import { initialQuestions } from "./data/mockData";
import NotificationsPage from "./pages/NotificationPage";
import SpacesPage from "./pages/SpacePage";
import Navbar from "./components/Navbar";
import axios from "axios";

const STORAGE_KEY = "codevirus_data";
const THEME_KEY = "codevirus_theme";

const App: React.FC = () => {
  const { user: clerkUser, isLoaded } = useUser();

  const [theme, setTheme] = useState<"light" | "dark">(() => {
    const savedTheme = localStorage.getItem(THEME_KEY);
    return (savedTheme as "light" | "dark") || "dark";
  });

  const [questions, setQuestions] = useState<Question[]>([]);

  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [postMode, setPostMode] = useState<"ask" | "analyze" | "broadcast">("ask");

  const openModal = (mode: "ask" | "analyze" | "broadcast" = "ask") => {
    setPostMode(mode);
    setIsModalOpen(true);
  };

  const currentUser: LocalUser | null = clerkUser ? {
    id: clerkUser.id,
    name: clerkUser.username || clerkUser.firstName || "User",
    avatar: clerkUser.imageUrl
  } : null;

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/questions`);
        setQuestions(response.data);
      } catch (error) {
        console.error("Failed to fetch questions:", error);
      }
    };
    fetchQuestions();
  }, []);

  useEffect(() => {
    localStorage.setItem(THEME_KEY, theme);
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  const handleAddQuestion = (newQuestion: Question) => {
    setQuestions((prev) => [newQuestion, ...prev]);
  };

  const handleUpdateQuestion = (updatedQuestion: Question) => {
    setQuestions((prev) =>
      prev.map((q) => (q.id === updatedQuestion.id || q._id === updatedQuestion._id ? updatedQuestion : q))
    );
  };

  const handleDeleteQuestion = (id: string) => {
    setQuestions((prev) => prev.filter((q) => q.id !== id && q._id !== id));
  };

  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  const filteredQuestions = questions.filter(
    (q) =>
      q.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.topic.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div
      className={`min-h-screen transition-colors duration-300 ${theme === "dark"
        ? "bg-slate-950 text-slate-200"
        : "bg-slate-50 text-slate-900"
        }`}
    >
      <Navbar
        onOpenModal={() => openModal("ask")}
        onSearch={setSearchQuery}
        theme={theme}
        onToggleTheme={toggleTheme}
      />

      <Routes>
        <Route
          path="/following"
          element={
            <FollowingPage
              theme={theme}
              onSearchChange={setSearchQuery}
            />
          }
        />
        <Route path="/spaces" element={<SpacesPage questions={questions} theme={theme} />} />
        <Route path="/notifications" element={<NotificationsPage questions={questions} theme={theme} />} />

        <Route
          path="/login"
          element={
            <div className="flex items-center justify-center min-h-[calc(100vh-64px)]">
              <SignIn routing="path" path="/login" signUpUrl="/register" />
            </div>
          }
        />

        <Route
          path="/register"
          element={
            <div className="flex items-center justify-center min-h-[calc(100vh-64px)]">
              <SignUp routing="path" path="/register" signInUrl="/login" />
            </div>
          }
        />

        <Route
          path="/"
          element={
            <Homepage
              user={currentUser}
              theme={theme}
              questions={filteredQuestions}
              onLogout={() => { }}
              onAddQuestion={handleAddQuestion}
              onThemeToggle={toggleTheme}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              onOpenModal={openModal}
              onDelete={handleDeleteQuestion}
            />
          }
        />

        <Route
          path="/question/:id"
          element={
            <QuestionDetail
              questions={questions}
              onUpdate={handleUpdateQuestion}
              currentUser={currentUser}
              theme={theme}
            />
          }
        />

      </Routes>

      {isModalOpen && (
        <CreateQuestionModal
          mode={postMode}
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleAddQuestion}
          user={currentUser || { id: "guest", name: "Guest", avatar: "" } as any}
          theme={theme}
        />
      )}
    </div>
  );
};

export default App;