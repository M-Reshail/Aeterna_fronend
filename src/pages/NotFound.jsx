import React from 'react';
import { Link } from 'react-router-dom';

export const NotFound = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4">
      <div className="text-center max-w-md rounded-2xl border border-[#1f1f1f] bg-[#0a0a0a]/80 p-8">
        <h1 className="text-6xl font-semibold text-slate-200 mb-3">404</h1>
        <h2 className="text-2xl font-semibold text-white mb-2">Page not found</h2>
        <p className="text-slate-400 mb-6">
          The page you requested does not exist or was moved.
        </p>
        <div className="flex items-center justify-center gap-2">
          <Link
            to="/"
            className="inline-flex items-center px-4 py-2 border border-[#2a2a2a] text-slate-300 rounded-lg text-sm"
          >
            Home
          </Link>
          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center px-4 py-2 border border-[#2a2a2a] text-slate-300 rounded-lg text-sm"
          >
            Go back
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
