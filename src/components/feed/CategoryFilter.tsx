import React from 'react';
import type { NewsCategory, RadiusFilter } from '../../types';
import { SlidersHorizontal } from 'lucide-react';

interface CategoryFilterProps {
  selectedCategory: NewsCategory | 'nearby' | 'following';
  onSelectCategory: (cat: NewsCategory | 'nearby' | 'following') => void;
  radiusKm: RadiusFilter;
  onSelectRadius: (radius: RadiusFilter) => void;
}

const CATEGORIES: { id: NewsCategory | 'nearby' | 'following'; label: string }[] = [
  { id: 'all', label: 'All News' },
  { id: 'nearby', label: 'Within Radius' },
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
  onSelectCategory,
  radiusKm,
  onSelectRadius
}) => {
  return (
    <div style={{ background: '#ffffff', borderBottom: '1px solid var(--border-subtle)' }}>
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

      {/* Radius Quick Bar if Nearby or All is active */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '6px 14px',
          background: '#f8fafc',
          borderTop: '1px solid #f1f5f9',
          fontSize: '11px',
          color: 'var(--text-secondary)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <SlidersHorizontal size={12} color="var(--brand-primary)" />
          <span style={{ fontWeight: 600 }}>Radius:</span>
        </div>
        <div style={{ display: 'flex', gap: '4px' }}>
          {([1, 5, 25, 100] as RadiusFilter[]).map((r) => (
            <button
              key={r}
              onClick={() => onSelectRadius(r)}
              style={{
                padding: '2px 8px',
                borderRadius: '6px',
                fontSize: '10px',
                fontWeight: 700,
                background: radiusKm === r ? 'var(--brand-primary)' : '#ffffff',
                color: radiusKm === r ? '#ffffff' : 'var(--text-secondary)',
                border: radiusKm === r ? 'none' : '1px solid var(--border-subtle)',
                transition: 'all 0.1s ease'
              }}
            >
              {r === 100 ? 'Citywide' : `${r}km`}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
