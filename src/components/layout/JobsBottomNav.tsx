import React from 'react';
import { Briefcase, Search, Plus, FileText, User } from 'lucide-react';

export type JobsTabType = 'jobsHome' | 'search' | 'applications' | 'profile';

export interface JobsBottomNavProps {
  activeTab: JobsTabType;
  onChangeTab: (tab: JobsTabType) => void;
  onOpenPostJob: () => void;
  applicationsCount?: number;
}

export const JobsBottomNav: React.FC<JobsBottomNavProps> = ({
  activeTab,
  onChangeTab,
  onOpenPostJob,
  applicationsCount = 3
}) => {
  return (
    <nav
      className="app-bottom-nav jobs-bottom-nav"
      style={{
        background: '#ffffff',
        borderTop: '1px solid #e2e8f0',
        boxShadow: '0 -2px 12px rgba(15, 23, 42, 0.05)'
      }}
    >
      {/* 1. Jobs Home */}
      <button
        type="button"
        className={`nav-tab-item ${activeTab === 'jobsHome' ? 'active' : ''}`}
        onClick={() => onChangeTab('jobsHome')}
        title="Jobs & Careers Home"
        style={{
          color: activeTab === 'jobsHome' ? '#ea580c' : '#64748b'
        }}
      >
        <Briefcase size={19} strokeWidth={activeTab === 'jobsHome' ? 2.4 : 2} />
        <span style={{ fontWeight: activeTab === 'jobsHome' ? 700 : 500 }}>Jobs Home</span>
      </button>

      {/* 2. Search */}
      <button
        type="button"
        className={`nav-tab-item ${activeTab === 'search' ? 'active' : ''}`}
        onClick={() => onChangeTab('search')}
        title="Search Jobs & Companies"
        style={{
          color: activeTab === 'search' ? '#ea580c' : '#64748b'
        }}
      >
        <Search size={19} strokeWidth={activeTab === 'search' ? 2.4 : 2} />
        <span style={{ fontWeight: activeTab === 'search' ? 700 : 500 }}>Search</span>
      </button>

      {/* 3. Center Elevated + FAB -> Post Job / Resume */}
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <button
          type="button"
          className="nav-create-fab"
          onClick={onOpenPostJob}
          title="Post a Job or Hiring Requirement"
          style={{
            width: '42px',
            height: '42px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #ea580c 0%, #f97316 100%)',
            boxShadow: '0 4px 14px rgba(234, 88, 12, 0.35)',
            border: '2px solid #ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer'
          }}
        >
          <Plus size={22} strokeWidth={2.8} color="#ffffff" />
        </button>
      </div>

      {/* 4. Applications */}
      <button
        type="button"
        className={`nav-tab-item ${activeTab === 'applications' ? 'active' : ''}`}
        onClick={() => onChangeTab('applications')}
        title="Job Applications & Status"
        style={{
          color: activeTab === 'applications' ? '#ea580c' : '#64748b',
          position: 'relative'
        }}
      >
        <div style={{ position: 'relative', display: 'inline-flex' }}>
          <FileText size={19} strokeWidth={activeTab === 'applications' ? 2.4 : 2} />
          {applicationsCount > 0 && (
            <span
              style={{
                position: 'absolute',
                top: '-2px',
                right: '-4px',
                width: '7px',
                height: '7px',
                borderRadius: '50%',
                background: '#ea580c'
              }}
            />
          )}
        </div>
        <span style={{ fontWeight: activeTab === 'applications' ? 700 : 500 }}>Applications</span>
      </button>

      {/* 5. Profile -> Jobs-specific user profile */}
      <button
        type="button"
        className={`nav-tab-item ${activeTab === 'profile' ? 'active' : ''}`}
        onClick={() => onChangeTab('profile')}
        title="Candidate / Recruiter Profile"
        style={{
          color: activeTab === 'profile' ? '#ea580c' : '#64748b'
        }}
      >
        <User size={19} strokeWidth={activeTab === 'profile' ? 2.4 : 2} />
        <span style={{ fontWeight: activeTab === 'profile' ? 700 : 500 }}>Profile</span>
      </button>
    </nav>
  );
};
