import React, { useState } from 'react';
import { LifeBuoy, Search, ChevronDown, User, Upload, Sparkles, DollarSign, Settings, Mail } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface FaqItemProps {
  question: string;
  children: React.ReactNode;
}

const FaqItem: React.FC<FaqItemProps> = ({ question, children }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="border-b border-[var(--border-primary)]">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex justify-between items-center text-left py-4 px-2"
      >
        <span className="font-semibold text-lg">{question}</span>
        <ChevronDown className={`w-5 h-5 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      {isOpen && (
        <div className="pb-4 px-2 text-[var(--text-secondary)] space-y-2 animate-in fade-in duration-300">
          {children}
        </div>
      )}
    </div>
  );
};

const TOPICS = [
    { icon: User, title: "Account & Profile", description: "Manage your account settings, profile, and preferences." },
    { icon: Upload, title: "Uploading Content", description: "Learn how to upload, edit, and manage your videos." },
    { icon: Sparkles, title: "AI Features", description: "Understand how to use AI to generate content." },
    { icon: DollarSign, title: "Monetization", description: "Everything you need to know about earning on Starlight." },
    { icon: Settings, title: "Technical Issues", description: "Troubleshoot common problems and get support." },
];

export const Help: React.FC = () => {
    const navigate = useNavigate();
  return (
    <div className="w-full h-full bg-[var(--background-primary)] text-[var(--text-primary)] p-6 md:p-12 overflow-y-auto">
      <div className="max-w-4xl mx-auto pb-10">
        {/* Hero Section */}
        <div className="text-center mb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="flex justify-center mb-6">
            <div className="p-5 rounded-3xl bg-blue-500/10 shadow-lg shadow-blue-500/5">
               <LifeBuoy className="w-20 h-20 text-blue-500" />
            </div>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-[hsl(var(--accent-color))] to-blue-600 tracking-tight">
            Help Center
          </h1>
          <p className="text-xl text-[var(--text-secondary)] max-w-2xl mx-auto leading-relaxed">
            How can we help you today?
          </p>
          <div className="mt-8 max-w-xl mx-auto">
            <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-tertiary)]" />
                <input 
                    type="search" 
                    placeholder="Search for help articles..."
                    className="w-full p-4 pl-12 bg-[var(--background-secondary)] border border-[var(--border-primary)] rounded-full focus:outline-none focus:ring-2 focus:ring-[hsl(var(--accent-color))]"
                />
            </div>
          </div>
        </div>

        {/* Topics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {TOPICS.map((topic) => (
            <div key={topic.title} className="p-6 rounded-2xl bg-[var(--background-secondary)] border border-[var(--border-primary)] hover:border-[hsl(var(--accent-color))] transition-all hover:shadow-lg hover:-translate-y-1 group cursor-pointer">
                <topic.icon className="w-8 h-8 text-[hsl(var(--accent-color))] mb-4" />
                <h3 className="text-xl font-bold mb-2 text-[var(--text-primary)]">{topic.title}</h3>
                <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                {topic.description}
                </p>
            </div>
          ))}
        </div>

        {/* FAQ Section */}
        <div className="mb-16">
            <h2 className="text-3xl font-bold text-center mb-8">Frequently Asked Questions</h2>
            <div className="bg-[var(--background-secondary)] p-2 md:p-6 rounded-2xl border border-[var(--border-primary)]">
                <FaqItem question="How does Starlight generate content?">
                    <p>Starlight uses a powerful AI model. When you load a page, we send a prompt to the AI asking it to generate realistic metadata for videos, comments, and more. This happens in real-time, creating a dynamic and ever-changing content experience.</p>
                </FaqItem>
                <FaqItem question="Is my data safe?">
                    <p>Yes. Starlight is a client-side demonstration application. This means all your data, like your user profile, uploaded video metadata, and viewing history, is stored only in your browser's local storage. We do not have a server, and your data never leaves your computer.</p>
                    <p>For more details, please see our <a onClick={() => navigate('/privacy')} className="text-[hsl(var(--accent-color))] hover:underline cursor-pointer">Privacy Policy</a>.</p>
                </FaqItem>
                <FaqItem question="How do I become a Premium member?">
                    <p>You can upgrade to Premium by visiting the <a onClick={() => navigate('/premium')} className="text-[hsl(var(--accent-color))] hover:underline cursor-pointer">Premium page</a>. Premium members get an ad-free experience, early access to new features like the Veo Video Generator, and other exclusive benefits.</p>
                </FaqItem>
                <FaqItem question="What is a copyright strike?">
                    <p>A copyright strike is a penalty you receive when a copyright owner submits a valid legal request to have your video removed for using their content without permission. Receiving three strikes can lead to account termination. You can learn more by visiting our <a onClick={() => navigate('/copyright-school')} className="text-[hsl(var(--accent-color))] hover:underline cursor-pointer">Copyright School</a>.</p>
                </FaqItem>
                 <FaqItem question="How do I get an API key for Veo video generation?">
                    <p>The Veo video generation feature in Starlight Labs requires a user-provided API key from a Google Cloud project with billing enabled. You can get one from the Google AI Studio.</p>
                    <p>Once you have a key, you can select it in your <a onClick={() => navigate('/settings')} className="text-[hsl(var(--accent-color))] hover:underline cursor-pointer">Account Settings</a> under the 'API Keys' tab.</p>
                </FaqItem>
            </div>
        </div>
        
        {/* Contact Support */}
        <div className="text-center bg-[var(--background-secondary)] p-8 rounded-2xl border border-[var(--border-primary)]">
            <h2 className="text-2xl font-bold mb-3">Still need help?</h2>
            <p className="text-[var(--text-secondary)] mb-6 max-w-md mx-auto">If you can't find the answer you're looking for, please don't hesitate to reach out to our support team.</p>
            <button onClick={() => navigate('/contact')} className="inline-flex items-center gap-2 px-6 py-3 bg-[hsl(var(--accent-color))] text-white rounded-full font-bold hover:brightness-90 transition-all shadow-lg">
                <Mail className="w-5 h-5" /> Contact Support
            </button>
        </div>
      </div>
    </div>
  );
};