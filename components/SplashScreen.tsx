
import React from 'react';
import { Loader2 } from 'lucide-react';
import { Logo } from './Logo';

interface SplashScreenProps {
  opacity?: string;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ opacity = 'opacity-100' }) => {
  return (
    <div className={`fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#020617] text-white transition-opacity duration-500 ease-in-out ${opacity}`}>
      <div className="relative animate-bounce" style={{ animationDuration: '3s' }}>
         <div className="absolute inset-0 bg-blue-500 blur-3xl opacity-20 rounded-full animate-pulse"></div>
         <Logo className="w-24 h-24 text-blue-500 relative z-10" />
      </div>
      
      <div className="mt-8 text-center animate-in fade-in slide-in-from-bottom-4 duration-1000">
        <h1 className="text-5xl font-extrabold tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-500 to-blue-600 drop-shadow-lg">
          StarLight
        </h1>
        <p className="text-slate-400 text-sm font-medium tracking-[0.5em] uppercase mt-3">
          News • Watch • Create
        </p>
      </div>
      
      <div className="absolute bottom-12 flex flex-col items-center gap-3">
         <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />
         <p className="text-xs text-slate-500 font-medium tracking-wide">INITIALIZING...</p>
      </div>
    </div>
  );
};
