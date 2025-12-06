import React from 'react';
import { Keyboard, ExternalLink } from 'lucide-react';

export const TypingTools: React.FC = () => {
  return (
    <div className="w-full h-full bg-[var(--background-primary)] text-[var(--text-primary)] p-6 md:p-12 overflow-y-auto">
      <div className="max-w-4xl mx-auto text-center">
        <div className="flex justify-center mb-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="p-5 rounded-3xl bg-[hsl(var(--accent-color))]/10 shadow-lg shadow-[hsl(var(--accent-color))]/5">
            <Keyboard className="w-16 h-16 text-[hsl(var(--accent-color))]" />
          </div>
        </div>
        
        <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-[hsl(var(--accent-color))] to-blue-600 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100">
          Typing Tools for Global Creators
        </h1>
        <p className="text-xl text-[var(--text-secondary)] max-w-2xl mx-auto mb-10 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-200">
          Communicate in your preferred language across Starlight. Write titles, descriptions, and comments with ease.
        </p>

        <div className="bg-[var(--background-secondary)] p-8 rounded-2xl border border-[var(--border-primary)] shadow-xl animate-in fade-in slide-in-from-bottom-4 duration-500 delay-300">
          <h2 className="text-2xl font-bold mb-4">Google Input Tools</h2>
          <p className="text-[var(--text-secondary)] max-w-xl mx-auto mb-8">
            Google Input Tools makes it easy to type in the language you choose, whether you have the right keyboard or not. This free tool helps you communicate more effectively with your global audience.
          </p>
          <a
            href="https://www.google.co.in/inputtools/try/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-8 py-4 bg-[hsl(var(--accent-color))] text-white font-bold rounded-full hover:brightness-90 transition-all shadow-lg text-lg"
          >
            Try Google Input Tools
            <ExternalLink className="w-5 h-5" />
          </a>
        </div>

        <div className="mt-12 text-sm text-[var(--text-tertiary)]">
          <p>Please note: Starlight is providing a link to this third-party tool for your convenience.</p>
          <p>We are not affiliated with Google Input Tools.</p>
        </div>
      </div>
    </div>
  );
};
