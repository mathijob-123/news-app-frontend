import React, { useState } from 'react';
import {
  X,
  Briefcase,
  FileText,
  UserCheck,
  Building,
  MapPin,
  DollarSign,
  CheckCircle2,
  Sparkles
} from 'lucide-react';
import type { MarketplaceJob, JobType, JobCategory } from '../../types/marketplace';
import { getStoredJobs, saveStoredJobs } from '../../services/marketplaceService';

interface PostJobModalProps {
  isOpen: boolean;
  onClose: () => void;
  onJobPublished?: (newJob: MarketplaceJob) => void;
}

export const PostJobModal: React.FC<PostJobModalProps> = ({
  isOpen,
  onClose,
  onJobPublished
}) => {
  const [actionType, setActionType] = useState<'post_job' | 'post_hiring' | 'create_resume' | null>(null);

  // Job form state
  const [jobTitle, setJobTitle] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [location, setLocation] = useState('Avadi / Ambattur, Chennai');
  const [salary, setSalary] = useState('₹4 LPA – ₹7 LPA');
  const [jobType, setJobType] = useState<JobType>('Full Time');
  const [experience, setExperience] = useState('1-3 Years');
  const [category, setCategory] = useState<JobCategory>('IT & Software');
  const [description, setDescription] = useState('');
  const [skills, setSkills] = useState('React, JavaScript, Communication');
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!jobTitle.trim() || !companyName.trim()) return;

    const newJob: MarketplaceJob = {
      id: `job_${Date.now()}`,
      title: jobTitle,
      company: companyName,
      location: location,
      salary: salary,
      jobType: jobType,
      experience: experience,
      category: category,
      postedAt: 'Just now',
      description: description || 'Exciting opportunity to join our growing team in Chennai. Competitive compensation and flexible environment.',
      requirements: ['Relevant experience in the domain', 'Strong communication skills', 'Good teamwork ethos'],
      skills: skills.split(',').map((s) => s.trim()).filter(Boolean),
      contactEmail: 'hr@company.com',
      applicantCount: 0,
      isSaved: false
    };

    // Save job
    try {
      const stored = getStoredJobs();
      saveStoredJobs([newJob, ...stored]);
    } catch (e) {
      console.error(e);
    }

    setIsSuccess(true);
    setTimeout(() => {
      onJobPublished?.(newJob);
      setIsSuccess(false);
      onClose();
      setActionType(null);
    }, 1200);
  };

  return (
    <div className="modal-overlay-backdrop" onClick={onClose} style={{ zIndex: 100 }}>
      <div
        className="m-modal-card"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '520px', width: '92%', borderRadius: '18px', maxHeight: '90vh', overflowY: 'auto' }}
      >
        {/* Header */}
        <div className="m-modal-header" style={{ padding: '16px 20px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h3 style={{ fontSize: '17px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
              {actionType === 'create_resume' ? 'Create / Update Resume' : actionType ? 'Post Job Requirement' : 'Jobs & Hiring Action'}
            </h3>
            <span style={{ fontSize: '11.5px', color: '#64748b' }}>
              LocalPlus Careers & Talent Network
            </span>
          </div>
          <button
            onClick={onClose}
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              background: '#f1f5f9',
              border: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer'
            }}
          >
            <X size={16} />
          </button>
        </div>

        {isSuccess ? (
          <div style={{ padding: '36px 20px', textAlign: 'center' }}>
            <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: '#ecfdf5', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
              <CheckCircle2 size={32} />
            </div>
            <h4 style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', margin: '0 0 6px' }}>
              Successfully Published!
            </h4>
            <p style={{ fontSize: '12.5px', color: '#64748b', margin: 0 }}>
              Your job is now visible to candidates across Chennai & Tiruvallur.
            </p>
          </div>
        ) : !actionType ? (
          /* Selection Menu */
          <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <button
              onClick={() => setActionType('post_job')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '14px',
                padding: '14px',
                borderRadius: '12px',
                background: '#ffffff',
                border: '1px solid #e2e8f0',
                cursor: 'pointer',
                textAlign: 'left'
              }}
            >
              <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: '#fff7ed', color: '#ea580c', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Briefcase size={20} />
              </div>
              <div style={{ flex: 1 }}>
                <h4 style={{ margin: 0, fontSize: '14px', fontWeight: 700, color: '#0f172a' }}>
                  Post a Job Opening
                </h4>
                <p style={{ margin: '2px 0 0', fontSize: '11.5px', color: '#64748b' }}>
                  Hire skilled talent from Chennai and nearby local neighborhoods.
                </p>
              </div>
            </button>

            <button
              onClick={() => setActionType('post_hiring')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '14px',
                padding: '14px',
                borderRadius: '12px',
                background: '#ffffff',
                border: '1px solid #e2e8f0',
                cursor: 'pointer',
                textAlign: 'left'
              }}
            >
              <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: '#eff6ff', color: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Building size={20} />
              </div>
              <div style={{ flex: 1 }}>
                <h4 style={{ margin: 0, fontSize: '14px', fontWeight: 700, color: '#0f172a' }}>
                  Post Urgent Hiring Requirement
                </h4>
                <p style={{ margin: '2px 0 0', fontSize: '11.5px', color: '#64748b' }}>
                  Quickly hire drivers, retail staff, delivery personnel, or tutors.
                </p>
              </div>
            </button>

            <button
              onClick={() => {
                alert('Opening Resume Builder... You can upload your CV or link LinkedIn profile.');
                onClose();
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '14px',
                padding: '14px',
                borderRadius: '12px',
                background: '#ffffff',
                border: '1px solid #e2e8f0',
                cursor: 'pointer',
                textAlign: 'left'
              }}
            >
              <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: '#ecfdf5', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <FileText size={20} />
              </div>
              <div style={{ flex: 1 }}>
                <h4 style={{ margin: 0, fontSize: '14px', fontWeight: 700, color: '#0f172a' }}>
                  Create or Upload Resume
                </h4>
                <p style={{ margin: '2px 0 0', fontSize: '11.5px', color: '#64748b' }}>
                  Build a profile to get discovered by top local employers.
                </p>
              </div>
            </button>
          </div>
        ) : (
          /* Job Posting Form */
          <form onSubmit={handleSubmit} style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div>
              <label style={{ fontSize: '12px', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '4px' }}>
                Job Title *
              </label>
              <input
                type="text"
                placeholder="e.g. Sales Executive, Frontend Dev, Graphic Designer"
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                required
                style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', outline: 'none' }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '4px' }}>
                  Company Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Star Enterprises"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  required
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', outline: 'none' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '4px' }}>
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', background: '#fff' }}
                >
                  <option value="IT & Software">IT & Software</option>
                  <option value="Sales">Sales</option>
                  <option value="Marketing">Marketing</option>
                  <option value="Finance">Finance</option>
                  <option value="HR">HR</option>
                  <option value="Customer Support">Customer Support</option>
                  <option value="Education">Education</option>
                  <option value="Healthcare">Healthcare</option>
                  <option value="Engineering">Engineering</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '4px' }}>
                  Salary Package
                </label>
                <input
                  type="text"
                  placeholder="e.g. ₹20,000/mo or ₹5-8 LPA"
                  value={salary}
                  onChange={(e) => setSalary(e.target.value)}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', outline: 'none' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '4px' }}>
                  Job Type
                </label>
                <select
                  value={jobType}
                  onChange={(e) => setJobType(e.target.value as JobType)}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', background: '#fff' }}
                >
                  <option value="Full Time">Full Time</option>
                  <option value="Part Time">Part Time</option>
                  <option value="Contract">Contract</option>
                  <option value="Remote">Remote</option>
                  <option value="Internship">Internship</option>
                </select>
              </div>
            </div>

            <div>
              <label style={{ fontSize: '12px', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '4px' }}>
                Job Location
              </label>
              <input
                type="text"
                placeholder="e.g. Avadi, Ambattur, Guindy, Chennai"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', outline: 'none' }}
              />
            </div>

            <div>
              <label style={{ fontSize: '12px', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '4px' }}>
                Required Skills (Comma-separated)
              </label>
              <input
                type="text"
                placeholder="e.g. Lead Generation, Excel, English, Sales"
                value={skills}
                onChange={(e) => setSkills(e.target.value)}
                style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', outline: 'none' }}
              />
            </div>

            <div>
              <label style={{ fontSize: '12px', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '4px' }}>
                Job Description
              </label>
              <textarea
                rows={3}
                placeholder="Roles, responsibilities, and benefits..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', outline: 'none' }}
              />
            </div>

            <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
              <button
                type="button"
                onClick={() => setActionType(null)}
                style={{
                  flex: 1,
                  padding: '9px',
                  borderRadius: '8px',
                  border: '1px solid #e2e8f0',
                  background: '#f8fafc',
                  color: '#475569',
                  fontWeight: 600,
                  fontSize: '12px',
                  cursor: 'pointer'
                }}
              >
                Back
              </button>
              <button
                type="submit"
                style={{
                  flex: 2,
                  padding: '9px',
                  borderRadius: '8px',
                  border: 'none',
                  background: 'linear-gradient(135deg, #ea580c 0%, #f97316 100%)',
                  color: '#ffffff',
                  fontWeight: 700,
                  fontSize: '12.5px',
                  cursor: 'pointer',
                  boxShadow: '0 2px 8px rgba(234, 88, 12, 0.3)'
                }}
              >
                Publish Job Opening
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
