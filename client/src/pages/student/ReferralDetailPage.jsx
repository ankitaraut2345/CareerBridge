import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Building2,
  Briefcase,
  MapPin,
  ExternalLink,
  Sparkles,
  Send,
  Loader2,
  AlertCircle,
  CheckCircle,
  Info,
  Ban,
  CheckCircle2,
  X,
  User,
  MessageCircle,
} from 'lucide-react';
import {
  getReferralOpportunityById,
  withdrawReferralRequest,
  updateReferralOutcome,
} from '../../services/referralService';
import ReferralStatusBadge, { ReferralOutcomeBadge } from '../../components/ReferralStatusBadge';
import RequestReferralModal from '../../components/RequestReferralModal';

export const ReferralDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [referral, setReferral] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  // Outcome update state
  const [selectedOutcome, setSelectedOutcome] = useState('');
  const [outcomeNote, setOutcomeNote] = useState('');
  const [isUpdatingOutcome, setIsUpdatingOutcome] = useState(false);

  const fetchReferral = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getReferralOpportunityById(id);
      setReferral(res?.data || res || null);
    } catch (err) {
      setError(
        err.response?.data?.message || 'Unable to load referral opportunity details.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReferral();
  }, [id]);

  const handleWithdraw = async (requestId) => {
    if (!window.confirm('Are you sure you want to withdraw your referral request?')) return;
    setActionLoading(true);
    try {
      await withdrawReferralRequest(requestId);
      setToastMessage('Referral request successfully withdrawn.');
      await fetchReferral();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to withdraw request.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleOutcomeSubmit = async (e) => {
    e.preventDefault();
    if (!referral?.existingRequest || !selectedOutcome) return;
    const reqId = referral.existingRequest._id || referral.existingRequest.id;
    setActionLoading(true);
    try {
      await updateReferralOutcome(reqId, {
        outcome: selectedOutcome,
        outcomeNote,
      });
      setToastMessage('Referral outcome updated.');
      setIsUpdatingOutcome(false);
      await fetchReferral();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update outcome.');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#4F46E5] mx-auto mb-3" />
        <p className="text-xs font-semibold text-slate-600">Loading referral details...</p>
      </div>
    );
  }

  if (error || !referral) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12">
        <div className="p-8 bg-rose-50 border border-rose-200 rounded-2xl text-center">
          <AlertCircle className="w-8 h-8 text-rose-500 mx-auto mb-2" />
          <h2 className="text-base font-bold text-rose-800 mb-1">Referral Opportunity Not Found</h2>
          <p className="text-xs text-rose-600 mb-4">{error || 'This referral is unavailable or does not exist.'}</p>
          <button
            onClick={() => navigate('/student/referrals')}
            className="px-4 py-2 text-xs font-semibold text-white bg-rose-600 rounded-xl hover:bg-rose-700"
          >
            Back to Referrals
          </button>
        </div>
      </div>
    );
  }

  const alumni = referral.alumni || {};
  const existing = referral.existingRequest;
  const isExpired = new Date(referral.applicationDeadline).getTime() < Date.now();
  const isAvailable = referral.status === 'OPEN' && referral.referralAvailable && !isExpired;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-900 text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-3 border border-emerald-700 animate-in slide-in-from-bottom duration-200">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
          <span className="text-xs font-semibold">{toastMessage}</span>
          <button
            onClick={() => setToastMessage(null)}
            className="text-emerald-300 hover:text-white ml-2"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Back Button */}
      <button
        onClick={() => navigate('/student/referrals')}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-[#172033] mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Referrals</span>
      </button>

      {/* Header Banner Card */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm mb-6">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center text-[#4F46E5] font-bold shadow-xs flex-shrink-0">
              <Building2 className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  {referral.companyName}
                </span>
                <ReferralStatusBadge status={referral.status} size="sm" />
              </div>
              <h1 className="text-2xl font-bold text-[#172033] mt-0.5">
                {referral.title}
              </h1>
              <p className="text-sm font-semibold text-slate-700 mt-1 flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-[#4F46E5]" />
                <span>{referral.role}</span>
                {referral.department && (
                  <>
                    <span className="text-slate-300">•</span>
                    <span className="text-slate-500">{referral.department}</span>
                  </>
                )}
              </p>
              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mt-2">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  {referral.location}
                </span>
                <span>•</span>
                <span>{referral.workMode}</span>
                <span>•</span>
                <span>{referral.employmentType}</span>
                {referral.salaryOrPackage && (
                  <>
                    <span>•</span>
                    <span className="font-semibold text-slate-800">
                      {referral.salaryOrPackage}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* External Job Link */}
          {referral.jobUrl && (
            <a
              href={referral.jobUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl transition-colors flex items-center gap-1.5 shadow-2xs flex-shrink-0 self-start"
            >
              <span>View Job Posting</span>
              <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
            </a>
          )}
        </div>

        {/* Existing Request Status Banner / Request Button */}
        <div className="mt-8 pt-6 border-t border-slate-100">
          {!existing || existing.status === 'WITHDRAWN' ? (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-[#EEF2FF] to-white p-5 rounded-2xl border border-indigo-100">
              <div>
                <h3 className="text-sm font-bold text-[#172033]">
                  Ready to request this referral?
                </h3>
                <p className="text-xs text-slate-600 mt-0.5">
                  Your profile resume and introductory note will be shared with {alumni.fullName}.
                </p>
              </div>

              {isAvailable ? (
                <button
                  type="button"
                  onClick={() => setIsModalOpen(true)}
                  className="px-6 py-2.5 text-xs font-semibold text-white bg-[#4F46E5] hover:bg-[#4338CA] rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 flex-shrink-0"
                >
                  <Send className="w-4 h-4" />
                  <span>Request Referral</span>
                </button>
              ) : (
                <span className="px-4 py-2 text-xs font-semibold text-slate-400 bg-slate-100 rounded-xl">
                  {isExpired ? 'Application Deadline Passed' : 'Referral Currently Unavailable'}
                </span>
              )}
            </div>
          ) : existing.status === 'PENDING' ? (
            <div className="p-5 rounded-2xl bg-amber-50/80 border border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <ReferralStatusBadge status="PENDING" />
                  <span className="text-xs text-slate-500">
                    Requested on {new Date(existing.requestedAt || existing.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-xs text-amber-900 font-medium">
                  Your referral request has been delivered to {alumni.fullName}. Awaiting their review.
                </p>
                {existing.requestMessage && (
                  <p className="text-xs text-slate-600 italic bg-white/70 p-2.5 rounded-xl border border-amber-200/60 mt-2">
                    "{existing.requestMessage}"
                  </p>
                )}
              </div>
              <button
                type="button"
                disabled={actionLoading}
                onClick={() => handleWithdraw(existing._id || existing.id)}
                className="px-4 py-2 text-xs font-semibold text-rose-700 bg-white border border-rose-200 hover:bg-rose-50 rounded-xl transition-colors flex items-center justify-center gap-1.5 flex-shrink-0 disabled:opacity-50"
              >
                <Ban className="w-3.5 h-3.5" />
                <span>Withdraw Request</span>
              </button>
            </div>
          ) : existing.status === 'ACCEPTED' ? (
            <div className="p-5 rounded-2xl bg-indigo-50/80 border border-indigo-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <ReferralStatusBadge status="ACCEPTED" />
                  <span className="text-xs text-slate-500">
                    Accepted on {new Date(existing.respondedAt || existing.updatedAt).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-xs text-indigo-900 font-medium">
                  {alumni.fullName} has agreed to provide referral support! They will submit your details to {referral.companyName}.
                </p>
                {existing.alumniResponse && (
                  <p className="text-xs text-slate-700 italic bg-white/80 p-2.5 rounded-xl border border-indigo-100 mt-2">
                    Note from alumni: "{existing.alumniResponse}"
                  </p>
                )}
              </div>
              {alumni.id && (
                <button
                  type="button"
                  onClick={() => navigate(`/student/chat?with=${alumni.id}`)}
                  className="px-4 py-2 text-xs font-semibold text-white bg-[#4F46E5] hover:bg-[#4338CA] rounded-xl transition-colors flex items-center justify-center gap-1.5 flex-shrink-0 shadow-sm"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>Message Alumni</span>
                </button>
              )}
            </div>
          ) : existing.status === 'REFERRED' ? (
            <div className="p-5 rounded-2xl bg-emerald-50/80 border border-emerald-200 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <ReferralStatusBadge status="REFERRED" />
                    <span className="text-xs text-slate-500">
                      Referred on {new Date(existing.referredAt || existing.updatedAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-xs text-emerald-900 font-semibold">
                    Congratulations! {alumni.fullName} confirmed your referral was submitted to {referral.companyName}.
                  </p>
                  {existing.alumniResponse && (
                    <p className="text-xs text-slate-700 italic bg-white/80 p-2.5 rounded-xl border border-emerald-200 mt-2">
                      Submission note: "{existing.alumniResponse}"
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <ReferralOutcomeBadge outcome={existing.outcome} />
                  {alumni.id && (
                    <button
                      type="button"
                      onClick={() => navigate(`/student/chat?with=${alumni.id}`)}
                      className="px-3 py-1.5 text-xs font-semibold text-white bg-[#4F46E5] hover:bg-[#4338CA] rounded-xl transition-colors flex items-center gap-1.5"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span>Message</span>
                    </button>
                  )}
                  <button
                    onClick={() => setIsUpdatingOutcome(!isUpdatingOutcome)}
                    className="px-3 py-1.5 text-xs font-semibold text-[#4F46E5] bg-white border border-indigo-200 rounded-xl hover:bg-indigo-50"
                  >
                    Update Outcome
                  </button>
                </div>
              </div>

              {/* Outcome updater form */}
              {isUpdatingOutcome && (
                <form onSubmit={handleOutcomeSubmit} className="pt-3 border-t border-emerald-200/60 flex flex-col sm:flex-row items-center gap-2">
                  <select
                    value={selectedOutcome}
                    onChange={(e) => setSelectedOutcome(e.target.value)}
                    required
                    className="text-xs py-1.5 px-3 bg-white border border-slate-300 rounded-xl text-slate-800"
                  >
                    <option value="">Select Outcome Stage</option>
                    <option value="INTERVIEW">Interview Scheduled</option>
                    <option value="SELECTED">Selected / Hired</option>
                    <option value="NOT_SELECTED">Not Selected</option>
                    <option value="NO_RESPONSE">No Company Response</option>
                  </select>
                  <input
                    type="text"
                    value={outcomeNote}
                    onChange={(e) => setOutcomeNote(e.target.value)}
                    placeholder="Optional note (e.g., cleared round 1)"
                    className="flex-1 text-xs py-1.5 px-3 bg-white border border-slate-300 rounded-xl text-slate-800"
                  />
                  <button
                    type="submit"
                    disabled={actionLoading}
                    className="px-4 py-1.5 text-xs font-semibold text-white bg-[#4F46E5] rounded-xl hover:bg-[#4338CA] disabled:opacity-50"
                  >
                    Save
                  </button>
                </form>
              )}
            </div>
          ) : existing.status === 'REJECTED' ? (
            <div className="p-5 rounded-2xl bg-rose-50/80 border border-rose-200">
              <div className="flex items-center gap-2 mb-1">
                <ReferralStatusBadge status="REJECTED" />
                <span className="text-xs text-slate-500">
                  Declined on {new Date(existing.respondedAt || existing.updatedAt).toLocaleDateString()}
                </span>
              </div>
              <p className="text-xs text-rose-900 font-medium">
                Alumni was unable to provide a referral for this position.
                {existing.alumniResponse && (
                  <span className="block italic text-slate-700 mt-1">
                    Note: "{existing.alumniResponse}"
                  </span>
                )}
              </p>
            </div>
          ) : null}
        </div>
      </div>

      {/* Two Column Details Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Job Description & Skills */}
        <div className="lg:col-span-2 space-y-6">
          {/* Job Description */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <h2 className="text-sm font-bold text-[#172033] mb-3">Job &amp; Role Overview</h2>
            <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-line">
              {referral.description}
            </p>
          </div>

          {/* Required Skills */}
          {referral.requiredSkills && referral.requiredSkills.length > 0 && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <h2 className="text-sm font-bold text-[#172033] mb-3">
                Required Technical Skills
              </h2>
              <div className="flex flex-wrap gap-2">
                {referral.requiredSkills.map((skill, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 rounded-xl text-xs font-semibold bg-[#EEF2FF] text-[#4F46E5] border border-indigo-100"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Preferred Skills */}
          {referral.preferredSkills && referral.preferredSkills.length > 0 && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <h2 className="text-sm font-bold text-[#172033] mb-3">
                Preferred / Bonus Skills
              </h2>
              <div className="flex flex-wrap gap-2">
                {referral.preferredSkills.map((skill, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 rounded-xl text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Referral Instructions */}
          {referral.referralInstructions && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <h2 className="text-sm font-bold text-[#172033] mb-2">
                Alumni's Referral Instructions
              </h2>
              <p className="text-xs text-slate-600 leading-relaxed italic">
                "{referral.referralInstructions}"
              </p>
            </div>
          )}

          {/* Hiring Disclaimer */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex items-start gap-3 text-xs text-slate-500 leading-relaxed">
            <Info className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
            <span>
              <strong>Recruitment Notice:</strong> An employee referral provides internal visibility for your profile at {referral.companyName}, but does not guarantee interview shortlisting or hiring. All final evaluations are conducted by company recruiters.
            </span>
          </div>
        </div>

        {/* Right Column: Alumni Profile & Match Breakdown */}
        <div className="space-y-6">
          {/* Alumni Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">
              Referring Alumni
            </h3>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#F5F3FF] to-[#EDE9FE] text-[#7C3AED] font-bold text-base flex items-center justify-center border border-violet-100">
                {alumni.fullName ? alumni.fullName.charAt(0) : <User className="w-5 h-5" />}
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h4 className="text-sm font-bold text-[#172033]">
                    {alumni.fullName || 'Verified Alumnus'}
                  </h4>
                  <CheckCircle className="w-3.5 h-3.5 text-[#7C3AED]" title="Verified Alumni" />
                </div>
                <p className="text-xs text-slate-600 font-medium">
                  {alumni.currentRole} @ {alumni.currentCompany}
                </p>
              </div>
            </div>

            <div className="space-y-1.5 text-xs text-slate-500 border-t border-slate-100 pt-3">
              {alumni.department && (
                <p>Department: <span className="font-medium text-slate-700">{alumni.department}</span></p>
              )}
              {alumni.graduationYear && (
                <p>Graduation: <span className="font-medium text-slate-700">Class of {alumni.graduationYear}</span></p>
              )}
              {alumni.yearsOfExperience > 0 && (
                <p>Experience: <span className="font-medium text-slate-700">{alumni.yearsOfExperience} Years</span></p>
              )}
            </div>
          </div>

          {/* Match Breakdown Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-xl bg-[#EEF2FF] text-[#4F46E5] flex items-center justify-center">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-[#172033]">Profile Match Breakdown</h3>
                <span className="text-[11px] text-slate-400">Deterministic Scoring</span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 text-center mb-4">
              <span className="text-3xl font-extrabold text-[#4F46E5]">
                {referral.matchScore || 60}%
              </span>
              <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mt-1">
                {referral.matchLabel || 'Profile Match'}
              </p>
            </div>

            {referral.matchReasons && referral.matchReasons.length > 0 ? (
              <div className="space-y-2">
                {referral.matchReasons.map((reason, idx) => (
                  <div
                    key={idx}
                    className="text-xs text-slate-700 font-medium flex items-start gap-2 bg-slate-50/50 p-2 rounded-lg border border-slate-100"
                  >
                    <span className="text-[#4F46E5] font-bold">✓</span>
                    <span>{reason}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-500">
                Matched against your current student profile qualifications.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Request Modal */}
      {isModalOpen && (
        <RequestReferralModal
          referral={referral}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSuccess={() => {
            setToastMessage('Referral request successfully submitted!');
            fetchReferral();
          }}
        />
      )}
    </div>
  );
};

export default ReferralDetailPage;
