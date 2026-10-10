import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Building2,
  Briefcase,
  MapPin,
  Calendar,
  Users,
  Link2,
  DollarSign,
  Layers,
  FileText,
  AlertCircle,
  Loader2,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';
import { createReferralOpportunity } from '../../services/referralService';
import Button from '../../components/Button';

export const CreateReferralPage = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: '',
    companyName: '',
    role: '',
    department: 'Engineering',
    industry: 'Information Technology & Services',
    jobUrl: '',
    workMode: 'HYBRID',
    location: '',
    employmentType: 'FULL_TIME',
    experienceRequired: '0-2 years',
    salaryOrPackage: '',
    applicationDeadline: '',
    maximumRequests: 10,
    requiredSkills: '',
    preferredSkills: '',
    referralInstructions: 'Submit your updated resume with relevant project links and specify why you are a great fit.',
    description: '',
    status: 'OPEN',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'number' ? Number(value) : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Validation
    if (!formData.title.trim()) {
      setError('Job Opportunity Title is required.');
      setLoading(false);
      return;
    }
    if (!formData.companyName.trim()) {
      setError('Company Name is required.');
      setLoading(false);
      return;
    }
    if (!formData.role.trim()) {
      setError('Role / Designation is required.');
      setLoading(false);
      return;
    }
    if (!formData.location.trim()) {
      setError('Location is required.');
      setLoading(false);
      return;
    }

    try {
      const payload = {
        ...formData,
        requiredSkills: formData.requiredSkills
          ? formData.requiredSkills
              .split(',')
              .map((s) => s.trim())
              .filter(Boolean)
          : [],
        preferredSkills: formData.preferredSkills
          ? formData.preferredSkills
              .split(',')
              .map((s) => s.trim())
              .filter(Boolean)
          : [],
        maximumRequests: Number(formData.maximumRequests) || 10,
        applicationDeadline: formData.applicationDeadline || null,
      };

      await createReferralOpportunity(payload);
      navigate('/alumni/referrals');
    } catch (err) {
      setError(
        err.response?.data?.message ||
          'Failed to create referral opportunity. Make sure your alumni profile is verified.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Navigation Breadcrumb */}
        <div>
          <button
            type="button"
            onClick={() => navigate('/alumni/referrals')}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Referrals Hub</span>
          </button>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-indigo-50 text-[#4F46E5] border border-indigo-100">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-[#172033]">
                Post Referral Opportunity
              </h1>
              <p className="text-xs text-slate-500">
                Share an open position at your company and mentor deserving students through internal referrals.
              </p>
            </div>
          </div>
        </div>

        {/* Disclaimer Banner */}
        <div className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-200/80 flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 text-[#4F46E5] flex-shrink-0 mt-0.5" />
          <div className="text-xs text-indigo-950 space-y-1">
            <span className="font-bold block">Alumni Referral Guidelines</span>
            <p className="text-indigo-900/90 leading-relaxed">
              Referrals give qualified students internal recommendation visibility at your company. 
              <strong> A referral does not guarantee hiring or interview selection</strong>, but ensures the candidate is evaluated fairly by hiring managers.
            </p>
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 flex items-center gap-2.5 text-xs text-rose-800">
            <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Main Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="p-6 sm:p-8 space-y-8">
            {/* Section 1: Role & Company */}
            <div className="space-y-4">
              <div className="border-b border-slate-100 pb-2">
                <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400">
                  1. Company & Role
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Opportunity Title <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="e.g. Software Engineer - Backend (Campus / Early Career)"
                    required
                    className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/20 focus:border-[#4F46E5]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Company Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="companyName"
                    value={formData.companyName}
                    onChange={handleChange}
                    placeholder="e.g. Microsoft, Google, Razorpay"
                    required
                    className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/20 focus:border-[#4F46E5]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Role / Designation <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    placeholder="e.g. SDE-1, Data Analyst, Product Analyst"
                    required
                    className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/20 focus:border-[#4F46E5]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Department
                  </label>
                  <input
                    type="text"
                    name="department"
                    value={formData.department}
                    onChange={handleChange}
                    placeholder="e.g. Engineering, Cloud & AI, Product"
                    className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/20 focus:border-[#4F46E5]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Industry
                  </label>
                  <input
                    type="text"
                    name="industry"
                    value={formData.industry}
                    onChange={handleChange}
                    placeholder="e.g. Information Technology & Services, FinTech"
                    className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/20 focus:border-[#4F46E5]"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Job Requisition / Careers Portal URL
                  </label>
                  <div className="relative">
                    <Link2 className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="url"
                      name="jobUrl"
                      value={formData.jobUrl}
                      onChange={handleChange}
                      placeholder="https://careers.company.com/job/12345"
                      className="w-full text-xs p-3 pl-9 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/20 focus:border-[#4F46E5]"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Section 2: Work Mode & Location */}
            <div className="space-y-4">
              <div className="border-b border-slate-100 pb-2">
                <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400">
                  2. Logistics & Compensation
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Work Mode <span className="text-rose-500">*</span>
                  </label>
                  <select
                    name="workMode"
                    value={formData.workMode}
                    onChange={handleChange}
                    className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/20 focus:border-[#4F46E5] bg-white"
                  >
                    <option value="ONSITE">Onsite</option>
                    <option value="HYBRID">Hybrid</option>
                    <option value="REMOTE">Remote</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Employment Type <span className="text-rose-500">*</span>
                  </label>
                  <select
                    name="employmentType"
                    value={formData.employmentType}
                    onChange={handleChange}
                    className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/20 focus:border-[#4F46E5] bg-white"
                  >
                    <option value="FULL_TIME">Full-time</option>
                    <option value="INTERNSHIP">Internship</option>
                    <option value="CONTRACT">Contract</option>
                    <option value="PART_TIME">Part-time</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Location <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    placeholder="e.g. Bengaluru, India"
                    required
                    className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/20 focus:border-[#4F46E5]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Experience Required
                  </label>
                  <input
                    type="text"
                    name="experienceRequired"
                    value={formData.experienceRequired}
                    onChange={handleChange}
                    placeholder="e.g. 0-1 years, Fresher"
                    className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/20 focus:border-[#4F46E5]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Salary / Package
                  </label>
                  <input
                    type="text"
                    name="salaryOrPackage"
                    value={formData.salaryOrPackage}
                    onChange={handleChange}
                    placeholder="e.g. ₹16 - ₹22 LPA"
                    className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/20 focus:border-[#4F46E5]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Application Deadline
                  </label>
                  <input
                    type="date"
                    name="applicationDeadline"
                    value={formData.applicationDeadline}
                    onChange={handleChange}
                    className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/20 focus:border-[#4F46E5]"
                  />
                </div>
              </div>
            </div>

            {/* Section 3: Skills & Capacity */}
            <div className="space-y-4">
              <div className="border-b border-slate-100 pb-2">
                <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400">
                  3. Skills & Capacity Limit
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Required Skills (Comma-separated)
                  </label>
                  <input
                    type="text"
                    name="requiredSkills"
                    value={formData.requiredSkills}
                    onChange={handleChange}
                    placeholder="e.g. React, Node.js, JavaScript, Data Structures"
                    className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/20 focus:border-[#4F46E5]"
                  />
                  <span className="text-[11px] text-slate-400 mt-1 block">
                    Used to calculate deterministic profile match for candidates.
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Preferred Skills (Comma-separated)
                  </label>
                  <input
                    type="text"
                    name="preferredSkills"
                    value={formData.preferredSkills}
                    onChange={handleChange}
                    placeholder="e.g. AWS, Docker, TypeScript, System Design"
                    className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/20 focus:border-[#4F46E5]"
                  />
                  <span className="text-[11px] text-slate-400 mt-1 block">
                    Bonus skills that boost student match percentages.
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Maximum Candidate Requests
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    name="maximumRequests"
                    value={formData.maximumRequests}
                    onChange={handleChange}
                    className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/20 focus:border-[#4F46E5]"
                  />
                  <span className="text-[11px] text-slate-400 mt-1 block">
                    Prevents request flooding. Referral closes automatically when reached.
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Initial Posting Status
                  </label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/20 focus:border-[#4F46E5] bg-white"
                  >
                    <option value="OPEN">Open (Accept requests immediately)</option>
                    <option value="DRAFT">Draft (Save for later)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Section 4: Instructions & Details */}
            <div className="space-y-4">
              <div className="border-b border-slate-100 pb-2">
                <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400">
                  4. Instructions & Description
                </h2>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Referral Instructions for Students
                </label>
                <textarea
                  rows={3}
                  name="referralInstructions"
                  value={formData.referralInstructions}
                  onChange={handleChange}
                  placeholder="e.g. Please ensure your resume highlights full-stack web applications and include your live project URLs."
                  className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/20 focus:border-[#4F46E5]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Job Description / Role Overview
                </label>
                <textarea
                  rows={4}
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Outline key responsibilities, team structure, and qualifications expected for this position..."
                  className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/20 focus:border-[#4F46E5]"
                />
              </div>
            </div>
          </div>

          {/* Form Actions Footer */}
          <div className="bg-slate-50 p-6 border-t border-slate-200 flex items-center justify-between">
            <button
              type="button"
              onClick={() => navigate('/alumni/referrals')}
              className="px-5 py-2.5 text-xs font-semibold text-slate-600 hover:text-slate-900 rounded-xl hover:bg-slate-100 transition-colors"
            >
              Cancel
            </button>

            <Button
              type="submit"
              variant="primary"
              size="md"
              loading={loading}
              icon={Sparkles}
            >
              Publish Referral Opportunity
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateReferralPage;
