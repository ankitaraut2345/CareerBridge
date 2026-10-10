import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { createOpportunity } from '../../services/opportunityService';
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
} from 'lucide-react';

export const CreateOpportunityPage = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    // Section 1: Company
    companyName: '',
    companyLogo: '',
    companyWebsite: '',

    // Section 2: Opportunity
    type: 'PLACEMENT', // PLACEMENT or INTERNSHIP
    title: '',
    role: '',
    department: '',
    description: '',
    responsibilities: '',
    requiredSkills: '',
    preferredSkills: '',

    // Section 3: Work Details
    workMode: 'ONSITE',
    location: '',
    employmentType: 'Full-time',
    experienceRequired: 'Fresher',

    // Section 4: Compensation
    salary: '',
    salaryPeriod: 'Per Annum',
    stipend: '',
    otherBenefits: '',

    // Section 5: Eligibility
    eligibleDepartments: [],
    eligibleGraduationYears: [],
    minimumCGPA: '',
    maximumBacklogs: '0',
    additionalEligibilityCriteria: '',

    // Section 6: Application
    applicationStartDate: new Date().toISOString().split('T')[0],
    applicationDeadline: '',
    externalApplicationUrl: '',
    applicationInstructions: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

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

  const handleSubmit = async (targetStatus) => {
    setError(null);

    // Client-side quick checks
    if (!formData.companyName.trim()) {
      setError('Company Name is required');
      return;
    }
    if (!formData.title.trim()) {
      setError('Opportunity Title is required');
      return;
    }
    if (!formData.role.trim()) {
      setError('Job Role designation is required');
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

    setLoading(true);

    try {
      const payload = {
        ...formData,
        status: targetStatus,
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
        employmentType:
          formData.employmentType ||
          (formData.type === 'INTERNSHIP' ? 'Internship' : 'Full-time'),
      };

      const res = await createOpportunity(payload);
      if (res && res.success) {
        navigate('/tpo/opportunities');
      }
    } catch (err) {
      setError(err.message || 'Failed to create opportunity. Please check all fields.');
    } finally {
      setLoading(false);
    }
  };

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

      <div className="pb-6 border-b border-slate-200">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-[#E0F2FE] text-[#0284C7] mb-2">
          <Building2 className="w-3.5 h-3.5" />
          New Campus Drive
        </div>
        <h1 className="text-3xl font-bold text-[#172033] tracking-tight">Create Opportunity</h1>
        <p className="text-slate-500 text-sm mt-1">
          Publish a new placement drive or internship listing with academic criteria for students.
        </p>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="mt-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={(e) => e.preventDefault()} className="space-y-8 mt-8">
        {/* SECTION 1: Company Information */}
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
                placeholder="e.g. Google, Microsoft, Infosys"
                value={formData.companyName}
                onChange={handleChange}
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#4F46E5]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Company Website (Optional)
              </label>
              <input
                type="url"
                name="companyWebsite"
                placeholder="https://company.com"
                value={formData.companyWebsite}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#4F46E5]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Company Logo URL (Optional)
              </label>
              <input
                type="url"
                name="companyLogo"
                placeholder="https://example.com/logo.png"
                value={formData.companyLogo}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#4F46E5]"
              />
            </div>
          </div>
        </div>

        {/* SECTION 2: Opportunity Overview */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 sm:p-7 space-y-5">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
            <Briefcase className="w-5 h-5 text-[#4F46E5]" />
            <h2 className="text-base font-bold text-[#172033]">Section 2 — Opportunity Overview</h2>
          </div>

          {/* Type Toggle Cards */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-2">
              Opportunity Type <span className="text-rose-500">*</span>
            </label>
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
                <span className="text-xs text-slate-500 mt-0.5 block">
                  Graduating students, annual CTC package
                </span>
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
                <span className="text-xs text-slate-500 mt-0.5 block">
                  Summer / 6-month internship, monthly stipend
                </span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Opportunity / Drive Title <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                name="title"
                placeholder="e.g. Software Development Engineer - Campus Recruitment"
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
                placeholder="e.g. Associate Software Engineer"
                value={formData.role}
                onChange={handleChange}
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#4F46E5]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Team / Department (Optional)
              </label>
              <input
                type="text"
                name="department"
                placeholder="e.g. Cloud Infrastructure"
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
                placeholder="Detailed overview of the opportunity, project context, and team objectives..."
                value={formData.description}
                onChange={handleChange}
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#4F46E5]"
              ></textarea>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Key Responsibilities (Optional)
              </label>
              <textarea
                name="responsibilities"
                rows="3"
                placeholder="Daily deliverables, project responsibilities..."
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
                placeholder="Java, Python, Data Structures, SQL"
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
                placeholder="AWS, Docker, Kubernetes"
                value={formData.preferredSkills}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#4F46E5]"
              />
            </div>
          </div>
        </div>

        {/* SECTION 3: Work & Location Details */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 sm:p-7 space-y-5">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
            <MapPin className="w-5 h-5 text-[#4F46E5]" />
            <h2 className="text-base font-bold text-[#172033]">Section 3 — Work &amp; Logistics</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Work Arrangement <span className="text-rose-500">*</span>
              </label>
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
                placeholder="e.g. Bengaluru, Hyderabad, Remote"
                value={formData.location}
                onChange={handleChange}
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#4F46E5]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Employment Model
              </label>
              <input
                type="text"
                name="employmentType"
                placeholder="Full-time, 6 Months, Contract"
                value={formData.employmentType}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#4F46E5]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Experience Level
              </label>
              <input
                type="text"
                name="experienceRequired"
                placeholder="Fresher / 0-1 Years"
                value={formData.experienceRequired}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#4F46E5]"
              />
            </div>
          </div>
        </div>

        {/* SECTION 4: Compensation */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 sm:p-7 space-y-5">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
            <DollarSign className="w-5 h-5 text-emerald-600" />
            <h2 className="text-base font-bold text-[#172033]">Section 4 — Compensation &amp; Perks</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {formData.type === 'PLACEMENT' ? (
              <>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Annual Package / CTC
                  </label>
                  <input
                    type="text"
                    name="salary"
                    placeholder="e.g. 14 LPA or 12 - 16 LPA"
                    value={formData.salary}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#4F46E5]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Salary Frequency
                  </label>
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
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Monthly Internship Stipend
                </label>
                <input
                  type="text"
                  name="stipend"
                  placeholder="e.g. ₹45,000 / month"
                  value={formData.stipend}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#4F46E5]"
                />
              </div>
            )}

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Additional Benefits &amp; Allowances (Optional)
              </label>
              <textarea
                name="otherBenefits"
                rows="2"
                placeholder="Health insurance, relocation allowance, meal coupons, performance bonus..."
                value={formData.otherBenefits}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#4F46E5]"
              ></textarea>
            </div>
          </div>
        </div>

        {/* SECTION 5: Eligibility Criteria (Phase 6 Foundation) */}
        <div className="bg-white rounded-2xl border border-indigo-100 shadow-sm p-6 sm:p-7 space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-indigo-50">
            <div className="flex items-center gap-2.5">
              <GraduationCap className="w-5 h-5 text-[#4F46E5]" />
              <h2 className="text-base font-bold text-[#172033]">
                Section 5 — Academic Eligibility Criteria
              </h2>
            </div>
            <span className="text-[11px] font-bold text-[#4F46E5] bg-indigo-50 px-2.5 py-1 rounded-md">
              For Phase 6 Engine
            </span>
          </div>

          <div className="space-y-4">
            {/* Department checkboxes */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-2">
                Eligible Departments (Leave empty to permit all branches)
              </label>
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

            {/* Graduation Years */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-2">
                Eligible Graduation Batches
              </label>
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
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Minimum CGPA Cutoff (0.0 to 10.0)
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="10"
                  name="minimumCGPA"
                  placeholder="e.g. 7.5"
                  value={formData.minimumCGPA}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#4F46E5]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Maximum Active Backlogs Permitted
                </label>
                <input
                  type="number"
                  min="0"
                  name="maximumBacklogs"
                  placeholder="0"
                  value={formData.maximumBacklogs}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#4F46E5]"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Special Eligibility Instructions (Optional)
                </label>
                <input
                  type="text"
                  name="additionalEligibilityCriteria"
                  placeholder="e.g. Must have completed 75% college attendance or cleared aptitude round"
                  value={formData.additionalEligibilityCriteria}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#4F46E5]"
                />
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 6: Application Logistics */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 sm:p-7 space-y-5">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
            <Calendar className="w-5 h-5 text-[#4F46E5]" />
            <h2 className="text-base font-bold text-[#172033]">Section 6 — Application Logistics</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Application Start Date
              </label>
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
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                External Application Portal URL (Optional)
              </label>
              <input
                type="url"
                name="externalApplicationUrl"
                placeholder="https://company.careers/job/123"
                value={formData.externalApplicationUrl}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#4F46E5]"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Special Application Instructions (Optional)
              </label>
              <textarea
                name="applicationInstructions"
                rows="2"
                placeholder="Special notes on file formats, student ID verification, or attire for day 1..."
                value={formData.applicationInstructions}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#4F46E5]"
              ></textarea>
            </div>
          </div>
        </div>

        {/* SECTION 7: Publishing & Actions */}
        <div className="bg-slate-50 rounded-2xl border border-slate-200 p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <Link
            to="/tpo/opportunities"
            className="text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
          >
            Cancel and Discard
          </Link>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              type="button"
              disabled={loading}
              onClick={() => handleSubmit('DRAFT')}
              className="w-1/2 sm:w-auto px-5 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs transition-colors flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              Save as Draft
            </button>

            <button
              type="button"
              disabled={loading}
              onClick={() => handleSubmit('PUBLISHED')}
              className="w-1/2 sm:w-auto px-6 py-2.5 rounded-xl bg-[#4F46E5] hover:bg-[#4338CA] text-white font-semibold text-xs shadow-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              {loading ? 'Publishing...' : 'Publish Drive'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default CreateOpportunityPage;
