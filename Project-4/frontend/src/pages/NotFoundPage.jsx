import React from 'react';
import { Link } from 'react-router-dom';

export const NotFoundPage = () => (
  <div className="flex flex-col items-center justify-center min-h-screen bg-slate-950 p-6 text-center space-y-4">
    <h1 className="text-6xl font-black text-blue-500">404</h1>
    <h2 className="text-2xl font-bold text-slate-100">Page Not Found</h2>
    <Link to="/workspaces" className="px-5 py-2.5 bg-blue-600 text-white text-xs font-semibold rounded-xl">
      Back to Workspaces
    </Link>
  </div>
);