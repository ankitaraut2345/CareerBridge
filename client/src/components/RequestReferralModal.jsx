import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  X,
  Send,
  Loader2,
  AlertCircle,
  FileText,
  Building2,
  Sparkles,
  Info,
  CheckCircle2,
} from 'lucide-react';
import { submitReferralRequest } from '../services/referralService';

export const RequestReferralModal = ({
  referral,
  hasResume = true,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [requestMessage, setRequestMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen || !referral) return null;

  const targetId = referral._id || referral.id;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!hasResume) {
      setError('Please upload your resume to your Student Profile first.');
      return;
    }

    if (requestMessage.trim().length > 1000) {
      setError('Request note cannot exceed 1000 characters.');
      return;
    }

    setLoading(true);
    try {
      const res = await submitReferralRequest(targetId, {
        requestMessage: requestMessage.trim(),
      });
      if (onSuccess) {
        onSuccess(res.data);
      }
      onClose();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          'Unable to submit referral request. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-lg w-full border border-slate-200 shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center text-[#4F46E5] font-bold">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#172033] leading-tight">
                Request Alumni Referral
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                for <span className="font-semibold text-slate-800">{referral.role}</span> at {referral.companyName}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-500 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Referral Instructions from Alumni if available */}
          {referral.referralInstructions && (
            <div className="p-3 rounded-xl bg-violet-50/70 border border-violet-100 text-xs text-violet-900">
              <span className="font-bold block mb-1">
                Alumni's Referral Instructions:
              </span>
              <p className="italic">"{referral.referralInstructions}"</p>
            </div>
          )}

          {/* Resume Snapshot Status */}
          <div className="p-3 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <FileText className="w-4 h-4 text-[#4F46E5]" />
              <div>
                <span className="text-xs font-semibold text-slate-800 block">
                  Profile Resume
                </span>
                <span className="text-[11px] text-slate-500">
                  {hasResume
                    ? 'Current verified resume will be attached to this referral request'
                    : 'No resume found in your student profile'}
                </span>
              </div>
            </div>
            {hasResume ? (
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                <CheckCircle2 className="w-3 h-3" /> Attached
              </span>
            ) : (
              <Link
                to="/student"
                className="text-xs font-bold text-[#4F46E5] hover:underline"
              >
                Upload Resume
              </Link>
            )}
          </div>

          {/* Request Message */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label
                htmlFor="requestMessage"
                className="block text-xs font-semibold text-slate-700 uppercase tracking-wider"
              >
                Message to Alumni (Why are you a good fit?)
              </label>
              <span className="text-[11px] text-slate-400">
                {requestMessage.length}/1000
              </span>
            </div>
            <textarea
              id="requestMessage"
              rows={4}
              maxLength={1000}
              value={requestMessage}
              onChange={(e) => setRequestMessage(e.target.value)}
              placeholder="Hi! I have built projects using React and Node.js and have solved 250+ DSA problems. I would greatly appreciate your referral for this role..."
              className="w-full px-3.5 py-2.5 text-xs text-slate-900 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#4F46E5] focus:border-transparent outline-none transition-all placeholder:text-slate-400 resize-none bg-slate-50/50 focus:bg-white"
            />
          </div>

          {/* Mandatory Hiring Disclaimer */}
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-[11px] text-slate-500 flex items-start gap-2 leading-relaxed">
            <Info className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
            <span>
              <strong>Important:</strong> Referral support does not guarantee an interview or selection. Final recruitment decisions are made solely by {referral.companyName}.
            </span>
          </div>

          {/* Footer Actions */}
          <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !hasResume}
              className="px-5 py-2 text-xs font-semibold text-white bg-[#4F46E5] hover:bg-[#4338CA] rounded-xl transition-all shadow-xs flex items-center gap-1.5 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Submitting...</span>
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>Submit Request</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RequestReferralModal;
