
import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X, Shield, Lock, ArrowRight, Loader2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface AdminLoginModalProps {
  onClose: () => void;
  onSuccess?: () => void;
}

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({ onClose, onSuccess }) => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const { login } = useAuth();

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Simulate API delay for realism
    setTimeout(() => {
      if (pin === "1234") {
        login({
          name: "Admin",
          avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=AdminStarlight`,
          email: "admin@starlight.app"
        });
        if (onSuccess) onSuccess();
        onClose();
      } else {
        setError('Incorrect PIN. Access Denied.');
        setPin('');
        setIsLoading(false);
      }
    }, 600);
  };

  return createPortal(
    <div className="fixed inset-0 z-[9999] bg-black/70 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200" onClick={onClose}>
      <div className="bg-[var(--background-secondary)] rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden border border-[var(--border-primary)]" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center p-4 border-b border-[var(--border-primary)]">
          <h2 className="text-lg font-bold text-[var(--text-primary)] flex items-center gap-2">
            <Shield className="w-5 h-5 text-[hsl(var(--accent-color))]" /> Admin Access
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-[var(--background-tertiary)] rounded-full transition-colors">
            <X className="w-5 h-5 text-[var(--text-secondary)]" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-[hsl(var(--accent-color))]/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Lock className="w-8 h-8 text-[hsl(var(--accent-color))]" />
            </div>
            <p className="text-[var(--text-secondary)] text-sm">Enter the secure PIN to access the administration dashboard.</p>
            <p className="text-xs text-[var(--text-tertiary)] mt-1">(Hint: 1234)</p>
          </div>

          <div className="space-y-4">
            <div className="relative">
              <input
                ref={inputRef}
                type="password"
                value={pin}
                onChange={(e) => { setPin(e.target.value); setError(''); }}
                placeholder="Enter PIN"
                className="w-full text-center text-2xl tracking-widest p-3 bg-[var(--background-primary)] border border-[var(--border-primary)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[hsl(var(--accent-color))]"
                maxLength={4}
                autoComplete="off"
              />
            </div>
            
            {error && (
              <p className="text-red-500 text-sm text-center font-medium animate-in slide-in-from-top-1">{error}</p>
            )}

            <button 
              type="submit" 
              disabled={isLoading || pin.length < 4}
              className="w-full py-3 bg-[hsl(var(--accent-color))] text-white font-bold rounded-xl hover:brightness-90 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
            >
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Verify & Login <ArrowRight className="w-5 h-5" /></>}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};
