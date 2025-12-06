import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, Home, Film } from 'lucide-react';

export const Thanks: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="w-full h-full flex flex-col items-center justify-center text-center p-6 bg-[var(--background-primary)]">
      <div className="p-6 bg-red-500/10 rounded-full mb-8 animate-in fade-in zoom-in-75 duration-500">
        <Heart className="w-20 h-20 text-red-500" />
      </div>
      <h1 className="text-4xl md:text-5xl font-bold mb-4 text-[var(--text-primary)] animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100">
        Thanks for Watching!
      </h1>
      <p className="text-xl text-[var(--text-secondary)] max-w-xl mx-auto mb-10 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-200">
        We're glad you're enjoying the content on StarLight. Discover more or head back home.
      </p>

      <div className="flex flex-col sm:flex-row gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-300">
        <button
          onClick={() => navigate('/')}
          className="flex items-center justify-center gap-2 px-8 py-4 bg-[hsl(var(--accent-color))] text-white font-bold rounded-full hover:brightness-90 transition-all shadow-lg"
        >
          <Home className="w-5 h-5" />
          <span>Go to Homepage</span>
        </button>
        <button
          onClick={() => navigate('/shorts')}
          className="flex items-center justify-center gap-2 px-8 py-4 bg-[var(--background-secondary)] text-[var(--text-primary)] border border-[var(--border-primary)] font-bold rounded-full hover:bg-[var(--background-tertiary)] transition-colors"
        >
          <Film className="w-5 h-5" />
          <span>Watch Shorts</span>
        </button>
      </div>
    </div>
  );
};
