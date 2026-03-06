import React from 'react';
import { Link } from 'react-router-dom';

export const ErrorPage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center rounded-2xl border border-[#1f1f1f] bg-[#0a0a0a]/80 p-8">
        <h1 className="text-2xl font-semibold text-white mb-2">Something went wrong</h1>
        <p className="text-sm text-slate-400 mb-6">An unexpected error occurred. Please retry or return home.</p>
        <div className="flex items-center justify-center gap-2">
          <button onClick={() => window.location.reload()} className="px-4 py-2 text-sm rounded-lg border border-[#2a2a2a] text-slate-300">
            Reload
          </button>
          <Link to="/" className="px-4 py-2 text-sm rounded-lg border border-[#2a2a2a] text-slate-300">
            Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ErrorPage;
