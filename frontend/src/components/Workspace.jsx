import React, { useState, useRef } from 'react';
import StudyGuide from './StudyGuide';
import { ArrowLeft, Loader2, Moon, Sun, Minimize2, Share2, Download } from 'lucide-react';
import axios from 'axios';
import ChatInterface from './ChatInterface';
import { useToast } from '../context/ToastContext';

const Workspace = ({ file, summary, isLoading, onBack, isDarkMode, toggleTheme, docId }) => {
    const [readMode, setReadMode] = useState(false);
    const { showToast } = useToast();
    const studyGuideRef = useRef(null);

    const handleDownload = () => {
        if (studyGuideRef.current) {
            studyGuideRef.current.downloadPDF();
        }
    };

    const handleShare = async () => {
        try {
            const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';
            const response = await axios.post(`${API_URL}/share`, {
                content: summary
            });
            const shareUrl = `${window.location.origin}/share/${response.data.share_id}`;
            navigator.clipboard.writeText(shareUrl);

            showToast('Link copied to clipboard');
        } catch (error) {
            console.error('Sharing failed:', error);
            showToast('Failed to generate share link.', 'error');
        }
    };

    return (
        <div className="flex flex-col h-screen bg-slate-50 dark:bg-slate-900 transition-colors duration-200 relative">
            {/* Toast Notification */}
            {/* Header - Hidden in Read Mode */}
            {!readMode && (
                <header className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 px-6 py-4 flex items-center justify-between shadow-sm z-10">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={onBack}
                            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg text-slate-500 dark:text-slate-400 transition-colors"
                            title="Back to Home"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </button>
                        <div>
                            <h1 className="font-bold text-slate-800 dark:text-white truncate max-w-md">
                                {file ? file.name : 'Document'}
                            </h1>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                AI Generated Study Guide
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={toggleTheme}
                            className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400 transition-colors"
                            title="Toggle Theme"
                        >
                            {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                        </button>

                        {summary && (
                            <>
                                {/* Share Button */}
                                <button
                                    onClick={handleShare}
                                    className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
                                >
                                    <Share2 className="w-4 h-4" />
                                    Share
                                </button>

                                {/* Download Button */}
                                <button
                                    onClick={handleDownload}
                                    className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
                                >
                                    <Download className="w-4 h-4" />
                                    Download
                                </button>
                            </>
                        )}

                        <button
                            onClick={() => setReadMode(true)}
                            className="px-3 py-1 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/30 dark:hover:bg-blue-900/50 text-blue-600 dark:text-blue-400 text-xs font-semibold rounded-full border border-blue-100 dark:border-blue-800 transition-colors cursor-pointer"
                        >
                            Read Mode
                        </button>
                    </div>
                </header>
            )}

            {/* Read Mode Exit Button */}
            {readMode && (
                <button
                    onClick={() => setReadMode(false)}
                    className="fixed top-4 right-4 z-50 p-2 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-slate-200 dark:border-slate-700 rounded-full shadow-lg text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-all animate-fade-in"
                    title="Exit Read Mode"
                >
                    <Minimize2 className="w-5 h-5" />
                </button>
            )}

            {/* Main Layout */}
            <div className={`flex-1 overflow-y-auto bg-slate-50 dark:bg-slate-900 p-4 relative ${readMode ? 'pt-8' : ''}`}>
                <div className={`mx-auto h-full transition-all duration-300 ${readMode ? 'max-w-5xl' : 'max-w-4xl'}`}>
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center h-full text-slate-400 dark:text-slate-500">
                            <Loader2 className="w-12 h-12 animate-spin text-blue-500 mb-6" />
                            <h3 className="text-xl font-semibold text-slate-700 dark:text-slate-300 mb-2">Analyzing your document...</h3>
                            <p className="text-slate-500 dark:text-slate-400 text-center max-w-md">
                                Our AI is reading {file ? 'the entire' : ''} PDF, extracting key concepts, and generating your study guide. This usually takes 1-2 minutes for large files.
                            </p>
                        </div>
                    ) : summary ? (
                        <StudyGuide ref={studyGuideRef} content={summary} onReset={null} isInWorkspace={true} isDarkMode={isDarkMode} />
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full text-slate-300 dark:text-slate-600">
                            <p>Waiting for content...</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Chat Interface */}
            {summary && <ChatInterface docId={docId} />}
        </div>
    );
};

export default Workspace;
