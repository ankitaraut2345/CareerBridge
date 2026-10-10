import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Building2,
  Briefcase,
  MapPin,
  Clock,
  ExternalLink,
  Users,
  CheckCircle2,
  XCircle,
  Send,
  Loader2,
  AlertCircle,
  FileText,
  Lock,
  Unlock,
  MessageSquare,
  Sparkles,
  Award,
  X,
  Check,
  ChevronRight,
  DollarSign,
  Layers,
  MessageCircle,
} from 'lucide-react';
import {
  getReferralOpportunityById,
  getOpportunityRequests,
  updateReferralOpportunityStatus,
  acceptReferralRequest,
  rejectReferralRequest,
  markReferralAsReferred,
  completeReferralRequest,
  updateReferralOutcome,
} from '../../services/referralService';
import ReferralStatusBadge, { ReferralOutcomeBadge } from '../../components/ReferralStatusBadge';

export const AlumniReferralDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [opportunity, setOpportunity] = useState(null);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filter for candidate requests
  const [activeFilter, setActiveFilter] = useState('ALL');

  // Action states
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  // Modals
  const [declineModalItem, setDeclineModalItem] = useState(null);
  const [declineReason, setDeclineReason] = useState('');

  const [referModalItem, setReferModalItem] = useState(null);
  const [referralNote, setReferralNote] = useState('');

  const [outcomeModalItem, setOutcomeModalItem] = useState(null);
  const [selectedOutcome, setSelectedOutcome] = useState('INTERVIEW');
  const [outcomeNote, setOutcomeNote] = useState('');

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [oppRes, reqsRes] = await Promise.all([
        getReferralOpportunityById(id),
        getOpportunityRequests(id),
      ]);

      setOpportunity(oppRes.data?.data?.opportunity || oppRes.data?.data || null);
      setRequests(reqsRes.data?.data || []);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          'Failed to load opportunity or candidate requests.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 5000);
  };

  const handleToggleStatus = async () => {
    if (!opportunity) return;
    const nextStatus = opportunity.status === 'OPEN' ? 'CLOSED' : 'OPEN';
    setActionLoadingId('STATUS');
    try {
      await updateReferralOpportunityStatus(opportunity._id, nextStatus);
      showToast(`Opportunity marked as ${nextStatus}.`);
      await fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update status.');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleAccept = async (requestId) => {
    setActionLoadingId(requestId);
    try {
      await acceptReferralRequest(requestId);
      showToast('Candidate request accepted.');
      await fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to accept request.');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleConfirmDecline = async (e) => {
    e.preventDefault();
    if (!declineModalItem) return;
    setActionLoadingId(declineModalItem._id);
    try {
      await rejectReferralRequest(declineModalItem._id, {
        alumniResponse: declineReason,
      });
      showToast('Candidate request declined.');
      setDeclineModalItem(null);
      setDeclineReason('');
      await fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to decline request.');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleConfirmRefer = async (e) => {
    e.preventDefault();
    if (!referModalItem) return;
    setActionLoadingId(referModalItem._id);
    try {
      await markReferralAsReferred(referModalItem._id, {
        alumniResponse: referralNote,
      });
      showToast('Candidate marked as officially referred!');
      setReferModalItem(null);
      setReferralNote('');
      await fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to mark as referred.');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleComplete = async (requestId) => {
    if (!window.confirm('Mark this referral as completed?')) return;
    setActionLoadingId(requestId);
    try {
      await completeReferralRequest(requestId);
      showToast('Referral marked as completed.');
      await fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to complete referral.');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleConfirmOutcome = async (e) => {
    e.preventDefault();
    if (!outcomeModalItem) return;
    setActionLoadingId(outcomeModalItem._id);
    try {
      await updateReferralOutcome(outcomeModalItem._id, {
        outcome: selectedOutcome,
        outcomeNote,
      });
      showToast('Company hiring outcome updated.');
      setOutcomeModalItem(null);
      setSelectedOutcome('INTERVIEW');
      setOutcomeNote('');
      await fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update outcome.');
    } finally {
      setActionLoadingId(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-[#4F46E5] mx-auto mb-3" />
          <p className="text-sm text-slate-500 font-medium">Loading referral details...</p>
        </div>
      </div>
    );
  }

  if (error || !opportunity) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] py-12 px-4">
        <div className="max-w-xl mx-auto bg-white p-8 rounded-2xl border border-slate-200 text-center space-y-4">
          <AlertCircle className="w-10 h-10 text-rose-500 mx-auto" />
          <h2 className="text-lg font-bold text-[#172033]">Opportunity Not Found</h2>
          <p className="text-xs text-slate-500">{error || 'Unable to locate this referral.'}</p>
          <button
            type="button"
            onClick={() => navigate('/alumni/referrals')}
            className="px-4 py-2 text-xs font-bold text-white bg-[#4F46E5] rounded-xl hover:bg-indigo-700 transition-colors"
          >
            Back to Referrals Hub
          </button>
        </div>
      </div>
    );
  }

  const reqCount = requests.length;
  const maxReq = opportunity.maximumRequests || 10;
  const isFull = reqCount >= maxReq;

  const filteredRequests = requests.filter((r) => {
    if (activeFilter === 'ALL') return true;
    return r.status === activeFilter;
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
        </div>

        {/* Opportunity Header Card */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-6 sm:p-8 space-y-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 border-b border-slate-100 pb-6">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  {opportunity.companyName}
                </span>
                <ReferralStatusBadge status={opportunity.status} />
              </div>

              <h1 className="text-2xl sm:text-3xl font-bold text-[#172033] tracking-tight">
                {opportunity.title}
              </h1>

              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600 pt-1">
                <span className="flex items-center gap-1">
                  <Briefcase className="w-3.5 h-3.5 text-slate-400" />
                  {opportunity.role} • {opportunity.employmentType}
                </span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  {opportunity.location} ({opportunity.workMode})
                </span>
                {opportunity.salaryOrPackage && (
                  <span className="flex items-center gap-1 font-semibold text-slate-700">
                    <DollarSign className="w-3.5 h-3.5 text-slate-400" />
                    {opportunity.salaryOrPackage}
                  </span>
                )}
                {opportunity.jobUrl && (
                  <a
                    href={opportunity.jobUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[#4F46E5] font-semibold hover:underline"
                  >
                    <span>Company Job Link</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            </div>

            {/* Quick Actions & Status Toggle */}
            <div className="flex items-center gap-3 flex-shrink-0">
              <button
                type="button"
                onClick={handleToggleStatus}
                disabled={actionLoadingId === 'STATUS'}
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors flex items-center gap-2"
              >
                {actionLoadingId === 'STATUS' ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : opportunity.status === 'OPEN' ? (
                  <>
                    <Lock className="w-4 h-4 text-rose-500" />
                    <span>Close Opportunity</span>
                  </>
                ) : (
                  <>
                    <Unlock className="w-4 h-4 text-emerald-600" />
                    <span>Reopen Opportunity</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Details & Capacity Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
            {/* Capacity meter */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
                <span>Application Capacity</span>
                <span>
                  {reqCount} / {maxReq} Requests
                </span>
              </div>
              <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${
                    isFull ? 'bg-rose-500' : 'bg-[#4F46E5]'
                  }`}
                  style={{ width: `${Math.min(100, (reqCount / maxReq) * 100)}%` }}
                />
              </div>
              <p className="text-[11px] text-slate-500">
                {isFull
                  ? 'Capacity limit reached. New student requests are paused.'
                  : `${maxReq - reqCount} referral slots remaining.`}
              </p>
            </div>

            {/* Skills required */}
            <div className="space-y-1.5 md:col-span-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                Required & Preferred Skills
              </span>
              <div className="flex flex-wrap gap-1.5">
                {opportunity.requiredSkills &&
                  opportunity.requiredSkills.map((s, i) => (
                    <span
                      key={`req-${i}`}
                      className="px-2.5 py-1 text-xs font-semibold bg-indigo-50 text-[#4F46E5] rounded-lg border border-indigo-100"
                    >
                      {s}
                    </span>
                  ))}
                {opportunity.preferredSkills &&
                  opportunity.preferredSkills.map((s, i) => (
                    <span
                      key={`pref-${i}`}
                      className="px-2.5 py-1 text-xs font-medium bg-slate-100 text-slate-700 rounded-lg"
                    >
                      {s} (Preferred)
                    </span>
                  ))}
              </div>
            </div>
          </div>

          {/* Instructions box */}
          {opportunity.referralInstructions && (
            <div className="bg-indigo-50/50 p-4 rounded-xl border border-indigo-100/70 text-xs space-y-1">
              <span className="font-bold text-[#4F46E5] block">Your Referral Guidelines:</span>
              <p className="text-slate-700">{opportunity.referralInstructions}</p>
            </div>
          )}
        </div>

        {/* Candidate Requests Section */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-4">
            <div>
              <h2 className="text-xl font-bold text-[#172033]">Candidate Requests</h2>
              <p className="text-xs text-slate-500">
                Review submitted student profiles, check resume snapshots, and track referral progress.
              </p>
            </div>

            {/* Sub-filter tabs */}
            <div className="flex flex-wrap items-center gap-1.5">
              {['ALL', 'PENDING', 'ACCEPTED', 'REFERRED', 'COMPLETED', 'REJECTED'].map((filter) => (
                <button
                  key={filter}
                  onClick={() => setActiveFilter(filter)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                    activeFilter === filter
                      ? 'bg-[#172033] text-white'
                      : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {filter.charAt(0) + filter.slice(1).toLowerCase()}
                </button>
              ))}
            </div>
          </div>

          {filteredRequests.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
              <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-[#172033]">No requests found</h3>
              <p className="text-xs text-slate-500 mt-1">
                No student requests match the filter criteria.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredRequests.map((req) => {
                const student = req.studentId || {};
                const studentName = student.name || 'Student Candidate';

                return (
                  <div
                    key={req._id}
                    className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-md transition-all p-5 space-y-4"
                  >
                    {/* Header: Candidate Info & Badges */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-100 pb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-indigo-50 text-[#4F46E5] font-bold text-sm flex items-center justify-center border border-indigo-100 flex-shrink-0">
                          {studentName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-sm font-bold text-[#172033]">{studentName}</h3>
                            {student.email && (
                              <span className="text-xs text-slate-400">({student.email})</span>
                            )}
                          </div>
                          <span className="text-xs text-slate-500">
                            Requested on: {new Date(req.createdAt || req.requestedAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 flex-wrap">
                        <ReferralStatusBadge status={req.status} />
                        {req.outcome && req.outcome !== 'PENDING' && (
                          <ReferralOutcomeBadge outcome={req.outcome} />
                        )}
                      </div>
                    </div>

                    {/* Candidate Pitch / Message */}
                    {req.requestMessage && (
                      <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100 flex items-start gap-2.5">
                        <MessageSquare className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
                        <div>
                          <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">
                            Candidate Note
                          </span>
                          <p className="text-xs text-slate-700 italic leading-relaxed">
                            "{req.requestMessage}"
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Alumni Note if existing */}
                    {req.alumniResponse && (
                      <div className="bg-indigo-50/50 p-3 rounded-xl border border-indigo-100 text-xs text-indigo-900">
                        <strong>Your Response Note:</strong> {req.alumniResponse}
                      </div>
                    )}

                    {/* Outcome Note if recorded */}
                    {req.outcomeNote && (
                      <div className="bg-purple-50/50 p-3 rounded-xl border border-purple-100 text-xs text-purple-900">
                        <strong>Outcome Note:</strong> {req.outcomeNote}
                      </div>
                    )}

                    {/* Actions bar */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-1">
                      <div>
                        {req.resumeUrl ? (
                          <a
                            href={req.resumeUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#4F46E5] hover:underline"
                          >
                            <FileText className="w-4 h-4" />
                            <span>View Snapshot Resume</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        ) : (
                          <span className="text-xs text-slate-400 italic">No resume attached</span>
                        )}
                      </div>

                      {/* Interactive Buttons */}
                      <div className="flex items-center gap-2 flex-wrap">
                        {req.status === 'PENDING' && (
                          <>
                            <button
                              type="button"
                              onClick={() => handleAccept(req._id)}
                              disabled={actionLoadingId === req._id}
                              className="px-3 py-1.5 text-xs font-bold text-white bg-[#4F46E5] hover:bg-indigo-700 rounded-xl transition-colors flex items-center gap-1"
                            >
                              {actionLoadingId === req._id ? (
                                <Loader2 className="w-3 h-3 animate-spin" />
                              ) : (
                                <Check className="w-3.5 h-3.5" />
                              )}
                              <span>Accept</span>
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
                              onClick={() => navigate(`/alumni/chat?with=${student._id || student.id}`)}
                              className="px-3.5 py-1.5 text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-xl transition-colors flex items-center gap-1"
                            >
                              <MessageCircle className="w-3.5 h-3.5" />
                              <span>Message</span>
                            </button>

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
                              className="px-3 py-1.5 text-xs font-medium text-slate-500 hover:text-rose-600 rounded-xl"
                            >
                              Cancel
                            </button>
                          </>
                        )}

                        {req.status === 'REFERRED' && (
                          <>
                            <button
                              type="button"
                              onClick={() => navigate(`/alumni/chat?with=${student._id || student.id}`)}
                              className="px-3.5 py-1.5 text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-xl transition-colors flex items-center gap-1"
                            >
                              <MessageCircle className="w-3.5 h-3.5" />
                              <span>Message</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => handleComplete(req._id)}
                              disabled={actionLoadingId === req._id}
                              className="px-3.5 py-1.5 text-xs font-bold text-purple-700 bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-xl transition-colors flex items-center gap-1"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Complete Referral</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                setOutcomeModalItem(req);
                                setSelectedOutcome(req.outcome || 'INTERVIEW');
                                setOutcomeNote(req.outcomeNote || '');
                              }}
                              className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl transition-colors flex items-center gap-1"
                            >
                              <Sparkles className="w-3.5 h-3.5 text-slate-400" />
                              <span>Update Outcome</span>
                            </button>
                          </>
                        )}

                        {req.status === 'COMPLETED' && (
                          <button
                            type="button"
                            onClick={() => {
                              setOutcomeModalItem(req);
                              setSelectedOutcome(req.outcome || 'INTERVIEW');
                              setOutcomeNote(req.outcomeNote || '');
                            }}
                            className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl transition-colors flex items-center gap-1"
                          >
                            <Sparkles className="w-3.5 h-3.5 text-slate-400" />
                            <span>Update Outcome</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
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
                Provide feedback to <strong>{declineModalItem.studentId?.name || 'Candidate'}</strong> on why this referral cannot be processed at this time.
              </p>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Reason / Constructive Feedback
                </label>
                <textarea
                  rows={3}
                  value={declineReason}
                  onChange={(e) => setDeclineReason(e.target.value)}
                  placeholder="e.g. Please build more projects with required technologies."
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
                  <span>Decline Request</span>
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
                  You are marking <strong>{referModalItem.studentId?.name || 'Candidate'}</strong> as officially submitted to your company's referral system.
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
                  placeholder="e.g. Submitted internally via Job Req #10293. Watch for recruiter email."
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
                  className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-colors flex items-center gap-1.5"
                >
                  {actionLoadingId === referModalItem._id && (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  )}
                  <span>Confirm Referral</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Update Outcome Modal */}
      {outcomeModalItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-[#172033]">Update Hiring Outcome</h3>
              <button
                type="button"
                onClick={() => setOutcomeModalItem(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmOutcome} className="mt-4 space-y-4">
              <p className="text-xs text-slate-600">
                Track how the candidate progressed with the company recruiting pipeline.
              </p>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Status Outcome
                </label>
                <select
                  value={selectedOutcome}
                  onChange={(e) => setSelectedOutcome(e.target.value)}
                  className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/20 focus:border-[#4F46E5] bg-white"
                >
                  <option value="INTERVIEW">Interview Scheduled / In Progress</option>
                  <option value="SELECTED">Selected / Offer Made 🎉</option>
                  <option value="NOT_SELECTED">Not Selected / Closed</option>
                  <option value="NO_RESPONSE">No Response from Company</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Outcome Note (Optional)
                </label>
                <textarea
                  rows={3}
                  value={outcomeNote}
                  onChange={(e) => setOutcomeNote(e.target.value)}
                  placeholder="e.g. Cleared technical rounds, final round scheduled next Tuesday."
                  className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/20 focus:border-[#4F46E5]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setOutcomeModalItem(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoadingId === outcomeModalItem._id}
                  className="px-4 py-2 text-xs font-bold text-white bg-[#4F46E5] hover:bg-indigo-700 rounded-xl transition-colors flex items-center gap-1.5"
                >
                  {actionLoadingId === outcomeModalItem._id && (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  )}
                  <span>Save Outcome</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AlumniReferralDetailPage;
