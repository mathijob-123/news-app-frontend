import React, { useState, useMemo } from 'react';
import {
  Search,
  MapPin,
  Briefcase,
  Building,
  Clock,
  ArrowLeft,
  X,
  Bookmark,
  CheckCircle2,
  SlidersHorizontal
} from 'lucide-react';
import type { MarketplaceJob, JobCategory } from '../../types/marketplace';
import { getStoredJobs, toggleStoredJobSaved } from '../../services/marketplaceService';

interface JobsSearchScreenProps {
  onBackToMain?: () => void;
  onSelectJob?: (job: MarketplaceJob) => void;
}

export const JobsSearchScreen: React.FC<JobsSearchScreenProps> = ({
  onBackToMain,
  onSelectJob
}) => {
  const [jobs, setJobs] = useState<MarketplaceJob[]>(getStoredJobs());
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<JobCategory | 'All'>('All');
  const [selectedJobType, setSelectedJobType] = useState<string>('All');
  const [selectedExperience, setSelectedExperience] = useState<string>('All');

  const categories: Array<JobCategory | 'All'> = [
    'All',
    'IT & Software',
    'Sales',
    'Marketing',
    'Finance',
    'HR',
    'Customer Support',
    'Education',
    'Healthcare',
    'Engineering'
  ];

  const filteredJobs = useMemo(() => {
    return jobs.filter((job) => {
      if (selectedCategory !== 'All' && job.category !== selectedCategory) {
        return false;
      }
      if (selectedJobType !== 'All' && job.jobType !== selectedJobType) {
        return false;
      }
      if (selectedExperience !== 'All' && !job.experience.includes(selectedExperience)) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = job.title.toLowerCase().includes(q);
        const matchesCompany = job.company.toLowerCase().includes(q);
        const matchesSkills = job.skills.some((s) => s.toLowerCase().includes(q));
        const matchesLocation = job.location.toLowerCase().includes(q);
        if (!matchesTitle && !matchesCompany && !matchesSkills && !matchesLocation) {
          return false;
        }
      }
      return true;
    });
  }, [jobs, selectedCategory, selectedJobType, selectedExperience, searchQuery]);

  const handleToggleSaved = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    toggleStoredJobSaved(id);
    setJobs(getStoredJobs());
  };

  return (
    <div className="jobs-search-screen" style={{ padding: '16px 16px 84px', background: '#f8fafc', minHeight: '100%' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {onBackToMain && (
            <button
              onClick={onBackToMain}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                padding: '6px 10px',
                borderRadius: '8px',
                background: '#ffffff',
                border: '1px solid #e2e8f0',
                color: '#475569',
                fontSize: '12px',
                fontWeight: 700,
                cursor: 'pointer'
              }}
              title="Back"
            >
              <ArrowLeft size={14} />
              <span>Back</span>
            </button>
          )}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Search size={20} color="#ea580c" />
            <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
              Search Jobs
            </h2>
          </div>
        </div>

        <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>
          {filteredJobs.length} openings
        </span>
      </div>

      {/* Search Input */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          background: '#ffffff',
          borderRadius: '12px',
          padding: '8px 12px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)',
          marginBottom: '10px'
        }}
      >
        <Search size={16} color="#94a3b8" />
        <input
          type="text"
          placeholder="Title, skill, or company in Chennai..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{ flex: 1, border: 'none', outline: 'none', fontSize: '13px', background: 'transparent', color: '#0f172a' }}
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 0 }}
          >
            <X size={14} color="#94a3b8" />
          </button>
        )}
      </div>

      {/* Categories Horizontal Scroll */}
      <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '8px', marginBottom: '10px', scrollbarWidth: 'none' }}>
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            style={{
              padding: '5px 12px',
              borderRadius: '9999px',
              border: selectedCategory === cat ? '1px solid #ea580c' : '1px solid #e2e8f0',
              background: selectedCategory === cat ? '#fff7ed' : '#ffffff',
              color: selectedCategory === cat ? '#ea580c' : '#475569',
              fontSize: '11.5px',
              fontWeight: 700,
              cursor: 'pointer',
              whiteSpace: 'nowrap'
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Filter Row: Type & Exp */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', marginBottom: '14px', fontSize: '11.5px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ color: '#64748b', fontWeight: 600 }}>Type:</span>
          <select
            value={selectedJobType}
            onChange={(e) => setSelectedJobType(e.target.value)}
            style={{ padding: '4px 8px', borderRadius: '6px', border: '1px solid #cbd5e1', background: '#fff', fontSize: '11.5px', cursor: 'pointer' }}
          >
            <option value="All">All Types</option>
            <option value="Full Time">Full Time</option>
            <option value="Part Time">Part Time</option>
            <option value="Internship">Internship</option>
          </select>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ color: '#64748b', fontWeight: 600 }}>Exp:</span>
          <select
            value={selectedExperience}
            onChange={(e) => setSelectedExperience(e.target.value)}
            style={{ padding: '4px 8px', borderRadius: '6px', border: '1px solid #cbd5e1', background: '#fff', fontSize: '11.5px', cursor: 'pointer' }}
          >
            <option value="All">Any Experience</option>
            <option value="0-2">0-2 Years</option>
            <option value="2-5">2-5 Years</option>
            <option value="5+">5+ Years</option>
          </select>
        </div>
      </div>

      {/* Results */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {filteredJobs.length === 0 ? (
          <div style={{ background: '#ffffff', borderRadius: '14px', padding: '36px 16px', textAlign: 'center', border: '1px solid #e2e8f0' }}>
            <Briefcase size={36} color="#94a3b8" style={{ margin: '0 auto 8px' }} />
            <h4 style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a', margin: '0 0 4px' }}>
              No job postings matched
            </h4>
            <p style={{ fontSize: '12px', color: '#64748b', margin: 0 }}>
              Try searching with broader terms or different category filters.
            </p>
          </div>
        ) : (
          filteredJobs.map((job) => (
            <div
              key={job.id}
              onClick={() => onSelectJob?.(job)}
              style={{
                background: '#ffffff',
                borderRadius: '14px',
                padding: '14px',
                border: '1px solid #e2e8f0',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.03)',
                cursor: 'pointer'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <h4 style={{ fontSize: '14px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                    {job.title}
                  </h4>
                  <div style={{ fontSize: '12px', color: '#475569', marginTop: '2px', fontWeight: 600 }}>
                    {job.company}
                  </div>
                </div>

                <button
                  onClick={(e) => handleToggleSaved(job.id, e)}
                  style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 0 }}
                >
                  <Bookmark size={18} color={job.isSaved ? '#ea580c' : '#94a3b8'} fill={job.isSaved ? '#ea580c' : 'none'} />
                </button>
              </div>

              <div style={{ fontSize: '13.5px', fontWeight: 800, color: '#ea580c', marginTop: '6px' }}>
                {job.salary}
              </div>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '8px', fontSize: '11px', color: '#64748b' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                  <MapPin size={11} color="#ea580c" /> {job.location}
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                  <Briefcase size={11} color="#94a3b8" /> {job.jobType}
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                  <Clock size={11} color="#94a3b8" /> {job.experience}
                </span>
              </div>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '10px' }}>
                {job.skills.slice(0, 3).map((sk) => (
                  <span
                    key={sk}
                    style={{
                      background: '#f1f5f9',
                      color: '#475569',
                      fontSize: '10.5px',
                      padding: '2px 7px',
                      borderRadius: '4px',
                      fontWeight: 600
                    }}
                  >
                    {sk}
                  </span>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
