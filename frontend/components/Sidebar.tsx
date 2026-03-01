
import React from 'react';
import { topics } from '../data/mockData';

interface SidebarProps {
  theme: 'light' | 'dark';
}

const Sidebar: React.FC<SidebarProps> = ({ theme }) => {
  return (
    <div className="sticky top-24 flex flex-col gap-1">
      <div className={`flex items-center gap-2 p-2 rounded cursor-pointer group transition-colors ${theme === 'dark' ? 'hover:bg-slate-800' : 'hover:bg-slate-200'
        }`}>
        <div className={`w-7 h-7 flex items-center justify-center rounded transition-colors ${theme === 'dark' ? 'bg-slate-800 group-hover:bg-blue-900/30' : 'bg-slate-200 group-hover:bg-blue-100'
          }`}>
          <i className={`fa-solid fa-plus text-xs ${theme === 'dark' ? 'text-slate-400 group-hover:text-blue-400' : 'text-slate-600 group-hover:text-blue-600'}`}></i>
        </div>
        <span className={`text-sm font-medium ${theme === 'dark' ? 'text-slate-500 group-hover:text-slate-300' : 'text-slate-600'}`}>Join Sector</span>
      </div>

      <div className="mt-4 mb-2 px-2">
        <span className="text-[10px] font-bold text-blue-500 uppercase tracking-widest">Focus Areas</span>
      </div>

      {topics.map(topic => (
        <div key={topic.id} className={`flex items-center gap-3 p-2 rounded cursor-pointer transition-all border-l-2 border-transparent ${theme === 'dark'
          ? 'hover:bg-slate-900 hover:text-blue-400 hover:border-blue-500 text-slate-400'
          : 'hover:bg-slate-100 hover:text-blue-600 hover:border-blue-400 text-slate-600'
          }`}>
          <div className="w-6 h-6 flex items-center justify-center">
            <i className={`fa-solid ${topic.icon} text-sm`}></i>
          </div>
          <span className="text-sm truncate font-medium">{topic?.name || 'Unknown Topic'}</span>
        </div>
      ))}

      <div className={`mt-8 border-t pt-4 px-2 ${theme === 'dark' ? 'border-slate-800' : 'border-slate-100'}`}>
        <ul className="text-[10px] text-slate-500 flex flex-wrap gap-x-2 gap-y-1 font-bold uppercase tracking-tighter">
          <li className="hover:text-blue-500 cursor-pointer">Protocol</li>
          <li className="hover:text-blue-500 cursor-pointer">Ethics</li>
          <li className="hover:text-blue-500 cursor-pointer">VDP</li>
          <li className="hover:text-blue-500 cursor-pointer">Legal</li>
        </ul>
        <div className={`mt-6 p-3 rounded-lg border ${theme === 'dark' ? 'bg-slate-900/50 border-slate-800' : 'bg-slate-50 border-slate-100'}`}>
          <p className="text-[10px] text-slate-500 italic">Codevirus v3.1.0-secure. System status: Nominal.</p>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
