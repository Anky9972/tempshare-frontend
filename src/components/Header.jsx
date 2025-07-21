import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiPlusCircle } from 'react-icons/fi';

function Header() {
  const navigate = useNavigate();

  return (
    <header className="bg-dark-card/50 backdrop-blur-sm sticky top-0 z-30 border-b border-dark-border">
      <div className="container mx-auto p-4 flex justify-between items-center">
        <div>
          <Link to="/" className="text-2xl font-bold text-white hover:text-primary transition-colors">
            TempShare
          </Link>
          <p className="text-sm text-slate-400 hidden sm:block">Anonymous Text & Code Sharing</p>
        </div>
        {/* NEW: Create New Snippet Button */}
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 py-2 px-4 bg-primary hover:bg-primary-focus text-slate-900 font-bold rounded-lg transition-all"
        >
          <FiPlusCircle size={20} />
          <span className="hidden sm:inline">New Snippet</span>
        </button>
      </div>
    </header>
  );
}

export default Header;