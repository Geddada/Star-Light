
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, Home } from 'lucide-react';

export const NotFound: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-[var(--background-primary)] text-[var(--text-primary)] p-6 text-center">
      <div className="w-24 h-24 bg-[var(--background-secondary)] rounded-full flex items-center justify-center mb-6 animate-bounce">
        <AlertCircle className="w-12 h-12 text-[hsl(var(--accent-color))]" />
      </div>
      <h1 className="text-6xl font-bold mb-2">404</h1>
      <h2 className="text-2xl font-bold mb-4">Page Not Found</h2>
      <p className="text-[var(--text-secondary)] max-w-md mb-8">
        The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
      </p>
      <button
        onClick={() => navigate('/')}
        className="flex items-center gap-2 px-8 py-3 bg-[hsl(var(--accent-color))] text-white font-bold rounded-full hover:brightness-90 transition-all shadow-lg"
      >
        <Home className="w-5 h-5" />
        <span>Go Home</span>
      </button>
    </div>
  );
};
