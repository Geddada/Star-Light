import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, Gem } from 'lucide-react';

interface AccessDeniedProps {
    message?: string;
    showUpgrade?: boolean;
}

export const AccessDenied: React.FC<AccessDeniedProps> = ({ message, showUpgrade = false }) => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center h-full p-6 text-center bg-[var(--background-primary)]">
      {showUpgrade ? (
        <Gem className="w-24 h-24 text-amber-400 mb-6" />
      ) : (
        <ShieldAlert className="w-24 h-24 text-red-500 mb-6" />
      )}
      <h1 className="text-4xl font-bold text-[var(--text-primary)]">Access Denied</h1>
      <p className="mt-4 text-lg text-[var(--text-secondary)] max-w-md">
        {message || 'You do not have the necessary permissions to view this page.'}
      </p>
      {showUpgrade ? (
        <button
          onClick={() => navigate('/premium')}
          className="mt-8 px-6 py-3 bg-amber-500 text-black font-semibold rounded-full filter hover:brightness-90 transition-colors shadow-lg"
        >
          Upgrade to Premium
        </button>
      ) : (
        <button
          onClick={() => navigate('/')}
          className="mt-8 px-6 py-3 bg-[hsl(var(--accent-color))] text-white font-semibold rounded-full filter hover:brightness-90 transition-colors shadow-lg"
        >
          Return to Homepage
        </button>
      )}
    </div>
  );
};
