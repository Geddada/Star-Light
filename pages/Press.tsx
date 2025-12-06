import React, { useEffect, useState } from 'react';
import { Newspaper, Download, Mail, Calendar, Loader2 } from 'lucide-react';
import { fetchPressReleases } from '../services/gemini';
import { PressRelease } from '../types';

export const Press: React.FC = () => {
  const [pressReleases, setPressReleases] = useState<PressRelease[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadReleases = async () => {
      setLoading(true);
      const data = await fetchPressReleases();
      setPressReleases(data);
      setLoading(false);
    };
    loadReleases();
  }, []);

  return (
    <div className="w-full h-full bg-[var(--background-primary)] text-[var(--text-primary)] p-6 md:p-12 overflow-y-auto">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="flex justify-center mb-6">
            <div className="p-5 rounded-3xl bg-[hsl(var(--accent-color))]/10 shadow-lg shadow-[hsl(var(--accent-color))]/5">
              <Newspaper className="w-16 h-16 text-[hsl(var(--accent-color))]" />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-[hsl(var(--accent-color))] to-blue-600 tracking-tight">
            Press & Media
          </h1>
          <p className="text-xl text-[var(--text-secondary)] max-w-3xl mx-auto leading-relaxed">
            Latest news, announcements, and resources from the Starlight team.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">
          {/* Press Releases */}
          <div className="lg:col-span-2 space-y-8">
            <h2 className="text-2xl font-bold border-b border-[var(--border-primary)] pb-3">Latest Releases</h2>
            {loading ? (
              <div className="space-y-8">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex gap-4 animate-pulse">
                    <div className="w-12 h-12 bg-[var(--background-secondary)] rounded-lg flex-shrink-0"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-5 bg-[var(--background-secondary)] w-3/4 rounded-md"></div>
                      <div className="h-4 bg-[var(--background-secondary)] w-full rounded-md"></div>
                      <div className="h-4 bg-[var(--background-secondary)] w-1/2 rounded-md"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              pressReleases.map(release => (
                <div key={release.id} className="bg-[var(--background-secondary)] p-6 rounded-2xl border border-[var(--border-primary)] hover:border-[hsl(var(--accent-color))] transition-colors">
                  <p className="flex items-center gap-2 text-sm text-[var(--text-secondary)] mb-2">
                    <Calendar className="w-4 h-4" />
                    <span>{release.date}</span>
                  </p>
                  <h3 className="text-xl font-bold mb-3 text-[var(--text-primary)] hover:text-[hsl(var(--accent-color))] cursor-pointer">
                    {release.title}
                  </h3>
                  <p className="text-[var(--text-secondary)] leading-relaxed">
                    {release.summary}
                  </p>
                </div>
              ))
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-8 sticky top-8">
            <div className="bg-[var(--background-secondary)] p-6 rounded-2xl border border-[var(--border-primary)]">
              <h3 className="text-lg font-bold mb-4">Media Kit</h3>
              <p className="text-sm text-[var(--text-secondary)] mb-5">
                Download our official logos, brand guidelines, and high-resolution product screenshots.
              </p>
              <button className="w-full flex items-center justify-center gap-2 py-2.5 bg-[hsl(var(--accent-color))] text-white rounded-lg font-bold filter hover:brightness-90 transition-colors shadow-md">
                <Download className="w-4 h-4" />
                <span>Download Kit (.zip)</span>
              </button>
            </div>

            <div className="bg-[var(--background-secondary)] p-6 rounded-2xl border border-[var(--border-primary)]">
              <h3 className="text-lg font-bold mb-4">Media Contact</h3>
              <div className="space-y-3">
                 <div className="flex items-center gap-3">
                    <Mail className="w-5 h-5 text-[var(--text-secondary)]" />
                    <div>
                        <p className="font-semibold text-sm">General Inquiries</p>
                        <a href="mailto:press@starlight.app" className="text-sm text-[hsl(var(--accent-color))] hover:underline">
                            press@starlight.app
                        </a>
                    </div>
                 </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
