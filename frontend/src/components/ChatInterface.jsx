import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { Send, X, MessageSquare, Loader2, User, Bot, Volume2, StopCircle } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useTTS } from '../hooks/useTTS';

const ChatInterface = ({ docId }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { role: 'assistant', content: 'Hi! I can help you understand this document. Ask me anything!' }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { speak, cancel, isSpeaking } = useTTS();
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    // Load chat history when docId changes
    useEffect(() => {
        if (!docId) return;
        const savedHistory = localStorage.getItem(`chat_history_${docId}`);
        if (savedHistory) {
            try {
                setMessages(JSON.parse(savedHistory));
            } catch (e) {
                console.error("Failed to parse chat history:", e);
            }
        } else {
            // Reset to default if no history found for this doc
            setMessages([
                { role: 'assistant', content: 'Hi! I can help you understand this document. Ask me anything!' }
            ]);
        }
    }, [docId]);

    // Save chat history when messages change
    useEffect(() => {
        if (!docId || messages.length === 0) return;
        localStorage.setItem(`chat_history_${docId}`, JSON.stringify(messages));
    }, [messages, docId]);

    useEffect(() => {
        if (isOpen) {
            scrollToBottom();
        }
    }, [messages, isOpen]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMessage = input.trim();
        setInput('');
        setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
        setIsLoading(true);

        try {
            // Prepare history for backend (simple format for now)
            const history = messages.map(m => ({
                role: m.role,
                parts: [m.content]
            }));

            const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';
            const response = await axios.post(`${API_URL}/chat`, {
                doc_id: docId,
                messages: history,
                question: userMessage
            });

            setMessages(prev => [...prev, { role: 'assistant', content: response.data.answer }]);
        } catch (error) {
            console.error('Chat error:', error);

            let errorMessage = 'Sorry, I encountered an error. Please try again.';
            // Check if backend sent a specific detail message (e.g., 404 doc not found)
            if (error.response && error.response.data && error.response.data.detail) {
                errorMessage = error.response.data.detail;
            }

            setMessages(prev => [...prev, { role: 'assistant', content: errorMessage }]);
        } finally {
            setIsLoading(false);
        }
    };

    if (!docId) return null;

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end pointer-events-none">
            {/* Chat Window */}
            {isOpen && (
                <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 w-80 sm:w-96 h-[500px] mb-4 pointer-events-auto flex flex-col overflow-hidden animate-in slide-in-from-bottom-5 fade-in duration-200">
                    {/* Header */}
                    <div className="bg-blue-600 p-4 flex justify-between items-center text-white">
                        <div className="flex items-center gap-2">
                            <Bot className="w-5 h-5" />
                            <span className="font-semibold">AI Assistant</span>
                        </div>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="text-blue-100 hover:text-white transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50 dark:bg-slate-900/50">
                        {messages.map((msg, idx) => (
                            <div key={idx} className={`flex gap-3 group ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${msg.role === 'user' ? 'bg-indigo-100 text-indigo-600' : 'bg-blue-100 text-blue-600'
                                    }`}>
                                    {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                                </div>
                                <div className={`px-4 py-2.5 rounded-2xl text-sm max-w-[80%] shadow-sm ${msg.role === 'user'
                                    ? 'bg-indigo-600 text-white rounded-tr-none'
                                    : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-tl-none'
                                    }`}>
                                    <div className={`prose prose-sm max-w-none break-words ${msg.role === 'user' ? 'prose-invert text-white' : 'dark:prose-invert'}`}>
                                        <ReactMarkdown
                                            remarkPlugins={[remarkGfm]}
                                            components={{
                                                // Override paragraph to remove margins in chat bubbles
                                                p: ({ node, ...props }) => <p className="mb-0" {...props} />,
                                                // Style code blocks specifically
                                                code: ({ node, inline, className, children, ...props }) => {
                                                    const match = /language-(\w+)/.exec(className || '');
                                                    return !inline ? (
                                                        <pre className="bg-slate-900 text-slate-50 p-2 rounded-md overflow-x-auto text-xs my-2">
                                                            <code className={className} {...props}>{children}</code>
                                                        </pre>
                                                    ) : (
                                                        <code className={`${msg.role === 'user' ? 'bg-indigo-700 text-indigo-100' : 'bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200'} px-1 py-0.5 rounded font-mono text-xs`} {...props}>
                                                            {children}
                                                        </code>
                                                    );
                                                }
                                            }}
                                        >
                                            {msg.content}
                                        </ReactMarkdown>
                                    </div>
                                    {/* TTS Button for Assistant */}
                                    {msg.role === 'assistant' && (
                                        <div className="flex justify-end mt-1">
                                            <button
                                                onClick={() => speak(msg.content)}
                                                className="p-1 text-slate-400 hover:text-blue-500 transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                                                title="Read Aloud"
                                            >
                                                <Volume2 className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                        {isLoading && (
                            <div className="flex gap-3">
                                <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center flex-shrink-0">
                                    <Bot className="w-4 h-4" />
                                </div>
                                <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-4 py-3 rounded-2xl rounded-tl-none shadow-sm">
                                    <div className="flex gap-1">
                                        <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                        <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                        <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                    </div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input */}
                    <form onSubmit={handleSubmit} className="p-4 bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700">
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="Ask a question..."
                                className="flex-1 px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-900 border-transparent focus:bg-white dark:focus:bg-slate-950 border focus:border-blue-500 focus:ring-0 outline-none text-slate-900 dark:text-white placeholder-slate-500 transition-all text-sm"
                            />
                            <button
                                type="submit"
                                disabled={!input.trim() || isLoading}
                                className="p-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                <Send className="w-5 h-5" />
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Toggle Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="pointer-events-auto w-14 h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center group"
            >
                {isOpen ? (
                    <X className="w-6 h-6" />
                ) : (
                    <MessageSquare className="w-6 h-6 group-hover:scale-110 transition-transform" />
                )}
            </button>
        </div>
    );
};

export default ChatInterface;
