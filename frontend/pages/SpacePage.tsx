import React, { useState } from "react";
import { Link } from "react-router-dom";

interface Props {
  theme: "light" | "dark";
}

const initialSpaces = [
  {
    name: "Ethical Hacking",
    desc: "Penetration testing and offensive security techniques.",
    image: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=800&q=80"
  },
  {
    name: "Malware Analysis",
    desc: "Reverse engineering malware and ransomware samples.",
    image: "https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=800&q=80"
  },
  {
    name: "Network Security",
    desc: "Firewalls, IDS/IPS systems and network defense.",
    image: "https://images.unsplash.com/photo-1558494949-ef010958348e?auto=format&fit=crop&w=800&q=80"
  },
  {
    name: "Bug Bounty",
    desc: "Learn vulnerability hunting and reporting.",
    image: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=800&q=80"
  },
  {
    name: "Digital Forensics",
    desc: "Investigating cyber attacks and digital evidence.",
    image: "https://images.unsplash.com/photo-1551808195-300484594611?auto=format&fit=crop&w=800&q=80"
  },
  {
    name: "Cyber Threat Intelligence",
    desc: "Tracking hackers, malware groups and cyber campaigns.",
    image: "https://images.unsplash.com/photo-1510511459019-5dee99ce4fea?auto=format&fit=crop&w=800&q=80"
  }
];

const SpacesPage: React.FC<Props> = ({ theme }) => {
  const [followedSpaces, setFollowedSpaces] = useState<string[]>([]);

  const toggleFollow = (name: string) => {
    setFollowedSpaces(prev =>
      prev.includes(name) ? prev.filter(s => s !== name) : [...prev, name]
    );
  };

  return (
    <main className="max-w-6xl mx-auto pt-24 px-4 min-h-screen">

      {/* Hero Banner */}
      <div
        className={`relative p-8 rounded-[2.5rem] mb-12 border overflow-hidden group ${theme === "dark"
            ? "bg-slate-900/60 border-slate-800"
            : "bg-white border-slate-200"
          } backdrop-blur-xl shadow-2xl`}
      >
        <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-125 transition-transform duration-700">
          <i className="fa-solid fa-shuttle-space text-8xl text-blue-500"></i>
        </div>

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="px-3 py-1 rounded-full bg-blue-500/10 text-blue-500 text-[10px] font-black uppercase tracking-widest border border-blue-500/20">
              Network Discovery
            </div>
          </div>
          <h1 className="text-4xl font-black font-outfit mb-4 leading-tight">
            Welcome to <span className="text-blue-500">Spaces</span>
          </h1>

          <p
            className={`text-base font-medium max-w-xl mb-8 leading-relaxed ${theme === "dark" ? "text-slate-400" : "text-slate-500"
              }`}
          >
            Join curated cybersecurity communities to explore deep technical discussions, share intel, and collaborate with experts.
          </p>

          <div className="flex gap-4">
            <button className="px-8 py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-sm font-black uppercase tracking-widest shadow-xl shadow-blue-500/20 transition-all hover:-translate-y-1">
              Create a Space
            </button>

            <Link
              to="/"
              className={`px-8 py-3.5 border rounded-2xl text-sm font-black uppercase tracking-widest transition-all hover:bg-slate-100 dark:hover:bg-slate-800 ${theme === "dark"
                  ? "border-slate-800 text-slate-400"
                  : "border-slate-200 text-slate-600"
                }`}
            >
              Back to Intel
            </Link>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-black font-outfit">
          Discover Security Hubs
        </h2>
        <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/5 border border-blue-500/10">
          <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></div>
          <span className="text-[10px] font-black uppercase tracking-widest text-blue-500">Active Nodes: {followedSpaces.length}</span>
        </div>
      </div>

      {/* Spaces grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-24">

        {initialSpaces.map((space, i) => (
          <div
            key={i}
            className={`group rounded-[2rem] overflow-hidden border transition-all duration-300 transform hover:-translate-y-2 ${theme === "dark"
                ? "bg-slate-900 border-slate-800 hover:border-blue-500/50 shadow-2xl hover:shadow-blue-500/5"
                : "bg-white border-slate-200 hover:border-blue-400 shadow-xl"
              }`}
          >
            <div className="relative h-40 overflow-hidden">
              <img
                src={space.image}
                className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-700"
                alt={space.name}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 to-transparent"></div>
              <div className="absolute bottom-4 left-6">
                <h3 className="font-outfit font-black text-white text-lg">
                  {space.name}
                </h3>
              </div>
            </div>

            <div className="p-6">
              <p
                className={`text-sm mb-6 leading-relaxed min-h-[40px] font-medium ${theme === "dark"
                    ? "text-slate-400"
                    : "text-slate-500"
                  }`}
              >
                {space.desc}
              </p>

              <button
                onClick={() => toggleFollow(space.name)}
                className={`w-full py-3.5 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${followedSpaces.includes(space.name)
                    ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
                    : "bg-blue-600 text-white shadow-lg shadow-blue-500/20 hover:bg-blue-700"
                  }`}
              >
                {followedSpaces.includes(space.name) ? (
                  <span className="flex items-center justify-center gap-2">
                    <i className="fa-solid fa-check"></i>
                    Space Joined
                  </span>
                ) : (
                  "Join Space"
                )}
              </button>
            </div>
          </div>
        ))}

      </div>

    </main>
  );
};

export default SpacesPage;