
import React, { useState } from 'react';
import { User, Question } from '../types';
import axios from 'axios';
interface CreateQuestionModalProps {
  onClose: () => void;
  onSubmit: (q: Question) => void;
  user: User;
  theme: 'light' | 'dark';
}

const CreateQuestionModal: React.FC<CreateQuestionModalProps> = ({ onClose, onSubmit, user, theme }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [topic, setTopic] = useState('Malware Analysis');
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);

  const handleSubmit = async () => {
    if (!title.trim()) return;

    // setIsGeneratingImage(true);

    try {
    
      let imageUrl = undefined;
      // if (title.length > 5) {
      //   imageUrl = await generateTopicImage(title);
      // }

     
      const token = localStorage.getItem('token');

      
      const response = await axios.post(
        'https://codevirus-insights-1.onrender.com/api/questions',
        {
          title,
          content,
          topic,
          imageUrl,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`, 
          },
        }
      );

      
      onSubmit(response.data);
      onClose();

    } catch (error: any) {
      console.error("Broadcast failed:", error.response?.data?.message || error.message);
      alert("Security Inquiry failed to broadcast. Check connection.");
    } finally {
      // setIsGeneratingImage(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
      <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-md" onClick={onClose}></div>
      <div className={`w-full max-w-xl rounded-xl shadow-2xl overflow-hidden relative animate-in fade-in zoom-in duration-200 border ${theme === 'dark' ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200'
        }`}>
        <div className={`flex items-center justify-between p-4 border-b ${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-100'}`}>
          <button onClick={onClose} className="text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700 p-2 rounded-full transition-colors">
            <i className="fa-solid fa-xmark text-lg"></i>
          </button>
          <div className="flex gap-4">
            <span className={`text-sm font-bold ${theme === 'dark' ? 'text-slate-200' : 'text-slate-700'}`}>Security Inquiry Protocol</span>
          </div>
          <div className="w-10"></div>
        </div>

        <div className="p-6">
          <div className={`flex items-center gap-3 mb-6 p-4 rounded-xl border ${theme === 'dark' ? 'bg-blue-900/20 border-blue-900/50 text-blue-300' : 'bg-blue-50 border-blue-100 text-blue-800'
            }`}>
            <i className="fa-solid fa-shield-halved"></i>
            <p className="text-xs leading-relaxed">
              <strong>Disclosure Policy:</strong> Ensure your inquiry adheres to responsible disclosure standards. Confidential PII should be redacted.
            </p>
          </div>

          <div className="flex items-center gap-2 mb-4">
            <img
              src={user?.avatar || "https://i.pravatar.cc/40"}
              className="w-6 h-6 rounded-full"
              alt="avatar"
            />
            <select
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className={`border-none rounded-full px-3 py-1 text-xs font-bold focus:ring-2 focus:ring-blue-500 cursor-pointer outline-none ${theme === 'dark' ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-600'
                }`}
            >
              <option value="Malware Analysis">Malware Analysis</option>
              <option value="Network Security">Network Security</option>
              <option value="Penetration Testing">Penetration Testing</option>
              <option value="Cryptography">Cryptography</option>
              <option value="Incident Response">Incident Response</option>
            </select>
          </div>

          <textarea
            placeholder='State your security inquiry...'
            className={`w-full text-xl font-bold border-none focus:ring-0 placeholder:text-slate-300 dark:placeholder:text-slate-600 resize-none mb-4 outline-none min-h-[80px] bg-transparent ${theme === 'dark' ? 'text-white' : 'text-slate-900'
              }`}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          ></textarea>

          <textarea
            placeholder='Additional context, payloads, or logs...'
            className={`w-full text-sm border-none focus:ring-0 placeholder:text-slate-300 dark:placeholder:text-slate-600 resize-none outline-none min-h-[100px] bg-transparent ${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'
              }`}
            value={content}
            onChange={(e) => setContent(e.target.value)}
          ></textarea>
        </div>

        <div className={`p-4 border-t flex items-center justify-between ${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-100'}`}>
          <div className="flex gap-2 text-slate-400">
            <i className="fa-solid fa-code p-2 hover:text-blue-500 cursor-pointer transition-colors"></i>
            <i className="fa-solid fa-paperclip p-2 hover:text-blue-500 cursor-pointer transition-colors"></i>
          </div>
          <div className="flex gap-3">
            <button onClick={onClose} className="px-6 py-2 text-sm font-bold text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors">Abort</button>
            <button
              onClick={handleSubmit}
              disabled={isGeneratingImage || !title.trim()}
              className={`bg-blue-600 text-white px-8 py-2 rounded-full font-bold shadow-md transition-all ${isGeneratingImage || !title.trim() ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-500 active:scale-95'}`}
            >
              {isGeneratingImage ? <i className="fa-solid fa-spinner fa-spin mr-2"></i> : null}
              {isGeneratingImage ? 'Compiling...' : 'Broadcasting'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateQuestionModal;
