import React, { useState, useEffect, useCallback } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FiCode, FiFileText, FiSearch, FiTrash2, FiLock } from 'react-icons/fi';
import axios from 'axios';
import toast from 'react-hot-toast';
import debounce from 'lodash/debounce';

const API_URL = import.meta.env.REACT_APP_API_URL || 'http://localhost:5000/api/snippets';

function History() {
  const [history, setHistory] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [useSemanticSearch, setUseSemanticSearch] = useState(false);
  const [loading, setLoading] = useState(false);
  const location = useLocation();

  useEffect(() => {
    try {
      const savedHistory = JSON.parse(sessionStorage.getItem('snippetHistory') || '[]');
      // Ensure all history items have required properties
      const sanitizedHistory = savedHistory.map(item => ({
        ...item,
        id: item.id || 'unknown',
        title: item.title || 'Untitled',
        isCode: !!item.isCode,
        language: item.language || 'plaintext',
        tags: Array.isArray(item.tags) ? item.tags : [],
        summary: item.summary || '',
        timestamp: item.timestamp || Date.now(),
        hasPassword: !!item.hasPassword,
      }));
      setHistory(sanitizedHistory);
    } catch (error) {
      console.error('Failed to parse sessionStorage:', error);
      toast.error('Error loading history');
      setHistory([]);
    }
  }, [location]);

  // Debounced search handler
  const handleSearch = useCallback(
    debounce(async (term) => {
      if (!term || !useSemanticSearch) {
        try {
          const savedHistory = JSON.parse(sessionStorage.getItem('snippetHistory') || '[]');
          setHistory(
            savedHistory.map(item => ({
              ...item,
              id: item.id || 'unknown',
              title: item.title || 'Untitled',
              isCode: !!item.isCode,
              language: item.language || 'plaintext',
              tags: Array.isArray(item.tags) ? item.tags : [],
              summary: item.summary || '',
              timestamp: item.timestamp || Date.now(),
              hasPassword: !!item.hasPassword,
            }))
          );
        } catch (error) {
          console.error('Failed to parse sessionStorage:', error);
          toast.error('Error loading history');
          setHistory([]);
        }
        return;
      }

      setLoading(true);
      try {
        const response = await axios.post(`${API_URL}/search`, {
          query: term,
          history: JSON.parse(sessionStorage.getItem('snippetHistory') || '[]'),
        });
        setHistory(response.data.results);
        toast.success('Semantic search completed');
      } catch (error) {
        toast.error('Semantic search failed');
        setHistory(JSON.parse(sessionStorage.getItem('snippetHistory') || '[]'));
      } finally {
        setLoading(false);
      }
    }, 500),
    [useSemanticSearch]
  );

  useEffect(() => {
    handleSearch(searchTerm);
    return () => handleSearch.cancel();
  }, [searchTerm, handleSearch]);

  const filteredHistory = useSemanticSearch
    ? history
    : history.filter(
        (item) =>
          item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (Array.isArray(item.tags) && item.tags.some((tag) => tag.toLowerCase().includes(searchTerm.toLowerCase())))
      );

  const clearHistory = () => {
    if (window.confirm('Are you sure you want to clear your session history?')) {
      sessionStorage.removeItem('snippetHistory');
      setHistory([]);
      toast.success('Session history cleared');
    }
  };

  return (
    <div className="bg-dark-card border border-dark-border p-4 rounded-lg shadow-lg sticky top-24">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-lg font-semibold text-white">Session History</h3>
        {history.length > 0 && (
          <button
            onClick={clearHistory}
            className="p-2 text-slate-400 hover:text-red-400"
            aria-label="Clear history"
            title="Clear history"
            data-testid="clear-history-button"
          >
            <FiTrash2 />
          </button>
        )}
      </div>

      {/* Search Bar */}
      <div className="relative mb-4">
        <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder="Search history by title, ID, or tags..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 p-2 bg-slate-700 text-slate-300 border border-dark-border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          aria-label="Search history"
          data-testid="history-search-input"
        />
      </div>

      {/* Semantic Search Toggle */}
      <div className="mb-4">
        <label className="flex items-center gap-2 text-sm text-slate-400">
          <input
            type="checkbox"
            checked={useSemanticSearch}
            onChange={(e) => setUseSemanticSearch(e.target.checked)}
            className="rounded"
            aria-label="Enable semantic search"
            data-testid="semantic-search-checkbox"
          />
          Use AI Semantic Search
        </label>
      </div>

      {loading ? (
        <p className="text-slate-400 text-sm">Loading search results...</p>
      ) : history.length === 0 ? (
        <p className="text-slate-400 text-sm">You have no saved snippets in this session.</p>
      ) : (
        <ul className="space-y-2 max-h-96 overflow-y-auto">
          {filteredHistory.length === 0 ? (
            <p className="text-slate-400 text-sm">No results found.</p>
          ) : (
            filteredHistory.map((item, index) => (
              <li key={index}>
                <Link
                  to={`/${item.id}`}
                  className="block p-3 bg-slate-700/50 hover:bg-slate-700 rounded-md transition-colors"
                >
                  <div className="flex items-center gap-3">
                    {item.isCode ? <FiCode className="text-primary" /> : <FiFileText className="text-slate-400" />}
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-primary text-sm">{item.id}</span>
                        {item.hasPassword && <FiLock className="text-yellow-400" />}
                      </div>
                      <p className="text-slate-300 text-sm truncate">{item.title}</p>
                      {item.summary && (
                        <p className="text-slate-400 text-xs mt-1 truncate">{item.summary}</p>
                      )}
                      <p className="text-slate-500 text-xs mt-1">
                        {new Date(item.timestamp).toLocaleString()} | {item.language} | Tags:{' '}
                        {Array.isArray(item.tags) ? item.tags.join(', ') : 'None'}
                      </p>
                    </div>
                  </div>
                </Link>
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
}

export default History;