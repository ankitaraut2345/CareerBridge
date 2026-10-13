import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  Clock,
  CheckCircle2,
  XCircle,
  Award,
  Ban,
  GraduationCap,
  Briefcase,
  Layers,
  Settings,
  Loader2,
  AlertCircle,
  MessageSquare,
  Sparkles,
  ArrowRight,
  X,
  MessageCircle,
} from 'lucide-react';
import {
  getAlumniRequests,
  acceptMentorship,
  rejectMentorship,
  completeMentorship,
  cancelMentorship,
} from '../../services/mentorshipService';
import MentorshipStatusBadge from '../../components/MentorshipStatusBadge';

export const AlumniMentorshipPage = () => {
  const navigate = useNavigate();

  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('PENDING');

  // Action states
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [rejectingItem, setRejectingItem] = useState(null);
  const [declineReason, setDeclineReason] = useState('');
  const [toastMessage, setToastMessage] = useState(null);

  const fetchRequests = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getAlumniRequests();
      setRequests(res?.data || (Array.isArray(res) ? res : []));
    } catch (err) {
      setError(
        err.response?.data?.message ||
          'Failed to load incoming mentorship requests.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleAccept = async (id) => {
    setActionLoadingId(id);
    try {
      await acceptMentorship(id);
      setToastMessage('Mentorship request accepted! Student notified.');
      setTimeout(() => setToastMessage(null), 5000);
      await fetchRequests();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to accept request.');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleConfirmDecline = async (e) => {
    e.preventDefault();
    if (!rejectingItem) return;
    const id = rejectingItem._id;
    setActionLoadingId(id);
    try {
      await rejectMentorship(id, { responseMessage: declineReason });
      setToastMessage('Mentorship request declined.');
      setTimeout(() => setToastMessage(null), 5000);
      setRejectingItem(null);
      setDeclineReason('');
      await fetchRequests();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to decline request.');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleComplete = async (id) => {
    if (!window.confirm('Mark this mentorship as completed?')) return;
    setActionLoadingId(id);
    try {
      await completeMentorship(id);
      setToastMessage('Mentorship marked as completed.');
      setTimeout(() => setToastMessage(null), 5000);
      await fetchRequests();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to complete mentorship.');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleCancel = async (id) => {
    if (!window.confirm('End this mentorship relationship?')) return;
    setActionLoadingId(id);
    try {
      await cancelMentorship(id);
      setToastMessage('Mentorship relationship ended.');
      setTimeout(() => setToastMessage(null), 5000);
      await fetchRequests();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to cancel mentorship.');
    } finally {
      setActionLoadingId(null);
    }
  };

  // Counts
  const pendingList = requests.filter((r) => r.status === 'PENDING');
  const activeList = requests.filter((r) => r.status === 'ACCEPTED');
  const historyList = requests.filter((r) => ['COMPLETED', 'REJECTED', 'CANCELLED'].includes(r.status));

  const counts = {
    PENDING: pendingList.length,
    ACCEPTED: activeList.length,
    HISTORY: historyList.length,
  };

  const currentList =
    activeTab === 'PENDING'
      ? pendingList
      : activeTab === 'ACCEPTED'
      ? activeList
      : historyList;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-3 border border-slate-700 animate-in slide-in-from-bottom duration-200">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
          <span className="text-xs font-semibold">{toastMessage}</span>
          <button
            onClick={() => setToastMessage(null)}
            className="text-slate-400 hover:text-white ml-2"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-8 border-b border-slate-200">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-[#F5F3FF] text-[#7C3AED] mb-2">
            <Users className="w-3.5 h-3.5" />
            Alumni Mentorship Portal
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#172033] tracking-tight">
            Mentorship Requests &amp; Active Mentees
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Empower campus juniors with career advice, technical interview preparation, and industry insights.
          </p>
        </div>

        <button
          onClick={() => navigate('/alumni/profile')}
          className="px-4 py-2 text-xs font-semibold text-[#7C3AED] bg-white border border-[#7C3AED] rounded-xl hover:bg-[#F5F3FF] transition-colors flex items-center gap-2 shadow-2xs flex-shrink-0"
        >
          <Settings className="w-4 h-4" />
          <span>Mentorship Availability &amp; Areas</span>
        </button>
      </div>

      {/* Summary Cards */}
      <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-amber-600 uppercase tracking-wider block">
              Pending Requests
            </span>
            <span className="text-3xl font-extrabold text-amber-700 mt-1 block">
              {counts.PENDING}
            </span>
            <span className="text-[11px] text-slate-400 mt-0.5 block">
              Awaiting your review
            </span>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-emerald-600 uppercase tracking-wider block">
              Active Mentees
            </span>
            <span className="text-3xl font-extrabold text-emerald-700 mt-1 block">
              {counts.ACCEPTED}
            </span>
            <span className="text-[11px] text-slate-400 mt-0.5 block">
              Ongoing guidance sessions
            </span>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-indigo-600 uppercase tracking-wider block">
              Completed Mentorships
            </span>
            <span className="text-3xl font-extrabold text-[#4F46E5] mt-1 block">
              {counts.HISTORY}
            </span>
            <span className="text-[11px] text-slate-400 mt-0.5 block">
              Past concluded mentorships
            </span>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-[#EEF2FF] text-[#4F46E5] flex items-center justify-center">
            <Award className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mt-8 flex items-center gap-2 border-b border-slate-200 pb-3">
        {[
          { key: 'PENDING', label: 'Incoming Requests', count: counts.PENDING },
          { key: 'ACCEPTED', label: 'Active Mentees', count: counts.ACCEPTED },
          { key: 'HISTORY', label: 'History & Past', count: counts.HISTORY },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 ${
              activeTab === tab.key
                ? 'bg-[#F5F3FF] text-[#7C3AED] border border-violet-200 shadow-2xs font-bold'
                : 'text-slate-600 hover:text-[#172033] hover:bg-slate-100'
            }`}
          >
            <span>{tab.label}</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                activeTab === tab.key
                  ? 'bg-[#7C3AED] text-white'
                  : 'bg-slate-200/80 text-slate-600'
              }`}
            >
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Tab Content List */}
      <div className="mt-6 space-y-4">
        {loading ? (
          <div className="p-16 flex flex-col items-center justify-center bg-white rounded-2xl border border-slate-200">
            <Loader2 className="w-8 h-8 animate-spin text-[#7C3AED] mb-3" />
            <p className="text-xs font-semibold text-slate-600">Loading mentorship records...</p>
          </div>
        ) : error ? (
          <div className="p-8 bg-rose-50 border border-rose-200 rounded-2xl text-center">
            <AlertCircle className="w-8 h-8 text-rose-500 mx-auto mb-2" />
            <p className="text-sm font-semibold text-rose-800">{error}</p>
            <button
              onClick={fetchRequests}
              className="mt-3 px-4 py-1.5 text-xs font-semibold text-white bg-rose-600 rounded-xl hover:bg-rose-700"
            >
              Try Again
            </button>
          </div>
        ) : currentList.length === 0 ? (
          <div className="p-16 bg-white rounded-2xl border border-slate-200 text-center">
            <Users className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-[#172033] mb-1">
              {activeTab === 'PENDING'
                ? 'No pending mentorship requests'
                : activeTab === 'ACCEPTED'
                ? 'No active mentorships currently'
                : 'No past mentorship records'}
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              {activeTab === 'PENDING'
                ? 'New student mentorship requests will appear here when submitted.'
                : 'Accepted mentorships will be listed here for session coordination.'}
            </p>
          </div>
        ) : (
          currentList.map((item) => {
            const st = item.student || {};
            const isProcessing = actionLoadingId === item._id;

            return (
              <div
                key={item._id}
                className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs hover:border-slate-300 transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-6"
              >
                {/* Left: Student Profile & Request Details */}
                <div className="flex items-start gap-4 flex-1">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#EEF2FF] to-[#E0E7FF] text-[#4F46E5] font-extrabold text-base flex items-center justify-center flex-shrink-0 border border-indigo-100 shadow-2xs">
                    {st.fullName
                      ? st.fullName
                          .split(' ')
                          .map((n) => n[0])
                          .slice(0, 2)
                          .join('')
                      : 'ST'}
                  </div>

                  <div className="space-y-2 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-base font-bold text-[#172033]">
                        {st.fullName || 'Student Candidate'}
                      </h3>
                      <MentorshipStatusBadge status={item.status} size="sm" />
                    </div>

                    <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                      <span className="flex items-center gap-1 font-medium text-slate-700">
                        <GraduationCap className="w-3.5 h-3.5 text-slate-400" />
                        {st.department || 'N/A'} (Class of {st.graduationYear || 2026})
                      </span>
                      <span>•</span>
                      <span>{st.college || 'CareerBridge'}</span>
                    </div>

                    {/* Student Skills */}
                    {st.skills && st.skills.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider self-center mr-1">
                          Skills:
                        </span>
                        {st.skills.slice(0, 5).map((s, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 rounded-lg text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200/60"
                          >
                            {s}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Requested Areas */}
                    {item.mentorshipAreas && item.mentorshipAreas.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider self-center mr-1">
                          Topics:
                        </span>
                        {item.mentorshipAreas.map((area, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 rounded-lg text-xs font-semibold bg-[#F5F3FF] text-[#7C3AED] border border-violet-100"
                          >
                            {area}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Request Note */}
                    {item.requestMessage && (
                      <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs text-slate-700 max-w-2xl mt-2">
                        <span className="font-semibold text-slate-800 block mb-0.5">
                          Student Request Message:
                        </span>
                        <p className="italic">"{item.requestMessage}"</p>
                      </div>
                    )}

                    {/* Response note if declined */}
                    {item.responseMessage && (
                      <div className="p-2.5 bg-rose-50 rounded-xl border border-rose-100 text-xs text-rose-800 max-w-2xl mt-1">
                        <span className="font-semibold block mb-0.5">Your Response Note:</span>
                        <p className="italic">"{item.responseMessage}"</p>
                      </div>
                    )}

                    <p className="text-[11px] text-slate-400 pt-1">
                      {item.status === 'PENDING' &&
                        `Received on ${new Date(item.createdAt).toLocaleDateString()}`}
                      {item.status === 'ACCEPTED' &&
                        `Accepted on ${new Date(item.startedAt || item.updatedAt).toLocaleDateString()}`}
                      {item.status === 'COMPLETED' &&
                        `Completed on ${new Date(item.completedAt || item.updatedAt).toLocaleDateString()}`}
                      {item.status === 'REJECTED' &&
                        `Declined on ${new Date(item.rejectedAt || item.updatedAt).toLocaleDateString()}`}
                    </p>
                  </div>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-2 flex-shrink-0 self-end lg:self-center">
                  {item.status === 'PENDING' && (
                    <>
                      <button
                        type="button"
                        disabled={isProcessing}
                        onClick={() => handleAccept(item._id)}
                        className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-all shadow-2xs flex items-center gap-1.5 disabled:opacity-50"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Accept Request</span>
                      </button>

                      <button
                        type="button"
                        disabled={isProcessing}
                        onClick={() => setRejectingItem(item)}
                        className="px-3.5 py-2 text-xs font-semibold text-rose-700 bg-white border border-rose-200 hover:bg-rose-50 rounded-xl transition-colors flex items-center gap-1.5 disabled:opacity-50"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        <span>Decline</span>
                      </button>
                    </>
                  )}

                  {item.status === 'ACCEPTED' && (
                    <>
                      <button
                        type="button"
                        onClick={() => {
                          const targetUserId =
                            st.userId ||
                            (typeof item.studentId === 'object'
                              ? item.studentId?._id || item.studentId?.id
                              : item.studentId);
                          if (targetUserId) navigate(`/alumni/chat?with=${targetUserId}`);
                        }}
                        className="px-3.5 py-2 text-xs font-semibold text-[#4F46E5] bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-xl transition-colors flex items-center gap-1.5 shadow-2xs"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        <span>Message Mentee</span>
                      </button>

                      <button
                        type="button"
                        disabled={isProcessing}
                        onClick={() => handleComplete(item._id)}
                        className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors flex items-center gap-1.5 shadow-2xs disabled:opacity-50"
                      >
                        <Award className="w-3.5 h-3.5" />
                        <span>Mark Completed</span>
                      </button>

                      <button
                        type="button"
                        disabled={isProcessing}
                        onClick={() => handleCancel(item._id)}
                        className="px-3.5 py-2 text-xs font-semibold text-slate-500 hover:text-slate-700 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors disabled:opacity-50"
                      >
                        End
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Decline Reason Modal */}
      {rejectingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-md w-full border border-slate-200 shadow-xl overflow-hidden p-6 space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-base font-bold text-[#172033]">
                  Decline Mentorship Request
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  from {rejectingItem.student?.fullName || 'Student'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setRejectingItem(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleConfirmDecline} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Optional Reason / Note
                </label>
                <textarea
                  rows={3}
                  value={declineReason}
                  onChange={(e) => setDeclineReason(e.target.value)}
                  placeholder="e.g., Currently at full mentorship capacity for this semester. Wish you the best!"
                  className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#7C3AED] focus:outline-none resize-none bg-slate-50 focus:bg-white"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setRejectingItem(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoadingId === rejectingItem._id}
                  className="px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-xl flex items-center gap-1.5"
                >
                  {actionLoadingId === rejectingItem._id ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : null}
                  <span>Confirm Decline</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AlumniMentorshipPage;
