import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Question, Answer, User } from '../types';
import axios from 'axios';
import { useAuth } from '@clerk/clerk-react';

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

  const question = questions.find(q => q.id === id || q._id === id);

  if (!question) {
    return (
      <div className={`p-8 rounded-lg shadow-sm text-center ${theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-200'} border mt-20`}>
        <p className={theme === 'dark' ? 'text-white' : 'text-slate-900'}>Question not found.</p>
        <button onClick={() => navigate('/')} className="mt-4 text-blue-600 font-medium">Back to Home</button>
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

  const handleExpertResponse = async () => {
    if (!expertResponseText.trim() || !currentUser || currentUser.role !== 'expert') return;

    try {
      const token = await getToken();
      const response = await axios.put(
        `${import.meta.env.VITE_API_URL}/api/questions/${question._id || question.id}/respond`,
        { response: expertResponseText },
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

  return (
    <div className="flex flex-col gap-4 max-w-4xl mx-auto pt-20 px-4">
      <div className={`rounded-lg border shadow-sm p-6 ${theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-200'}`}>
        <div className="flex items-center gap-2 mb-4">
          <img src={question.author?.avatar || "https://i.pravatar.cc/40"} alt="author" className="w-10 h-10 rounded-full" />
          <div className="flex flex-col">
            <span className={`font-bold ${theme === 'dark' ? 'text-slate-200' : 'text-gray-800'}`}>{question.author?.name || 'Anonymous'}</span>
            <span className="text-xs text-gray-500">
              {question.createdAt ? new Date(question.createdAt).toLocaleDateString() : 'Just now'} in {question.topic}
            </span>
          </div>
          {question.category && (
            <span className="ml-auto bg-blue-100 text-blue-700 text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider">
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
              <div className={`absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 z-10 border ${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'
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
                  onClick={() => setIsQuestionMenuOpen(false)}
                  className={`flex items-center gap-2 px-4 py-2 text-sm w-full text-left ${theme === 'dark' ? 'text-slate-300 hover:bg-slate-700' : 'text-slate-700 hover:bg-slate-100'
                    }`}
                >
                  <i className="fa-solid fa-share"></i>
                  Share
                </button>
              </div>
            )}
          </div>
        </div>

        <h1 className={`text-2xl font-bold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{question.title}</h1>
        {question.content && <p className={`mb-6 whitespace-pre-wrap ${theme === 'dark' ? 'text-slate-300' : 'text-gray-800'}`}>{question.content}</p>}
        {question.imageUrl && <img src={question.imageUrl} className="w-full rounded-lg mb-6 shadow-sm border border-slate-800" alt="main" />}

        {/* Expert Response Section */}
        {question.expertResponse && (
          <div className={`mb-6 p-4 rounded-lg border-l-4 border-green-500 ${theme === 'dark' ? 'bg-green-950/20 border-green-900/40 text-green-100' : 'bg-green-50 border-green-100 text-green-900'}`}>
            <h4 className="text-xs font-bold uppercase tracking-widest mb-2 flex items-center gap-2">
              <i className="fa-solid fa-user-check"></i> Expert Response
            </h4>
            <p className="text-sm leading-relaxed">{question.expertResponse}</p>
          </div>
        )}

        <div className={`flex items-center gap-3 border-b pb-6 ${theme === 'dark' ? 'border-slate-800' : 'border-gray-100'}`}>
          <button
            disabled={isGenerating}
            className={`flex items-center gap-2 bg-blue-50 text-blue-700 px-5 py-2 rounded-full font-semibold transition-all shadow-sm ${isGenerating ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-100'}`}
          >
            {isGenerating ? <i className="fa-solid fa-spinner fa-spin"></i> : <i className="fa-solid fa-sparkles"></i>}
            {isGenerating ? 'Thinking...' : 'Get AI Answer'}
          </button>

          <div className="flex items-center gap-4 ml-auto text-gray-400">
            <i className="fa-solid fa-share cursor-pointer hover:text-gray-600"></i>
          </div>
        </div>

        {/* Expert Response Input */}
        {currentUser?.role === 'expert' && !question.expertResponse && (
          <div className={`mt-8 p-6 rounded-xl border ${theme === 'dark' ? 'bg-slate-800/40 border-slate-700' : 'bg-blue-50/50 border-blue-100'}`}>
            <h3 className={`font-bold text-lg mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Provide Expert Resolution</h3>
            <textarea
              className={`w-full border rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 transition-all ${theme === 'dark' ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-gray-200'}`}
              placeholder="As an expert, provide a definitive answer for this issue..."
              rows={4}
              value={expertResponseText}
              onChange={(e) => setExpertResponseText(e.target.value)}
            ></textarea>
            <div className="flex justify-end mt-2">
              <button
                onClick={handleExpertResponse}
                className="bg-green-600 text-white px-6 py-2 rounded-full font-semibold hover:bg-green-700 transition-colors"
              >
                Submit Resolution
              </button>
            </div>
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
                  className={`w-full border rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${theme === 'dark' ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-gray-200'}`}
                  placeholder="Share your perspective..."
                  rows={4}
                  value={answerContent}
                  onChange={(e) => setAnswerContent(e.target.value)}
                ></textarea>
                <div className="flex justify-end mt-2">
                  <button onClick={handleSubmitAnswer} className="bg-blue-600 text-white px-6 py-2 rounded-full font-semibold hover:bg-blue-700 transition-colors">
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
                <div key={ansId} className={`p-4 rounded-xl border ${answer.isAI ? (theme === 'dark' ? 'bg-blue-900/20 border-blue-900/40' : 'bg-blue-50 border-blue-100') : (theme === 'dark' ? 'bg-slate-800/40 border-slate-700' : 'bg-white border-gray-100')}`}>
                  <div className="flex items-center gap-2 mb-3">
                    <img src={answer.author?.avatar || "https://i.pravatar.cc/40"} className="w-8 h-8 rounded-full" alt="ans-auth" />
                    <div className="flex flex-col">
                      <span className={`text-sm font-bold flex items-center gap-2 ${theme === 'dark' ? 'text-slate-200' : 'text-gray-800'}`}>
                        {answer.author?.name || 'Anonymous'}
                        {answer.isAI && <span className="text-[10px] bg-blue-600 text-white px-1.5 py-0.5 rounded-full">AI Verified</span>}
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
                            className={`flex items-center gap-2 px-4 py-2 text-sm w-full text-left ${theme === 'dark' ? 'text-slate-300 hover:bg-slate-700' : 'text-slate-700 hover:bg-slate-100'
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
                    <div className="flex items-center gap-2 hover:bg-gray-200 py-1 px-3 rounded-full cursor-pointer transition-colors">
                      <i className="fa-solid fa-arrow-up"></i>
                      <span className="text-xs font-bold">{answer.upvotes || 0}</span>
                    </div>
                    <i className="fa-solid fa-arrow-down cursor-pointer hover:bg-gray-100 p-2 rounded-full transition-colors"></i>
                    <i className="fa-regular fa-comment cursor-pointer hover:bg-gray-100 p-2 rounded-full transition-colors ml-auto"></i>
                    <i className="fa-solid fa-share cursor-pointer hover:bg-gray-100 p-2 rounded-full transition-colors"></i>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuestionDetail;
