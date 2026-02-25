import { useState, useEffect, useRef } from 'react';

export const useTTS = () => {
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const utteranceRef = useRef(null);

    useEffect(() => {
        // Cleanup on unmount
        return () => {
            window.speechSynthesis.cancel();
        };
    }, []);

    const speak = (text) => {
        if (!text) return;

        // Cancel any current speech
        window.speechSynthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(text);

        // Try to select a good voice
        const voices = window.speechSynthesis.getVoices();
        const preferredVoice = voices.find(voice =>
            voice.name.includes('Google US English') ||
            voice.name.includes('Microsoft David') ||
            voice.lang.startsWith('en-')
        );

        if (preferredVoice) {
            utterance.voice = preferredVoice;
        }

        utterance.onstart = () => {
            setIsSpeaking(true);
            setIsPaused(false);
        };

        utterance.onend = () => {
            setIsSpeaking(false);
            setIsPaused(false);
        };

        utterance.onerror = (event) => {
            console.error('Speech synthesis error:', event);
            setIsSpeaking(false);
            setIsPaused(false);
        };

        utteranceRef.current = utterance;
        window.speechSynthesis.speak(utterance);
    };

    const cancel = () => {
        window.speechSynthesis.cancel();
        setIsSpeaking(false);
        setIsPaused(false);
    };

    const pause = () => {
        if (isSpeaking && !isPaused) {
            window.speechSynthesis.pause();
            setIsPaused(true);
        }
    };

    const resume = () => {
        if (isSpeaking && isPaused) {
            window.speechSynthesis.resume();
            setIsPaused(false);
        }
    };

    return { speak, cancel, pause, resume, isSpeaking, isPaused };
};
