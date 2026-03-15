import React, { useState, useEffect } from "react";
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

const typeMap: Record<string, { icon: string; darkCls: string; lightCls: string; label: string }> = {
  expert_response: { icon: "fa-shield-check",  darkCls: "bg-emerald-900/30 text-emerald-400", lightCls: "bg-emerald-50 text-emerald-600",  label: "Expert Response" },
  upvote:          { icon: "fa-arrow-up",       darkCls: "bg-blue-900/30 text-blue-400",     lightCls: "bg-blue-50 text-blue-600",       label: "Upvote"          },
  answer:          { icon: "fa-comment-dots",   darkCls: "bg-indigo-900/30 text-indigo-400", lightCls: "bg-indigo-50 text-indigo-600",   label: "New Answer"      },
  mention:         { icon: "fa-at",             darkCls: "bg-violet-900/30 text-violet-400", lightCls: "bg-violet-50 text-violet-600",   label: "Mention"         },
};
const defaultType = { icon: "fa-bell", darkCls: "bg-slate-800 text-slate-300", lightCls: "bg-slate-100 text-slate-600", label: "Notification" };

const timeAgo = (d: string) => {
  const m = Math.floor((Date.now() - new Date(d).getTime()) / 60000);
  if (m < 1) return "Just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
};

const NotificationPage: React.FC<Props> = ({ theme, onMarkRead }) => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { getToken } = useAuth();
  const dark = theme === "dark";

  useEffect(() => {
    const fetch = async () => {
      try {
        const token = await getToken();
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/notifications`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setNotifications(res.data);
        if (res.data.some((n: any) => !n.isRead)) {
          await axios.put(`${import.meta.env.VITE_API_URL}/api/notifications/mark-read`, {}, {
            headers: { Authorization: `Bearer ${token}` }
          });
          onMarkRead();
        }
      } catch (e) {
        console.error("Failed to fetch notifications:", e);
      } finally {
        setIsLoading(false);
      }
    };
    fetch();
  }, [getToken, onMarkRead]);

  const unread = notifications.filter(n => !n.isRead).length;

  return (
    <main className={`w-full min-h-screen pt-16 px-2 pb-12 transition-colors ${dark ? "bg-[#0B0F19] text-slate-200" : "bg-[#DAE0E6] text-slate-900"}`}>

      {/* Header bar */}
      <div className={`flex items-center justify-between px-4 py-4 mb-4 rounded-xl border mt-4 ${dark ? "bg-[#1A1A1B] border-slate-700" : "bg-white border-slate-200 shadow-sm"}`}>
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${dark ? "bg-blue-900/30 text-blue-400" : "bg-blue-50 text-blue-600"}`}>
            <i className="fa-solid fa-bell text-lg"></i>
          </div>
          <div>
            <h1 className={`text-lg font-black tracking-tight ${dark ? "text-white" : "text-slate-900"}`}>Notifications</h1>
            <p className={`text-xs ${dark ? "text-slate-500" : "text-slate-400"}`}>
              {unread > 0 ? `${unread} unread` : "All caught up"}
            </p>
          </div>
        </div>
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-semibold ${dark ? "bg-blue-900/20 border-blue-800/50 text-blue-400" : "bg-blue-50 border-blue-200 text-blue-600"}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse inline-block"></span>
          Network Live
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-32 gap-3">
          <i className={`fa-solid fa-spinner fa-spin text-3xl ${dark ? "text-blue-400" : "text-blue-500"}`}></i>
          <p className="text-sm text-slate-500">Fetching notifications...</p>
        </div>

      ) : notifications.length === 0 ? (
        <div className={`p-16 rounded-2xl border text-center ${dark ? "bg-[#1A1A1B] border-slate-700" : "bg-white border-slate-200 shadow-sm"}`}>
          <div className={`w-16 h-16 mx-auto rounded-2xl flex items-center justify-center mb-4 ${dark ? "bg-slate-800 text-slate-400" : "bg-slate-100 text-slate-400"}`}>
            <i className="fa-solid fa-bell-slash text-2xl"></i>
          </div>
          <h2 className={`text-lg font-bold mb-1 ${dark ? "text-white" : "text-slate-900"}`}>All Caught Up!</h2>
          <p className="text-sm text-slate-500">No notifications yet. Replies, upvotes, and mentions will appear here.</p>
        </div>

      ) : (
        <div className={`rounded-xl border overflow-hidden ${dark ? "bg-[#1A1A1B] border-slate-700" : "bg-white border-slate-200 shadow-sm"}`}>
          {notifications.map((n, idx) => {
            const cfg = typeMap[n.type] || defaultType;
            return (
              <Link
                key={n._id}
                to={n.link || "#"}
                className={`flex items-start gap-4 px-5 py-4 transition-all group ${
                  idx < notifications.length - 1 ? (dark ? "border-b border-slate-800" : "border-b border-slate-100") : ""
                } ${!n.isRead
                    ? (dark ? "bg-blue-950/10" : "bg-blue-50/40")
                    : (dark ? "hover:bg-slate-800/40" : "hover:bg-slate-50")
                  }`}
              >
                {/* Icon */}
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${dark ? cfg.darkCls : cfg.lightCls}`}>
                  <i className={`fa-solid ${cfg.icon} text-sm`}></i>
                </div>

                {/* Body */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className={`text-[10px] font-black uppercase tracking-widest ${dark ? "text-slate-500" : "text-slate-400"}`}>{cfg.label}</span>
                    {!n.isRead && <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0"></span>}
                  </div>
                  <p className={`text-sm leading-relaxed ${dark ? "text-slate-200" : "text-slate-800"}`}>{n.message}</p>
                  <p className={`text-xs mt-1 flex items-center gap-1 ${dark ? "text-slate-500" : "text-slate-400"}`}>
                    <i className="fa-regular fa-clock text-[10px]"></i>
                    {timeAgo(n.createdAt)}
                  </p>
                </div>

                {/* Chevron */}
                <i className={`fa-solid fa-chevron-right text-xs mt-1 transition-transform group-hover:translate-x-0.5 ${dark ? "text-slate-700" : "text-slate-300"}`}></i>
              </Link>
            );
          })}
        </div>
      )}
    </main>
  );
};

export default NotificationPage;