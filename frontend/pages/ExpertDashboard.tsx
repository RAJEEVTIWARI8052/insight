import React, { useState, useMemo } from "react";
import Sidebar from "../components/Sidebar";
import Feed from "../components/Feed";
import { Question, User } from "../types";

interface Props {
  user: User | null;
  theme: "light" | "dark";
  questions: Question[];
  onLogout: () => void;
  onAddQuestion: (q: Question) => void;
  onThemeToggle: () => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onOpenModal: (mode: "ask" | "analyze" | "broadcast") => void;
  onDelete: (id: string) => void;
  onUpdate: (q: Question) => void;
}

const ExpertDashboard: React.FC<Props> = ({
  user,
  theme,
  questions,
  onSearchChange,
  onOpenModal,
  onDelete,
  onUpdate
}) => {
  const [activeTab, setActiveTab] = useState<"mentions" | "all">("mentions");

  const filteredQuestions = useMemo(() => {
    if (activeTab === "mentions") {
      return questions.filter(q => q.mentionedExpertId === user?.id);
    }
    return questions;
  }, [questions, activeTab, user]);

  return (
    <main className={`min-h-screen pt-20 px-2 pb-12 w-full transition-colors ${theme === 'dark' ? 'bg-[#0B0F19] text-slate-200' : 'bg-slate-50 text-slate-900'}`}>
      
      {/* Decorative Grid Top */}
      <div className="fixed top-0 left-0 w-full h-32 pointer-events-none opacity-[0.03]" style={{ backgroundImage: `linear-gradient(${theme === 'dark' ? '#10B981' : '#059669'} 1px, transparent 1px), linear-gradient(90deg, ${theme === 'dark' ? '#10B981' : '#059669'} 1px, transparent 1px)`, backgroundSize: '40px 40px' }}></div>
      
      <div className="w-full relative z-10">
        
        {/* Header Section */}
        <div className={`mb-8 border-b pb-4 relative ${theme === 'dark' ? 'border-slate-800' : 'border-slate-200'}`}>
          <div className={`absolute -left-4 top-2 bottom-2 w-1 rounded-full ${theme === 'dark' ? 'bg-emerald-500' : 'bg-emerald-600'}`}></div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight flex items-center gap-3">
               <i className={`fa-solid fa-briefcase ${theme === 'dark' ? 'text-emerald-400' : 'text-emerald-600'}`}></i>
               Expert Dashboard
            </h1>
            <p className={`text-sm mt-1 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
               Review escalated questions and provide authoritative resolutions.
            </p>
          </div>
        </div>

        {/* Topic Filters */}
        <div className="mb-8 flex flex-wrap gap-2 animate-fade-in delay-100">
           {['All Sectors', 'General Chat', 'Technical Issue', 'Vulnerability Intel', 'Resource Request'].map((topic) => (
              <button 
                key={topic}
                onClick={() => onSearchChange(topic === 'All Sectors' ? '' : topic)}
                className={`px-4 py-2 text-sm font-medium transition-all rounded-full border ${theme === 'dark' 
                  ? 'border-slate-800 text-slate-300 hover:bg-slate-800 hover:text-white focus:bg-emerald-600 focus:text-white focus:border-emerald-600' 
                  : 'border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900 focus:bg-emerald-600 focus:text-white focus:border-emerald-600'}`}
              >
                 {topic}
              </button>
           ))}
        </div>

        {/* Tabs */}
        <div className={`mb-8 flex gap-2 border-b pb-2 ${theme === 'dark' ? 'border-slate-800' : 'border-slate-200'}`}>
           <button
             onClick={() => setActiveTab("mentions")}
             className={`px-4 py-2 text-sm font-semibold rounded-full transition-all flex items-center gap-2 ${activeTab === 'mentions' 
               ? (theme === 'dark' ? 'bg-emerald-900/30 text-emerald-400 border border-emerald-800/50' : 'bg-emerald-50 text-emerald-700 border border-emerald-200')
               : (theme === 'dark' ? 'text-slate-400 hover:text-emerald-400 hover:bg-slate-800' : 'text-slate-500 hover:bg-slate-100')}`}
           >
             <i className="fa-solid fa-at"></i> Assigned to Me
           </button>
           <button
             onClick={() => setActiveTab("all")}
             className={`px-4 py-2 text-sm font-semibold rounded-full transition-all flex items-center gap-2 ${activeTab === 'all' 
               ? (theme === 'dark' ? 'bg-blue-900/30 text-blue-400 border border-blue-800/50' : 'bg-blue-50 text-blue-700 border border-blue-200')
               : (theme === 'dark' ? 'text-slate-400 hover:text-blue-400 hover:bg-slate-800' : 'text-slate-500 hover:bg-slate-100')}`}
           >
             <i className="fa-solid fa-layer-group"></i> All Questions
           </button>
        </div>

        {filteredQuestions.length === 0 && activeTab === 'mentions' && (
          <div className={`p-16 text-center rounded-2xl border flex flex-col items-center justify-center ${theme === "dark" ? "bg-[#131A2B] border-slate-800" : "bg-slate-50 border-slate-200"}`}>
            <div className="relative mb-6">
              <i className={`fa-solid fa-mug-hot text-5xl opacity-30 ${theme === 'dark' ? 'text-emerald-500' : 'text-slate-400'}`}></i>
            </div>
            <p className={`font-semibold text-lg mb-2 ${theme === 'dark' ? 'text-emerald-400' : 'text-slate-600'}`}>
              Queue Empty
            </p>
            <p className={`text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
              All your assignments are handled. Nice work.
            </p>
          </div>
        )}

        {(filteredQuestions.length > 0 || activeTab === 'all') && (
          <div className="flex justify-center w-full animate-fade-in delay-200">
            <div className="w-full">
               <Feed
                 questions={filteredQuestions}
                 theme={theme}
                 onOpenModal={onOpenModal}
                 user={user}
                 onDelete={onDelete}
                 onUpdate={onUpdate}
               />
            </div>
          </div>
        )}
      </div>
    </main>
  );
};

export default ExpertDashboard;
