import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { getMyApplications, withdrawApplication } from '../../services/applicationService';
import {
  Briefcase,
  Calendar,
  Clock,
  MapPin,
  Search,
  ArrowRight,
  ExternalLink,
  FileText,
  CheckCircle2,
  XCircle,
  AlertCircle,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  Eye,
} from 'lucide-react';
import StatusBadge from '../../components/StatusBadge';

export const MyApplicationsPage = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [feedback, setFeedback] = useState({ message: '', type: '' });

  // Filters & Search
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [selectedSort, setSelectedSort] = useState('newest');

  // Pagination
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    hasNextPage: false,
    hasPreviousPage: false,
  });

  // Withdraw Modal State
  const [withdrawModal, setWithdrawModal] = useState({
    isOpen: false,
    application: null,
    reason: '',
    isSubmitting: false,
  });

  const fetchApplications = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getMyApplications({
        page,
        limit: 10,
        status: selectedStatus,
        type: selectedType,
        search: searchTerm,
        sort: selectedSort,
      });

      if (res && res.success) {
        setApplications(res.data || []);
        if (res.pagination) {
          setPagination(res.pagination);
        }
      }
    } catch (err) {
      setError(err.message || 'Failed to load your applications.');
    } finally {
      setLoading(false);
    }
  }, [page, selectedStatus, selectedType, searchTerm, selectedSort]);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  const handleWithdraw = async (e) => {
    e.preventDefault();
    if (!withdrawModal.application) return;

    setWithdrawModal((prev) => ({ ...prev, isSubmitting: true }));
    try {
      const appId = withdrawModal.application.id || withdrawModal.application._id;
      const res = await withdrawApplication(appId, withdrawModal.reason);
      if (res && res.success) {
        setFeedback({
          message: 'Application withdrawn successfully.',
          type: 'success',
        });
        setWithdrawModal({ isOpen: false, application: null, reason: '', isSubmitting: false });
        fetchApplications();
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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-[#4F46E5] mb-2">
            <Briefcase className="w-3.5 h-3.5" />
            Student Career Portal
          </div>
          <h1 className="text-3xl font-bold text-[#172033] tracking-tight">My Applications</h1>
          <p className="text-slate-500 text-sm mt-1">
            Track and manage your submitted campus placement and internship applications.
          </p>
        </div>

        <Link
          to="/student/opportunities"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#4F46E5] hover:bg-[#4338CA] text-white font-semibold text-sm rounded-xl shadow-sm transition-colors self-start sm:self-auto"
        >
          Browse Opportunities
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Notification Banner */}
      {feedback.message && (
        <div
          className={`mt-6 p-4 rounded-xl border text-sm font-medium flex items-center gap-3 animate-in fade-in ${
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

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-4 mt-6 mb-6">
        <div className="flex flex-col md:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by company, opportunity title, or role..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(1);
              }}
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#4F46E5] focus:bg-white text-[#172033]"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            {/* Status Filter */}
            <select
              value={selectedStatus}
              onChange={(e) => {
                setSelectedStatus(e.target.value);
                setPage(1);
              }}
              className="px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 text-slate-700 font-medium focus:outline-none focus:ring-1 focus:ring-[#4F46E5]"
            >
              <option value="">All Statuses</option>
              <option value="APPLIED">Applied</option>
              <option value="SHORTLISTED">Shortlisted</option>
              <option value="INTERVIEW">Interview</option>
              <option value="SELECTED">Selected</option>
              <option value="REJECTED">Rejected</option>
              <option value="WITHDRAWN">Withdrawn</option>
            </select>

            {/* Type Filter */}
            <select
              value={selectedType}
              onChange={(e) => {
                setSelectedType(e.target.value);
                setPage(1);
              }}
              className="px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 text-slate-700 font-medium focus:outline-none focus:ring-1 focus:ring-[#4F46E5]"
            >
              <option value="">All Types</option>
              <option value="PLACEMENT">Placements</option>
              <option value="INTERNSHIP">Internships</option>
            </select>

            {/* Sort */}
            <select
              value={selectedSort}
              onChange={(e) => {
                setSelectedSort(e.target.value);
                setPage(1);
              }}
              className="px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 text-slate-700 font-medium focus:outline-none focus:ring-1 focus:ring-[#4F46E5]"
            >
              <option value="newest">Applied: Newest First</option>
              <option value="interview">Upcoming Interview Soonest</option>
              <option value="oldest">Applied: Oldest First</option>
              <option value="deadlineSoonest">Deadline Soonest</option>
            </select>
          </div>
        </div>
      </div>

      {/* Content Area */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-white rounded-2xl border border-slate-200 p-6 animate-pulse space-y-4 shadow-sm"
            >
              <div className="flex justify-between items-start">
                <div className="space-y-2 w-1/3">
                  <div className="h-4 bg-slate-200 rounded w-1/2"></div>
                  <div className="h-6 bg-slate-200 rounded w-3/4"></div>
                </div>
                <div className="h-6 bg-slate-200 rounded w-20"></div>
              </div>
              <div className="h-4 bg-slate-100 rounded w-1/4"></div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="bg-rose-50 border border-rose-200 rounded-2xl p-8 text-center my-8">
          <AlertCircle className="w-10 h-10 text-rose-500 mx-auto mb-3" />
          <h3 className="font-bold text-rose-900 text-lg">Failed to load applications</h3>
          <p className="text-sm text-rose-700 mt-1">{error}</p>
          <button
            onClick={fetchApplications}
            className="mt-4 px-4 py-2 bg-rose-600 text-white rounded-xl text-xs font-semibold hover:bg-rose-700 transition-colors"
          >
            Retry
          </button>
        </div>
      ) : applications.length === 0 ? (
        /* Empty State */
        <div className="bg-white border border-slate-200/80 rounded-2xl p-12 text-center max-w-lg mx-auto my-8 shadow-sm">
          <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-[#4F46E5] flex items-center justify-center mx-auto mb-4">
            <Briefcase className="w-8 h-8" />
          </div>
          <h3 className="font-bold text-xl text-[#172033]">You haven't applied to any opportunities yet</h3>
          <p className="text-sm text-slate-500 mt-2 max-w-sm mx-auto leading-relaxed">
            Explore available placement and internship drives from top recruiting companies tailored for your profile.
          </p>
          <Link
            to="/student/opportunities"
            className="mt-6 px-6 py-3 bg-[#4F46E5] hover:bg-[#4338CA] text-white rounded-xl text-sm font-semibold transition-colors shadow-sm inline-flex items-center gap-2"
          >
            Browse Opportunities
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {applications.map((app) => {
            const appId = app.id || app._id;
            const opp = app.opportunity || {};
            const oppId = opp.id || opp._id || app.opportunityId;
            const appliedDate = app.appliedAt ? new Date(app.appliedAt) : new Date(app.createdAt);
            const appliedDateStr = !isNaN(appliedDate.getTime())
              ? appliedDate.toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })
              : 'N/A';

            const deadline = opp.applicationDeadline ? new Date(opp.applicationDeadline) : null;
            const deadlineStr = deadline && !isNaN(deadline.getTime())
              ? deadline.toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })
              : 'N/A';

            return (
              <div
                key={appId}
                className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-sm hover:border-indigo-200 transition-all space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                        {opp.companyName || 'Recruiting Company'}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                          opp.type === 'PLACEMENT'
                            ? 'bg-indigo-50 text-[#4F46E5] border-indigo-200'
                            : 'bg-purple-50 text-[#7C3AED] border-purple-200'
                        }`}
                      >
                        {opp.type || 'DRIVE'}
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-[#172033] hover:text-[#4F46E5] transition-colors">
                      <Link to={`/student/applications/${appId}`}>{opp.title || 'Opportunity'}</Link>
                    </h3>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 pt-1">
                      {opp.role && (
                        <span className="font-medium text-slate-700 flex items-center gap-1">
                          <Briefcase className="w-3.5 h-3.5 text-slate-400" />
                          {opp.role}
                        </span>
                      )}
                      {opp.location && (
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          {opp.location} ({opp.workMode || 'Onsite'})
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        Applied: <strong className="text-slate-700">{appliedDateStr}</strong>
                      </span>
                      {deadlineStr !== 'N/A' && (
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          Deadline: {deadlineStr}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2 pt-2 sm:pt-0 border-t sm:border-0 border-slate-100">
                    <div>
                      <StatusBadge status={app.status} size="sm" />
                    </div>

                    {app.resume?.url && (
                      <a
                        href={app.resume.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-[11px] font-medium text-[#4F46E5] hover:underline"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        {app.resume.fileName || 'View Resume'}
                      </a>
                    )}
                  </div>
                </div>

                {/* Phase 7: Scheduled Interview Banner */}
                {app.interview && app.interview.status !== 'CANCELLED' && (
                  <div className="bg-purple-50/70 border border-purple-100 rounded-xl p-3 flex flex-wrap items-center justify-between gap-2 text-xs">
                    <div className="flex items-center gap-2 text-purple-900 font-semibold">
                      <span className="w-2 h-2 rounded-full bg-purple-600 animate-ping"></span>
                      <span>
                        Interview: {app.interview.round} • {app.interview.date} at {app.interview.startTime} ({app.interview.mode})
                      </span>
                    </div>
                    {app.interview.mode === 'ONLINE' && app.interview.meetingLink && (
                      <a
                        href={app.interview.meetingLink.startsWith('http') ? app.interview.meetingLink : `https://${app.interview.meetingLink}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#4F46E5] font-bold hover:underline inline-flex items-center gap-1 text-[11px]"
                      >
                        Join Meeting <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                )}

                {/* Application Message Note Preview */}
                {app.applicationMessage && (
                  <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 text-xs text-slate-600 italic">
                    <span className="font-semibold text-slate-700 not-italic">Cover Note: </span>
                    "{app.applicationMessage}"
                  </div>
                )}

                {/* Actions Bar */}
                <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <Link
                      to={`/student/applications/${appId}`}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#4F46E5] hover:text-[#4338CA] transition-colors"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      View Application Details
                    </Link>

                    {oppId && (
                      <Link
                        to={`/opportunities/${oppId}`}
                        className="inline-flex items-center gap-1 text-xs font-medium text-slate-500 hover:text-slate-700 transition-colors"
                      >
                        <ExternalLink className="w-3 h-3" />
                        View Job Posting
                      </Link>
                    )}
                  </div>

                  {/* Allow withdraw only while in initial APPLIED state */}
                  {app.status === 'APPLIED' && (
                    <button
                      type="button"
                      onClick={() =>
                        setWithdrawModal({
                          isOpen: true,
                          application: app,
                          reason: '',
                          isSubmitting: false,
                        })
                      }
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:text-rose-600 hover:bg-rose-50 border border-slate-200 hover:border-rose-200 transition-colors"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      Withdraw
                    </button>
                  )}
                </div>
              </div>
            );
          })}

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="mt-8 flex items-center justify-between pt-4 border-t border-slate-200 text-xs">
              <span className="text-slate-500 font-medium">
                Page {pagination.currentPage} of {pagination.totalPages} ({pagination.totalItems} applications)
              </span>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={!pagination.hasPreviousPage}
                  className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 disabled:opacity-40"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
                  disabled={!pagination.hasNextPage}
                  className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 disabled:opacity-40"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

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
                <strong className="text-slate-800">
                  {withdrawModal.application?.opportunity?.title || 'this opportunity'}
                </strong>
                ? Your application record will be marked as withdrawn for auditing.
              </p>
            </div>

            <form onSubmit={handleWithdraw} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Reason for withdrawal (Optional):
                </label>
                <input
                  type="text"
                  placeholder="e.g. Accepted another offer, scheduling conflict..."
                  value={withdrawModal.reason}
                  onChange={(e) =>
                    setWithdrawModal((prev) => ({ ...prev, reason: e.target.value }))
                  }
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#4F46E5]"
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() =>
                    setWithdrawModal({ isOpen: false, application: null, reason: '', isSubmitting: false })
                  }
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

export default MyApplicationsPage;
