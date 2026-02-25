import React, { useState } from 'react';
import axios from 'axios';
import LandingPage from './LandingPage';
import Workspace from './Workspace';
import ErrorBoundary from './ErrorBoundary';
import { useToast } from '../context/ToastContext';

function Home({ isDarkMode, toggleTheme }) {
    const { showToast } = useToast();
    const [file, setFile] = useState(null);
    const [summary, setSummary] = useState(null);
    const [docId, setDocId] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    // Load session from localStorage on mount
    React.useEffect(() => {
        const savedSession = localStorage.getItem('doc_ai_session');
        if (savedSession) {
            try {
                const session = JSON.parse(savedSession);
                if (session.docId && session.summary) {
                    setDocId(session.docId);
                    setSummary(session.summary);
                    // Reconstruct a minimal file object for display purposes
                    if (session.filename) {
                        setFile({ name: session.filename });
                    }
                }
            } catch (e) {
                console.error("Failed to restore session:", e);
                localStorage.removeItem('doc_ai_session');
            }
        }
    }, []);

    // Save session when relevant state changes
    React.useEffect(() => {
        if (docId && summary) {
            const session = {
                docId,
                summary,
                filename: file?.name || 'Document'
            };
            localStorage.setItem('doc_ai_session', JSON.stringify(session));
        }
    }, [docId, summary, file]);

    // Handle file selection from Landing Page
    const handleFileUpload = async (selectedFile) => {
        setFile(selectedFile);
        setIsLoading(true); // Start loading immediately

        const formData = new FormData();
        formData.append('file', selectedFile);

        try {
            // Increase timeout to 5 minutes (300000ms) for large files
            const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';
            const response = await axios.post(`${API_URL}/upload`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
                timeout: 300000,
            });
            setSummary(response.data.study_guide);
            setDocId(response.data.doc_id);
            // Storage will be updated by the useEffect
        } catch (error) {
            console.error('Error uploading file:', error);
            if (error.code === 'ECONNABORTED') {
                showToast('Request timed out. The file might be too large or the AI is taking too long.', 'error');
            } else {
                const errorMessage = error.response?.data?.detail || error.message || 'Unknown error occurred';
                showToast(`Failed to process file: ${errorMessage}`, 'error');
                console.error('Full error:', error);
            }
            setFile(null); // Reset on error
        } finally {
            setIsLoading(false);
        }
    };

    const handleBack = () => {
        setFile(null);
        setSummary(null);
        setDocId(null);
        setIsLoading(false);
        localStorage.removeItem('doc_ai_session'); // Clear session
    };

    return (
        <ErrorBoundary>
            {!file ? (
                <LandingPage
                    onFileUpload={handleFileUpload}
                    isUploading={isLoading}
                    isDarkMode={isDarkMode}
                    toggleTheme={toggleTheme}
                />
            ) : (
                <Workspace
                    file={file}
                    summary={summary}
                    docId={docId}
                    isLoading={isLoading}
                    onBack={handleBack}
                    isDarkMode={isDarkMode}
                    toggleTheme={toggleTheme}
                />
            )}
        </ErrorBoundary>
    );
}

export default Home;
