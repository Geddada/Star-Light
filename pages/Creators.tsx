import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lightbulb, BarChart2, Zap, DollarSign, ArrowRight, Star, PlaySquare, Users, MessageSquareHeart, ShoppingBag } from 'lucide-react';
import { UploadModal } from '../components/UploadModal';

export const Creators: React.FC = () => {
  const [showUploadModal, setShowUploadModal] = useState(false);
  const navigate = useNavigate();

  const features = [
    {
      icon: Lightbulb,
      title: "AI Idea Generation",
      description: "Stuck in a creative rut? Get unlimited video ideas, scripts, and concepts tailored to your channel's niche."
    },
    {
      icon: BarChart2,
      title: "Content Optimization",
      description: "Let Gemini analyze your content and suggest viral titles, engaging descriptions, and high-CTR thumbnails."
    },
    {
      icon: Zap,
      title: "Automated Workflow",
      description: "Speed up your production process. From generating subtitles to finding the perfect background music, AI is your new co-pilot."
    },
    {
      icon: DollarSign,
      title: "Smarter Monetization",
      description: "Identify the most profitable content trends and get data-driven insights on how to maximize your ad revenue."
    }
  ];

  const monetizationOptions = [
    {
      icon: PlaySquare,
      title: "Ad Revenue",
      description: "Earn a share of the revenue from skippable ads shown on your long-form videos and in the Shorts feed."
    },
    {
      icon: Users,
      title: "Community Memberships",
      description: "Offer exclusive perks and content to your biggest fans in exchange for a recurring monthly payment."
    },
    {
      icon: MessageSquareHeart,
      title: "Supers",
      description: "Let fans show support through one-time payments that highlight their messages in live chats and comments."
    },
    {
      icon: ShoppingBag,
      title: "Merch & Shopping",
      description: "Connect your own store to showcase your merchandise and products directly below your videos."
    }
  ];
  
  const testimonials = [
      {
          name: 'PixelPioneer',
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=pixel',
          quote: "Starlight's AI tools cut my editing and brainstorming time in half. I can focus more on what I love - creating!"
      },
      {
          name: 'GadgetGirl',
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=gadget',
          quote: "The title and thumbnail suggestions are a game-changer. My CTR has never been higher. It's like having a viral marketing expert on my team."
      },
      {
          name: 'ChefChronicles',
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=chef',
          quote: "I was skeptical about AI, but Starlight has genuinely helped me understand my audience better. The insights are incredibly valuable."
      }
  ];

  const handleUploadSuccess = () => {
    setShowUploadModal(false);
    navigate('/profile');
  };

  return (
    <div className="w-full h-full bg-[var(--background-primary)] text-[var(--text-primary)] overflow-y-auto">
      {showUploadModal && (
        <UploadModal 
          onClose={() => setShowUploadModal(false)}
          onUploadSuccess={handleUploadSuccess}
        />
      )}
      {/* Hero Section */}
      <div className="relative text-center py-20 md:py-32 px-6 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[hsl(var(--accent-color))]/20 to-transparent -z-10"></div>
        <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-[hsl(var(--accent-color))] to-blue-600 tracking-tight animate-in fade-in slide-in-from-bottom-4 duration-700">
          Create Without Limits.
        </h1>
        <p className="text-xl text-[var(--text-secondary)] max-w-2xl mx-auto leading-relaxed animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">
          Supercharge your content with Starlight's AI-powered tools. From idea to upload, we're with you every step of the way.
        </p>
        <div className="mt-10 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
           <button 
             onClick={() => setShowUploadModal(true)}
             className="px-8 py-4 bg-[hsl(var(--accent-color))] text-white rounded-full font-bold hover:brightness-90 transition-all shadow-lg flex items-center gap-2 mx-auto"
           >
             Start Creating Now <ArrowRight className="w-5 h-5" />
           </button>
        </div>
      </div>
      
      {/* Features Section */}
      <div className="max-w-6xl mx-auto px-6 py-20">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">Your AI Co-Pilot for Content Creation</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {features.map((feature, index) => (
                  <div key={index} className="bg-[var(--background-secondary)] p-8 rounded-2xl border border-[var(--border-primary)] text-center hover:border-[hsl(var(--accent-color))] hover:-translate-y-1 transition-all">
                      <div className="flex justify-center mb-5">
                         <div className="p-4 rounded-2xl bg-[hsl(var(--accent-color))]/10">
                            <feature.icon className="w-10 h-10 text-[hsl(var(--accent-color))]" />
                         </div>
                      </div>
                      <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                      <p className="text-[var(--text-secondary)]">{feature.description}</p>
                  </div>
              ))}
          </div>
      </div>

      {/* Monetization Section */}
      <div className="bg-[var(--background-secondary)] py-20 px-6 border-y border-[var(--border-primary)]">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">Unlock Your Earning Potential</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {monetizationOptions.map((option, index) => (
              <div key={index} className="flex items-start gap-6 p-6 rounded-2xl border border-[var(--border-primary)] bg-[var(--background-primary)] hover:shadow-lg transition-shadow">
                <div className="p-3 rounded-xl bg-[hsl(var(--accent-color))]/10 text-[hsl(var(--accent-color))]">
                  <option.icon className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2">{option.title}</h3>
                  <p className="text-[var(--text-secondary)]">{option.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* How it works */}
      <div className="py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-12">A Simpler, Smarter Workflow</h2>
            <div className="flex flex-col md:flex-row justify-between items-center gap-8">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-24 h-24 rounded-full bg-[var(--background-primary)] border-2 border-dashed border-[hsl(var(--accent-color))] flex items-center justify-center font-bold text-3xl text-[hsl(var(--accent-color))]">1</div>
                    <h3 className="text-xl font-bold mt-2">Upload</h3>
                    <p className="text-[var(--text-secondary)] max-w-xs">Bring your raw footage to the platform.</p>
                </div>
                <div className="w-full h-1 bg-[var(--border-primary)] hidden md:block"></div>
                 <div className="flex flex-col items-center gap-3">
                    <div className="w-24 h-24 rounded-full bg-[var(--background-primary)] border-2 border-dashed border-[hsl(var(--accent-color))] flex items-center justify-center font-bold text-3xl text-[hsl(var(--accent-color))]">2</div>
                    <h3 className="text-xl font-bold mt-2">Analyze & Enhance</h3>
                    <p className="text-[var(--text-secondary)] max-w-xs">Get AI suggestions for titles, tags, and thumbnails.</p>
                </div>
                <div className="w-full h-1 bg-[var(--border-primary)] hidden md:block"></div>
                 <div className="flex flex-col items-center gap-3">
                    <div className="w-24 h-24 rounded-full bg-[var(--background-primary)] border-2 border-dashed border-[hsl(var(--accent-color))] flex items-center justify-center font-bold text-3xl text-[hsl(var(--accent-color))]">3</div>
                    <h3 className="text-xl font-bold mt-2">Publish & Grow</h3>
                    <p className="text-[var(--text-secondary)] max-w-xs">Launch your content and track its performance.</p>
                </div>
            </div>
        </div>
      </div>
      
      {/* Testimonials */}
      <div className="max-w-6xl mx-auto px-6 py-20">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">Loved by Creators Worldwide</h2>
           <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {testimonials.map((testimonial, index) => (
                  <div key={index} className="bg-[var(--background-secondary)] p-8 rounded-2xl border border-[var(--border-primary)]">
                      <div className="flex items-center gap-4 mb-5">
                          <img src={testimonial.avatar} alt={testimonial.name} className="w-12 h-12 rounded-full bg-gray-700" />
                          <div>
                              <p className="font-bold">{testimonial.name}</p>
                              <div className="flex text-yellow-400">
                                <Star className="w-4 h-4 fill-current" />
                                <Star className="w-4 h-4 fill-current" />
                                <Star className="w-4 h-4 fill-current" />
                                <Star className="w-4 h-4 fill-current" />
                                <Star className="w-4 h-4 fill-current" />
                              </div>
                          </div>
                      </div>
                      <p className="text-[var(--text-secondary)] italic">"{testimonial.quote}"</p>
                  </div>
              ))}
          </div>
      </div>
      
      {/* Final CTA */}
      <div className="bg-gradient-to-r from-[hsl(var(--accent-color))] to-blue-800 py-20 px-6 text-center text-white">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to level up?</h2>
          <p className="max-w-xl mx-auto mb-8 opacity-90">
              Join thousands of creators who are building their channels faster with Starlight.
          </p>
          <button className="px-8 py-4 bg-white text-[hsl(var(--accent-color))] rounded-full font-bold hover:bg-opacity-90 transition-colors shadow-lg">
             Get Started for Free
          </button>
      </div>
    </div>
  );
};
