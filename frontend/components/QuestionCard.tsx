import React from 'react';
import { Link } from 'react-router-dom';
import { Question, User } from '../types';
import axios from 'axios';
import { useAuth } from '@clerk/clerk-react';

interface QuestionCardProps {
  question: Question;
  theme: 'light' | 'dark';
  currentUser: User | null;
  onDelete: (id: string) => void;
}

const QuestionCard: React.FC<QuestionCardProps> = ({ question, theme, currentUser, onDelete }) => {
  const { getToken } = useAuth();
  const [upvotes, setUpvotes] = React.useState(question.upvotes?.length || 0);
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  const isAuthor = currentUser && (currentUser.id === question.author?.id || currentUser.id === question.author?._id);
  const isExpert = currentUser?.role === 'expert';
  const canDelete = isAuthor || isExpert;

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

  return (
    <div
      className={`group rounded-3xl border shadow-sm hover:shadow-xl transition-all duration-500 overflow-hidden ${theme === 'dark'
          ? 'bg-slate-900/60 border-slate-800/60 hover:border-blue-500/50'
          : 'bg-white border-slate-200/80 hover:border-blue-300'
        } hover:-translate-y-1`}
    >

      <div className="p-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="relative">
            <img src={question.author?.avatar} alt="author" className="w-10 h-10 rounded-2xl object-cover border-2 border-white dark:border-slate-800 shadow-sm" />
            <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-green-500 border-2 border-white dark:border-slate-900"></div>
          </div>
          <div className="flex flex-col">
            <span
              className={`text-sm font-bold font-outfit hover:text-blue-600 transition-colors cursor-pointer ${theme === 'dark' ? 'text-slate-100' : 'text-slate-800'
                }`}
            >
              {question.author?.name || 'Anonymous'}
            </span>
            <span className="text-[10px] uppercase tracking-widest text-slate-400 font-bold flex items-center gap-1.5">
              <i className="fa-solid fa-clock-rotate-left"></i>
              {question.createdAt ? new Date(question.createdAt).toLocaleDateString() : 'Just now'}
              <span className="opacity-30">•</span>
              <span className="text-blue-500">{question.topic}</span>
            </span>
          </div>
          <div className="ml-auto relative">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="w-10 h-10 flex items-center justify-center text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-2xl transition-all"
            >
              <i className="fa-solid fa-ellipsis-vertical"></i>
            </button>

            {isMenuOpen && (
              <div className="absolute right-0 mt-2 w-48 rounded-2xl shadow-2xl py-2 z-10 glass overflow-hidden border border-slate-200 dark:border-slate-700">
                {canDelete && (
                  <button
                    onClick={() => {
                      handleDelete();
                      setIsMenuOpen(false);
                    }}
                    className="flex items-center gap-2 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 w-full text-left font-semibold transition-colors"
                  >
                    <i className="fa-solid fa-trash-can text-xs"></i>
                    Delete Issue
                  </button>
                )}
                <button
                  onClick={() => setIsMenuOpen(false)}
                  className={`flex items-center gap-2 px-4 py-2.5 text-sm w-full text-left font-semibold transition-colors ${theme === 'dark' ? 'text-slate-300 hover:bg-slate-800' : 'text-slate-700 hover:bg-slate-50'
                    }`}
                >
                  <i className="fa-solid fa-share text-xs"></i>
                  Share Issue
                </button>
              </div>
            )}
          </div>
        </div>

        <Link to={`/question/${question.id}`} className="block">
          <h2
            className={`text-xl font-bold font-outfit mb-2 leading-snug group-hover:text-blue-600 transition-colors ${theme === 'dark' ? 'text-white' : 'text-slate-900'
              }`}
          >
            {question.title}
          </h2>
        </Link>

        {question.content && (
          <p
            className={`text-sm mb-5 line-clamp-2 leading-relaxed ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'
              }`}
          >
            {question.content}
          </p>
        )}

        {question.imageUrl && (
          <div className="relative mb-5 group overflow-hidden rounded-2xl shadow-inner bg-slate-100 dark:bg-slate-950">
            <img src={question.imageUrl} alt="context" className="w-full h-72 object-cover transform transition-transform duration-700 group-hover:scale-105" />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
          </div>
        )}

        {topAnswer && (
          <div
            className={`p-4 rounded-2xl border-l-4 mb-5 shadow-sm ${theme === 'dark'
                ? 'bg-slate-800/30 border-slate-700 border-l-blue-500'
                : 'bg-slate-50 border-slate-100 border-l-blue-400'
              }`}
          >
            <div className="flex items-center gap-2 mb-2">
              <img src={topAnswer.author.avatar} className="w-5 h-5 rounded-lg border border-white dark:border-slate-700" alt="answerer" />
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1">
                <i className="fa-solid fa-sparkles text-blue-500"></i>
                Top Analysis
              </span>
            </div>
            <p className="text-sm text-slate-700 dark:text-slate-300 line-clamp-2 font-medium">
              {topAnswer.content}
            </p>
          </div>
        )}

        <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800/60">
          <div className="flex items-center gap-2 p-1 bg-slate-100/50 dark:bg-slate-800/50 rounded-2xl">
            <button
              onClick={() => handleVote('upvote')}
              className={`flex items-center gap-2 py-1.5 px-4 rounded-xl font-bold text-xs transition-all ${theme === 'dark'
                  ? 'text-slate-400 hover:bg-blue-900/40 hover:text-blue-400'
                  : 'text-slate-500 hover:bg-blue-100 hover:text-blue-700'
                }`}
            >
              <i className="fa-solid fa-arrow-up"></i>
              <span>{upvotes}</span>
            </button>
            <div className="w-px h-4 bg-slate-200 dark:bg-slate-700"></div>
            <button
              onClick={() => handleVote('downvote')}
              className={`flex items-center gap-2 py-1.5 px-3 rounded-xl transition-all ${theme === 'dark'
                  ? 'text-slate-400 hover:bg-rose-900/40 hover:text-rose-400'
                  : 'text-slate-500 hover:bg-rose-100 hover:text-rose-700'
                }`}
            >
              <i className="fa-solid fa-arrow-down"></i>
            </button>
          </div>

          <div className="flex items-center gap-1.5 font-bold text-slate-400">
            <Link to={`/question/${question.id}`} className="flex items-center gap-2 hover:bg-slate-100 dark:hover:bg-slate-800 py-2 px-4 rounded-xl transition-all hover:text-blue-500">
              <i className="fa-regular fa-comment-dots text-lg"></i>
              <span className="text-xs">{question.answers?.length || 0}</span>
            </Link>

            <button className="w-10 h-10 flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all hover:text-indigo-500">
              <i className="fa-solid fa-share-nodes text-base"></i>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuestionCard;
