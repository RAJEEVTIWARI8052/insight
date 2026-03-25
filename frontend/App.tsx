import React, { useState, useEffect } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import FollowingPage from "./pages/FollowingPage";
import SpacePage from "./pages/SpacePage";
import StudentDashboard from "./pages/StudentDashboard";
import ExpertDashboard from "./pages/ExpertDashboard";
import QuestionDetail from "./components/QuestionDetail";
import CreateQuestionModal from "./components/CreateQuestionModal";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";

import { Question, User as LocalUser } from "./types";
import { initialQuestions } from "./data/mockData";
import NotificationsPage from "./pages/NotificationPage";
import SpacesPage from "./pages/SpacePage";
import ExpertDirectory from "./pages/ExpertDirectory";
import Navbar from "./components/Navbar";
import RoleTransitionModal from "./components/RoleTransitionModal";
import NeuralCursor from "./components/NeuralCursor";
import axios from "axios";

const THEME_KEY = "codevirus_theme";
const TOKEN_KEY = "insight_token";
const USER_KEY = "insight_user";

const getStoredToken = () => localStorage.getItem(TOKEN_KEY);
const getStoredUser = (): LocalUser | null => {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
};

const App: React.FC = () => {
  const [theme, setTheme] = useState<"light" | "dark">(() => {
    const savedTheme = localStorage.getItem(THEME_KEY);
    return (savedTheme as "light" | "dark") || "dark";
  });

  const [currentUser, setCurrentUser] = useState<LocalUser | null>(getStoredUser);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [postMode, setPostMode] = useState<"ask" | "analyze" | "broadcast">("ask");
  const [unreadCount, setUnreadCount] = useState(0);
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);

  const openModal = (mode: "ask" | "analyze" | "broadcast" = "ask") => {
    setPostMode(mode);
    setIsModalOpen(true);
  };

  // Persist user to localStorage whenever it changes
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(USER_KEY, JSON.stringify(currentUser));
    } else {
      localStorage.removeItem(USER_KEY);
      localStorage.removeItem(TOKEN_KEY);
    }
  }, [currentUser]);

  // Fetch questions (public)
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

  // Fetch profile & role from backend when logged in
  useEffect(() => {
    const fetchProfile = async () => {
      const token = getStoredToken();
      if (!token || !currentUser) return;
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/auth/me`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setCurrentUser(prev => prev ? { ...prev, role: response.data.role } : null);
      } catch (error) {
        console.error("Failed to fetch profile:", error);
      }
    };
    fetchProfile();
  }, [currentUser?.id]);

  // Poll unread notifications
  useEffect(() => {
    const fetchUnreadCount = async () => {
      const token = getStoredToken();
      if (!token || !currentUser) { setUnreadCount(0); return; }
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/notifications/unread-count`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUnreadCount(response.data.count);
      } catch (error) {
        console.error("Failed to fetch unread count:", error);
      }
    };
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem(THEME_KEY, theme);
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  const handleLogin = (token: string, user: LocalUser) => {
    localStorage.setItem(TOKEN_KEY, token);
    setCurrentUser(user);
  };

  const handleLogout = () => {
    setCurrentUser(null);
  };

  const handleToggleRoleClick = () => {
    if (currentUser?.role === 'user') {
      setIsRoleModalOpen(true);
    } else {
      if (window.confirm('Are you sure you want to deactivate your Expert status?')) {
        submitRoleToggle(0);
      }
    }
  };

  const submitRoleToggle = async (experience: number, expertise: string[] = []) => {
    const token = getStoredToken();
    try {
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/toggle-role`, { experience, expertise }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCurrentUser(prev => prev ? { ...prev, role: response.data.role } : null);
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

  const filteredQuestions = questions.filter((q) => {
    if (!searchQuery.trim()) return true;
    const sq = searchQuery.toLowerCase();
    return (
      q.title?.toLowerCase().includes(sq) ||
      q.topic?.toLowerCase().includes(sq) ||
      q.content?.toLowerCase().includes(sq) ||
      q.category?.toLowerCase().includes(sq)
    );
  });

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
        currentUser={currentUser}
        onLogout={handleLogout}
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
            <ExpertDirectory theme={theme} currentUser={currentUser} />
          }
        />
        <Route
          path="/login"
          element={
            <div className="flex items-center justify-center min-h-[calc(100vh-64px)]">
              <LoginPage theme={theme} onLogin={handleLogin} />
            </div>
          }
        />

        <Route
          path="/register"
          element={
            <div className="flex items-center justify-center min-h-[calc(100vh-64px)]">
              <RegisterPage theme={theme} onLogin={handleLogin} />
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
                onLogout={handleLogout}
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
                onLogout={handleLogout}
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