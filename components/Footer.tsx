import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Globe, Sparkles } from 'lucide-react';

export const Footer: React.FC = () => {
  const navigate = useNavigate();

  const [showLanguageDropdown, setShowLanguageDropdown] = useState(false);
  const languageDropdownRef = useRef<HTMLDivElement>(null);
  const languageButtonRef = useRef<HTMLButtonElement>(null);
  const [currentLang, setCurrentLang] = useState('en');

  const languages = [
    { code: 'en', name: 'English' },
    { code: 'es', name: 'Español' },
    { code: 'hi', name: 'हिन्दी' },
    { code: 'fr', name: 'Français' },
    { code: 'ja', name: '日本語' },
    { code: 'pt', name: 'Português' },
  ];

  useEffect(() => {
    setCurrentLang(localStorage.getItem('starlight_language') || 'en');
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (languageDropdownRef.current && !languageDropdownRef.current.contains(event.target as Node) && !languageButtonRef.current?.contains(event.target as Node)) {
        setShowLanguageDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  
  const handleLanguageChange = (langCode: string) => {
    localStorage.setItem('starlight_language', langCode);
    setCurrentLang(langCode);
    setShowLanguageDropdown(false);
    window.location.reload();
  };

  const navigateTo = (path: string) => {
    navigate(path);
  };

  return (
    <footer className="px-6 py-3 bg-[var(--background-primary)] border-t border-[var(--border-primary)]">
      <div className="max-w-7xl mx-auto text-xs text-[var(--text-tertiary)] font-medium">
          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2">
            <button onClick={() => navigateTo('/about')} className="hover:underline hover:text-[var(--text-primary)] transition-colors">About</button>
            <button onClick={() => navigateTo('/press')} className="hover:underline hover:text-[var(--text-primary)] transition-colors">Press</button>
            <button onClick={() => navigateTo('/copyright')} className="hover:underline hover:text-[var(--text-primary)] transition-colors">Copyright</button>
            <button onClick={() => navigateTo('/contact')} className="hover:underline hover:text-[var(--text-primary)] transition-colors">Contact us</button>
            <button onClick={() => navigateTo('/creators')} className="hover:underline hover:text-[var(--text-primary)] transition-colors">Creators</button>
            <button onClick={() => navigateTo('/monetization')} className="hover:underline hover:text-[var(--text-primary)] transition-colors">Monetization</button>
            <button onClick={() => navigateTo('/developers')} className="hover:underline hover:text-[var(--text-primary)] transition-colors">Developers</button>
            <button onClick={() => navigateTo('/terms')} className="hover:underline hover:text-[var(--text-primary)] transition-colors">Terms</button>
            <button onClick={() => navigateTo('/privacy')} className="hover:underline hover:text-[var(--text-primary)] transition-colors">Privacy Policy</button>
            <button onClick={() => navigateTo('/how-it-works')} className="hover:underline hover:text-[var(--text-primary)] transition-colors flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-blue-500" />
              <span>Powered by AI</span>
            </button>
            <button onClick={() => navigateTo('/help')} className="hover:underline hover:text-[var(--text-primary)] transition-colors">Help</button>
            <button onClick={() => navigateTo('/typing-tools')} className="hover:underline hover:text-[var(--text-primary)] transition-colors">Typing Tools</button>
            
            <div className="relative">
              <button
                ref={languageButtonRef}
                onClick={() => setShowLanguageDropdown(!showLanguageDropdown)}
                className="hover:underline hover:text-[var(--text-primary)] transition-colors flex items-center gap-1"
                aria-haspopup="true"
                aria-expanded={showLanguageDropdown}
              >
                <Globe className="w-3 h-3"/>
                Language: {languages.find(l => l.code === currentLang)?.name || 'English'}
              </button>
              {showLanguageDropdown && (
                <div ref={languageDropdownRef} className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-40 bg-[var(--background-secondary)] rounded-xl border border-[var(--border-primary)] shadow-2xl animate-in fade-in zoom-in-95 z-50">
                  <div className="p-2" role="menu">
                    {languages.map(lang => (
                      <button
                        key={lang.code}
                        onClick={() => handleLanguageChange(lang.code)}
                        className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${currentLang === lang.code ? 'bg-[hsl(var(--accent-color))] text-white' : 'hover:bg-[var(--background-tertiary)]'}`}
                        role="menuitem"
                      >
                        {lang.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <p className="text-[var(--text-tertiary)]/70">© 2025 Admin (Geddada Vijaykumar)</p>
          </div>
      </div>
    </footer>
  );
};