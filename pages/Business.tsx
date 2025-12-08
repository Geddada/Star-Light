import React from 'react';
import { Briefcase, TrendingUp, Globe, Handshake, ArrowRight, Mail } from 'lucide-react';
import { COUNTRIES } from '../constants';

export const Business: React.FC = () => {
  return (
    <div className="w-full h-full bg-[var(--background-primary)] text-[var(--text-primary)] p-6 md:p-12 overflow-y-auto">
      <div className="max-w-6xl mx-auto">
        {/* Hero */}
        <div className="text-center mb-16 animate-in fade-in slide-in-from-bottom-4 duration-700">
           <div className="flex justify-center mb-6">
            <div className="p-5 rounded-3xl bg-[hsl(var(--accent-color))]/10 shadow-lg shadow-[hsl(var(--accent-color))]/5">
               <Briefcase className="w-16 h-16 text-[hsl(var(--accent-color))]" />
            </div>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-[hsl(var(--accent-color))] to-blue-600 tracking-tight">
            Partner with Starlight
          </h1>
          <p className="text-xl text-[var(--text-secondary)] max-w-3xl mx-auto leading-relaxed">
            Reach millions of engaged viewers on the world's first AI-powered video platform. Drive growth, build brand equity, and innovate with us.
          </p>
        </div>

        {/* Offerings */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-20">
            {/* Card 1: Advertising */}
            <div className="bg-[var(--background-secondary)] p-8 rounded-2xl border border-[var(--border-primary)] hover:border-[hsl(var(--accent-color))] transition-all group">
                <div className="mb-6 p-4 bg-blue-500/10 rounded-xl w-fit text-blue-500">
                    <TrendingUp className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-bold mb-3">Advertising Solutions</h3>
                <p className="text-[var(--text-secondary)] mb-6 text-lg">
                    Leverage our AI-driven targeting to place your brand in front of the right audience at the perfect moment. From skippable pre-rolls to unskippable bumper ads.
                </p>
                <button className="text-[hsl(var(--accent-color))] font-bold flex items-center gap-2 group-hover:gap-3 transition-all">
                    Start Advertising <ArrowRight className="w-4 h-4" />
                </button>
            </div>

             {/* Card 2: Strategic Partnerships */}
            <div className="bg-[var(--background-secondary)] p-8 rounded-2xl border border-[var(--border-primary)] hover:border-[hsl(var(--accent-color))] transition-all group">
                <div className="mb-6 p-4 bg-purple-500/10 rounded-xl w-fit text-purple-500">
                    <Handshake className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-bold mb-3">Strategic Partnerships</h3>
                <p className="text-[var(--text-secondary)] mb-6 text-lg">
                    Collaborate with Starlight on content integration, technology licensing, and exclusive creator programs. Let's build the future of media together.
                </p>
                <button className="text-[hsl(var(--accent-color))] font-bold flex items-center gap-2 group-hover:gap-3 transition-all">
                    Contact Partnerships <ArrowRight className="w-4 h-4" />
                </button>
            </div>
        </div>

        {/* Contact Form Section */}
        <div className="bg-[var(--background-secondary)] rounded-3xl overflow-hidden border border-[var(--border-primary)] flex flex-col md:flex-row">
            <div className="md:w-1/2 p-10 bg-gradient-to-br from-[hsl(var(--accent-color))] to-blue-900 text-white flex flex-col justify-between">
                <div>
                    <h2 className="text-3xl font-bold mb-4">Let's Talk Business</h2>
                    <p className="opacity-90 text-lg">Fill out the form and our team will get back to you within 24 hours.</p>
                </div>
                <div className="space-y-6 mt-12">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                            <Mail className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="font-semibold">Email Us</p>
                            <p className="opacity-80">business@starlight.app</p>
                        </div>
                    </div>
                     <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                            <Globe className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="font-semibold">Global HQ</p>
                            <p className="opacity-80">San Francisco, CA</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="md:w-1/2 p-10">
                <form action="https://formspree.io/f/mldywbwz" method="POST" className="space-y-5">
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-[var(--text-secondary)]">Full Name</label>
                        <input type="text" name="name" className="w-full p-3 bg-[var(--background-primary)] border border-[var(--border-primary)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[hsl(var(--accent-color))]" placeholder="John Doe" required />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-[var(--text-secondary)]">Work Email</label>
                        <input type="email" name="email" className="w-full p-3 bg-[var(--background-primary)] border border-[var(--border-primary)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[hsl(var(--accent-color))]" placeholder="john@company.com" required />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-[var(--text-secondary)]">Company Name</label>
                        <input type="text" name="company" className="w-full p-3 bg-[var(--background-primary)] border border-[var(--border-primary)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[hsl(var(--accent-color))]" placeholder="Acme Inc." />
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-[var(--text-secondary)]">Country</label>
                            <select name="country" className="w-full p-3 bg-[var(--background-primary)] border border-[var(--border-primary)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[hsl(var(--accent-color))]" required>
                                <option value="">Select Country</option>
                                {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-[var(--text-secondary)]">State / Province</label>
                            <input type="text" name="state" className="w-full p-3 bg-[var(--background-primary)] border border-[var(--border-primary)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[hsl(var(--accent-color))]" placeholder="e.g. California" />
                        </div>
                    </div>
                    
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-[var(--text-secondary)]">City</label>
                        <input type="text" name="city" className="w-full p-3 bg-[var(--background-primary)] border border-[var(--border-primary)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[hsl(var(--accent-color))]" placeholder="e.g. San Francisco" />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-[var(--text-secondary)]">Inquiry Type</label>
                        <select name="type" className="w-full p-3 bg-[var(--background-primary)] border border-[var(--border-primary)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[hsl(var(--accent-color))]">
                            <option value="advertising">Advertising</option>
                            <option value="sponsorship">Sponsorship</option>
                            <option value="partnership">Strategic Partnership</option>
                            <option value="other">Other</option>
                        </select>
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-[var(--text-secondary)]">Message</label>
                        <textarea name="message" rows={4} className="w-full p-3 bg-[var(--background-primary)] border border-[var(--border-primary)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[hsl(var(--accent-color))] resize-none" placeholder="How can we help you?" required></textarea>
                    </div>
                    <button type="submit" className="w-full py-3 bg-[hsl(var(--accent-color))] text-white font-bold rounded-lg hover:brightness-90 transition-all shadow-md">
                        Send Inquiry
                    </button>
                </form>
            </div>
        </div>
      </div>
    </div>
  );
};