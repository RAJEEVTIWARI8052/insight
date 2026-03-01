import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Feed from './components/Feed';
import QuestionDetail from './components/QuestionDetail';
import CreateQuestionModal from './components/CreateQuestionModal';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import { Question, User } from './types';
import { initialQuestions } from './data/mockData';

const STORAGE_KEY = 'codevirus_data';
const USER_KEY = 'codevirus_user';
const THEME_KEY = 'codevirus_theme';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(() => {
    const savedUser = localStorage.getItem(USER_KEY);
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const savedTheme = localStorage.getItem(THEME_KEY);
    return (savedTheme as 'light' | 'dark') || 'dark';
  });

  const [questions, setQuestions] = useState<Question[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : initialQuestions;
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(questions));
  }, [questions]);

  useEffect(() => {
    localStorage.setItem(THEME_KEY, theme);
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  const handleAddQuestion = (newQuestion: Question) => {
    setQuestions(prev => [newQuestion, ...prev]);
    setIsModalOpen(false);
    navigate('/');
  };

  const handleUpdateQuestion = (updatedQuestion: Question) => {
    setQuestions(prev => prev.map(q => q.id === updatedQuestion.id ? updatedQuestion : q));
  };

  const handleLogin = (newUser: User) => {
    setUser(newUser);
    localStorage.setItem(USER_KEY, JSON.stringify(newUser));
  };
  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem('token');
    navigate('/login');
  };



  const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light');

  const filteredQuestions = questions.filter(q =>
    q.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    q.topic.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className={`min-h-screen transition-colors duration-300 ${theme === 'dark' ? 'bg-slate-950 text-slate-200' : 'bg-slate-50 text-slate-900'}`}>
      <Routes>
        <Route
          path="/login"
          element={<LoginPage onLogin={handleLogin} theme={theme} />}
        />
        <Route
          path="/register"
          element={<RegisterPage onLogin={handleLogin} theme={theme} />}
        />
        <Route
          path="/"
          element={
            <>
              <Navbar
                onOpenModal={() => setIsModalOpen(true)}
                onSearch={setSearchQuery}
                currentUser={user}
                theme={theme}
                onToggleTheme={toggleTheme}
                onLogout={handleLogout}

              />

              <main className="max-w-6xl mx-auto pt-20 px-4 flex gap-6">
                <div className="hidden md:block w-48 shrink-0">
                  <Sidebar theme={theme} />
                </div>

                <div className="flex-1 max-w-2xl">
                  <Feed questions={filteredQuestions} theme={theme} />
                </div>

                <div className="hidden lg:block w-72 shrink-0">
                  <div className={`rounded-lg p-4 border sticky top-24 shadow-sm transition-colors ${theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
                    <h3 className={`font-bold mb-4 border-b pb-2 ${theme === 'dark' ? 'text-blue-400 border-slate-800' : 'text-slate-700 border-slate-100'}`}>Security Sectors</h3>
                    <div className="space-y-4">
                      <div className="flex items-center gap-3 cursor-pointer p-2 rounded transition-colors hover:bg-blue-500/10 group">
                        <img src="https://picsum.photos/seed/sec1/40/40" className="w-8 h-8 rounded-lg" alt="space" />
                        <span className="text-sm font-medium">Rootkit Research</span>
                      </div>
                      <div className="flex items-center gap-3 cursor-pointer p-2 rounded transition-colors hover:bg-blue-500/10 group">
                        <img src="https://picsum.photos/seed/sec2/40/40" className="w-8 h-8 rounded-lg" alt="space" />
                        <span className="text-sm font-medium">Zero-Day Intelligence</span>
                      </div>
                    </div>
                  </div>
                </div>
              </main>

              {isModalOpen && user && (
                <CreateQuestionModal
                  onClose={() => setIsModalOpen(false)}
                  onSubmit={handleAddQuestion}
                  user={user}
                  theme={theme}
                />
              )}
            </>
          }
        />
        <Route path="/question/:id" element={
          <QuestionDetail
            questions={questions}
            onUpdate={handleUpdateQuestion}
            currentUser={user}
            theme={theme}
          />
        } />
      </Routes>
    </div>
  );
};

export default App;