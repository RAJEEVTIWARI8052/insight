import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import Feed from '../components/Feed';
import QuestionDetail from '../components/QuestionDetail';
import CreateQuestionModal from '../components/CreateQuestionModal';
import LoginPage from '../pages/LoginPage';
import RegisterPage from '../pages/RegisterPage';
import { Question, User } from '../types';
import { initialQuestions } from '../data/mockData';

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
                <Route path="/login" element={<LoginPage onLogin={handleLogin} theme={theme} />} />
                <Route path="/register" element={<RegisterPage onLogin={handleLogin} theme={theme} />} />
                <Route
                    path="/"
                    element={
                        <div className="flex">
                            <div className="hidden md:block w-48 shrink-0">
                                <Sidebar theme={theme} />
                            </div>
                            <div className="flex-1 flex flex-col">
                                <Navbar
                                    onOpenModal={() => setIsModalOpen(true)}
                                    onSearch={setSearchQuery}
                                    currentUser={user}
                                    theme={theme}
                                    onToggleTheme={toggleTheme}
                                    onLogout={handleLogout}
                                />
                                <main className="flex-1 max-w-6xl mx-auto w-full pt-4 px-4">
                                    <div className="flex gap-6">
                                        <div className="flex-1 max-w-2xl">
                                            <Feed questions={filteredQuestions} theme={theme} />
                                        </div>
                                        <div className="hidden lg:block w-72 shrink-0">
                                            {/* Right sidebar content */}
                                        </div>
                                    </div>
                                </main>
                            </div>
                            {isModalOpen && user && (
                                <CreateQuestionModal onClose={() => setIsModalOpen(false)} onSubmit={handleAddQuestion} user={user} theme={theme} />
                            )}
                        </div>
                    }
                />
                <Route path="/question/:id" element={<QuestionDetail questions={questions} onUpdate={handleUpdateQuestion} currentUser={user} theme={theme} />} />
            </Routes>
        </div>
    );
};

export default App;
