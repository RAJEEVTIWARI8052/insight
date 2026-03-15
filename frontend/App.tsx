import React, { useState, useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import FollowingPage from "./pages/FollowingPage";
import SpacePage from "./pages/SpacePage";
import StudentDashboard from "./pages/StudentDashboard";
import ExpertDashboard from "./pages/ExpertDashboard";
import QuestionDetail from "./components/QuestionDetail";
import { SignIn, SignUp, SignedIn, SignedOut, useUser, useAuth } from "@clerk/clerk-react";
import CreateQuestionModal from "./components/CreateQuestionModal";

import { Question, User as LocalUser } from "./types";
import { initialQuestions } from "./data/mockData";
import NotificationsPage from "./pages/NotificationPage";
import SpacesPage from "./pages/SpacePage";
import ExpertDirectory from "./pages/ExpertDirectory";
import Navbar from "./components/Navbar";
import RoleTransitionModal from "./components/RoleTransitionModal";
import NeuralCursor from "./components/NeuralCursor";
import axios from "axios";

const STORAGE_KEY = "codevirus_data";
const THEME_KEY = "codevirus_theme";

const App: React.FC = () => {
  const { user: clerkUser, isLoaded } = useUser();
  const { getToken } = useAuth();

  const [theme, setTheme] = useState<"light" | "dark">(() => {
    const savedTheme = localStorage.getItem(THEME_KEY);
    return (savedTheme as "light" | "dark") || "dark";
  });

  const [questions, setQuestions] = useState<Question[]>([]);
  const [localUserProfile, setLocalUserProfile] = useState<LocalUser | null>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [postMode, setPostMode] = useState<"ask" | "analyze" | "broadcast">("ask");
  const [unreadCount, setUnreadCount] = useState(0);
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);

  const openModal = (mode: "ask" | "analyze" | "broadcast" = "ask") => {
    setPostMode(mode);
    setIsModalOpen(true);
  };

  const currentUser: LocalUser | null = clerkUser ? {
    id: clerkUser.id,
    name: clerkUser.username || clerkUser.firstName || "User",
    avatar: clerkUser.imageUrl,
    role: localUserProfile?.role || 'user'
  } : null;

  useEffect(() => {
    console.log("Current Application User:", currentUser);
  }, [currentUser]);

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
    const fetchProfile = async () => {
      if (clerkUser) {
        try {
          const token = await getToken();
          const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/auth/me`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          setLocalUserProfile({
            id: response.data._id,
            name: response.data.name || clerkUser.firstName || "User",
            avatar: clerkUser.imageUrl,
            role: response.data.role
          });
        } catch (error) {
          console.error("Failed to fetch local profile:", error);
        }
      } else {
        setLocalUserProfile(null);
      }
    };
    fetchProfile();
  }, [clerkUser, getToken]);

  useEffect(() => {
    const fetchUnreadCount = async () => {
      if (clerkUser) {
        try {
          const token = await getToken();
          const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/notifications/unread-count`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          setUnreadCount(response.data.count);
        } catch (error) {
          console.error("Failed to fetch unread count:", error);
        }
      } else {
        setUnreadCount(0);
      }
    };
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 30000); // Poll every 30s
    return () => clearInterval(interval);
  }, [clerkUser, getToken]);

  useEffect(() => {
    localStorage.setItem(THEME_KEY, theme);
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  const handleToggleRoleClick = () => {
    if (currentUser?.role === 'user') {
      setIsRoleModalOpen(true);
    } else {
      if (window.confirm('Are you sure you want to deactivate your Expert status and become a standard User again?')) {
        submitRoleToggle(0); // Switching back to user doesn't need experience config
      }
    }
  };

  const submitRoleToggle = async (experience: number, expertise: string[] = []) => {
    try {
      const token = await getToken();
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/toggle-role`, { experience, expertise }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setLocalUserProfile(prev => {
        if (!prev) return {
          id: response.data._id,
          name: clerkUser?.username || "User",
          avatar: clerkUser?.imageUrl || "",
          role: response.data.role
        };
        return { ...prev, role: response.data.role };
      });
      setIsRoleModalOpen(false);
      alert(`Success! Your role is now: ${response.data.role.toUpperCase()}`);
    } catch (e: any) {
      console.error("Failed to toggle role", e);
      alert(e.response?.data?.message || "Failed to switch role. Please check your connection.");
    }
  };

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
      className={`app-container ${theme} min-h-screen transition-colors duration-500 font-inter ${theme === 'dark' ? 'bg-[#0B0F19] text-slate-200' : 'bg-slate-50 text-slate-900'
        }`}>
      <NeuralCursor theme={theme} />
      <Navbar
        onOpenModal={() => openModal("ask")}
        onSearch={setSearchQuery}
        theme={theme}
        onToggleTheme={() => setTheme(theme === 'light' ? 'dark' : 'light')}
        onToggleRole={handleToggleRoleClick}
        userRole={currentUser?.role}
        notificationsCount={unreadCount}
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
        <Route
          path="/notifications"
          element={
            <NotificationsPage
              questions={questions}
              theme={theme}
              onSearchChange={setSearchQuery}
              onMarkRead={() => setUnreadCount(0)}
            />
          }
        />

        <Route
          path="/experts"
          element={
            <ExpertDirectory theme={theme} />
          }
        />
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
            currentUser?.role === "expert" ? (
              <ExpertDashboard
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
                onUpdate={handleUpdateQuestion}
              />
            ) : (
              <StudentDashboard
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
                onUpdate={handleUpdateQuestion}
              />
            )
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
      {isRoleModalOpen && (
        <RoleTransitionModal
          onClose={() => setIsRoleModalOpen(false)}
          onSubmit={submitRoleToggle}
          theme={theme}
        />
      )}
    </div>
  );
};

export default App;