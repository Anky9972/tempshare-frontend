import React, { useState, useCallback } from 'react';
import { FiX, FiCheckCircle, FiCopy, FiPlus } from 'react-icons/fi';

// Base URL for API calls with fallback
const API_BASE_URL = import.meta.env.VITE_APP_API_URL || 'http://localhost:5000/api/snippets';
console.log('API Base URL:', API_BASE_URL);

const AIFeatures = ({
  content,
  language,
  cursorPosition,
  setContent,
  setTags,
  isCode,
  setIsCode,
  setLanguage, // New prop for setting language
  onSuggestionsUpdate,
  onExplanationUpdate,
  onSecurityIssuesUpdate,
  onSummaryUpdate,
  onClose,
}) => {
  const [aiSettings, setAISettings] = useState({
    codeAnalysis: false,
    codeCompletion: false,
    codeExplanation: false,
    tagGeneration: false,
    contentGeneration: false,
    securityChecks: false,
    summarization: false,
    languageDetection: false, // New setting
  });
  const [prompt, setPrompt] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [completions, setCompletions] = useState([]);
  const [explanation, setExplanation] = useState('');
  const [generatedTags, setGeneratedTags] = useState([]);
  const [securityIssues, setSecurityIssues] = useState([]);
  const [summary, setSummary] = useState('');
  const [detectedLanguage, setDetectedLanguage] = useState(''); // New state for detected language
  const [loading, setLoading] = useState({});
  const [error, setError] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState(null);

  const showToast = useCallback((message, type = 'success') => {
    console.log(`${type.toUpperCase()}: ${message}`);
    // Using react-hot-toast as per HomePage
    import('react-hot-toast').then((toast) => {
      if (type === 'error') {
        toast.default.error(message);
      } else {
        toast.default.success(message);
      }
    });
  }, []);

  const setLoadingState = useCallback((feature, isLoading) => {
    setLoading(prev => ({ ...prev, [feature]: isLoading }));
  }, []);

  const handleError = useCallback((error, defaultMessage) => {
    const errorMessage = error?.response?.data?.message || error?.message || defaultMessage;
    setError(errorMessage);
    showToast(errorMessage, 'error');
  }, [showToast]);

  const handleToggleFeature = useCallback((feature) => {
    setAISettings(prev => ({ ...prev, [feature]: !prev[feature] }));
  }, []);

  const openModal = (contentType) => {
    setModalContent(contentType);
    setModalOpen(true);
    setError('');
  };

  const closeModal = () => {
    setModalOpen(false);
    setModalContent(null);
    setPrompt('');
  };

  const handleDetectLanguage = async () => {
    if (!content.trim()) {
      showToast('Please enter content to detect language', 'error');
      return;
    }

    setLoadingState('languageDetection', true);
    setError('');

    try {
      if (!API_BASE_URL) throw new Error('API base URL is not configured');
      const response = await fetch(`${API_BASE_URL}/detect-language`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content })
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to detect language');
      }
      const { language } = await response.json();
      setDetectedLanguage(language);
      showToast(`Detected language: ${language}`);
      openModal('languageDetection');
    } catch (error) {
      // Fallback to client-side heuristic
      const detected = detectLanguageHeuristic(content);
      setDetectedLanguage(detected);
      showToast(`Detected language (heuristic): ${detected}`);
      openModal('languageDetection');
    } finally {
      setLoadingState('languageDetection', false);
    }
  };

  // Client-side heuristic for language detection
  const detectLanguageHeuristic = (text) => {
    const trimmedText = text.trim().toLowerCase();
    if (!trimmedText) return 'plaintext';

    const patterns = [
      { language: 'javascript', regex: /(function\s+\w+\s*\(|\bconst\b|\blet\b|\bvar\b|\bimport\b|\bexport\b)/ },
      { language: 'typescript', regex: /(interface\s+\w+|\btype\b\s+\w+|\bimplements\b)/ },
      { language: 'python', regex: /(def\s+\w+\s*\(|\bimport\b\s+\w+|\bfrom\b\s+\w+)/ },
      { language: 'css', regex: /(\w+\s*\{\s*[\w-]+\s*:\s*[^;]+;)/ },
      { language: 'markup', regex: /(<!DOCTYPE\s+html>|<html\b|<div\b|<span\b)/ },
      { language: 'json', regex: /^\s*[\{\[]/ },
      { language: 'bash', regex: /(#\s*!\/bin\/bash|\bfunction\b\s+\w+)/ },
      { language: 'java', regex: /(public\s+class\s+\w+|\bvoid\s+\w+\s*\()/ },
      { language: 'c', regex: /(#include\s+<[\w.]+>|int\s+main\s*\()/ },
      { language: 'cpp', regex: /(#include\s+<[\w.]+>|std::\w+)/ },
      { language: 'php', regex: /(<?php|\$\w+\s*=)/ },
      { language: 'ruby', regex: /(def\s+\w+\s*|\bclass\s+\w+)/ },
      { language: 'go', regex: /(package\s+\w+|\bfunc\s+\w+\s*\()/ },
    ];

    for (const { language, regex } of patterns) {
      if (regex.test(trimmedText)) return language;
    }
    return 'plaintext';
  };

  const applyDetectedLanguage = () => {
    if (detectedLanguage) {
      setLanguage(detectedLanguage);
      setIsCode(detectedLanguage !== 'plaintext');
      showToast(`Applied language: ${detectedLanguage}`);
      closeModal();
    }
  };

  // Existing API handlers (unchanged except for imports)
  const handleAnalyzeCode = async () => {
    if (!isCode || !content.trim()) {
      showToast('Please enter code to analyze', 'error');
      return;
    }
    
    setLoadingState('codeAnalysis', true);
    setError('');
    
    try {
      if (!API_BASE_URL) throw new Error('API base URL is not configured');
      const response = await fetch(`${API_BASE_URL}/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, language })
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to analyze code');
      }
      const { suggestions } = await response.json();
      setSuggestions(suggestions);
      onSuggestionsUpdate?.(suggestions);
      showToast('Code analyzed successfully');
      openModal('analysis');
    } catch (error) {
      handleError(error, 'Failed to analyze code');
    } finally {
      setLoadingState('codeAnalysis', false);
    }
  };

  const handleCompleteCode = async () => {
    if (!isCode || !content.trim()) {
      showToast('Please enter code to complete', 'error');
      return;
    }
    
    setLoadingState('codeCompletion', true);
    setError('');
    
    try {
      if (!API_BASE_URL) throw new Error('API base URL is not configured');
      const cursor = typeof cursorPosition === 'number'
        ? { line: content.slice(0, cursorPosition).split('\n').length, column: cursorPosition }
        : cursorPosition || { line: 1, column: 0 };
      const response = await fetch(`${API_BASE_URL}/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, language, cursorPosition: cursor })
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to generate completions');
      }
      const { completions } = await response.json();
      setCompletions(completions.map(text => ({ text, confidence: 0.9 })));
      showToast('Completions generated');
      openModal('completion');
    } catch (error) {
      handleError(error, 'Failed to generate completions');
    } finally {
      setLoadingState('codeCompletion', false);
    }
  };

  const handleExplainCode = async () => {
    if (!content.trim()) {
      showToast('Please enter content to explain', 'error');
      return;
    }
    
    setLoadingState('codeExplanation', true);
    setError('');
    
    try {
      if (!API_BASE_URL) throw new Error('API base URL is not configured');
      const response = await fetch(`${API_BASE_URL}/explain`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, language })
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to generate explanation');
      }
      const { explanation } = await response.json();
      setExplanation(explanation);
      onExplanationUpdate?.(explanation);
      showToast('Explanation generated');
      openModal('explanation');
    } catch (error) {
      handleError(error, 'Failed to generate explanation');
    } finally {
      setLoadingState('codeExplanation', false);
    }
  };

  const handleGenerateTags = async () => {
    if (!content.trim()) {
      showToast('Please enter content to generate tags', 'error');
      return;
    }
    
    setLoadingState('tagGeneration', true);
    setError('');
    
    try {
      if (!API_BASE_URL) throw new Error('API base URL is not configured');
      const response = await fetch(`${API_BASE_URL}/tags`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, language })
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to generate tags');
      }
      const { tags } = await response.json();
      setGeneratedTags(tags);
      setTags?.(tags.join(', '));
      showToast('Tags generated');
      openModal('tags');
    } catch (error) {
      handleError(error, 'Failed to generate tags');
    } finally {
      setLoadingState('tagGeneration', false);
    }
  };

  const handleGenerateContent = async () => {
    if (!prompt.trim()) {
      showToast('Please enter a prompt to generate content', 'error');
      return;
    }
    
    setLoadingState('contentGeneration', true);
    setError('');
    
    try {
      if (!API_BASE_URL) throw new Error('API base URL is not configured');
      const response = await fetch(`${API_BASE_URL}/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, language })
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to generate content');
      }
      const { content: generatedContent } = await response.json();
      setContent?.(generatedContent);
      setIsCode?.(language !== 'plaintext');
      showToast('Content generated');
      openModal('generatedContent');
    } catch (error) {
      handleError(error, 'Failed to generate content');
    } finally {
      setLoadingState('contentGeneration', false);
    }
  };

  const handleSecurityCheck = async () => {
    if (!isCode || !content.trim()) {
      showToast('Please enter code to check for security issues', 'error');
      return;
    }
    
    setLoadingState('securityChecks', true);
    setError('');
    
    try {
      if (!API_BASE_URL) throw new Error('API base URL is not configured');
      const response = await fetch(`${API_BASE_URL}/security`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, language })
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to perform security check');
      }
      const { securityIssues } = await response.json();
      setSecurityIssues(securityIssues);
      onSecurityIssuesUpdate?.(securityIssues);
      showToast('Security check completed');
      openModal('security');
    } catch (error) {
      handleError(error, 'Failed to perform security check');
    } finally {
      setLoadingState('securityChecks', false);
    }
  };

  const handleSummarize = async () => {
    if (!content.trim()) {
      showToast('Please enter content to summarize', 'error');
      return;
    }
    
    setLoadingState('summarization', true);
    setError('');
    
    try {
      if (!API_BASE_URL) throw new Error('API base URL is not configured');
      const response = await fetch(`${API_BASE_URL}/summarize`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, language })
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to generate summary');
      }
      const { summary } = await response.json();
      setSummary(summary);
      onSummaryUpdate?.(summary);
      showToast('Summary generated');
      openModal('summary');
    } catch (error) {
      handleError(error, 'Failed to generate summary');
    } finally {
      setLoadingState('summarization', false);
    }
  };

  const applyCompletion = (completion) => {
    if (setContent) {
      const beforeCursor = content.slice(0, cursorPosition || content.length);
      const afterCursor = content.slice(cursorPosition || content.length);
      setContent(beforeCursor + completion.text + afterCursor);
      showToast('Completion applied');
      closeModal();
    }
  };

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      showToast('Copied to clipboard');
      closeModal();
    } catch (error) {
      showToast('Failed to copy', 'error');
    }
  };

  const clearResults = () => {
    setSuggestions([]);
    setCompletions([]);
    setExplanation('');
    setGeneratedTags([]);
    setSecurityIssues([]);
    setSummary('');
    setDetectedLanguage('');
    setError('');
    setPrompt('');
    closeModal();
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'high': return 'text-red-400';
      case 'medium': return 'text-yellow-400';
      case 'warning': return 'text-orange-400';
      case 'info': return 'text-blue-400';
      default: return 'text-slate-400';
    }
  };

  const renderModalContent = () => {
    switch (modalContent) {
      case 'generate':
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Generate Content</h3>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="e.g., 'Write a React component for a todo list'"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="flex-1 p-2 bg-slate-600 text-white border border-slate-500 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                aria-label="Content generation prompt"
                data-testid="generate-prompt-input"
                onKeyPress={(e) => e.key === 'Enter' && !loading.contentGeneration && handleGenerateContent()}
              />
              <button
                onClick={handleGenerateContent}
                disabled={loading.contentGeneration || !prompt.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                aria-label="Generate content"
                data-testid="generate-button"
              >
                {loading.contentGeneration ? 'Generating...' : 'Generate'}
              </button>
            </div>
          </div>
        );
      case 'generatedContent':
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Generated Content</h3>
            <div className="p-3 bg-slate-600 rounded-lg border border-slate-500">
              <div className="flex items-center justify-between mb-2">
                <h6 className="text-sm font-medium text-slate-300">Generated Content</h6>
                <button
                  onClick={() => copyToClipboard(content)}
                  className="p-1 text-slate-400 hover:text-white transition-colors"
                  title="Copy generated content"
                >
                  <FiCopy className="w-4 h-4" />
                </button>
              </div>
              <p className="text-slate-200 text-xs leading-relaxed">{content}</p>
            </div>
          </div>
        );
      case 'summary':
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Summary</h3>
            <div className="p-3 bg-slate-600 rounded-lg border border-slate-500">
              <div className="flex items-center justify-between mb-2">
                <h6 className="text-sm font-medium text-slate-300">Summary</h6>
                <button
                  onClick={() => copyToClipboard(summary)}
                  className="p-1 text-slate-400 hover:text-white transition-colors"
                  title="Copy summary"
                >
                  <FiCopy className="w-4 h-4" />
                </button>
              </div>
              <p className="text-slate-200 text-xs leading-relaxed">{summary}</p>
            </div>
          </div>
        );
      case 'analysis':
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Code Analysis</h3>
            <div className="p-3 bg-slate-600 rounded-lg border border-slate-500">
              <h6 className="text-sm font-medium text-slate-300 mb-2">Suggestions</h6>
              <ul className="space-y-2">
                {suggestions.map((suggestion, index) => (
                  <li key={index} className="flex items-start gap-2 p-2 bg-slate-500 rounded">
                    <FiCheckCircle className={`w-4 h-4 mt-0.5 ${getSeverityColor(suggestion.severity)}`} />
                    <div className="flex-1">
                      <span className="text-slate-200 text-xs">{suggestion.text}</span>
                      <div className="text-xs text-slate-400">
                        Line {suggestion.line} • {suggestion.severity}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        );
      case 'completion':
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Code Completions</h3>
            <div className="p-3 bg-slate-600 rounded-lg border border-slate-500">
              <div className="space-y-2">
                {completions.map((completion, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-slate-500 rounded border border-slate-400">
                    <div className="flex-1">
                      <code className="text-slate-200 text-xs">{completion.text}</code>
                      <span className="ml-2 text-xs text-slate-400">
                        ({Math.round(completion.confidence * 100)}% confidence)
                      </span>
                    </div>
                    <button
                      onClick={() => applyCompletion(completion)}
                      className="ml-2 p-1 text-slate-400 hover:text-white transition-colors"
                      title="Apply completion"
                    >
                      <FiPlus className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      case 'explanation':
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Explanation</h3>
            <div className="p-3 bg-slate-600 rounded-lg border border-slate-500">
              <div className="flex items-center justify-between mb-2">
                <h6 className="text-sm font-medium text-slate-300">Explanation</h6>
                <button
                  onClick={() => copyToClipboard(explanation)}
                  className="p-1 text-slate-400 hover:text-white transition-colors"
                  title="Copy explanation"
                >
                  <FiCopy className="w-4 h-4" />
                </button>
              </div>
              <p className="text-slate-200 text-xs leading-relaxed">{explanation}</p>
            </div>
          </div>
        );
      case 'tags':
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Generated Tags</h3>
            <div className="p-3 bg-slate-600 rounded-lg border border-slate-500">
              <h6 className="text-sm font-medium text-slate-300 mb-2">Tags</h6>
              <div className="flex flex-wrap gap-2">
                {generatedTags.map((tag, index) => (
                  <span key={index} className="px-2 py-1 bg-blue-600 text-white rounded-full text-xs">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        );
      case 'security':
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Security Issues</h3>
            <div className="p-3 bg-slate-600 rounded-lg border border-red-600">
              <h6 className="text-sm font-medium text-red-300 mb-2">Security Issues</h6>
              <ul className="space-y-2">
                {securityIssues.map((issue, index) => (
                  <li key={index} className="flex items-start gap-2 p-2 bg-red-900/30 rounded border border-red-700">
                    <div className={`w-2 h-2 rounded-full mt-1.5 ${
                      issue.severity === 'high' ? 'bg-red-500' : 
                      issue.severity === 'medium' ? 'bg-yellow-500' : 'bg-blue-500'
                    }`} />
                    <div className="flex-1">
                      <span className="text-slate-200 text-xs">{issue.text}</span>
                      <div className="text-xs text-slate-400">
                        Line {issue.line} • {issue.severity} severity
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        );
      case 'languageDetection':
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Detected Language</h3>
            <div className="p-3 bg-slate-600 rounded-lg border border-slate-500">
              <div className="flex items-center justify-between mb-2">
                <h6 className="text-sm font-medium text-slate-300">Detected Language</h6>
                <button
                  onClick={applyDetectedLanguage}
                  className="p-1 text-slate-400 hover:text-white transition-colors"
                  title="Apply detected language"
                >
                  <FiPlus className="w-4 h-4" />
                </button>
              </div>
              <p className="text-slate-200 text-xs leading-relaxed">
                {detectedLanguage ? `${detectedLanguage.charAt(0).toUpperCase() + detectedLanguage.slice(1)}` : 'No language detected'}
              </p>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="p-4">
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h4 className="text-md font-semibold text-white">AI Features</h4>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors"
            aria-label="Close AI dropdown"
            data-testid="close-ai-dropdown"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>

        {!import.meta.env.VITE_APP_API_URL && (
          <div className="p-3 bg-yellow-900/50 border border-yellow-700 rounded-lg text-yellow-300 text-sm">
            Warning: API base URL is not configured. Using fallback URL: {API_BASE_URL}
          </div>
        )}

        {error && (
          <div className="p-3 bg-red-900/50 border border-red-700 rounded-lg text-red-300 text-sm">
            {error}
          </div>
        )}

        <div className="space-y-2">
          <h5 className="text-sm font-medium text-slate-300">Enable Features</h5>
          <div className="grid grid-cols-1 gap-2">
            {Object.entries(aiSettings).map(([feature, enabled]) => (
              <label key={feature} className="flex items-center gap-3 text-sm text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={enabled}
                  onChange={() => handleToggleFeature(feature)}
                  className="w-4 h-4 text-blue-600 bg-slate-700 border-slate-600 rounded focus:ring-blue-500 focus:ring-2"
                  aria-label={feature}
                />
                <span className="select-none">
                  {feature.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase())}
                </span>
              </label>
            ))}
          </div>
        </div>

        {(aiSettings.codeAnalysis || aiSettings.securityChecks || aiSettings.codeExplanation || 
          aiSettings.tagGeneration || aiSettings.summarization || aiSettings.codeCompletion || 
          aiSettings.contentGeneration || aiSettings.languageDetection) && (
          <div className="space-y-2">
            <h5 className="text-sm font-medium text-slate-300">AI Actions</h5>
            <div className="flex flex-wrap gap-2">
              {aiSettings.codeAnalysis && (
                <button
                  onClick={handleAnalyzeCode}
                  disabled={loading.codeAnalysis || !content.trim() || !isCode}
                  className="px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
                  aria-label="Analyze code"
                  data-testid="analyze-button"
                >
                  {loading.codeAnalysis ? 'Analyzing...' : 'Analyze Code'}
                </button>
              )}
              {aiSettings.codeCompletion && (
                <button
                  onClick={handleCompleteCode}
                  disabled={loading.codeCompletion || !content.trim() || !isCode}
                  className="px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
                  aria-label="Complete code"
                  data-testid="complete-button"
                >
                  {loading.codeCompletion ? 'Completing...' : 'Complete Code'}
                </button>
              )}
              {aiSettings.securityChecks && (
                <button
                  onClick={handleSecurityCheck}
                  disabled={loading.securityChecks || !content.trim() || !isCode}
                  className="px-3 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
                  aria-label="Check security"
                  data-testid="security-button"
                >
                  {loading.securityChecks ? 'Checking...' : 'Security Check'}
                </button>
              )}
              {aiSettings.codeExplanation && (
                <button
                  onClick={handleExplainCode}
                  disabled={loading.codeExplanation || !content.trim()}
                  className="px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
                  aria-label="Explain code"
                  data-testid="explain-button"
                >
                  {loading.codeExplanation ? 'Explaining...' : 'Explain Content'}
                </button>
              )}
              {aiSettings.tagGeneration && (
                <button
                  onClick={handleGenerateTags}
                  disabled={loading.tagGeneration || !content.trim()}
                  className="px-3 py-1 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
                  aria-label="Generate tags"
                  data-testid="tags-button"
                >
                  {loading.tagGeneration ? 'Generating...' : 'Generate Tags'}
                </button>
              )}
              {aiSettings.summarization && (
                <button
                  onClick={handleSummarize}
                  disabled={loading.summarization || !content.trim()}
                  className="px-3 py-1 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
                  aria-label="Summarize content"
                  data-testid="summarize-button"
                >
                  {loading.summarization ? 'Summarizing...' : 'Summarize'}
                </button>
              )}
              {aiSettings.contentGeneration && (
                <button
                  onClick={() => openModal('generate')}
                  disabled={loading.contentGeneration}
                  className="px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
                  aria-label="Open content generation prompt"
                  data-testid="open-generate-button"
                >
                  {loading.contentGeneration ? 'Generating...' : 'Generate Content'}
                </button>
              )}
              {aiSettings.languageDetection && (
                <button
                  onClick={handleDetectLanguage}
                  disabled={loading.languageDetection || !content.trim()}
                  className="px-3 py-1 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
                  aria-label="Detect language"
                  data-testid="detect-language-button"
                >
                  {loading.languageDetection ? 'Detecting...' : 'Detect Language'}
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {modalOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          role="dialog"
          aria-labelledby="modal-title"
          aria-modal="true"
        >
          <div className="bg-slate-800 rounded-lg p-6 w-full max-w-lg">
            <div className="flex justify-between items-center mb-4">
              <h2 id="modal-title" className="text-lg font-semibold text-white">
                {modalContent === 'generate' ? 'Generate Content' :
                 modalContent === 'generatedContent' ? 'Generated Content' :
                 modalContent === 'summary' ? 'Summary' :
                 modalContent === 'analysis' ? 'Code Analysis' :
                 modalContent === 'completion' ? 'Code Completions' :
                 modalContent === 'explanation' ? 'Explanation' :
                 modalContent === 'tags' ? 'Generated Tags' :
                 modalContent === 'security' ? 'Security Issues' :
                 'Detected Language'}
              </h2>
              <button
                onClick={closeModal}
                className="text-slate-400 hover:text-white transition-colors"
                aria-label="Close modal"
                data-testid="close-modal-button"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>
            {error && (
              <div className="p-3 bg-red-900/50 border border-red-700 rounded-lg text-red-300 text-sm mb-4">
                {error}
              </div>
            )}
            {renderModalContent()}
            <div className="mt-4 flex justify-end gap-2">
              <button
                onClick={clearResults}
                className="px-3 py-1 text-sm text-slate-400 hover:text-white border border-slate-600 rounded hover:border-slate-500 transition-colors"
                aria-label="Clear results"
              >
                Clear
              </button>
              <button
                onClick={closeModal}
                className="px-3 py-1 text-sm bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors"
                aria-label="Close modal"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AIFeatures;