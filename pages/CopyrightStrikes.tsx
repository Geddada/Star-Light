

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, AlertTriangle, ExternalLink, CheckCircle } from 'lucide-react';

const MOCK_STRIKES = [
  {
    id: 1,
    videoTitle: 'Epic Drone Footage of the Alps',
    claimant: 'Pro Aerial Cinematics LLC',
    date: '2025-02-15',
    action: 'Video removed worldwide due to a copyright claim.',
    status: 'Active',
    expires: '2025-05-16',
  }
];

const STRIKE_COUNT = MOCK_STRIKES.length;

export const CopyrightStrikes: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="w-full h-full bg-[var(--background-primary)] text-[var(--text-primary)] p-6 md:p-12 overflow-y-auto">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <ShieldAlert className="w-20 h-20 text-red-500 mx-auto mb-6" />
          <h1 className="text-4xl font-bold mb-4">Copyright Strikes</h1>
          <p className="text-[var(--text-secondary)] text-lg">
            This is a serious matter. Strikes may affect your ability to monetize.
          </p>
        </div>

        <div className="bg-[var(--background-secondary)] p-8 rounded-2xl border border-[var(--border-primary)] mb-10">
          <h2 className="text-xl font-bold mb-6">Your Account Standing</h2>
          <div className="flex items-center justify-center gap-4">
            <div className={`w-20 h-20 sm:w-24 sm:h-24 rounded-full flex items-center justify-center text-2xl font-bold border-4 transition-colors ${STRIKE_COUNT >= 1 ? 'border-red-500 bg-red-500/10 text-red-500' : 'border-green-500 bg-green-500/10 text-green-500'}`}>1</div>
            <div className={`w-20 h-20 sm:w-24 sm:h-24 rounded-full flex items-center justify-center text-2xl font-bold border-4 transition-colors ${STRIKE_COUNT >= 2 ? 'border-red-500 bg-red-500/10 text-red-500' : 'border-[var(--border-primary)] bg-transparent text-[var(--text-tertiary)]'}`}>2</div>
            <div className={`w-20 h-20 sm:w-24 sm:h-24 rounded-full flex items-center justify-center text-2xl font-bold border-4 transition-colors ${STRIKE_COUNT >= 3 ? 'border-red-500 bg-red-500/10 text-red-500' : 'border-[var(--border-primary)] bg-transparent text-[var(--text-tertiary)]'}`}>3</div>
          </div>
          <p className="text-center text-lg font-semibold mt-6">
            You have <span className={STRIKE_COUNT > 0 ? "text-red-500" : "text-green-500"}>{STRIKE_COUNT}</span> of 3 copyright strikes.
          </p>
          {STRIKE_COUNT > 0 && (
             <p className="text-center text-sm text-[var(--text-secondary)] mt-2">
               If you get 3 copyright strikes, your account will be subject to termination.
             </p>
          )}
        </div>

        <div>
          <h2 className="text-2xl font-bold mb-6">Strike Details</h2>
          {MOCK_STRIKES.length === 0 ? (
             <div className="text-center py-12 bg-[var(--background-secondary)] rounded-2xl border-2 border-dashed border-[var(--border-primary)]">
                <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
                <p className="font-semibold text-lg">No copyright strikes. Keep it up!</p>
             </div>
          ) : (
            <div className="space-y-6">
              {MOCK_STRIKES.map(strike => (
                <div key={strike.id} className="bg-[var(--background-secondary)] p-6 rounded-2xl border border-red-500/30">
                  <div className="flex flex-col md:flex-row md:items-start gap-4">
                    <AlertTriangle className="w-8 h-8 text-red-500 flex-shrink-0 mt-1" />
                    <div className="flex-1">
                      <h3 className="font-bold text-lg text-red-500">Strike #{strike.id} - {strike.status}</h3>
                      <p className="text-sm text-[var(--text-secondary)]">Expires on {strike.expires} if you complete Copyright School.</p>
                      <div className="mt-4 space-y-3 text-sm border-t border-[var(--border-primary)] pt-4">
                        <p><strong className="w-24 inline-block font-semibold">Video:</strong> {strike.videoTitle}</p>
                        <p><strong className="w-24 inline-block font-semibold">Claimant:</strong> {strike.claimant}</p>
                        <p><strong className="w-24 inline-block font-semibold">Received:</strong> {strike.date}</p>
                        <p><strong className="w-24 inline-block font-semibold">Action:</strong> {strike.action}</p>
                      </div>
                    </div>
                  </div>
                  <div className="mt-6 flex flex-wrap gap-4 pt-4 border-t border-[var(--border-primary)]">
                     <button className="px-4 py-2 bg-[hsl(var(--accent-color))] text-white text-sm font-semibold rounded-lg hover:brightness-90 transition">
                       Submit counter-notification
                     </button>
                      <button className="px-4 py-2 bg-[var(--background-tertiary)] text-[var(--text-primary)] text-sm font-semibold rounded-lg hover:bg-[var(--border-primary)] transition border border-[var(--border-primary)]">
                       Contact claimant
                     </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mt-12 bg-[var(--background-secondary)] p-8 rounded-2xl border border-[var(--border-primary)]">
           <h2 className="text-xl font-bold mb-4">What you can do</h2>
           <p className="text-[var(--text-secondary)] mb-6">
              A single copyright strike is a warning. If it's your first time, you'll need to go through our Copyright School. Strikes expire after 90 days as long as you complete Copyright School and receive no additional strikes.
           </p>
           <button 
                onClick={() => navigate('/copyright-school')}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-[hsl(var(--accent-color))] text-white rounded-lg font-semibold filter hover:brightness-90 transition-colors shadow-md">
                Go to Copyright School <ExternalLink className="w-4 h-4" />
           </button>
        </div>
      </div>
    </div>
  );
};
