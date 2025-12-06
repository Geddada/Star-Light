import React from 'react';
import { Terminal, Book, Code2, Share2, Cpu, ArrowRight, Box } from 'lucide-react';

export const Developers: React.FC = () => {
  return (
    <div className="w-full h-full bg-[var(--background-primary)] text-[var(--text-primary)] p-6 md:p-12 overflow-y-auto">
      <div className="max-w-6xl mx-auto">
        {/* Hero Section */}
        <div className="flex flex-col md:flex-row items-center gap-12 mb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="flex-1 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[hsl(var(--accent-color))]/10 text-[hsl(var(--accent-color))] text-sm font-semibold border border-[hsl(var(--accent-color))]/20">
               <Terminal className="w-4 h-4" />
               <span>Starlight API v1.0</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[hsl(var(--accent-color))] to-blue-600 tracking-tight leading-tight">
              Build the future of media.
            </h1>
            <p className="text-xl text-[var(--text-secondary)] leading-relaxed">
              Integrate Starlight's powerful generative video metadata and analysis engine directly into your applications.
            </p>
            <div className="flex gap-4 pt-2">
               <button className="px-6 py-3 bg-[hsl(var(--accent-color))] text-white rounded-full font-bold hover:brightness-90 transition-all shadow-lg flex items-center gap-2">
                 Read the Docs <ArrowRight className="w-4 h-4" />
               </button>
               <button className="px-6 py-3 bg-[var(--background-secondary)] text-[var(--text-primary)] rounded-full font-bold hover:bg-[var(--background-tertiary)] transition-all border border-[var(--border-primary)]">
                 Get API Key
               </button>
            </div>
          </div>
          
          {/* Code Snippet Visual */}
          <div className="flex-1 w-full max-w-xl">
             <div className="rounded-xl overflow-hidden bg-[#1e1e1e] shadow-2xl border border-[#333]">
                <div className="flex items-center gap-2 px-4 py-3 bg-[#252526] border-b border-[#333]">
                   <div className="w-3 h-3 rounded-full bg-red-500"></div>
                   <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                   <div className="w-3 h-3 rounded-full bg-green-500"></div>
                   <span className="ml-2 text-xs text-gray-400 font-mono">example.js</span>
                </div>
                <div className="p-6 overflow-x-auto">
                   <pre className="font-mono text-sm leading-relaxed">
<span className="text-blue-400">import</span> <span className="text-yellow-200">{`{ Starlight }`}</span> <span className="text-blue-400">from</span> <span className="text-green-400">'@starlight/sdk'</span>;

<span className="text-gray-500">// Initialize the client</span>
<span className="text-blue-400">const</span> <span className="text-blue-300">client</span> = <span className="text-blue-400">new</span> <span className="text-yellow-200">Starlight</span>({`{`}
  apiKey: <span className="text-green-400">'sl_live_...'</span>
{`}`});

<span className="text-gray-500">// Generate video metadata</span>
<span className="text-blue-400">const</span> <span className="text-blue-300">video</span> = <span className="text-blue-400">await</span> <span className="text-blue-300">client</span>.<span className="text-blue-300">videos</span>.<span className="text-yellow-200">generate</span>({`{`}
  prompt: <span className="text-green-400">'A futuristic city on Mars'</span>,
  duration: <span className="text-orange-400">60</span>
{`}`});

<span className="text-blue-300">console</span>.<span className="text-yellow-200">log</span>(<span className="text-blue-300">video</span>.<span className="text-blue-300">url</span>);
                   </pre>
                </div>
             </div>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-20">
            <div className="p-6 rounded-2xl bg-[var(--background-secondary)] border border-[var(--border-primary)] hover:border-[hsl(var(--accent-color))] transition-all group">
                <Book className="w-10 h-10 text-blue-500 mb-4 group-hover:scale-110 transition-transform" />
                <h3 className="text-xl font-bold mb-2">Documentation</h3>
                <p className="text-[var(--text-secondary)]">Comprehensive guides, API references, and tutorials to help you start building fast.</p>
                <a href="#" className="inline-block mt-4 text-blue-500 font-semibold hover:underline">Explore Docs &rarr;</a>
            </div>
            <div className="p-6 rounded-2xl bg-[var(--background-secondary)] border border-[var(--border-primary)] hover:border-[hsl(var(--accent-color))] transition-all group">
                <Box className="w-10 h-10 text-purple-500 mb-4 group-hover:scale-110 transition-transform" />
                <h3 className="text-xl font-bold mb-2">SDKs & Libraries</h3>
                <p className="text-[var(--text-secondary)]">Official client libraries for Node.js, Python, Go, and Ruby. Drop-in integration.</p>
                 <a href="#" className="inline-block mt-4 text-purple-500 font-semibold hover:underline">View SDKs &rarr;</a>
            </div>
            <div className="p-6 rounded-2xl bg-[var(--background-secondary)] border border-[var(--border-primary)] hover:border-[hsl(var(--accent-color))] transition-all group">
                <Share2 className="w-10 h-10 text-green-500 mb-4 group-hover:scale-110 transition-transform" />
                <h3 className="text-xl font-bold mb-2">Community</h3>
                <p className="text-[var(--text-secondary)]">Join our Discord server and developer forum. Connect with 10k+ builders.</p>
                 <a href="#" className="inline-block mt-4 text-green-500 font-semibold hover:underline">Join Community &rarr;</a>
            </div>
        </div>

        {/* Use Cases */}
        <div className="mb-20">
            <h2 className="text-3xl font-bold mb-10 text-center">What you can build</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="flex gap-5 p-6 rounded-2xl bg-[var(--background-secondary)] border border-[var(--border-primary)]">
                    <div className="p-3 h-fit rounded-lg bg-amber-500/10 text-amber-500">
                        <Cpu className="w-6 h-6" />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold mb-2">Automated Content Pipelines</h3>
                        <p className="text-[var(--text-secondary)]">
                            Automatically generate video titles, descriptions, and thumbnails for your media assets at scale.
                        </p>
                    </div>
                </div>
                 <div className="flex gap-5 p-6 rounded-2xl bg-[var(--background-secondary)] border border-[var(--border-primary)]">
                    <div className="p-3 h-fit rounded-lg bg-pink-500/10 text-pink-500">
                        <Code2 className="w-6 h-6" />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold mb-2">Interactive Experiences</h3>
                        <p className="text-[var(--text-secondary)]">
                            Create dynamic, personalized video feeds for users based on their real-time interactions and preferences.
                        </p>
                    </div>
                </div>
            </div>
        </div>

        {/* Newsletter */}
        <div className="rounded-3xl bg-gradient-to-r from-[hsl(var(--accent-color))] to-blue-800 p-10 text-white text-center">
            <h2 className="text-3xl font-bold mb-4">Stay in the loop</h2>
            <p className="opacity-90 mb-8 max-w-2xl mx-auto">Get the latest updates on API changes, new features, and developer events directly to your inbox.</p>
            <form action="https://formspree.io/f/mldywbwz" method="POST" className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                <input type="hidden" name="_subject" value="New Subscription from Developers Page" />
                <input 
                    type="email"
                    name="email"
                    placeholder="Enter your email" 
                    required
                    className="flex-1 px-5 py-3 rounded-full text-gray-900 focus:outline-none focus:ring-4 focus:ring-white/30"
                />
                <button type="submit" className="px-6 py-3 bg-white text-[hsl(var(--accent-color))] font-bold rounded-full hover:bg-gray-100 transition-colors">
                    Subscribe
                </button>
            </form>
        </div>
      </div>
    </div>
  );
};