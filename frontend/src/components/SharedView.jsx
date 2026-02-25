import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import StudyGuide from './StudyGuide';
import { Loader2, ArrowLeft, FileText, Sun, Moon } from 'lucide-react';

const SharedView = ({ isDarkMode, toggleTheme }) => {
    const { id } = useParams();
    const [content, setContent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchSharedContent = async () => {
            try {
                const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';
                const response = await fetch(`${API_URL}/share/${id}`);
                if (!response.ok) {
                    throw new Error('Summary not found');
                }
                const data = await response.json();
                setContent(data.content);
            } catch (err) {
                console.error('Error fetching shared content:', err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchSharedContent();
        }
    }, [id]);

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
                <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col items-center justify-center text-slate-800 dark:text-slate-100">
                <h2 className="text-2xl font-bold mb-4">Oops!</h2>
                <p className="mb-6">{error}</p>
                <Link to="/" className="text-blue-600 hover:underline flex items-center">
                    <ArrowLeft className="w-4 h-4 mr-2" /> Go Home
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 font-sans transition-colors duration-200 selection:bg-blue-100 dark:selection:bg-blue-900">
            {/* Subtle Grid Background */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
                <div className="absolute left-0 right-0 top-0 -z-10 m-auto h-[310px] w-[310px] rounded-full bg-blue-400 opacity-20 blur-[100px] dark:bg-blue-600"></div>
            </div>

            {/* Navbar with Glassmorphism */}
            <nav className="fixed top-0 left-0 right-0 z-50 flex justify-between items-center px-8 py-4 border-b border-slate-200/50 dark:border-slate-800/50 bg-white/70 dark:bg-slate-900/70 backdrop-blur-md transition-all">
                <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                    <FileText className="w-8 h-8 text-white fill-blue-600 drop-shadow-md" strokeWidth={1.5} />
                    <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">DocAI</span>
                </Link>
                <div className="flex items-center gap-4">
                    <Link to="/" className="text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 mr-2">
                        Create Your Own
                    </Link>
                    <button
                        onClick={toggleTheme}
                        className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 transition-colors"
                        title="Toggle Theme"
                    >
                        {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                    </button>
                </div>
            </nav>

            <main className="py-8 pt-24 relative z-10">
                <StudyGuide
                    content={content}
                    isInWorkspace={false}
                    isDarkMode={isDarkMode}
                    title={content ? (content.match(/^#\s+(.+)$/m)?.[1] || "Study Guide") : "Study Guide"}
                    showEmoji={false}
                    showUploadButton={false}
                    showTranslate={false}
                    showListen={false}
                    showQuiz={false}
                />
            </main>
        </div>
    );
};

export default SharedView;
