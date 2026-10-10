import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  getApplicationById,
  updateApplicationStatus,
  scheduleInterview,
  updateInterview,
  cancelInterview,
} from '../../services/applicationService';
import {
  ArrowLeft,
  Briefcase,
  Building2,
  Calendar,
  Clock,
  MapPin,
  FileText,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Edit,
  User,
  Mail,
  Plus,
} from 'lucide-react';
import StatusBadge from '../../components/StatusBadge';
import ApplicationTimeline from '../../components/ApplicationTimeline';
import InterviewCard from '../../components/InterviewCard';
import UpdateStatusModal from '../../components/UpdateStatusModal';
import InterviewModal from '../../components/InterviewModal';

export const TpoApplicationDetailPage = () => {
  const { id } = useParams();

  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [feedback, setFeedback] = useState({ message: '', type: '' });

  // Modal States
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [interviewModalOpen, setInterviewModalOpen] = useState(false);

  const fetchApplication = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getApplicationById(id);
      if (res && res.success) {
        setApplication(res.data);
      } else {
        setError('Application record not found');
      }
    } catch (err) {
      setError(err.message || 'Failed to load application details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplication();
  }, [id]);

  const handleStatusUpdate = async (appId, newStatus, note) => {
    const res = await updateApplicationStatus(appId, { status: newStatus, note });
    if (res && res.success) {
      setFeedback({
        message: `Application successfully updated to ${newStatus}`,
        type: 'success',
      });
      fetchApplication();
    }
    setTimeout(() => setFeedback({ message: '', type: '' }), 4000);
  };

  const handleInterviewSave = async (appId, interviewData) => {
    let res;
    if (application.interview) {
      res = await updateInterview(appId, interviewData);
    } else {
      res = await scheduleInterview(appId, interviewData);
    }

    if (res && res.success) {
      setFeedback({
        message: 'Interview details saved successfully.',
        type: 'success',
      });
      fetchApplication();
    }
    setTimeout(() => setFeedback({ message: '', type: '' }), 4000);
  };

  const handleInterviewCancel = async (appId, reason) => {
    const res = await cancelInterview(appId, reason);
    if (res && res.success) {
      setFeedback({
        message: 'Interview marked as cancelled.',
        type: 'success',
      });
      fetchApplication();
    }
    setTimeout(() => setFeedback({ message: '', type: '' }), 4000);
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-16 animate-pulse space-y-6">
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
          <h3 className="font-bold text-rose-900 text-lg">Application Not Found</h3>
          <p className="text-sm text-rose-700 mt-1">{error || 'Record does not exist or unauthorized.'}</p>
          <Link
            to="/tpo/opportunities"
            className="mt-5 inline-flex items-center gap-2 px-4 py-2 bg-rose-600 text-white rounded-xl text-xs font-semibold hover:bg-rose-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to TPO Opportunities
          </Link>
        </div>
      </div>
    );
  }

  const opp = application.opportunity || {};
  const oppId = opp.id || opp._id || application.opportunityId;
  const student = application.student || {};
  const studentSnapshot = application.studentSnapshot || application.studentProfileSnapshot || {};
  const candidateName = student.name || studentSnapshot.fullName || 'Candidate';
  const appliedDate = application.appliedAt ? new Date(application.appliedAt) : new Date(application.createdAt);
  const appliedDateStr = !isNaN(appliedDate.getTime())
    ? appliedDate.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : 'N/A';

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Navigation Breadcrumb */}
      <div className="mb-6 flex items-center justify-between">
        <Link
          to={`/tpo/opportunities/${oppId}/applicants`}
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-[#4F46E5] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Applicant Roster
        </Link>

        <Link
          to={`/opportunities/${oppId}`}
          className="inline-flex items-center gap-1 text-xs font-semibold text-[#4F46E5] hover:underline"
        >
          <ExternalLink className="w-3.5 h-3.5" />
          View Drive Posting
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

      {/* Main Candidate Application Header Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div className="space-y-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Candidate Application
              </span>
              <StatusBadge status={application.status} size="sm" />
            </div>
            <h1 className="text-2xl font-bold text-[#172033] tracking-tight">{candidateName}</h1>
            <p className="text-xs text-slate-500 flex items-center gap-2">
              <Mail className="w-3.5 h-3.5" />
              {student.email || studentSnapshot.email || 'N/A'} • Applied: <strong>{appliedDateStr}</strong>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={() => setStatusModalOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-[#4F46E5] hover:bg-[#4338CA] text-white text-xs font-bold shadow-sm transition-colors flex items-center gap-1.5"
            >
              <Edit className="w-3.5 h-3.5" />
              Update Status
            </button>

            <button
              type="button"
              onClick={() => setInterviewModalOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-[#7C3AED] border border-purple-200 text-xs font-bold transition-colors flex items-center gap-1.5"
            >
              <Calendar className="w-3.5 h-3.5" />
              {application.interview ? 'Manage Interview' : 'Schedule Interview'}
            </button>
          </div>
        </div>

        {/* Opportunity Summary Cardlet */}
        <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div>
            <span className="text-slate-400 font-semibold uppercase tracking-wider block text-[10px]">
              Drive &amp; Opportunity
            </span>
            <strong className="text-slate-800 text-sm">{opp.title}</strong>
            <span className="text-slate-500 ml-2">({opp.companyName} • {opp.type})</span>
          </div>
          <div>
            <span className="text-slate-400 font-semibold uppercase tracking-wider block text-[10px]">
              Role &amp; Location
            </span>
            <span className="font-semibold text-slate-700">{opp.role} • {opp.location}</span>
          </div>
        </div>

        {/* Academic Credentials Snapshot */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100">
            <span className="text-slate-400 block text-[10px] uppercase font-bold">Department</span>
            <span className="font-bold text-slate-800 mt-0.5 block">{studentSnapshot.department || 'N/A'}</span>
          </div>
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100">
            <span className="text-slate-400 block text-[10px] uppercase font-bold">Graduation Batch</span>
            <span className="font-bold text-slate-800 mt-0.5 block">{studentSnapshot.graduationYear || 'N/A'}</span>
          </div>
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100">
            <span className="text-slate-400 block text-[10px] uppercase font-bold">CGPA</span>
            <span className="font-bold text-emerald-700 mt-0.5 block">{studentSnapshot.cgpa || 'N/A'}</span>
          </div>
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100">
            <span className="text-slate-400 block text-[10px] uppercase font-bold">Backlogs</span>
            <span className="font-bold text-slate-800 mt-0.5 block">{studentSnapshot.backlogs ?? 0} active</span>
          </div>
        </div>

        {/* Candidate Skills */}
        {studentSnapshot.skills && studentSnapshot.skills.length > 0 && (
          <div className="space-y-1.5">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
              Candidate Skills
            </span>
            <div className="flex flex-wrap gap-1.5">
              {studentSnapshot.skills.map((skill, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 font-semibold text-xs border border-slate-200"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Submitted Resume Snapshot */}
        {application.resume?.url && (
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-100 text-[#4F46E5] flex items-center justify-center font-bold text-xs">
                PDF
              </div>
              <div>
                <span className="block text-xs font-bold text-slate-800">
                  {application.resume.fileName || 'Candidate_Resume.pdf'}
                </span>
                <span className="block text-[11px] text-slate-500">
                  Preserved snapshot at time of application submission
                </span>
              </div>
            </div>

            <a
              href={application.resume.url}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 rounded-xl bg-[#4F46E5] hover:bg-[#4338CA] text-white text-xs font-bold shadow-sm transition-colors inline-flex items-center gap-1.5"
            >
              <FileText className="w-3.5 h-3.5" />
              Open Resume
            </a>
          </div>
        )}

        {/* Cover Note */}
        {application.applicationMessage && (
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 space-y-1">
            <span className="font-bold text-slate-800 block">Candidate Cover Note:</span>
            <p className="italic leading-relaxed">"{application.applicationMessage}"</p>
          </div>
        )}

        {/* Scheduled Interview Details Card */}
        {application.interview && application.interview.status !== 'CANCELLED' && (
          <div className="pt-4 border-t border-slate-100 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-[#172033] flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[#4F46E5]" />
                Scheduled Interview Details
              </h3>
            </div>
            <InterviewCard
              interview={application.interview}
              isTpo={true}
              onEdit={() => setInterviewModalOpen(true)}
            />
          </div>
        )}

        {/* Recruitment Timeline & Activity History */}
        <div className="pt-4 border-t border-slate-100 space-y-4">
          <ApplicationTimeline
            currentStatus={application.status}
            history={application.statusHistory || []}
          />
        </div>
      </div>

      {/* Modals */}
      <UpdateStatusModal
        isOpen={statusModalOpen}
        onClose={() => setStatusModalOpen(false)}
        application={application}
        onSuccess={handleStatusUpdate}
      />

      <InterviewModal
        isOpen={interviewModalOpen}
        onClose={() => setInterviewModalOpen(false)}
        application={application}
        onSave={handleInterviewSave}
        onCancelInterview={handleInterviewCancel}
      />
    </div>
  );
};

export default TpoApplicationDetailPage;
