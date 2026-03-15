import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "@clerk/clerk-react";

interface Expert {
  _id: string;
  name: string;
  avatar?: string;
  username?: string;
  email?: string;
  bio?: string;
  experience: number;
  expertise: string[];
  createdAt: string;
}

interface Props {
  theme: "light" | "dark";
}

const EXPERTISE_COLORS: Record<string, string> = {
  "Malware Analysis":    "bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800/50",
  "Network Security":    "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800/50",
  "Penetration Testing": "bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-800/50",
  "Cryptography":        "bg-violet-100 text-violet-700 border-violet-200 dark:bg-violet-900/30 dark:text-violet-300 dark:border-violet-800/50",
  "DevSecOps":           "bg-cyan-100 text-cyan-700 border-cyan-200 dark:bg-cyan-900/30 dark:text-cyan-300 dark:border-cyan-800/50",
  "Web Exploitation":    "bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-800/50",
  "Incident Response":   "bg-pink-100 text-pink-700 border-pink-200 dark:bg-pink-900/30 dark:text-pink-300 dark:border-pink-800/50",
};

const getTagColor = (tag: string) =>
  EXPERTISE_COLORS[tag] || "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-800/50";

const ExpertCard: React.FC<{ expert: Expert; theme: "light" | "dark" }> = ({ expert, theme }) => {
  const dark = theme === "dark";
  const joined = new Date(expert.createdAt);
  const joinedStr = joined.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  const initials = (expert.name || "?").split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);

  const expLevel =
    expert.experience >= 10 ? { label: "Principal", color: "text-amber-500 bg-amber-50 border-amber-200 dark:bg-amber-900/20 dark:border-amber-800/30" } :
    expert.experience >= 7  ? { label: "Senior",    color: "text-emerald-600 bg-emerald-50 border-emerald-200 dark:bg-emerald-900/20 dark:border-emerald-800/30" } :
    expert.experience >= 4  ? { label: "Mid-Level", color: "text-blue-600 bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800/30" } :
                              { label: "Associate",  color: "text-slate-600 bg-slate-100 border-slate-200 dark:bg-slate-800 dark:border-slate-700" };

  return (
    <div className={`rounded-2xl border overflow-hidden transition-all duration-300 hover:shadow-xl group ${dark ? "bg-[#1A1A1B] border-slate-700 hover:border-emerald-700/50" : "bg-white border-slate-200 hover:border-emerald-300 shadow-sm"}`}>

      {/* Banner */}
      <div className={`h-16 w-full bg-gradient-to-r ${dark ? "from-slate-800 to-slate-700" : "from-emerald-50 to-teal-50"} relative`}>
        <div className={`absolute inset-0 opacity-20`} style={{ backgroundImage: "radial-gradient(circle at 20% 50%, rgba(16,185,129,0.4) 0%, transparent 60%), radial-gradient(circle at 80% 50%, rgba(6,182,212,0.3) 0%, transparent 60%)" }}></div>
        {/* Verified badge */}
        <div className="absolute top-3 right-3">
          <span className={`flex items-center gap-1 px-2.5 py-1 rounded-full border text-[10px] font-black uppercase tracking-wider ${expLevel.color}`}>
            <i className="fa-solid fa-shield-check text-[9px]"></i> {expLevel.label}
          </span>
        </div>
      </div>

      <div className="px-5 pb-5 -mt-7">
        {/* Avatar */}
        <div className="flex items-end gap-3 mb-3">
          <div className={`w-14 h-14 rounded-2xl border-4 overflow-hidden shrink-0 ${dark ? "border-[#1A1A1B] bg-emerald-900/30" : "border-white bg-emerald-50"} shadow-md`}>
            {expert.avatar
              ? <img src={expert.avatar} alt={expert.name} className="w-full h-full object-cover" />
              : <div className={`w-full h-full flex items-center justify-center text-lg font-black ${dark ? "text-emerald-400" : "text-emerald-600"}`}>{initials}</div>
            }
          </div>
        </div>

        {/* Name & meta */}
        <h3 className={`text-base font-black tracking-tight mb-0.5 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors ${dark ? "text-white" : "text-slate-900"}`}>
          {expert.name || "Verified Expert"}
        </h3>
        {expert.username && (
          <p className={`text-xs mb-1 ${dark ? "text-slate-500" : "text-slate-400"}`}>@{expert.username}</p>
        )}
        {expert.email && (
          <p className={`text-xs flex items-center gap-1 mb-2 ${dark ? "text-slate-500" : "text-slate-400"}`}>
            <i className="fa-solid fa-envelope text-[10px]"></i> {expert.email}
          </p>
        )}

        {/* Bio */}
        {expert.bio ? (
          <p className={`text-xs leading-relaxed mb-4 ${dark ? "text-slate-400" : "text-slate-600"}`}>{expert.bio}</p>
        ) : (
          <p className={`text-xs italic mb-4 ${dark ? "text-slate-600" : "text-slate-400"}`}>No bio added yet.</p>
        )}

        {/* Stats row */}
        <div className={`grid grid-cols-3 gap-2 mb-4 p-3 rounded-xl ${dark ? "bg-slate-800/50" : "bg-slate-50"}`}>
          <div className="text-center">
            <p className={`text-lg font-black ${dark ? "text-white" : "text-slate-900"}`}>{expert.experience}</p>
            <p className={`text-[10px] font-bold uppercase tracking-wider ${dark ? "text-slate-500" : "text-slate-400"}`}>Yrs Exp</p>
          </div>
          <div className="text-center border-x border-dashed border-slate-300 dark:border-slate-700">
            <p className={`text-lg font-black ${dark ? "text-white" : "text-slate-900"}`}>{expert.expertise.length}</p>
            <p className={`text-[10px] font-bold uppercase tracking-wider ${dark ? "text-slate-500" : "text-slate-400"}`}>Fields</p>
          </div>
          <div className="text-center">
            <p className={`text-lg font-black ${dark ? "text-white" : "text-slate-900"}`}>{joined.getFullYear()}</p>
            <p className={`text-[10px] font-bold uppercase tracking-wider ${dark ? "text-slate-500" : "text-slate-400"}`}>Joined</p>
          </div>
        </div>

        {/* Expertise tags */}
        {expert.expertise.length > 0 && (
          <div className="mb-4">
            <p className={`text-[10px] font-black uppercase tracking-widest mb-2 ${dark ? "text-slate-500" : "text-slate-400"}`}>Areas of expertise</p>
            <div className="flex flex-wrap gap-1.5">
              {expert.expertise.map((field) => (
                <span key={field} className={`px-2.5 py-1 text-[11px] font-bold rounded-lg border ${getTagColor(field)}`}>
                  {field}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className={`flex items-center justify-between pt-3 border-t ${dark ? "border-slate-700/60" : "border-slate-100"}`}>
          <span className={`text-[10px] flex items-center gap-1 ${dark ? "text-slate-600" : "text-slate-400"}`}>
            <i className="fa-regular fa-calendar"></i> Member since {joinedStr}
          </span>
          <button className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold border transition-all ${dark ? "border-emerald-800/50 text-emerald-400 hover:bg-emerald-900/30" : "border-emerald-300 text-emerald-700 hover:bg-emerald-50"}`}>
            <i className="fa-solid fa-paper-plane text-[10px]"></i> Ask Expert
          </button>
        </div>
      </div>
    </div>
  );
};

// ── Become Expert Modal ─────────────────────────────────────────────────────
const FIELD_OPTIONS = [
  "Malware Analysis", "Network Security", "Penetration Testing",
  "Cryptography", "DevSecOps", "Web Exploitation", "Incident Response",
];

const BecomeExpertModal: React.FC<{ theme: "light" | "dark"; onClose: () => void; onSuccess: () => void }> = ({ theme, onClose, onSuccess }) => {
  const dark = theme === "dark";
  const { getToken } = useAuth();
  const [experience, setExperience] = useState("");
  const [bio, setBio] = useState("");
  const [selectedFields, setSelectedFields] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const toggleField = (f: string) =>
    setSelectedFields(prev => prev.includes(f) ? prev.filter(x => x !== f) : [...prev, f]);

  const handleSubmit = async () => {
    setError("");
    if (!experience || isNaN(Number(experience))) { setError("Please enter valid years of experience."); return; }
    if (Number(experience) < 4) { setError("You need at least 4 years of experience to become an expert."); return; }
    if (selectedFields.length === 0) { setError("Select at least one area of expertise."); return; }
    try {
      setSubmitting(true);
      const token = await getToken();
      await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/toggle-role`,
        { experience: Number(experience), expertise: selectedFields, bio },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      onSuccess();
      onClose();
    } catch (e: any) {
      setError(e?.response?.data?.message || "Failed to register. Try again.");
    } finally { setSubmitting(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className={`w-full max-w-lg rounded-2xl border overflow-hidden shadow-2xl ${dark ? "bg-[#131A2B] border-slate-700" : "bg-white border-slate-200"}`}>
        {/* Header */}
        <div className="h-2 bg-gradient-to-r from-emerald-500 to-cyan-500"></div>
        <div className={`flex items-center justify-between px-6 py-4 border-b ${dark ? "border-slate-700" : "border-slate-100"}`}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-600 flex items-center justify-center">
              <i className="fa-solid fa-user-tie text-white text-sm"></i>
            </div>
            <div>
              <h2 className={`text-base font-black ${dark ? "text-white" : "text-slate-900"}`}>Become an Expert</h2>
              <p className={`text-xs ${dark ? "text-slate-400" : "text-slate-500"}`}>Min. 4 years experience required</p>
            </div>
          </div>
          <button onClick={onClose} className={`w-8 h-8 rounded-full flex items-center justify-center ${dark ? "hover:bg-slate-700 text-slate-400" : "hover:bg-slate-100 text-slate-500"}`}>
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>

        <div className="px-6 py-5 space-y-5">
          {/* Experience */}
          <div>
            <label className={`text-xs font-black uppercase tracking-widest block mb-1.5 ${dark ? "text-slate-400" : "text-slate-500"}`}>Years of Experience *</label>
            <input
              type="number" min={0} max={50}
              value={experience}
              onChange={e => setExperience(e.target.value)}
              placeholder="e.g. 5"
              className={`w-full px-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 transition-all ${dark ? "bg-slate-800 border-slate-700 text-white placeholder-slate-500 focus:ring-emerald-500/30 focus:border-emerald-500/50" : "bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400 focus:ring-emerald-400/20 focus:border-emerald-400"}`}
            />
          </div>

          {/* Bio */}
          <div>
            <label className={`text-xs font-black uppercase tracking-widest block mb-1.5 ${dark ? "text-slate-400" : "text-slate-500"}`}>Short Bio</label>
            <textarea
              rows={3}
              value={bio}
              onChange={e => setBio(e.target.value)}
              placeholder="Describe your background, certifications, and what you specialise in..."
              className={`w-full px-4 py-2.5 rounded-xl border text-sm resize-none focus:outline-none focus:ring-2 transition-all ${dark ? "bg-slate-800 border-slate-700 text-white placeholder-slate-500 focus:ring-emerald-500/30 focus:border-emerald-500/50" : "bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400 focus:ring-emerald-400/20 focus:border-emerald-400"}`}
            />
          </div>

          {/* Expertise fields */}
          <div>
            <label className={`text-xs font-black uppercase tracking-widest block mb-2 ${dark ? "text-slate-400" : "text-slate-500"}`}>Areas of Expertise * <span className={`text-[10px] normal-case font-medium ${dark ? "text-slate-500" : "text-slate-400"}`}>(select all that apply)</span></label>
            <div className="flex flex-wrap gap-2">
              {FIELD_OPTIONS.map(f => (
                <button
                  key={f}
                  type="button"
                  onClick={() => toggleField(f)}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-all ${selectedFields.includes(f) ? "bg-emerald-600 border-emerald-500 text-white" : dark ? "bg-transparent border-slate-700 text-slate-400 hover:border-slate-500" : "bg-slate-50 border-slate-200 text-slate-600 hover:border-emerald-400"}`}
                >
                  {selectedFields.includes(f) && <i className="fa-solid fa-check mr-1 text-[10px]"></i>}{f}
                </button>
              ))}
            </div>
          </div>

          {error && <p className="text-rose-500 text-xs flex items-center gap-1.5"><i className="fa-solid fa-circle-exclamation"></i>{error}</p>}
        </div>

        <div className={`flex gap-3 px-6 py-4 border-t ${dark ? "border-slate-700" : "border-slate-100"}`}>
          <button onClick={onClose} className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${dark ? "text-slate-400 hover:bg-slate-700" : "text-slate-600 hover:bg-slate-100"}`}>Cancel</button>
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="flex-1 py-2 bg-gradient-to-r from-emerald-600 to-cyan-600 hover:brightness-110 disabled:opacity-50 text-white rounded-xl text-sm font-black transition-all flex items-center justify-center gap-2"
          >
            {submitting ? <><i className="fa-solid fa-spinner fa-spin"></i> Submitting...</> : <><i className="fa-solid fa-shield-check"></i> Register as Expert</>}
          </button>
        </div>
      </div>
    </div>
  );
};

const ExpertDirectory: React.FC<Props> = ({ theme }) => {
  const [experts, setExperts] = useState<Expert[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterField, setFilterField] = useState("All");
  const [showBecomeModal, setShowBecomeModal] = useState(false);
  const { getToken, isLoaded, isSignedIn } = useAuth();
  const dark = theme === "dark";

  useEffect(() => {
    const fetch = async () => {
      try {
        setLoading(true);
        if (!isLoaded || !isSignedIn) { setLoading(false); return; }
        const token = await getToken();
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/auth/experts`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setExperts(res.data);
      } catch (e) { console.error("Failed to load experts", e); }
      finally { setLoading(false); }
    };
    fetch();
  }, [getToken, isLoaded, isSignedIn]);

  // All unique fields across all experts
  const allFields = ["All", ...Array.from(new Set(experts.flatMap(e => e.expertise)))];

  const filtered = experts.filter(exp => {
    const matchSearch = !searchTerm ||
      exp.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      exp.bio?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      exp.expertise.some(e => e.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchField = filterField === "All" || exp.expertise.includes(filterField);
    return matchSearch && matchField;
  });

  return (
    <div className={`min-h-screen pt-16 pb-20 px-2 transition-colors ${dark ? "bg-[#0B0F19] text-slate-200" : "bg-[#DAE0E6] text-slate-900"}`}>

      {/* Decorative grid */}
      <div className="fixed top-0 left-0 w-full h-40 pointer-events-none opacity-[0.03]" style={{ backgroundImage: `linear-gradient(${dark ? "#10B981" : "#059669"} 1px, transparent 1px), linear-gradient(90deg, ${dark ? "#10B981" : "#059669"} 1px, transparent 1px)`, backgroundSize: "40px 40px" }}></div>

      <div className="w-full relative z-10 pt-6">

        {/* Header */}
        <div className={`flex flex-col md:flex-row md:items-center justify-between gap-4 px-2 pb-6 border-b mb-6 ${dark ? "border-slate-800" : "border-slate-300/50"}`}>
        <div>
            <h1 className={`text-2xl font-black tracking-tight flex items-center gap-3 ${dark ? "text-white" : "text-slate-900"}`}>
              <i className={`fa-solid fa-users-viewfinder ${dark ? "text-emerald-400" : "text-emerald-600"}`}></i>
              Expert Directory
            </h1>
            <p className={`text-sm mt-1 ${dark ? "text-slate-400" : "text-slate-600"}`}>
              {experts.length} verified professionals · Browse and connect with domain experts
            </p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            {/* Become Expert button */}
            {isSignedIn && (
              <button
                onClick={() => setShowBecomeModal(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold shadow-lg shadow-emerald-500/20 transition-all active:scale-95"
              >
                <i className="fa-solid fa-user-plus text-xs"></i>
                Become an Expert
              </button>
            )}
            {/* Search */}
            <div className={`flex items-center gap-3 px-4 py-2.5 rounded-full border flex-1 md:max-w-sm ${dark ? "bg-[#1A1A1B] border-slate-700" : "bg-white border-slate-300 shadow-sm"}`}>
              <i className="fa-solid fa-magnifying-glass text-slate-400 text-sm"></i>
              <input
                type="text"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                placeholder="Search by name, field, or bio..."
                className="bg-transparent border-none outline-none w-full text-sm placeholder-slate-400"
              />
            </div>
          </div>
        </div>

        {/* Field filter pills */}
        <div className="flex gap-2 flex-wrap px-2 mb-6">
          {allFields.map(f => (
            <button
              key={f}
              onClick={() => setFilterField(f)}
              className={`px-3 py-1 rounded-full text-xs font-bold border transition-all ${filterField === f
                ? dark ? "bg-emerald-600 border-emerald-500 text-white" : "bg-emerald-600 border-emerald-500 text-white"
                : dark ? "bg-transparent border-slate-700 text-slate-400 hover:border-slate-500 hover:bg-slate-800" : "bg-white border-slate-300 text-slate-600 hover:border-emerald-400"
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Cards */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 gap-4">
            <i className={`fa-solid fa-spinner fa-spin text-3xl ${dark ? "text-emerald-400" : "text-emerald-500"}`}></i>
            <p className="text-sm text-slate-500">Loading expert profiles...</p>
          </div>
        ) : !isSignedIn ? (
          <div className={`p-16 rounded-2xl border text-center ${dark ? "bg-[#131A2B] border-slate-800" : "bg-white border-slate-200"}`}>
            <i className="fa-solid fa-lock text-3xl text-slate-400 mb-4"></i>
            <h2 className="text-lg font-bold mb-2">Sign in Required</h2>
            <p className="text-sm text-slate-500">You must be signed in to view expert profiles.</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className={`p-16 rounded-2xl border text-center ${dark ? "bg-[#131A2B] border-slate-800" : "bg-white border-slate-200"}`}>
            <i className="fa-solid fa-user-slash text-3xl text-slate-400 mb-4"></i>
            <h2 className="text-lg font-bold mb-1">No Experts Found</h2>
            <p className="text-sm text-slate-500">Try a different search or filter.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 px-2">
            {filtered.map(expert => (
              <ExpertCard key={expert._id} expert={expert} theme={theme} />
            ))}
          </div>
        )}
      </div>

      {/* Become Expert Modal */}
      {showBecomeModal && (
        <BecomeExpertModal
          theme={theme}
          onClose={() => setShowBecomeModal(false)}
          onSuccess={() => {
            // Re-fetch experts list after registration
            getToken().then(token =>
              axios.get(`${import.meta.env.VITE_API_URL}/api/auth/experts`, { headers: { Authorization: `Bearer ${token}` } })
                .then(res => setExperts(res.data))
                .catch(console.error)
            );
          }}
        />
      )}
    </div>
  );
};

export default ExpertDirectory;
