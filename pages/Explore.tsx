import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Compass, Hash, ArrowRight, Layers, Tag } from 'lucide-react';
import { CATEGORIES } from '../types';

export const Explore: React.FC = () => {
  const navigate = useNavigate();

  const handleCategoryClick = (categoryId: string) => {
    navigate(`/?category=${categoryId}`);
  };

  const handleSubCategoryClick = (categoryId: string, subCategoryId: string) => {
    navigate(`/?category=${categoryId}&subcategory=${subCategoryId}`);
  };

  // Filter out the 'All' category for the directory view as it's redundant here
  const directoryCategories = CATEGORIES.filter(c => c.id !== 'all');

  return (
    <div className="w-full h-full bg-[var(--background-primary)] text-[var(--text-primary)] overflow-y-auto p-6 md:p-8 custom-scrollbar">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 shadow-lg border border-white/10">
                <Compass className="w-10 h-10 text-[hsl(var(--accent-color))]" />
            </div>
            <div>
                <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[hsl(var(--accent-color))] to-purple-500">
                    Explore
                </h1>
                <p className="text-[var(--text-secondary)] mt-1 text-lg">
                    Discover content by topic and interest.
                </p>
            </div>
          </div>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {directoryCategories.map((category, index) => (
            <div 
              key={category.id}
              className="bg-[var(--background-secondary)] rounded-2xl border border-[var(--border-primary)] hover:border-[hsl(var(--accent-color))] transition-all duration-300 hover:shadow-xl group flex flex-col h-full overflow-hidden animate-in fade-in slide-in-from-bottom-8"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              {/* Card Header */}
              <div 
                className="p-5 border-b border-[var(--border-primary)] bg-[var(--background-tertiary)]/30 flex justify-between items-center cursor-pointer"
                onClick={() => handleCategoryClick(category.id)}
              >
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-[hsl(var(--accent-color))]/10 rounded-lg text-[hsl(var(--accent-color))]">
                        <Layers className="w-5 h-5" />
                    </div>
                    <h2 className="text-xl font-bold text-[var(--text-primary)] group-hover:text-[hsl(var(--accent-color))] transition-colors">
                        {category.name}
                    </h2>
                </div>
                <ArrowRight className="w-5 h-5 text-[var(--text-tertiary)] group-hover:translate-x-1 transition-transform" />
              </div>

              {/* Sub-categories List */}
              <div className="p-5 flex-1">
                {category.subCategories && category.subCategories.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                        {category.subCategories.map((sub) => (
                            <button
                                key={sub.id}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleSubCategoryClick(category.id, sub.id);
                                }}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium bg-[var(--background-primary)] border border-[var(--border-primary)] text-[var(--text-secondary)] hover:bg-[hsl(var(--accent-color))] hover:text-white hover:border-[hsl(var(--accent-color))] transition-all duration-200"
                            >
                                <Hash className="w-3 h-3 opacity-50" />
                                {sub.name}
                            </button>
                        ))}
                    </div>
                ) : (
                    <div className="h-full flex items-center justify-center text-[var(--text-tertiary)] italic text-sm">
                        <Tag className="w-4 h-4 mr-2" /> No sub-topics available
                    </div>
                )}
              </div>
              
              {/* Footer Action */}
              <div 
                className="px-5 py-3 bg-[var(--background-tertiary)]/10 text-center border-t border-[var(--border-primary)] cursor-pointer hover:bg-[var(--background-tertiary)]/30 transition-colors"
                onClick={() => handleCategoryClick(category.id)}
              >
                  <span className="text-xs font-bold text-[hsl(var(--accent-color))] uppercase tracking-wider">
                      Browse All {category.name}
                  </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};