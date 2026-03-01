import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

interface NavbarProps {
  onOpenModal: () => void;
  onSearch: (query: string) => void;
  currentUser: any;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  onLogout: () => void;  
}

const Navbar: React.FC<NavbarProps> = ({
  onOpenModal,
  onSearch,
  currentUser,
  theme,
  onToggleTheme,
  onLogout  
}) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    onLogout();
    navigate('/login');
  };

  return (
    <nav className={`fixed top-0 w-full z-50 border-b transition-colors ${theme === 'dark'
        ? 'bg-slate-900/95 border-slate-800'
        : 'bg-white/95 border-slate-200'
      } backdrop-blur`}>
      <div className="max-w-6xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="text-xl font-bold text-blue-600">
            CodeVirus
          </Link>

          {/* Search Bar */}
          <div className="flex-1 max-w-xl mx-4">
            <input
              type="text"
              placeholder="Search questions..."
              onChange={(e) => onSearch(e.target.value)}
              className={`w-full px-4 py-2 rounded-full border ${theme === 'dark'
                  ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-400'
                  : 'bg-white border-slate-300 placeholder-slate-500'
                } focus:outline-none focus:ring-2 focus:ring-blue-500`}
            />
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-4">
            {/* Theme Toggle */}
            <button
              onClick={onToggleTheme}
              className={`p-2 rounded-full ${theme === 'dark'
                  ? 'bg-slate-800 text-yellow-400'
                  : 'bg-slate-200 text-slate-700'
                }`}
            >
              {theme === 'dark' ? '☀️' : '🌙'}
            </button>

            {/* User Section */}
            {currentUser ? (
              <>
                <button
                  onClick={onOpenModal}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  Ask Question
                </button>
                <div className="flex items-center gap-2">
                  <span className="text-sm hidden sm:inline">
                    {currentUser?.name || 'User'}
                  </span>
                  <button
                    onClick={handleLogout}
                    className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700 transition"
                  >
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <div className="flex gap-2">
                <Link
                  to="/login"
                  className="px-4 py-2 text-blue-600 hover:underline"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;