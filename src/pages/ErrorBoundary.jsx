import React, { Component } from 'react';
import toast from 'react-hot-toast';

class ErrorBoundary extends Component {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught in ErrorBoundary:', error, errorInfo);
    toast.error('An error occurred. Please try again.');
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="bg-dark-card border border-dark-border p-4 rounded-lg shadow-lg">
          <h3 className="text-lg font-semibold text-white mb-3">Error</h3>
          <p className="text-slate-400 text-sm">
            Something went wrong. Please refresh the page or try again later.
          </p>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;