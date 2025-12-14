
import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, Film, PlusCircle, PlaySquare, User, Search } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { UploadModal } from './UploadModal';

export const MobileBottomNav: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser } = useAuth();
  const [showUpload, setShowUpload] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  // Function to handle navigation or auth check
  const handleNavigation = (path: string) => {
    if ((path === '/subscriptions' || path === '/profile') && !currentUser) {
      navigate('/signup');
    } else {
      navigate(path);
    }
  };

  const navItems = [
    { icon: Home, label: 'Home', path: '/' },
    { icon: Film, label: 'Shorts', path: '/shorts' },
    { icon: PlusCircle, label: 'Create', action: () => currentUser ? setShowUpload(true) : navigate('/signup') },
    { icon: PlaySquare, label: 'Subs', path: '/subscriptions' },
    { icon: User, label: 'You', path: '/profile' },
  ];

  return (
    <>
      <div className="md:hidden fixed bottom-0 left-0 right-0 h-14 bg-[var(--background-primary)] border-t border-[var(--border-primary)] flex justify-around items-center z-50 pb-[env(safe-area-inset-bottom)] shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]">
        {navItems.map((item) => (
          <button
            key={item.label}
            onClick={() => item.action ? item.action() : handleNavigation(item.path!)}
            className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors ${
              (item.path && isActive(item.path)) || (item.label === 'Create' && showUpload)
                ? 'text-[hsl(var(--accent-color))]'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            <item.icon className={`w-6 h-6 ${item.label === 'Create' ? 'w-8 h-8' : ''}`} />
            <span className="text-[10px] font-medium">{item.label}</span>
          </button>
        ))}
      </div>
      
      {showUpload && (
        <UploadModal 
            onClose={() => setShowUpload(false)} 
            onUploadSuccess={() => { setShowUpload(false); navigate('/profile'); }} 
        />
      )}
    </>
  );
};
