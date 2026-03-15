import React from 'react';
import { Link } from 'react-router-dom';
import { Question, User } from '../types';
import axios from 'axios';
import { useAuth } from '@clerk/clerk-react';
import AnswerDialog from './AnswerDialog';

interface QuestionCardProps {
  question: Question;
  theme: 'light' | 'dark';
  currentUser: User | null;
  onDelete: (id: string) => void;
  onUpdate?: (q: Question) => void;
}

const QuestionCard: React.FC<QuestionCardProps> = ({ question, theme, currentUser, onDelete, onUpdate }) => {
  const { getToken } = useAuth();
  const [upvotes, setUpvotes] = React.useState(question.upvotes?.length || 0);
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const [isAnswerDialogOpen, setIsAnswerDialogOpen] = React.useState(false);
  const [showToast, setShowToast] = React.useState(false);
  const [answerCount, setAnswerCount] = React.useState((question.responses?.length || 0) + (question.answers?.length || 0));


  const isExpert = currentUser?.role === 'expert';
  const canDelete = !!currentUser; // show to any logged-in user; backend enforces author/expert only

  const topAnswer = question.answers?.length > 0
    ? question.answers[0]
    : null;

  const handleVote = async (type: 'upvote' | 'downvote') => {
    try {
      const token = await getToken();
      const response = await axios.put(
        `${import.meta.env.VITE_API_URL}/api/questions/${question._id || question.id}/${type}`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      setUpvotes(response.data.upvotes.length);
    } catch (error) {
      console.error(`Failed to ${type}:`, error);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this issue?")) return;

    try {
      const token = await getToken();
      await axios.delete(
        `${import.meta.env.VITE_API_URL}/api/questions/${question._id || question.id}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      onDelete(question._id || question.id);
    } catch (error) {
      console.error("Failed to delete question:", error);
      alert("Failed to delete the issue. Please try again.");
    }
  };

  const handleExpertResponse = async (text: string) => {
    if (!text.trim() || !currentUser || currentUser.role !== 'expert') return;

    try {
      const token = await getToken();
      const response = await axios.put(
        `${import.meta.env.VITE_API_URL}/api/questions/${question._id || question.id}/respond`,
        { response: text },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (onUpdate) onUpdate(response.data);
    } catch (e) {
      console.error("Failed to post expert response", e);
    }
  };

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    const url = `${window.location.origin}/question/${question._id || question.id}`;
    navigator.clipboard.writeText(url).then(() => {
      setShowToast(true);
      setTimeout(() => setShowToast(false), 2000);
      setIsMenuOpen(false);
    });
  };

  const handleIconClick = (e: React.MouseEvent) => {
    if (currentUser) {
      e.preventDefault();
      setIsAnswerDialogOpen(true);
    }
  };

  return (
    <div
      className={`group relative overflow-hidden rounded-2xl border transition-all duration-300 ${theme === 'dark'
        ? 'bg-[#131A2B] border-slate-800 hover:border-slate-600 shadow-sm'
        : 'bg-white border-slate-200 hover:border-slate-300 shadow-sm'
        }`}
    >
      {/* Top Deco Line */}
      <div className={`absolute top-0 left-0 right-0 h-1 ${theme === 'dark' ? 'bg-blue-500/20 group-hover:bg-blue-500' : 'bg-blue-500/10 group-hover:bg-blue-500'} transition-colors`}></div>

      {/* Grid Pattern Background */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'linear-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.1) 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>

      <div className="p-4 relative z-10">
        
        {/* Header: Meta Info */}
        <div className={`flex items-start justify-between mb-4 pb-3 border-b ${theme === 'dark' ? 'border-slate-800' : 'border-slate-100'}`}>
          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-full overflow-hidden shrink-0 border ${theme === 'dark' ? 'border-slate-700 bg-slate-800' : 'border-slate-200 bg-slate-100'}`}>
               <img src={question.author?.avatar} alt="op" className="w-full h-full object-cover" />
            </div>
            <div className="flex flex-col">
              <span className={`text-sm font-semibold ${theme === 'dark' ? 'text-slate-200' : 'text-slate-900'}`}>
                {question.author?.name || 'Anonymous User'}
              </span>
              <span className="text-xs text-slate-500 flex items-center gap-2">
                 {question.createdAt ? new Date(question.createdAt).toLocaleDateString() : 'Recent'} <span className="opacity-50">•</span> {question.topic}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {question.expertResponse && (
               <span className={`text-[10px] px-2 py-1 rounded-full font-bold uppercase tracking-wider border ${theme === 'dark' ? 'bg-emerald-900/30 text-emerald-400 border-emerald-800/50' : 'bg-emerald-50 text-emerald-600 border-emerald-200'}`}>
                  Resolved
               </span>
            )}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className={`w-8 h-8 flex items-center justify-center rounded-full transition-all ${theme === 'dark' ? 'text-slate-400 hover:bg-slate-800 hover:text-slate-200' : 'text-slate-400 hover:bg-slate-100 hover:text-slate-600'}`}
            >
              <i className="fa-solid fa-ellipsis-vertical text-sm"></i>
            </button>

            {isMenuOpen && (
              <>
                {/* Backdrop to close menu */}
                <div className="fixed inset-0 z-10" onClick={() => setIsMenuOpen(false)} />
                <div className={`absolute right-0 top-10 w-52 rounded-2xl py-2 z-20 shadow-2xl border overflow-hidden ${theme === 'dark' ? 'bg-[#1C253B] border-slate-700' : 'bg-white border-slate-200'}`}>
                  {/* Share Link — always visible */}
                  <button
                    onClick={handleShare}
                    className={`flex items-center gap-3 px-4 py-2.5 w-full text-left text-sm font-medium transition-colors ${theme === 'dark' ? 'text-slate-300 hover:bg-slate-700/50' : 'text-slate-700 hover:bg-slate-50'}`}
                  >
                    <span className={`w-7 h-7 rounded-lg flex items-center justify-center ${theme === 'dark' ? 'bg-blue-900/40 text-blue-400' : 'bg-blue-50 text-blue-600'}`}>
                      <i className="fa-solid fa-link text-[11px]"></i>
                    </span>
                    Share via Link
                  </button>

                  {/* Separator + Delete — only for author/expert */}
                  {canDelete && (
                    <>
                      <div className={`mx-4 my-1 border-t ${theme === 'dark' ? 'border-slate-700' : 'border-slate-100'}`} />
                      <button
                        onClick={() => { handleDelete(); setIsMenuOpen(false); }}
                        className={`flex items-center gap-3 px-4 py-2.5 w-full text-left text-sm font-medium transition-colors ${theme === 'dark' ? 'text-rose-400 hover:bg-rose-500/10' : 'text-rose-600 hover:bg-rose-50'}`}
                      >
                        <span className={`w-7 h-7 rounded-lg flex items-center justify-center ${theme === 'dark' ? 'bg-rose-900/30 text-rose-400' : 'bg-rose-50 text-rose-500'}`}>
                          <i className="fa-solid fa-trash text-[11px]"></i>
                        </span>
                        Delete Issue
                      </button>
                    </>
                  )}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Title & Content */}
        <Link to={`/question/${question.id}`} className="block group/title">
          <h2 className={`text-lg font-bold leading-snug mb-2 transition-colors ${theme === 'dark' ? 'text-slate-100 group-hover/title:text-blue-400' : 'text-slate-900 group-hover/title:text-blue-600'}`}>
            {question.title}
          </h2>
        </Link>
        
        {question.content && (
           <p className={`text-sm mb-4 line-clamp-3 leading-relaxed ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
             {question.content}
           </p>
        )}

        {/* Media */}
        {question.imageUrl && (
          <div className={`relative mb-4 overflow-hidden rounded-sm border ${theme === 'dark' ? 'border-[#ff00ff]/30 mix-blend-screen' : 'border-slate-200'}`}>
            <img src={question.imageUrl} alt="attachment" className="w-full h-48 object-cover grayscale opacity-80 hover:grayscale-0 hover:opacity-100 transition-all duration-500" />
            <div className="absolute top-2 right-2 px-1.5 py-0.5 bg-black/60 backdrop-blur text-[8px] font-mono text-[#ff00ff] border border-[#ff00ff]/50 uppercase">IMG_DATA</div>
          </div>
        )}

        {/* Expert Response Block */}
        {question.expertResponse && (
          <div className={`p-4 rounded-xl border mb-4 ${theme === 'dark' ? 'bg-[#0A1A1B] border-emerald-900/50' : 'bg-emerald-50 border-emerald-200'}`}>
            <div className="flex justify-between items-center mb-2">
               <span className={`text-xs font-bold uppercase tracking-wide flex items-center gap-2 ${theme === 'dark' ? 'text-emerald-400' : 'text-emerald-700'}`}>
                  <i className="fa-solid fa-badge-check"></i> Expert Resolution
               </span>
            </div>
            <p className={`text-sm leading-relaxed ${theme === 'dark' ? 'text-emerald-100/80' : 'text-emerald-900'}`}>
              {question.expertResponse}
            </p>
          </div>
        )}

        {/* Action Bar */}
        <div className={`flex items-center justify-between pt-4 mt-2 border-t text-sm font-medium ${theme === 'dark' ? 'border-slate-800 text-slate-400' : 'border-slate-100 text-slate-600'}`}>
           <div className="flex gap-4">
              <button 
                onClick={() => handleVote('upvote')} 
                className={`flex gap-2 items-center transition-colors ${theme === 'dark' ? 'hover:text-blue-400' : 'hover:text-blue-600'}`}
              >
                <i className="fa-solid fa-arrow-up"></i> <span>{upvotes}</span>
              </button>
              <button 
                onClick={() => handleVote('downvote')}
                className={`flex gap-2 items-center transition-colors ${theme === 'dark' ? 'hover:text-rose-400' : 'hover:text-rose-600'}`}
              >
                <i className="fa-solid fa-arrow-down"></i>
              </button>
           </div>
           
           <div className="flex gap-4">
               <button
                 onClick={(e) => { e.preventDefault(); if (currentUser) setIsAnswerDialogOpen(true); }}
                 className={`flex items-center gap-2 transition-colors ${theme === 'dark' ? 'hover:text-blue-400' : 'hover:text-blue-600'}`}
                >
                 <i className="fa-regular fa-comment"></i> {answerCount} Comments
               </button>
           </div>
        </div>

      </div>

      {isAnswerDialogOpen && currentUser && (
        <AnswerDialog
          question={question}
          currentUser={currentUser}
          theme={theme}
          onClose={() => setIsAnswerDialogOpen(false)}
          onAnswered={(updated) => {
            if (onUpdate) onUpdate(updated);
            setAnswerCount((updated.responses?.length || 0) + (updated.answers?.length || 0));
          }}
        />
      )}
    </div>
  );
};

export default QuestionCard;
