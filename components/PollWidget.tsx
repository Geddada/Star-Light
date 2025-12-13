
import React, { useState } from 'react';
import { BarChart2, CheckCircle2 } from 'lucide-react';

interface PollOption {
  id: string;
  label: string;
  votes: number;
}

export const PollWidget: React.FC = () => {
  const [hasVoted, setHasVoted] = useState(false);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [options, setOptions] = useState<PollOption[]>([
    { id: '1', label: 'More AI Tutorials', votes: 450 },
    { id: '2', label: 'Gaming Highlights', votes: 320 },
    { id: '3', label: 'Tech Reviews', votes: 210 },
    { id: '4', label: 'Vlogs & Lifestyle', votes: 120 },
  ]);

  const totalVotes = options.reduce((acc, curr) => acc + curr.votes, 0) + (hasVoted ? 1 : 0);

  const handleVote = (id: string) => {
    if (hasVoted) return;
    setSelectedOption(id);
    setHasVoted(true);
    setOptions(prev => prev.map(opt => 
      opt.id === id ? { ...opt, votes: opt.votes + 1 } : opt
    ));
  };

  return (
    <div className="bg-[var(--background-secondary)] rounded-xl border border-[var(--border-primary)] p-5 shadow-sm mb-6">
      <div className="flex items-start justify-between mb-4">
        <div className="flex gap-3">
            <img 
                src="https://api.dicebear.com/7.x/bottts/svg?seed=StarlightOfficial" 
                alt="Starlight Official" 
                className="w-10 h-10 rounded-full bg-slate-800"
            />
            <div>
                <h3 className="font-bold text-[var(--text-primary)] text-sm">StarLight Official</h3>
                <p className="text-xs text-[var(--text-tertiary)]">2 hours ago • Community Poll</p>
            </div>
        </div>
        <button className="text-[var(--text-tertiary)] hover:text-[var(--text-primary)]">
            <BarChart2 className="w-5 h-5" />
        </button>
      </div>

      <p className="text-[var(--text-primary)] mb-4 text-sm md:text-base font-medium">
        What content would you like to see featured on the homepage next week? 🗳️
      </p>

      <div className="space-y-2">
        {options.map((option) => {
          const percentage = Math.round((option.votes / totalVotes) * 100) || 0;
          const isSelected = selectedOption === option.id;

          return (
            <div 
                key={option.id}
                onClick={() => handleVote(option.id)}
                className={`relative overflow-hidden rounded-lg border transition-all ${
                    hasVoted 
                    ? 'cursor-default border-transparent' 
                    : 'cursor-pointer hover:bg-[var(--background-tertiary)] border-[var(--border-primary)]'
                }`}
            >
                {hasVoted && (
                    <div 
                        className={`absolute top-0 left-0 bottom-0 transition-all duration-1000 ease-out ${isSelected ? 'bg-[hsl(var(--accent-color))]/20' : 'bg-[var(--text-tertiary)]/10'}`}
                        style={{ width: `${percentage}%` }}
                    />
                )}
                
                <div className="relative z-10 p-3 flex items-center justify-between">
                    <span className={`text-sm font-medium ${isSelected ? 'text-[hsl(var(--accent-color))]' : 'text-[var(--text-primary)]'}`}>
                        {option.label}
                    </span>
                    {hasVoted && (
                        <div className="flex items-center gap-2">
                            {isSelected && <CheckCircle2 className="w-4 h-4 text-[hsl(var(--accent-color))]" />}
                            <span className="text-xs font-bold text-[var(--text-primary)]">{percentage}%</span>
                        </div>
                    )}
                </div>
            </div>
          );
        })}
      </div>

      <div className="mt-4 pt-3 border-t border-[var(--border-primary)] flex justify-between items-center text-xs text-[var(--text-tertiary)]">
        <span>{totalVotes.toLocaleString()} votes</span>
        {hasVoted && <span>Thank you for voting!</span>}
      </div>
    </div>
  );
};
