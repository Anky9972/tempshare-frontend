import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import HomePage from './pages/HomePage';
import SnippetPage from './pages/SnippetPage';
import NotFoundPage from './pages/NotFoundPage';
import Header from './components/Header';
import AboutPage from './pages/AboutPage';
import AdComponent from './components/AdComponent';

function App() {
  return (
    <Router>
      {/* ENHANCED: Overall app layout with AdSense integration */}
      <div className="min-h-screen bg-dark-bg text-slate-300 font-sans">
        <Header />
        <main className="container mx-auto p-4 lg:p-6">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/:id" element={<SnippetPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
          {/* Adding AdComponent below main content */}
          <div className="mt-6">
            <AdComponent
              clientId="ca-pub-9730090335646193"
              slotId="3520904658" // Replace with your actual AdSense slot ID
              format="auto"
              className="mx-auto"
            />
          </div>
        </main>
        <AboutPage />
      </div>
    </Router>
  );
}

export default App;