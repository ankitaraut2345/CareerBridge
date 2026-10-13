import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Building2,
  Clock,
  Briefcase,
  ExternalLink,
  Ban,
  FileText,
  Loader2,
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  Search,
} from 'lucide-react';
import {
  getMyReferralRequests,
  withdrawReferralRequest,
  updateReferralOutcome,
} from '../../services/referralService';
import ReferralStatusBadge, { ReferralOutcomeBadge } from '../../components/ReferralStatusBadge';

export const MyReferralRequestsPage = () => {
  const navigate = useNavigate();

  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('ALL');
  const [actionLoadingId, setActionLoadingId] = useState(null);

  // Outcome update state
  const [updatingOutcomeId, setUpdatingOutcomeId] = useState(null);
  const [selectedOutcome, setSelectedOutcome] = useState('');
  const [outcomeNote, setOutcomeNote] = useState('');

  const fetchRequests = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getMyReferralRequests();
      setRequests(res?.data || (Array.isArray(res) ? res : []));
    } catch (err) {
      setError(
        err.response?.data?.message || 'Failed to load your referral requests.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleWithdraw = async (id) => {
    if (!window.confirm('Are you sure you want to withdraw this referral request?')) return;
    setActionLoadingId(id);
    try {
      await withdrawReferralRequest(id);
      await fetchRequests();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to withdraw request.');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleOutcomeSubmit = async (e, id) => {
    e.preventDefault();
    if (!selectedOutcome) return;
    setActionLoadingId(id);
    try {
      await updateReferralOutcome(id, {
        outcome: selectedOutcome,
        outcomeNote,
      });
      setUpdatingOutcomeId(null);
      setSelectedOutcome('');
      setOutcomeNote('');
      await fetchRequests();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update outcome.');
    } finally {
      setActionLoadingId(null);
    }
  };

  const counts = {
    ALL: requests.length,
    PENDING: requests.filter((r) => r.status === 'PENDING').length,
    ACCEPTED: requests.filter((r) => r.status === 'ACCEPTED').length,
    REFERRED: requests.filter((r) => r.status === 'REFERRED').length,
    COMPLETED: requests.filter((r) => r.status === 'COMPLETED').length,
  };

  const filtered = requests.filter((r) => {
    if (activeTab === 'PENDING') return r.status === 'PENDING';
    if (activeTab === 'ACCEPTED') return r.status === 'ACCEPTED';
    if (activeTab === 'REFERRED') return r.status === 'REFERRED';
    if (activeTab === 'COMPLETED') return r.status === 'COMPLETED';
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-8 border-b border-slate-200">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-[#EEF2FF] text-[#4F46E5] mb-2">
            <Building2 className="w-3.5 h-3.5" />
            Referral Tracking
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#172033] tracking-tight">
            My Referral Requests
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Track your outgoing requests, alumni feedback, and external company hiring progress.
          </p>
        </div>

        <button
          onClick={() => navigate('/student/referrals')}
          className="px-5 py-2.5 text-xs font-semibold text-white bg-[#4F46E5] hover:bg-[#4338CA] rounded-xl transition-all shadow-xs flex items-center gap-2 flex-shrink-0"
        >
          <Search className="w-4 h-4" />
          <span>Explore More Referrals</span>
        </button>
      </div>

      {/* Summary Metrics */}
      <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
            Total Requests
          </span>
          <span className="text-2xl font-extrabold text-[#172033] mt-1 block">
            {counts.ALL}
          </span>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
          <span className="text-[11px] font-semibold text-amber-600 uppercase tracking-wider block">
            Pending Review
          </span>
          <span className="text-2xl font-extrabold text-amber-700 mt-1 block">
            {counts.PENDING}
          </span>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
          <span className="text-[11px] font-semibold text-indigo-600 uppercase tracking-wider block">
            Accepted
          </span>
          <span className="text-2xl font-extrabold text-[#4F46E5] mt-1 block">
            {counts.ACCEPTED}
          </span>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
          <span className="text-[11px] font-semibold text-emerald-600 uppercase tracking-wider block">
            Referred to Company
          </span>
          <span className="text-2xl font-extrabold text-emerald-700 mt-1 block">
            {counts.REFERRED}
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="mt-8 flex items-center gap-2 border-b border-slate-200 pb-3">
        {[
          { key: 'ALL', label: 'All', count: counts.ALL },
          { key: 'PENDING', label: 'Pending', count: counts.PENDING },
          { key: 'ACCEPTED', label: 'Accepted', count: counts.ACCEPTED },
          { key: 'REFERRED', label: 'Referred', count: counts.REFERRED },
          { key: 'COMPLETED', label: 'Completed', count: counts.COMPLETED },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
              activeTab === tab.key
                ? 'bg-[#EEF2FF] text-[#4F46E5] border border-indigo-200 shadow-2xs'
                : 'text-slate-600 hover:text-[#172033] hover:bg-slate-100'
            }`}
          >
            <span>{tab.label}</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                activeTab === tab.key
                  ? 'bg-[#4F46E5] text-white'
                  : 'bg-slate-200/80 text-slate-600'
              }`}
            >
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* List Content */}
      <div className="mt-6 space-y-4">
        {loading ? (
          <div className="p-16 flex flex-col items-center justify-center bg-white rounded-2xl border border-slate-200">
            <Loader2 className="w-8 h-8 animate-spin text-[#4F46E5] mb-3" />
            <p className="text-xs font-semibold text-slate-600">Loading your referral requests...</p>
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
        ) : filtered.length === 0 ? (
          <div className="p-16 bg-white rounded-2xl border border-slate-200 text-center">
            <Building2 className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-[#172033] mb-1">
              No referral requests in this tab
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mb-4">
              Browse open alumni referral opportunities and submit requests to boost your job applications.
            </p>
            <button
              onClick={() => navigate('/student/referrals')}
              className="px-5 py-2 text-xs font-semibold text-white bg-[#4F46E5] rounded-xl hover:bg-[#4338CA] transition-colors"
            >
              Browse Referral Opportunities
            </button>
          </div>
        ) : (
          filtered.map((item) => {
            const opp = item.opportunity || {};
            const alumni = item.alumni || {};
            const isProcessing = actionLoadingId === item._id;

            return (
              <div
                key={item._id}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:border-slate-300 transition-all flex flex-col md:flex-row md:items-center justify-between gap-5"
              >
                {/* Left: Role, Company & Request Note */}
                <div className="space-y-2 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                      {opp.companyName || 'Target Company'}
                    </span>
                    <span className="text-slate-300">•</span>
                    <h3 className="text-base font-bold text-[#172033]">
                      {opp.role || opp.title || 'Referral Position'}
                    </h3>
                    <ReferralStatusBadge status={item.status} size="sm" />
                    {item.status === 'REFERRED' && (
                      <ReferralOutcomeBadge outcome={item.outcome} />
                    )}
                  </div>

                  <p className="text-xs text-slate-500 font-medium">
                    Referred by <span className="text-slate-700 font-semibold">{alumni.fullName}</span> ({alumni.currentRole} @ {alumni.currentCompany})
                  </p>

                  {/* Request Message */}
                  {item.requestMessage && (
                    <p className="text-xs text-slate-600 italic bg-slate-50 p-2.5 rounded-xl border border-slate-100 max-w-xl">
                      "{item.requestMessage}"
                    </p>
                  )}

                  {/* Alumni Response Message */}
                  {item.alumniResponse && (
                    <p className="text-xs text-indigo-900 bg-indigo-50/70 p-2.5 rounded-xl border border-indigo-100 max-w-xl">
                      Alumni response: "{item.alumniResponse}"
                    </p>
                  )}

                  {/* Meta / Timestamps */}
                  <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-400 pt-1">
                    <span>Requested: {new Date(item.requestedAt || item.createdAt).toLocaleDateString()}</span>
                    {item.referredAt && (
                      <>
                        <span>•</span>
                        <span className="text-emerald-700 font-semibold">
                          Referred: {new Date(item.referredAt).toLocaleDateString()}
                        </span>
                      </>
                    )}
                    {item.resumeUrl && (
                      <>
                        <span>•</span>
                        <a
                          href={item.resumeUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[#4F46E5] hover:underline flex items-center gap-0.5"
                        >
                          <FileText className="w-3 h-3" />
                          <span>Submitted Resume</span>
                        </a>
                      </>
                    )}
                  </div>

                  {/* Outcome update panel if REFERRED */}
                  {item.status === 'REFERRED' && updatingOutcomeId === item._id && (
                    <form
                      onSubmit={(e) => handleOutcomeSubmit(e, item._id)}
                      className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-center gap-2 max-w-xl"
                    >
                      <select
                        value={selectedOutcome}
                        onChange={(e) => setSelectedOutcome(e.target.value)}
                        required
                        className="text-xs py-1.5 px-3 bg-white border border-slate-300 rounded-xl text-slate-800"
                      >
                        <option value="">Update Recruitment Outcome</option>
                        <option value="INTERVIEW">Interview Scheduled</option>
                        <option value="SELECTED">Selected / Hired</option>
                        <option value="NOT_SELECTED">Not Selected</option>
                        <option value="NO_RESPONSE">No Company Response</option>
                      </select>
                      <input
                        type="text"
                        value={outcomeNote}
                        onChange={(e) => setOutcomeNote(e.target.value)}
                        placeholder="Optional note"
                        className="flex-1 text-xs py-1.5 px-3 bg-white border border-slate-300 rounded-xl"
                      />
                      <button
                        type="submit"
                        disabled={isProcessing}
                        className="px-3.5 py-1.5 text-xs font-semibold text-white bg-[#4F46E5] rounded-xl"
                      >
                        Save
                      </button>
                      <button
                        type="button"
                        onClick={() => setUpdatingOutcomeId(null)}
                        className="px-2 py-1 text-xs text-slate-500"
                      >
                        Cancel
                      </button>
                    </form>
                  )}
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-2 flex-shrink-0 self-end md:self-center">
                  {item.status === 'REFERRED' && updatingOutcomeId !== item._id && (
                    <button
                      onClick={() => {
                        setUpdatingOutcomeId(item._id);
                        setSelectedOutcome(item.outcome || 'PENDING');
                      }}
                      className="px-3 py-2 text-xs font-semibold text-[#4F46E5] bg-white border border-indigo-200 hover:bg-indigo-50 rounded-xl transition-colors shadow-2xs"
                    >
                      Update Outcome
                    </button>
                  )}

                  {item.status === 'PENDING' && (
                    <button
                      disabled={isProcessing}
                      onClick={() => handleWithdraw(item._id)}
                      className="px-3.5 py-2 text-xs font-semibold text-rose-700 bg-white border border-rose-200 hover:bg-rose-50 rounded-xl transition-colors flex items-center gap-1 shadow-2xs disabled:opacity-50"
                    >
                      <Ban className="w-3.5 h-3.5" />
                      <span>Withdraw</span>
                    </button>
                  )}

                  <button
                    onClick={() =>
                      navigate(
                        `/student/referrals/${item.referralOpportunityId || opp.id || opp._id}`
                      )
                    }
                    className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl transition-colors flex items-center gap-1 shadow-2xs"
                  >
                    <span>View Opportunity</span>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default MyReferralRequestsPage;
