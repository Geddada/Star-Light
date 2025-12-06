import React from 'react';
import { Cpu, Database, Globe, MessageSquare, Play, Search } from 'lucide-react';

export const HowItWorks: React.FC = () => {
  return (
    <div className="w-full h-full bg-[var(--background-primary)] text-[var(--text-primary)] p-6 md:p-12 overflow-y-auto">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-[hsl(var(--accent-color))] to-blue-600 tracking-tight">
            Behind the Magic
          </h1>
          <p className="text-xl text-[var(--text-secondary)] max-w-3xl mx-auto leading-relaxed">
            Starlight isn't just a video platform—it's a live demonstration of what's possible when you combine modern web frameworks with advanced generative AI.
          </p>
        </div>

        {/* Architecture Diagram / Steps */}
        <div className="relative space-y-12 md:space-y-0 md:grid md:grid-cols-2 gap-8 mb-20">
           {/* Card 1 */}
           <div className="bg-[var(--background-secondary)] p-8 rounded-2xl border border-[var(--border-primary)] relative overflow-hidden group hover:border-[hsl(var(--accent-color))] transition-all">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                 <Cpu className="w-32 h-32" />
              </div>
              <div className="flex items-center gap-4 mb-4">
                 <div className="p-3 bg-blue-500/10 rounded-xl text-blue-500">
                    <Cpu className="w-8 h-8" />
                 </div>
                 <h2 className="text-2xl font-bold">1. The Engine</h2>
              </div>
              <p className="text-[var(--text-secondary)] text-lg leading-relaxed">
                 At the core of Starlight is a <strong>powerful generative AI</strong> model. Instead of fetching static data from a traditional database, the frontend sends prompts to the AI to generate realistic video metadata, user profiles, and comments in real-time.
              </p>
           </div>

           {/* Card 2 */}
           <div className="bg-[var(--background-secondary)] p-8 rounded-2xl border border-[var(--border-primary)] relative overflow-hidden group hover:border-[hsl(var(--accent-color))] transition-all">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                 <Search className="w-32 h-32" />
              </div>
              <div className="flex items-center gap-4 mb-4">
                 <div className="p-3 bg-purple-500/10 rounded-xl text-purple-500">
                    <Search className="w-8 h-8" />
                 </div>
                 <h2 className="text-2xl font-bold">2. Contextual Search</h2>
              </div>
              <p className="text-[var(--text-secondary)] text-lg leading-relaxed">
                 When you search for something, we don't query an SQL table. We ask the AI to <em>"imagine"</em> search results that would be relevant to your query. This allows for infinite, creative results for any topic you can think of.
              </p>
           </div>

           {/* Card 3 */}
           <div className="bg-[var(--background-secondary)] p-8 rounded-2xl border border-[var(--border-primary)] relative overflow-hidden group hover:border-[hsl(var(--accent-color))] transition-all">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                 <MessageSquare className="w-32 h-32" />
              </div>
              <div className="flex items-center gap-4 mb-4">
                 <div className="p-3 bg-green-500/10 rounded-xl text-green-500">
                    <MessageSquare className="w-8 h-8" />
                 </div>
                 <h2 className="text-2xl font-bold">3. Simulated Interaction</h2>
              </div>
              <p className="text-[var(--text-secondary)] text-lg leading-relaxed">
                 The comment section is alive. We generate different "personas" (Optimistic, Critical, Humorous) to simulate a vibrant community discussion around the video content, giving the feel of a populated platform.
              </p>
           </div>

           {/* Card 4 */}
           <div className="bg-[var(--background-secondary)] p-8 rounded-2xl border border-[var(--border-primary)] relative overflow-hidden group hover:border-[hsl(var(--accent-color))] transition-all">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                 <Play className="w-32 h-32" />
              </div>
              <div className="flex items-center gap-4 mb-4">
                 <div className="p-3 bg-red-500/10 rounded-xl text-red-500">
                    <Play className="w-8 h-8" />
                 </div>
                 <h2 className="text-2xl font-bold">4. Visuals & Media</h2>
              </div>
              <p className="text-[var(--text-secondary)] text-lg leading-relaxed">
                 Thumbnails and avatars are generated deterministically using seeding (via Picsum or Dicebear), ensuring that while the data is dynamic, the visual identity of a generated video remains consistent during your session.
              </p>
           </div>
        </div>

        {/* FAQ / Tech Stack */}
        <div className="bg-[var(--background-secondary)] rounded-3xl p-8 md:p-12 border border-[var(--border-primary)]">
            <h3 className="text-2xl font-bold mb-8 text-center">Tech Stack</h3>
            <div className="flex flex-wrap justify-center gap-8 md:gap-16 text-center">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center">
                        <Globe className="w-8 h-8 text-blue-500" />
                    </div>
                    <span className="font-semibold">React 19</span>
                </div>
                 <div className="flex flex-col items-center gap-3">
                    <div className="w-16 h-16 bg-teal-500/10 rounded-full flex items-center justify-center">
                         <div className="text-xl font-bold text-teal-500">Tw</div>
                    </div>
                    <span className="font-semibold">Tailwind CSS</span>
                </div>
                 <div className="flex flex-col items-center gap-3">
                    <div className="w-16 h-16 bg-amber-500/10 rounded-full flex items-center justify-center">
                        <Cpu className="w-8 h-8 text-amber-500" />
                    </div>
                    <span className="font-semibold">Google GenAI SDK</span>
                </div>
                 <div className="flex flex-col items-center gap-3">
                    <div className="w-16 h-16 bg-purple-500/10 rounded-full flex items-center justify-center">
                        <Database className="w-8 h-8 text-purple-500" />
                    </div>
                    <span className="font-semibold">Local Storage</span>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};