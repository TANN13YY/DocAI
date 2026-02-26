import { useState, useEffect, useRef, useCallback } from 'react';

export const useTTS = () => {
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const contentQueueRef = useRef([]);
    const currentLangRef = useRef('en-US');
    const isComponentMounted = useRef(true);

    useEffect(() => {
        isComponentMounted.current = true;
        return () => {
            isComponentMounted.current = false;
            window.speechSynthesis.cancel();
        };
    }, []);

    const playNextChunk = useCallback(() => {
        if (!isComponentMounted.current) return;

        if (contentQueueRef.current.length === 0) {
            setIsSpeaking(false);
            setIsPaused(false);
            return;
        }

        const text = contentQueueRef.current.shift();
        const utterance = new SpeechSynthesisUtterance(text);

        // Recover language preferences
        utterance.lang = currentLangRef.current || 'en-US';

        const voices = window.speechSynthesis.getVoices();

        let preferredVoice = null;
        if (utterance.lang.startsWith('hi')) {
            preferredVoice = voices.find(voice => voice.lang.startsWith('hi'));
        } else {
            preferredVoice = voices.find(voice =>
                voice.name.includes('Google US English') ||
                voice.name.includes('Microsoft David') ||
                voice.lang.startsWith('en-')
            );
        }

        if (preferredVoice) {
            utterance.voice = preferredVoice;
        }

        utterance.onstart = () => {
            if (isComponentMounted.current) {
                setIsSpeaking(true);
                setIsPaused(false);
            }
        };

        utterance.onend = () => {
            // Chrome Android bug: onend fires immediately if we try to speak too fast after another speech ends.
            // A tiny timeout fixes it.
            setTimeout(() => {
                if (isComponentMounted.current) {
                    playNextChunk();
                }
            }, 50);
        };

        utterance.onerror = (event) => {
            console.error('Speech synthesis error:', event);
            if (event.error !== 'canceled' && event.error !== 'interrupted') {
                playNextChunk();
            } else if (isComponentMounted.current) {
                // It was intentionally canceled or interrupted
                setIsSpeaking(false);
                setIsPaused(false);
            }
        };

        // Small timeout before speak, helps on some Chrome Android versions
        setTimeout(() => {
            if (!isComponentMounted.current) return;
            window.speechSynthesis.speak(utterance);
            // Workaround for Chrome Android bug where engine gets stuck in paused state
            if (window.speechSynthesis.paused) {
                window.speechSynthesis.resume();
            }
        }, 10);
    }, []);

    const speak = useCallback((text, lang = 'en-US') => {
        if (!text) return;

        currentLangRef.current = lang;
        window.speechSynthesis.cancel();
        setIsSpeaking(false);
        setIsPaused(false);

        // Chunking text function to bypass Android Chrome length limit
        // 150 characters is a safe length for mobile TTS
        const chunkText = (text, maxLength = 150) => {
            const chunks = [];
            // Basic sentence boundary split keeping delimiters
            const sentences = text.match(/[^.!?\n]+[.!?\n]+/g) || [text];

            // If the regex failed to match anything (e.g. no punctuation), fallback to the whole text
            const parts = sentences.length > 0 ? sentences : [text];

            parts.forEach(sentence => {
                let currentSentence = sentence.trim();
                while (currentSentence.length > 0) {
                    if (currentSentence.length <= maxLength) {
                        chunks.push(currentSentence);
                        break;
                    } else {
                        // Find last space within maximum allowed length
                        let splitIndex = currentSentence.lastIndexOf(' ', maxLength);
                        if (splitIndex === -1) {
                            splitIndex = maxLength; // force split if no spaces found
                        }
                        chunks.push(currentSentence.substring(0, splitIndex).trim());
                        currentSentence = currentSentence.substring(splitIndex).trim();
                    }
                }
            });
            return chunks.filter(c => c.trim().length > 0);
        };

        const chunks = chunkText(text);
        contentQueueRef.current = chunks;

        // Give cancel time to propagate (Chrome Android bug)
        setTimeout(() => {
            playNextChunk();
        }, 100);
    }, [playNextChunk]);

    const cancel = useCallback(() => {
        contentQueueRef.current = [];
        window.speechSynthesis.cancel();
        setIsSpeaking(false);
        setIsPaused(false);
    }, []);

    const pause = useCallback(() => {
        if (isSpeaking && !isPaused) {
            window.speechSynthesis.pause();
            setIsPaused(true);
        }
    }, [isSpeaking, isPaused]);

    const resume = useCallback(() => {
        if (isSpeaking && isPaused) {
            window.speechSynthesis.resume();
            setIsPaused(false);
        }
    }, [isSpeaking, isPaused]);

    return { speak, cancel, pause, resume, isSpeaking, isPaused };
};
