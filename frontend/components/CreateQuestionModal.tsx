import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { User, Question } from "../types";
import axios from "axios";

import { topics as sidebarTopics } from "../data/mockData";

interface CreateQuestionModalProps {
  mode: "ask" | "analyze" | "broadcast";
  onClose: () => void;
  onSubmit: (q: Question) => void;
  user: User;
  theme: "light" | "dark";
}

const CreateQuestionModal: React.FC<CreateQuestionModalProps> = ({
  mode,
  onClose,
  onSubmit,
  user,
  theme
}) => {

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [topic, setTopic] = useState("Auto-Detecting...");
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [isAutoDetecting, setIsAutoDetecting] = useState(true);
  const [autoResolvedData, setAutoResolvedData] = useState<{ expertResponse: string; topic: string; originalTitle?: string } | null>(null);
  const [liveResolution, setLiveResolution] = useState<{ expertResponse: string; originalTitle: string } | null>(null);
  const [experts, setExperts] = useState<{ _id: string; name: string; username?: string; experience?: number }[]>([]);
  const [mentionedExpertId, setMentionedExpertId] = useState("");
  const [profanityError, setProfanityError] = useState("");
  const getToken = async () => localStorage.getItem('insight_token');

  // Client-side blocked words (mirrors backend list)
  const BLOCKED = ["fuck","shit","bitch","asshole","bastard","cunt","dick","cock","pussy",
    "whore","slut","fag","faggot","nigger","nigga","spic","kike","chink","retard",
    "moron","dumbass","motherfucker","bullshit","jackass","dipshit","shithead","twat",
    "wanker","prick","douchebag","rape","porn","XXX"];

  const checkProfanity = (text: string): string => {
    const lower = text.toLowerCase();
    const found = BLOCKED.find(w => lower.includes(w.toLowerCase()));
    return found ? `Inappropriate word detected. Please keep content respectful.` : "";
  };

  useEffect(() => {
    const checkDupe = async () => {
      if (title.trim().length < 10) {   // needs ≥10 chars to be meaningful
        setLiveResolution(null);
        return;
      }

      try {
        const token = await getToken();
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/questions/check-duplicate?title=${encodeURIComponent(title)}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (response.data) {
          // Duplicate found — immediately switch to the resolved answer view
          setAutoResolvedData({
            expertResponse: response.data.expertResponse,
            topic: topic,
            originalTitle: response.data.originalTitle,
          });
        } else {
          setLiveResolution(null);
        }
      } catch (e) {
        console.error("Live check failed", e);
      }
    };

    const timeout = setTimeout(checkDupe, 500);
    return () => clearTimeout(timeout);
  }, [title, getToken]);

  useEffect(() => {
    const fetchExperts = async () => {
      try {
        const token = await getToken();
        if (token) {
          const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/auth/experts`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          setExperts(res.data);
        }
      } catch (e) {
        console.error("Failed to fetch experts", e);
      }
    };
    if (mode === "ask") {
      fetchExperts();
    }
  }, [mode, getToken]);

  // Auto-detection logic for topics
  useEffect(() => {
    if (!isAutoDetecting || title.length < 3) return;

    const mappings = [
      { topic: "Malware Analysis", keywords: ["virus", "worm", "ransomware", "trojan", "malware", "reverse", "forensic", "payload", "obfuscation", "spyware", "adware", "rootkit", "backdoor", "emotet", "cobalt strike", "binary", "assembly"] },
      { topic: "Network Security", keywords: ["firewall", "vlan", "network", "dns", "ip", "proxy", "packet", "sniffing", "wifi", "port", "vpn", "router", "switch", "ips", "ids", "tcp", "udp", "icmp", "arp"] },
      { topic: "Penetration Testing", keywords: ["kali", "metasploit", "pentest", "vulnerability", "scanner", "exploit", "red team", "burp", "nmap", "privilege escalation", "lateral movement", "bypass", "payload", "poc"] },
      { topic: "Cryptography", keywords: ["encryption", "decryption", "hash", "crypto", "sha256", "aes", "rsa", "kyber", "quantum", "tls", "ssl", "cipher", "pkc", "steganography", "signature", "md5"] },
      { topic: "DevSecOps", keywords: ["ci/cd", "pipeline", "docker", "kubernetes", "terraform", "automation", "jenkins", "github actions", "k8s", "container", "microservices", "sast", "dast", "iac"] },
      { topic: "Web Exploitation", keywords: ["xss", "sql", "injection", "csrf", "owasp", "header", "cookie", "bypass", "web", "appsec", "html", "js", "directory traversal", "lfi", "rfi", "brute force", "ssrf"] },
      { topic: "Incident Response", keywords: ["attack", "breached", "alert", "soc", "log", "monitor", "response", "triage", "incident", "siem", "splunk", "forensics", "endpoint", "edr", "compromise", "threat hunting"] }
    ];

    const text = (title + " " + content).toLowerCase();
    let matched = false;
    for (const mapping of mappings) {
      if (mapping.keywords.some(kw => text.includes(kw))) {
        setTopic(mapping.topic);
        matched = true;
        break;
      }
    }
    if (!matched) setTopic("General");
  }, [title, content, isAutoDetecting]);

  const handleSubmit = async (bypass: boolean = false) => {
    if (!title.trim()) return;
    const err = checkProfanity(title) || checkProfanity(content);
    if (err) { setProfanityError(err); return; }

    try {
      setIsGeneratingImage(true);
      const token = await getToken();

      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/questions`,
        {
          title,
          content,
          topic,
          bypassDeduplication: bypass,
          mentionedExpertId: mentionedExpertId || undefined
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (response.data.autoResolved) {
        setAutoResolvedData({
          expertResponse: response.data.expertResponse,
          topic: response.data.topic
        });
        onSubmit(response.data);
      } else {
        onSubmit(response.data);
        onClose();
      }

    } catch (error: any) {
      console.error(
        "Broadcast failed:",
        error.response?.data?.message || error.message
      );
      alert("Security Inquiry failed to broadcast");
    } finally {
      setIsGeneratingImage(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 overflow-hidden">

      {/* Background overlay */}
      <div
        className="absolute inset-0 bg-slate-950/60 backdrop-blur-md animate-fade-in"
        onClick={onClose}
      />

      {/* Modal panel */}
      <div
        className={`relative z-[10000] w-full max-w-xl rounded-[2.5rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)] border animate-scale-in p-8 ${theme === "dark"
          ? "bg-slate-900 border-slate-700/50 text-white"
          : "bg-white border-slate-200 text-black"
          }`}
      >
        {/* Accent Line */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-500 via-indigo-500 to-violet-500"></div>

        {autoResolvedData ? (
          <div className="animate-fade-in py-4">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-500 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/30">
                  <i className="fa-solid fa-circle-check text-white text-lg"></i>
                </div>
                <div>
                  <h2 className={`text-lg font-black ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>Answer Found!</h2>
                  <p className={`text-xs ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Similar issue already resolved by an expert</p>
                </div>
              </div>
              <button onClick={onClose} className={`w-9 h-9 rounded-xl flex items-center justify-center ${theme === 'dark' ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-slate-100 text-slate-400'}`}>
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>

            {/* Matched question label */}
            {autoResolvedData.originalTitle && (
              <div className={`flex items-center gap-2 px-3 py-2 rounded-xl mb-4 text-xs ${theme === 'dark' ? 'bg-slate-800 text-slate-400' : 'bg-slate-100 text-slate-500'}`}>
                <i className="fa-solid fa-link-slash text-[10px]"></i>
                <span>Matched: <span className={`font-bold ${theme === 'dark' ? 'text-slate-200' : 'text-slate-700'}`}>"{autoResolvedData.originalTitle}"</span></span>
              </div>
            )}

            {/* Expert answer */}
            <div className={`p-5 rounded-2xl border-l-4 mb-5 ${theme === 'dark' ? 'bg-emerald-950/20 border-emerald-500 text-slate-200' : 'bg-emerald-50 border-emerald-500 text-slate-800'}`}>
              <div className="flex items-center gap-2 mb-3">
                <i className="fa-solid fa-shield-check text-emerald-500 text-sm"></i>
                <span className={`text-[10px] font-black uppercase tracking-widest ${theme === 'dark' ? 'text-emerald-400' : 'text-emerald-700'}`}>Expert Resolution</span>
              </div>
              <p className="text-sm leading-relaxed">{autoResolvedData.expertResponse}</p>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-sm font-black transition-all flex items-center justify-center gap-2"
              >
                <i className="fa-solid fa-check"></i> Got it, thanks!
              </button>
              <button
                onClick={() => setAutoResolvedData(null)}
                className={`px-5 py-3 rounded-2xl text-sm font-bold border transition-all ${theme === 'dark' ? 'border-slate-700 text-slate-400 hover:bg-slate-800' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}
              >
                Ask anyway
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-500 border border-blue-500/20">
                  <i className={`fa-solid ${mode === 'ask' ? 'fa-shield-halved' : mode === 'analyze' ? 'fa-code-merge' : 'fa-bolt'} text-xl`}></i>
                </div>
                <div>
                  <h2 className={`text-2xl font-black font-outfit leading-none mb-1 ${theme === "dark" ? "text-white" : "text-slate-900"}`}>
                    {mode === "ask" && "Launch Inquiry"}
                    {mode === "analyze" && "Analyze Threat"}
                    {mode === "broadcast" && "Broadcast Intel"}
                  </h2>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-500/80">Cyber Intelligence Network</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className={`w-10 h-10 flex items-center justify-center rounded-2xl transition-all ${theme === 'dark' ? 'hover:bg-slate-800 text-slate-500' : 'hover:bg-slate-100 text-slate-400'
                  }`}
              >
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>

            <div className="space-y-6">
              <div>
                <label className={`text-[10px] font-black uppercase tracking-[0.2em] mb-2 px-1 block ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>
                  Inquiry Title
                </label>
                <input
                  type="text"
                  placeholder="e.g. Lateral movement detected in VLAN 4"
                  className={`w-full p-4 rounded-[1.5rem] border text-sm font-bold focus:outline-none focus:ring-4 transition-all ${
                    profanityError
                      ? "border-rose-500 focus:ring-rose-500/20 focus:border-rose-500"
                      : `focus:ring-blue-500/20 focus:border-blue-500 ${theme === "dark" ? "bg-slate-950/80 border-slate-700 text-white placeholder-slate-800" : "bg-slate-50 border-slate-200 text-slate-900"}`
                  }`}
                  value={title}
                  onChange={(e) => {
                    setTitle(e.target.value);
                    setProfanityError(checkProfanity(e.target.value));
                  }}
                  autoFocus
                />

                {/* Auto-detected topic badge */}
                {isAutoDetecting && title.length >= 3 && (
                  <div className={`mt-2 flex items-center gap-2 text-xs font-bold ${
                    topic === "Auto-Detecting..." || topic === "General"
                      ? theme === 'dark' ? 'text-slate-500' : 'text-slate-400'
                      : 'text-blue-500'
                  }`}>
                    <i className={`fa-solid ${
                      topic === "Auto-Detecting..." ? 'fa-circle-notch fa-spin' : 'fa-tag'
                    } text-[10px]`}></i>
                    {topic === "Auto-Detecting..."
                      ? "Detecting category..."
                      : `Auto-detected: ${topic}`
                    }
                  </div>
                )}

                {/* Profanity error */}
                {profanityError && (
                  <div className="mt-2 flex items-center gap-2 text-rose-500 text-xs font-semibold">
                    <i className="fa-solid fa-triangle-exclamation"></i>
                    {profanityError}
                  </div>
                )}

                {liveResolution && !autoResolvedData && (
                  <div className={`mt-4 rounded-2xl border overflow-hidden animate-fade-down ${theme === 'dark' ? 'bg-emerald-950/20 border-emerald-700/50' : 'bg-emerald-50 border-emerald-200'}`}>
                    {/* Header */}
                    <div className={`flex items-center gap-2 px-4 py-3 border-b ${theme === 'dark' ? 'bg-emerald-900/30 border-emerald-800/50' : 'bg-emerald-100/60 border-emerald-200'}`}>
                      <i className="fa-solid fa-circle-check text-emerald-500 text-sm"></i>
                      <span className={`text-[11px] font-black uppercase tracking-widest ${theme === 'dark' ? 'text-emerald-400' : 'text-emerald-700'}`}>Instant Answer Found</span>
                      <span className={`ml-auto text-[10px] px-2 py-0.5 rounded-full ${theme === 'dark' ? 'bg-emerald-800/50 text-emerald-300' : 'bg-emerald-200 text-emerald-700'}`}>
                        Similar: "{liveResolution.originalTitle.substring(0, 40)}{liveResolution.originalTitle.length > 40 ? '…' : ''}"
                      </span>
                    </div>
                    {/* Full Answer */}
                    <div className="px-4 py-3">
                      <p className={`text-sm leading-relaxed ${theme === 'dark' ? 'text-slate-200' : 'text-slate-800'}`}>
                        {liveResolution.expertResponse}
                      </p>
                    </div>
                    {/* Action */}
                    <div className={`px-4 py-3 border-t flex gap-2 ${theme === 'dark' ? 'border-emerald-800/40' : 'border-emerald-200'}`}>
                      <button
                        onClick={onClose}
                        className="flex-1 py-2 rounded-xl text-xs font-black uppercase tracking-widest bg-emerald-600 hover:bg-emerald-700 text-white transition-colors flex items-center justify-center gap-2"
                      >
                        <i className="fa-solid fa-check"></i> Got it, close
                      </button>
                      <button
                        onClick={() => setLiveResolution(null)}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors ${theme === 'dark' ? 'text-slate-400 hover:bg-slate-800' : 'text-slate-500 hover:bg-slate-100'}`}
                      >
                        Ask anyway
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className={`text-[10px] font-black uppercase tracking-[0.2em] mb-2 px-1 block ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>
                  Intelligence Data
                </label>
                <textarea
                  placeholder="Paste logs, signatures, or specific symptoms..."
                  className={`w-full p-4 rounded-[1.5rem] border text-sm focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all min-h-[160px] leading-relaxed ${theme === "dark" ? "bg-slate-950/80 border-slate-700 text-white placeholder-slate-800" : "bg-slate-50 border-slate-200 text-slate-900"
                    }`}
                  rows={5}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                />
              </div>

              {mode === "ask" && (
                <div>
                  <label className={`text-[10px] font-black uppercase tracking-[0.2em] mb-2 px-1 block ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>
                    Mention an Expert (Optional)
                  </label>
                  <select
                    value={mentionedExpertId}
                    onChange={(e) => setMentionedExpertId(e.target.value)}
                    className={`w-full p-4 rounded-[1.5rem] border text-sm font-bold focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all ${theme === "dark" ? "bg-slate-950/80 border-slate-700 text-white" : "bg-slate-50 border-slate-200 text-slate-900"}`}
                  >
                    <option value="">No one (Open Inquiry)</option>
                    {experts.map(expert => (
                      <option key={expert._id} value={expert._id}>
                        {expert.name || expert.username} ({expert.experience || 0} yrs exp)
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <div className="flex items-center justify-between mb-2 px-1">
                  <label className={`text-[10px] font-black uppercase tracking-[0.2em] ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>
                    Intelligence Field
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer group">
                    <span className={`text-[9px] font-bold uppercase transition-colors ${isAutoDetecting ? 'text-blue-500' : 'text-slate-500'}`}>
                      {isAutoDetecting ? 'Auto-Detection Active' : 'Manual Selection'}
                    </span>
                    <div
                      onClick={() => setIsAutoDetecting(!isAutoDetecting)}
                      className={`w-8 h-4 rounded-full relative transition-all ${isAutoDetecting ? 'bg-blue-600' : 'bg-slate-700'}`}
                    >
                      <div className={`absolute top-0.5 w-3 h-3 rounded-full bg-white transition-all ${isAutoDetecting ? 'left-4.5' : 'left-0.5'}`} style={{ left: isAutoDetecting ? '18px' : '2px' }}></div>
                    </div>
                  </label>
                </div>

                <div className="flex flex-wrap gap-2">
                  {sidebarTopics.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => {
                        setTopic(t.name);
                        setIsAutoDetecting(false);
                      }}
                      className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border ${topic === t.name
                        ? "bg-blue-600 border-blue-400 text-white shadow-lg shadow-blue-500/20"
                        : theme === "dark"
                          ? "bg-slate-950/40 border-slate-800 text-slate-500 hover:border-slate-600"
                          : "bg-slate-100 border-slate-200 text-slate-400 hover:border-slate-300"
                        }`}
                    >
                      {t.name}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between pt-4">
                <button
                  onClick={onClose}
                  className={`px-6 py-2.5 font-black text-xs uppercase tracking-widest transition-colors ${theme === 'dark' ? 'text-slate-500 hover:text-white' : 'text-slate-400 hover:text-slate-900'}`}
                >
                  Cancel
                </button>

                <button
                  onClick={() => handleSubmit(false)}
                  disabled={!title.trim() || isGeneratingImage}
                  className={`px-8 py-3.5 bg-gradient-to-br from-blue-600 to-indigo-700 hover:from-blue-500 hover:to-indigo-600 text-white rounded-[1.5rem] font-black text-xs uppercase tracking-[0.2em] transition-all shadow-2xl shadow-blue-500/30 transform hover:-translate-y-1 active:scale-[0.98] ${(!title.trim() || isGeneratingImage) ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                >
                  <div className="flex items-center gap-2">
                    {isGeneratingImage ? <i className="fa-solid fa-spinner fa-spin"></i> : <i className="fa-solid fa-paper-plane"></i>}
                    {isGeneratingImage ? "Broadcasting..." : "Broadcast Inquiry"}
                  </div>
                </button>
              </div>
            </div>
          </>
        )}

      </div>

      <style>{`
                @keyframes fade-in {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                @keyframes scale-in {
                    from { opacity: 0; transform: scale(0.95) translateY(10px); }
                    to { opacity: 1; transform: scale(1) translateY(0); }
                }
                @keyframes bounce-subtle {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-10px); }
                }
                .animate-fade-in { animation: fade-in 0.3s ease-out forwards; }
                .animate-scale-in { animation: scale-in 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards; }
                .animate-bounce-subtle { animation: bounce-subtle 2s ease-in-out infinite; }
            `}</style>

    </div>,
    document.body
  );
};

export default CreateQuestionModal;