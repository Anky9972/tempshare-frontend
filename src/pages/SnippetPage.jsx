import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import Editor from 'react-simple-code-editor';
import { highlight, languages } from 'prismjs/components/prism-core';
import 'prismjs/components/prism-clike';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-css';
import 'prismjs/components/prism-markup';
import 'prismjs/components/prism-python';
import 'prismjs/themes/prism-tomorrow.css';
import { FiClipboard, FiShare2, FiLock, FiLoader, FiDownload, FiInfo } from 'react-icons/fi';
import qrcode from 'v-qr-code-next';
import ErrorBoundary from './ErrorBoundary';

const API_URL = import.meta.env.VITE_APP_API_URL || 'http://localhost:5000/api/snippets';

const SnippetPage = () => {
  const { id } = useParams();
  const [snippet, setSnippet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [password, setPassword] = useState('');
  const [requiresPassword, setRequiresPassword] = useState(false);
  const [showQRCode, setShowQRCode] = useState(false);
  const [showAIMetadata, setShowAIMetadata] = useState({});
  const [qrCodeSvg, setQrCodeSvg] = useState('');

  const fetchSnippet = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/${id}`);
      if (response.data.requiresPassword) {
        setRequiresPassword(true);
      } else {
        setSnippet(response.data);
        setShowAIMetadata({
          summary: false,
          suggestions: false,
          explanation: false,
          securityIssues: false,
        });
        // Generate QR code for the snippet link
        try {
          const qr = qrcode(8, 'L'); // typeNumber: 8, errorCorrectionLevel: 'L'
          qr.addData(window.location.href);
          qr.make();
          setQrCodeSvg(qr.createSvgTag());
        } catch (err) {
          console.error('QR code generation failed:', err);
          toast.error('Failed to generate QR code.');
        }
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Snippet not found or has expired.';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchSnippet();
  }, [fetchSnippet]);

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const toastId = toast.loading('Verifying password...');
    try {
      const response = await axios.post(`${API_URL}/verify/${id}`, { password });
      setSnippet(response.data);
      setRequiresPassword(false);
      setShowAIMetadata({
        summary: false,
        suggestions: false,
        explanation: false,
        securityIssues: false,
      });
      // Generate QR code after unlocking
      try {
        const qr = qrcode(8, 'L');
        qr.addData(window.location.href);
        qr.make();
        setQrCodeSvg(qr.createSvgTag());
      } catch (err) {
        console.error('QR code generation failed:', err);
        toast.error('Failed to generate QR code.');
      }
      toast.success('Access granted!', { id: toastId });
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to verify password.';
      setError(errorMessage);
      toast.error(errorMessage, { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text, type) => {
    navigator.clipboard.writeText(text);
    toast.success(`${type} copied to clipboard!`);
  };

  const downloadSnippet = () => {
    const extension = snippet.isCode ? snippet.language : 'txt';
    const filename = `${snippet.title || 'snippet'}.${extension}`;
    const blob = new Blob([snippet.content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Snippet downloaded!');
  };

  const toggleAIMetadata = (key) => {
    setShowAIMetadata((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleAnalyze = async () => {
    if (!snippet.content) return;
    setLoading(true);
    const toastId = toast.loading('Analyzing code...');
    try {
      const response = await axios.post(`${API_URL}/analyze`, {
        content: snippet.content,
        language: snippet.language,
      });
      setSnippet((prev) => ({
        ...prev,
        aiMetadata: { ...prev.aiMetadata, suggestions: response.data.suggestions },
      }));
      setShowAIMetadata((prev) => ({ ...prev, suggestions: true }));
      toast.success('Code analyzed!', { id: toastId });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to analyze code.', { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  const handleSummarize = async () => {
    if (!snippet.content) return;
    setLoading(true);
    const toastId = toast.loading('Generating summary...');
    try {
      const response = await axios.post(`${API_URL}/summarize`, {
        content: snippet.content,
        language: snippet.language,
      });
      setSnippet((prev) => ({
        ...prev,
        aiMetadata: { ...prev.aiMetadata, summary: response.data.summary },
      }));
      setShowAIMetadata((prev) => ({ ...prev, summary: true }));
      toast.success('Summary generated!', { id: toastId });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to generate summary.', { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  if (loading && !requiresPassword) {
    return (
      <div className="flex justify-center items-center p-10">
        <FiLoader size={40} className="animate-spin text-primary" aria-label="Loading" />
      </div>
    );
  }

  if (error && !requiresPassword) {
    return (
      <div className="text-center p-10 bg-dark-card rounded-lg border border-dark-border">
        <p className="text-red-500" role="alert">{error}</p>
      </div>
    );
  }

  if (requiresPassword) {
    return (
      <div className="max-w-md mx-auto bg-dark-card border border-dark-border p-6 rounded-lg shadow-lg">
        <h2 className="text-xl font-bold mb-4 text-white flex items-center gap-2">
          <FiLock aria-hidden="true" /> Password Required
        </h2>
        <form onSubmit={handlePasswordSubmit}>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-2 bg-slate-700 text-slate-300 border border-dark-border rounded-md mb-4"
            placeholder="Enter password"
            aria-label="Password"
            required
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 flex items-center justify-center gap-2 bg-primary hover:bg-primary-focus text-slate-900 rounded-md disabled:bg-slate-500"
            aria-label="Unlock Snippet"
          >
            {loading ? <FiLoader className="animate-spin" aria-hidden="true" /> : 'Unlock Snippet'}
          </button>
        </form>
      </div>
    );
  }

  return snippet ? (
    <ErrorBoundary>
      <div className="max-w-4xl mx-auto bg-dark-card border border-dark-border rounded-lg shadow-lg">
        <div className="p-4 flex flex-wrap gap-4 justify-between items-center border-b border-dark-border">
          <div>
            <h2 className="text-xl font-semibold text-white">
              {snippet.title || (snippet.isCode ? `Code Snippet: ${snippet.language}` : 'Plain Text')}
            </h2>
            {snippet.tags?.length > 0 && (
              <p className="text-sm text-slate-400 mt-1">
                Tags: {snippet.tags.join(', ')}
              </p>
            )}
          </div>
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => copyToClipboard(window.location.href, 'Link')}
              className="flex items-center gap-2 py-2 px-4 bg-slate-700 hover:bg-slate-600 rounded-md transition-colors text-sm"
              aria-label="Copy Snippet Link"
            >
              <FiShare2 aria-hidden="true" /> Copy Link
            </button>
            <button
              onClick={() => setShowQRCode(!showQRCode)}
              className="flex items-center gap-2 py-2 px-4 bg-slate-700 hover:bg-slate-600 rounded-md transition-colors text-sm"
              aria-label="Toggle QR Code"
            >
              <FiShare2 aria-hidden="true" /> {showQRCode ? 'Hide QR Code' : 'Show QR Code'}
            </button>
            <button
              onClick={downloadSnippet}
              className="flex items-center gap-2 py-2 px-4 bg-slate-700 hover:bg-slate-600 rounded-md transition-colors text-sm"
              aria-label="Download Snippet"
            >
              <FiDownload aria-hidden="true" /> Download
            </button>
            <button
              onClick={() => copyToClipboard(snippet.content, 'Content')}
              className="flex items-center gap-2 py-2 px-4 bg-primary hover:bg-primary-focus text-slate-900 rounded-md transition-colors text-sm font-semibold"
              aria-label="Copy Snippet Content"
            >
              <FiClipboard aria-hidden="true" /> Copy Content
            </button>
          </div>
        </div>
        {showQRCode && qrCodeSvg && (
          <div
            className="p-4 border-b border-dark-border flex justify-center"
            dangerouslySetInnerHTML={{ __html: qrCodeSvg }}
            aria-label="QR Code for Snippet Link"
          />
        )}
        {snippet.isCode ? (
          <Editor
            value={snippet.content}
            onValueChange={() => {}}
            highlight={(code) => highlight(code, languages[snippet.language] || languages.clike, snippet.language)}
            padding={15}
            readOnly
            className="bg-dark-card rounded-b-lg font-mono text-sm with-line-numbers"
            aria-label={`Code snippet in ${snippet.language}`}
          />
        ) : (
          <pre className="p-4 whitespace-pre-wrap break-words font-sans text-base" aria-label="Text snippet">
            {snippet.content}
          </pre>
        )}
        <div className="p-4 border-t border-dark-border">
          <h3 className="text-lg font-semibold text-white mb-2">AI Insights</h3>
          <div className="flex gap-2 flex-wrap mb-4">
            <button
              onClick={handleAnalyze}
              disabled={loading}
              className="py-2 px-4 bg-slate-700 hover:bg-slate-600 rounded-md text-sm disabled:bg-slate-500"
              aria-label="Analyze Code"
            >
              {loading ? <FiLoader className="animate-spin" aria-hidden="true" /> : 'Analyze Code'}
            </button>
            <button
              onClick={handleSummarize}
              disabled={loading}
              className="py-2 px-4 bg-slate-700 hover:bg-slate-600 rounded-md text-sm disabled:bg-slate-500"
              aria-label="Generate Summary"
            >
              {loading ? <FiLoader className="animate-spin" aria-hidden="true" /> : 'Generate Summary'}
            </button>
          </div>
          {snippet.aiMetadata?.summary && (
            <div className="mb-4">
              <button
                onClick={() => toggleAIMetadata('summary')}
                className="flex items-center gap-2 text-sm text-primary hover:text-primary-focus"
                aria-label={showAIMetadata.summary ? 'Hide Summary' : 'Show Summary'}
              >
                <FiInfo aria-hidden="true" /> {showAIMetadata.summary ? 'Hide Summary' : 'Show Summary'}
              </button>
              {showAIMetadata.summary && (
                <p className="text-sm text-slate-300 mt-2">{snippet.aiMetadata.summary}</p>
              )}
            </div>
          )}
          {snippet.aiMetadata?.suggestions?.length > 0 && (
            <div className="mb-4">
              <button
                onClick={() => toggleAIMetadata('suggestions')}
                className="flex items-center gap-2 text-sm text-primary hover:text-primary-focus"
                aria-label={showAIMetadata.suggestions ? 'Hide Suggestions' : 'Show Suggestions'}
              >
                <FiInfo aria-hidden="true" /> {showAIMetadata.suggestions ? 'Hide Suggestions' : 'Show Suggestions'}
              </button>
              {showAIMetadata.suggestions && (
                <ul className="text-sm text-slate-300 mt-2 list-disc pl-5">
                  {snippet.aiMetadata.suggestions.map((s, i) => (
                    <li key={i}>
                      {s.text} (Line {s.line}, {s.severity})
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
          {snippet.aiMetadata?.explanation && (
            <div className="mb-4">
              <button
                onClick={() => toggleAIMetadata('explanation')}
                className="flex items-center gap-2 text-sm text-primary hover:text-primary-focus"
                aria-label={showAIMetadata.explanation ? 'Hide Explanation' : 'Show Explanation'}
              >
                <FiInfo aria-hidden="true" /> {showAIMetadata.explanation ? 'Hide Explanation' : 'Show Explanation'}
              </button>
              {showAIMetadata.explanation && (
                <p className="text-sm text-slate-300 mt-2">{snippet.aiMetadata.explanation}</p>
              )}
            </div>
          )}
          {snippet.aiMetadata?.securityIssues?.length > 0 && (
            <div className="mb-4">
              <button
                onClick={() => toggleAIMetadata('securityIssues')}
                className="flex items-center gap-2 text-sm text-primary hover:text-primary-focus"
                aria-label={showAIMetadata.securityIssues ? 'Hide Security Issues' : 'Show Security Issues'}
              >
                <FiInfo aria-hidden="true" /> {showAIMetadata.securityIssues ? 'Hide Security Issues' : 'Show Security Issues'}
              </button>
              {showAIMetadata.securityIssues && (
                <ul className="text-sm text-slate-300 mt-2 list-disc pl-5">
                  {snippet.aiMetadata.securityIssues.map((s, i) => (
                    <li key={i}>
                      {s.text} (Line {s.line}, {s.severity})
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
      </div>
    </ErrorBoundary>
  ) : null;
};

export default SnippetPage;