import React, { useState, useMemo } from "react";
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

const TOPICS = ["All", "General", "Malware Analysis", "Network Security", "Penetration Testing", "Cryptography", "Web Exploitation", "DevSecOps", "Incident Response"];

const StudentDashboard: React.FC<Props> = ({
  user,
  theme,
  questions,
  onSearchChange,
  onOpenModal,
  onDelete,
  onUpdate,
}) => {
  const [activeTopic, setActiveTopic] = useState("All");
  const [sort, setSort] = useState<"hot" | "new" | "top">("new");

  const dark = theme === "dark";

  const filteredQuestions = useMemo(() => {
    let q = activeTopic === "All"
      ? questions
      : questions.filter(q => q.topic?.toLowerCase().includes(activeTopic.toLowerCase()) || q.category?.toLowerCase().includes(activeTopic.toLowerCase()));

    if (sort === "hot") {
      q = [...q].sort((a, b) => (b.upvotes?.length || 0) - (a.upvotes?.length || 0));
    } else if (sort === "top") {
      q = [...q].sort((a, b) => ((b.responses?.length || 0) + (b.answers?.length || 0)) - ((a.responses?.length || 0) + (a.answers?.length || 0)));
    }
    // "new" is default from backend (already sorted by createdAt desc)
    return q;
  }, [questions, activeTopic, sort]);

  const handleTopicSelect = (topic: string) => {
    setActiveTopic(topic);
    onSearchChange(topic === "All" ? "" : topic);
  };

  const sortBtns: { key: "hot" | "new" | "top"; icon: string; label: string }[] = [
    { key: "hot",  icon: "fa-fire",       label: "Hot"  },
    { key: "new",  icon: "fa-certificate",label: "New"  },
    { key: "top",  icon: "fa-chart-line", label: "Top"  },
  ];

  return (
    <main className={`min-h-screen pt-16 w-full transition-colors ${dark ? "bg-[#DAE0E6] dark:bg-[#0B0F19]" : "bg-[#DAE0E6]"}`}
      style={{ background: dark ? "#0B0F19" : "#DAE0E6" }}>

      {/* ── Create post bar (Reddit-style) ── */}
      <div className={`w-full px-4 py-3 border-b ${dark ? "bg-[#1A1A1B] border-slate-700" : "bg-white border-slate-200"}`}>
        <div className="flex items-center gap-3 max-w-full">
          {/* Avatar placeholder */}
          <div className={`w-9 h-9 rounded-full border-2 flex items-center justify-center shrink-0 ${dark ? "border-slate-600 bg-slate-800 text-slate-400" : "border-slate-300 bg-slate-100 text-slate-400"}`}>
            {user?.avatar
              ? <img src={user.avatar} className="w-full h-full rounded-full object-cover" alt="me" />
              : <i className="fa-solid fa-user text-sm"></i>
            }
          </div>
          {/* Input (triggers modal) */}
          <button
            onClick={() => onOpenModal("ask")}
            className={`flex-1 text-left px-4 py-2 rounded-lg border text-sm transition-colors ${dark ? "bg-[#272729] border-slate-600 text-slate-400 hover:border-blue-500 hover:bg-[#313135]" : "bg-white border-slate-300 text-slate-400 hover:border-blue-400"}`}
          >
            Ask a question or share an issue...
          </button>
          {/* Quick action buttons */}
          <button onClick={() => onOpenModal("ask")} className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-bold transition-all ${dark ? "border-slate-500 text-slate-300 hover:bg-slate-700" : "border-slate-400 text-slate-700 hover:bg-slate-100"}`}>
            <i className="fa-solid fa-image"></i> Image
          </button>
          <button onClick={() => onOpenModal("analyze")} className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-bold transition-all ${dark ? "border-slate-500 text-slate-300 hover:bg-slate-700" : "border-slate-400 text-slate-700 hover:bg-slate-100"}`}>
            <i className="fa-solid fa-link"></i> Link
          </button>
        </div>
      </div>

      {/* ── Topic Pills (horizontal scroll) ── */}
      <div className={`w-full border-b ${dark ? "bg-[#1A1A1B] border-slate-700" : "bg-white border-slate-200"}`}>
        <div className="flex gap-1 px-3 py-2 overflow-x-auto scrollbar-none">
          {TOPICS.map((t) => (
            <button
              key={t}
              onClick={() => handleTopicSelect(t)}
              className={`shrink-0 px-3 py-1 rounded-full text-xs font-bold border transition-all ${
                activeTopic === t
                  ? dark ? "bg-blue-600 border-blue-500 text-white" : "bg-blue-600 border-blue-500 text-white"
                  : dark ? "bg-transparent border-slate-600 text-slate-300 hover:border-slate-400 hover:bg-slate-700/50" : "bg-transparent border-slate-300 text-slate-700 hover:border-slate-400 hover:bg-slate-100"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* ── Main layout: Feed + Sidebar ── */}
      <div className="flex gap-6 px-2 py-4 max-w-full">

        {/* Feed column */}
        <div className="flex-1 min-w-0">

          {/* ── Sort bar (Reddit-style) ── */}
          <div className={`flex items-center gap-1 px-4 py-2 rounded-xl mb-3 border ${dark ? "bg-[#1A1A1B] border-slate-700" : "bg-white border-slate-200"}`}>
            {sortBtns.map(btn => (
              <button
                key={btn.key}
                onClick={() => setSort(btn.key)}
                className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-bold transition-all ${
                  sort === btn.key
                    ? dark ? "bg-slate-700 text-blue-400" : "bg-blue-50 text-blue-700"
                    : dark ? "text-slate-400 hover:bg-slate-700/50 hover:text-slate-200" : "text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                <i className={`fa-solid ${btn.icon} text-xs`}></i>
                {btn.label}
              </button>
            ))}
            <div className="ml-auto flex items-center gap-1">
              <button className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${dark ? "text-slate-400 hover:bg-slate-700" : "text-slate-500 hover:bg-slate-100"}`}>
                <i className="fa-solid fa-list"></i>
              </button>
              <button className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${dark ? "text-slate-400 hover:bg-slate-700" : "text-slate-500 hover:bg-slate-100"}`}>
                <i className="fa-solid fa-border-all"></i>
              </button>
            </div>
          </div>

          <Feed
            questions={filteredQuestions}
            theme={theme}
            onOpenModal={onOpenModal}
            user={user}
            onDelete={onDelete}
            onUpdate={onUpdate}
          />
        </div>

        {/* ── Sidebar widgets (Reddit right panel) ── */}
        <div className="hidden lg:flex flex-col gap-4 w-80 shrink-0">

          {/* Community info card */}
          <div className={`rounded-xl border overflow-hidden ${dark ? "bg-[#1A1A1B] border-slate-700" : "bg-white border-slate-200"}`}>
            <div className="h-12 bg-gradient-to-r from-blue-600 to-indigo-600"></div>
            <div className="px-4 pb-4 -mt-4">
              <div className={`w-12 h-12 rounded-full border-4 flex items-center justify-center mb-2 ${dark ? "border-[#1A1A1B] bg-blue-900 text-blue-400" : "border-white bg-blue-50 text-blue-600"}`}>
                <i className="fa-solid fa-shield-halved text-xl"></i>
              </div>
              <h3 className={`font-black text-base ${dark ? "text-white" : "text-slate-900"}`}>r/Insight</h3>
              <p className={`text-xs mt-1 mb-4 ${dark ? "text-slate-400" : "text-slate-500"}`}>
                Cybersecurity knowledge hub for students & experts. Ask, share, and resolve issues together.
              </p>
              <button
                onClick={() => onOpenModal("ask")}
                className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-full transition-all"
              >
                + Create Post
              </button>
            </div>
            <div className={`border-t px-4 py-3 grid grid-cols-2 gap-3 text-center text-xs ${dark ? "border-slate-700" : "border-slate-100"}`}>
              <div>
                <p className={`font-black text-base ${dark ? "text-white" : "text-slate-900"}`}>{questions.length}</p>
                <p className={dark ? "text-slate-400" : "text-slate-500"}>Issues</p>
              </div>
              <div>
                <p className={`font-black text-base ${dark ? "text-white" : "text-slate-900"}`}>
                  {questions.filter(q => q.expertResponse).length}
                </p>
                <p className={dark ? "text-slate-400" : "text-slate-500"}>Resolved</p>
              </div>
            </div>
          </div>

          {/* Popular topics widget */}
          <div className={`rounded-xl border p-4 ${dark ? "bg-[#1A1A1B] border-slate-700" : "bg-white border-slate-200"}`}>
            <h4 className={`text-xs font-black uppercase tracking-widest mb-3 ${dark ? "text-slate-400" : "text-slate-500"}`}>
              Top Communities
            </h4>
            {TOPICS.filter(t => t !== "All").slice(0, 5).map((t, i) => (
              <button
                key={t}
                onClick={() => handleTopicSelect(t)}
                className={`flex items-center gap-3 w-full py-2 px-1 rounded-lg text-sm transition-all ${dark ? "hover:bg-slate-800 text-slate-300" : "hover:bg-slate-50 text-slate-700"}`}
              >
                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black ${dark ? "bg-slate-700 text-slate-300" : "bg-slate-100 text-slate-600"}`}>{i + 1}</span>
                <span className="font-semibold">{t}</span>
              </button>
            ))}
          </div>

          {/* Rules card */}
          <div className={`rounded-xl border p-4 ${dark ? "bg-[#1A1A1B] border-slate-700" : "bg-white border-slate-200"}`}>
            <h4 className={`text-xs font-black uppercase tracking-widest mb-3 ${dark ? "text-slate-400" : "text-slate-500"}`}>
              Community Rules
            </h4>
            {["Be respectful to all members", "No spam or self-promotion", "Stay on-topic (cybersecurity)", "Mark questions as solved", "Cite your sources"].map((rule, i) => (
              <div key={rule} className={`flex gap-3 py-2 border-b text-xs ${dark ? "border-slate-800 text-slate-300" : "border-slate-100 text-slate-700"}`}>
                <span className={`font-black shrink-0 ${dark ? "text-slate-500" : "text-slate-400"}`}>{i + 1}.</span>
                <span>{rule}</span>
              </div>
            ))}
          </div>

        </div>
      </div>
    </main>
  );
};

export default StudentDashboard;
