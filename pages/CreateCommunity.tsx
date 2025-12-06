import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, CheckCircle, Loader2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Community as CommunityType } from '../types';
import { COUNTRIES, INDIAN_STATES, USA_STATES, UK_STATES } from '../constants';

export const CreateCommunity: React.FC = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  
  const [name, setName] = useState('');
  const [country, setCountry] = useState('');
  const [state, setState] = useState('');
  const [status, setStatus] = useState<'idle' | 'creating' | 'success'>('idle');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !currentUser.email) {
        alert("You must be logged in to create a community.");
        navigate('/signup');
        return;
    }
    if (!name.trim()) {
      alert("Community name is required.");
      return;
    }

    setStatus('creating');

    const newCommunity: CommunityType = {
        id: `comm-${Date.now()}`,
        name: name.trim(),
        ownerEmail: currentUser.email,
        memberCount: 1, // Start with 1 member, the creator
        country: country || undefined,
        state: state || undefined,
        avatar: `https://picsum.photos/seed/${encodeURIComponent(name.trim())}/64/64`,
    };

    setTimeout(() => {
        const communitiesJson = localStorage.getItem('starlight_communities');
        const allCommunities: CommunityType[] = communitiesJson ? JSON.parse(communitiesJson) : [];
        allCommunities.push(newCommunity);
        localStorage.setItem('starlight_communities', JSON.stringify(allCommunities));
        
        setStatus('success');
        setTimeout(() => {
            navigate('/community');
        }, 2000);
    }, 1500);
  };
  
  const stateOptions = country === 'India' ? INDIAN_STATES : country === 'United States of America' ? USA_STATES : country === 'United Kingdom' ? UK_STATES : [];

  if (status === 'success') {
      return (
          <div className="flex flex-col items-center justify-center h-full p-6 text-center">
              <CheckCircle className="w-24 h-24 text-green-500 mb-6" />
              <h1 className="text-3xl font-bold">Community Created!</h1>
              <p className="mt-2 text-lg text-[var(--text-secondary)]">Redirecting you to the community page...</p>
          </div>
      )
  }

  return (
    <div className="max-w-2xl mx-auto p-4 sm:p-6 lg:p-8">
      <div className="flex items-center gap-3 mb-8">
        <Users className="w-8 h-8 text-[hsl(var(--accent-color))]"/>
        <h1 className="text-3xl font-bold text-[var(--text-primary)]">Create a New Community</h1>
      </div>
      <div className="bg-[var(--background-secondary)] p-8 rounded-2xl border border-[var(--border-primary)]">
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
                <label htmlFor="comm-name" className="text-sm font-semibold text-[var(--text-secondary)]">Community Name *</label>
                <input id="comm-name" type="text" value={name} onChange={e => setName(e.target.value)} placeholder="e.g., The Gaming Den" className="w-full p-3 bg-[var(--background-primary)] border border-[var(--border-primary)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[hsl(var(--accent-color))]" required/>
                 <p className="text-xs text-[var(--text-tertiary)] pt-1">The community avatar will be automatically generated from its name.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <label className="text-sm font-semibold text-[var(--text-secondary)]">Country</label>
                    <select value={country} onChange={e => { setCountry(e.target.value); setState(''); }} className="w-full p-3 bg-[var(--background-primary)] border border-[var(--border-primary)] rounded-lg">
                        <option value="">Select Country</option>
                        {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-semibold text-[var(--text-secondary)]">State / Region</label>
                    <select value={state} onChange={e => setState(e.target.value)} className="w-full p-3 bg-[var(--background-primary)] border border-[var(--border-primary)] rounded-lg" disabled={stateOptions.length === 0}>
                        <option value="">Select State</option>
                        {stateOptions.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                </div>
            </div>

            <div className="pt-4 border-t border-[var(--border-primary)] flex justify-end">
                <button type="submit" disabled={status === 'creating'} className="px-6 py-3 bg-[hsl(var(--accent-color))] text-white font-bold rounded-lg hover:brightness-90 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
                    {status === 'creating' ? <><Loader2 className="w-5 h-5 animate-spin" /> Creating...</> : 'Create Community'}
                </button>
            </div>
        </form>
      </div>
    </div>
  );
};
