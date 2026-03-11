import React from "react";
import { Link, useLocation } from "react-router-dom";
import { SignedIn, SignedOut, UserButton, SignInButton } from "@clerk/clerk-react";

interface NavbarProps {
  onOpenModal: () => void;
  onSearch: (query: string) => void;
  theme: "light" | "dark";
  onToggleTheme: () => void;
}

const Navbar: React.FC<NavbarProps> = ({
  onOpenModal,
  onSearch,
  theme,
  onToggleTheme,
}) => {
  const location = useLocation();

  const navLinks = [
    { to: "/", icon: "fa-house", label: "Home" },
    { to: "/following", icon: "fa-user-group", label: "Network" },
    { to: "/spaces", icon: "fa-layer-group", label: "Spaces" },
    { to: "/notifications", icon: "fa-bell", label: "Notifications" },
  ];

  return (
    <nav
      className={`fixed top-0 w-full z-50 border-b glass transition-all duration-500 ${theme === "dark" ? "border-slate-800/50" : "border-slate-200/50"
        }`}
    >
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-4">

        {/* Left Section */}
        <div className="flex items-center gap-8">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center transform group-hover:rotate-12 transition-transform duration-300 shadow-lg shadow-blue-500/20">
              <i className="fa-solid fa-virus-slash text-white text-lg"></i>
            </div>
            <span className="text-xl font-bold font-outfit tracking-tight bg-gradient-to-r from-blue-600 to-indigo-500 bg-clip-text text-transparent">
              Insight
            </span>
          </Link>

          {/* Navigation Items */}
          <div className="hidden lg:flex items-center gap-2">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`relative px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-300 flex items-center gap-2 ${location.pathname === link.to
                    ? "text-blue-600 bg-blue-50/50 dark:bg-blue-900/20"
                    : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100/50 dark:hover:bg-slate-800/50"
                  }`}
              >
                <i className={`fa-solid ${link.icon} text-base`}></i>
                <span>{link.label}</span>
                {location.pathname === link.to && (
                  <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-blue-600"></span>
                )}
              </Link>
            ))}
          </div>
        </div>

        {/* Search Bar - Refined */}
        <div className="flex-1 max-w-md relative group hidden md:block">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors">
            <i className="fa-solid fa-magnifying-glass text-sm"></i>
          </div>
          <input
            type="text"
            placeholder="Search insights..."
            onChange={(e) => onSearch(e.target.value)}
            className={`w-full pl-11 pr-4 py-2.5 rounded-2xl border text-sm transition-all ${theme === "dark"
                ? "bg-slate-900/40 border-slate-800/60 text-white placeholder-slate-500 group-hover:border-slate-700"
                : "bg-slate-100/40 border-slate-200 text-slate-900 placeholder-slate-400 group-hover:border-slate-300"
              } focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:bg-white dark:focus:bg-slate-900 focus:border-blue-500`}
          />
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-3">
          {/* Theme Toggle */}
          <button
            onClick={onToggleTheme}
            className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 ${theme === "dark"
                ? "bg-slate-800 text-yellow-400 hover:bg-slate-700 hover:shadow-lg hover:shadow-yellow-500/10"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200 hover:shadow-lg"
              }`}
          >
            <i className={`fa-solid ${theme === "dark" ? "fa-sun" : "fa-moon"} text-lg`}></i>
          </button>

          <SignedIn>
            <button
              onClick={onOpenModal}
              className="hidden sm:flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl transition-all shadow-lg shadow-blue-600/20 hover:shadow-blue-600/40 hover:-translate-y-0.5 active:translate-y-0"
            >
              <i className="fa-solid fa-plus-circle"></i>
              Ask Issue
            </button>
            <div className="flex items-center border-l border-slate-200 dark:border-slate-800 pl-3 ml-1">
              <UserButton
                appearance={{
                  elements: {
                    userButtonAvatarBox: "w-9 h-9 rounded-xl",
                  }
                }}
                afterSignOutUrl="/"
              />
            </div>
          </SignedIn>

          <SignedOut>
            <div className="flex items-center gap-2">
              <SignInButton mode="modal">
                <button className="px-5 py-2.5 text-blue-600 font-bold text-sm hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl transition-all">
                  Sign In
                </button>
              </SignInButton>
              <SignInButton mode="modal">
                <button className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl transition-all shadow-lg shadow-blue-600/20">
                  Join Insight
                </button>
              </SignInButton>
            </div>
          </SignedOut>
        </div>

      </div>
    </nav>
  );
};

export default Navbar;