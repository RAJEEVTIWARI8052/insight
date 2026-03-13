import React, { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import axios from "axios";
import { useAuth } from "@clerk/clerk-react";
import { Link } from "react-router-dom";

interface Props {
  theme: "light" | "dark";
  onSearchChange: (q: string) => void;
  onMarkRead: () => void;
}

interface NotificationItem {
  _id: string;
  message: string;
  type: string;
  link: string;
  isRead: boolean;
  createdAt: string;
}

const NotificationPage: React.FC<Props> = ({ theme, onSearchChange, onMarkRead }) => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { getToken } = useAuth();

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const token = await getToken();
        // Fetch notifications
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/notifications`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setNotifications(response.data);

        // Mark all as read after fetching
        if (response.data.some((n: any) => !n.isRead)) {
          await axios.put(`${import.meta.env.VITE_API_URL}/api/notifications/mark-read`, {}, {
            headers: { Authorization: `Bearer ${token}` }
          });
          onMarkRead();
        }
      } catch (error) {
        console.error("Failed to fetch notifications:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchNotifications();
  }, [getToken, onMarkRead]);

  return (
    <main className="max-w-6xl mx-auto pt-24 px-4 flex gap-6 min-h-screen">

      {/* Sidebar */}
      <div className="hidden md:block w-48 shrink-0">
        <Sidebar
          theme={theme}
          onTopicSelect={(topic) => onSearchChange(topic)}
        />
      </div>

      {/* Notifications Panel */}
      <div className="flex-1 max-w-2xl animate-fade-in">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-black font-outfit">Notifications</h1>
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20">
            <div className="w-2 h-2 rounded-full bg-blue-500"></div>
            <span className="text-[10px] font-black uppercase tracking-widest text-blue-500">Live Network State</span>
          </div>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <i className="fa-solid fa-spinner fa-spin text-3xl text-blue-500"></i>
            <p className="text-sm font-bold text-slate-500 animate-pulse">Scanning Neural Network...</p>
          </div>
        ) : notifications.length === 0 ? (
          <div className={`p-12 rounded-[2.5rem] border text-center ${theme === "dark" ? "bg-slate-900/40 border-slate-800" : "bg-white border-slate-200"}`}>
            <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-3xl flex items-center justify-center mx-auto mb-6">
              <i className="fa-solid fa-bell-slash text-3xl text-slate-400"></i>
            </div>
            <h2 className="text-xl font-black font-outfit mb-2">System Clear</h2>
            <p className="text-sm text-slate-500 font-medium">No alerts detected in current operational cycle.</p>
          </div>
        ) : (
          <div className={`rounded-[2.5rem] border overflow-hidden shadow-2xl ${theme === "dark" ? "bg-slate-900/60 border-slate-800" : "bg-white border-slate-200"}`}>
            {notifications.map((n) => (
              <Link
                key={n._id}
                to={n.link || "#"}
                className={`flex gap-5 p-6 border-b transition-all group ${theme === "dark"
                    ? "border-slate-800/50 hover:bg-slate-800/40"
                    : "border-slate-100 hover:bg-slate-50"
                  }`}
              >
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-110 ${n.type === 'expert_response' ? 'bg-green-500/10 text-green-500' :
                    n.type === 'upvote' ? 'bg-blue-500/10 text-blue-500' :
                      'bg-slate-100 dark:bg-slate-800 text-slate-400'
                  }`}>
                  <i className={`fa-solid ${n.type === 'expert_response' ? 'fa-shield-check' : n.type === 'upvote' ? 'fa-arrow-up' : 'fa-info-circle'} text-xl`}></i>
                </div>

                <div className="flex-1">
                  <p className={`text-sm leading-relaxed font-bold ${theme === "dark" ? "text-slate-200" : "text-slate-900"}`}>
                    {n.message}
                  </p>
                  <p className="text-[10px] mt-2 font-black uppercase tracking-widest text-slate-500 flex items-center gap-2">
                    <i className="fa-regular fa-clock"></i>
                    {new Date(n.createdAt).toLocaleString()}
                  </p>
                </div>

                {!n.isRead && (
                  <div className="w-2 h-2 rounded-full bg-blue-500 mt-2"></div>
                )}
              </Link>
            ))}
          </div>
        )}
      </div>

      <div className="hidden lg:block w-72 shrink-0">
        <div className={`p-6 rounded-[2rem] border sticky top-24 ${theme === "dark" ? "bg-slate-900/20 border-slate-800" : "bg-white border-slate-200"}`}>
          <h3 className="text-xs font-black uppercase tracking-widest text-blue-500 mb-4">Protocol Status</h3>
          <p className="text-[11px] leading-relaxed text-slate-500 font-medium">All active alerts are synchronized with your unique encryption token for secure intelligence delivery.</p>
        </div>
      </div>

    </main>
  );
};

export default NotificationPage;