
import React, { useState } from 'react';
import { MessageSquarePlus, Star, Send, Loader2, CheckCircle2, Image as ImageIcon, ThumbsUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const Feedback: React.FC = () => {
  const navigate = useNavigate();
  const [rating, setRating] = useState(0);
  const [category, setCategory] = useState('general');
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    setIsSubmitting(true);
    // Simulate network request
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
    }, 1500);
  };

  if (isSuccess) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center bg-[var(--background-primary)] text-[var(--text-primary)]">
        <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mb-6 animate-in zoom-in">
          <CheckCircle2 className="w-10 h-10 text-green-500" />
        </div>
        <h2 className="text-3xl font-bold mb-2">Thanks for your feedback!</h2>
        <p className="text-[var(--text-secondary)] mb-8 max-w-md">
          Your input helps us make Starlight better for everyone. We appreciate you taking the time to share your thoughts.
        </p>
        <button
          onClick={() => navigate('/')}
          className="px-8 py-3 bg-[hsl(var(--accent-color))] text-white font-bold rounded-full hover:brightness-90 transition-all shadow-lg"
        >
          Return Home
        </button>
      </div>
    );
  }

  return (
    <div className="w-full h-full bg-[var(--background-primary)] text-[var(--text-primary)] p-6 md:p-12 overflow-y-auto">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-10">
           <div className="flex justify-center mb-4">
            <div className="p-4 rounded-2xl bg-[hsl(var(--accent-color))]/10">
               <MessageSquarePlus className="w-12 h-12 text-[hsl(var(--accent-color))]" />
            </div>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-3">Send Feedback</h1>
          <p className="text-[var(--text-secondary)]">Found a bug? Have a feature request? Or just want to say hi?</p>
        </div>

        <div className="bg-[var(--background-secondary)] p-8 rounded-2xl border border-[var(--border-primary)] shadow-xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Rating */}
            <div className="flex flex-col items-center space-y-3 pb-6 border-b border-[var(--border-primary)]">
              <label className="text-sm font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Rate your experience</label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="focus:outline-none transition-transform hover:scale-110"
                  >
                    <Star
                      className={`w-8 h-8 ${
                        star <= rating
                          ? 'fill-amber-400 text-amber-400'
                          : 'text-[var(--text-tertiary)] hover:text-amber-400'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-[var(--text-secondary)]">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full p-3 bg-[var(--background-primary)] border border-[var(--border-primary)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[hsl(var(--accent-color))]"
                >
                  <option value="general">General Feedback</option>
                  <option value="bug">Report a Bug</option>
                  <option value="feature">Feature Request</option>
                  <option value="content">Content Issue</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-[var(--text-secondary)]">Email (Optional)</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="w-full p-3 bg-[var(--background-primary)] border border-[var(--border-primary)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[hsl(var(--accent-color))]"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-[var(--text-secondary)]">Your Feedback</label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                required
                rows={6}
                placeholder="Tell us what you think..."
                className="w-full p-4 bg-[var(--background-primary)] border border-[var(--border-primary)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[hsl(var(--accent-color))] resize-none"
              />
            </div>

            {/* Fake Attachment Button */}
            <div className="flex items-center gap-2">
                <button type="button" className="flex items-center gap-2 px-4 py-2 bg-[var(--background-primary)] border border-[var(--border-primary)] rounded-lg text-sm font-medium hover:bg-[var(--background-tertiary)] transition-colors">
                    <ImageIcon className="w-4 h-4" /> Add Screenshot
                </button>
                <span className="text-xs text-[var(--text-tertiary)]">Optional. Max 5MB.</span>
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={isSubmitting || !message.trim()}
                className="w-full py-4 bg-[hsl(var(--accent-color))] text-white font-bold rounded-xl hover:brightness-90 transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" /> Sending...
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" /> Submit Feedback
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
