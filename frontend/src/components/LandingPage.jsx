import React, { useCallback, useState, useRef } from 'react';
import { Upload, FileText, CheckCircle, Smartphone, Zap, Moon, Sun, Star, ChevronDown, ChevronUp, Globe, Shield, MessageSquare, Gift, Volume2, BrainCircuit } from 'lucide-react';
import { useToast } from '../context/ToastContext';

const initialReviews = [];

const FAQItem = ({ question, answer }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-800/50 overflow-hidden transition-all duration-200">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between p-6 text-left focus:outline-none"
            >
                <span className="font-bold text-slate-900 dark:text-white text-lg">{question}</span>
                {isOpen ? (
                    <ChevronUp className="w-5 h-5 text-slate-500" />
                ) : (
                    <ChevronDown className="w-5 h-5 text-slate-500" />
                )}
            </button>
            <div
                className={`transition-all duration-300 ease-in-out ${isOpen ? 'max-h-48 opacity-100' : 'max-h-0 opacity-0'
                    }`}
            >
                <div className="px-6 pb-6 text-slate-600 dark:text-slate-400 leading-relaxed">
                    {/* Render markdown-style bolding simply */}
                    {answer.split('**').map((part, i) =>
                        i % 2 === 1 ? <span key={i} className="text-blue-600 dark:text-blue-400 font-medium">{part}</span> : part
                    )}
                </div>
            </div>
        </div>
    );
};

const FooterContent = {
    privacy: (
        <div className="space-y-6">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">Privacy Policy</h3>
            <div>
                <h4 className="font-bold text-slate-900 dark:text-white mb-2">1. Introduction</h4>
                <p>Welcome to DocAI. We respect your privacy and are committed to protecting your personal information. This Privacy Policy explains how we handle, process, and safeguard your data when you visit our website and utilize our services.</p>
            </div>
            <div>
                <h4 className="font-bold text-slate-900 dark:text-white mb-2">2. Information We Collect</h4>
                <p>We process the PDF and DOCX files you voluntarily upload strictly for the purpose of generating summaries and answering your questions. We do not permanently store your documents. All uploaded files are automatically and permanently deleted from our servers immediately upon the conclusion of your active session.</p>
            </div>
            <div>
                <h4 className="font-bold text-slate-900 dark:text-white mb-2">3. How We Use Your Data</h4>
                <ul className="list-disc pl-5 space-y-1">
                    <li>To provide our core AI-driven summarization and interactive Q&A features.</li>
                    <li>To monitor, maintain, and ensure the ongoing security and integrity of our website.</li>
                </ul>
            </div>
            <div>
                <h4 className="font-bold text-slate-900 dark:text-white mb-2">4. Data Security</h4>
                <p>We implement robust, industry-standard security measures designed to protect your uploaded files and personal data from accidental loss, unauthorized access, alteration, or disclosure during processing.</p>
            </div>
        </div>
    ),
    terms: (
        <div className="space-y-6">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">Terms of Service</h3>
            <div>
                <h4 className="font-bold text-slate-900 dark:text-white mb-2">1. Acceptance of Terms</h4>
                <p>By accessing or using DocAI, you agree to be bound by these Terms of Service. If you disagree with any part of these terms, you do not have permission to access or use the service.</p>
            </div>
            <div>
                <h4 className="font-bold text-slate-900 dark:text-white mb-2">2. Description of Service</h4>
                <p>DocAI provides an AI-powered document analysis and summarization tool. You acknowledge and agree that the service is provided on an "AS-IS" and "AS-AVAILABLE" basis. DocAI assumes no liability for the accuracy of the AI-generated output, nor do we take responsibility for the timeliness, deletion, mis-delivery, or failure to store any uploaded documents, user communications, or personalization settings.</p>
            </div>
            <div>
                <h4 className="font-bold text-slate-900 dark:text-white mb-2">3. User Conduct</h4>
                <p>You are solely responsible for the files you upload to DocAI. You agree not to upload, transmit, or process any documents that contain illegal, defamatory, or highly offensive material. Furthermore, you agree not to upload copyrighted material or intellectual property belonging to third parties unless you have explicit authorization to do so.</p>
            </div>
            <div>
                <h4 className="font-bold text-slate-900 dark:text-white mb-2">4. Termination</h4>
                <p>We reserve the right to terminate or suspend your access to DocAI immediately, without prior notice or liability, for any reason whatsoever, including, but not limited to, a breach of these Terms of Service. Upon termination, your right to use the service will immediately cease.</p>
            </div>
        </div>
    )
};

const LandingPage = ({ onFileUpload, isUploading, isDarkMode, toggleTheme }) => {
    const [reviews, setReviews] = useState([]);
    const [newReview, setNewReview] = useState({ name: '', role: '', content: '', rating: 5 });
    const [isFormVisible, setIsFormVisible] = useState(false);
    const [isLoadingReviews, setIsLoadingReviews] = useState(true);
    const [activeModal, setActiveModal] = useState(null);
    const [contactForm, setContactForm] = useState({ name: '', email: '', subject: '', description: '' });
    const { showToast } = useToast();
    const uploadSectionRef = useRef(null);

    const handleContactSubmit = async (e) => {
        e.preventDefault();
        try {
            const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';
            const response = await fetch(`${API_URL}/contact`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(contactForm),
            });
            if (response.ok) {
                showToast('We will get in touch soon.', 'success');
                setContactForm({ name: '', email: '', subject: '', description: '' });
                setActiveModal(null);
            } else {
                const errorData = await response.json().catch(() => ({}));
                showToast(`Failed to send message: ${errorData.detail || response.statusText || 'Unknown error'}`, 'error');
            }
        } catch (error) {
            console.error('Contact form error:', error);
            showToast(`Error sending message: ${error.message}. Ensure backend is running.`, 'error');
        }
    };

    const scrollToUpload = () => {
        uploadSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    };

    // Fetch reviews on mount
    React.useEffect(() => {
        const fetchReviews = async () => {
            try {
                const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';
                const response = await fetch(`${API_URL}/reviews`);
                if (response.ok) {
                    const data = await response.json();
                    setReviews(data);
                }
            } catch (error) {
                console.error('Failed to fetch reviews:', error);
            } finally {
                setIsLoadingReviews(false);
            }
        };
        fetchReviews();
    }, []);

    const handleDrop = useCallback((e) => {
        e.preventDefault();
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            onFileUpload(e.dataTransfer.files[0]);
        }
    }, [onFileUpload]);

    const handleReviewSubmit = async (e) => {
        e.preventDefault();
        if (!newReview.name || !newReview.content) return;

        try {
            const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';
            const response = await fetch(`${API_URL}/reviews`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newReview),
            });

            if (response.ok) {
                showToast('Review submitted successfully!', 'success');
                setNewReview({ name: '', role: '', content: '', rating: 5 });
                setIsFormVisible(false);
            } else {
                showToast('Failed to submit review.', 'error');
            }
        } catch (error) {
            console.error('Error submitting review:', error);
            showToast('Error submitting review.', 'error');
        }
    };

    return (
        <div className="min-h-screen bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 font-sans transition-colors duration-200 selection:bg-blue-100 dark:selection:bg-blue-900">
            {/* Subtle Grid Background */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
                <div className="absolute left-0 right-0 top-0 -z-10 m-auto h-[310px] w-[310px] rounded-full bg-blue-400 opacity-20 blur-[100px] dark:bg-blue-600"></div>
            </div>

            {/* Navbar with Glassmorphism */}
            <nav className="fixed top-0 left-0 right-0 z-50 flex justify-between items-center px-8 py-4 border-b border-slate-200/50 dark:border-slate-800/50 bg-white/70 dark:bg-slate-900/70 backdrop-blur-md transition-all">
                <div className="flex items-center gap-2">
                    <FileText className="w-8 h-8 text-white fill-blue-600 drop-shadow-md" strokeWidth={1.5} />
                    <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">DocAI</span>
                </div>
                <button
                    onClick={toggleTheme}
                    className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 transition-colors"
                    title="Toggle Theme"
                >
                    {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                </button>
            </nav>

            {/* Hero Section */}
            <main className="relative z-10 max-w-5xl mx-auto px-6 pt-32 pb-16 text-center">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-sm font-medium mb-8 animate-fade-in border border-blue-100 dark:border-blue-800">
                    <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z" />
                    </svg>
                    <span>Powered by Google Gemini</span>
                </div>

                <h1 className="text-5xl md:text-6xl font-extrabold text-slate-900 dark:text-white mb-6 tracking-tight leading-tight animate-fade-in-up">
                    Chat with any <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">PDF document</span>
                </h1>
                <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400 mb-10 max-w-2xl mx-auto leading-relaxed animate-fade-in-up delay-100">
                    From legal agreements to financial reports, DocAI makes complex documents easy to study and analyze.
                    Chat with your files to ask questions, extract summaries, and find crucial information in seconds.
                </p>

                <div className="flex justify-center gap-4 mb-16 animate-fade-in-up delay-200">
                    <button
                        onClick={scrollToUpload}
                        className="group relative px-8 py-3.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-bold transition-all hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl flex items-center gap-2 mx-auto"
                    >
                        <span>Get started</span>
                        <svg className="w-5 h-5 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                        </svg>
                    </button>

                </div>

                {/* Upload Box */}


                {/* Why Choose Us Section */}
                {/* Horizontal Scrolling Features */}
                <div className="w-full overflow-hidden bg-white/30 dark:bg-slate-900/30 backdrop-blur-lg border-y border-white/20 dark:border-slate-700/50 py-6 mt-24 mb-12 relative [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]">
                    <div className="flex animate-marquee w-max group hover:pause-animation">
                        {/* Duplicate the list to create seamless loop */}
                        {[...Array(2)].map((_, i) => (
                            <div key={i} className="flex gap-4 mx-2">
                                {[
                                    { icon: Zap, text: "Instant Summaries" },
                                    { icon: MessageSquare, text: "AI Chatbot" },
                                    { icon: Globe, text: "Multi-language Support" },
                                    { icon: Volume2, text: "Text-to-Speech Audio" },
                                    { icon: BrainCircuit, text: "Interactive Quizzes" },
                                    { icon: FileText, text: "PDF & DOCX Ready" },
                                    { icon: Shield, text: "Secure Processing" },
                                    { icon: Smartphone, text: "Mobile Optimized" }
                                ].map((feature, index) => (
                                    <div key={index} className="flex items-center gap-2 px-6 py-3 bg-white/50 dark:bg-slate-800/50 border border-white/20 dark:border-slate-700/50 rounded-full shadow-sm text-slate-700 dark:text-slate-200 font-medium text-sm whitespace-nowrap hover:border-blue-500 transition-colors cursor-default backdrop-blur-sm">
                                        <feature.icon className="w-4 h-4 text-blue-500" />
                                        {feature.text}
                                    </div>
                                ))}
                            </div>
                        ))}
                    </div>
                </div>

                <div className="grid md:grid-cols-2 gap-8 mt-12 text-left">
                    <div className="p-8 rounded-2xl bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 hover:border-blue-500 dark:hover:border-blue-500 transition-all shadow-sm hover:shadow-lg group">
                        <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl flex items-center justify-center text-indigo-600 dark:text-indigo-400 mb-6 group-hover:scale-110 transition-transform">
                            <BrainCircuit className="w-6 h-6" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">Interactive Chat & Quizzes</h3>
                        <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                            Don't just read—<span className="text-blue-600 font-medium">interact</span>. Ask our context-aware AI chatbot anything about your file, or generate a 10-question multi-choice quiz to test your knowledge instantly.
                        </p>
                    </div>
                    <div className="p-8 rounded-2xl bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 hover:border-blue-500 dark:hover:border-blue-500 transition-all shadow-sm hover:shadow-lg group">
                        <div className="w-12 h-12 bg-pink-100 dark:bg-pink-900/30 rounded-xl flex items-center justify-center text-pink-600 dark:text-pink-400 mb-6 group-hover:scale-110 transition-transform">
                            <Volume2 className="w-6 h-6" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">Listen & Translate</h3>
                        <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                            Learning on the go? Use our <span className="text-blue-600 font-medium">Text-to-Speech integration</span> to listen to your notes aloud. Better yet, instantly translate your complete study guide into Hindi with just one click.
                        </p>
                    </div>
                    <div className="p-8 rounded-2xl bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 hover:border-blue-500 dark:hover:border-blue-500 transition-all shadow-sm hover:shadow-lg group">
                        <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-xl flex items-center justify-center text-red-600 dark:text-red-400 mb-6 group-hover:scale-110 transition-transform">
                            <FileText className="w-6 h-6" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">Comprehensive Summaries</h3>
                        <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                            Transform dense PDFs and DOCX files into clear, actionable study guides. Get an executive summary, structured key concepts, and detailed study notes in seconds.
                        </p>
                    </div>
                    <div className="p-8 rounded-2xl bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 hover:border-blue-500 dark:hover:border-blue-500 transition-all shadow-sm hover:shadow-lg group">
                        <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center text-green-600 dark:text-green-400 mb-6 group-hover:scale-110 transition-transform">
                            <Globe className="w-6 h-6" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">Easily Shareable</h3>
                        <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                            Want to help your peers? Generate a public, <span className="text-blue-600 font-medium">read-only</span> link to share your fully formatted interactive study notes with your classmates anywhere.
                        </p>
                    </div>
                </div>

                {/* How It Works Section */}
                <div className="mt-32">
                    <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">Your Path to Mastery</h2>
                    <p className="text-slate-500 dark:text-slate-400 mb-12">Three simple steps to transform how you learn:</p>

                    <div className="grid md:grid-cols-3 gap-8 text-left">
                        <div className="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800 hover:border-blue-500 dark:hover:border-blue-500 transition-colors">
                            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold mb-4">1</div>
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">Upload & Analyze</h3>
                            <p className="text-slate-600 dark:text-slate-400">
                                Drag and drop your course material. Our advanced AI engine instantly deconstructs the document to find the <span className="text-blue-600 font-medium">signal in the noise</span>.
                            </p>
                        </div>
                        <div className="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800 hover:border-blue-500 dark:hover:border-blue-500 transition-colors">
                            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold mb-4">2</div>
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">Accelerate Learning</h3>
                            <p className="text-slate-600 dark:text-slate-400">
                                Get a comprehensive study guide, natural chat, and smart summaries. Turn <span className="text-blue-600 font-medium">hours of reading</span> into minutes of mastery.
                            </p>
                        </div>
                        <div className="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800 hover:border-blue-500 dark:hover:border-blue-500 transition-colors">
                            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold mb-4">3</div>
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">Export & Excel</h3>
                            <p className="text-slate-600 dark:text-slate-400">
                                Download the <span className="text-blue-600 font-medium">PDF</span> or share distinct insights with study groups. Everything you need to ace the exam.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Upload Box */}
                <div className="relative max-w-2xl mx-auto my-32 isolate px-4">
                    {/* Decorative Background Blob */}
                    <div className="absolute inset-0 -z-10 bg-gradient-to-r from-blue-400/30 to-purple-400/30 dark:from-blue-600/20 dark:to-purple-600/20 blur-3xl rounded-full transform scale-110 opacity-70 animate-pulse-slow pointer-events-none"></div>

                    {/* Floating Icons - Distributed Evenly & Inside Boundary */}
                    <div className="absolute top-6 left-12 sm:left-24 p-3 bg-white dark:bg-slate-800 rounded-xl shadow-lg animate-float-rotate delay-0 hidden md:block border border-slate-100 dark:border-slate-700 z-20">
                        <FileText className="w-6 h-6 text-blue-500" />
                    </div>
                    <div className="absolute top-1/2 left-4 sm:left-10 p-3 bg-white dark:bg-slate-800 rounded-xl shadow-lg animate-float-scale delay-700 hidden md:block border border-slate-100 dark:border-slate-700 z-20">
                        <Shield className="w-5 h-5 text-indigo-500" />
                    </div>
                    <div className="absolute bottom-8 left-12 sm:left-24 p-3 bg-white dark:bg-slate-800 rounded-xl shadow-lg animate-float-rotate delay-1000 hidden md:block border border-slate-100 dark:border-slate-700 z-20">
                        <Globe className="w-5 h-5 text-cyan-500" />
                    </div>

                    <div className="absolute top-8 right-12 sm:right-24 p-3 bg-white dark:bg-slate-800 rounded-xl shadow-lg animate-float-rotate-reverse delay-500 hidden md:block border border-slate-100 dark:border-slate-700 z-20">
                        <Zap className="w-6 h-6 text-yellow-500" />
                    </div>
                    <div className="absolute top-1/2 right-4 sm:right-10 p-3 bg-white dark:bg-slate-800 rounded-xl shadow-lg animate-float-scale delay-200 hidden md:block border border-slate-100 dark:border-slate-700 z-20">
                        <MessageSquare className="w-5 h-5 text-pink-500" />
                    </div>
                    <div className="absolute bottom-16 right-16 sm:right-28 p-3 bg-white dark:bg-slate-800 rounded-xl shadow-lg animate-float-rotate-reverse delay-1000 hidden md:block border border-slate-100 dark:border-slate-700 z-20">
                        <CheckCircle className="w-6 h-6 text-green-500" />
                    </div>

                    <div
                        ref={uploadSectionRef}
                        onDrop={handleDrop}
                        onDragOver={(e) => e.preventDefault()}
                        className="bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-3xl p-10 hover:border-blue-500 dark:hover:border-blue-500 hover:bg-blue-50/50 dark:hover:bg-blue-900/10 transition-all duration-300 cursor-pointer group shadow-xl shadow-slate-200/50 dark:shadow-none animate-fade-in-up delay-200"
                    >
                        <div className="flex flex-col items-center">
                            <div className="w-20 h-20 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl flex items-center justify-center mb-6 text-blue-600 dark:text-blue-400 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300 shadow-inner">
                                <Upload className="w-10 h-10" strokeWidth={1.5} />
                            </div>
                            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                                Drop your PDF here
                            </h3>
                            <p className="text-slate-500 dark:text-slate-400 mb-8">
                                or click to browse local files
                            </p>

                            <input
                                type="file"
                                id="fileInput"
                                className="hidden"
                                accept=".pdf,.docx"
                                onChange={(e) => e.target.files[0] && onFileUpload(e.target.files[0])}
                            />

                            {isUploading ? (
                                <button disabled className="px-8 py-3 bg-blue-500 text-white rounded-xl font-medium opacity-75 cursor-wait flex items-center gap-2 shadow-lg shadow-blue-500/20">
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Analyzing Document...
                                </button>
                            ) : (
                                <button
                                    onClick={(e) => { e.stopPropagation(); document.getElementById('fileInput').click(); }}
                                    className="px-10 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-bold shadow-lg shadow-blue-600/20 transition-all hover:-translate-y-1 hover:shadow-blue-600/60"
                                >
                                    <Upload className="inline-block w-5 h-5 mr-2" />
                                    Upload & Analyze
                                </button>
                            )}

                            <p className="mt-6 text-xs font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wide">
                                Supports PDF, DOCX • Max 50MB • Secure & Private
                            </p>
                        </div>
                    </div>
                </div>

                {/* User Reviews Section */}
                <div className="mt-32 text-left">
                    <div className="flex justify-between items-center mb-12">
                        <h2 className="text-3xl font-bold text-slate-900 dark:text-white">User reviews</h2>
                        <button
                            onClick={() => setIsFormVisible(!isFormVisible)}
                            className="text-blue-600 dark:text-blue-400 font-semibold hover:underline"
                        >
                            {isFormVisible ? 'Cancel Review' : 'Write a Review'}
                        </button>
                    </div>

                    {isFormVisible && (
                        <form onSubmit={handleReviewSubmit} className="mb-12 bg-slate-50 dark:bg-slate-800 p-8 rounded-2xl border border-slate-100 dark:border-slate-700 animate-fade-in">
                            <h3 className="text-xl font-bold mb-6 text-slate-900 dark:text-white">Share your experience</h3>
                            <div className="grid md:grid-cols-2 gap-6 mb-6">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Name</label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                                        value={newReview.name}
                                        onChange={(e) => setNewReview({ ...newReview, name: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Role (Optional)</label>
                                    <input
                                        type="text"
                                        className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                                        value={newReview.role}
                                        onChange={(e) => setNewReview({ ...newReview, role: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="mb-6">
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Rating</label>
                                <div className="flex gap-2">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <button
                                            key={star}
                                            type="button"
                                            onClick={() => setNewReview({ ...newReview, rating: star })}
                                            className={`transition-colors ${star <= newReview.rating ? 'text-yellow-400' : 'text-slate-300 dark:text-slate-600'}`}
                                        >
                                            <Star className="w-6 h-6 fill-current" />
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className="mb-6">
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Review</label>
                                <textarea
                                    required
                                    rows="4"
                                    className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                                    value={newReview.content}
                                    onChange={(e) => setNewReview({ ...newReview, content: e.target.value })}
                                />
                            </div>
                            <button type="submit" className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors">
                                Submit Review
                            </button>
                        </form>
                    )}

                    <div className="grid md:grid-cols-3 gap-6">
                        {isLoadingReviews ? (
                            <div className="col-span-3 text-center text-slate-500 py-10">Loading reviews...</div>
                        ) : reviews.length === 0 ? (
                            <div className="col-span-3 text-center text-slate-500 py-10 bg-slate-50 dark:bg-slate-800 rounded-xl">
                                No reviews yet. Be the first to share your experience!
                            </div>
                        ) : (
                            reviews.map((review) => (
                                <div key={review.id} className="p-8 bg-slate-900 text-white rounded-2xl border border-slate-800 shadow-xl">
                                    <div className="flex gap-1 mb-4 text-yellow-400">
                                        {[...Array(5)].map((_, i) => (
                                            <Star key={i} className={`w-4 h-4 fill-current ${i < review.rating ? '' : 'text-slate-700'}`} />
                                        ))}
                                    </div>
                                    <h4 className="font-bold text-lg mb-1">{review.name}</h4>
                                    <p className="text-slate-400 text-sm mb-4">{review.role || 'User'}</p>
                                    <p className="text-slate-300 leading-relaxed">
                                        {review.content}
                                    </p>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* How It Works Section */}

                {/* FAQ Section */}
                {/* FAQ Section */}
                <div className="mt-32 mb-20 text-left max-w-3xl mx-auto">
                    <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-8 text-center">Frequently Asked Questions</h2>
                    <div className="space-y-4">
                        {[
                            {
                                question: "How does DocAI analyze my documents?",
                                answer: "DocAI use the advanced **Gemini 2.5 Flash** model to analyze your PDF text. It reads the entire document (up to 250k characters) to identify key concepts, generate comprehensive study notes, and create exam-style practice questions."
                            },
                            {
                                question: "Are my uploaded files secure?",
                                answer: "Yes, your privacy is our priority. We do not store your files permanently. All uploaded documents are automatically and permanently deleted from our servers immediately after your active session ends."
                            },
                            {
                                question: "Can the AI answer questions about things not in my document?",
                                answer: "Yes! While DocAI prioritizes the content within your uploaded files to ensure accuracy, it can seamlessly draw on **external general knowledge** to explain concepts that might be unclear or missing from your text."
                            },
                            {
                                question: "What is \"Read Mode\"?",
                                answer: "Read Mode is a distraction-free feature we built for deep work. It hides the navigation bar and centers your workspace, allowing you to focus entirely on reading and analyzing without visual clutter."
                            },
                            {
                                question: "Can I translate my document summaries?",
                                answer: "Absolutely. You can instantly translate your summaries, study guides, and chat responses into **Hindi** (and back to English) with a single click."
                            },
                            {
                                question: "What file formats and sizes do you support?",
                                answer: "We currently support PDF and DOCX files up to **50MB**. Our system is optimized to efficiently handle everything from large textbooks to dense legal agreements and financial reports."
                            },
                            {
                                question: "Is DocAI free to use?",
                                answer: "Yes, DocAI is completely free to use, making it an accessible and powerful tool for students, professionals, and learners."
                            }
                        ].map((faq, index) => (
                            <FAQItem key={index} question={faq.question} answer={faq.answer} />
                        ))}
                    </div>

                </div>

            </main >

            {/* Footer */}
            < footer className="bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 py-12 relative z-10" >
                <div className="max-w-5xl mx-auto px-6 text-center text-slate-500 dark:text-slate-400">
                    <p className="mb-4">© 2026 DocAI. All rights reserved.</p>
                    <div className="flex justify-center gap-6 text-sm">
                        <button onClick={() => setActiveModal('privacy')} className="hover:text-slate-900 dark:hover:text-white transition-colors">Privacy Policy</button>
                        <button onClick={() => setActiveModal('terms')} className="hover:text-slate-900 dark:hover:text-white transition-colors">Terms of Service</button>
                        <button onClick={() => setActiveModal('contact')} className="hover:text-slate-900 dark:hover:text-white transition-colors">Contact Us</button>
                    </div>
                </div>
            </footer >

            {/* Modal Overlay */}
            {
                activeModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in" onClick={() => setActiveModal(null)}>
                        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col animate-scale-in" onClick={e => e.stopPropagation()}>
                            <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/50">
                                <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                                    {activeModal === 'privacy' && 'Privacy Policy'}
                                    {activeModal === 'terms' && 'Terms of Service'}
                                    {activeModal === 'contact' && 'Contact Us'}
                                </h3>
                                <button onClick={() => setActiveModal(null)} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full transition-colors">
                                    <span className="sr-only">Close</span>
                                    <svg className="w-5 h-5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                            <div className="p-6 overflow-y-auto prose dark:prose-invert max-w-none text-slate-600 dark:text-slate-300">
                                {activeModal === 'contact' ? (
                                    <form className="space-y-4" onSubmit={handleContactSubmit}>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Name</label>
                                            <input
                                                type="text"
                                                required
                                                className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 outline-none focus:ring-2 focus:ring-blue-500"
                                                placeholder="Your name"
                                                value={contactForm.name}
                                                onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Email</label>
                                            <input
                                                type="email"
                                                required
                                                className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 outline-none focus:ring-2 focus:ring-blue-500"
                                                placeholder="you@example.com"
                                                value={contactForm.email}
                                                onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Subject</label>
                                            <input
                                                type="text"
                                                required
                                                className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 outline-none focus:ring-2 focus:ring-blue-500"
                                                placeholder="How can we help?"
                                                value={contactForm.subject}
                                                onChange={(e) => setContactForm({ ...contactForm, subject: e.target.value })}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Description</label>
                                            <textarea
                                                required
                                                rows="4"
                                                className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 outline-none focus:ring-2 focus:ring-blue-500"
                                                placeholder="Tell us more about your inquiry..."
                                                value={contactForm.description}
                                                onChange={(e) => setContactForm({ ...contactForm, description: e.target.value })}
                                            ></textarea>
                                        </div>
                                        <div className="pt-4 flex justify-end">
                                            <button type="submit" className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors">
                                                Send Message
                                            </button>
                                        </div>
                                    </form>
                                ) : (
                                    <div className="space-y-4 whitespace-pre-line">
                                        {FooterContent[activeModal]}
                                    </div>
                                )}
                            </div>
                            <div className="p-4 border-t border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 flex justify-end">
                                <button onClick={() => setActiveModal(null)} className="px-5 py-2 bg-slate-900 dark:bg-slate-700 hover:bg-slate-800 dark:hover:bg-slate-600 text-white rounded-lg font-medium transition-colors">
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }
        </div >
    );
};

export default LandingPage;
