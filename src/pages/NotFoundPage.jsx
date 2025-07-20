import React from 'react';
import { Link } from 'react-router-dom';

function NotFoundPage() {
  return (
    <div className="text-center">
      <h1 className="text-4xl font-bold mb-4">404 - Not Found</h1>
      <p className="text-gray-400 mb-6">The page you are looking for does not exist.</p>
      <Link to="/" className="py-2 px-4 bg-cyan-600 hover:bg-cyan-700 text-white font-bold rounded-lg transition-colors">
        Go to Homepage
      </Link>
    </div>
  );
}

export default NotFoundPage;