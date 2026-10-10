import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getOpportunityById, updateOpportunity } from '../../services/opportunityService';
import {
  Building2,
  Briefcase,
  MapPin,
  DollarSign,
  GraduationCap,
  Calendar,
  Save,
  Send,
  ArrowLeft,
  AlertCircle,
  Clock,
} from 'lucide-react';

export const EditOpportunityPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    companyName: '',
    companyLogo: '',
    companyWebsite: '',
    type: 'PLACEMENT',
    title: '',
    role: '',
    department: '',
    description: '',
    responsibilities: '',
    requiredSkills: '',
    preferredSkills: '',
    workMode: 'ONSITE',
    location: '',
    employmentType: 'Full-time',
    experienceRequired: 'Fresher',
    salary: '',
    salaryPeriod: 'Per Annum',
    stipend: '',
    otherBenefits: '',
    eligibleDepartments: [],
    eligibleGraduationYears: [],
    minimumCGPA: '',
    maximumBacklogs: '0',
    additionalEligibilityCriteria: '',
    applicationStartDate: '',
    applicationDeadline: '',
    externalApplicationUrl: '',
    applicationInstructions: '',
    status: 'DRAFT',
  });

  const departmentsList = [
    'Computer Science',
    'Information Technology',
    'Data Science',
    'AI & Machine Learning',
    'Electronics & Communication',
    'Electrical Engineering',
    'Mechanical Engineering',
    'Civil Engineering',
  ];

  const yearsList = [2024, 2025, 2026, 2027, 2028];

  useEffect(() => {
    const loadOpportunity = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await getOpportunityById(id);
        if (res && res.success && res.data) {
          const opp = res.data;
          setFormData({
            companyName: opp.companyName || '',
            companyLogo: opp.companyLogo || '',
            companyWebsite: opp.companyWebsite || '',
            type: opp.type || 'PLACEMENT',
            title: opp.title || '',
            role: opp.role || '',
            department: opp.department || '',
            description: opp.description || '',
            responsibilities: opp.responsibilities || '',
            requiredSkills: Array.isArray(opp.requiredSkills) ? opp.requiredSkills.join(', ') : '',
            preferredSkills: Array.isArray(opp.preferredSkills) ? opp.preferredSkills.join(', ') : '',
            workMode: opp.workMode || 'ONSITE',
            location: opp.location || '',
            employmentType: opp.employmentType || 'Full-time',
            experienceRequired: opp.experienceRequired || 'Fresher',
            salary: opp.salary || '',
            salaryPeriod: opp.salaryPeriod || 'Per Annum',
            stipend: opp.stipend || '',
            otherBenefits: opp.otherBenefits || '',
            eligibleDepartments: opp.eligibleDepartments || [],
            eligibleGraduationYears: opp.eligibleGraduationYears || [],
            minimumCGPA: opp.minimumCGPA !== undefined ? String(opp.minimumCGPA) : '',
            maximumBacklogs: opp.maximumBacklogs !== undefined ? String(opp.maximumBacklogs) : '0',
            additionalEligibilityCriteria: opp.additionalEligibilityCriteria || '',
            applicationStartDate: opp.applicationStartDate
              ? new Date(opp.applicationStartDate).toISOString().split('T')[0]
              : '',
            applicationDeadline: opp.applicationDeadline
              ? new Date(opp.applicationDeadline).toISOString().split('T')[0]
              : '',
            externalApplicationUrl: opp.externalApplicationUrl || '',
            applicationInstructions: opp.applicationInstructions || '',
            status: opp.status || 'DRAFT',
          });
        }
      } catch (err) {
        setError(err.message || 'Failed to load opportunity data');
      } finally {
        setLoading(false);
      }
    };

    loadOpportunity();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleDepartmentToggle = (dept) => {
    setFormData((prev) => {
      const exists = prev.eligibleDepartments.includes(dept);
      return {
        ...prev,
        eligibleDepartments: exists
          ? prev.eligibleDepartments.filter((d) => d !== dept)
          : [...prev.eligibleDepartments, dept],
      };
    });
  };

  const handleYearToggle = (yr) => {
    setFormData((prev) => {
      const exists = prev.eligibleGraduationYears.includes(yr);
      return {
        ...prev,
        eligibleGraduationYears: exists
          ? prev.eligibleGraduationYears.filter((y) => y !== yr)
          : [...prev.eligibleGraduationYears, yr],
      };
    });
  };

  const handleSubmit = async (overrideStatus) => {
    setError(null);

    if (!formData.companyName.trim()) {
      setError('Company Name is required');
      return;
    }
    if (!formData.title.trim()) {
      setError('Opportunity Title is required');
      return;
    }
    if (!formData.role.trim()) {
      setError('Job Role is required');
      return;
    }
    if (!formData.description.trim()) {
      setError('Job Description is required');
      return;
    }
    if (!formData.location.trim()) {
      setError('Job Location is required');
      return;
    }
    if (!formData.applicationDeadline) {
      setError('Application Deadline date is required');
      return;
    }

    setSubmitting(true);

    try {
      const payload = {
        ...formData,
        status: overrideStatus || formData.status,
        requiredSkills: formData.requiredSkills
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean),
        preferredSkills: formData.preferredSkills
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean),
        minimumCGPA: formData.minimumCGPA ? Number(formData.minimumCGPA) : 0,
        maximumBacklogs: formData.maximumBacklogs !== '' ? Number(formData.maximumBacklogs) : 0,
      };

      const res = await updateOpportunity(id, payload);
      if (res && res.success) {
        navigate('/tpo/opportunities');
      }
    } catch (err) {
      setError(err.message || 'Failed to update opportunity');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 animate-pulse space-y-6">
        <div className="h-6 bg-slate-200 rounded w-24"></div>
        <div className="h-10 bg-slate-200 rounded w-1/3"></div>
        <div className="h-64 bg-white rounded-2xl border border-slate-200 p-8"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      {/* Top Header */}
      <div className="mb-6 flex items-center justify-between">
        <Link
          to="/tpo/opportunities"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-[#4F46E5] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Opportunities
        </Link>
      </div>

      <div className="pb-6 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-[#E0F2FE] text-[#0284C7] mb-2">
            <Building2 className="w-3.5 h-3.5" />
            Edit Campus Drive
          </div>
          <h1 className="text-3xl font-bold text-[#172033] tracking-tight">Edit Opportunity</h1>
          <p className="text-slate-500 text-sm mt-1">
            Update opportunity criteria, job descriptions, compensation, and deadlines.
          </p>
        </div>

        {/* Current Status Pill */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className="text-xs text-slate-500 font-medium">Status:</span>
          <select
            name="status"
            value={formData.status}
            onChange={handleChange}
            className="px-3 py-1.5 text-xs font-bold rounded-lg border border-slate-200 bg-white text-slate-800"
          >
            <option value="DRAFT">DRAFT</option>
            <option value="PUBLISHED">PUBLISHED</option>
            <option value="CLOSED">CLOSED</option>
            <option value="ARCHIVED">ARCHIVED</option>
          </select>
        </div>
      </div>

      {error && (
        <div className="mt-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={(e) => e.preventDefault()} className="space-y-8 mt-8">
        {/* Section 1: Company */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 sm:p-7 space-y-5">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
            <Building2 className="w-5 h-5 text-[#4F46E5]" />
            <h2 className="text-base font-bold text-[#172033]">Section 1 — Company Details</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Company Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                name="companyName"
                value={formData.companyName}
                onChange={handleChange}
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#4F46E5]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Company Website</label>
              <input
                type="url"
                name="companyWebsite"
                value={formData.companyWebsite}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#4F46E5]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Company Logo URL</label>
              <input
                type="url"
                name="companyLogo"
                value={formData.companyLogo}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#4F46E5]"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Opportunity Overview */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 sm:p-7 space-y-5">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
            <Briefcase className="w-5 h-5 text-[#4F46E5]" />
            <h2 className="text-base font-bold text-[#172033]">Section 2 — Opportunity Overview</h2>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-2">Opportunity Type</label>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setFormData((prev) => ({ ...prev, type: 'PLACEMENT' }))}
                className={`p-4 rounded-xl border text-left transition-all ${
                  formData.type === 'PLACEMENT'
                    ? 'border-[#4F46E5] bg-indigo-50/50 ring-2 ring-[#4F46E5]/20'
                    : 'border-slate-200 bg-white hover:bg-slate-50'
                }`}
              >
                <span className="block font-bold text-sm text-[#172033]">Full-Time Placement</span>
                <span className="text-xs text-slate-500 mt-0.5 block">Annual CTC package</span>
              </button>

              <button
                type="button"
                onClick={() => setFormData((prev) => ({ ...prev, type: 'INTERNSHIP' }))}
                className={`p-4 rounded-xl border text-left transition-all ${
                  formData.type === 'INTERNSHIP'
                    ? 'border-[#7C3AED] bg-purple-50/50 ring-2 ring-[#7C3AED]/20'
                    : 'border-slate-200 bg-white hover:bg-slate-50'
                }`}
              >
                <span className="block font-bold text-sm text-[#172033]">Internship Drive</span>
                <span className="text-xs text-slate-500 mt-0.5 block">Monthly stipend</span>
              </button>
            </div>
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
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#4F46E5]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Role Designation <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                name="role"
                value={formData.role}
                onChange={handleChange}
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#4F46E5]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Team / Department</label>
              <input
                type="text"
                name="department"
                value={formData.department}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#4F46E5]"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Job Description <span className="text-rose-500">*</span>
              </label>
              <textarea
                name="description"
                rows="4"
                value={formData.description}
                onChange={handleChange}
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#4F46E5]"
              ></textarea>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">Key Responsibilities</label>
              <textarea
                name="responsibilities"
                rows="3"
                value={formData.responsibilities}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#4F46E5]"
              ></textarea>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Required Skills (Comma-separated)
              </label>
              <input
                type="text"
                name="requiredSkills"
                value={formData.requiredSkills}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#4F46E5]"
              />
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
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#4F46E5]"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Work & Location */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 sm:p-7 space-y-5">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
            <MapPin className="w-5 h-5 text-[#4F46E5]" />
            <h2 className="text-base font-bold text-[#172033]">Section 3 — Work &amp; Logistics</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Work Arrangement</label>
              <select
                name="workMode"
                value={formData.workMode}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#4F46E5] bg-white"
              >
                <option value="ONSITE">On-Site</option>
                <option value="HYBRID">Hybrid</option>
                <option value="REMOTE">Remote</option>
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
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#4F46E5]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Employment Model</label>
              <input
                type="text"
                name="employmentType"
                value={formData.employmentType}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#4F46E5]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Experience Level</label>
              <input
                type="text"
                name="experienceRequired"
                value={formData.experienceRequired}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#4F46E5]"
              />
            </div>
          </div>
        </div>

        {/* Section 4: Compensation */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 sm:p-7 space-y-5">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
            <DollarSign className="w-5 h-5 text-emerald-600" />
            <h2 className="text-base font-bold text-[#172033]">Section 4 — Compensation &amp; Perks</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {formData.type === 'PLACEMENT' ? (
              <>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Annual CTC</label>
                  <input
                    type="text"
                    name="salary"
                    value={formData.salary}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#4F46E5]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Salary Frequency</label>
                  <input
                    type="text"
                    name="salaryPeriod"
                    value={formData.salaryPeriod}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#4F46E5]"
                  />
                </div>
              </>
            ) : (
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">Monthly Stipend</label>
                <input
                  type="text"
                  name="stipend"
                  value={formData.stipend}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#4F46E5]"
                />
              </div>
            )}

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">Other Benefits</label>
              <textarea
                name="otherBenefits"
                rows="2"
                value={formData.otherBenefits}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#4F46E5]"
              ></textarea>
            </div>
          </div>
        </div>

        {/* Section 5: Eligibility Criteria */}
        <div className="bg-white rounded-2xl border border-indigo-100 shadow-sm p-6 sm:p-7 space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-indigo-50">
            <div className="flex items-center gap-2.5">
              <GraduationCap className="w-5 h-5 text-[#4F46E5]" />
              <h2 className="text-base font-bold text-[#172033]">Section 5 — Academic Eligibility</h2>
            </div>
            <span className="text-[11px] font-bold text-[#4F46E5] bg-indigo-50 px-2.5 py-1 rounded-md">
              Phase 6 Foundation
            </span>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-2">Eligible Departments</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {departmentsList.map((dept) => {
                  const isChecked = formData.eligibleDepartments.includes(dept);
                  return (
                    <button
                      type="button"
                      key={dept}
                      onClick={() => handleDepartmentToggle(dept)}
                      className={`p-2.5 rounded-xl text-xs font-medium border text-left transition-all ${
                        isChecked
                          ? 'bg-[#EEF2FF] border-[#4F46E5] text-[#4F46E5] font-semibold'
                          : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      {dept}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-2">Graduation Batches</label>
              <div className="flex flex-wrap gap-2">
                {yearsList.map((yr) => {
                  const isChecked = formData.eligibleGraduationYears.includes(yr);
                  return (
                    <button
                      type="button"
                      key={yr}
                      onClick={() => handleYearToggle(yr)}
                      className={`px-4 py-2 rounded-xl text-xs font-semibold border transition-all ${
                        isChecked
                          ? 'bg-[#EEF2FF] border-[#4F46E5] text-[#4F46E5]'
                          : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      Class of {yr}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Minimum CGPA (0.0 to 10.0)</label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="10"
                  name="minimumCGPA"
                  value={formData.minimumCGPA}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#4F46E5]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Max Active Backlogs</label>
                <input
                  type="number"
                  min="0"
                  name="maximumBacklogs"
                  value={formData.maximumBacklogs}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#4F46E5]"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">Additional Criteria Notes</label>
                <input
                  type="text"
                  name="additionalEligibilityCriteria"
                  value={formData.additionalEligibilityCriteria}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#4F46E5]"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Section 6: Application Logistics */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 sm:p-7 space-y-5">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
            <Calendar className="w-5 h-5 text-[#4F46E5]" />
            <h2 className="text-base font-bold text-[#172033]">Section 6 — Application Logistics</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Application Start Date</label>
              <input
                type="date"
                name="applicationStartDate"
                value={formData.applicationStartDate}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#4F46E5]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Application Deadline <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                name="applicationDeadline"
                value={formData.applicationDeadline}
                onChange={handleChange}
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#4F46E5]"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">External Application Portal URL</label>
              <input
                type="url"
                name="externalApplicationUrl"
                value={formData.externalApplicationUrl}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#4F46E5]"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">Instructions for Applicants</label>
              <textarea
                name="applicationInstructions"
                rows="2"
                value={formData.applicationInstructions}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#4F46E5]"
              ></textarea>
            </div>
          </div>
        </div>

        {/* Section 7: Save Changes */}
        <div className="bg-slate-50 rounded-2xl border border-slate-200 p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <Link
            to="/tpo/opportunities"
            className="text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
          >
            Cancel
          </Link>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              type="button"
              disabled={submitting}
              onClick={() => handleSubmit()}
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-[#4F46E5] hover:bg-[#4338CA] text-white font-semibold text-xs shadow-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {submitting ? 'Saving Changes...' : 'Save & Update Opportunity'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default EditOpportunityPage;
