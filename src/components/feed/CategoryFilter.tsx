import React, { useRef, useEffect } from 'react';
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
  const scrollRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef(false);
  const hasMovedRef = useRef(false);
  const startXRef = useRef(0);
  const scrollLeftRef = useRef(0);

  // Auto-scroll the active category button into view smoothly
  useEffect(() => {
    if (!scrollRef.current) return;
    const activeBtn = scrollRef.current.querySelector<HTMLButtonElement>('.category-chip.active');
    if (activeBtn) {
      activeBtn.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
  }, [selectedCategory]);

  // Mouse Drag-to-Scroll handlers (for desktop & laptop mouse swiping)
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!scrollRef.current) return;
    isDraggingRef.current = true;
    hasMovedRef.current = false;
    startXRef.current = e.pageX - scrollRef.current.offsetLeft;
    scrollLeftRef.current = scrollRef.current.scrollLeft;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingRef.current || !scrollRef.current) return;
    const x = e.pageX - scrollRef.current.offsetLeft;
    if (Math.abs(x - startXRef.current) > 5) {
      hasMovedRef.current = true;
    }
    e.preventDefault();
    const walk = (x - startXRef.current) * 1.5; // Scroll speed factor
    scrollRef.current.scrollLeft = scrollLeftRef.current - walk;
  };

  const handleMouseUpOrLeave = () => {
    isDraggingRef.current = false;
    setTimeout(() => {
      hasMovedRef.current = false;
    }, 50);
  };

  return (
    <div
      style={{
        height: '46px',
        minHeight: '46px',
        maxHeight: '46px',
        width: '100%',
        maxWidth: '100%',
        background: '#ffffff',
        position: 'sticky',
        top: 0,
        zIndex: 25,
        display: 'flex',
        alignItems: 'center',
        overflow: 'hidden',
        borderBottom: '1px solid var(--border-subtle)',
        boxSizing: 'border-box'
      }}
    >
      {/* Category Pills Bar (Smooth Horizontal Scroll on Mobile & Desktop) */}
      <div
        ref={scrollRef}
        className="category-filter-bar"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUpOrLeave}
        onMouseLeave={handleMouseUpOrLeave}
        style={{
          width: '100%',
          maxWidth: '100%',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '6px 14px',
          overflowX: 'auto',
          overflowY: 'hidden',
          WebkitOverflowScrolling: 'touch',
          touchAction: 'pan-x',
          overscrollBehaviorX: 'contain',
          scrollbarWidth: 'none',
          cursor: 'grab',
          userSelect: 'none'
        }}
      >
        {CATEGORIES.map((c) => (
          <button
            key={c.id}
            type="button"
            className={`category-chip ${selectedCategory === c.id ? 'active' : ''}`}
            onClick={() => {
              if (!hasMovedRef.current) {
                onSelectCategory(c.id);
              }
            }}
            style={{
              flexShrink: 0,
              userSelect: 'none',
              touchAction: 'manipulation'
            }}
          >
            {c.label}
          </button>
        ))}
      </div>
    </div>
  );
};
