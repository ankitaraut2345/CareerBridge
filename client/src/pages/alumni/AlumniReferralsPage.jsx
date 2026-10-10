import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Building2,
  Plus,
  Users,
  CheckCircle2,
  Clock,
  Send,
  AlertCircle,
  Loader2,
  ExternalLink,
  Lock,
  Unlock,
  ChevronRight,
  Filter,
  FileText,
  X,
  MessageSquare,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Ban,
  Check,
} from 'lucide-react';
import {
  getMyAlumniReferrals,
  getAllAlumniRequests,
  updateReferralOpportunityStatus,
  acceptReferralRequest,
  rejectReferralRequest,
  markReferralAsReferred,
  completeReferralRequest,
} from '../../services/referralService';
import ReferralStatusBadge, { ReferralOutcomeBadge } from '../../components/ReferralStatusBadge';
import Button from '../../components/Button';

export const AlumniReferralsPage = () => {
  const navigate = useNavigate();

  // Navigation tab: 'POSTINGS' or 'REQUESTS'
  const [activeMainTab, setActiveMainTab] = useState('POSTINGS');

  // Data states
  const [postings, setPostings] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Sub-filter for requests
  const [requestFilter, setRequestFilter] = useState('ALL');

  // Action states
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  // Modal states
  const [declineModalItem, setDeclineModalItem] = useState(null);
  const [declineReason, setDeclineReason] = useState('');
  const [referModalItem, setReferModalItem] = useState(null);
  const [referralNote, setReferralNote] = useState('');

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [postingsRes, requestsRes] = await Promise.all([
        getMyAlumniReferrals().catch((err) => ({ data: { data: [] }, error: err })),
        getAllAlumniRequests().catch((err) => ({ data: { data: [] }, error: err })),
      ]);

      if (postingsRes.error && postingsRes.error.response?.status === 403) {
        setError(postingsRes.error.response?.data?.message || 'Access restricted. Please ensure your alumni profile is verified.');
        return;
      }

      setPostings(postingsRes.data?.data || []);
      setRequests(requestsRes.data?.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load referral data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 5000);
  };

  // Toggle opportunity OPEN / CLOSED
  const handleToggleStatus = async (oppId, currentStatus) => {
    const nextStatus = currentStatus === 'OPEN' ? 'CLOSED' : 'OPEN';
    setActionLoadingId(oppId);
    try {
      await updateReferralOpportunityStatus(oppId, nextStatus);
      showToast(`Referral opportunity marked as ${nextStatus}.`);
      await fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update opportunity status.');
    } finally {
      setActionLoadingId(null);
    }
  };

  // Accept a student request
  const handleAcceptRequest = async (requestId) => {
    setActionLoadingId(requestId);
    try {
      await acceptReferralRequest(requestId);
      showToast('Referral request accepted. You can now refer the student internally.');
      await fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to accept request.');
    } finally {
      setActionLoadingId(null);
    }
  };

  // Confirm Decline
  const handleConfirmDecline = async (e) => {
    e.preventDefault();
    if (!declineModalItem) return;
    setActionLoadingId(declineModalItem._id);
    try {
      await rejectReferralRequest(declineModalItem._id, {
        alumniResponse: declineReason,
      });
      showToast('Referral request declined.');
      setDeclineModalItem(null);
      setDeclineReason('');
      await fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to decline request.');
    } finally {
      setActionLoadingId(null);
    }
  };

  // Confirm Mark as Referred
  const handleConfirmRefer = async (e) => {
    e.preventDefault();
    if (!referModalItem) return;
    setActionLoadingId(referModalItem._id);
    try {
      await markReferralAsReferred(referModalItem._id, {
        alumniResponse: referralNote,
      });
      showToast('Candidate successfully marked as referred!');
      setReferModalItem(null);
      setReferralNote('');
      await fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update referral.');
    } finally {
      setActionLoadingId(null);
    }
  };

  // Mark Completed
  const handleCompleteRequest = async (requestId) => {
    if (!window.confirm('Mark this referral as completed?')) return;
    setActionLoadingId(requestId);
    try {
      await completeReferralRequest(requestId);
      showToast('Referral process marked as completed.');
      await fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to complete referral.');
    } finally {
      setActionLoadingId(null);
    }
  };

  // Metrics calculation
  const totalPostings = postings.length;
  const openPostings = postings.filter((p) => p.status === 'OPEN').length;
  const pendingRequests = requests.filter((r) => r.status === 'PENDING').length;
  const referredCount = requests.filter(
    (r) => r.status === 'REFERRED' || r.status === 'COMPLETED'
  ).length;

  const filteredRequests = requests.filter((r) => {
    if (requestFilter === 'ALL') return true;
    return r.status === requestFilter;
  });

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Toast Alert */}
        {toastMessage && (
          <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-[#172033] text-white px-5 py-3 rounded-xl shadow-2xl border border-slate-700 animate-in fade-in slide-in-from-bottom-5">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
            <span className="text-sm font-medium">{toastMessage}</span>
          </div>
        )}

        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-[#4F46E5] text-xs font-semibold mb-2">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Verified Alumni Network</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#172033] tracking-tight">
              Alumni Referrals Hub
            </h1>
            <p className="text-sm text-slate-600 mt-1 max-w-2xl">
              Post job openings at your company, review qualified student candidates, and refer top campus talent.
            </p>
          </div>

          <Button
            to="/alumni/referrals/create"
            variant="primary"
            size="md"
            icon={Plus}
          >
            Post Referral Opportunity
          </Button>
        </div>

        {/* Unverified / Error Banner */}
        {error && (
          <div className="p-5 rounded-2xl bg-amber-50 border border-amber-200 flex items-start gap-3 text-amber-900">
            <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h4 className="text-sm font-bold">Verification Notice</h4>
              <p className="text-xs text-amber-800 mt-1">{error}</p>
              <div className="mt-3">
                <Link
                  to="/alumni/profile"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-700 hover:text-indigo-900 bg-amber-100/60 px-3 py-1.5 rounded-lg border border-amber-300"
                >
                  <span>Go to Alumni Profile</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Metrics Overview Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-indigo-50 text-[#4F46E5] flex items-center justify-center flex-shrink-0">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <span className="block text-2xl font-bold text-[#172033]">{totalPostings}</span>
              <span className="text-xs font-medium text-slate-500">Total Postings</span>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0">
              <Unlock className="w-6 h-6" />
            </div>
            <div>
              <span className="block text-2xl font-bold text-[#172033]">{openPostings}</span>
              <span className="text-xs font-medium text-slate-500">Active / Open</span>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center flex-shrink-0">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <span className="block text-2xl font-bold text-[#172033]">{pendingRequests}</span>
              <span className="text-xs font-medium text-slate-500">Pending Review</span>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center flex-shrink-0">
              <Send className="w-6 h-6" />
            </div>
            <div>
              <span className="block text-2xl font-bold text-[#172033]">{referredCount}</span>
              <span className="text-xs font-medium text-slate-500">Candidates Referred</span>
            </div>
          </div>
        </div>

        {/* Main Tab Switcher */}
        <div className="border-b border-slate-200 flex items-center justify-between">
          <div className="flex gap-8">
            <button
              onClick={() => setActiveMainTab('POSTINGS')}
              className={`pb-4 text-sm font-bold flex items-center gap-2 border-b-2 transition-colors ${
                activeMainTab === 'POSTINGS'
                  ? 'border-[#4F46E5] text-[#4F46E5]'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Building2 className="w-4 h-4" />
              <span>My Referral Opportunities ({postings.length})</span>
            </button>

            <button
              onClick={() => setActiveMainTab('REQUESTS')}
              className={`pb-4 text-sm font-bold flex items-center gap-2 border-b-2 transition-colors ${
                activeMainTab === 'REQUESTS'
                  ? 'border-[#4F46E5] text-[#4F46E5]'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Incoming Candidate Requests ({requests.length})</span>
              {pendingRequests > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-amber-500 text-white text-[10px] font-bold">
                  {pendingRequests}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* TAB 1: MY POSTINGS */}
        {activeMainTab === 'POSTINGS' && (
          <div className="space-y-4">
            {loading ? (
              <div className="py-20 text-center">
                <Loader2 className="w-8 h-8 animate-spin text-[#4F46E5] mx-auto mb-3" />
                <p className="text-sm font-medium text-slate-500">Loading your referral postings...</p>
              </div>
            ) : postings.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
                <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-[#4F46E5] flex items-center justify-center mx-auto mb-4">
                  <Building2 className="w-7 h-7" />
                </div>
                <h3 className="text-lg font-bold text-[#172033]">No referral opportunities posted yet</h3>
                <p className="text-sm text-slate-500 mt-1 max-w-md mx-auto">
                  Help juniors jumpstart their careers by posting referral openings at your organization.
                </p>
                <div className="mt-6">
                  <Button
                    to="/alumni/referrals/create"
                    variant="primary"
                    size="md"
                    icon={Plus}
                  >
                    Create Your First Posting
                  </Button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {postings.map((opp) => {
                  const reqCount = opp.requestCount || opp.requestsCount || 0;
                  const maxReq = opp.maximumRequests || 10;
                  const isFull = reqCount >= maxReq;

                  return (
                    <div
                      key={opp._id}
                      className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between overflow-hidden group"
                    >
                      <div className="p-5 space-y-4">
                        {/* Status & Company */}
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                            {opp.companyName}
                          </span>
                          <ReferralStatusBadge status={opp.status} size="sm" />
                        </div>

                        {/* Title & Role */}
                        <div>
                          <h3 className="text-base font-bold text-[#172033] group-hover:text-[#4F46E5] transition-colors line-clamp-1">
                            {opp.title}
                          </h3>
                          <p className="text-xs text-slate-500 mt-0.5">
                            {opp.role} • {opp.location} ({opp.workMode})
                          </p>
                        </div>

                        {/* Capacity meter */}
                        <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 space-y-1.5">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-slate-600 font-medium">Candidate Requests</span>
                            <span className="font-bold text-[#172033]">
                              {reqCount} / {maxReq}
                            </span>
                          </div>
                          <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all ${
                                isFull ? 'bg-rose-500' : 'bg-[#4F46E5]'
                              }`}
                              style={{ width: `${Math.min(100, (reqCount / maxReq) * 100)}%` }}
                            />
                          </div>
                          {opp.applicationDeadline && (
                            <div className="text-[11px] text-slate-500 flex items-center gap-1 pt-1">
                              <Clock className="w-3 h-3 text-slate-400" />
                              <span>Deadline: {new Date(opp.applicationDeadline).toLocaleDateString()}</span>
                            </div>
                          )}
                        </div>

                        {/* Skills preview */}
                        {opp.requiredSkills && opp.requiredSkills.length > 0 && (
                          <div className="flex flex-wrap gap-1.5">
                            {opp.requiredSkills.slice(0, 3).map((s, i) => (
                              <span
                                key={i}
                                className="px-2 py-0.5 text-[11px] font-medium bg-slate-100 text-slate-700 rounded-md"
                              >
                                {s}
                              </span>
                            ))}
                            {opp.requiredSkills.length > 3 && (
                              <span className="px-1.5 py-0.5 text-[10px] text-slate-500">
                                +{opp.requiredSkills.length - 3} more
                              </span>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Card Footer Actions */}
                      <div className="bg-slate-50/70 p-4 border-t border-slate-100 flex items-center justify-between gap-2">
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(opp._id, opp.status)}
                          disabled={actionLoadingId === opp._id}
                          className="text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50"
                        >
                          {actionLoadingId === opp._id ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : opp.status === 'OPEN' ? (
                            <>
                              <Lock className="w-3.5 h-3.5 text-rose-500" />
                              <span>Close</span>
                            </>
                          ) : (
                            <>
                              <Unlock className="w-3.5 h-3.5 text-emerald-600" />
                              <span>Open</span>
                            </>
                          )}
                        </button>

                        <button
                          type="button"
                          onClick={() => navigate(`/alumni/referrals/${opp._id}`)}
                          className="text-xs font-bold text-[#4F46E5] hover:text-indigo-800 transition-colors flex items-center gap-1 px-3 py-1.5 rounded-lg bg-indigo-50 border border-indigo-200 hover:bg-indigo-100"
                        >
                          <span>Review Requests ({reqCount})</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: INCOMING REQUESTS */}
        {activeMainTab === 'REQUESTS' && (
          <div className="space-y-6">
            {/* Status Filter Pills */}
            <div className="flex flex-wrap items-center gap-2">
              {['ALL', 'PENDING', 'ACCEPTED', 'REFERRED', 'COMPLETED', 'REJECTED'].map((filter) => (
                <button
                  key={filter}
                  onClick={() => setRequestFilter(filter)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                    requestFilter === filter
                      ? 'bg-[#172033] text-white shadow-2xs'
                      : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {filter.charAt(0) + filter.slice(1).toLowerCase()}
                </button>
              ))}
            </div>

            {loading ? (
              <div className="py-20 text-center">
                <Loader2 className="w-8 h-8 animate-spin text-[#4F46E5] mx-auto mb-3" />
                <p className="text-sm font-medium text-slate-500">Loading candidate requests...</p>
              </div>
            ) : filteredRequests.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
                <div className="w-14 h-14 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-4">
                  <Users className="w-7 h-7" />
                </div>
                <h3 className="text-lg font-bold text-[#172033]">No requests in this category</h3>
                <p className="text-sm text-slate-500 mt-1">
                  Candidate requests matching your filter will appear here.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredRequests.map((req) => {
                  const student = req.studentId || {};
                  const studentName = student.name || 'Student Candidate';
                  const oppTitle = req.referralOpportunityId?.title || 'Referral Opportunity';
                  const oppCompany = req.referralOpportunityId?.companyName || 'Company';

                  return (
                    <div
                      key={req._id}
                      className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-md transition-all p-5 space-y-4"
                    >
                      {/* Top Bar: Student details & status badges */}
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-100 pb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-11 h-11 rounded-xl bg-indigo-50 text-[#4F46E5] font-bold text-sm flex items-center justify-center border border-indigo-100 flex-shrink-0">
                            {studentName.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="text-base font-bold text-[#172033]">{studentName}</h3>
                              {student.email && (
                                <span className="text-xs text-slate-400">({student.email})</span>
                              )}
                            </div>
                            <p className="text-xs text-slate-500">
                              Applied for <strong className="text-slate-700">{oppTitle}</strong> at{' '}
                              <strong className="text-slate-700">{oppCompany}</strong>
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 flex-wrap">
                          <ReferralStatusBadge status={req.status} />
                          {req.outcome && req.outcome !== 'PENDING' && (
                            <ReferralOutcomeBadge outcome={req.outcome} />
                          )}
                        </div>
                      </div>

                      {/* Request message quote */}
                      {req.requestMessage && (
                        <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-100 flex items-start gap-2.5">
                          <MessageSquare className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
                          <div className="flex-1">
                            <span className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-0.5">
                              Student Pitch
                            </span>
                            <p className="text-xs text-slate-700 leading-relaxed italic">
                              "{req.requestMessage}"
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Alumni response note if already responded */}
                      {req.alumniResponse && (
                        <div className="bg-indigo-50/50 rounded-xl p-3 border border-indigo-100 text-xs text-indigo-900 flex items-start gap-2">
                          <CheckCircle2 className="w-4 h-4 text-[#4F46E5] flex-shrink-0 mt-0.5" />
                          <div>
                            <span className="font-bold">Your Response Note:</span> {req.alumniResponse}
                          </div>
                        </div>
                      )}

                      {/* Actions & Links Bar */}
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-2">
                        <div className="flex items-center gap-4 text-xs text-slate-500">
                          {req.resumeUrl ? (
                            <a
                              href={req.resumeUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 font-bold text-[#4F46E5] hover:underline"
                            >
                              <FileText className="w-4 h-4" />
                              <span>View Candidate Resume</span>
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          ) : (
                            <span className="text-slate-400 italic">No resume linked</span>
                          )}
                          <span>•</span>
                          <span>Requested: {new Date(req.createdAt || req.requestedAt).toLocaleDateString()}</span>
                        </div>

                        {/* Interactive Workflow Buttons */}
                        <div className="flex items-center gap-2 flex-wrap">
                          {req.status === 'PENDING' && (
                            <>
                              <button
                                type="button"
                                onClick={() => handleAcceptRequest(req._id)}
                                disabled={actionLoadingId === req._id}
                                className="px-3 py-1.5 text-xs font-bold text-white bg-[#4F46E5] hover:bg-indigo-700 rounded-xl transition-colors flex items-center gap-1 shadow-2xs"
                              >
                                {actionLoadingId === req._id ? (
                                  <Loader2 className="w-3 h-3 animate-spin" />
                                ) : (
                                  <Check className="w-3.5 h-3.5" />
                                )}
                                <span>Accept Request</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => setDeclineModalItem(req)}
                                className="px-3 py-1.5 text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl transition-colors"
                              >
                                Decline
                              </button>
                            </>
                          )}

                          {req.status === 'ACCEPTED' && (
                            <>
                              <button
                                type="button"
                                onClick={() => setReferModalItem(req)}
                                className="px-3.5 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-colors flex items-center gap-1 shadow-2xs"
                              >
                                <Send className="w-3.5 h-3.5" />
                                <span>Mark as Referred</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => setDeclineModalItem(req)}
                                className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-rose-700 rounded-xl transition-colors"
                              >
                                Cancel / Decline
                              </button>
                            </>
                          )}

                          {req.status === 'REFERRED' && (
                            <button
                              type="button"
                              onClick={() => handleCompleteRequest(req._id)}
                              disabled={actionLoadingId === req._id}
                              className="px-3 py-1.5 text-xs font-bold text-purple-700 bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-xl transition-colors flex items-center gap-1"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Mark Completed</span>
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() =>
                              navigate(
                                `/alumni/referrals/${
                                  req.referralOpportunityId?._id || req.referralOpportunityId
                                }`
                              )
                            }
                            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
                            title="View full opportunity"
                          >
                            <ChevronRight className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Decline Reason Modal */}
      {declineModalItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-[#172033]">Decline Referral Request</h3>
              <button
                type="button"
                onClick={() => setDeclineModalItem(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmDecline} className="mt-4 space-y-4">
              <p className="text-xs text-slate-600">
                You are declining the referral request from{' '}
                <strong>{declineModalItem.studentId?.name || 'Candidate'}</strong>. Please provide constructive feedback.
              </p>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Reason / Feedback (Optional)
                </label>
                <textarea
                  rows={3}
                  value={declineReason}
                  onChange={(e) => setDeclineReason(e.target.value)}
                  placeholder="e.g. Current opening requires 2+ years experience in Go; please keep building projects."
                  className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setDeclineModalItem(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoadingId === declineModalItem._id}
                  className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl transition-colors flex items-center gap-1.5"
                >
                  {actionLoadingId === declineModalItem._id && (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  )}
                  <span>Confirm Decline</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Mark as Referred Modal */}
      {referModalItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-[#172033]">Confirm Candidate Referral</h3>
              <button
                type="button"
                onClick={() => setReferModalItem(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmRefer} className="mt-4 space-y-4">
              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-900">
                <p>
                  You are marking <strong>{referModalItem.studentId?.name || 'Candidate'}</strong> as officially referred to{' '}
                  <strong>{referModalItem.referralOpportunityId?.companyName || 'your company'}</strong>.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Referral Note / Job Requisition ID (Optional)
                </label>
                <textarea
                  rows={3}
                  value={referralNote}
                  onChange={(e) => setReferralNote(e.target.value)}
                  placeholder="e.g. Submitted under internal portal (Req #89231). Candidate should watch email for official link."
                  className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setReferModalItem(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoadingId === referModalItem._id}
                  className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-colors flex items-center gap-1.5 shadow-2xs"
                >
                  {actionLoadingId === referModalItem._id && (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  )}
                  <span>Mark as Referred</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AlumniReferralsPage;
