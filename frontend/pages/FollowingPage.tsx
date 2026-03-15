import React from "react";
import Sidebar from "../components/Sidebar";

interface Props {
  theme: "light" | "dark";
  onSearchChange: (q: string) => void;
}

const FollowingPage: React.FC<Props> = ({ theme, onSearchChange }) => {
  return (
    <main className={`w-full pt-20 px-2 pb-12 min-h-screen ${theme === 'dark' ? 'bg-[#0B0F19] text-slate-200' : 'bg-slate-50 text-slate-900'}`}>
      <div className="w-full">
        <div className={`p-4 md:p-6 mb-8 mt-16 rounded-2xl border transition-colors ${theme === 'dark' ? 'bg-[#131A2B] border-slate-800 text-slate-200' : 'bg-slate-50 border-slate-200 text-slate-900'}`}>
          <p className="text-sm">You are viewing topics you follow in a professional layout.</p>
          <h2 className="text-xl font-semibold mb-2">
            You've reached the end of your feed
          </h2>
          <p className={`text-sm ${theme === "dark" ? "text-slate-400" : "text-slate-500"}`}>
            Follow more spaces to discover new cybersecurity discussions.
          </p>
        </div>
      </div>
    </main>
  );
};

export default FollowingPage;