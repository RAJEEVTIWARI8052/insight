
import React from 'react';
import { Link } from 'react-router-dom';
import { Question } from '../types';
import QuestionCard from './QuestionCard';

interface FeedProps {
  questions: Question[];
  theme: 'light' | 'dark';
}





const Feed: React.FC<FeedProps> = ({ questions, theme }) => {
  return (
    <div className="flex flex-col gap-4 mb-8">
      {/* Ask prompt */}
      <div className={`rounded-lg p-4 border shadow-sm flex flex-col gap-3 transition-colors ${theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
        }`}>
        <div className="flex gap-3">
          <img src="https://picsum.photos/seed/cyber-user/100/100" className="w-10 h-10 rounded-full" alt="me" />
          <input
            type="text"
            placeholder="Discovered a vulnerability? Document it here..."
            className={`flex-1 border rounded-full px-4 text-sm transition-colors cursor-pointer ${theme === 'dark' ? 'bg-slate-800 border-slate-700 hover:bg-slate-700 text-slate-300' : 'bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-600'
              }`}
            readOnly
          />
        </div>
        <div className={`flex items-center justify-between text-sm font-medium px-4 ${theme === 'dark' ? 'text-slate-500' : 'text-slate-500'}`}>
          <button className="flex items-center gap-2 hover:text-blue-500 transition-colors">
            <i className="fa-solid fa-shield-halved"></i>
            Ask
          </button>
          <div className="h-4 w-px bg-slate-200 dark:bg-slate-700"></div>
          <button className="flex items-center gap-2 hover:text-blue-500 transition-colors">
            <i className="fa-solid fa-code-merge"></i>
            Analyze
          </button>
          <div className="h-4 w-px bg-slate-200 dark:bg-slate-700"></div>
          <button className="flex items-center gap-2 hover:text-blue-500 transition-colors">
            <i className="fa-solid fa-bolt"></i>
            Broadcast
          </button>
        </div>
      </div>

      {(questions || []).map(question => (
        <QuestionCard
          key={question._id}
          question={question}
          theme={theme}
        />

      ))}

      {(!questions || (questions?.length || 0) === 0) && (
        <div className={`p-12 text-center rounded-lg border ${theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
          <i className="fa-solid fa-radar text-4xl text-slate-200 dark:text-slate-800 mb-4"></i>
          <p className="text-slate-500">No active logs matching your criteria.</p>
        </div>
      )}
    </div>
  );
};

export default Feed;
