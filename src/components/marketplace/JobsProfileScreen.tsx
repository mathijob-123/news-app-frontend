import React, { useState } from 'react';
import {
  User as UserIcon,
  Briefcase,
  FileText,
  MapPin,
  ShieldCheck,
  Award,
  Upload,
  CheckCircle2,
  Clock,
  Building,
  Bookmark,
  Send,
  Plus,
  ArrowLeft,
  Settings,
  Edit3,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import type { User } from '../../types';
import type { MarketplaceJob } from '../../types/marketplace';
import { getStoredJobs } from '../../services/marketplaceService';

interface JobsProfileScreenProps {
  user: User;
  onOpenPostJob: () => void;
  onBackToMain?: () => void;
  onSelectJob?: (job: MarketplaceJob) => void;
}

export const JobsProfileScreen: React.FC<JobsProfileScreenProps> = ({
  user,
  onOpenPostJob,
  onBackToMain,
  onSelectJob
}) => {
  const [roleMode, setRoleMode] = useState<'seeker' | 'employer'>('seeker');
  const [resumeUploaded, setResumeUploaded] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'applied' | 'saved' | 'preferences'>('overview');

  const allJobs = getStoredJobs();
  const savedJobs = allJobs.filter((j) => j.isSaved);

  const appliedJobs = [
    {
      id: 'app-1',
      jobTitle: 'Senior Frontend Developer',
      company: 'TechCorp Solutions',
      location: 'Avadi, Chennai',
      appliedDate: '2 days ago',
      status: 'Shortlisted',
      statusColor: '#10b981',
      statusBg: '#ecfdf5'
    },
    {
      id: 'app-2',
      jobTitle: 'Product Operations Lead',
      company: 'CloudByte Technologies',
      location: 'Chennai Central',
      appliedDate: '1 week ago',
      status: 'Under Review',
      statusColor: '#3b82f6',
      statusBg: '#eff6ff'
    },
    {
      id: 'app-3',
      jobTitle: 'Citizen Journalist / Video Editor',
      company: 'LocalPlus Media Hub',
      location: 'Chennai & Tiruvallur',
      appliedDate: '2 weeks ago',
      status: 'Interview Scheduled',
      statusColor: '#ea580c',
      statusBg: '#fff7ed'
    }
  ];

  const userSkills = ['React.js', 'TypeScript', 'Node.js', 'Mobile UI', 'News Production', 'Video Editing'];

  return (
    <div className="jobs-profile-screen" style={{ padding: '16px 16px 84px', background: '#f8fafc', minHeight: '100%' }}>
      {/* Top Header Row with Back button */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
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
              title="Back to LocalPlus Main"
            >
              <ArrowLeft size={14} />
              <span>Back</span>
            </button>
          )}
          <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
            Jobs Profile & Careers
          </h2>
        </div>

        {/* Role Toggle: Job Seeker vs Employer */}
        <div
          style={{
            display: 'flex',
            background: '#e2e8f0',
            padding: '2px',
            borderRadius: '8px'
          }}
        >
          <button
            onClick={() => setRoleMode('seeker')}
            style={{
              padding: '4px 10px',
              borderRadius: '6px',
              border: 'none',
              background: roleMode === 'seeker' ? '#ffffff' : 'transparent',
              color: roleMode === 'seeker' ? '#0f172a' : '#64748b',
              fontSize: '11px',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            Candidate
          </button>
          <button
            onClick={() => setRoleMode('employer')}
            style={{
              padding: '4px 10px',
              borderRadius: '6px',
              border: 'none',
              background: roleMode === 'employer' ? '#ffffff' : 'transparent',
              color: roleMode === 'employer' ? '#0f172a' : '#64748b',
              fontSize: '11px',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            Recruiter
          </button>
        </div>
      </div>

      {/* User Identity Card */}
      <div
        style={{
          background: '#ffffff',
          borderRadius: '16px',
          padding: '16px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
          marginBottom: '16px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ position: 'relative' }}>
            <img
              src={user.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80'}
              alt={user.displayName || user.handle}
              style={{
                width: '62px',
                height: '62px',
                borderRadius: '50%',
                objectFit: 'cover',
                border: '3px solid #ea580c'
              }}
            />
            <div
              style={{
                position: 'absolute',
                bottom: 0,
                right: 0,
                background: '#10b981',
                borderRadius: '50%',
                width: '18px',
                height: '18px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '2px solid #ffffff'
              }}
            >
              <ShieldCheck size={11} color="#ffffff" strokeWidth={3} />
            </div>
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                {user.displayName || user.handle || 'Candidate'}
              </h3>
              <span
                style={{
                  background: '#ecfdf5',
                  color: '#059669',
                  fontSize: '10px',
                  fontWeight: 700,
                  padding: '2px 6px',
                  borderRadius: '6px'
                }}
              >
                Verified
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '3px', color: '#64748b', fontSize: '12px' }}>
              <MapPin size={12} color="#ea580c" />
              <span>{user.homeLocation?.neighborhood || user.homeLocation?.placeName || 'Chennai, Tamil Nadu'}</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '6px' }}>
              <span
                style={{
                  background: '#fff7ed',
                  color: '#ea580c',
                  fontSize: '11px',
                  fontWeight: 700,
                  padding: '2px 8px',
                  borderRadius: '6px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                <Briefcase size={11} />
                <span>{roleMode === 'seeker' ? 'Actively Looking for Jobs' : 'Hiring Talent in Chennai'}</span>
              </span>
            </div>
          </div>
        </div>

        {/* Quick Seeker/Employer action button */}
        <div style={{ marginTop: '14px', paddingTop: '12px', borderTop: '1px solid #f1f5f9' }}>
          {roleMode === 'seeker' ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#334155', fontWeight: 600 }}>
                <FileText size={14} color="#ea580c" />
                <span>Resume: <strong>{user.displayName || 'Veda'}_Resume_2026.pdf</strong></span>
              </div>
              <button
                onClick={() => alert('Resume updated successfully!')}
                style={{
                  padding: '4px 10px',
                  borderRadius: '6px',
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  color: '#ea580c',
                  fontSize: '11px',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                Update
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '12px', color: '#64748b' }}>Post hiring requirements in Chennai</span>
              <button
                onClick={onOpenPostJob}
                style={{
                  padding: '6px 14px',
                  borderRadius: '8px',
                  background: '#ea580c',
                  color: '#ffffff',
                  fontSize: '11.5px',
                  fontWeight: 700,
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                + Post a Job
              </button>
            </div>
          )}
        </div>
      </div>

      {roleMode === 'seeker' ? (
        <>
          {/* Metrics Row */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '8px',
              marginBottom: '16px'
            }}
          >
            <div
              style={{
                background: '#ffffff',
                borderRadius: '12px',
                padding: '10px 8px',
                textAlign: 'center',
                border: '1px solid #e2e8f0'
              }}
            >
              <span style={{ fontSize: '18px', fontWeight: 800, color: '#ea580c' }}>
                {appliedJobs.length}
              </span>
              <p style={{ margin: '2px 0 0', fontSize: '11px', color: '#64748b', fontWeight: 600 }}>
                Applied Jobs
              </p>
            </div>

            <div
              style={{
                background: '#ffffff',
                borderRadius: '12px',
                padding: '10px 8px',
                textAlign: 'center',
                border: '1px solid #e2e8f0'
              }}
            >
              <span style={{ fontSize: '18px', fontWeight: 800, color: '#10b981' }}>
                {savedJobs.length}
              </span>
              <p style={{ margin: '2px 0 0', fontSize: '11px', color: '#64748b', fontWeight: 600 }}>
                Saved Jobs
              </p>
            </div>

            <div
              style={{
                background: '#ffffff',
                borderRadius: '12px',
                padding: '10px 8px',
                textAlign: 'center',
                border: '1px solid #e2e8f0'
              }}
            >
              <span style={{ fontSize: '18px', fontWeight: 800, color: '#3b82f6' }}>
                14
              </span>
              <p style={{ margin: '2px 0 0', fontSize: '11px', color: '#64748b', fontWeight: 600 }}>
                Profile Views
              </p>
            </div>
          </div>

          {/* Subtabs for Seeker: Overview | Applied | Saved */}
          <div
            style={{
              display: 'flex',
              gap: '6px',
              background: '#e2e8f0',
              padding: '3px',
              borderRadius: '10px',
              marginBottom: '14px'
            }}
          >
            {(['overview', 'applied', 'saved', 'preferences'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  flex: 1,
                  padding: '6px 4px',
                  borderRadius: '8px',
                  border: 'none',
                  background: activeTab === tab ? '#ffffff' : 'transparent',
                  color: activeTab === tab ? '#0f172a' : '#64748b',
                  fontWeight: 700,
                  fontSize: '11px',
                  cursor: 'pointer',
                  textTransform: 'capitalize'
                }}
              >
                {tab}
              </button>
            ))}
          </div>

          {activeTab === 'overview' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {/* Skills */}
              <div style={{ background: '#ffffff', borderRadius: '12px', padding: '14px', border: '1px solid #e2e8f0' }}>
                <h4 style={{ margin: '0 0 8px', fontSize: '13px', fontWeight: 700, color: '#0f172a' }}>
                  Skills & Expertise
                </h4>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {userSkills.map((sk) => (
                    <span
                      key={sk}
                      style={{
                        padding: '4px 10px',
                        borderRadius: '9999px',
                        background: '#fff7ed',
                        color: '#ea580c',
                        fontSize: '11.5px',
                        fontWeight: 600,
                        border: '1px solid #fed7aa'
                      }}
                    >
                      {sk}
                    </span>
                  ))}
                </div>
              </div>

              {/* Experience */}
              <div style={{ background: '#ffffff', borderRadius: '12px', padding: '14px', border: '1px solid #e2e8f0' }}>
                <h4 style={{ margin: '0 0 10px', fontSize: '13px', fontWeight: 700, color: '#0f172a' }}>
                  Work Experience
                </h4>
                <div style={{ borderLeft: '2px solid #ea580c', paddingLeft: '12px' }}>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a' }}>Frontend Engineer</div>
                  <div style={{ fontSize: '11.5px', color: '#64748b', marginTop: '2px' }}>MetroSoft India • 2023 - Present</div>
                  <div style={{ fontSize: '12px', color: '#475569', marginTop: '4px' }}>
                    Building responsive web and mobile web apps with modern technologies.
                  </div>
                </div>
              </div>

              {/* Education */}
              <div style={{ background: '#ffffff', borderRadius: '12px', padding: '14px', border: '1px solid #e2e8f0' }}>
                <h4 style={{ margin: '0 0 8px', fontSize: '13px', fontWeight: 700, color: '#0f172a' }}>
                  Education
                </h4>
                <div style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a' }}>
                  B.E. Computer Science & Engineering
                </div>
                <div style={{ fontSize: '11.5px', color: '#64748b', marginTop: '2px' }}>
                  Anna University, Chennai (2019 - 2023)
                </div>
              </div>
            </div>
          )}

          {activeTab === 'applied' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {appliedJobs.map((app) => (
                <div
                  key={app.id}
                  style={{
                    background: '#ffffff',
                    borderRadius: '12px',
                    padding: '12px',
                    border: '1px solid #e2e8f0',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                >
                  <div>
                    <h4 style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                      {app.jobTitle}
                    </h4>
                    <p style={{ margin: '2px 0 4px', fontSize: '11.5px', color: '#64748b' }}>
                      {app.company} • {app.location}
                    </p>
                    <span style={{ fontSize: '10.5px', color: '#94a3b8' }}>Applied {app.appliedDate}</span>
                  </div>

                  <span
                    style={{
                      background: app.statusBg,
                      color: app.statusColor,
                      fontSize: '11px',
                      fontWeight: 700,
                      padding: '4px 8px',
                      borderRadius: '6px'
                    }}
                  >
                    {app.status}
                  </span>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'saved' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {savedJobs.length === 0 ? (
                <div style={{ background: '#ffffff', borderRadius: '12px', padding: '24px', textAlign: 'center', border: '1px solid #e2e8f0' }}>
                  <Bookmark size={28} color="#94a3b8" style={{ margin: '0 auto 6px' }} />
                  <p style={{ margin: 0, fontSize: '12px', color: '#64748b' }}>No saved jobs yet. Tap the bookmark icon on any job card to save it for later.</p>
                </div>
              ) : (
                savedJobs.map((j) => (
                  <div
                    key={j.id}
                    onClick={() => onSelectJob?.(j)}
                    style={{
                      background: '#ffffff',
                      borderRadius: '12px',
                      padding: '12px',
                      border: '1px solid #e2e8f0',
                      cursor: 'pointer'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <h4 style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                        {j.title}
                      </h4>
                      <span style={{ fontSize: '12px', fontWeight: 800, color: '#ea580c' }}>{j.salary}</span>
                    </div>
                    <p style={{ margin: '3px 0 0', fontSize: '11.5px', color: '#64748b' }}>
                      {j.company} • {j.location}
                    </p>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'preferences' && (
            <div style={{ background: '#ffffff', borderRadius: '12px', padding: '14px', border: '1px solid #e2e8f0' }}>
              <h4 style={{ margin: '0 0 10px', fontSize: '13px', fontWeight: 700, color: '#0f172a' }}>
                Job Preferences
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '12px', color: '#334155' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '8px', borderBottom: '1px solid #f1f5f9' }}>
                  <span style={{ color: '#64748b' }}>Preferred Role:</span>
                  <strong>Software Engineer / Developer</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '8px', borderBottom: '1px solid #f1f5f9' }}>
                  <span style={{ color: '#64748b' }}>Location:</span>
                  <strong>Chennai & Tiruvallur (Hybrid / Remote)</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '8px', borderBottom: '1px solid #f1f5f9' }}>
                  <span style={{ color: '#64748b' }}>Expected Salary:</span>
                  <strong>₹6 LPA – ₹10 LPA</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748b' }}>Notice Period:</span>
                  <strong>Immediate / 15 Days</strong>
                </div>
              </div>
            </div>
          )}
        </>
      ) : (
        /* Recruiter / Employer View */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ background: '#ffffff', borderRadius: '14px', padding: '16px', border: '1px solid #e2e8f0' }}>
            <h4 style={{ margin: '0 0 4px', fontSize: '14px', fontWeight: 800, color: '#0f172a' }}>
              Hiring Dashboard
            </h4>
            <p style={{ margin: '0 0 12px', fontSize: '12px', color: '#64748b' }}>
              Manage job postings and candidate applications across Chennai.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', textAlign: 'center' }}>
              <div style={{ background: '#f8fafc', padding: '8px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '16px', fontWeight: 800, color: '#ea580c' }}>2</div>
                <div style={{ fontSize: '10.5px', color: '#64748b' }}>Active Jobs</div>
              </div>
              <div style={{ background: '#f8fafc', padding: '8px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '16px', fontWeight: 800, color: '#10b981' }}>19</div>
                <div style={{ fontSize: '10.5px', color: '#64748b' }}>Applicants</div>
              </div>
              <div style={{ background: '#f8fafc', padding: '8px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '16px', fontWeight: 800, color: '#3b82f6' }}>4</div>
                <div style={{ fontSize: '10.5px', color: '#64748b' }}>Interviews</div>
              </div>
            </div>
            <button
              onClick={onOpenPostJob}
              style={{
                width: '100%',
                marginTop: '12px',
                padding: '9px',
                borderRadius: '8px',
                background: '#ea580c',
                color: '#ffffff',
                fontWeight: 700,
                fontSize: '12.5px',
                border: 'none',
                cursor: 'pointer'
              }}
            >
              + Post New Job Requirement
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
