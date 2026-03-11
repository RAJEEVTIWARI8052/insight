import React from "react";
import { topics } from "../data/mockData";

interface SidebarProps {
  theme: "light" | "dark";
  onTopicSelect: (topic: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ theme, onTopicSelect }) => {
  return (
    <div className="sticky top-24 flex flex-col gap-6">

      {/* Action Card */}
      <div className={`p-4 rounded-3xl border shadow-sm flex flex-col gap-4 ${theme === "dark" ? "bg-slate-900/40 border-slate-800" : "bg-white border-slate-200"
        }`}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
            <i className="fa-solid fa-shield-halved text-white"></i>
          </div>
          <div className="flex flex-col">
            <span className={`text-sm font-bold font-outfit ${theme === "dark" ? "text-white" : "text-slate-900"}`}>Insight Hub</span>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-none">V3.1 Secure</span>
          </div>
        </div>

        <button className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-xs font-bold transition-all bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400 dark:hover:bg-blue-900/40">
          <i className="fa-solid fa-plus text-[10px]"></i>
          Join Space
        </button>
      </div>

      {/* Focus Areas */}
      <div className="flex flex-col gap-1">
        <div className="mb-2 px-4 flex items-center justify-between">
          <span className="text-[10px] font-bold text-blue-500 uppercase tracking-widest">
            Expert Focus
          </span>
          <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></div>
        </div>

        {topics.map((topic) => (
          <div
            key={topic.id}
            onClick={() => onTopicSelect(topic.name)}
            className={`flex items-center gap-3 py-2.5 px-4 rounded-2xl cursor-pointer transition-all border-l-2 border-transparent group ${theme === "dark"
                ? "hover:bg-blue-900/10 hover:text-blue-400 hover:border-blue-500 text-slate-400"
                : "hover:bg-blue-50 hover:text-blue-600 hover:border-blue-500 text-slate-600"
              }`}
          >
            <div className={`w-7 h-7 flex items-center justify-center rounded-xl transition-all ${theme === "dark" ? "bg-slate-800/80 group-hover:bg-blue-900/30" : "bg-slate-100 group-hover:bg-white"
              }`}>
              <i className={`fa-solid ${topic.icon} text-xs`}></i>
            </div>

            <span className="text-sm font-semibold font-outfit">
              {topic?.name || "Unknown Topic"}
            </span>

            <i className="fa-solid fa-chevron-right ml-auto text-[8px] opacity-0 group-hover:opacity-100 transition-opacity"></i>
          </div>
        ))}
      </div>

      {/* System Footer */}
      <div className={`mt-2 p-5 rounded-3xl border border-dashed ${theme === "dark" ? "border-slate-800 bg-slate-900/20" : "border-slate-200 bg-slate-50/50"
        }`}>
        <ul className="text-[9px] text-slate-500 flex flex-wrap gap-x-3 gap-y-2 font-bold uppercase tracking-widest mb-4">
          <li className="hover:text-blue-500 cursor-pointer transition-colors">Protocol</li>
          <li className="hover:text-blue-500 cursor-pointer transition-colors">Ethics</li>
          <li className="hover:text-blue-500 cursor-pointer transition-colors">Vulnerability</li>
          <li className="hover:text-blue-500 cursor-pointer transition-colors">Legal</li>
        </ul>

        <div className="flex items-center gap-2 pt-4 border-t border-slate-200 dark:border-slate-800">
          <div className="w-2 h-2 rounded-full bg-green-500 shadow-lg shadow-green-500/20"></div>
          <p className="text-[10px] text-slate-500 font-bold font-outfit uppercase tracking-tighter">
            System Status: Nominal
          </p>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;