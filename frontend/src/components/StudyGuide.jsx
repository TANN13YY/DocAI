import React, { useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import html2pdf from 'html2pdf.js';
import axios from 'axios';
import { Globe, Loader2, Quote, Lightbulb, CheckCircle2, Volume2, StopCircle, BrainCircuit } from 'lucide-react';
import { useToast } from '../context/ToastContext';
import { useTTS } from '../hooks/useTTS';
import QuizModal from './QuizModal';

const StudyGuide = React.forwardRef(({ content, onReset, isInWorkspace = false, isDarkMode = false, title = "Your Study Guide", showEmoji = true, showUploadButton = true, showTranslate = true, showListen = true, showQuiz = true }, ref) => {
    const contentRef = useRef(null);
    const { showToast } = useToast();
    const { speak, cancel, isSpeaking } = useTTS();
    const [isQuizOpen, setIsQuizOpen] = useState(false);
    const [currentLanguage, setCurrentLanguage] = useState('English');
    const [translations, setTranslations] = useState({ English: content });

    // Helper to strip markdown for TTS
    const handleSpeak = () => {
        if (isSpeaking) {
            cancel();
        } else {
            const text = translations[currentLanguage]
                .replace(/[#*`_~]/g, '') // Remove basic markdown symbols
                .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Remove links
                .replace(/^\s*[-+]\s+/gm, '') // Remove list bullets
                .replace(/\n+/g, ' '); // Replace newlines with spaces for smoother Android TTS

            // Pass the accurate lang code parameter to our TTS hook
            const langCode = currentLanguage === 'Hindi' ? 'hi-IN' : 'en-US';
            speak(text, langCode);
        }
    };
    const [isTranslating, setIsTranslating] = useState(false);
    const [isLanguageDropdownOpen, setIsLanguageDropdownOpen] = useState(false);

    // Initialize/Load translations from sessionStorage on mount or when content changes
    React.useEffect(() => {
        // Create a unique key for session storage based on a simple hash or just use a fixed key if we assume one active doc
        // Since we don't have a docId prop here easily, we'll clear storage if the content is different
        const storageKey = 'study_guide_translations';
        const savedData = sessionStorage.getItem(storageKey);

        if (savedData) {
            const parsed = JSON.parse(savedData);
            // Check if value for English matches current content (to ensure cache validity for this specific doc)
            if (parsed.English === content) {
                setTranslations(parsed);
                return;
            }
        }

        // Default/Reset state if no match or new content
        const initial = { English: content };
        setTranslations(initial);
        sessionStorage.setItem(storageKey, JSON.stringify(initial));
        setCurrentLanguage('English');
    }, [content]);

    const downloadPDF = () => {
        const element = contentRef.current;
        const opt = {
            margin: [10, 10, 10, 10],
            filename: 'study-guide.pdf',
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 1, useCORS: true, logging: true, letterRendering: true },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
        };

        html2pdf().from(element).set(opt).save()
            .catch(err => {
                console.error('PDF generation failed:', err);
                showToast('PDF generation failed.', 'error');
            });
    };

    React.useImperativeHandle(ref, () => ({
        downloadPDF
    }));

    const handleTranslate = async (language) => {
        setCurrentLanguage(language);

        // Check if translation exists in cache
        if (translations[language]) {
            return;
        }

        setIsTranslating(true);

        try {
            const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';
            const response = await axios.post(`${API_URL}/translate`, {
                text: content,
                target_language: language
            });

            const newTranslations = {
                ...translations,
                [language]: response.data.translated_text
            };

            setTranslations(newTranslations);
            sessionStorage.setItem('study_guide_translations', JSON.stringify(newTranslations));

        } catch (error) {
            console.error('Translation failed:', error);
            showToast('Translation failed. Please try again.', 'error');
            setCurrentLanguage('English'); // Revert on failure
        } finally {
            setIsTranslating(false);
        }
    };

    return (
        <div className={`w-full relative overflow-hidden ${isInWorkspace ? 'h-full flex flex-col' : 'min-h-screen py-10 px-4'}`}>

            {/* Liquid Background Elements */}
            <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-400 dark:bg-purple-900 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
                <div className="absolute top-0 right-1/4 w-96 h-96 bg-indigo-400 dark:bg-indigo-900 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
                <div className="absolute -bottom-32 left-1/3 w-96 h-96 bg-pink-400 dark:bg-pink-900 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>
                {/* Noise Overlay */}
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150"></div>
            </div>

            <div className={`relative z-10 w-full ${isInWorkspace ? 'h-full flex flex-col' : 'max-w-5xl mx-auto'}`}>
                <div className={`${isInWorkspace ? 'h-full flex flex-col bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl border-l border-white/20 dark:border-slate-700/50 shadow-2xl' : 'bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 dark:border-slate-700/50'} overflow-hidden`}>

                    {/* Header (Only for standalone view) */}
                    {!isInWorkspace && (
                        <div className="bg-white/30 dark:bg-slate-800/30 p-5 sm:p-8 flex justify-between items-center text-slate-800 dark:text-white relative border-b border-white/10 dark:border-slate-700/50">
                            <h2 className="text-3xl font-extrabold flex items-center relative z-10 tracking-tight">
                                {showEmoji && <span className="text-4xl mr-4 filter drop-shadow-md">✨</span>}
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-indigo-600 dark:from-violet-300 dark:to-indigo-300">
                                    {title}
                                </span>
                            </h2>
                            <div className="flex gap-3 relative z-10">
                                {showListen && (
                                    <button
                                        onClick={handleSpeak}
                                        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all backdrop-blur-md border border-white/20 shadow-sm hover:shadow-md transform hover:-translate-y-0.5 ${isSpeaking ? 'bg-red-500/80 hover:bg-red-600/80 text-white' : 'bg-white/40 hover:bg-white/60 dark:bg-slate-700/40 dark:hover:bg-slate-700/60 text-slate-700 dark:text-slate-200'}`}
                                    >
                                        {isSpeaking ? <StopCircle className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                                        <span>{isSpeaking ? 'Stop' : 'Listen'}</span>
                                    </button>
                                )}
                                {showQuiz && (
                                    <button
                                        onClick={() => setIsQuizOpen(true)}
                                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all backdrop-blur-md border border-white/20 shadow-sm hover:shadow-md transform hover:-translate-y-0.5 bg-white/40 hover:bg-white/60 dark:bg-slate-700/40 dark:hover:bg-slate-700/60 text-slate-700 dark:text-slate-200"
                                    >
                                        <BrainCircuit className="w-4 h-4" />
                                        <span>Quiz</span>
                                    </button>
                                )}
                                {showUploadButton && (
                                    <button
                                        onClick={onReset}
                                        className="px-5 py-2.5 bg-white/40 hover:bg-white/60 dark:bg-slate-700/40 dark:hover:bg-slate-700/60 rounded-xl text-sm font-semibold transition-all backdrop-blur-md border border-white/20 shadow-sm hover:shadow-md transform hover:-translate-y-0.5"
                                    >
                                        Upload New PDF
                                    </button>
                                )}
                            </div>
                        </div>
                    )}

                    <div className="flex justify-end pt-4 px-4 sm:px-8 mb-2 z-20 gap-3">
                        {showListen && (
                            <button
                                onClick={handleSpeak}
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all border border-slate-200/50 dark:border-slate-700/50 backdrop-blur-sm ${isSpeaking ? 'bg-red-500 text-white hover:bg-red-600' : 'bg-white/50 dark:bg-slate-800/50 hover:bg-white/70 dark:hover:bg-slate-800/70 text-slate-700 dark:text-slate-200'}`}
                            >
                                {isSpeaking ? <StopCircle className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                                <span className="hidden sm:inline">{isSpeaking ? 'Stop Reading' : 'Read Summary'}</span>
                            </button>
                        )}

                        {showQuiz && (
                            <button
                                onClick={() => setIsQuizOpen(true)}
                                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all border border-slate-200/50 dark:border-slate-700/50 backdrop-blur-sm bg-white/50 dark:bg-slate-800/50 hover:bg-white/70 dark:hover:bg-slate-800/70 text-slate-700 dark:text-slate-200"
                            >
                                <BrainCircuit className="w-4 h-4" />
                                <span className="hidden sm:inline">Take Quiz</span>
                            </button>
                        )}

                        <div className="relative">
                            {/* Overlay to close dropdown when clicking outside */}
                            {isLanguageDropdownOpen && (
                                <div className="fixed inset-0 z-40" onClick={() => setIsLanguageDropdownOpen(false)}></div>
                            )}

                            {showTranslate && (
                                <button
                                    onClick={() => setIsLanguageDropdownOpen(!isLanguageDropdownOpen)}
                                    disabled={isTranslating}
                                    className="flex items-center gap-2 pl-3 pr-4 py-2 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm border border-slate-200/50 dark:border-slate-700/50 rounded-lg text-sm text-slate-700 dark:text-slate-200 hover:bg-white/70 dark:hover:bg-slate-800/70 transition-all disabled:opacity-50 relative z-50 min-w-[140px] justify-between"
                                >
                                    <div className="flex items-center gap-3">
                                        {currentLanguage === 'English' ? (
                                            <>
                                                <img src="https://flagcdn.com/w20/us.png" alt="US" className="w-5 h-3.5 object-cover rounded-[2px] shadow-sm" />
                                                <span>English</span>
                                            </>
                                        ) : (
                                            <>
                                                <img src="https://flagcdn.com/w20/in.png" alt="IN" className="w-5 h-3.5 object-cover rounded-[2px] shadow-sm" />
                                                <span>Hindi</span>
                                            </>
                                        )}
                                    </div>
                                    <svg className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${isLanguageDropdownOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </button>
                            )}

                            {isLanguageDropdownOpen && (
                                <div className="absolute right-0 mt-2 w-full bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden z-50 animate-fade-in origin-top-right">
                                    <button
                                        onClick={() => {
                                            handleTranslate('English');
                                            setIsLanguageDropdownOpen(false);
                                        }}
                                        className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors ${currentLanguage === 'English' ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 font-medium' : 'text-slate-700 dark:text-slate-200'}`}
                                    >
                                        <img src="https://flagcdn.com/w20/us.png" alt="US" className="w-5 h-3.5 object-cover rounded-[2px] shadow-sm" />
                                        <span>English</span>
                                    </button>
                                    <button
                                        onClick={() => {
                                            handleTranslate('Hindi');
                                            setIsLanguageDropdownOpen(false);
                                        }}
                                        className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors ${currentLanguage === 'Hindi' ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 font-medium' : 'text-slate-700 dark:text-slate-200'}`}
                                    >
                                        <img src="https://flagcdn.com/w20/in.png" alt="IN" className="w-5 h-3.5 object-cover rounded-[2px] shadow-sm" />
                                        <span>Hindi</span>
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Content Area */}
                    <div ref={contentRef} className={`p-4 sm:p-6 md:p-12 prose prose-lg prose-slate dark:prose-invert max-w-none transition-colors duration-200 ${isInWorkspace ? 'overflow-y-auto flex-1 custom-scrollbar bg-transparent' : 'bg-transparent'}`}>

                        {isTranslating ? (
                            <div className="flex flex-col items-center justify-center py-32 text-slate-400">
                                <div className="relative">
                                    <div className="absolute inset-0 bg-indigo-500 blur-xl opacity-20 animate-pulse"></div>
                                    <Loader2 className="w-12 h-12 animate-spin text-indigo-500 mb-6 relative z-10" />
                                </div>
                                <p className="text-lg font-medium text-slate-600 dark:text-slate-300 animate-pulse">
                                    Translating to {currentLanguage}...
                                </p>
                            </div>
                        ) : (
                            <div className="relative z-10">
                                <MarkdownContent content={translations[currentLanguage]} />
                            </div>
                        )}
                    </div>
                </div>

                {!isInWorkspace && (
                    <div className="py-8 text-center relative z-10">
                        <p className="text-slate-500/80 dark:text-slate-400/80 text-sm font-medium flex items-center justify-center gap-2">
                            <span>Designed for Excellence</span>
                            <span className="w-1 h-1 rounded-full bg-slate-400/50 dark:bg-slate-600/50"></span>
                            <span>AI Powered</span>
                        </p>
                    </div>
                )}
            </div>
            {/* Quiz Modal */}
            <QuizModal
                isOpen={isQuizOpen}
                onClose={() => setIsQuizOpen(false)}
                docId={JSON.parse(sessionStorage.getItem('doc_ai_session') || '{}').docId}
                content={translations[currentLanguage]}
            />
        </div>
    );
});

const MarkdownContent = React.memo(({ content }) => {
    return (
        <ReactMarkdown
            components={{
                h1: ({ node, ...props }) => (
                    <div className="relative mb-12 mt-4 text-center">
                        <h1 className="text-4xl md:text-5xl font-black text-slate-800 dark:text-white pb-4 inline-block tracking-tight drop-shadow-sm" {...props} />
                        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-24 h-1.5 bg-gradient-to-r from-violet-500/50 to-purple-500/50 rounded-full backdrop-blur-sm"></div>
                    </div>
                ),
                h2: ({ node, ...props }) => (
                    <div className="mt-12 mb-6 group">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="p-1.5 rounded-lg bg-indigo-100/50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-300 backdrop-blur-sm shadow-sm ring-1 ring-white/20">
                                <Lightbulb className="w-5 h-5" />
                            </div>
                            <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 m-0 border-b-0" {...props} />
                        </div>
                        <div className="h-px bg-gradient-to-r from-indigo-500/30 via-slate-400/20 to-transparent w-full"></div>
                    </div>
                ),
                h3: ({ node, ...props }) => (
                    <h3 className="text-xl font-bold text-slate-700 dark:text-slate-200 mt-8 mb-3 pl-4 border-l-4 border-purple-400/50 dark:border-purple-500/50" {...props} />
                ),
                p: ({ node, ...props }) => (
                    <p className="leading-relaxed mb-6 text-slate-700 dark:text-slate-200 font-normal text-[1.05rem]" {...props} />
                ),
                ul: ({ node, ...props }) => (
                    <ul className="space-y-3 mb-8 ml-2" {...props} />
                ),
                ol: ({ node, ...props }) => (
                    <ol className="list-decimal pl-6 space-y-3 mb-8 marker:text-indigo-500 marker:font-bold text-slate-700 dark:text-slate-200" {...props} />
                ),
                li: ({ node, ...props }) => (
                    <li className="flex gap-2 items-start text-slate-700 dark:text-slate-200">
                        {/* Heuristic: if parent is UL, show check icon unless nested */}
                        {node.position?.start.column > 1 ? (
                            <span className="mt-1.5 mr-2 text-indigo-500 opacity-60">•</span>
                        ) : (
                            <CheckCircle2 className="w-5 h-5 text-emerald-500/80 mt-0.5 flex-shrink-0 filter drop-shadow-sm" strokeWidth={2.5} />
                        )}
                        <span className="flex-1">{props.children}</span>
                    </li>
                ),
                strong: ({ node, ...props }) => (
                    <span className="font-bold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-900/30 px-1 rounded mx-0.5" {...props} />
                ),
                blockquote: ({ node, ...props }) => (
                    <div className="relative my-8 group">
                        <div className="absolute -left-2 -top-2 text-indigo-300/50 dark:text-indigo-600/50 transform -scale-x-100">
                            <Quote className="w-10 h-10" />
                        </div>
                        <blockquote className="relative p-6 bg-white/40 dark:bg-slate-800/40 rounded-xl border border-white/40 dark:border-white/10 shadow-lg backdrop-blur-md italic text-slate-700 dark:text-slate-300" {...props} />
                    </div>
                ),
                code: ({ node, inline, className, children, ...props }) => {
                    const match = /language-(\w+)/.exec(className || '');
                    // Handle cases where children might not be string (e.g. array of strings)
                    const contentStr = String(children).replace(/\n$/, '');
                    const isShort = contentStr.length < 40 && !contentStr.includes('\n');

                    if (isShort || inline) {
                        return (
                            <code className="bg-slate-100 dark:bg-slate-700/50 px-1.5 py-0.5 rounded-md text-sm text-pink-600 dark:text-pink-400 font-mono font-medium border border-slate-200 dark:border-slate-600/50 mx-0.5 break-words inline-block align-middle" {...props}>
                                {children}
                            </code>
                        );
                    }

                    return (
                        <div className="relative group my-6">
                            <div className="absolute -inset-0.5 bg-gradient-to-r from-pink-600 to-purple-600 rounded-lg blur opacity-20 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
                            <pre className="relative bg-slate-900/90 text-slate-50 p-6 rounded-lg overflow-x-auto shadow-2xl border border-slate-700/50 backdrop-blur-xl">
                                <div className="flex justify-between items-center mb-2 pb-2 border-b border-slate-700/50">
                                    <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Code Snippet</span>
                                    <div className="flex gap-1.5">
                                        <div className="w-2.5 h-2.5 rounded-full bg-red-500/80"></div>
                                        <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/80"></div>
                                        <div className="w-2.5 h-2.5 rounded-full bg-green-500/80"></div>
                                    </div>
                                </div>
                                <code className={`${className} text-sm font-mono leading-relaxed`} {...props}>
                                    {contentStr}
                                </code>
                            </pre>
                        </div>
                    );
                }
            }}
        >
            {content}
        </ReactMarkdown>
    );
});

export default StudyGuide;
