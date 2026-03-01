
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Question, Answer } from '../types';
// import { generateAIAnswer } from '../services/geminiService';
import { currentUser } from '../data/mockData';

interface QuestionDetailProps {
  questions: Question[];
  onUpdate: (q: Question) => void;
}

const QuestionDetail: React.FC<QuestionDetailProps> = ({ questions, onUpdate }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isGenerating, setIsGenerating] = useState(false);
  const [answerContent, setAnswerContent] = useState('');

  const question = questions.find(q => q.id === id);

  if (!question) {
    return (
      <div className="bg-white p-8 rounded-lg shadow-sm text-center">
        <p>Question not found.</p>
        <button onClick={() => navigate('/')} className="mt-4 text-blue-600 font-medium">Back to Home</button>
      </div>
    );
  }

  // const handleAIAnswer = async () => {
  //   setIsGenerating(true);
  //   try {
  //     const { text, sources } = await generateAIAnswer(question.title, question.content);
  //     const newAnswer: Answer = {
  //       id: `ai-${Date.now()}`,
  //       author: {
  //         id: 'ai-bot',
  //         name: 'Gemini AI Advisor',
  //         avatar: 'https://www.gstatic.com/lamda/images/favicon_v1_150160d1398251f24d33.png',
  //       },
  //       content: text,
  //       upvotes: 0,
  //       timestamp: 'Just now',
  //       isAI: true,
  //       sources,
  //     };

  //     onUpdate({
  //       ...question,
  //       answers: [newAnswer, ...question.answers]
  //     });
  //   } catch (error) {
  //     alert("Failed to generate AI answer. Please try again.");
  //   } finally {
  //     setIsGenerating(false);
  //   }
  // };

  const handleSubmitAnswer = () => {
    if (!answerContent.trim()) return;

    const newAnswer: Answer = {
      id: `ans-${Date.now()}`,
      author: currentUser,
      content: answerContent,
      upvotes: 0,
      timestamp: 'Just now',
    };

    onUpdate({
      ...question,
      answers: [...question.answers, newAnswer]
    });
    setAnswerContent('');
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
        <div className="flex items-center gap-2 mb-4">
          <img src={question.author?.avatar || "https://i.pravatar.cc/40"} alt="author" className="w-10 h-10 rounded-full" />
          <div className="flex flex-col">
            <span className="font-bold text-gray-800">{question.author?.name || 'Anonymous'}</span>
            <span className="text-xs text-gray-500">{question.timestamp} in {question.topic}</span>
          </div>
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-4">{question.title}</h1>
        {question.content && <p className="text-gray-800 mb-6 whitespace-pre-wrap">{question.content}</p>}
        {question.imageUrl && <img src={question.imageUrl} className="w-full rounded-lg mb-6 shadow-sm border" alt="main" />}

        <div className="flex items-center gap-3 border-b pb-6">
          <button
            // onClick={handleAIAnswer}
            disabled={isGenerating}
            className={`flex items-center gap-2 bg-blue-50 text-blue-700 px-5 py-2 rounded-full font-semibold transition-all shadow-sm ${isGenerating ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-100'}`}
          >
            {isGenerating ? (
              <i className="fa-solid fa-spinner fa-spin"></i>
            ) : (
              <i className="fa-solid fa-sparkles"></i>
            )}
            {isGenerating ? 'Thinking...' : 'Get AI Answer'}
          </button>

          <button className="flex items-center gap-2 bg-gray-100 text-gray-700 px-5 py-2 rounded-full font-semibold hover:bg-gray-200 transition-all">
            <i className="fa-solid fa-pen-nib"></i>
            Answer
          </button>

          <div className="flex items-center gap-4 ml-auto text-gray-400">
            <i className="fa-solid fa-share cursor-pointer hover:text-gray-600"></i>
            <i className="fa-solid fa-ellipsis cursor-pointer hover:text-gray-600"></i>
          </div>
        </div>

        <div className="mt-8">
          <h3 className="font-bold text-lg mb-4">{question.answers?.length || 0} Answers</h3>

          <div className="flex gap-4 mb-8">
            <img src={currentUser?.avatar || "https://i.pravatar.cc/40"} className="w-10 h-10 rounded-full" alt="me" />
            <div className="flex-1">
              <textarea
                className="w-full border border-gray-200 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                placeholder="Write your answer..."
                rows={4}
                value={answerContent}
                onChange={(e) => setAnswerContent(e.target.value)}
              ></textarea>
              <div className="flex justify-end mt-2">
                <button
                  onClick={handleSubmitAnswer}
                  className="bg-blue-600 text-white px-6 py-2 rounded-full font-semibold hover:bg-blue-700 transition-colors"
                >
                  Post Answer
                </button>
              </div>
            </div>
          </div>

          <div className="space-y-8">
            {question.answers.map(answer => (
              <div key={answer.id} className={`p-4 rounded-xl border ${answer.isAI ? 'bg-blue-50 border-blue-100' : 'bg-white border-gray-100'}`}>
                <div className="flex items-center gap-2 mb-3">
                  <img src={answer.author?.avatar || "https://i.pravatar.cc/40"} className="w-8 h-8 rounded-full" alt="ans-auth" />
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-gray-800 flex items-center gap-2">
                      {answer.author?.name || 'Anonymous'}
                      {answer.isAI && <span className="text-[10px] bg-blue-600 text-white px-1.5 py-0.5 rounded-full">AI Verified</span>}
                    </span>
                    <span className="text-[10px] text-gray-400">{answer.timestamp}</span>
                  </div>
                </div>
                <div className="text-gray-800 text-sm leading-relaxed mb-4 whitespace-pre-wrap">
                  {answer.content}
                </div>
                {answer.sources && answer.sources.length > 0 && (
                  <div className="mb-4">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Sources Referenced</p>
                    <div className="flex flex-wrap gap-2">
                      {answer.sources.map((src, i) => (
                        <a
                          key={i}
                          href={src.uri}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[11px] bg-white border border-blue-200 text-blue-600 px-3 py-1 rounded-full hover:bg-blue-50 transition-colors"
                        >
                          {src.title}
                        </a>
                      ))}
                    </div>
                  </div>
                )}
                <div className="flex items-center gap-4 text-gray-400 border-t border-gray-100 pt-3">
                  <div className="flex items-center gap-2 hover:bg-gray-200 py-1 px-3 rounded-full cursor-pointer transition-colors">
                    <i className="fa-solid fa-arrow-up"></i>
                    <span className="text-xs font-bold">{answer.upvotes}</span>
                  </div>
                  <i className="fa-solid fa-arrow-down cursor-pointer hover:bg-gray-100 p-2 rounded-full transition-colors"></i>
                  <i className="fa-regular fa-comment cursor-pointer hover:bg-gray-100 p-2 rounded-full transition-colors ml-auto"></i>
                  <i className="fa-solid fa-share cursor-pointer hover:bg-gray-100 p-2 rounded-full transition-colors"></i>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuestionDetail;
