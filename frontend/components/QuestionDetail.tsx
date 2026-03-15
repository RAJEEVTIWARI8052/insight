import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Question, Answer, User } from '../types';
import axios from 'axios';
import { useAuth } from '@clerk/clerk-react';
import ExpertResolutionModal from './ExpertResolutionModal';

interface QuestionDetailProps {
  questions: Question[];
  onUpdate: (q: Question) => void;
  currentUser: User | null;
  theme: "light" | "dark";
}

const QuestionDetail: React.FC<QuestionDetailProps> = ({ questions, onUpdate, currentUser, theme }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getToken } = useAuth();
  const [isGenerating, setIsGenerating] = useState(false);
  const [answerContent, setAnswerContent] = useState('');
  const [expertResponseText, setExpertResponseText] = useState('');
  const [isQuestionMenuOpen, setIsQuestionMenuOpen] = useState(false);
  const [openAnswerMenuId, setOpenAnswerMenuId] = useState<string | null>(null);
  const [isExpertModalOpen, setIsExpertModalOpen] = useState(false);
  const [showToast, setShowToast] = useState(false);

  const question = questions.find(q => q.id === id || q._id === id);
  console.log("QuestionDetail Render - Role:", currentUser?.role, "Expert Mode:", currentUser?.role === 'expert', "Question Found:", !!question);

  if (!question) {
    return (
      <div className={`flex flex-col items-center justify-center h-[50vh] ${theme === 'dark' ? 'text-slate-200 bg-[#0B0F19]' : 'text-slate-800 bg-slate-50'}`}>
        <i className={`fa-solid fa-server text-4xl mb-4 ${theme === 'dark' ? 'text-slate-600' : 'text-slate-300'}`}></i>
        <h2 className="text-2xl font-bold tracking-tight mb-2">Record Not Found</h2>
        <p className="text-sm text-slate-500">The referenced resource has been removed.</p>
      </div>
    );
  }

  const isAuthor = currentUser && (currentUser.id === question.author?.id || currentUser.id === question.author?._id);
  const isExpert = currentUser?.role === 'expert';
  const canDeleteQuestion = isAuthor || isExpert;

  const handleSubmitAnswer = async () => {
    if (!answerContent.trim() || !currentUser) return;

    try {
      const token = await getToken();
      // Assuming a route for adding answers exists, or we use update
      // For now, following existing onUpdate pattern but logically it should be a backend call
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/questions/${question._id || question.id}/answers`, // Placeholder if exists
        { content: answerContent },
        { headers: { Authorization: `Bearer ${token}` } }
      ).catch(() => null);

      if (response) {
        onUpdate(response.data);
      } else {
        // Fallback for mock if API not ready
        const newAnswer: Answer = {
          id: `ans-${Date.now()}`,
          author: currentUser,
          content: answerContent,
          upvotes: 0,
          timestamp: 'Just now',
        };
        onUpdate({
          ...question,
          answers: [...(question.answers || []), newAnswer]
        });
      }
      setAnswerContent('');
    } catch (e) {
      console.error("Failed to post answer", e);
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
      onUpdate(response.data);
      setExpertResponseText('');
    } catch (e) {
      console.error("Failed to post expert response", e);
    }
  };

  const handleDeleteQuestion = async () => {
    if (!window.confirm("Are you sure you want to delete this issue?")) return;

    try {
      const token = await getToken();
      await axios.delete(
        `${import.meta.env.VITE_API_URL}/api/questions/${question._id || question.id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      navigate('/');
    } catch (error) {
      console.error("Failed to delete question:", error);
    }
  };

  const handleDeleteAnswer = async (answerId: string) => {
    if (!window.confirm("Are you sure you want to delete this comment?")) return;

    try {
      const token = await getToken();
      const response = await axios.delete(
        `${import.meta.env.VITE_API_URL}/api/questions/${question._id || question.id}/answers/${answerId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      onUpdate(response.data);
    } catch (error) {
      console.error("Failed to delete answer:", error);
    }
  };

  const handleShare = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url).then(() => {
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
      setIsQuestionMenuOpen(false);
      setOpenAnswerMenuId(null);
    });
  };

  return (
    <div className="flex flex-col gap-4 w-full mx-auto pt-20 px-4 md:px-8 pb-12">
      <div className={`rounded-lg border shadow-sm p-6 ${theme === 'dark' ? 'bg-[#0B0F19] border-slate-800' : 'bg-white border-gray-200'}`}>
        <div className="flex items-center gap-2 mb-4">
          <img src={question.author?.avatar || "https://i.pravatar.cc/40"} alt="author" className="w-10 h-10 rounded-full" />
          <div className="flex flex-col">
            <span className={`font-bold ${theme === 'dark' ? 'text-slate-200' : 'text-gray-800'}`}>{question.author?.name || 'Anonymous'}</span>
            <span className="text-xs text-gray-500">
              {question.createdAt ? new Date(question.createdAt).toLocaleDateString() : 'Just now'} in {question.topic}
            </span>
          </div>
          {question.category && (
            <span className={`px-4 py-1.5 rounded-full text-xs font-semibold tracking-wide border ${theme === 'dark' ? 'bg-blue-900/30 text-blue-400 border-blue-800/50' : 'bg-blue-50 text-blue-600 border-blue-200'}`}>
              {question.category}
            </span>
          )}

          <div className="ml-2 relative">
            <button
              onClick={() => setIsQuestionMenuOpen(!isQuestionMenuOpen)}
              className="text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 p-2 rounded-full transition-colors"
            >
              <i className="fa-solid fa-ellipsis"></i>
            </button>
            {isQuestionMenuOpen && (
              <div className={`absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 z-10 border ${theme === 'dark' ? 'bg-[#131A2B] border-slate-800' : 'bg-white border-slate-200'
                }`}>
                {canDeleteQuestion && (
                  <button
                    onClick={() => {
                      handleDeleteQuestion();
                      setIsQuestionMenuOpen(false);
                    }}
                    className="flex items-center gap-2 px-4 py-2 text-sm text-red-500 hover:bg-slate-100 dark:hover:bg-slate-700 w-full text-left"
                  >
                    <i className="fa-solid fa-trash-can"></i>
                    Delete Issue
                  </button>
                )}
                <button
                  onClick={handleShare}
                  className={`flex items-center gap-2 px-4 py-2 text-sm w-full text-left ${theme === 'dark' ? 'text-blue-400 hover:bg-blue-900/20' : 'text-slate-700 hover:bg-slate-100'
                    }`}
                >
                  <i className="fa-solid fa-share"></i>
                  Share
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Premium Toast */}
        {showToast && (
          <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[100] animate-bounce-subtle">
            <div className={`text-white px-8 py-3 rounded-2xl shadow-2xl flex items-center gap-3 font-black text-xs uppercase tracking-widest border backdrop-blur-md ${theme === 'dark' ? 'bg-gradient-to-r from-blue-600 to-indigo-600 border-blue-400/30' : 'bg-gradient-to-r from-blue-600 to-indigo-600 border-blue-400/30'}`}>
              <div className="w-6 h-6 bg-white/20 rounded-lg flex items-center justify-center">
                <i className="fa-solid fa-link text-[10px]"></i>
              </div>
              Intelligence Link Copied
            </div>
          </div>
        )}

        <h1 className={`text-2xl font-bold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{question.title}</h1>
        {question.content && <p className={`mb-6 whitespace-pre-wrap ${theme === 'dark' ? 'text-slate-300' : 'text-gray-800'}`}>{question.content}</p>}
        {question.imageUrl && <img src={question.imageUrl} className="w-full rounded-lg mb-6 shadow-sm border border-slate-800" alt="main" />}

        {/* Expert Response Section */}
          {question.expertResponse && (
            <div className={`mb-8 p-6 rounded-2xl border relative overflow-hidden ${theme === 'dark' ? 'bg-[#0A1A1B] border-emerald-900/50' : 'bg-emerald-50 border-emerald-200'}`}>
              <div className={`absolute top-0 left-0 w-1.5 h-full ${theme === 'dark' ? 'bg-emerald-500' : 'bg-emerald-600'}`}></div>
              <div className="flex justify-between items-center mb-4">
                 <h3 className={`text-sm font-bold uppercase tracking-widest flex items-center gap-2 ${theme === 'dark' ? 'text-emerald-400' : 'text-emerald-700'}`}>
                    <i className="fa-solid fa-badge-check"></i> Expert Resolution
                 </h3>
              </div>
              <div className={`pl-4 text-base leading-relaxed ${theme === 'dark' ? 'text-emerald-100/90' : 'text-emerald-900'}`}>
                 {question.expertResponse}
              </div>
            </div>
          )}

        <div className={`flex items-center gap-3 border-b pb-6 ${theme === 'dark' ? 'border-slate-800' : 'border-gray-100'}`}>
          <button
            disabled={isGenerating}
            className={`flex items-center gap-2 px-5 py-2 rounded-full font-semibold transition-all shadow-sm ${theme === 'dark' ? 'bg-blue-900/30 text-blue-400 hover:bg-blue-900/50' : 'bg-blue-50 text-blue-700 hover:bg-blue-100'} ${isGenerating ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {isGenerating ? <i className="fa-solid fa-spinner fa-spin"></i> : <i className="fa-solid fa-sparkles"></i>}
            {isGenerating ? 'Thinking...' : 'Get AI Answer'}
          </button>

          <div className="flex items-center gap-4 ml-auto text-gray-400">
            <i onClick={handleShare} className={`fa-solid fa-share cursor-pointer transition-colors ${theme === 'dark' ? 'hover:text-blue-400' : 'hover:text-blue-500'}`}></i>
          </div>
        </div>

        {/* Expert Response Input Button */}
        {currentUser?.role === 'expert' && (!question.expertResponse || question.expertResponse === "") && (
          <div className={`mt-8 p-8 rounded-3xl border border-dashed flex flex-col items-center justify-center text-center animate-fade-down ${theme === 'dark' ? 'bg-emerald-900/10 border-emerald-900/40' : 'bg-blue-50/30 border-blue-200'
            }`}>
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-4 shadow-xl ${theme === 'dark' ? 'bg-gradient-to-br from-emerald-600 to-cyan-600 shadow-emerald-600/30' : 'bg-gradient-to-br from-green-500 to-emerald-600 shadow-green-500/20'}`}>
              <i className={`fa-solid fa-user-tie text-2xl ${theme === 'dark' ? 'text-white' : 'text-white'}`}></i>
            </div>
            <h3 className={`font-black text-xl font-outfit mb-2 ${theme === 'dark' ? 'text-emerald-300' : 'text-slate-900'}`}>
              Expert Perspective Needed
            </h3>
            <p className={`text-sm mb-6 max-w-sm ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
              This issue hasn't been resolved yet. As a verified expert, your insight is vital for the community.
            </p>
            <button
              onClick={() => setIsExpertModalOpen(true)}
              className={`px-8 py-3.5 font-black rounded-2xl transition-all shadow-xl active:scale-95 flex items-center gap-2 ${theme === 'dark' ? 'bg-gradient-to-r from-emerald-600 to-cyan-600 hover:brightness-110 text-white shadow-emerald-600/30' : 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-green-600/30 hover:-translate-y-1'}`}
            >
              <i className="fa-solid fa-plus-circle"></i>
              Post Solution
            </button>
          </div>
        )}

        <div className="mt-8">
          <h3 className={`font-bold text-lg mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            {(question.answers?.length || 0) + (question.responses?.length || 0)} Answers
          </h3>

          {currentUser && (
            <div className="flex gap-4 mb-8">
              <img src={currentUser?.avatar || "https://i.pravatar.cc/40"} className="w-10 h-10 rounded-full" alt="me" />
              <div className="flex-1">
                <textarea
                  className={`w-full border rounded-lg p-3 text-sm focus:outline-none focus:ring-2 transition-all ${theme === 'dark' ? 'bg-[#0B0F19] border-slate-800 text-slate-200 focus:ring-blue-400' : 'bg-white border-gray-200 focus:ring-blue-500'}`}
                  placeholder="Share your perspective..."
                  rows={4}
                  value={answerContent}
                  onChange={(e) => setAnswerContent(e.target.value)}
                ></textarea>
                <div className="flex justify-end mt-2">
                  <button onClick={handleSubmitAnswer} className={`px-6 py-2 rounded-full font-semibold transition-colors ${theme === 'dark' ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-blue-600 text-white hover:bg-blue-700'}`}>
                    Post Answer
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-8">
            {/* Merge mock answers and DB responses for display if needed */}
            {[...(question.answers || []), ...(question.responses || [])].map((answer: any) => {
              const ansId = answer._id || answer.id;
              const isAnsAuthor = currentUser && (currentUser.id === answer.author?.id || currentUser.id === answer.author?._id || currentUser.id === answer.author);
              const canDeleteAns = isAnsAuthor || isExpert;

              return (
                <div key={ansId} className={`p-4 rounded-xl border ${answer.isAI ? (theme === 'dark' ? 'bg-blue-900/10 border-blue-900/40' : 'bg-blue-50 border-blue-100') : (theme === 'dark' ? 'bg-[#0B0F19]/40 border-slate-800' : 'bg-white border-gray-100')}`}>
                  <div className="flex items-center gap-2 mb-3">
                    <img src={answer.author?.avatar || "https://i.pravatar.cc/40"} className="w-8 h-8 rounded-full" alt="ans-auth" />
                    <div className="flex flex-col">
                      <span className={`text-sm font-bold flex items-center gap-2 ${theme === 'dark' ? 'text-slate-200' : 'text-gray-800'}`}>
                        {answer.author?.name || 'Anonymous'}
                        {answer.isAI && <span className={`text-[10px] text-white px-1.5 py-0.5 rounded-full ${theme === 'dark' ? 'bg-blue-600' : 'bg-blue-600'}`}>AI Verified</span>}
                      </span>
                      <span className="text-[10px] text-gray-400">
                        {answer.createdAt ? new Date(answer.createdAt).toLocaleDateString() : answer.timestamp}
                      </span>
                    </div>

                    <div className="ml-auto relative">
                      <button
                        onClick={() => setOpenAnswerMenuId(openAnswerMenuId === ansId ? null : ansId)}
                        className="text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 p-2 rounded-full transition-colors"
                      >
                        <i className="fa-solid fa-ellipsis"></i>
                      </button>
                      {openAnswerMenuId === ansId && (
                        <div className={`absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 z-10 border ${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'
                          }`}>
                          {canDeleteAns && (
                            <button
                              onClick={() => {
                                handleDeleteAnswer(ansId);
                                setOpenAnswerMenuId(null);
                              }}
                              className="flex items-center gap-2 px-4 py-2 text-sm text-red-500 hover:bg-slate-100 dark:hover:bg-slate-700 w-full text-left"
                            >
                              <i className="fa-solid fa-trash-can"></i>
                              Delete Comment
                            </button>
                          )}
                          <button
                            onClick={() => setOpenAnswerMenuId(null)}
                            className={`flex items-center gap-2 px-4 py-2 text-sm w-full text-left ${theme === 'dark' ? 'text-blue-400 hover:bg-blue-900/20' : 'text-slate-700 hover:bg-slate-100'
                              }`}
                          >
                            <i className="fa-solid fa-share"></i>
                            Share
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className={`text-sm leading-relaxed mb-4 whitespace-pre-wrap ${theme === 'dark' ? 'text-slate-300' : 'text-gray-800'}`}>
                    {answer.content || answer.text}
                  </div>
                  <div className={`flex items-center gap-4 text-gray-400 border-t pt-3 ${theme === 'dark' ? 'border-slate-800' : 'border-gray-100'}`}>
                    <div className={`flex items-center gap-2 py-1 px-3 rounded-full cursor-pointer transition-colors ${theme === 'dark' ? 'hover:bg-blue-900/10 hover:text-blue-400' : 'hover:bg-gray-200'}`}>
                      <i className="fa-solid fa-arrow-up"></i>
                      <span className="text-xs font-bold">{answer.upvotes || 0}</span>
                    </div>
                    <i className={`fa-solid fa-arrow-down cursor-pointer p-2 rounded-full transition-colors ${theme === 'dark' ? 'hover:bg-rose-500/10 hover:text-rose-500' : 'hover:bg-gray-100'}`}></i>
                    <i className={`fa-regular fa-comment cursor-pointer p-2 rounded-full transition-colors ml-auto ${theme === 'dark' ? 'hover:bg-cyan-500/10 hover:text-cyan-400' : 'hover:bg-gray-100'}`}></i>
                    <i onClick={handleShare} className={`fa-solid fa-share cursor-pointer p-2 rounded-full transition-colors ${theme === 'dark' ? 'hover:text-[#ff00ff] hover:bg-[#ff00ff]/10' : 'hover:text-blue-500 hover:bg-gray-100'}`}></i>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <ExpertResolutionModal
        isOpen={isExpertModalOpen}
        onClose={() => setIsExpertModalOpen(false)}
        onSubmit={handleExpertResponse}
        theme={theme}
      />
    </div>
  );
};

export default QuestionDetail;
