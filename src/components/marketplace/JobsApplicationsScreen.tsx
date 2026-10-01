import React, { useState } from 'react';
import {
  FileText,
  Clock,
  CheckCircle2,
  Calendar,
  Building,
  MapPin,
  ArrowLeft,
  ChevronRight,
  ExternalLink,
  MessageSquare,
  AlertCircle
} from 'lucide-react';
import type { MarketplaceJob } from '../../types/marketplace';

interface JobsApplicationsScreenProps {
  onBackToMain?: () => void;
  onSelectJob?: (job: MarketplaceJob) => void;
}

export const JobsApplicationsScreen: React.FC<JobsApplicationsScreenProps> = ({
  onBackToMain,
  onSelectJob
}) => {
  const [filter, setFilter] = useState<'all' | 'interview' | 'review' | 'shortlisted'>('all');

  const applications = [
    {
      id: 'app-1',
      title: 'Senior Frontend Developer (React)',
      company: 'CloudByte Technologies',
      location: 'Avadi / Ambattur, Chennai',
      salary: '₹8 LPA – ₹14 LPA',
      appliedAt: 'Yesterday',
      status: 'Interview Scheduled',
      statusKey: 'interview',
      statusColor: '#ea580c',
      statusBg: '#fff7ed',
      stepNumber: 3,
      nextStep: 'Technical Interview on Google Meet: Oct 3, 2:30 PM'
    },
    {
      id: 'app-2',
      title: 'Digital Content & Video Lead',
      company: 'MetroPulse Media',
      location: 'Chennai Central',
      salary: '₹5 LPA – ₹8 LPA',
      appliedAt: '3 days ago',
      status: 'Shortlisted',
      statusKey: 'shortlisted',
      statusColor: '#10b981',
      statusBg: '#ecfdf5',
      stepNumber: 2,
      nextStep: 'HR screening review in progress'
    },
    {
      id: 'app-3',
      title: 'Full Stack Engineer',
      company: 'FinTrack Labs',
      location: 'Tiruvallur / Remote',
      salary: '₹7 LPA – ₹11 LPA',
      appliedAt: '1 week ago',
      status: 'Under Review',
      statusKey: 'review',
      statusColor: '#3b82f6',
      statusBg: '#eff6ff',
      stepNumber: 1,
      nextStep: 'Resume viewed by hiring team'
    }
  ];

  const filtered = applications.filter((a) => {
    if (filter === 'all') return true;
    return a.statusKey === filter;
  });

  return (
    <div className="jobs-applications-screen" style={{ padding: '16px 16px 84px', background: '#f8fafc', minHeight: '100%' }}>
      {/* Header */}
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
              title="Back"
            >
              <ArrowLeft size={14} />
              <span>Back</span>
            </button>
          )}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <FileText size={20} color="#ea580c" />
            <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
              Job Applications
            </h2>
          </div>
        </div>

        <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>
          {applications.length} submitted
        </span>
      </div>

      {/* Filter Chips */}
      <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '8px', marginBottom: '12px', scrollbarWidth: 'none' }}>
        <button
          onClick={() => setFilter('all')}
          style={{
            padding: '5px 12px',
            borderRadius: '9999px',
            border: filter === 'all' ? '1px solid #ea580c' : '1px solid #e2e8f0',
            background: filter === 'all' ? '#fff7ed' : '#ffffff',
            color: filter === 'all' ? '#ea580c' : '#475569',
            fontSize: '11.5px',
            fontWeight: 700,
            cursor: 'pointer',
            whiteSpace: 'nowrap'
          }}
        >
          All Applications
        </button>

        <button
          onClick={() => setFilter('interview')}
          style={{
            padding: '5px 12px',
            borderRadius: '9999px',
            border: filter === 'interview' ? '1px solid #ea580c' : '1px solid #e2e8f0',
            background: filter === 'interview' ? '#fff7ed' : '#ffffff',
            color: filter === 'interview' ? '#ea580c' : '#475569',
            fontSize: '11.5px',
            fontWeight: 700,
            cursor: 'pointer',
            whiteSpace: 'nowrap'
          }}
        >
          Interviews (1)
        </button>

        <button
          onClick={() => setFilter('shortlisted')}
          style={{
            padding: '5px 12px',
            borderRadius: '9999px',
            border: filter === 'shortlisted' ? '1px solid #ea580c' : '1px solid #e2e8f0',
            background: filter === 'shortlisted' ? '#fff7ed' : '#ffffff',
            color: filter === 'shortlisted' ? '#ea580c' : '#475569',
            fontSize: '11.5px',
            fontWeight: 700,
            cursor: 'pointer',
            whiteSpace: 'nowrap'
          }}
        >
          Shortlisted (1)
        </button>

        <button
          onClick={() => setFilter('review')}
          style={{
            padding: '5px 12px',
            borderRadius: '9999px',
            border: filter === 'review' ? '1px solid #ea580c' : '1px solid #e2e8f0',
            background: filter === 'review' ? '#fff7ed' : '#ffffff',
            color: filter === 'review' ? '#ea580c' : '#475569',
            fontSize: '11.5px',
            fontWeight: 700,
            cursor: 'pointer',
            whiteSpace: 'nowrap'
          }}
        >
          Under Review (1)
        </button>
      </div>

      {/* Applications List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {filtered.map((item) => (
          <div
            key={item.id}
            style={{
              background: '#ffffff',
              borderRadius: '14px',
              padding: '14px',
              border: '1px solid #e2e8f0',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.03)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
              <div>
                <h4 style={{ fontSize: '14px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                  {item.title}
                </h4>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '3px', color: '#64748b', fontSize: '12px' }}>
                  <Building size={12} color="#ea580c" />
                  <span>{item.company}</span>
                  <span>•</span>
                  <MapPin size={12} color="#94a3b8" />
                  <span>{item.location}</span>
                </div>
              </div>

              <span
                style={{
                  background: item.statusBg,
                  color: item.statusColor,
                  fontSize: '11px',
                  fontWeight: 700,
                  padding: '4px 8px',
                  borderRadius: '6px',
                  whiteSpace: 'nowrap'
                }}
              >
                {item.status}
              </span>
            </div>

            {/* Next Step / Status Card */}
            <div
              style={{
                marginTop: '10px',
                padding: '8px 10px',
                borderRadius: '8px',
                background: '#f8fafc',
                border: '1px solid #f1f5f9',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '11.5px',
                color: '#334155'
              }}
            >
              <Calendar size={13} color="#ea580c" />
              <span>{item.nextStep}</span>
            </div>

            {/* Bottom Info & Action */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px', paddingTop: '8px', borderTop: '1px solid #f8fafc' }}>
              <span style={{ fontSize: '11px', color: '#94a3b8' }}>Applied {item.appliedAt}</span>
              <button
                onClick={() => alert(`Connecting with recruiter at ${item.company}...`)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  background: 'transparent',
                  border: 'none',
                  color: '#ea580c',
                  fontSize: '11.5px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  padding: 0
                }}
              >
                <MessageSquare size={12} />
                <span>Message Recruiter</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
