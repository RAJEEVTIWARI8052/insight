import React, { useState } from 'react';

interface ExpertResolutionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (response: string) => void;
    theme: 'light' | 'dark';
}

const ExpertResolutionModal: React.FC<ExpertResolutionModalProps> = ({ isOpen, onClose, onSubmit, theme }) => {
    const [response, setResponse] = useState('');

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm animate-fade-in"
                onClick={onClose}
            ></div>

            {/* Modal Content */}
            <div className={`relative w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl animate-scale-in border ${theme === 'dark' ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200'
                }`}>
                <div className="p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className={`text-xl font-black font-outfit ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                            Provide Expert Resolution
                        </h2>
                        <button
                            onClick={onClose}
                            className="w-10 h-10 flex items-center justify-center rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        >
                            <i className="fa-solid fa-xmark text-slate-400"></i>
                        </button>
                    </div>

                    <p className={`text-sm mb-4 leading-relaxed ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
                        As a verified expert, your resolution will be pinned to the top of this issue and marked as the definitive answer for the community.
                    </p>

                    <textarea
                        className={`w-full p-4 rounded-2xl border text-sm focus:outline-none focus:ring-4 focus:ring-green-500/20 focus:border-green-500 transition-all min-h-[160px] ${theme === 'dark'
                                ? 'bg-slate-950 border-slate-700 text-white placeholder-slate-600'
                                : 'bg-slate-50 border-slate-200 text-slate-900'
                            }`}
                        placeholder="Write your definitive solution here..."
                        value={response}
                        onChange={(e) => setResponse(e.target.value)}
                    ></textarea>

                    <div className="flex gap-3 mt-6">
                        <button
                            onClick={onClose}
                            className={`flex-1 py-3 font-bold rounded-2xl transition-all ${theme === 'dark'
                                    ? 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                }`}
                        >
                            Cancel
                        </button>
                        <button
                            onClick={() => {
                                if (response.trim()) {
                                    onSubmit(response);
                                    setResponse('');
                                    onClose();
                                }
                            }}
                            disabled={!response.trim()}
                            className="flex-3 px-8 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold rounded-2xl transition-all shadow-lg shadow-green-500/20 disabled:opacity-50 disabled:cursor-not-allowed transform hover:-translate-y-0.5 active:translate-y-0"
                        >
                            Post Resolution
                        </button>
                    </div>
                </div>
            </div>

            <style>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scale-in {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-fade-in { animation: fade-in 0.3s ease-out; }
        .animate-scale-in { animation: scale-in 0.3s cubic-bezier(0.34, 1.56, 0.64, 1); }
      `}</style>
        </div>
    );
};

export default ExpertResolutionModal;
