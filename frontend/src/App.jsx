import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './components/Home';
import SharedView from './components/SharedView';
import { ToastProvider } from './context/ToastContext';

function App() {
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Toggle Dark Mode
  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  // Apply Dark Mode Class
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  return (
    <ToastProvider>
      <Router>
        <div className={`min-h-screen transition-colors duration-200 ${isDarkMode ? 'dark bg-slate-900 text-white' : 'bg-white text-slate-900'}`}>
          <Routes>
            <Route path="/" element={<Home isDarkMode={isDarkMode} toggleTheme={toggleTheme} />} />
            <Route path="/share/:id" element={<SharedView isDarkMode={isDarkMode} toggleTheme={toggleTheme} />} />
          </Routes>
        </div>
      </Router>
    </ToastProvider>
  );
}

export default App;
