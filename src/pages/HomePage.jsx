import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import Editor from '@monaco-editor/react';
import History from '../components/History';
import MultimediaUpload from '../components/MultimediaUpload';
import {
  FiSave,
  FiLoader,
  FiLock,
  FiClock,
  FiCode,
  FiFileText,
  FiCopy,
  FiTrash2,
  FiMaximize2,
  FiMinimize2,
  FiEye,
  FiEyeOff,
  FiDownload,
  FiUpload,
  FiSearch,
  FiSettings,
  FiRotateCcw,
  FiRotateCw,
  FiBookmark,
  FiShare2,
  FiPrinter,
  FiEdit3,
  FiGlobe,
} from 'react-icons/fi';
import { SiCodemagic } from 'react-icons/si';
import AIFeatures from '../components/AIFeatures';

const API_URL = import.meta.env.VITE_APP_API_URL;
const languageOptions = [
  'javascript',
  'typescript',
  'css',
  'markup',
  'python',
  'json',
  'bash',
  'java',
  'c',
  'cpp',
  'php',
  'ruby',
  'go',
  'plaintext',
];
const AUTOSAVE_DELAY = 2000;
const FONT_SIZES = [10, 12, 14, 16, 18, 20, 24];
const THEMES = ['tomorrow', 'dark', 'light', 'solarized'];

function HomePage() {
  const [content, setContent] = useState('');
  const [isCode, setIsCode] = useState(false);
  const [language, setLanguage] = useState('javascript');
  const [password, setPassword] = useState('');
  const [expireIn, setExpireIn] = useState('');
  const [loading, setLoading] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [wordCount, setWordCount] = useState(0);
  const [lineCount, setLineCount] = useState(1);
  const [lastSaved, setLastSaved] = useState(null);
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [fontSize, setFontSize] = useState(14);
  const [theme, setTheme] = useState('tomorrow');
  const [showSettings, setShowSettings] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [replaceTerm, setReplaceTerm] = useState('');
  const [showSearchReplace, setShowSearchReplace] = useState(false);
  const [cursorPosition, setCursorPosition] = useState({ line: 1, column: 1 });
  const [title, setTitle] = useState('');
  const [tags, setTags] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [charCount, setCharCount] = useState(0);
  const [selectedCount, setSelectedCount] = useState(0);
  const [undoStack, setUndoStack] = useState([]);
  const [redoStack, setRedoStack] = useState([]);
  const [showPreview, setShowPreview] = useState(false);
  const [showHistory, setShowHistory] = useState(false); // Added for mobile history toggle
  const [aiMetadata, setAIMetadata] = useState({
    suggestions: [],
    securityIssues: [],
    explanation: '',
    summary: '',
    files: [],
  });
  const [showAIDropdown, setShowAIDropdown] = useState(false);

  const textareaRef = useRef(null);
  const editorRef = useRef(null);
  const aiDropdownRef = useRef(null);
  const navigate = useNavigate();

  // Handle clicks outside the dropdown to close it
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (aiDropdownRef.current && !aiDropdownRef.current.contains(event.target)) {
        setShowAIDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (!autoSaveEnabled || !content.trim() || !isDirty) return;

    const timer = setTimeout(() => {
      handleAutoSave();
    }, AUTOSAVE_DELAY);

    return () => clearTimeout(timer);
  }, [content, autoSaveEnabled, isDirty]);

  useEffect(() => {
    const words = content.trim() ? content.trim().split(/\s+/).length : 0;
    const lines = content ? content.split('\n').length : 1;
    setWordCount(words);
    setLineCount(lines);
    setCharCount(content.length);
    setIsDirty(true);

    if (content !== undoStack[undoStack.length - 1]) {
      setUndoStack((prev) => [...prev.slice(-49), content]);
      setRedoStack([]);
    }
  }, [content]);

  const handleTextareaChange = (e) => {
    const textarea = e.target;
    const cursorPos = textarea.selectionStart;
    const textBeforeCursor = content.substring(0, cursorPos);
    const line = textBeforeCursor.split('\n').length;
    const column = textBeforeCursor.split('\n').pop().length + 1;
    setCursorPosition({ line, column });
    setSelectedCount(textarea.selectionEnd - textarea.selectionStart);
  };

  useEffect(() => {
    const savedDraft = localStorage.getItem('snippet_draft');
    const savedPrefs = localStorage.getItem('editor_preferences');

    if (savedDraft) {
      const draft = JSON.parse(savedDraft);
      setContent(draft.content || '');
      setIsCode(draft.isCode || false);
      setLanguage(draft.language || 'javascript');
      setPassword(draft.password || '');
      setExpireIn(draft.expireIn || '');
      setTitle(draft.title || '');
      setTags(draft.tags ? draft.tags.join(',') : '');
      setIsPrivate(draft.isPrivate || false);
      setAIMetadata(draft.aiMetadata || {
        suggestions: [],
        securityIssues: [],
        explanation: '',
        summary: '',
        files: [],
      });
    }

    if (savedPrefs) {
      const prefs = JSON.parse(savedPrefs);
      setFontSize(prefs.fontSize || 14);
      setTheme(prefs.theme || 'tomorrow');
      setAutoSaveEnabled(prefs.autoSaveEnabled || false);
    }
  }, []);

  const saveDraft = useCallback(() => {
    const draft = {
      content,
      isCode,
      language,
      password,
      expireIn,
      title,
      tags: tags.split(',').map((t) => t.trim()).filter((t) => t),
      isPrivate,
      aiMetadata,
      timestamp: Date.now(),
    };
    localStorage.setItem('snippet_draft', JSON.stringify(draft));

    const prefs = { fontSize, theme, autoSaveEnabled };
    localStorage.setItem('editor_preferences', JSON.stringify(prefs));
  }, [content, isCode, language, password, expireIn, title, tags, isPrivate, aiMetadata, fontSize, theme, autoSaveEnabled]);

  useEffect(() => {
    const timer = setTimeout(saveDraft, 1000);
    return () => clearTimeout(timer);
  }, [saveDraft]);

  const handleAutoSave = async () => {
    if (!content.trim()) return;

    const toastId = toast.loading('Auto-saving...');
    try {
      const payload = {
        content,
        isCode,
        language: isCode ? language : 'plaintext',
        password,
        expireIn,
        title,
        tags: tags.split(',').map((t) => t.trim()).filter((t) => t),
        isPrivate,
        isDraft: true,
        aiMetadata,
      };
      await axios.post(`${API_URL}/autosave`, payload);
      setLastSaved(new Date());
      setIsDirty(false);
      toast.success('Auto-saved', { id: toastId, duration: 1000 });
    } catch (err) {
      toast.error('Auto-save failed', { id: toastId });
      console.error('Auto-save failed:', err);
    }
  };

  const handleSave = async ({ draft = false } = {}) => {
    if (!content.trim() && aiMetadata.files.length === 0) {
      toast.error('Content or files cannot be empty.');
      return;
    }

    setLoading(true);
    const toastId = toast.loading('Saving snippet...');

    try {
      const payload = {
        content,
        isCode,
        language: isCode ? language : 'plaintext',
        password,
        expireIn,
        title: title || (isCode ? `${language} snippet` : 'Text snippet'),
        tags: tags.split(',').map((t) => t.trim()).filter((t) => t),
        isPrivate,
        isDraft: draft,
        aiMetadata,
      };
      const response = await axios.post(API_URL, payload);
      const { id } = response.data;

      const history = JSON.parse(sessionStorage.getItem('snippetHistory') || '[]');
      const snippetTitle = title || `${isCode ? language : 'text'} snippet`;
      const snippet = {
        id,
        title: `${snippetTitle} - ${content.substring(0, 30)}${content.length > 30 ? '...' : ''}`,
        isCode,
        language,
        timestamp: Date.now(),
        hasPassword: !!password,
        tags: tags.split(',').map((t) => t.trim()).filter((t) => t),
        summary: aiMetadata.summary,
        files: aiMetadata.files,
      };

      history.unshift(snippet);
      sessionStorage.setItem('snippetHistory', JSON.stringify(history.slice(0, 15)));

      if (!draft) {
        localStorage.removeItem('snippet_draft');
      }

      const snippetUrl = `${window.location.origin}/${id}`;
      toast.dismiss(toastId);
      toast(
        <div className="flex items-center gap-2">
          <span>Snippet saved! URL: </span>
          <a
            href={snippetUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-400 underline"
          >
            {snippetUrl}
          </a>
          <button
            onClick={() => navigator.clipboard.writeText(snippetUrl).then(() => toast.success('URL copied!'))}
            className="p-1 text-slate-300 hover:text-white"
            aria-label="Copy URL"
          >
            <FiCopy />
          </button>
        </div>,
        {
          duration: 5000,
          style: {
            background: '#1e293b',
            color: '#f1f5f9',
            border: '1px solid #475569',
          },
        }
      );

      setTimeout(() => {
        navigate(`/${id}`);
      }, 5000);
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to save snippet. Please try again.';
      toast.error(errorMessage, { id: toastId });
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleFilesUploaded = (uploadedFiles) => {
    setAIMetadata((prev) => ({
      ...prev,
      files: [...prev.files, ...uploadedFiles],
    }));
    toast.success('Files added to snippet.');
  };

  const handleUndo = () => {
    if (undoStack.length > 1) {
      const currentContent = undoStack[undoStack.length - 1];
      const previousContent = undoStack[undoStack.length - 2];
      setRedoStack((prev) => [...prev, currentContent]);
      setUndoStack((prev) => prev.slice(0, -1));
      setContent(previousContent);
    }
  };

  const handleRedo = () => {
    if (redoStack.length > 0) {
      const nextContent = redoStack[redoStack.length - 1];
      setUndoStack((prev) => [...prev, nextContent]);
      setRedoStack((prev) => prev.slice(0, -1));
      setContent(nextContent);
    }
  };

  const handleSearch = () => {
    if (!searchTerm) return;
    const index = content.toLowerCase().indexOf(searchTerm.toLowerCase());
    if (index !== -1 && textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.setSelectionRange(index, index + searchTerm.length);
      toast.success('Found match');
    } else {
      toast.error('No matches found');
    }
  };

  const handleReplace = () => {
    if (!searchTerm) return;
    const newContent = content.replace(new RegExp(searchTerm, 'gi'), replaceTerm);
    setContent(newContent);
    const matches = content.match(new RegExp(searchTerm, 'gi'));
    toast.success(`Replaced ${matches ? matches.length : 0} occurrences`);
  };

  const clearContent = () => {
    if ((content || aiMetadata.files.length > 0) && !window.confirm('Are you sure you want to clear all content and files?')) {
      return;
    }
    setContent('');
    setPassword('');
    setTitle('');
    setTags('');
    setAIMetadata({ suggestions: [], securityIssues: [], explanation: '', summary: '', files: [] });
    localStorage.removeItem('snippet_draft');
    toast.success('Content and files cleared');
  };

  const copyContent = async () => {
    try {
      const textToCopy = content + (aiMetadata.files.length > 0 ? '\n\nFiles:\n' + aiMetadata.files.map(f => f.url).join('\n') : '');
      await navigator.clipboard.writeText(textToCopy);
      toast.success('Content and file URLs copied to clipboard');
    } catch (err) {
      toast.error('Failed to copy content');
    }
  };

  const shareSnippet = async () => {
    if (!content.trim() && aiMetadata.files.length === 0) {
      toast.error('Cannot share empty content');
      return;
    }

    try {
      if (navigator.share) {
        await navigator.share({
          title: title || 'Code Snippet',
          text: content.substring(0, 100) + (content.length > 100 ? '...' : '') + (aiMetadata.files.length > 0 ? '\nFiles: ' + aiMetadata.files.map(f => f.url).join(', ') : ''),
          url: window.location.href,
        });
      } else {
        await navigator.clipboard.writeText(window.location.href);
        toast.success('Link copied to clipboard');
      }
    } catch (err) {
      toast.error('Failed to share');
    }
  };

  const printContent = () => {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>${title || 'Code Snippet'}</title>
          <style>
            body { font-family: monospace; white-space: pre-wrap; padding: 20px; }
            .header { margin-bottom: 20px; border-bottom: 1px solid #ccc; padding-bottom: 10px; }
            .file-list { margin-top: 20px; }
            @media print { body { padding: 10px; } }
          </style>
        </head>
        <body>
          <div class="header">
            <h2>${title || 'Code Snippet'}</h2>
            <p>Language: ${isCode ? language : 'Plain Text'} | Lines: ${lineCount} | Words: ${wordCount}</p>
            ${aiMetadata.summary ? `<p>Summary: ${aiMetadata.summary}</p>` : ''}
          </div>
          <pre>${content}</pre>
          ${aiMetadata.explanation ? `<h3>Explanation</h3><p>${aiMetadata.explanation}</p>` : ''}
          ${aiMetadata.files.length > 0 ? `
            <h3>Files</h3>
            <ul class="file-list">
              ${aiMetadata.files.map(f => `<li><a href="${f.url}" target="_blank">${f.name} (${(f.size / 1024).toFixed(2)} KB)</a></li>`).join('')}
            </ul>
          ` : ''}
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  const downloadContent = () => {
    const blob = new Blob([content + (aiMetadata.files.length > 0 ? '\n\nFiles:\n' + aiMetadata.files.map(f => f.url).join('\n') : '')], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title || 'snippet'}.${isCode ? language : 'txt'}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('File downloaded');
  };

  const uploadFile = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error('File too large. Maximum size is 5MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target.result;
      setContent(text);
      setTitle(file.name.split('.')[0]);

      const extension = file.name.split('.').pop().toLowerCase();
      const codeExtensions = {
        js: 'javascript',
        ts: 'typescript',
        css: 'css',
        html: 'markup',
        py: 'python',
        json: 'json',
        sh: 'bash',
        java: 'java',
        c: 'c',
        cpp: 'cpp',
        php: 'php',
        rb: 'ruby',
        go: 'go',
        txt: 'plaintext',
      };

      const detectedLanguage = codeExtensions[extension] || 'plaintext';
      setIsCode(detectedLanguage !== 'plaintext');
      setLanguage(detectedLanguage);
      toast.success(`File "${file.name}" loaded. Language set to ${detectedLanguage}`);
    };
    reader.readAsText(file);
  };

  const formatContent = () => {
    if (!isCode) return;

    try {
      let formatted = content;
      if (language === 'json') {
        formatted = JSON.stringify(JSON.parse(content), null, 2);
      }
      setContent(formatted);
      toast.success('Content formatted');
    } catch (err) {
      toast.error('Failed to format content');
    }
  };

  const handleEditorDidMount = (editor, monaco) => {
    editorRef.current = editor;
    if (aiMetadata.suggestions.length) {
      const decorations = aiMetadata.suggestions.map((suggestion) => ({
        range: new monaco.Range(suggestion.line, 1, suggestion.line, 1),
        options: {
          isWholeLine: true,
          className: 'suggestion-decoration',
          glyphMarginClassName: 'suggestion-glyph',
          glyphMarginHoverMessage: { value: suggestion.text },
        },
      }));
      editor.deltaDecorations([], decorations);
    }

    editor.onDidChangeCursorPosition((e) => {
      setCursorPosition({
        line: e.position.lineNumber,
        column: e.position.column,
      });
    });

    editor.onDidChangeCursorSelection((e) => {
      const selection = editor.getSelection();
      if (selection.isEmpty()) {
        setSelectedCount(0);
      } else {
        const selectedText = editor.getModel().getValueInRange(selection);
        setSelectedCount(selectedText.length);
      }
    });
  };

  return (
    <div className={`transition-all duration-300 ${isFullscreen ? 'fixed inset-0 z-50 bg-slate-900 px-2 sm:px-4 md:p-6 min-h-screen' : 'grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 px-2 sm:px-4 md:p-6'}`}>
      <div className={`${isFullscreen ? 'w-full' : 'lg:col-span-2'} space-y-4 sm:space-y-6`}>
        {/* Header with responsive padding and font sizes */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between bg-slate-800 border border-slate-700 rounded-lg p-3 sm:p-4 z-10">
          <div className="flex items-center gap-2 sm:gap-4 mb-3 sm:mb-0">
            <h2 className="text-lg sm:text-xl font-bold text-white">
              {title || (isCode ? `${language.charAt(0).toUpperCase() + language.slice(1)} Code` : 'Plain Text')}
            </h2>
            {isDirty && <span className="text-yellow-400 text-xs sm:text-sm">• Unsaved changes</span>}
            {lastSaved && (
              <span className="text-green-400 text-xs sm:text-sm">
                Last saved: {lastSaved.toLocaleTimeString()}
              </span>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setShowAIDropdown(true)}
              disabled={!content}
              className="p-2 text-slate-400 hover:text-white disabled:opacity-90 z-10"
              aria-label="Detect language"
              data-testid="detect-language-button"
            >
              <FiGlobe className="text-lg sm:text-xl" />
            </button>
            <button
              onClick={handleUndo}
              disabled={undoStack.length <= 1}
              className="p-2 text-slate-400 hover:text-white disabled:opacity-90 z-10"
              aria-label="Undo"
              data-testid="undo-button"
            >
              <FiRotateCcw className="text-lg sm:text-xl" />
            </button>
            <button
              onClick={handleRedo}
              disabled={redoStack.length === 0}
              className="p-2 text-slate-400 hover:text-white disabled:opacity-90 z-10"
              aria-label="Redo"
              data-testid="redo-button"
            >
              <FiRotateCw className="text-lg sm:text-xl" />
            </button>
            <button
              onClick={() => setShowSearchReplace(!showSearchReplace)}
              className="p-2 text-slate-400 hover:text-white z-10"
              aria-label="Toggle search and replace"
              data-testid="search-button"
            >
              <FiSearch className="text-lg sm:text-xl" />
            </button>
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="p-2 text-slate-400 hover:text-white z-10"
              aria-label="Toggle settings"
              data-testid="settings-button"
            >
              <FiSettings className="text-lg sm:text-xl" />
            </button>
            <input
              type="file"
              id="file-upload"
              className="hidden"
              onChange={uploadFile}
              accept=".txt,.js,.ts,.css,.html,.py,.json,.sh,.java,.c,.cpp,.php,.rb,.go"
            />
            <label
              htmlFor="file-upload"
              className="p-2 text-slate-400 hover:text-white cursor-pointer z-10"
              aria-label="Upload file"
              data-testid="upload-button"
            >
              <FiUpload className="text-lg sm:text-xl" />
            </label>
            <button
              onClick={shareSnippet}
              disabled={!content && aiMetadata.files.length === 0}
              className="p-2 text-slate-400 hover:text-white disabled:opacity-90 z-10"
              aria-label="Share snippet"
              data-testid="share-button"
            >
              <FiShare2 className="text-lg sm:text-xl" />
            </button>
            <button
              onClick={printContent}
              disabled={!content && aiMetadata.files.length === 0}
              className="p-2 text-slate-400 hover:text-white disabled:opacity-90 z-10"
              aria-label="Print content"
              data-testid="print-button"
            >
              <FiPrinter className="text-lg sm:text-xl" />
            </button>
            <button
              onClick={downloadContent}
              disabled={!content && aiMetadata.files.length === 0}
              className="p-2 text-slate-400 hover:text-white disabled:opacity-90 z-10"
              aria-label="Download content"
              data-testid="download-button"
            >
              <FiDownload className="text-lg sm:text-xl" />
            </button>
            <button
              onClick={clearContent}
              disabled={!content && aiMetadata.files.length === 0}
              className="p-2 text-slate-400 hover:text-red-400 disabled:opacity-90 z-10"
              aria-label="Clear content"
              data-testid="clear-button"
            >
              <FiTrash2 className="text-lg sm:text-xl" />
            </button>
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-2 text-slate-400 hover:text-white z-10"
              aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
              data-testid="fullscreen-button"
            >
              {isFullscreen ? <FiMinimize2 className="text-lg sm:text-xl" /> : <FiMaximize2 className="text-lg sm:text-xl" />}
            </button>
            {/* Added history toggle for mobile */}
            {!isFullscreen && (
              <button
                onClick={() => setShowHistory(!showHistory)}
                className="p-2 text-slate-400 hover:text-white z-10 lg:hidden"
                aria-label="Toggle history"
                data-testid="history-toggle-button"
              >
                <FiBookmark className="text-lg sm:text-xl" />
              </button>
            )}
          </div>
        </div>

        <MultimediaUpload onFilesUploaded={handleFilesUploaded} disabled={loading} />

        {showSearchReplace && (
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-3 sm:p-4 z-10">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full p-2 sm:p-3 bg-slate-700 text-slate-300 border border-slate-600 rounded text-sm sm:text-base"
                  aria-label="Search term"
                  data-testid="search-input"
                />
              </div>
              <div>
                <input
                  type="text"
                  placeholder="Replace with..."
                  value={replaceTerm}
                  onChange={(e) => setReplaceTerm(e.target.value)}
                  className="w-full p-2 sm:p-3 bg-slate-700 text-slate-300 border border-slate-600 rounded text-sm sm:text-base"
                  aria-label="Replace term"
                  data-testid="replace-input"
                />
              </div>
            </div>
            <div className="flex gap-2 mt-3">
              <button
                onClick={handleSearch}
                className="px-3 sm:px-4 py-1.5 sm:py-2 bg-blue-500 text-white rounded text-sm sm:text-base z-10"
                aria-label="Find"
                data-testid="find-button"
              >
                Find
              </button>
              <button
                onClick={handleReplace}
                className="px-3 sm:px-4 py-1.5 sm:py-2 bg-orange-500 text-white rounded text-sm sm:text-base z-10"
                aria-label="Replace all"
                data-testid="replace-button"
              >
                Replace All
              </button>
            </div>
          </div>
        )}

        {showSettings && (
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-3 sm:p-4 z-10">
            <h4 className="text-base sm:text-lg font-semibold text-white mb-3 sm:mb-4">Editor Settings</h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
              <div>
                <label className="block text-xs sm:text-sm font-medium text-slate-400 mb-1 sm:mb-2">Font Size</label>
                <select
                  value={fontSize}
                  onChange={(e) => setFontSize(Number(e.target.value))}
                  className="w-full p-2 sm:p-3 bg-slate-700 text-slate-300 border border-slate-600 rounded text-sm sm:text-base"
                  aria-label="Font size"
                  data-testid="font-size-select"
                >
                  {FONT_SIZES.map((size) => (
                    <option key={size} value={size}>
                      {size}px
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium text-slate-400 mb-1 sm:mb-2">Theme</label>
                <select
                  value={theme}
                  onChange={(e) => setTheme(e.target.value)}
                  className="w-full p-2 sm:p-3 bg-slate-700 text-slate-300 border border-slate-600 rounded text-sm sm:text-base"
                  aria-label="Theme"
                  data-testid="theme-select"
                >
                  {THEMES.map((t) => (
                    <option key={t} value={t}>
                      {t.charAt(0).toUpperCase() + t.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex items-center gap-3 sm:gap-4">
                <label className="flex items-center gap-2 text-xs sm:text-sm text-slate-400">
                  <input
                    type="checkbox"
                    checked={autoSaveEnabled}
                    onChange={(e) => setAutoSaveEnabled(e.target.checked)}
                    className="rounded"
                    aria-label="Auto-save"
                    data-testid="auto-save-checkbox"
                  />
                  Auto-save
                </label>
                {isCode && (
                  <button
                    onClick={formatContent}
                    className="px-2 sm:px-3 py-1 bg-blue-500 text-white rounded text-xs sm:text-sm z-10"
                    aria-label="Format code"
                    data-testid="format-button"
                  >
                    Format
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="bg-slate-800 border border-slate-700 rounded-lg p-3 sm:p-4 z-10">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <label className="block text-xs sm:text-sm font-medium text-slate-400 mb-1 sm:mb-2">Title</label>
              <input
                type="text"
                placeholder="Give your snippet a title..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full p-2 sm:p-3 bg-slate-700 text-slate-300 border border-slate-600 rounded-md focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                aria-label="Snippet title"
                data-testid="title-input"
              />
            </div>
            <div>
              <label className="block text-xs sm:text-sm font-medium text-slate-400 mb-1 sm:mb-2">Tags (comma-separated)</label>
              <input
                type="text"
                placeholder="react, javascript, tutorial..."
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                className="w-full p-2 sm:p-3 bg-slate-700 text-slate-300 border border-slate-600 rounded-md focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                aria-label="Snippet tags"
                data-testid="tags-input"
              />
            </div>
          </div>
        </div>

        <div className="bg-slate-800 border border-slate-700 rounded-lg shadow-lg z-10">
          <div className="flex flex-wrap border-b border-slate-600">
            <TabButton
              icon={<FiFileText />}
              label="Plain Text"
              active={!isCode}
              onClick={() => setIsCode(false)}
              aria-label="Switch to plain text"
              data-testid="plain-text-tab"
            />
            <TabButton
              icon={<FiCode />}
              label="Code"
              active={isCode}
              onClick={() => setIsCode(true)}
              aria-label="Switch to code"
              data-testid="code-tab"
            />
            {(content || aiMetadata.files.length > 0) && (
              <TabButton
                icon={<FiEye />}
                label="Preview"
                active={showPreview}
                onClick={() => setShowPreview(!showPreview)}
                aria-label="Toggle preview"
                data-testid="preview-tab"
              />
            )}

            <div className="ml-auto flex flex-wrap items-center gap-2 sm:gap-4 px-3 sm:px-4 text-xs text-slate-400">
              <span>Ln {cursorPosition.line}, Col {cursorPosition.column}</span>
              {selectedCount > 0 && <span>Selected: {selectedCount}</span>}
              <span>Lines: {lineCount}</span>
              <span>Words: {wordCount}</span>
              <span>Chars: {charCount}</span>
            </div>
          </div>

          <div className="p-3 sm:p-4 relative">
            {showPreview && (content || aiMetadata.files.length > 0) ? (
              <div className="prose prose-invert max-w-none overflow-auto">
                {content && (
                  <pre className="bg-slate-800 p-3 sm:p-4 rounded overflow-auto" style={{ fontSize: `${fontSize}px` }}>
                    {content}
                  </pre>
                )}
                {aiMetadata.files.length > 0 && (
                  <div className="mt-3 sm:mt-4">
                    <h4 className="text-base sm:text-lg font-semibold text-white">Files</h4>
                    <ul className="list-disc pl-5 text-sm sm:text-base">
                      {aiMetadata.files.map((file, index) => (
                        <li key={index}>
                          <a
                            href={file.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-400 underline"
                          >
                            {file.name} ({(file.size / 1024).toFixed(2)} KB)
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ) : isCode ? (
              <div className="relative w-full">
                <Editor
                  height={isFullscreen ? 'calc(100vh - 16rem)' : 'min(80vh, 500px)'}
                  language={language === 'markup' ? 'html' : language}
                  value={content}
                  onChange={(code) => setContent(code || '')}
                  onMount={handleEditorDidMount}
                  options={{
                    fontSize: fontSize,
                    lineNumbers: 'on',
                    fontFamily: '"Fira Code", "Monaco", monospace',
                    lineHeight: 1.6,
                    theme:
                      theme === 'tomorrow' ? 'vs-dark' :
                        theme === 'dark' ? 'hc-black' :
                          theme === 'light' ? 'vs' : 'vs',
                    scrollBeyondLastLine: false,
                    minimap: { enabled: window.innerWidth > 768 }, // Disable minimap on mobile
                  }}
                  className="w-full"
                  data-testid="code-editor"
                />
                <div className="absolute top-2 sm:top-4 right-2 sm:right-4 z-20">
                  <SiCodemagic
                    className="text-lg sm:text-xl text-pink-400 cursor-pointer transition-all duration-200 hover:text-xl sm:hover:text-2xl"
                    onClick={() => setShowAIDropdown(!showAIDropdown)}
                    aria-label="Toggle AI features dropdown"
                    data-testid="ai-magic-icon"
                  />
                  {showAIDropdown && (
                    <div
                      ref={aiDropdownRef}
                      className="absolute right-0 mt-2 w-11/12 sm:w-64 max-w-full bg-slate-700 border border-slate-600 rounded-lg shadow-lg z-30"
                    >
                      <AIFeatures
                        content={content}
                        language={language}
                        cursorPosition={cursorPosition}
                        setContent={setContent}
                        setTags={setTags}
                        isCode={isCode}
                        setIsCode={setIsCode}
                        setLanguage={setLanguage}
                        onSuggestionsUpdate={(suggestions) => setAIMetadata((prev) => ({ ...prev, suggestions }))}
                        onExplanationUpdate={(explanation) => setAIMetadata((prev) => ({ ...prev, explanation }))}
                        onSecurityIssuesUpdate={(securityIssues) => setAIMetadata((prev) => ({ ...prev, securityIssues }))}
                        onSummaryUpdate={(summary) => setAIMetadata((prev) => ({ ...prev, summary }))}
                        onClose={() => setShowAIDropdown(false)}
                      />
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="relative w-full">
                <textarea
                  ref={textareaRef}
                  value={content}
                  onChange={(e) => {
                    setContent(e.target.value);
                    handleTextareaChange(e);
                  }}
                  onSelect={handleTextareaChange}
                  placeholder="Start typing or paste your content here..."
                  className={`w-full p-3 sm:p-4 bg-slate-800 text-slate-300 border border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none ${isFullscreen ? 'h-[calc(100vh-16rem)]' : 'h-[min(80vh,500px)]'}`}
                  style={{
                    fontFamily: '"Inter", system-ui, sans-serif',
                    fontSize: `${fontSize}px`,
                    lineHeight: '1.6',
                  }}
                  aria-label="Plain text editor"
                  data-testid="text-editor"
                />
                <div className="absolute top-2 sm:top-4 right-2 sm:right-4 z-20">
                  <SiCodemagic
                    className="text-lg sm:text-xl text-pink-400 cursor-pointer transition-all duration-200 hover:text-xl sm:hover:text-2xl"
                    onClick={() => setShowAIDropdown(!showAIDropdown)}
                    aria-label="Toggle AI features dropdown"
                    data-testid="ai-magic-icon"
                  />
                  {showAIDropdown && (
                    <div
                      ref={aiDropdownRef}
                      className="absolute right-0 mt-2 w-11/12 sm:w-64 max-w-full bg-slate-700 border border-slate-600 rounded-lg shadow-lg z-30"
                    >
                      <AIFeatures
                        content={content}
                        language={language}
                        cursorPosition={cursorPosition}
                        setContent={setContent}
                        setTags={setTags}
                        isCode={isCode}
                        setIsCode={setIsCode}
                        setLanguage={setLanguage}
                        onSuggestionsUpdate={(suggestions) => setAIMetadata((prev) => ({ ...prev, suggestions }))}
                        onExplanationUpdate={(explanation) => setAIMetadata((prev) => ({ ...prev, explanation }))}
                        onSecurityIssuesUpdate={(securityIssues) => setAIMetadata((prev) => ({ ...prev, securityIssues }))}
                        onSummaryUpdate={(summary) => setAIMetadata((prev) => ({ ...prev, summary }))}
                        onClose={() => setShowAIDropdown(false)}
                      />
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="bg-slate-800 border border-slate-700 p-3 sm:p-6 rounded-lg shadow-lg z-10">
          <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 text-white flex items-center gap-2">
            <FiClock className="text-blue-500" />
            Snippet Options
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {isCode && (
              <div>
                <label className="block text-xs sm:text-sm font-medium text-slate-400 mb-1 sm:mb-2">Language</label>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="w-full p-2 sm:p-3 bg-slate-700 text-slate-300 border border-slate-600 rounded-md focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                  aria-label="Language"
                  data-testid="language-select"
                >
                  {languageOptions.map((lang) => (
                    <option key={lang} value={lang}>
                      {lang.charAt(0).toUpperCase() + lang.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label className="block text-xs sm:text-sm font-medium text-slate-400 mb-1 sm:mb-2">Password Protection</label>
              <div className="relative">
                <FiLock className="absolute left-2 sm:left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Optional password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-8 sm:pl-10 pr-8 sm:pr-10 p-2 sm:p-3 bg-slate-700 text-slate-300 border border-slate-600 rounded-md focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                  aria-label="Password"
                  data-testid="password-input"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2 sm:right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-300"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  data-testid="toggle-password-button"
                >
                  {showPassword ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-medium text-slate-400 mb-1 sm:mb-2">Expiration</label>
              <div className="relative">
                <FiClock className="absolute left-2 sm:left-3 top-1/2 transform -translate-y-1/2 text-slate-400 z-10" />
                <select
                  value={expireIn}
                  onChange={(e) => setExpireIn(e.target.value)}
                  className="w-full pl-8 sm:pl-10 p-2 sm:p-3 bg-slate-700 text-slate-300 border border-slate-600 rounded-md appearance-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                  aria-label="Expiration"
                  data-testid="expiration-select"
                >
                  <option value="">Never Expire</option>
                  <option value="1800">30 Minutes</option>
                  <option value="3600">1 Hour</option>
                  <option value="21600">6 Hours</option>
                  <option value="86400">1 Day</option>
                  <option value="604800">1 Week</option>
                  <option value="2592000">1 Month</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-medium text-slate-400 mb-1 sm:mb-2">Visibility</label>
              <div className="flex items-center gap-3 sm:gap-4 mt-2 sm:mt-3">
                <label className="flex items-center gap-2 text-xs sm:text-sm text-slate-400">
                  <input
                    type="checkbox"
                    checked={isPrivate}
                    onChange={(e) => setIsPrivate(e.target.checked)}
                    className="rounded"
                    aria-label="Private snippet"
                    data-testid="private-checkbox"
                  />
                  Private snippet
                </label>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-3" data-testid="save-button-container">
          <button
            onClick={() => handleSave()}
            disabled={loading || (!content.trim() && aiMetadata.files.length === 0)}
            className="w-full py-3 sm:py-4 flex items-center justify-center gap-2 sm:gap-3 bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-700 hover:to-blue-500 text-white font-bold text-base sm:text-lg rounded-lg disabled:bg-gray-600 disabled:cursor-not-allowed disabled:opacity-90 transition-all duration-200 shadow-lg hover:shadow-xl z-50 outline"
            aria-label="Save snippet"
            data-testid="save-button"
          >
            {loading ? (
              <>
                <FiLoader className="animate-spin text-lg sm:text-xl" />
                Saving...
              </>
            ) : (
              <>
                <FiSave className="text-lg sm:text-xl" />
                Save & Get Shareable Link
              </>
            )}
          </button>

          <div className="flex flex-wrap gap-2 justify-center">
            <button
              onClick={() => handleSave({ draft: true })}
              disabled={loading || (!content.trim() && aiMetadata.files.length === 0)}
              className="px-3 sm:px-4 py-1.5 sm:py-2 bg-gray-600 hover:bg-gray-500 text-white rounded-md text-xs sm:text-sm z-10"
              aria-label="Save as draft"
              data-testid="draft-button"
            >
              <FiBookmark className="inline mr-1 sm:mr-2" />
              Save as Draft
            </button>
            <button
              onClick={() => {
                setContent('');
                setTitle('');
                setTags('');
                setPassword('');
                setAIMetadata({ suggestions: [], securityIssues: [], explanation: '', summary: '', files: [] });
              }}
              className="px-3 sm:px-4 py-1.5 sm:py-2 bg-gray-600 hover:bg-gray-500 text-white rounded-md text-xs sm:text-sm z-10"
              aria-label="New snippet"
              data-testid="new-snippet-button"
            >
              <FiEdit3 className="inline mr-1 sm:mr-2" />
              New Snippet
            </button>
          </div>
        </div>
      </div>

      {!isFullscreen && (
        <div className={`lg:col-span-1 ${showHistory ? 'block' : 'hidden lg:block'}`}>
          <History />
        </div>
      )}

      <div className="fixed bottom-8 right-4 sm:bottom-6 sm:right-6 md:hidden">
        <button
          onClick={() => handleSave()}
          disabled={loading || (!content.trim() && aiMetadata.files.length === 0)}
          className="w-16 h-16 bg-blue-500 hover:bg-blue-700 rounded-full flex items-center justify-center text-white shadow-lg disabled:opacity-90 z-50 outline outline-2 outline-red-500"
          aria-label="Save snippet (mobile)"
          data-testid="mobile-save-button"
        >
          {loading ? <FiLoader className="animate-spin text-xl" /> : <FiSave className="text-xl" />}
        </button>
      </div>
    </div>
  );
}

const TabButton = ({ icon, label, active, onClick, ariaLabel, dataTestId }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-1 sm:gap-2 py-3 sm:py-4 px-4 sm:px-6 text-xs sm:text-sm font-semibold transition-all duration-200 ${
      active
        ? 'bg-slate-900 text-blue-500 border-b-2 border-blue-500'
        : 'text-slate-400 hover:bg-slate-700 hover:text-slate-300'
    } z-10`}
    aria-label={ariaLabel}
    data-testid={dataTestId}
  >
    {icon} {label}
  </button>
);

export default HomePage;