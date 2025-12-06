import React from 'react';
import { Star, Sparkles, Zap, Globe, Shield, Users } from 'lucide-react';

export const About: React.FC = () => {
  return (
    <div className="w-full h-full bg-[var(--background-primary)] text-[var(--text-primary)] p-6 md:p-12 overflow-y-auto">
      <div className="max-w-4xl mx-auto pb-10">
        {/* Hero Section */}
        <div className="text-center mb-16 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="flex justify-center mb-6">
            <div className="p-5 rounded-3xl bg-red-500/10 shadow-lg shadow-red-500/5">
               <Star className="w-20 h-20 text-red-500 fill-red-500" />
            </div>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-[hsl(var(--accent-color))] to-blue-600 tracking-tight">
            Reimagining Video with AI
          </h1>
          <p className="text-xl text-[var(--text-secondary)] max-w-2xl mx-auto leading-relaxed">
            Starlight is a next-generation video platform demonstration powered by AI. 
            We combine familiar streaming with dynamic, real-time content generation.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-20">
          {[
            {
                icon: Sparkles, 
                color: "text-amber-500", 
                title: "AI-Generated Content", 
                desc: "Every video title, description, and comment section is dynamically crafted by a powerful AI."
            },
            {
                icon: Zap, 
                color: "text-blue-500", 
                title: "Real-time Analysis", 
                desc: "Get instant AI insights on video content, sentiment analysis, and smart recommendations."
            },
            {
                icon: Globe, 
                color: "text-emerald-500", 
                title: "Global Simulation", 
                desc: "Experience a simulated global community with realistic user interactions and trending topics."
            }
          ].map((feature, idx) => (
            <div key={idx} className="p-8 rounded-2xl bg-[var(--background-secondary)] border border-[var(--border-primary)] hover:border-[hsl(var(--accent-color))] transition-all hover:shadow-xl hover:-translate-y-1 group">
                <feature.icon className={`w-10 h-10 ${feature.color} mb-6 group-hover:scale-110 transition-transform`} />
                <h3 className="text-xl font-bold mb-3 text-[var(--text-primary)]">{feature.title}</h3>
                <p className="text-[var(--text-secondary)] leading-relaxed">
                {feature.desc}
                </p>
            </div>
          ))}
        </div>

        {/* Mission Section */}
        <div className="mb-20 bg-[var(--background-secondary)] rounded-3xl p-8 md:p-12 border border-[var(--border-primary)]">
           <div className="flex flex-col md:flex-row items-center gap-12">
              <div className="flex-1 space-y-6">
                 <h2 className="text-3xl font-bold text-[var(--text-primary)]">Our Mission</h2>
                 <div className="text-lg text-[var(--text-secondary)] space-y-4">
                     <p>
                        We built Starlight to demonstrate the potential of Large Language Models (LLMs) in modern web application development.
                     </p>
                     <p>
                        Unlike traditional platforms that rely on static databases, Starlight generates metadata on the fly, creating an infinite playground of content possibilities without the need for massive backend infrastructure.
                     </p>
                 </div>
              </div>
              <div className="flex-1 flex justify-center">
                  <div className="relative w-full max-w-sm aspect-video bg-gradient-to-br from-[hsl(var(--accent-color))] to-blue-900 rounded-xl shadow-2xl flex items-center justify-center text-white font-bold text-2xl overflow-hidden group">
                        <div className="absolute inset-0 bg-[url('https://picsum.photos/seed/mission/600/400')] bg-cover bg-center opacity-50 group-hover:opacity-75 transition-opacity duration-500"></div>
                        <span className="relative z-10">Infinite Content</span>
                  </div>
              </div>
           </div>
        </div>

         {/* Values */}
         <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            <div className="flex items-start gap-5">
               <div className="p-4 rounded-xl bg-[var(--background-secondary)] border border-[var(--border-primary)]">
                  <Shield className="w-8 h-8 text-[hsl(var(--accent-color))]" />
               </div>
               <div>
                  <h3 className="font-bold text-xl mb-2">Privacy Focused</h3>
                  <p className="text-[var(--text-secondary)]">This is a client-side demonstration. No personal data is stored on external servers.</p>
               </div>
            </div>
             <div className="flex items-start gap-5">
               <div className="p-4 rounded-xl bg-[var(--background-secondary)] border border-[var(--border-primary)]">
                  <Users className="w-8 h-8 text-[hsl(var(--accent-color))]" />
               </div>
               <div>
                  <h3 className="font-bold text-xl mb-2">Built for Developers</h3>
                  <p className="text-[var(--text-secondary)]">A showcase of React 19, Tailwind CSS, and the Google GenAI SDK.</p>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
};