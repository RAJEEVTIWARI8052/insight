import React from "react";

interface Props {
  theme: "light" | "dark";
}

const spaces = [
  {
    name: "Ethical Hacking",
    desc: "Penetration testing and offensive security techniques.",
    image: "https://picsum.photos/seed/hacking/400"
  },
  {
    name: "Malware Analysis",
    desc: "Reverse engineering malware and ransomware samples.",
    image: "https://picsum.photos/seed/malware/400"
  },
  {
    name: "Network Security",
    desc: "Firewalls, IDS/IPS systems and network defense.",
    image: "https://picsum.photos/seed/network/400"
  },
  {
    name: "Bug Bounty",
    desc: "Learn vulnerability hunting and reporting.",
    image: "https://picsum.photos/seed/bugbounty/400"
  },
  {
    name: "Digital Forensics",
    desc: "Investigating cyber attacks and digital evidence.",
    image: "https://picsum.photos/seed/forensics/400"
  },
  {
    name: "Cyber Threat Intelligence",
    desc: "Tracking hackers, malware groups and cyber campaigns.",
    image: "https://picsum.photos/seed/threat/400"
  }
];

const SpacesPage: React.FC<Props> = ({ theme }) => {
  return (
    <main className="max-w-6xl mx-auto pt-24 px-4">

      {/* Banner */}
      <div
        className={`p-6 rounded-lg mb-8 border flex justify-between items-center ${
          theme === "dark"
            ? "bg-slate-900 border-slate-800"
            : "bg-white border-slate-200"
        }`}
      >
        <div>
          <h1 className="text-xl font-bold mb-2">
            Welcome to Spaces
          </h1>

          <p
            className={`text-sm ${
              theme === "dark" ? "text-slate-400" : "text-slate-500"
            }`}
          >
            Follow cybersecurity spaces to explore discussions.
          </p>

          <div className="flex gap-3 mt-4">
            <button className="px-4 py-2 bg-blue-600 text-white rounded-full text-sm">
              Create a Space
            </button>

            <button
              className={`px-4 py-2 border rounded-full text-sm ${
                theme === "dark"
                  ? "border-slate-700"
                  : "border-slate-300"
              }`}
            >
              Discover Spaces
            </button>
          </div>
        </div>

        <div className="text-5xl hidden md:block">
          🛡️
        </div>
      </div>

      <h2 className="text-xl font-bold mb-4">
        Discover Cybersecurity Spaces
      </h2>

      {/* Spaces grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">

        {spaces.map((space, i) => (
          <div
            key={i}
            className={`rounded-lg overflow-hidden border transition ${
              theme === "dark"
                ? "bg-slate-900 border-slate-800 hover:border-blue-500"
                : "bg-white border-slate-200 hover:border-blue-400"
            }`}
          >
            <img
              src={space.image}
              className="h-28 w-full object-cover"
            />

            <div className="p-4">
              <h3 className="font-semibold text-sm mb-1">
                {space.name}
              </h3>

              <p
                className={`text-xs mb-3 ${
                  theme === "dark"
                    ? "text-slate-400"
                    : "text-slate-500"
                }`}
              >
                {space.desc}
              </p>

              <button className="text-xs bg-blue-600 text-white px-3 py-1 rounded-full">
                Follow
              </button>
            </div>
          </div>
        ))}

      </div>

    </main>
  );
};

export default SpacesPage;