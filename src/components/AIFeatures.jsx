import React, { useState, useEffect, useCallback } from 'react';
import { FiSettings, FiX, FiCheckCircle, FiCopy, FiPlus } from 'react-icons/fi';

// Mock API calls for demonstration - replace with your actual API
const mockAPI = {
  analyze: async (content, language) => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    return {
      suggestions: [
        { text: "Consider using const instead of let", line: 5, severity: "warning" },
        { text: "Function could be optimized", line: 12, severity: "info" }
      ]
    };
  },
  complete: async (content, language, cursorPosition) => {
    await new Promise(resolve => setTimeout(resolve, 800));
    return {
      completions: [
        { text: "const result = ", confidence: 0.9 },
        { text: "return value", confidence: 0.7 }
      ]
    };
  },
  explain: async (content, language) => {
    await new Promise(resolve => setTimeout(resolve, 1200));
    return {
      explanation: "This code defines a React component that manages AI features for code analysis and generation."
    };
  },
  generateTags: async (content, language) => {
    await new Promise(resolve => setTimeout(resolve, 600));
    return {
      tags: ["react", "javascript", "ai", "code-analysis"]
    };
  },
  generate: async (prompt, language) => {
    await new Promise(resolve => setTimeout(resolve, 1500));
    return {
      content: `// Generated based on: ${prompt}\nconst example = () => {\n  console.log('Generated code');\n};`
    };
  },
  security: async (content, language) => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    return {
      securityIssues: [
        { text: "Potential XSS vulnerability", line: 8, severity: "high" },
        { text: "Unescaped user input", line: 15, severity: "medium" }
      ]
    };
  },
  summarize: async (content, language) => {
    await new Promise(resolve => setTimeout(resolve, 900));
    return {
      summary: "This component provides AI-powered features for code analysis, completion, explanation, and security checking."
    };
  }
};

const AIFeatures = ({
  content,
  language,
  cursorPosition,
  setContent,
  setTags,
  isCode,
  setIsCode,
  onSuggestionsUpdate,
  onExplanationUpdate,
  onSecurityIssuesUpdate,
  onSummaryUpdate,
  initialSettings = {}
}) => {
  const [aiSettings, setAISettings] = useState({
    codeAnalysis: false,
    codeCompletion: false,
    codeExplanation: false,
    tagGeneration: false,
    contentGeneration: false,
    securityChecks: false,
    summarization: false,
    ...initialSettings
  });

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [completions, setCompletions] = useState([]);
  const [explanation, setExplanation] = useState('');
  const [generatedTags, setGeneratedTags] = useState([]);
  const [securityIssues, setSecurityIssues] = useState([]);
  const [summary, setSummary] = useState('');
  const [loading, setLoading] = useState({});
  const [error, setError] = useState('');

  const showToast = useCallback((message, type = 'success') => {
    // Simple toast implementation - replace with your preferred toast library
    console.log(`${type.toUpperCase()}: ${message}`);
    // You can integrate with react-hot-toast, react-toastify, etc.
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

  const handleAnalyzeCode = async () => {
    if (!isCode || !content.trim()) {
      showToast('Please enter code to analyze', 'error');
      return;
    }
    
    setLoadingState('codeAnalysis', true);
    setError('');
    
    try {
      const response = await mockAPI.analyze(content, language);
      setSuggestions(response.suggestions);
      onSuggestionsUpdate?.(response.suggestions);
      showToast('Code analyzed successfully');
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
      const response = await mockAPI.complete(content, language, cursorPosition);
      setCompletions(response.completions);
      showToast('Completions generated');
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
      const response = await mockAPI.explain(content, language);
      setExplanation(response.explanation);
      onExplanationUpdate?.(response.explanation);
      showToast('Explanation generated');
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
      const response = await mockAPI.generateTags(content, language);
      setGeneratedTags(response.tags);
      setTags?.(response.tags.join(', '));
      showToast('Tags generated');
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
      const response = await mockAPI.generate(prompt, language);
      setContent?.(response.content);
      setIsCode?.(language !== 'plaintext');
      showToast('Content generated');
      setPrompt(''); // Clear prompt after successful generation
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
      const response = await mockAPI.security(content, language);
      setSecurityIssues(response.securityIssues);
      onSecurityIssuesUpdate?.(response.securityIssues);
      showToast('Security check completed');
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
      const response = await mockAPI.summarize(content, language);
      setSummary(response.summary);
      onSummaryUpdate?.(response.summary);
      showToast('Summary generated');
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
    }
  };

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      showToast('Copied to clipboard');
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
    setError('');
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

  const hasResults = suggestions.length > 0 || securityIssues.length > 0 || 
                    explanation || generatedTags.length > 0 || summary || completions.length > 0;

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => setIsSettingsOpen(!isSettingsOpen)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          aria-label="Toggle AI settings"
          data-testid="ai-settings-button"
        >
          <FiSettings className="w-4 h-4" /> 
          AI Features
        </button>
        
        {hasResults && (
          <button
            onClick={clearResults}
            className="px-3 py-1 text-sm text-slate-400 hover:text-white border border-slate-600 rounded hover:border-slate-500 transition-colors"
          >
            Clear Results
          </button>
        )}
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-900/50 border border-red-700 rounded-lg text-red-300 text-sm">
          {error}
        </div>
      )}

      {isSettingsOpen && (
        <div className="mb-4 p-4 bg-slate-700 rounded-lg border border-slate-600">
          <div className="flex justify-between items-center mb-4">
            <h4 className="text-lg font-semibold text-white">AI Features Configuration</h4>
            <button
              onClick={() => setIsSettingsOpen(false)}
              className="text-slate-400 hover:text-white transition-colors"
              aria-label="Close AI settings"
            >
              <FiX className="w-5 h-5" />
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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
      )}

      {aiSettings.contentGeneration && (
        <div className="mb-4 p-4 bg-slate-700 rounded-lg border border-slate-600">
          <h4 className="text-lg font-semibold text-white mb-3">Generate Content</h4>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="e.g., 'Write a React component for a todo list'"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="flex-1 p-3 bg-slate-600 text-white border border-slate-500 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              aria-label="Content generation prompt"
              data-testid="generate-prompt-input"
              onKeyPress={(e) => e.key === 'Enter' && !loading.contentGeneration && handleGenerateContent()}
            />
            <button
              onClick={handleGenerateContent}
              disabled={loading.contentGeneration || !prompt.trim()}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              aria-label="Generate content"
              data-testid="generate-button"
            >
              {loading.contentGeneration ? 'Generating...' : 'Generate'}
            </button>
          </div>
        </div>
      )}

      {(aiSettings.codeAnalysis || aiSettings.securityChecks || aiSettings.codeExplanation || 
        aiSettings.tagGeneration || aiSettings.summarization || aiSettings.codeCompletion) && (
        <div className="mb-4">
          <h4 className="text-lg font-semibold text-white mb-3">AI Actions</h4>
          <div className="flex gap-2 flex-wrap">
            {aiSettings.codeAnalysis && (
              <button
                onClick={handleAnalyzeCode}
                disabled={loading.codeAnalysis || !content.trim() || !isCode}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
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
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
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
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
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
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
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
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
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
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
                aria-label="Summarize content"
                data-testid="summarize-button"
              >
                {loading.summarization ? 'Summarizing...' : 'Summarize'}
              </button>
            )}
          </div>
        </div>
      )}

      {hasResults && (
        <div className="space-y-4">
          <h4 className="text-lg font-semibold text-white">AI Results</h4>
          
          {completions.length > 0 && (
            <div className="p-4 bg-slate-700 rounded-lg border border-slate-600">
              <div className="flex items-center justify-between mb-3">
                <h5 className="text-md font-medium text-slate-300">Code Completions</h5>
              </div>
              <div className="space-y-2">
                {completions.map((completion, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-slate-600 rounded border border-slate-500">
                    <div className="flex-1">
                      <code className="text-slate-200 text-sm">{completion.text}</code>
                      <span className="ml-2 text-xs text-slate-400">
                        ({Math.round(completion.confidence * 100)}% confidence)
                      </span>
                    </div>
                    <button
                      onClick={() => applyCompletion(completion)}
                      className="ml-3 p-1 text-slate-400 hover:text-white transition-colors"
                      title="Apply completion"
                    >
                      <FiPlus className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {suggestions.length > 0 && (
            <div className="p-4 bg-slate-700 rounded-lg border border-slate-600">
              <h5 className="text-md font-medium text-slate-300 mb-3">Code Analysis</h5>
              <ul className="space-y-2">
                {suggestions.map((suggestion, index) => (
                  <li key={index} className="flex items-start gap-2 p-2 bg-slate-600 rounded">
                    <FiCheckCircle className={`w-4 h-4 mt-0.5 ${getSeverityColor(suggestion.severity)}`} />
                    <div className="flex-1">
                      <span className="text-slate-200">{suggestion.text}</span>
                      <div className="text-xs text-slate-400 mt-1">
                        Line {suggestion.line} • {suggestion.severity}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {securityIssues.length > 0 && (
            <div className="p-4 bg-slate-700 rounded-lg border border-red-600">
              <h5 className="text-md font-medium text-red-300 mb-3">Security Issues</h5>
              <ul className="space-y-2">
                {securityIssues.map((issue, index) => (
                  <li key={index} className="flex items-start gap-2 p-2 bg-red-900/30 rounded border border-red-700">
                    <div className={`w-2 h-2 rounded-full mt-2 ${
                      issue.severity === 'high' ? 'bg-red-500' : 
                      issue.severity === 'medium' ? 'bg-yellow-500' : 'bg-blue-500'
                    }`} />
                    <div className="flex-1">
                      <span className="text-slate-200">{issue.text}</span>
                      <div className="text-xs text-slate-400 mt-1">
                        Line {issue.line} • {issue.severity} severity
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {explanation && (
            <div className="p-4 bg-slate-700 rounded-lg border border-slate-600">
              <div className="flex items-center justify-between mb-3">
                <h5 className="text-md font-medium text-slate-300">Explanation</h5>
                <button
                  onClick={() => copyToClipboard(explanation)}
                  className="p-1 text-slate-400 hover:text-white transition-colors"
                  title="Copy explanation"
                >
                  <FiCopy className="w-4 h-4" />
                </button>
              </div>
              <p className="text-slate-200 leading-relaxed">{explanation}</p>
            </div>
          )}

          {generatedTags.length > 0 && (
            <div className="p-4 bg-slate-700 rounded-lg border border-slate-600">
              <h5 className="text-md font-medium text-slate-300 mb-3">Generated Tags</h5>
              <div className="flex flex-wrap gap-2">
                {generatedTags.map((tag, index) => (
                  <span key={index} className="px-3 py-1 bg-blue-600 text-white rounded-full text-sm">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {summary && (
            <div className="p-4 bg-slate-700 rounded-lg border border-slate-600">
              <div className="flex items-center justify-between mb-3">
                <h5 className="text-md font-medium text-slate-300">Summary</h5>
                <button
                  onClick={() => copyToClipboard(summary)}
                  className="p-1 text-slate-400 hover:text-white transition-colors"
                  title="Copy summary"
                >
                  <FiCopy className="w-4 h-4" />
                </button>
              </div>
              <p className="text-slate-200 leading-relaxed">{summary}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AIFeatures;