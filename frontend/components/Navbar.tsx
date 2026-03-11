import React from "react";
import { Link, useLocation } from "react-router-dom";
import { SignedIn, SignedOut, UserButton, SignInButton } from "@clerk/clerk-react";

interface NavbarProps {
  onOpenModal: () => void;
  onSearch: (query: string) => void;
  theme: "light" | "dark";
  onToggleTheme: () => void;
  onToggleRole?: () => void;
  userRole?: string;
}

const Navbar: React.FC<NavbarProps> = ({
  onOpenModal,
  onSearch,
  theme,
  onToggleTheme,
  onToggleRole,
  userRole
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
      className={`fixed top-0 w-full z-50 border-b glass animate-fade-down shadow-xl transition-all duration-700 ${theme === "dark" ? "border-slate-800/80" : "border-slate-200/80"
        }`}
    >
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-6">

        {/* Left Section */}
        <div className="flex items-center gap-8">
          {/* Logo with Animated Glow */}
          <Link to="/" className="flex items-center gap-3 group relative">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center transform group-hover:rotate-12 group-hover:scale-110 transition-all duration-500 shadow-lg shadow-blue-500/40 relative z-10">
              <i className="fa-solid fa-virus-slash text-white text-xl"></i>
              <div className="absolute inset-0 bg-blue-400 rounded-2xl blur-lg opacity-0 group-hover:opacity-40 transition-opacity"></div>
            </div>
            <span className="text-2xl font-bold font-outfit tracking-tighter bg-gradient-to-r from-blue-500 via-indigo-400 to-purple-500 bg-clip-text text-transparent group-hover:tracking-normal transition-all duration-500">
              Insight
            </span>
          </Link>

          {/* Navigation Items with Staggered Hover */}
          <div className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`relative px-4 py-2.5 rounded-2xl text-sm font-bold transition-all duration-300 flex items-center gap-2.5 group/nav ${location.pathname === link.to
                  ? "text-blue-500 bg-blue-500/10"
                  : "text-slate-500 hover:text-blue-500 hover:bg-slate-100/50 dark:hover:bg-blue-900/10"
                  }`}
              >
                <i className={`fa-solid ${link.icon} text-lg transform group-hover/nav:scale-110 group-hover/nav:-translate-y-0.5 transition-transform`}></i>
                <span className="font-outfit">{link.label}</span>
                {location.pathname === link.to && (
                  <span className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.8)]"></span>
                )}
              </Link>
            ))}
          </div>
        </div>

        {/* Search Bar - Animated Expansion */}
        <div className="flex-1 max-w-sm relative group hidden md:block">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors z-10">
            <i className="fa-solid fa-magnifying-glass text-sm"></i>
          </div>
          <input
            type="text"
            placeholder="Search insights..."
            onChange={(e) => onSearch(e.target.value)}
            className={`w-full pl-11 pr-4 py-2.5 rounded-2xl border text-sm transition-all duration-500 ${theme === "dark"
              ? "bg-slate-900/40 border-slate-700/50 text-white placeholder-slate-500 group-hover:border-slate-500/50 group-focus-within:bg-slate-900"
              : "bg-slate-100/50 border-slate-200 text-slate-900 placeholder-slate-400 group-hover:border-blue-300 group-focus-within:bg-white"
              } focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 focus:w-[105%] -translate-x-0 focus:-translate-x-[2.5%]`}
          />
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-3">
          {/* Theme Toggle with Rotation */}
          <button
            onClick={onToggleTheme}
            className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-all duration-500 hover:scale-110 active:scale-90 ${theme === "dark"
              ? "bg-slate-800 text-yellow-400 hover:shadow-[0_0_20px_rgba(250,204,21,0.2)]"
              : "bg-slate-100 text-slate-600 hover:shadow-xl"
              }`}
          >
            <i className={`fa-solid ${theme === "dark" ? "fa-sun" : "fa-moon"} text-xl transform transition-transform duration-700 ${theme === 'dark' ? 'rotate-180' : 'rotate-0'}`}></i>
          </button>

          <SignedIn>
            <button
              onClick={onToggleRole}
              className={`hidden sm:flex items-center gap-2.5 px-4 py-2.5 text-xs font-black uppercase tracking-wider rounded-2xl transition-all duration-500 border relative overflow-hidden group/expert ${userRole === 'expert'
                ? "bg-gradient-to-r from-purple-600 to-indigo-600 border-purple-400 text-white shadow-lg shadow-purple-500/30"
                : "bg-slate-100 border-slate-200 text-slate-600 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-400 hover:border-purple-400"
                }`}
            >
              <div className="shimmer-btn absolute inset-0 opacity-0 group-hover/expert:opacity-100 transition-opacity"></div>
              <i className={`fa-solid ${userRole === 'expert' ? 'fa-user-tie' : 'fa-user-astronaut'} text-sm z-10`}></i>
              <span className="z-10 font-outfit">
                {userRole === 'expert' ? 'Expert Active' : 'Switch to Expert'}
              </span>
            </button>

            {/* Ask Button - Pulse Effect */}
            <button
              onClick={onOpenModal}
              className="hidden sm:flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-black rounded-2xl transition-all shadow-lg shadow-blue-600/30 hover:shadow-blue-600/50 hover:-translate-y-1 active:translate-y-0 active:scale-95"
            >
              <i className="fa-solid fa-plus-circle text-base"></i>
              <span className="font-outfit uppercase tracking-tight">Ask Issue</span>
            </button>

            <div className="flex items-center border-l border-slate-200 dark:border-slate-800 pl-4 ml-2">
              <UserButton
                appearance={{
                  elements: {
                    userButtonAvatarBox: "w-10 h-10 rounded-2xl border-2 border-white dark:border-slate-800 shadow-md",
                  }
                }}
                afterSignOutUrl="/"
              />
            </div>
          </SignedIn>

          <SignedOut>
            <div className="flex items-center gap-3">
              <SignInButton mode="modal">
                <button className="px-5 py-2.5 text-blue-500 font-bold text-sm hover:bg-blue-500/5 rounded-2xl transition-all">
                  Login
                </button>
              </SignInButton>
              <SignInButton mode="modal">
                <button className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-sm rounded-2xl transition-all shadow-xl shadow-blue-500/20 active:scale-95">
                  Get Started
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