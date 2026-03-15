import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from '@clerk/clerk-react';
import { Question, User } from '../types';

interface AnswerDialogProps {
  question: Question;
  currentUser: User | null;
  theme: 'light' | 'dark';
  onClose: () => void;
  onAnswered: (updated: Question) => void;
}

const AnswerDialog: React.FC<AnswerDialogProps> = ({ question, currentUser, theme, onClose, onAnswered }) => {
  const { getToken } = useAuth();
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!content.trim()) { setError('Answer cannot be empty.'); return; }
    if (!currentUser) { setError('You must be logged in to answer.'); return; }

    setIsSubmitting(true);
    setError('');
    try {
      const token = await getToken();
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/questions/${question._id || question.id}/answers`,
        { content: content.trim() },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      onAnswered(response.data);
      onClose();
    } catch (e: any) {
      setError(e?.response?.data?.message || 'Failed to post answer. Try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose();
  };

  const isExpert = currentUser?.role === 'expert';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
      onClick={handleBackdropClick}
    >
      <div
        className={`w-full max-w-lg rounded-2xl shadow-2xl border overflow-hidden animate-fade-down ${
          theme === 'dark'
            ? 'bg-[#131A2B] border-slate-700'
            : 'bg-white border-slate-200'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className={`flex items-center justify-between px-6 py-4 border-b ${theme === 'dark' ? 'border-slate-700/60' : 'border-slate-100'}`}>
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${isExpert ? 'bg-emerald-600' : 'bg-blue-600'}`}>
              <i className={`fa-solid ${isExpert ? 'fa-user-tie' : 'fa-graduation-cap'} text-white text-sm`}></i>
            </div>
            <div>
              <h2 className={`text-base font-bold ${theme === 'dark' ? 'text-slate-100' : 'text-slate-900'}`}>
                Post an Answer
              </h2>
              <p className={`text-xs ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                Replying as <span className={`font-semibold ${isExpert ? 'text-emerald-400' : 'text-blue-500'}`}>{currentUser?.name || 'User'}</span>
                {isExpert && <span className="ml-1 px-1.5 py-0.5 rounded-full bg-emerald-900/40 text-emerald-400 text-[10px] font-bold uppercase tracking-wider">Expert</span>}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${theme === 'dark' ? 'hover:bg-slate-700 text-slate-400' : 'hover:bg-slate-100 text-slate-500'}`}
          >
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>

        {/* Question context */}
        <div className={`px-6 py-3 border-b ${theme === 'dark' ? 'border-slate-700/40 bg-slate-800/20' : 'border-slate-100 bg-slate-50'}`}>
          <p className={`text-xs font-medium uppercase tracking-wider mb-1 ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>Answering</p>
          <p className={`text-sm font-semibold line-clamp-2 ${theme === 'dark' ? 'text-slate-200' : 'text-slate-800'}`}>{question.title}</p>
        </div>

        {/* Answer input */}
        <div className="px-6 py-4">
          <textarea
            autoFocus
            rows={6}
            value={content}
            onChange={(e) => { setContent(e.target.value); setError(''); }}
            placeholder={isExpert ? "Share your expert knowledge and solution..." : "Share your perspective, experience, or solution..."}
            className={`w-full rounded-xl border p-3 text-sm resize-none focus:outline-none focus:ring-2 transition-all ${
              theme === 'dark'
                ? 'bg-[#0B0F19] border-slate-700 text-slate-200 placeholder-slate-500 focus:ring-blue-500/30 focus:border-blue-500/50'
                : 'bg-white border-slate-200 text-slate-900 placeholder-slate-400 focus:ring-blue-500/20 focus:border-blue-400'
            }`}
          />
          {error && (
            <p className="text-rose-500 text-xs mt-1.5 flex items-center gap-1">
              <i className="fa-solid fa-circle-exclamation"></i> {error}
            </p>
          )}
        </div>

        {/* Footer */}
        <div className={`flex items-center justify-between px-6 py-4 border-t ${theme === 'dark' ? 'border-slate-700/60' : 'border-slate-100'}`}>
          <span className={`text-xs ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>
            <i className="fa-solid fa-shield-halved mr-1"></i>
            Open to all community members
          </span>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${theme === 'dark' ? 'text-slate-400 hover:bg-slate-700' : 'text-slate-600 hover:bg-slate-100'}`}
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={isSubmitting || !content.trim()}
              className={`px-6 py-2 rounded-xl text-sm font-bold text-white transition-all shadow-lg active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed ${
                isExpert
                  ? 'bg-gradient-to-r from-emerald-600 to-cyan-600 hover:brightness-110 shadow-emerald-500/20'
                  : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:brightness-110 shadow-blue-500/20'
              }`}
            >
              {isSubmitting ? <><i className="fa-solid fa-spinner fa-spin mr-2"></i>Posting...</> : <><i className="fa-solid fa-paper-plane mr-2"></i>Post Answer</>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnswerDialog;
