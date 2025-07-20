import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import HomePage from './pages/HomePage';
import SnippetPage from './pages/SnippetPage';
import NotFoundPage from './pages/NotFoundPage';
import Header from './components/Header';

function App() {
  return (
    <Router>
      {/* ENHANCED: Overall app layout */}
      <div className="min-h-screen bg-dark-bg text-slate-300 font-sans">
        <Header />
        <main className="container mx-auto p-4 lg:p-6">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/:id" element={<SnippetPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;