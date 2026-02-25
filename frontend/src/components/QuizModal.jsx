import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { X, Check, AlertCircle, Loader2, Trophy, ArrowRight, RefreshCw } from 'lucide-react';
import { useToast } from '../context/ToastContext';

const QuizModal = ({ isOpen, onClose, docId, content }) => {
    const { showToast } = useToast();
    const [loading, setLoading] = useState(false);
    const [questions, setQuestions] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [selectedOption, setSelectedOption] = useState(null);
    const [isAnswered, setIsAnswered] = useState(false);
    const [score, setScore] = useState(0);
    const [showResult, setShowResult] = useState(false);

    useEffect(() => {
        if (isOpen && questions.length === 0) {
            fetchQuiz();
        }
    }, [isOpen]);

    const fetchQuiz = async () => {
        setLoading(true);
        try {
            const payload = docId ? { doc_id: docId } : { text: content };
            if (!payload.doc_id && !payload.text) {
                throw new Error("No content available for quiz");
            }

            const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';
            const response = await axios.post(`${API_URL}/quiz`, payload);
            setQuestions(response.data);
            setCurrentIndex(0);
            setScore(0);
            setShowResult(false);
            resetQuestion();
        } catch (error) {
            console.error("Quiz fetch error:", error);
            showToast("Failed to generate quiz. Please try again.", "error");
            onClose();
        } finally {
            setLoading(false);
        }
    };

    const resetQuestion = () => {
        setSelectedOption(null);
        setIsAnswered(false);
    };

    const handleOptionClick = (optionIndex) => {
        if (isAnswered) return;
        setSelectedOption(optionIndex);
        setIsAnswered(true);

        if (optionIndex === questions[currentIndex].correct_answer) {
            setScore(prev => prev + 1);
        }
    };

    const handleNext = () => {
        if (currentIndex < questions.length - 1) {
            setCurrentIndex(prev => prev + 1);
            resetQuestion();
        } else {
            setShowResult(true);
        }
    };

    const handleRestart = () => {
        fetchQuiz();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

            <div className="relative w-full max-w-lg bg-white dark:bg-slate-800 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 border border-slate-200 dark:border-slate-700">

                {/* Header */}
                <div className="flex justify-between items-center p-6 border-b border-slate-100 dark:border-slate-700">
                    <div className="flex items-center gap-2">
                        <Trophy className="w-6 h-6 text-yellow-500" />
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Knowledge Check</h2>
                    </div>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-12 text-slate-500">
                            <Loader2 className="w-10 h-10 animate-spin mb-4 text-blue-600" />
                            <p>Generating questions from your document...</p>
                        </div>
                    ) : showResult ? (
                        <div className="text-center py-8">
                            <div className="w-20 h-20 bg-yellow-100 text-yellow-600 rounded-full flex items-center justify-center mx-auto mb-6">
                                <Trophy className="w-10 h-10" />
                            </div>
                            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Quiz Completed!</h3>
                            <p className="text-slate-600 dark:text-slate-400 mb-8">
                                You scored <span className="font-bold text-blue-600 text-xl">{score}</span> out of <span className="font-bold text-xl">{questions.length}</span>
                            </p>
                            <div className="flex gap-4 justify-center">
                                <button
                                    onClick={onClose}
                                    className="px-6 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors font-medium"
                                >
                                    Close
                                </button>
                                <button
                                    onClick={handleRestart}
                                    className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white transition-colors font-medium flex items-center gap-2"
                                >
                                    <RefreshCw className="w-4 h-4" /> Try Again
                                </button>
                            </div>
                        </div>
                    ) : questions.length > 0 ? (
                        <div>
                            {/* Progress */}
                            <div className="flex justify-between text-sm text-slate-500 mb-4 font-medium">
                                <span>Question {currentIndex + 1} of {questions.length}</span>
                                <span className={isAnswered ? (selectedOption === questions[currentIndex].correct_answer ? "text-green-500" : "text-red-500") : ""}>
                                    {isAnswered ? (selectedOption === questions[currentIndex].correct_answer ? "Correct!" : "Incorrect") : "Pick an answer"}
                                </span>
                            </div>
                            <div className="w-full h-2 bg-slate-100 dark:bg-slate-700 rounded-full mb-8 overflow-hidden">
                                <div
                                    className="h-full bg-blue-600 transition-all duration-300"
                                    style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
                                />
                            </div>

                            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6 leading-relaxed">
                                {questions[currentIndex].question}
                            </h3>

                            <div className="space-y-3 mb-8">
                                {questions[currentIndex].options.map((option, idx) => {
                                    let stateClass = "border-slate-200 dark:border-slate-700 hover:border-blue-500 dark:hover:border-blue-500 hover:bg-slate-50 dark:hover:bg-slate-700/50";

                                    if (isAnswered) {
                                        if (idx === questions[currentIndex].correct_answer) {
                                            stateClass = "bg-green-50 dark:bg-green-900/20 border-green-500 text-green-700 dark:text-green-400";
                                        } else if (idx === selectedOption) {
                                            stateClass = "bg-red-50 dark:bg-red-900/20 border-red-500 text-red-700 dark:text-red-400";
                                        } else {
                                            stateClass = "opacity-50 border-slate-200 dark:border-slate-700";
                                        }
                                    }

                                    return (
                                        <button
                                            key={idx}
                                            onClick={() => handleOptionClick(idx)}
                                            disabled={isAnswered}
                                            className={`w-full text-left p-4 rounded-xl border-2 transition-all duration-200 flex items-center justify-between group ${stateClass}`}
                                        >
                                            <span className="font-medium">{option}</span>
                                            {isAnswered && idx === questions[currentIndex].correct_answer && (
                                                <Check className="w-5 h-5 text-green-500" />
                                            )}
                                            {isAnswered && idx === selectedOption && idx !== questions[currentIndex].correct_answer && (
                                                <AlertCircle className="w-5 h-5 text-red-500" />
                                            )}
                                        </button>
                                    );
                                })}
                            </div>

                            <div className="flex justify-end">
                                <button
                                    onClick={handleNext}
                                    disabled={!isAnswered}
                                    className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                >
                                    {currentIndex === questions.length - 1 ? 'Finish' : 'Next Question'}
                                    <ArrowRight className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-12 text-slate-500">
                            Failed to load questions.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default QuizModal;
