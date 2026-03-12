import React, { useState } from 'react';
import { createPortal } from 'react-dom';

interface ExpertResolutionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (response: string) => void;
    theme: 'light' | 'dark';
}

const ExpertResolutionModal: React.FC<ExpertResolutionModalProps> = ({ isOpen, onClose, onSubmit, theme }) => {
    const [response, setResponse] = useState('');

    if (!isOpen) return null;

    return createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 overflow-hidden">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-slate-950/60 backdrop-blur-md animate-fade-in"
                onClick={onClose}
            ></div>

            {/* Modal Content */}
            <div className={`relative w-full max-w-lg rounded-[2.5rem] overflow-hidden shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)] animate-scale-in border ${theme === 'dark' ? 'bg-slate-900/90 border-slate-700/50' : 'bg-white/95 border-slate-200'
                } backdrop-blur-xl`}>

                {/* Accent Line */}
                <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500"></div>

                <div className="p-8">
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-green-500/10 rounded-2xl flex items-center justify-center text-green-500 border border-green-500/20">
                                <i className="fa-solid fa-user-shield text-xl"></i>
                            </div>
                            <div>
                                <h2 className={`text-2xl font-black font-outfit leading-none mb-1 ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                                    Post Solution
                                </h2>
                                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-green-500/80">Expert Mode Active</p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className={`w-10 h-10 flex items-center justify-center rounded-2xl transition-all ${theme === 'dark' ? 'hover:bg-slate-800 text-slate-500' : 'hover:bg-slate-100 text-slate-400'
                                }`}
                        >
                            <i className="fa-solid fa-xmark"></i>
                        </button>
                    </div>

                    <div className={`p-4 rounded-2xl mb-6 text-sm leading-relaxed border flex gap-3 ${theme === 'dark' ? 'bg-slate-950/50 border-slate-800 text-slate-400' : 'bg-slate-50 border-slate-200 text-slate-600'
                        }`}>
                        <i className="fa-solid fa-circle-info text-blue-500 mt-0.5"></i>
                        <p>Your resolution will be pinned as the official community solution for this issue.</p>
                    </div>

                    <textarea
                        className={`w-full p-5 rounded-[2rem] border text-base focus:outline-none focus:ring-4 focus:ring-green-500/20 focus:border-green-500 transition-all min-h-[200px] leading-relaxed ${theme === 'dark'
                            ? 'bg-slate-950/80 border-slate-700 text-white placeholder-slate-700'
                            : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400'
                            }`}
                        placeholder="Detail your definitive solution..."
                        value={response}
                        onChange={(e) => setResponse(e.target.value)}
                        autoFocus
                    ></textarea>

                    <div className="flex gap-4 mt-8">
                        <button
                            onClick={onClose}
                            className={`flex-1 py-4 font-black rounded-2xl transition-all text-sm uppercase tracking-widest ${theme === 'dark'
                                ? 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white'
                                : 'bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-800'
                                }`}
                        >
                            Cancel
                        </button>
                        <button
                            onClick={() => {
                                if (!response.trim()) {
                                    alert("Please describe your solution before posting.");
                                    return;
                                }
                                onSubmit(response);
                                setResponse('');
                                onClose();
                            }}
                            className="flex-[2] py-4 bg-gradient-to-br from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-black rounded-2xl transition-all shadow-xl shadow-green-500/20 transform hover:-translate-y-1 active:scale-[0.98] text-sm uppercase tracking-widest flex items-center justify-center gap-2"
                        >
                            <i className="fa-solid fa-paper-plane"></i>
                            Post Solution
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
                    from { opacity: 0; transform: scale(0.95) translateY(10px); }
                    to { opacity: 1; transform: scale(1) translateY(0); }
                }
                .animate-fade-in { animation: fade-in 0.3s ease-out forwards; }
                .animate-scale-in { animation: scale-in 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards; }
            `}</style>
        </div>,
        document.body
    );
};

export default ExpertResolutionModal;
