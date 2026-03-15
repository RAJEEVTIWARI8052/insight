import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { SignedIn, SignedOut, UserButton, SignInButton } from "@clerk/clerk-react";

interface NavbarProps {
  onOpenModal: () => void;
  onSearch: (query: string) => void;
  theme: "light" | "dark";
  onToggleTheme: () => void;
  onToggleRole?: () => void;
  userRole?: string;
  notificationsCount?: number;
}

const Navbar: React.FC<NavbarProps> = ({
  onOpenModal,
  onSearch,
  theme,
  onToggleTheme,
  notificationsCount = 0,
}) => {
  const location = useLocation();
  const [searchFocused, setSearchFocused] = useState(false);

  const navLinks = [
    { to: "/",             icon: "fa-house",           label: "Home"          },
    { to: "/following",    icon: "fa-user-group",      label: "Network"       },
    { to: "/experts",      icon: "fa-users-viewfinder",label: "Experts"       },
    { to: "/spaces",       icon: "fa-shuttle-space",   label: "Spaces"        },
    { to: "/notifications",icon: "fa-bell",            label: "Notifications" },
  ];

  const dark = theme === "dark";

  return (
    <nav
      className={`fixed top-0 w-full z-50 h-14 flex items-center border-b transition-colors duration-300 ${
        dark
          ? "bg-[#1A1A1B] border-slate-700/60"
          : "bg-white border-slate-200"
      }`}
    >
      <div className="w-full flex items-center px-3 gap-2">

        {/* ── Logo ── */}
        <Link
          to="/"
          className="flex items-center gap-2 shrink-0 mr-2 group"
        >
          <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-transform group-hover:scale-105 ${dark ? "bg-blue-500" : "bg-blue-600"}`}>
            <i className="fa-solid fa-code-branch text-white text-sm"></i>
          </div>
          <span className={`hidden sm:block text-lg font-extrabold tracking-tight ${dark ? "text-white" : "text-slate-900"}`}>
            insight
          </span>
        </Link>

        {/* ── Search Bar (Reddit-style wide, centered feel) ── */}
        <div className={`flex-1 max-w-2xl relative flex items-center rounded-full border transition-all duration-200 ${
          searchFocused
            ? dark ? "border-blue-500 bg-slate-900" : "border-blue-500 bg-white shadow-sm"
            : dark ? "border-slate-600 bg-slate-800 hover:border-slate-500" : "border-slate-300 bg-slate-100 hover:border-slate-400"
        }`}>
          <i className={`fa-solid fa-magnifying-glass absolute left-4 text-sm transition-colors ${searchFocused ? "text-blue-500" : "text-slate-400"}`}></i>
          <input
            type="text"
            placeholder="Search Insight..."
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            onChange={(e) => onSearch(e.target.value)}
            className={`w-full pl-10 pr-4 py-2 bg-transparent text-sm rounded-full focus:outline-none ${
              dark ? "text-slate-100 placeholder-slate-500" : "text-slate-900 placeholder-slate-400"
            }`}
          />
        </div>

        {/* ── Center Nav Icons (Reddit-style icon tabs) ── */}
        <div className="hidden md:flex items-center ml-2">
          {navLinks.map((link) => {
            const active = location.pathname === link.to;
            return (
              <Link
                key={link.to}
                to={link.to}
                title={link.label}
                className={`relative w-12 h-10 flex flex-col items-center justify-center rounded-lg transition-all duration-150 group ${
                  active
                    ? dark
                      ? "text-white border-b-2 border-blue-500"
                      : "text-blue-600 border-b-2 border-blue-600"
                    : dark
                      ? "text-slate-400 hover:bg-slate-700/50 hover:text-slate-200"
                      : "text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                <i className={`fa-solid ${link.icon} text-lg`}></i>
                {link.to === "/notifications" && notificationsCount > 0 && (
                  <span className="absolute top-1 right-1 min-w-[16px] h-4 px-1 bg-red-500 text-white text-[9px] flex items-center justify-center rounded-full font-black leading-none">
                    {notificationsCount > 9 ? "9+" : notificationsCount}
                  </span>
                )}
                {/* Tooltip */}
                <span className={`absolute top-full mt-1.5 text-[10px] font-semibold px-2 py-0.5 rounded pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap ${
                  dark ? "bg-slate-700 text-slate-200" : "bg-slate-800 text-white"
                }`}>
                  {link.label}
                </span>
              </Link>
            );
          })}
        </div>

        {/* ── Right Section ── */}
        <div className="flex items-center gap-2 ml-auto shrink-0">
          {/* Theme toggle */}
          <button
            onClick={onToggleTheme}
            title="Toggle theme"
            className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${
              dark
                ? "text-slate-400 hover:bg-slate-700 hover:text-yellow-400"
                : "text-slate-500 hover:bg-slate-100 hover:text-slate-900"
            }`}
          >
            <i className={`fa-solid ${dark ? "fa-sun" : "fa-moon"} text-base`}></i>
          </button>

          <SignedIn>
            {/* Create post / Ask button — Reddit orange pill */}
            <button
              onClick={onOpenModal}
              className={`hidden sm:flex items-center gap-1.5 px-4 py-1.5 rounded-full border font-bold text-sm transition-all ${
                dark
                  ? "border-slate-500 text-slate-200 hover:border-slate-300 hover:bg-slate-700"
                  : "border-slate-400 text-slate-800 hover:border-blue-500 hover:bg-blue-50 hover:text-blue-700"
              }`}
            >
              <i className="fa-solid fa-plus text-xs"></i>
              Create
            </button>

            {/* Avatar */}
            <div className={`pl-2 border-l ${dark ? "border-slate-700" : "border-slate-200"}`}>
              <UserButton
                appearance={{
                  elements: {
                    userButtonAvatarBox: "w-9 h-9 rounded-full border-2 border-transparent hover:border-blue-500 transition-all",
                  }
                }}
                afterSignOutUrl="/"
              />
            </div>
          </SignedIn>

          <SignedOut>
            <SignInButton mode="modal">
              <button className={`px-4 py-1.5 rounded-full border font-bold text-sm transition-all ${
                dark
                  ? "border-blue-500 text-blue-400 hover:bg-blue-900/20"
                  : "border-blue-600 text-blue-600 hover:bg-blue-50"
              }`}>
                Log In
              </button>
            </SignInButton>
            <SignInButton mode="modal">
              <button className="px-4 py-1.5 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm transition-all">
                Sign Up
              </button>
            </SignInButton>
          </SignedOut>
        </div>

      </div>
    </nav>
  );
};

export default Navbar;