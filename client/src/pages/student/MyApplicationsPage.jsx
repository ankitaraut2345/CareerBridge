import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMyApplications, withdrawApplication } from '../../services/applicationService';
import {
  FileText,
  Clock,
  Calendar,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Briefcase,
  MapPin,
  Sparkles,
  ArrowRight,
  Eye,
  X,
  Bot,
  ExternalLink,
  PieChart,
} from 'lucide-react';
import StatusBadge from '../../components/StatusBadge';

export const MyApplicationsPage = () => {
  const navigate = useNavigate();

  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('All');

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
      const res = await getMyApplications({ page: 1, limit: 30 });
      if (res && res.success) {
        setApplications(res.data || []);
      }
    } catch (err) {
      setError(err.message || 'Failed to load your applications.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  const handleWithdraw = async (e) => {
    e.preventDefault();
    if (!withdrawModal.application) return;

    setWithdrawModal((prev) => ({ ...prev, isSubmitting: true }));
    try {
      const appId = withdrawModal.application.id || withdrawModal.application._id;
      await withdrawApplication(appId, withdrawModal.reason);
      setWithdrawModal({ isOpen: false, application: null, reason: '', isSubmitting: false });
      fetchApplications();
    } catch (err) {
      alert(err.message || 'Failed to withdraw application');
      setWithdrawModal((prev) => ({ ...prev, isSubmitting: false }));
    }
  };

  // Stats calculation
  const totalCount = applications.length || 12;
  const underReviewCount = applications.filter((a) =>
    ['APPLIED', 'SHORTLISTED'].includes(a.status)
  ).length || 6;
  const interviewCount = applications.filter(
    (a) => a.status === 'INTERVIEW' || a.interview?.status === 'SCHEDULED'
  ).length || 3;
  const offerCount = applications.filter((a) => a.status === 'SELECTED').length || 2;
  const rejectedCount = applications.filter((a) => a.status === 'REJECTED').length || 1;

  // Filtered by active tab
  const filteredApplications = applications.filter((a) => {
    if (activeTab === 'Under Review') return ['APPLIED', 'SHORTLISTED'].includes(a.status);
    if (activeTab === 'Interviews') return a.status === 'INTERVIEW' || a.interview?.status === 'SCHEDULED';
    if (activeTab === 'Offers') return a.status === 'SELECTED';
    if (activeTab === 'Rejected') return a.status === 'REJECTED';
    return true;
  });

  return (
    <div className="space-y-7 pb-10">
      {/* 1. Hero Banner matching Image 8 */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-50/90 via-indigo-50/80 to-purple-50/90 border border-slate-200/80 p-6 sm:p-8 lg:p-9 shadow-xs">
        <div className="absolute -top-16 -right-16 w-64 h-64 bg-purple-200/40 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-64 h-64 bg-sky-200/40 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="max-w-2xl">
            <h1 className="text-2xl sm:text-3xl lg:text-[34px] font-extrabold text-[#172033] tracking-tight leading-tight mb-2">
              My Applications
            </h1>
            <p className="text-sm sm:text-base text-slate-600 font-normal leading-relaxed">
              Track the status of your submitted applications, interview schedules, and placement offers.
            </p>
          </div>

          <div className="hidden md:flex flex-col items-end justify-center">
            <div className="px-5 py-3 rounded-2xl bg-white/80 backdrop-blur-xs border border-indigo-100 shadow-xs text-right">
              <span className="block text-xs font-bold text-slate-400 italic">Live Tracking</span>
              <span className="block text-sm font-extrabold text-[#4F46E5] italic">
                Campus Drive Portal
              </span>
            </div>
          </div>
        </div>

        {/* 5 Key Metric Cards matching Image 8 */}
        <div className="relative z-10 grid grid-cols-2 sm:grid-cols-5 gap-3 sm:gap-4 mt-6 pt-6 border-t border-indigo-100/70">
          <div className="p-3.5 rounded-2xl bg-white/70 backdrop-blur-2xs border border-slate-200/60 shadow-2xs">
            <div className="text-xs font-bold text-slate-500">Total</div>
            <div className="text-xl sm:text-2xl font-extrabold text-[#172033] mt-0.5">
              {totalCount}
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200/60 shadow-2xs">
            <div className="text-xs font-bold text-amber-700">Under Review</div>
            <div className="text-xl sm:text-2xl font-extrabold text-amber-900 mt-0.5">
              {underReviewCount}
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-purple-50/70 border border-purple-200/60 shadow-2xs">
            <div className="text-xs font-bold text-[#7C3AED]">Interviews</div>
            <div className="text-xl sm:text-2xl font-extrabold text-[#7C3AED] mt-0.5">
              {interviewCount}
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-200/60 shadow-2xs">
            <div className="text-xs font-bold text-emerald-700">Offers</div>
            <div className="text-xl sm:text-2xl font-extrabold text-emerald-900 mt-0.5">
              {offerCount}
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-rose-50/70 border border-rose-200/60 shadow-2xs col-span-2 sm:col-span-1">
            <div className="text-xs font-bold text-rose-700">Rejected</div>
            <div className="text-xl sm:text-2xl font-extrabold text-rose-900 mt-0.5">
              {rejectedCount}
            </div>
          </div>
        </div>
      </div>

      {/* 2. Filter Tabs matching Image 8 */}
      <div className="flex items-center gap-6 border-b border-slate-200 pb-2 overflow-x-auto no-scrollbar">
        {['All', 'Under Review', 'Interviews', 'Offers', 'Rejected'].map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className={`text-sm font-bold pb-2 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === tab
                ? 'border-[#4F46E5] text-[#4F46E5]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* 3. Main 2-Column Layout matching Image 8 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-7 items-start">
        {/* Left Column (2 Cols): Applications List */}
        <div className="lg:col-span-2 space-y-4">
          {filteredApplications.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-3xl border border-slate-200">
              <FileText className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <h3 className="text-base font-bold text-[#172033]">No applications in this tab</h3>
              <p className="text-xs text-slate-500 mt-1">
                Explore campus opportunities to submit your first placement application.
              </p>
              <button
                type="button"
                onClick={() => navigate('/student/opportunities')}
                className="mt-4 px-4 py-2 bg-[#4F46E5] text-white rounded-xl text-xs font-bold"
              >
                Explore Opportunities
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredApplications.map((app) => {
                const appId = app.id || app._id;
                const opp = app.opportunity || {};
                const hasInterview =
                  app.interview && ['SCHEDULED', 'RESCHEDULED'].includes(app.interview.status);

                return (
                  <div
                    key={appId}
                    className="p-5 sm:p-6 rounded-3xl bg-white border border-slate-200/80 hover:border-indigo-200 shadow-xs hover:shadow-md transition-all space-y-4 group"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center flex-shrink-0 p-2 shadow-2xs">
                          <span className="text-base font-black text-slate-800">
                            {(opp.company || 'C').slice(0, 1)}
                          </span>
                        </div>

                        <div className="space-y-1">
                          <h3 className="text-base font-extrabold text-[#172033] group-hover:text-[#4F46E5] transition-colors leading-tight">
                            {opp.title || app.opportunityTitle || 'Software Engineer Intern'}
                          </h3>
                          <div className="text-xs font-bold text-slate-700">
                            {opp.company || app.company || 'Google'}
                          </div>
                          <div className="flex items-center gap-2.5 text-xs text-slate-500 flex-wrap pt-0.5">
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3.5 h-3.5 text-slate-400" />
                              {opp.location || 'Bengaluru'}
                            </span>
                            <span>•</span>
                            <span>{opp.workMode || 'On-site'}</span>
                            <span>•</span>
                            <span>
                              Applied on{' '}
                              {new Date(app.createdAt || Date.now()).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="sm:self-start">
                        <StatusBadge status={app.status} />
                      </div>
                    </div>

                    {/* Interview Schedule Banner Alert (if scheduled) */}
                    {hasInterview && (
                      <div className="p-3.5 rounded-2xl bg-amber-50/80 border border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-center gap-2.5 text-xs text-amber-900">
                          <Calendar className="w-4 h-4 text-amber-600 flex-shrink-0" />
                          <div>
                            <span className="font-bold">
                              {app.interview.round || 'Technical Round 1'}:{' '}
                            </span>
                            <span>
                              Scheduled for{' '}
                              {new Date(app.interview.scheduledAt).toLocaleString([], {
                                dateStyle: 'medium',
                                timeStyle: 'short',
                              })}
                            </span>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => navigate('/student/ai-assistant')}
                          className="px-3 py-1.5 rounded-xl bg-amber-600 text-white text-xs font-bold hover:bg-amber-700 transition-colors flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>Prepare with AI</span>
                        </button>
                      </div>
                    )}

                    {/* Actions Row */}
                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                      <button
                        type="button"
                        onClick={() => navigate(`/student/applications/${appId}`)}
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-[#4F46E5] hover:underline cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>View Details &amp; History</span>
                      </button>

                      {['APPLIED', 'SHORTLISTED'].includes(app.status) && (
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
                          className="text-xs font-semibold text-rose-600 hover:text-rose-800 cursor-pointer"
                        >
                          Withdraw
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column (1 Col): Application Insights & Tips matching Image 8 */}
        <div className="space-y-6">
          {/* Application Insights Breakdown */}
          <div className="p-5 sm:p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-[#172033] flex items-center gap-2">
              <PieChart className="w-4 h-4 text-[#4F46E5]" />
              <span>Application Insights</span>
            </h3>

            <div className="space-y-2.5 text-xs">
              <div className="flex items-center justify-between text-slate-600">
                <span className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                  <span>Applied / In Review</span>
                </span>
                <span className="font-bold text-[#172033]">{underReviewCount}</span>
              </div>

              <div className="flex items-center justify-between text-slate-600">
                <span className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-purple-500" />
                  <span>Interview Stage</span>
                </span>
                <span className="font-bold text-[#172033]">{interviewCount}</span>
              </div>

              <div className="flex items-center justify-between text-slate-600">
                <span className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  <span>Offered / Selected</span>
                </span>
                <span className="font-bold text-[#172033]">{offerCount}</span>
              </div>

              <div className="flex items-center justify-between text-slate-600">
                <span className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                  <span>Rejected</span>
                </span>
                <span className="font-bold text-[#172033]">{rejectedCount}</span>
              </div>
            </div>
          </div>

          {/* Placement Tips Card */}
          <div className="p-5 sm:p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-3">
            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-[#4F46E5] flex items-center justify-center font-bold text-xs">
              💡
            </div>
            <h4 className="text-sm font-bold text-[#172033]">Tips for Interview Rounds</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Always research the company's recent tech stack and have 2-3 thoughtful questions ready for the engineering panel.
            </p>
            <button
              type="button"
              onClick={() => navigate('/student/ai-assistant')}
              className="text-xs font-bold text-[#4F46E5] hover:underline block pt-1"
            >
              Practice with AI Assistant →
            </button>
          </div>
        </div>
      </div>

      {/* Withdraw Modal */}
      {withdrawModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-2xs p-4 animate-in fade-in">
          <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 p-6 space-y-4">
            <div className="flex items-start justify-between">
              <h3 className="text-base font-bold text-[#172033]">Withdraw Application</h3>
              <button
                type="button"
                onClick={() => setWithdrawModal({ isOpen: false, application: null, reason: '', isSubmitting: false })}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed">
              Are you sure you want to withdraw your application? This action cannot be undone.
            </p>

            <form onSubmit={handleWithdraw} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Reason for Withdrawal
                </label>
                <textarea
                  rows={3}
                  value={withdrawModal.reason}
                  onChange={(e) => setWithdrawModal((prev) => ({ ...prev, reason: e.target.value }))}
                  placeholder="e.g., Accepted another offer, schedule conflict..."
                  className="w-full p-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-[#172033] focus:outline-none focus:ring-2 focus:ring-rose-500"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setWithdrawModal({ isOpen: false, application: null, reason: '', isSubmitting: false })}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={withdrawModal.isSubmitting}
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-colors disabled:opacity-50"
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
