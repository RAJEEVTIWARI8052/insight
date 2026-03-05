import React from "react";
import Sidebar from "../components/Sidebar";

interface Props {
  theme: "light" | "dark";
  onSearchChange: (q: string) => void;
}

const notifications = [
  {
    user: "CyberSecBot",
    text: "answered your question about SQL Injection.",
    image: "https://picsum.photos/seed/user1/100",
    time: "5 min ago"
  },
  {
    user: "Ethical Hacker",
    text: "started following you.",
    image: "https://picsum.photos/seed/user2/100",
    time: "20 min ago"
  },
  {
    user: "Threat Intelligence",
    text: "posted a new discussion about ransomware.",
    image: "https://picsum.photos/seed/user3/100",
    time: "1 hour ago"
  }
];

const NotificationPage: React.FC<Props> = ({ theme, onSearchChange }) => {
  return (
    <main className="max-w-6xl mx-auto pt-20 px-4 flex gap-6">

      {/* Sidebar */}
      <div className="hidden md:block w-48 shrink-0">
        <Sidebar
          theme={theme}
          onTopicSelect={(topic) => onSearchChange(topic)}
        />
      </div>

      {/* Notifications */}
      <div className="flex-1 max-w-2xl">

        <h1 className="text-2xl font-bold mb-6">
          Notifications
        </h1>

        <div
          className={`rounded-lg border overflow-hidden ${
            theme === "dark"
              ? "bg-slate-900 border-slate-800"
              : "bg-white border-slate-200"
          }`}
        >
          {notifications.map((n, i) => (
            <div
              key={i}
              className={`flex gap-4 p-4 border-b ${
                theme === "dark"
                  ? "border-slate-800 hover:bg-slate-800"
                  : "border-slate-200 hover:bg-slate-50"
              }`}
            >
              <img
                src={n.image}
                className="w-10 h-10 rounded-full"
              />

              <div>
                <p className="text-sm">
                  <span className="font-semibold">
                    {n.user}
                  </span>{" "}
                  {n.text}
                </p>

                <p
                  className={`text-xs mt-1 ${
                    theme === "dark"
                      ? "text-slate-400"
                      : "text-slate-500"
                  }`}
                >
                  {n.time}
                </p>
              </div>
            </div>
          ))}
        </div>

      </div>

      <div className="hidden lg:block w-72 shrink-0"></div>

    </main>
  );
};

export default NotificationPage;