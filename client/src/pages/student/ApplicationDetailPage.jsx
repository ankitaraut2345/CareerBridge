import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getApplicationById, withdrawApplication } from '../../services/applicationService';
import {
  ArrowLeft,
  Briefcase,
  Building2,
  Calendar,
  Clock,
  MapPin,
  DollarSign,
  FileText,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ExternalLink,
  RotateCcw,
  Sparkles,
  User,
  Info,
} from 'lucide-react';
import StatusBadge from '../../components/StatusBadge';
import ApplicationTimeline from '../../components/ApplicationTimeline';
import InterviewCard from '../../components/InterviewCard';
import AiInterviewPrepCard from '../../components/ai/AiInterviewPrepCard';

export const ApplicationDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [feedback, setFeedback] = useState({ message: '', type: '' });

  // Withdraw Modal State
  const [withdrawModal, setWithdrawModal] = useState({
    isOpen: false,
    reason: '',
    isSubmitting: false,
  });

  const fetchApplication = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getApplicationById(id);
      if (res && res.success) {
        setApplication(res.data);
      } else {
        setError('Application not found');
      }
    } catch (err) {
      setError(err.message || 'Failed to load application details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplication();
  }, [id]);

  const handleWithdraw = async (e) => {
    e.preventDefault();
    setWithdrawModal((prev) => ({ ...prev, isSubmitting: true }));
    try {
      const res = await withdrawApplication(id, withdrawModal.reason);
      if (res && res.success) {
        setFeedback({
          message: 'Application withdrawn successfully.',
          type: 'success',
        });
        setWithdrawModal({ isOpen: false, reason: '', isSubmitting: false });
        fetchApplication();
      }
    } catch (err) {
      setFeedback({
        message: err.message || 'Failed to withdraw application.',
        type: 'error',
      });
      setWithdrawModal((prev) => ({ ...prev, isSubmitting: false }));
    }
    setTimeout(() => setFeedback({ message: '', type: '' }), 4000);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'APPLIED':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
            <Clock className="w-4 h-4" />
            Applied
          </span>
        );
      case 'SHORTLISTED':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-4 h-4" />
            Shortlisted
          </span>
        );
      case 'INTERVIEW':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200">
            <Calendar className="w-4 h-4" />
            Interview Scheduled
          </span>
        );
      case 'SELECTED':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-800 border border-green-300">
            <CheckCircle2 className="w-4 h-4" />
            Selected 🎉
          </span>
        );
      case 'REJECTED':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
            <XCircle className="w-4 h-4" />
            Not Selected
          </span>
        );
      case 'WITHDRAWN':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200">
            <RotateCcw className="w-4 h-4" />
            Withdrawn
          </span>
        );
      default:
        return (
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
            {status}
          </span>
        );
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 animate-pulse space-y-6">
        <div className="h-6 bg-slate-200 rounded w-32"></div>
        <div className="bg-white rounded-2xl border border-slate-200 p-8 space-y-4">
          <div className="h-6 bg-slate-200 rounded w-1/3"></div>
          <div className="h-4 bg-slate-100 rounded w-1/4"></div>
        </div>
      </div>
    );
  }

  if (error || !application) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center">
        <div className="bg-rose-50 border border-rose-200 rounded-2xl p-8">
          <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-3" />
          <h3 className="font-bold text-rose-900 text-lg">Failed to load application</h3>
          <p className="text-sm text-rose-700 mt-1">{error || 'Record does not exist or unauthorized.'}</p>
          <Link
            to="/student/applications"
            className="mt-5 inline-flex items-center gap-2 px-4 py-2 bg-rose-600 text-white rounded-xl text-xs font-semibold hover:bg-rose-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to My Applications
          </Link>
        </div>
      </div>
    );
  }

  const opp = application.opportunity || {};
  const oppId = opp.id || opp._id || application.opportunityId;
  const appliedDate = application.appliedAt
    ? new Date(application.appliedAt)
    : new Date(application.createdAt);
  const appliedDateStr = !isNaN(appliedDate.getTime())
    ? appliedDate.toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : 'N/A';

  const deadline = opp.applicationDeadline ? new Date(opp.applicationDeadline) : null;
  const deadlineStr = deadline && !isNaN(deadline.getTime())
    ? deadline.toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      })
    : 'N/A';

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Navigation Breadcrumb */}
      <div className="mb-6">
        <Link
          to="/student/applications"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-[#4F46E5] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to My Applications
        </Link>
      </div>

      {/* Notification Banner */}
      {feedback.message && (
        <div
          className={`mb-6 p-4 rounded-xl border text-sm font-medium flex items-center gap-3 animate-in fade-in ${
            feedback.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : 'bg-rose-50 text-rose-800 border-rose-200'
          }`}
        >
          {feedback.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />
          )}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* Application Summary Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                {opp.companyName || 'Recruiting Partner'}
              </span>
              <span
                className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                  opp.type === 'PLACEMENT'
                    ? 'bg-indigo-50 text-[#4F46E5] border-indigo-200'
                    : 'bg-purple-50 text-[#7C3AED] border-purple-200'
                }`}
              >
                {opp.type || 'DRIVE'}
              </span>
            </div>
            <h1 className="text-2xl font-bold text-[#172033] tracking-tight">{opp.title}</h1>
            <p className="text-sm font-medium text-slate-600 mt-1">{opp.role}</p>
          </div>

          <div className="flex flex-col sm:items-end gap-2">
            <div>
              <StatusBadge status={application.status} size="lg" />
            </div>
            <span className="text-xs text-slate-500">
              Submitted on <strong className="text-slate-700">{appliedDateStr}</strong>
            </span>
          </div>
        </div>

        {/* Opportunity Quick Meta */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-2">
          {opp.location && (
            <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                Location
              </span>
              <span className="text-xs font-bold text-slate-700 mt-0.5 block">
                {opp.location} ({opp.workMode || 'Onsite'})
              </span>
            </div>
          )}

          {opp.type === 'PLACEMENT' && opp.salary?.ctc && (
            <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                Package (CTC)
              </span>
              <span className="text-xs font-bold text-emerald-700 mt-0.5 block">
                {opp.salary.currency || 'INR'} {opp.salary.ctc}
              </span>
            </div>
          )}

          {opp.type === 'INTERNSHIP' && opp.stipend?.amount && (
            <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                Stipend
              </span>
              <span className="text-xs font-bold text-purple-700 mt-0.5 block">
                {opp.stipend.currency || 'INR'} {opp.stipend.amount}/{opp.stipend.frequency || 'month'}
              </span>
            </div>
          )}

          <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
              Deadline
            </span>
            <span className="text-xs font-bold text-slate-700 mt-0.5 block">{deadlineStr}</span>
          </div>

          <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
              Application ID
            </span>
            <span className="text-[11px] font-mono font-medium text-slate-600 mt-0.5 block truncate">
              {application.id || application._id}
            </span>
          </div>
        </div>

        {/* Submitted Resume Snapshot */}
        <div className="pt-4 border-t border-slate-100 space-y-3">
          <h3 className="text-sm font-bold text-[#172033] flex items-center gap-2">
            <FileText className="w-4 h-4 text-[#4F46E5]" />
            Submitted Resume Snapshot
          </h3>

          {application.resume?.url ? (
            <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 border border-slate-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-indigo-100 text-[#4F46E5] flex items-center justify-center font-bold text-sm">
                  PDF
                </div>
                <div>
                  <span className="block text-xs font-bold text-slate-800">
                    {application.resume.fileName || 'Student_Resume.pdf'}
                  </span>
                  <span className="block text-[11px] text-slate-500">
                    Snapshot preserved at time of application submission
                  </span>
                </div>
              </div>

              <a
                href={application.resume.url}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 rounded-xl bg-[#4F46E5] hover:bg-[#4338CA] text-white text-xs font-semibold shadow-sm transition-colors inline-flex items-center gap-1.5"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                View Resume
              </a>
            </div>
          ) : (
            <p className="text-xs text-slate-500">No external resume attached to this application.</p>
          )}
        </div>

        {/* Application Note / Cover Message */}
        {application.applicationMessage && (
          <div className="pt-4 border-t border-slate-100 space-y-2">
            <h3 className="text-sm font-bold text-[#172033]">Submitted Application Message</h3>
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 leading-relaxed">
              {application.applicationMessage}
            </div>
          </div>
        )}

        {/* Student Snapshot details */}
        {application.studentSnapshot && (
          <div className="pt-4 border-t border-slate-100 space-y-3">
            <h3 className="text-sm font-bold text-[#172033] flex items-center gap-2">
              <User className="w-4 h-4 text-[#4F46E5]" />
              Profile Credentials at Time of Application
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl">
                <span className="text-slate-400 block text-[10px] uppercase font-semibold">Department</span>
                <span className="font-bold text-slate-700">{application.studentSnapshot.department || 'N/A'}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl">
                <span className="text-slate-400 block text-[10px] uppercase font-semibold">Graduation Batch</span>
                <span className="font-bold text-slate-700">{application.studentSnapshot.graduationYear || 'N/A'}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl">
                <span className="text-slate-400 block text-[10px] uppercase font-semibold">CGPA</span>
                <span className="font-bold text-emerald-700">{application.studentSnapshot.cgpa || 'N/A'}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl">
                <span className="text-slate-400 block text-[10px] uppercase font-semibold">Active Backlogs</span>
                <span className="font-bold text-slate-700">{application.studentSnapshot.backlogs ?? 0}</span>
              </div>
            </div>
          </div>
        )}

        {/* Phase 7: Recruitment Decision Banner */}
        {application.status === 'SELECTED' && (
          <div className="pt-4 border-t border-slate-100">
            <div className="p-6 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-md space-y-2">
              <div className="flex items-center gap-2 text-sm font-extrabold tracking-wider uppercase text-emerald-100">
                <Sparkles className="w-5 h-5 text-yellow-300 animate-pulse" />
                Offer Extended — Congratulations!
              </div>
              <h3 className="text-xl font-bold">You have been selected for this position!</h3>
              <p className="text-xs text-emerald-50 leading-relaxed max-w-2xl">
                The campus recruitment team has officially marked your candidature as Selected. Please check your registered email for formal offer documentation and onboarding instructions from the recruiter.
              </p>
            </div>
          </div>
        )}

        {application.status === 'WAITLISTED' && (
          <div className="pt-4 border-t border-slate-100">
            <div className="p-5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 space-y-1.5">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-700">
                <AlertCircle className="w-4 h-4 text-amber-600" />
                Waitlist Status
              </div>
              <p className="text-xs leading-relaxed">
                Your profile has been placed on the active waitlist. In the event of vacancy or offer rollover, coordinators will reach out directly.
              </p>
            </div>
          </div>
        )}

        {application.status === 'REJECTED' && (
          <div className="pt-4 border-t border-slate-100">
            <div className="p-5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 space-y-1.5">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-rose-700">
                <XCircle className="w-4 h-4 text-rose-600" />
                Application Update
              </div>
              <p className="text-xs leading-relaxed">
                Thank you for your interest and effort throughout the rounds. Your candidature was not selected for this drive at this time. We encourage you to apply for upcoming campus drives.
              </p>
            </div>
          </div>
        )}

        {/* Phase 7: Scheduled Interview Section */}
        {application.interview && application.interview.status !== 'CANCELLED' && (
          <div className="pt-4 border-t border-slate-100 space-y-3">
            <h3 className="text-sm font-bold text-[#172033] flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#4F46E5]" />
              Scheduled Interview Details
            </h3>
            <InterviewCard interview={application.interview} isTpo={false} />
          </div>
        )}

        {/* Phase 14: AI Interview Preparation */}
        {oppId && (
          <div className="pt-4 border-t border-slate-100">
            <AiInterviewPrepCard
              opportunityId={oppId}
              opportunityTitle={opp.title || 'Target Role'}
              companyName={opp.companyName || 'Company'}
            />
          </div>
        )}

        {/* Phase 7: Recruitment Progress Timeline & Audit History */}
        <div className="pt-4 border-t border-slate-100 space-y-3">
          <ApplicationTimeline
            currentStatus={application.status}
            history={application.statusHistory || []}
          />
        </div>

        {/* Bottom Actions */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-4">
          {oppId && (
            <Link
              to={`/opportunities/${oppId}`}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#4F46E5] hover:underline"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              View Original Opportunity Posting
            </Link>
          )}

          {application.status === 'APPLIED' && (
            <button
              type="button"
              onClick={() => setWithdrawModal({ isOpen: true, reason: '', isSubmitting: false })}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-colors inline-flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Withdraw Application
            </button>
          )}
        </div>
      </div>

      {/* Withdraw Modal */}
      {withdrawModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200 space-y-4">
            <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center mx-auto">
              <RotateCcw className="w-6 h-6" />
            </div>

            <div className="text-center">
              <h3 className="text-lg font-bold text-[#172033]">Withdraw Application</h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Are you sure you want to withdraw your application for{' '}
                <strong className="text-slate-800">{opp.title || 'this opportunity'}</strong>? This action will mark
                your application as withdrawn.
              </p>
            </div>

            <form onSubmit={handleWithdraw} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Reason for withdrawal (Optional):
                </label>
                <input
                  type="text"
                  placeholder="e.g. Received another offer..."
                  value={withdrawModal.reason}
                  onChange={(e) => setWithdrawModal((prev) => ({ ...prev, reason: e.target.value }))}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#4F46E5]"
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setWithdrawModal({ isOpen: false, reason: '', isSubmitting: false })}
                  disabled={withdrawModal.isSubmitting}
                  className="w-1/2 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-semibold text-xs hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={withdrawModal.isSubmitting}
                  className="w-1/2 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs shadow-sm transition-colors flex items-center justify-center gap-1.5"
                >
                  {withdrawModal.isSubmitting ? 'Withdrawing...' : 'Confirm Withdrawal'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ApplicationDetailPage;
