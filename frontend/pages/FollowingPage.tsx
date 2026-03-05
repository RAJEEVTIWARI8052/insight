import React from "react";
import Sidebar from "../components/Sidebar";

interface Props {
  theme: "light" | "dark";
  onSearchChange: (q: string) => void;
}

const FollowingPage: React.FC<Props> = ({ theme, onSearchChange }) => {
  return (
    <main className="max-w-6xl mx-auto pt-20 px-4 flex gap-6">

      {/* Sidebar */}
      <div className="hidden md:block w-48 shrink-0">
        <Sidebar theme={theme} onTopicSelect={(topic) => onSearchChange(topic)} />
      </div>

      {/* Feed */}
      <div className="flex-1 max-w-2xl">

        <div
          className={`p-6 rounded-lg border text-center ${
            theme === "dark"
              ? "bg-slate-900 border-slate-800 text-slate-200"
              : "bg-white border-slate-200 text-slate-900"
          }`}
        >
          <h2 className="text-xl font-semibold mb-2">
            You've reached the end of your feed
          </h2>

          <p
            className={`text-sm ${
              theme === "dark" ? "text-slate-400" : "text-slate-500"
            }`}
          >
            Follow more spaces to discover new cybersecurity discussions.
          </p>
        </div>

      </div>

      {/* Right Panel */}
      <div className="hidden lg:block w-72 shrink-0"></div>

    </main>
  );
};

export default FollowingPage;