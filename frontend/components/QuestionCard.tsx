
import React from 'react';
import { Link } from 'react-router-dom';
import { Question } from '../types';

interface QuestionCardProps {
  question: Question;
  theme: 'light' | 'dark';
}

const QuestionCard: React.FC<QuestionCardProps> = ({ question, theme }) => {
  const topAnswer = question.answers?.length > 0
    ? question.answers[0]
    : null;

  return (
    <div
      className={`rounded-lg border shadow-sm overflow-hidden transition-colors
  ${theme === 'dark'
          ? 'bg-slate-900 border-slate-800 hover:border-blue-800'
          : 'bg-white border-slate-200 hover:border-blue-200'
        }`}
    >

      <div className="p-4">
        <div className="flex items-center gap-2 mb-2">
          <img src={question.author?.avatar} alt="author" className="w-8 h-8 rounded-full border border-slate-100 dark:border-slate-800" />
          <div className="flex flex-col">
            <span
              className={`text-sm font-bold hover:text-blue-600 transition-colors cursor-pointer ${theme === 'dark' ? 'text-slate-200' : 'text-slate-700'
                }`}
            >
              {question.author?.name || 'Anonymous'}</span>
            <span className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">{question.timestamp} • {question.topic}</span>
          </div>
          <button className="ml-auto text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 p-2 rounded-full transition-colors">
            <i className="fa-solid fa-ellipsis"></i>
          </button>
        </div>

        <Link to={`/question/${question.id}`} className="block group">
          <h2
            className={`text-lg font-bold mb-2 group-hover:text-blue-600 transition-colors ${theme === 'dark' ? 'text-white' : 'text-slate-900'
              }`}
          >
            {question.title}</h2>
        </Link>

        {question.content && (
          <p
            className={`text-sm mb-4 line-clamp-3 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'
              }`}
          >
            {question.content}</p>
        )}

        {question.imageUrl && (
          <div className="relative mb-4 group overflow-hidden rounded">
            <img src={question.imageUrl} alt="context" className="w-full h-64 object-cover transform transition-transform duration-500 group-hover:scale-105" />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 to-transparent"></div>
          </div>
        )}

        {topAnswer && (
          <div
            className={`p-4 rounded-lg border mb-4 border-l-4 border-l-blue-400 ${theme === 'dark'
              ? 'bg-slate-800/50 border-slate-800'
              : 'bg-slate-50 border-slate-100'
              }`}
          >

            <div className="flex items-center gap-2 mb-2">
              <img src={topAnswer.author.avatar} className="w-5 h-5 rounded-full" alt="answerer" />
              <span className="text-[10px] font-bold text-slate-500 uppercase">Analysis Provided:</span>
            </div>
            <p className="text-sm text-slate-700 dark:text-slate-300 line-clamp-2">{topAnswer.content}</p>
          </div>
        )}

        <div className="flex items-center gap-2 border-t border-slate-100 dark:border-slate-800 pt-3">
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-full px-1">
            <button className="flex items-center gap-2 hover:bg-blue-100 dark:hover:bg-blue-900/40 hover:text-blue-700 dark:hover:text-blue-400 py-1.5 px-3 rounded-full text-slate-500 transition-colors">
              <i className="fa-solid fa-up-long"></i>
              <span className="text-xs font-bold">Validate</span>
              <span className="text-xs text-slate-400">• {topAnswer?.upvotes || 0}</span>
            </button>
            <div className="w-px h-5 bg-slate-200 dark:bg-slate-700 mx-1"></div>
            <button className="flex items-center gap-2 hover:bg-rose-100 dark:hover:bg-rose-900/40 hover:text-rose-700 dark:hover:text-rose-400 py-1.5 px-3 rounded-full text-slate-500 transition-colors">
              <i className="fa-solid fa-down-long"></i>
            </button>
          </div>

          <Link to={`/question/${question.id}`} className="flex items-center gap-2 hover:bg-slate-100 dark:hover:bg-slate-800 py-1.5 px-3 rounded-full text-slate-500 transition-colors">
            <i className="fa-regular fa-comment-dots"></i>
            <span className="text-xs font-medium">{question.answers?.length || 0}</span>
          </Link>

          <button className="flex items-center gap-2 hover:bg-slate-100 dark:hover:bg-slate-800 py-1.5 px-3 rounded-full text-slate-500 transition-colors">
            <i className="fa-solid fa-share-nodes"></i>
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuestionCard;
