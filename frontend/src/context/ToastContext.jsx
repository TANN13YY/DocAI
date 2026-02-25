import React, { createContext, useContext, useState, useCallback } from 'react';
import { X } from 'lucide-react';

const ToastContext = createContext();

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
};

export const ToastProvider = ({ children }) => {
    const [toast, setToast] = useState(null);

    const showToast = useCallback((message, type = 'info') => {
        setToast({ message, type });

        // Auto-dismiss after 3 seconds
        setTimeout(() => {
            setToast(null);
        }, 3000);
    }, []);

    const hideToast = useCallback(() => {
        setToast(null);
    }, []);

    return (
        <ToastContext.Provider value={{ showToast, hideToast }}>
            {children}
            {toast && (
                <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-[100] animate-fade-in-down">
                    <div className="bg-slate-800 text-white dark:bg-slate-700 px-4 py-2 rounded-lg shadow-lg text-sm font-medium flex items-center gap-2 min-w-[200px] justify-center text-center">
                        <span>{toast.message}</span>
                    </div>
                </div>
            )}
        </ToastContext.Provider>
    );
};
