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
    <main className="w-full mx-auto pt-24 px-4 md:px-8 min-h-screen">

      {/* Hero Banner */}
      <div
        className={`relative p-8 rounded-[2.5rem] mb-12 border overflow-hidden group ${theme === "dark"
            ? "bg-[#0B0F19] border-slate-800"
            : "bg-white border-slate-200"
          } shadow-sm`}
      >
        <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform duration-700">
          <i className="fa-solid fa-shuttle-space text-8xl text-blue-500"></i>
        </div>

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <div className={`px-3 py-1 rounded-full text-xs font-semibold tracking-wide border ${theme === 'dark' ? 'bg-blue-900/30 text-blue-400 border-blue-800/50' : 'bg-blue-50 text-blue-600 border-blue-200'}`}>
              Network Discovery
            </div>
          </div>
          <h1 className="text-4xl font-bold mb-4 tracking-tight">
            Welcome to <span className={theme === 'dark' ? "text-blue-400" : "text-blue-600"}>Spaces</span>
          </h1>

          <p
            className={`text-base font-medium max-w-xl mb-8 leading-relaxed ${theme === "dark" ? "text-slate-400" : "text-slate-500"
              }`}
          >
            Join curated cybersecurity communities to explore deep technical discussions, share intel, and collaborate with experts.
          </p>

          <div className="flex gap-4">
            <button className={`px-6 py-3 font-semibold rounded-xl text-sm transition-all shadow-sm ${theme === 'dark' ? 'bg-blue-600 hover:bg-blue-500 text-white' : 'bg-blue-600 hover:bg-blue-700 text-white'}`}>
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
        <h2 className="text-2xl font-bold tracking-tight">
          Discover Security Hubs
        </h2>
        <div className={`flex items-center gap-2 px-4 py-2 rounded-full border ${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200 shadow-sm'}`}>
          <div className={`w-2 h-2 rounded-full ${theme === 'dark' ? 'bg-emerald-400' : 'bg-emerald-500'}`}></div>
          <span className={`text-xs font-semibold ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>Active Nodes: {followedSpaces.length}</span>
        </div>
      </div>

      {/* Spaces grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-24">

        {initialSpaces.map((space, i) => (
          <div
            key={i}
            className={`group rounded-2xl overflow-hidden border transition-all duration-300 ${theme === "dark"
                ? "bg-[#131A2B] border-slate-800 hover:border-slate-600"
                : "bg-white border-slate-200 hover:border-slate-300 shadow-sm"
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
                className={`w-full py-2.5 rounded-xl font-semibold text-sm transition-all border ${followedSpaces.includes(space.name)
                    ? (theme === 'dark' ? 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700' : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200')
                    : (theme === 'dark' ? 'bg-blue-600 text-white border-blue-500 hover:bg-blue-500' : 'bg-blue-600 text-white border-blue-600 hover:bg-blue-700')
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