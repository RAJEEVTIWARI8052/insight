import React, { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { User as LocalUser } from "../types";

interface LoginPageProps {
  theme: "light" | "dark";
  onLogin: (token: string, user: LocalUser) => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ theme, onLogin }) => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const dark = theme === "dark";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/login`, { email, password });
      const { token, user } = res.data;
      onLogin(token, { id: user.id, name: user.name, avatar: "", role: "user" });
      navigate("/");
    } catch (err: any) {
      setError(err?.response?.data?.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`w-full max-w-md mx-4 rounded-2xl border shadow-2xl overflow-hidden ${dark ? "bg-[#131A2B] border-slate-700" : "bg-white border-slate-200"}`}>
      <div className="h-1.5 bg-gradient-to-r from-blue-500 via-indigo-500 to-violet-500" />
      <div className="p-8">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center">
            <i className="fa-solid fa-shield-halved text-white" />
          </div>
          <div>
            <h1 className={`text-xl font-black ${dark ? "text-white" : "text-slate-900"}`}>Welcome back</h1>
            <p className={`text-xs ${dark ? "text-slate-400" : "text-slate-500"}`}>Sign in to Insight</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className={`text-xs font-bold uppercase tracking-widest block mb-1.5 ${dark ? "text-slate-400" : "text-slate-500"}`}>Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              placeholder="you@example.com"
              className={`w-full px-4 py-3 rounded-xl border text-sm focus:outline-none focus:ring-2 transition-all ${dark ? "bg-slate-800 border-slate-700 text-white placeholder-slate-500 focus:ring-blue-500/30 focus:border-blue-500/50" : "bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400 focus:ring-blue-400/20 focus:border-blue-400"}`}
            />
          </div>
          <div>
            <label className={`text-xs font-bold uppercase tracking-widest block mb-1.5 ${dark ? "text-slate-400" : "text-slate-500"}`}>Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              placeholder="••••••••"
              className={`w-full px-4 py-3 rounded-xl border text-sm focus:outline-none focus:ring-2 transition-all ${dark ? "bg-slate-800 border-slate-700 text-white placeholder-slate-500 focus:ring-blue-500/30 focus:border-blue-500/50" : "bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400 focus:ring-blue-400/20 focus:border-blue-400"}`}
            />
          </div>

          {error && (
            <p className="text-rose-500 text-xs flex items-center gap-1.5">
              <i className="fa-solid fa-circle-exclamation" />{error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:brightness-110 disabled:opacity-50 text-white rounded-xl font-black text-sm transition-all flex items-center justify-center gap-2 mt-2"
          >
            {loading ? <><i className="fa-solid fa-spinner fa-spin" /> Signing in...</> : <><i className="fa-solid fa-right-to-bracket" /> Sign In</>}
          </button>
        </form>

        <p className={`text-center text-xs mt-6 ${dark ? "text-slate-500" : "text-slate-400"}`}>
          Don't have an account?{" "}
          <Link to="/register" className="text-blue-500 font-bold hover:underline">Sign up</Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;