import React, { useState, useMemo } from 'react';
import {
  Search,
  MapPin,
  Briefcase,
  Clock,
  Building,
  CheckCircle,
  Bookmark,
  Share2,
  X,
  FileText,
  Send,
  SlidersHorizontal
} from 'lucide-react';
import type { MarketplaceJob, JobCategory } from '../../types/marketplace';
import { getStoredJobs, toggleStoredJobSaved } from '../../services/marketplaceService';

interface JobsMarketplaceProps {
  currentLocationName?: string;
}

export const JobsMarketplace: React.FC<JobsMarketplaceProps> = ({
  currentLocationName = 'Chennai'
}) => {
  const [jobs, setJobs] = useState<MarketplaceJob[]>(getStoredJobs());
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<JobCategory | 'All'>('All');
  const [selectedJob, setSelectedJob] = useState<MarketplaceJob | null>(null);
  const [showApplyModal, setShowApplyModal] = useState(false);

  // Application form state
  const [applicantName, setApplicantName] = useState('');
  const [applicantEmail, setApplicantEmail] = useState('');
  const [applicantPhone, setApplicantPhone] = useState('');
  const [applicantNote, setApplicantNote] = useState('');
  const [applySuccess, setApplySuccess] = useState(false);

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
  }, [jobs, selectedCategory, searchQuery]);

  const handleToggleSaved = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    toggleStoredJobSaved(id);
    setJobs(getStoredJobs());
  };

  const handleOpenJobDetails = (job: MarketplaceJob) => {
    setSelectedJob(job);
    setApplySuccess(false);
  };

  const handleSubmitApplication = (e: React.FormEvent) => {
    e.preventDefault();
    if (!applicantName || !applicantPhone) return;

    // Simulate sending application
    setApplySuccess(true);
    setTimeout(() => {
      setShowApplyModal(false);
      setApplySuccess(false);
      setApplicantName('');
      setApplicantEmail('');
      setApplicantPhone('');
      setApplicantNote('');
      alert(`Application successfully submitted to ${selectedJob?.company}! They will contact you shortly.`);
    }, 1500);
  };

  return (
    <div className="jobs-container">
      {/* Hero Header & Search */}
      <div className="jobs-hero-header">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '12px',
                  background: 'var(--lp-orange)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#ffffff'
                }}
              >
                <Briefcase size={18} />
              </div>
              <h2 style={{ fontFamily: 'Plus Jakarta Sans', fontSize: '22px', fontWeight: 800, color: 'var(--lp-navy)' }}>
                Jobs & Careers
              </h2>
            </div>
            <p style={{ fontSize: '13px', color: 'var(--lp-slate-body)', marginTop: '4px' }}>
              Discover local career opportunities, full-time roles & verified employment in {currentLocationName}
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, background: '#ffffff', border: '1px solid #bfdbfe', padding: '6px 12px', borderRadius: '20px', color: '#1d4ed8' }}>
              {filteredJobs.length} Jobs Available
            </span>
          </div>
        </div>

        {/* Search Bar */}
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <div className="olx-search-input-wrapper" style={{ flex: 1 }}>
            <Search size={16} className="olx-search-icon" />
            <input
              type="text"
              placeholder="Search by job title, skills (e.g. React, Sales), or company..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div
            className="m-location-pill"
            style={{ background: '#ffffff', height: '40px' }}
          >
            <MapPin size={14} color="var(--lp-orange)" />
            <span>{currentLocationName}</span>
          </div>
        </div>

        {/* Categories Horizontal Scroll */}
        <div className="jobs-categories-pills">
          {categories.map((cat) => (
            <button
              key={cat}
              className={`job-pill ${selectedCategory === cat ? 'active' : ''}`}
              onClick={() => setSelectedCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Jobs Listing Grid */}
      <div className="jobs-list-grid">
        {filteredJobs.length === 0 ? (
          <div
            style={{
              gridColumn: '1 / -1',
              background: '#ffffff',
              borderRadius: '16px',
              padding: '48px 20px',
              textAlign: 'center',
              border: '1px solid var(--lp-border)'
            }}
          >
            <Briefcase size={36} color="var(--lp-slate-light)" style={{ margin: '0 auto 12px' }} />
            <h4 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--lp-navy)' }}>
              No job openings found
            </h4>
            <p style={{ fontSize: '12.5px', color: 'var(--lp-slate-body)', marginTop: '4px' }}>
              Try searching with different keywords or switch the category filter.
            </p>
          </div>
        ) : (
          filteredJobs.map((job) => (
            <div
              key={job.id}
              className="job-card"
              onClick={() => handleOpenJobDetails(job)}
            >
              <div>
                <div className="job-card-top">
                  <img
                    src={job.companyLogo || 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?auto=format&fit=crop&w=120&q=80'}
                    alt={job.company}
                    className="job-company-logo"
                  />
                  <div style={{ flex: 1 }}>
                    <h4 style={{ fontSize: '15px', fontWeight: 800, color: 'var(--lp-navy)', lineHeight: 1.2 }}>
                      {job.title}
                    </h4>
                    <span style={{ fontSize: '12.5px', fontWeight: 600, color: 'var(--lp-slate-dark)', display: 'block', marginTop: '2px' }}>
                      {job.company}
                    </span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: 'var(--lp-slate-light)', marginTop: '3px' }}>
                      <MapPin size={11} color="var(--lp-orange)" />
                      <span>{job.location}</span>
                    </div>
                  </div>

                  <button
                    onClick={(e) => handleToggleSaved(job.id, e)}
                    className="olx-card-fav-btn"
                    style={{ position: 'static' }}
                    title={job.isSaved ? 'Saved' : 'Save Job'}
                  >
                    <Bookmark
                      size={15}
                      fill={job.isSaved ? 'var(--lp-orange)' : 'none'}
                      color={job.isSaved ? 'var(--lp-orange)' : 'currentColor'}
                    />
                  </button>
                </div>

                {/* Meta tags */}
                <div className="job-card-meta">
                  <span className="job-meta-tag job-meta-salary">{job.salary}</span>
                  <span className="job-meta-tag">{job.jobType}</span>
                  <span className="job-meta-tag">{job.experience}</span>
                </div>

                {/* Skills tags */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '8px' }}>
                  {job.skills.slice(0, 3).map((skill, idx) => (
                    <span
                      key={idx}
                      style={{
                        fontSize: '10.5px',
                        padding: '2px 6px',
                        borderRadius: '4px',
                        background: '#f8fafc',
                        border: '1px solid #e2e8f0',
                        color: 'var(--lp-slate-dark)'
                      }}
                    >
                      {skill}
                    </span>
                  ))}
                  {job.skills.length > 3 && (
                    <span style={{ fontSize: '10px', color: 'var(--lp-slate-light)', alignSelf: 'center' }}>
                      +{job.skills.length - 3} more
                    </span>
                  )}
                </div>
              </div>

              {/* Actions footer */}
              <div className="job-card-actions">
                <span style={{ fontSize: '11px', color: 'var(--lp-slate-light)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Clock size={11} />
                  <span>Posted {job.postedAt}</span>
                </span>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    className="btn-primary"
                    style={{
                      background: '#ffffff',
                      border: '1px solid #cbd5e1',
                      padding: '6px 14px',
                      borderRadius: '20px',
                      fontSize: '12px',
                      fontWeight: 700,
                      color: 'var(--lp-slate-dark)',
                      cursor: 'pointer'
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenJobDetails(job);
                    }}
                  >
                    View Details
                  </button>

                  <button
                    className="btn-primary"
                    style={{
                      background: 'var(--lp-orange)',
                      color: '#ffffff',
                      border: 'none',
                      padding: '6px 16px',
                      borderRadius: '20px',
                      fontSize: '12px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      boxShadow: '0 4px 12px rgba(234, 88, 12, 0.28)'
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedJob(job);
                      setShowApplyModal(true);
                    }}
                  >
                    Apply Now
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* JOB DETAILS MODAL */}
      {selectedJob && !showApplyModal && (
        <div className="modal-overlay-backdrop" onClick={() => setSelectedJob(null)}>
          <div className="m-modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '640px' }}>
            <div className="m-modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <img
                  src={selectedJob.companyLogo || 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?auto=format&fit=crop&w=120&q=80'}
                  alt={selectedJob.company}
                  style={{ width: '48px', height: '48px', borderRadius: '10px', objectFit: 'cover' }}
                />
                <div>
                  <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--lp-navy)' }}>
                    {selectedJob.title}
                  </h3>
                  <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--lp-slate-dark)' }}>
                    {selectedJob.company} • {selectedJob.location}
                  </span>
                </div>
              </div>

              <button
                onClick={() => setSelectedJob(null)}
                className="m-action-circle-btn"
                style={{ width: '32px', height: '32px' }}
              >
                <X size={16} />
              </button>
            </div>

            <div className="m-modal-body">
              {/* Highlights strip */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginBottom: '18px' }}>
                <div style={{ background: '#f8fafc', padding: '10px', borderRadius: '8px', border: '1px solid var(--lp-border)' }}>
                  <span style={{ fontSize: '11px', color: 'var(--lp-slate-light)', display: 'block' }}>Salary</span>
                  <span style={{ fontSize: '13px', fontWeight: 800, color: '#059669' }}>{selectedJob.salary}</span>
                </div>
                <div style={{ background: '#f8fafc', padding: '10px', borderRadius: '8px', border: '1px solid var(--lp-border)' }}>
                  <span style={{ fontSize: '11px', color: 'var(--lp-slate-light)', display: 'block' }}>Job Type</span>
                  <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--lp-navy)' }}>{selectedJob.jobType}</span>
                </div>
                <div style={{ background: '#f8fafc', padding: '10px', borderRadius: '8px', border: '1px solid var(--lp-border)' }}>
                  <span style={{ fontSize: '11px', color: 'var(--lp-slate-light)', display: 'block' }}>Experience</span>
                  <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--lp-navy)' }}>{selectedJob.experience}</span>
                </div>
              </div>

              {/* Skills */}
              <div style={{ marginBottom: '16px' }}>
                <span style={{ fontSize: '13px', fontWeight: 800, color: 'var(--lp-navy)', display: 'block', marginBottom: '6px' }}>
                  Required Skills
                </span>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {selectedJob.skills.map((skill, idx) => (
                    <span
                      key={idx}
                      style={{
                        padding: '4px 10px',
                        borderRadius: '6px',
                        background: '#fff7ed',
                        color: 'var(--lp-orange)',
                        border: '1px solid #ffedd5',
                        fontSize: '12px',
                        fontWeight: 600
                      }}
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* Description */}
              <div style={{ marginBottom: '16px' }}>
                <span style={{ fontSize: '13px', fontWeight: 800, color: 'var(--lp-navy)', display: 'block', marginBottom: '6px' }}>
                  Job Description
                </span>
                <p style={{ fontSize: '13px', color: 'var(--lp-slate-body)', lineHeight: 1.6 }}>
                  {selectedJob.description}
                </p>
              </div>

              {/* Requirements */}
              <div>
                <span style={{ fontSize: '13px', fontWeight: 800, color: 'var(--lp-navy)', display: 'block', marginBottom: '6px' }}>
                  Requirements
                </span>
                <ul style={{ paddingLeft: '18px', fontSize: '12.5px', color: 'var(--lp-slate-body)', lineHeight: 1.6 }}>
                  {selectedJob.requirements.map((req, idx) => (
                    <li key={idx} style={{ marginBottom: '4px' }}>
                      {req}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="m-modal-footer">
              <button
                type="button"
                onClick={() => setSelectedJob(null)}
                style={{
                  padding: '8px 16px',
                  borderRadius: '8px',
                  border: '1px solid var(--lp-border)',
                  background: '#ffffff',
                  fontSize: '13px',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                Close
              </button>

              <button
                type="button"
                onClick={() => setShowApplyModal(true)}
                style={{
                  padding: '9px 24px',
                  borderRadius: '20px',
                  border: 'none',
                  background: 'var(--lp-orange)',
                  color: '#ffffff',
                  fontSize: '13px',
                  fontWeight: 800,
                  cursor: 'pointer',
                  boxShadow: '0 4px 14px rgba(234, 88, 12, 0.35)'
                }}
              >
                Apply Now
              </button>
            </div>
          </div>
        </div>
      )}

      {/* QUICK APPLY MODAL */}
      {showApplyModal && selectedJob && (
        <div className="modal-overlay-backdrop" onClick={() => setShowApplyModal(false)}>
          <div className="m-modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '520px' }}>
            <div className="m-modal-header">
              <div>
                <h3 style={{ fontSize: '17px', fontWeight: 800, color: 'var(--lp-navy)' }}>
                  Apply for {selectedJob.title}
                </h3>
                <span style={{ fontSize: '12px', color: 'var(--lp-slate-light)' }}>
                  at {selectedJob.company}
                </span>
              </div>
              <button
                onClick={() => setShowApplyModal(false)}
                className="m-action-circle-btn"
                style={{ width: '32px', height: '32px' }}
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSubmitApplication}>
              <div className="m-modal-body">
                <div className="form-group-block">
                  <label>Full Name *</label>
                  <input
                    type="text"
                    required
                    className="form-input-field"
                    placeholder="Your Full Name"
                    value={applicantName}
                    onChange={(e) => setApplicantName(e.target.value)}
                  />
                </div>

                <div className="form-group-block">
                  <label>Email Address *</label>
                  <input
                    type="email"
                    required
                    className="form-input-field"
                    placeholder="you@example.com"
                    value={applicantEmail}
                    onChange={(e) => setApplicantEmail(e.target.value)}
                  />
                </div>

                <div className="form-group-block">
                  <label>Mobile Number *</label>
                  <input
                    type="tel"
                    required
                    className="form-input-field"
                    placeholder="+91 98400 12345"
                    value={applicantPhone}
                    onChange={(e) => setApplicantPhone(e.target.value)}
                  />
                </div>

                <div className="form-group-block">
                  <label>Brief Introduction / Note for Recruiter</label>
                  <textarea
                    rows={3}
                    className="form-textarea-field"
                    placeholder="Highlight your relevant experience and why you are a great fit..."
                    value={applicantNote}
                    onChange={(e) => setApplicantNote(e.target.value)}
                  />
                </div>
              </div>

              <div className="m-modal-footer">
                <button
                  type="button"
                  onClick={() => setShowApplyModal(false)}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '8px',
                    border: '1px solid var(--lp-border)',
                    background: '#ffffff',
                    fontSize: '13px',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={applySuccess}
                  style={{
                    padding: '9px 24px',
                    borderRadius: '20px',
                    border: 'none',
                    background: applySuccess ? '#10b981' : 'var(--lp-orange)',
                    color: '#ffffff',
                    fontSize: '13px',
                    fontWeight: 800,
                    cursor: 'pointer',
                    boxShadow: '0 4px 14px rgba(234, 88, 12, 0.35)'
                  }}
                >
                  {applySuccess ? 'Submitting...' : 'Submit Application'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
