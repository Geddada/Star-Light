
import React, { useState, useEffect, useCallback } from 'react';
import { X, Tv2, CheckCircle, RefreshCw, HelpCircle, Loader2 } from 'lucide-react';

interface TvConnectModalProps {
  onClose: () => void;
}

export const TvConnectModal: React.FC<TvConnectModalProps> = ({ onClose }) => {
  const [connectionCode, setConnectionCode] = useState('');
  const [status, setStatus] = useState<'idle' | 'connecting' | 'connected'>('idle');

  const generateCode = useCallback(() => {
    const code = Array(9).fill(0).map(() => Math.floor(Math.random() * 10)).join('');
    // Format as XXX-XXX-XXX for readability
    setConnectionCode(`${code.slice(0, 3)}-${code.slice(3, 6)}-${code.slice(6, 9)}`);
  }, []);
  
  useEffect(() => {
    generateCode();
  }, [generateCode]);

  useEffect(() => {
    let timer: number;
    if (status === 'idle' && connectionCode) {
      // Simulate the TV finding the code and connecting
      timer = window.setTimeout(() => {
        setStatus('connecting');
        const connectTimer = window.setTimeout(() => {
            setStatus('connected');
        }, 1500);
        return () => window.clearTimeout(connectTimer);
      }, 5000);
    }
    return () => window.clearTimeout(timer);
  }, [status, connectionCode]);
  
  const handleRefresh = () => {
      setStatus('idle');
      generateCode();
  };

  const handleDisconnect = () => {
    setStatus('idle');
    generateCode();
  };
  
  const renderContent = () => {
      switch (status) {
          case 'connected':
              return (
                  <div className="text-center p-8">
                      <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4 animate-in fade-in zoom-in-75"/>
                      <h3 className="text-2xl font-bold">Successfully Connected</h3>
                      <p className="text-[var(--text-secondary)] mt-2">Now connected to <span className="font-semibold text-[var(--text-primary)]">Living Room TV</span>.</p>
                      <p className="text-sm text-[var(--text-tertiary)] mt-1">You can now cast videos from your device.</p>
                      <button
                          onClick={handleDisconnect}
                          className="mt-6 px-5 py-2.5 bg-[var(--background-primary)] text-[var(--text-primary)] border border-[var(--border-primary)] rounded-lg hover:bg-[var(--background-tertiary)] font-semibold text-sm transition-colors"
                      >
                          Disconnect
                      </button>
                  </div>
              );
          case 'connecting':
              return (
                   <div className="text-center p-8 flex flex-col items-center justify-center h-64">
                      <Loader2 className="w-12 h-12 text-[hsl(var(--accent-color))] animate-spin mb-4"/>
                      <p className="text-lg font-semibold text-[var(--text-secondary)]">Connecting to device...</p>
                  </div>
              );
          case 'idle':
          default:
              return (
                  <div className="p-6 text-center">
                      <p className="text-sm text-[var(--text-secondary)] mb-4">Open the Starlight app on your TV, go to settings, and enter the code below to link your devices.</p>
                      <div className="bg-[var(--background-primary)] border border-[var(--border-primary)] rounded-xl py-4 mb-4">
                          <p className="text-4xl font-mono tracking-widest font-bold text-[var(--text-primary)]">
                              {connectionCode}
                          </p>
                      </div>
                      <div className="flex justify-center items-center gap-4 text-sm">
                          <button onClick={handleRefresh} className="flex items-center gap-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] font-medium">
                              <RefreshCw className="w-4 h-4"/>
                              Refresh code
                          </button>
                          <span className="text-[var(--border-secondary)]">|</span>
                          <a href="#" className="flex items-center gap-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] font-medium">
                              <HelpCircle className="w-4 h-4"/>
                              Having trouble?
                          </a>
                      </div>
                  </div>
              );
      }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/70 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200" onClick={onClose}>
      <div className="bg-[var(--background-secondary)] rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-[var(--border-primary)]" onClick={e => e.stopPropagation()}>
        <header className="flex justify-between items-center p-4 border-b border-[var(--border-primary)]">
          <div className="flex items-center gap-3">
            <Tv2 className="w-6 h-6 text-[hsl(var(--accent-color))]" />
            <h2 className="text-lg font-bold text-[var(--text-primary)]">Play on TV</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-[var(--background-tertiary)] rounded-full transition-colors">
            <X className="w-5 h-5 text-[var(--text-secondary)]" />
          </button>
        </header>
        {renderContent()}
      </div>
    </div>
  );
};
