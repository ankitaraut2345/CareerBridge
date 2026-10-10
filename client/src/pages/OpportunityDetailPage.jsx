import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getOpportunityById } from '../services/opportunityService';
import { checkEligibility, applyToOpportunity } from '../services/applicationService';
import { useAuth } from '../context/AuthContext';
import AiResumeAnalysisCard from '../components/ai/AiResumeAnalysisCard';
import AiInterviewPrepCard from '../components/ai/AiInterviewPrepCard';
import {
  Building2,
  MapPin,
  Calendar,
  Clock,
  ArrowLeft,
  Briefcase,
  DollarSign,
  GraduationCap,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ExternalLink,
  Edit,
  Sparkles,
  Info,
  Layers,
  FileText,
  Send,
  X,
  UserCheck,
} from 'lucide-react';

export const OpportunityDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [opportunity, setOpportunity] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Student eligibility & application state
  const [eligibility, setEligibility] = useState(null);
  const [eligibilityLoading, setEligibilityLoading] = useState(false);
  const [eligibilityError, setEligibilityError] = useState(null);

  // Apply modal & submission state
  const [applyModalOpen, setApplyModalOpen] = useState(false);
  const [applicationMessage, setApplicationMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submissionSuccess, setSubmissionSuccess] = useState(null);
  const [submissionError, setSubmissionError] = useState(null);

  // Fetch opportunity data
  useEffect(() => {
    const fetchDetail = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await getOpportunityById(id);
        if (res && res.success) {
          setOpportunity(res.data);
        } else {
          setError('Opportunity not found');
        }
      } catch (err) {
        setError(err.message || 'Failed to load opportunity details');
      } finally {
        setLoading(false);
      }
    };

    fetchDetail();
  }, [id]);

  // Fetch student eligibility dynamically if user is a student
  useEffect(() => {
    if (user && user.role === 'STUDENT' && id) {
      const fetchEligibility = async () => {
        setEligibilityLoading(true);
        setEligibilityError(null);
        try {
          const res = await checkEligibility(id);
          if (res && res.success) {
            setEligibility(res.data);
          }
        } catch (err) {
          setEligibilityError(err.message || 'Failed to check eligibility');
        } finally {
          setEligibilityLoading(false);
        }
      };

      fetchEligibility();
    }
  }, [user, id]);

  const handleApplySubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmissionError(null);
    try {
      const res = await applyToOpportunity(id, { applicationMessage });
      if (res && res.success) {
        setSubmissionSuccess(res.data);
        setApplyModalOpen(false);
        // Refresh eligibility to reflect hasApplied = true
        setEligibility((prev) => (prev ? { ...prev, hasApplied: true, existingApplication: res.data } : null));
      }
    } catch (err) {
      setSubmissionError(err.message || 'Failed to submit application. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-16 animate-pulse space-y-8">
        <div className="h-6 bg-slate-200 rounded w-24"></div>
        <div className="bg-white rounded-2xl border border-slate-200 p-8 space-y-4">
          <div className="flex gap-4 items-center">
            <div className="w-16 h-16 bg-slate-200 rounded-xl"></div>
            <div className="space-y-2 flex-1">
              <div className="h-6 bg-slate-200 rounded w-1/3"></div>
              <div className="h-4 bg-slate-200 rounded w-1/4"></div>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            <div className="h-48 bg-white rounded-2xl border border-slate-200 p-6"></div>
          </div>
          <div className="h-64 bg-white rounded-2xl border border-slate-200 p-6"></div>
        </div>
      </div>
    );
  }

  if (error || !opportunity) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center">
        <div className="bg-rose-50 border border-rose-200 rounded-2xl p-8">
          <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-3" />
          <h2 className="text-xl font-bold text-rose-900">Opportunity Not Found</h2>
          <p className="text-sm text-rose-700 mt-1">
            {error || 'The requested opportunity could not be found or is not currently active.'}
          </p>
          <button
            onClick={() => navigate(-1)}
            className="mt-5 px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-sm font-semibold transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const {
    title,
    type,
    companyName,
    companyLogo,
    companyWebsite,
    description,
    responsibilities,
    requiredSkills = [],
    preferredSkills = [],
    role,
    department,
    workMode,
    location,
    employmentType,
    experienceRequired,
    salary,
    salaryPeriod,
    stipend,
    otherBenefits,
    eligibleDepartments = [],
    eligibleGraduationYears = [],
    minimumCGPA,
    maximumBacklogs,
    additionalEligibilityCriteria,
    applicationDeadline,
    externalApplicationUrl,
    applicationInstructions,
    status,
    createdBy,
  } = opportunity;

  // Deadline calculation
  const deadlineDate = new Date(applicationDeadline);
  const now = new Date();
  const diffTime = deadlineDate.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  const isExpired = diffTime < 0;
  const isClosingSoon = !isExpired && diffDays <= 4;

  const formattedDeadline = !isNaN(deadlineDate.getTime())
    ? deadlineDate.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      })
    : 'Not specified';

  const isTpoOrAdmin =
    user && (user.role === 'ADMIN' || (user.role === 'TPO' && String(createdBy) === String(user.id)));
  const isStudent = user && user.role === 'STUDENT';

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Navigation Breadcrumb */}
      <div className="mb-6 flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-[#4F46E5] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Listings
        </button>

        {isTpoOrAdmin && (
          <div className="flex items-center gap-2">
            <Link
              to={`/tpo/opportunities/${id}/applicants`}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#E0F2FE] hover:bg-[#BAE6FD] text-[#0284C7] text-xs font-semibold rounded-lg transition-colors border border-sky-200"
            >
              <UserCheck className="w-3.5 h-3.5" />
              View Applicants
            </Link>
            <Link
              to={`/tpo/opportunities/${id}/edit`}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-[#4F46E5] text-xs font-semibold rounded-lg transition-colors border border-indigo-200"
            >
              <Edit className="w-3.5 h-3.5" />
              Edit Opportunity
            </Link>
          </div>
        )}
      </div>

      {/* Hero Header Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 sm:p-8 mb-8">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
          <div className="flex items-start gap-5">
            {/* Company Logo or Initials */}
            {companyLogo ? (
              <img
                src={companyLogo}
                alt={companyName}
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-contain bg-slate-50 border border-slate-100 p-2 flex-shrink-0"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
            ) : null}
            <div
              className={`w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-[#EEF2FF] to-[#E0E7FF] text-[#4F46E5] font-bold text-2xl flex items-center justify-center border border-indigo-100 flex-shrink-0 ${
                companyLogo ? 'hidden' : 'flex'
              }`}
            >
              {companyName ? companyName.charAt(0).toUpperCase() : 'C'}
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider border ${
                    type === 'PLACEMENT'
                      ? 'bg-[#EEF2FF] text-[#4F46E5] border-indigo-200'
                      : 'bg-[#F5F3FF] text-[#7C3AED] border-purple-200'
                  }`}
                >
                  {type === 'PLACEMENT' ? 'Full-Time Placement' : 'Internship Drive'}
                </span>

                <span className="px-2.5 py-1 rounded-md text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
                  {workMode}
                </span>

                {status !== 'PUBLISHED' && (
                  <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">
                    Status: {status}
                  </span>
                )}
              </div>

              <h1 className="text-2xl sm:text-3xl font-bold text-[#172033] tracking-tight">
                {title}
              </h1>

              <div className="flex flex-wrap items-center gap-4 text-sm text-slate-600 mt-2 font-medium">
                <div className="flex items-center gap-1.5 text-slate-900 font-semibold">
                  <Building2 className="w-4 h-4 text-slate-400" />
                  {companyName}
                  {companyWebsite && (
                    <a
                      href={companyWebsite}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#4F46E5] hover:underline inline-flex items-center gap-0.5 text-xs font-normal"
                    >
                      (Website <ExternalLink className="w-3 h-3" />)
                    </a>
                  )}
                </div>

                <div className="flex items-center gap-1.5 text-slate-500">
                  <MapPin className="w-4 h-4 text-slate-400" />
                  {location}
                </div>

                <div className="flex items-center gap-1.5 text-slate-500">
                  <Briefcase className="w-4 h-4 text-slate-400" />
                  {role}
                </div>
              </div>
            </div>
          </div>

          {/* Compensation Highlight Badge */}
          {(salary || stipend) && (
            <div className="bg-emerald-50/80 border border-emerald-200/80 rounded-xl p-4 text-left md:text-right self-start">
              <span className="block text-[11px] font-semibold uppercase tracking-wider text-emerald-700">
                {type === 'PLACEMENT' ? 'CTC / Package' : 'Monthly Stipend'}
              </span>
              <span className="text-xl sm:text-2xl font-bold text-emerald-900 flex items-center md:justify-end gap-1">
                <DollarSign className="w-5 h-5 text-emerald-600" />
                {salary || stipend}
              </span>
              {salaryPeriod && type === 'PLACEMENT' && (
                <span className="text-[11px] text-emerald-700 font-medium block">
                  {salaryPeriod}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Deadline Banner */}
        <div className="mt-6 pt-5 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-slate-400" />
            <span className="text-slate-500">
              Applications Deadline: <strong className="text-slate-800">{formattedDeadline}</strong>
            </span>
          </div>

          <div>
            {status === 'CLOSED' ? (
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-rose-100 text-rose-800 border border-rose-200 inline-flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                Drive Closed
              </span>
            ) : isExpired ? (
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200 inline-flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                Deadline Expired
              </span>
            ) : isClosingSoon ? (
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300 inline-flex items-center gap-1 animate-pulse">
                <Clock className="w-3.5 h-3.5 text-amber-600" />
                Closing in {diffDays} {diffDays === 1 ? 'day' : 'days'}
              </span>
            ) : (
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200 inline-flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                Applications Active
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Submission Success Confirmation Banner */}
      {submissionSuccess && (
        <div className="mb-8 p-6 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-950 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm animate-in fade-in">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center flex-shrink-0">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-base text-emerald-900">Application Submitted Successfully!</h3>
              <p className="text-xs text-emerald-800 mt-0.5">
                Your application for <strong className="font-semibold">{title}</strong> at {companyName} is now in the review queue.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            <Link
              to="/student/applications"
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition-colors shadow-sm"
            >
              View My Applications
            </Link>
          </div>
        </div>
      )}

      {/* Main Grid: Left Column Details & Right Column Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Full Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Section: Description */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 sm:p-7">
            <h2 className="text-lg font-bold text-[#172033] mb-4 flex items-center gap-2">
              <Info className="w-5 h-5 text-[#4F46E5]" />
              About the Opportunity
            </h2>
            <div className="text-sm text-slate-600 leading-relaxed whitespace-pre-line font-normal">
              {description}
            </div>
          </div>

          {/* Section: Responsibilities */}
          {responsibilities && (
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 sm:p-7">
              <h2 className="text-lg font-bold text-[#172033] mb-4 flex items-center gap-2">
                <Layers className="w-5 h-5 text-[#4F46E5]" />
                Key Responsibilities
              </h2>
              <div className="text-sm text-slate-600 leading-relaxed whitespace-pre-line font-normal">
                {responsibilities}
              </div>
            </div>
          )}

          {/* Section: Skills */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 sm:p-7">
            <h2 className="text-lg font-bold text-[#172033] mb-4 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[#4F46E5]" />
              Skill Requirements
            </h2>

            {requiredSkills && requiredSkills.length > 0 && (
              <div className="mb-4">
                <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                  Required Technical Competencies
                </h3>
                <div className="flex flex-wrap gap-2">
                  {requiredSkills.map((skill, index) => (
                    <span
                      key={index}
                      className="px-3 py-1.5 rounded-lg text-xs font-medium bg-[#EEF2FF] text-[#4F46E5] border border-indigo-100"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {preferredSkills && preferredSkills.length > 0 && (
              <div>
                <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                  Preferred / Good-to-Have Skills
                </h3>
                <div className="flex flex-wrap gap-2">
                  {preferredSkills.map((skill, index) => (
                    <span
                      key={index}
                      className="px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* PHASE 13: AI Resume Analysis (Advisory Matching Guidance) */}
          {isStudent && (
            <AiResumeAnalysisCard
              opportunityId={id}
              opportunityTitle={title}
              companyName={companyName}
            />
          )}

          {/* PHASE 14: AI Interview Preparation (Practice & Role Readiness) */}
          {isStudent && (
            <AiInterviewPrepCard
              opportunityId={id}
              opportunityTitle={title}
              companyName={companyName}
            />
          )}

          {/* PHASE 6: Dynamic Student Eligibility Evaluation Breakdown */}
          {isStudent && (
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 sm:p-7">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
                <div className="flex items-center gap-2.5">
                  <GraduationCap className="w-5 h-5 text-[#4F46E5]" />
                  <h2 className="text-lg font-bold text-[#172033]">Your Academic Eligibility</h2>
                </div>

                {/* Eligibility Status Pill */}
                {eligibilityLoading ? (
                  <span className="text-xs text-slate-500 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 animate-spin text-[#4F46E5]" />
                    Checking eligibility...
                  </span>
                ) : eligibility?.state === 'ELIGIBLE' ? (
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 inline-flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    Eligible to Apply
                  </span>
                ) : eligibility?.state === 'INCOMPLETE_PROFILE' ? (
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300 inline-flex items-center gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                    Profile Incomplete
                  </span>
                ) : (
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-200 inline-flex items-center gap-1.5">
                    <XCircle className="w-3.5 h-3.5 text-rose-600" />
                    Criteria Not Met
                  </span>
                )}
              </div>

              {/* Description message */}
              <p className="text-xs text-slate-600 mb-4">
                {eligibility?.message || 'Academic criteria are dynamically verified against your verified profile credentials.'}
              </p>

              {/* Granular Breakdown Table */}
              {eligibility?.checks && eligibility.checks.length > 0 && (
                <div className="border border-slate-200/80 rounded-xl overflow-hidden text-xs">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                        <th className="py-2.5 px-3.5">Requirement</th>
                        <th className="py-2.5 px-3.5">Opportunity Criteria</th>
                        <th className="py-2.5 px-3.5">Your Profile</th>
                        <th className="py-2.5 px-3.5 text-center">Result</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {eligibility.checks.map((check, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/50">
                          <td className="py-2.5 px-3.5 font-semibold text-slate-800">
                            {check.criterion}
                          </td>
                          <td className="py-2.5 px-3.5 text-slate-600">
                            {check.required}
                          </td>
                          <td className="py-2.5 px-3.5 text-slate-700 font-medium">
                            {check.actual}
                          </td>
                          <td className="py-2.5 px-3.5 text-center">
                            {check.passed ? (
                              <span className="inline-flex items-center gap-1 text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                Passed
                              </span>
                            ) : check.status === 'INCOMPLETE' ? (
                              <span className="inline-flex items-center gap-1 text-amber-700 font-bold bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                                <AlertCircle className="w-3 h-3 text-amber-600" />
                                Missing
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-rose-700 font-bold bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                                <XCircle className="w-3 h-3 text-rose-600" />
                                Failed
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {eligibility?.state === 'INCOMPLETE_PROFILE' && (
                <div className="mt-4 p-3 bg-amber-50 rounded-xl border border-amber-200 flex items-center justify-between text-xs">
                  <span className="text-amber-900 font-medium">
                    Missing credentials prevent automatic qualification.
                  </span>
                  <Link
                    to="/student"
                    className="text-[#4F46E5] font-bold hover:underline"
                  >
                    Update Profile →
                  </Link>
                </div>
              )}
            </div>
          )}

          {/* Section: Academic Eligibility Criteria (General Overview) */}
          <div className="bg-white rounded-2xl border border-indigo-100 shadow-sm p-6 sm:p-7 relative overflow-hidden">
            <h2 className="text-lg font-bold text-[#172033] mb-4 flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-[#4F46E5]" />
              Drive Eligibility Standards
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs mt-4">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-500 block font-semibold mb-1">Eligible Departments</span>
                <span className="text-slate-800 font-bold">
                  {eligibleDepartments && eligibleDepartments.length > 0
                    ? eligibleDepartments.join(', ')
                    : 'Open to all departments'}
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-500 block font-semibold mb-1">Eligible Graduation Years</span>
                <span className="text-slate-800 font-bold">
                  {eligibleGraduationYears && eligibleGraduationYears.length > 0
                    ? eligibleGraduationYears.join(', ')
                    : 'All graduating batches'}
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-500 block font-semibold mb-1">Minimum CGPA</span>
                <span className="text-slate-800 font-bold">
                  {minimumCGPA ? `${minimumCGPA} / 10.0` : 'No minimum CGPA requirement'}
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-500 block font-semibold mb-1">Maximum Active Backlogs</span>
                <span className="text-slate-800 font-bold">
                  {maximumBacklogs !== undefined ? maximumBacklogs : 0} allowed
                </span>
              </div>
            </div>

            {additionalEligibilityCriteria && (
              <div className="mt-4 p-3.5 rounded-xl bg-amber-50/70 border border-amber-200 text-xs text-amber-900">
                <span className="font-bold block mb-0.5">Additional Eligibility Instructions:</span>
                {additionalEligibilityCriteria}
              </div>
            )}
          </div>

          {/* Section: Application Instructions */}
          {applicationInstructions && (
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 sm:p-7">
              <h2 className="text-lg font-bold text-[#172033] mb-3 flex items-center gap-2">
                <Info className="w-5 h-5 text-slate-700" />
                Important Application Instructions
              </h2>
              <p className="text-sm text-slate-600 leading-relaxed font-normal whitespace-pre-line">
                {applicationInstructions}
              </p>
            </div>
          )}
        </div>

        {/* Right Column: Quick Specifications & Active Phase 6 Application CTA */}
        <div className="space-y-6">
          {/* Phase 6 Application CTA Box */}
          <div className="bg-gradient-to-br from-[#4F46E5] to-[#7C3AED] rounded-2xl p-6 text-white shadow-md">
            <div className="flex items-center gap-2 text-indigo-100 text-xs font-semibold uppercase tracking-wider mb-2">
              <Sparkles className="w-4 h-4 text-[#38BDF8]" />
              Campus Application Portal
            </div>

            <h3 className="text-xl font-bold text-white mb-2 leading-snug">
              Apply for {companyName}
            </h3>

            {isStudent ? (
              <>
                <p className="text-xs text-indigo-100/90 leading-relaxed mb-5">
                  Direct submission links your verified student credentials, academic standing, and active resume.
                </p>

                {/* Intelligent Apply Button States */}
                {eligibility?.hasApplied ? (
                  <div className="space-y-2">
                    <button
                      disabled
                      className="w-full py-3 px-4 rounded-xl font-bold text-xs bg-emerald-500/30 text-emerald-100 cursor-default border border-emerald-300/40 backdrop-blur-sm flex items-center justify-center gap-2"
                    >
                      <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                      Applied ✓
                    </button>
                    <Link
                      to="/student/applications"
                      className="w-full py-2 px-3 text-center rounded-lg text-xs font-semibold bg-white/10 hover:bg-white/20 text-white block transition-colors"
                    >
                      View in My Applications →
                    </Link>
                  </div>
                ) : status !== 'PUBLISHED' ? (
                  <button
                    disabled
                    className="w-full py-3 px-4 rounded-xl font-bold text-xs bg-white/20 text-white/80 cursor-not-allowed border border-white/20 backdrop-blur-sm flex items-center justify-center gap-2"
                  >
                    <AlertCircle className="w-4 h-4" />
                    Opportunity Closed
                  </button>
                ) : isExpired ? (
                  <button
                    disabled
                    className="w-full py-3 px-4 rounded-xl font-bold text-xs bg-white/20 text-white/80 cursor-not-allowed border border-white/20 backdrop-blur-sm flex items-center justify-center gap-2"
                  >
                    <Clock className="w-4 h-4" />
                    Applications Closed (Deadline Passed)
                  </button>
                ) : eligibility?.state === 'INCOMPLETE_PROFILE' ? (
                  <Link
                    to="/student"
                    className="w-full py-3 px-4 rounded-xl font-bold text-xs bg-amber-400 hover:bg-amber-300 text-slate-900 flex items-center justify-center gap-2 shadow-sm transition-colors text-center"
                  >
                    <AlertCircle className="w-4 h-4 text-slate-900" />
                    Complete Profile to Apply
                  </Link>
                ) : eligibility?.state === 'NOT_ELIGIBLE' ? (
                  <button
                    disabled
                    className="w-full py-3 px-4 rounded-xl font-bold text-xs bg-rose-500/20 text-rose-100 cursor-not-allowed border border-rose-400/30 backdrop-blur-sm flex items-center justify-center gap-2"
                  >
                    <XCircle className="w-4 h-4 text-rose-300" />
                    Not Eligible for Drive
                  </button>
                ) : (
                  <button
                    onClick={() => setApplyModalOpen(true)}
                    className="w-full py-3 px-4 rounded-xl font-bold text-xs bg-white hover:bg-indigo-50 text-[#4F46E5] shadow-lg hover:shadow-xl flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <Send className="w-4 h-4" />
                    Apply Now
                  </button>
                )}
              </>
            ) : isTpoOrAdmin ? (
              <div className="space-y-3">
                <p className="text-xs text-indigo-100/90 leading-relaxed">
                  You are viewing this drive in officer mode. Review student applicants or modify drive specifications.
                </p>
                <Link
                  to={`/tpo/opportunities/${id}/applicants`}
                  className="w-full py-2.5 px-4 rounded-xl font-bold text-xs bg-white text-[#4F46E5] hover:bg-indigo-50 flex items-center justify-center gap-2 text-center shadow-sm transition-colors"
                >
                  <UserCheck className="w-4 h-4" />
                  Review Drive Applicants
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-xs text-indigo-100/90 leading-relaxed">
                  Log in with a registered student account to verify dynamic eligibility and submit applications.
                </p>
                <Link
                  to="/login"
                  className="w-full py-2.5 px-4 rounded-xl font-bold text-xs bg-white text-[#4F46E5] hover:bg-indigo-50 flex items-center justify-center gap-2 text-center shadow-sm transition-colors"
                >
                  Log In as Student
                </Link>
              </div>
            )}

            {externalApplicationUrl && (
              <a
                href={externalApplicationUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 w-full py-2.5 px-4 rounded-xl font-semibold text-xs bg-white/10 hover:bg-white/20 text-white backdrop-blur-sm flex items-center justify-center gap-2 transition-all"
              >
                External Company Portal
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
          </div>

          {/* Quick Specifications Card */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6">
            <h3 className="font-bold text-sm text-[#172033] uppercase tracking-wider mb-4 pb-3 border-b border-slate-100">
              Drive Summary
            </h3>

            <div className="space-y-3.5 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-slate-500 font-medium">Drive Type</span>
                <span className="font-semibold text-slate-800">{type}</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-slate-500 font-medium">Work Arrangement</span>
                <span className="font-semibold text-slate-800">{workMode}</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-slate-500 font-medium">Employment Model</span>
                <span className="font-semibold text-slate-800">{employmentType || 'Full-time'}</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-slate-500 font-medium">Experience Level</span>
                <span className="font-semibold text-slate-800">{experienceRequired || 'Fresh Graduate'}</span>
              </div>

              {department && (
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-medium">Team / Unit</span>
                  <span className="font-semibold text-slate-800">{department}</span>
                </div>
              )}

              <div className="flex justify-between items-center">
                <span className="text-slate-500 font-medium">Application Deadline</span>
                <span className="font-semibold text-slate-800">{formattedDeadline}</span>
              </div>
            </div>
          </div>

          {/* Benefits Card */}
          {otherBenefits && (
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6">
              <h3 className="font-bold text-sm text-[#172033] uppercase tracking-wider mb-3">
                Corporate Perks &amp; Benefits
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed font-normal whitespace-pre-line">
                {otherBenefits}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Application Submission Modal */}
      {applyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-slate-200 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-lg font-bold text-[#172033]">Submit Campus Application</h3>
                <p className="text-xs text-slate-500">{title} • {companyName}</p>
              </div>
              <button
                onClick={() => setApplyModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {submissionError && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
                <span>{submissionError}</span>
              </div>
            )}

            <form onSubmit={handleApplySubmit} className="space-y-4">
              {/* Resume Notice */}
              <div className="p-3.5 bg-indigo-50/70 border border-indigo-100 rounded-xl flex items-center justify-between text-xs">
                <div className="flex items-center gap-2.5">
                  <FileText className="w-5 h-5 text-[#4F46E5] flex-shrink-0" />
                  <div>
                    <span className="font-bold text-slate-800 block">Resume on Profile</span>
                    <span className="text-slate-500">Your profile resume will be attached to this application.</span>
                  </div>
                </div>
              </div>

              {/* Cover Letter / Message (Optional) */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Cover Note / Message to TPO &amp; Recruiters (Optional)
                </label>
                <textarea
                  rows="3"
                  value={applicationMessage}
                  onChange={(e) => setApplicationMessage(e.target.value)}
                  placeholder="Introduce yourself or highlight specific projects relevant to this role..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#4F46E5]"
                  maxLength={1500}
                ></textarea>
                <span className="text-[11px] text-slate-400 block text-right">
                  {applicationMessage.length}/1500 characters
                </span>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setApplyModalOpen(false)}
                  disabled={submitting}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 rounded-xl bg-[#4F46E5] hover:bg-[#4338CA] text-white text-xs font-bold shadow-sm transition-colors flex items-center gap-2 disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  {submitting ? 'Submitting Application...' : 'Confirm & Apply'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default OpportunityDetailPage;
