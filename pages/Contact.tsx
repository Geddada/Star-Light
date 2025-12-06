import React from 'react';
import { Mail, MapPin, Send, HelpCircle } from 'lucide-react';

const DiscordIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="currentColor" className={className}>
        <path d="M20.317 4.369a19.791 19.791 0 00-4.885-1.515.074.074 0 00-.079.037c-.21.369-.42.738-.609 1.111a18.182 18.182 0 00-5.484 0 19.5 19.5 0 00-.617-1.111.074.074 0 00-.079-.037A19.791 19.791 0 003.679 4.37a.07.07 0 00-.034.044c-1.43 5.429-1.43 10.852 0 16.281a.07.07 0 00.034.044 19.791 19.791 0 004.885 1.515.074.074 0 00.079-.037c.21-.369.42-.738.609-1.111a18.182 18.182 0 005.484 0 19.5 19.5 0 00.617 1.111.074.074 0 00.079.037 19.791 19.791 0 004.885-1.515.07.07 0 00.034-.044c1.43-5.429 1.43-10.852 0-16.281a.07.07 0 00-.034-.044zM8.02 15.331c-.785 0-1.428-.63-1.428-1.404s.643-1.404 1.428-1.404c.785 0 1.428.63 1.428 1.404.001.774-.643 1.404-1.428 1.404zm7.954 0c-.785 0-1.428-.63-1.428-1.404s.643-1.404 1.428-1.404c.785 0 1.428.63 1.428 1.404s-.643 1.404-1.428 1.404z" />
    </svg>
);

export const Contact: React.FC = () => {

  return (
    <div className="w-full h-full bg-[var(--background-primary)] text-[var(--text-primary)] p-6 md:p-12 overflow-y-auto">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-16 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-[hsl(var(--accent-color))] to-blue-500 tracking-tight">
                Get in Touch
            </h1>
            <p className="text-xl text-[var(--text-secondary)] max-w-2xl mx-auto leading-relaxed">
                Have questions about Starlight? We're here to help. Chat with our team.
            </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start pb-12">
            {/* Contact Info */}
            <div className="space-y-8 animate-in fade-in slide-in-from-left-4 duration-700 delay-100">
                <div className="bg-[var(--background-secondary)] p-8 rounded-2xl border border-[var(--border-primary)]">
                    <h3 className="text-xl font-bold mb-6">Contact Information</h3>
                    <div className="space-y-6">
                        <div className="flex items-start gap-4">
                            <div className="p-3 bg-[hsl(var(--accent-color))]/10 rounded-lg text-[hsl(var(--accent-color))]">
                                <Mail className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="font-medium text-lg">Email Us</p>
                                <p className="text-[var(--text-secondary)] mb-1">For general inquiries and support</p>
                                <a href="mailto:hello@starlight.app" className="text-[hsl(var(--accent-color))] hover:underline font-medium">hello@starlight.app</a>
                            </div>
                        </div>
                        <div className="flex items-start gap-4">
                            <div className="p-3 bg-[hsl(var(--accent-color))]/10 rounded-lg text-[hsl(var(--accent-color))]">
                                <HelpCircle className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="font-medium text-lg">Support Center</p>
                                <p className="text-[var(--text-secondary)] mb-1">Need help with the platform?</p>
                                <a href="#" className="text-[hsl(var(--accent-color))] hover:underline font-medium">Visit Help Center</a>
                            </div>
                        </div>
                         <div className="flex items-start gap-4">
                            <div className="p-3 bg-[hsl(var(--accent-color))]/10 rounded-lg text-[hsl(var(--accent-color))]">
                                <MapPin className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="font-medium text-lg">Office</p>
                                <p className="text-[var(--text-secondary)]">
                                    123 Star Boulevard<br/>
                                    Innovation District, Tech City 94043
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
                
                <a 
                    href="#" 
                    onClick={e => e.preventDefault()}
                    className="group bg-gradient-to-br from-[#5865F2] to-[#3646a8] p-8 rounded-2xl text-white relative overflow-hidden block transition-all hover:-translate-y-1 hover:shadow-2xl hover:shadow-indigo-500/30"
                >
                    <div className="relative z-10">
                        <h3 className="text-2xl font-bold mb-2">Join the Community</h3>
                        <p className="opacity-90 mb-6">Connect with 10,000+ creators and developers building on Starlight.</p>
                        <div className="inline-flex items-center gap-3 px-6 py-3 bg-white text-[#5865F2] rounded-full font-bold group-hover:bg-opacity-90 transition-all group-hover:scale-105 transform">
                            <DiscordIcon className="w-6 h-6" />
                            <span>Join our Discord</span>
                        </div>
                    </div>
                    <DiscordIcon className="absolute -bottom-8 -right-8 w-40 h-40 text-white opacity-10 transition-transform group-hover:scale-125 group-hover:rotate-12"/>
                </a>
            </div>

            {/* Contact Form */}
            <div className="bg-[var(--background-secondary)] p-8 rounded-2xl border border-[var(--border-primary)] shadow-lg animate-in fade-in slide-in-from-right-4 duration-700 delay-200">
                <h3 className="text-2xl font-bold mb-6">Send us a message</h3>
                <form action="https://formspree.io/f/mldywbwz" method="POST" className="space-y-5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-[var(--text-secondary)]">First Name</label>
                            <input 
                                required
                                type="text" 
                                name="name"
                                placeholder="Jane"
                                className="w-full p-3 bg-[var(--background-primary)] border border-[var(--border-primary)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[hsl(var(--accent-color))]"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-[var(--text-secondary)]">Email</label>
                            <input 
                                required
                                type="email" 
                                name="email"
                                placeholder="jane@example.com"
                                className="w-full p-3 bg-[var(--background-primary)] border border-[var(--border-primary)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[hsl(var(--accent-color))]"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-[var(--text-secondary)]">State/Province</label>
                            <input
                                type="text"
                                name="state"
                                placeholder="e.g. California"
                                className="w-full p-3 bg-[var(--background-primary)] border border-[var(--border-primary)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[hsl(var(--accent-color))]"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-[var(--text-secondary)]">City</label>
                            <input 
                                type="text" 
                                name="city"
                                placeholder="e.g. San Francisco"
                                className="w-full p-3 bg-[var(--background-primary)] border border-[var(--border-primary)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[hsl(var(--accent-color))]"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-[var(--text-secondary)]">Subject</label>
                        <select 
                             name="subject"
                             className="w-full p-3 bg-[var(--background-primary)] border border-[var(--border-primary)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[hsl(var(--accent-color))]"
                        >
                            <option value="">Select a topic</option>
                            <option value="support">Technical Support</option>
                            <option value="feedback">Feedback & Suggestions</option>
                            <option value="business">Business Inquiry</option>
                            <option value="other">Other</option>
                        </select>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-[var(--text-secondary)]">Message</label>
                        <textarea 
                            required
                            rows={5}
                            name="message"
                            placeholder="How can we help you?"
                            className="w-full p-3 bg-[var(--background-primary)] border border-[var(--border-primary)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[hsl(var(--accent-color))] resize-none"
                        />
                    </div>

                    <button 
                        type="submit"
                        className="w-full py-4 rounded-xl font-bold text-white transition-all flex items-center justify-center gap-2 bg-[hsl(var(--accent-color))] hover:brightness-90"
                    >
                        Send Message <Send className="w-4 h-4" />
                    </button>
                </form>
            </div>
        </div>
      </div>
    </div>
  );
};