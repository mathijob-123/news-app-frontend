import React from 'react';
import type { NewsCategory } from '../../types';

interface CategoryFilterProps {
  selectedCategory: NewsCategory | 'following';
  onSelectCategory: (cat: NewsCategory | 'following') => void;
}

const CATEGORIES: { id: NewsCategory | 'following'; label: string }[] = [
  { id: 'all', label: 'All News' },
  { id: 'following', label: 'Following' },
  { id: 'traffic', label: 'Traffic' },
  { id: 'weather', label: 'Weather' },
  { id: 'civic', label: 'Civic' },
  { id: 'safety', label: 'Safety' },
  { id: 'community', label: 'Community' },
  { id: 'business', label: 'Business' },
  { id: 'sports', label: 'Sports' }
];

export const CategoryFilter: React.FC<CategoryFilterProps> = ({
  selectedCategory,
  onSelectCategory
}) => {
  return (
    <div
      style={{
        height: '46px',
        minHeight: '46px',
        maxHeight: '46px',
        background: '#ffffff',
        position: 'sticky',
        top: 0,
        zIndex: 25,
        display: 'flex',
        alignItems: 'center',
        flexShrink: 0
      }}
    >
      {/* Category Pills Bar */}
      <div className="category-filter-bar">
        {CATEGORIES.map((c) => (
          <button
            key={c.id}
            className={`category-chip ${selectedCategory === c.id ? 'active' : ''}`}
            onClick={() => onSelectCategory(c.id)}
          >
            {c.label}
          </button>
        ))}
      </div>
    </div>
  );
};

