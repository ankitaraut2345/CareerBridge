import React, { useState } from 'react';
import { X, Send, Loader2, AlertCircle, CheckCircle2, User, Sparkles } from 'lucide-react';
import { requestMentorship } from '../services/mentorshipService';

export const RequestMentorshipModal = ({ mentor, isOpen, onClose, onSuccess }) => {
  const [requestMessage, setRequestMessage] = useState('');
  const [selectedAreas, setSelectedAreas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen || !mentor) return null;

  const mentorId = mentor.userId || mentor.id;
  const availableAreas = mentor.mentorshipAreas || [];

  const toggleArea = (area) => {
    setSelectedAreas((prev) =>
      prev.includes(area) ? prev.filter((a) => a !== area) : [...prev, area]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (requestMessage.trim().length > 1000) {
      setError('Request note cannot exceed 1000 characters.');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        alumniId: mentorId,
        requestMessage: requestMessage.trim(),
        mentorshipAreas: selectedAreas,
      };
      const res = await requestMentorship(payload);
      if (onSuccess) {
        onSuccess(res.data);
      }
      onClose();
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        'Unable to submit mentorship request. Please try again.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-lg w-full border border-slate-200 shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-100 flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#EEF2FF] text-[#4F46E5] font-bold text-sm flex items-center justify-center border border-indigo-100">
              {mentor.fullName
                ? mentor.fullName
                    .split(' ')
                    .map((n) => n[0])
                    .slice(0, 2)
                    .join('')
                : <User className="w-5 h-5" />}
            </div>
            <div>
              <h2 className="text-base font-bold text-[#172033] leading-tight">
                Request Mentorship
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                with <span className="font-semibold text-slate-700">{mentor.fullName}</span> ({mentor.currentRole} @ {mentor.currentCompany})
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

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-500 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Area of Guidance Selection */}
          {availableAreas.length > 0 && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                What areas would you like guidance on?
              </label>
              <div className="flex flex-wrap gap-2">
                {availableAreas.map((area) => {
                  const isSelected = selectedAreas.includes(area);
                  return (
                    <button
                      key={area}
                      type="button"
                      onClick={() => toggleArea(area)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${
                        isSelected
                          ? 'bg-[#EEF2FF] text-[#4F46E5] border-[#4F46E5] shadow-xs'
                          : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      {isSelected ? '✓ ' : '+ '}
                      {area}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Request Message */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label htmlFor="requestMessage" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Introduction / Message to Mentor
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
              placeholder="Hi! I'm interested in learning from your experience in software engineering and would appreciate your guidance on campus recruitment and interview preparation..."
              className="w-full px-3.5 py-2.5 text-xs text-slate-900 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#4F46E5] focus:border-transparent outline-none transition-all placeholder:text-slate-400 resize-none bg-slate-50/50 focus:bg-white"
            />
            <p className="text-[11px] text-slate-500 mt-1">
              Share your current goals, questions, or specific areas where you seek advice.
            </p>
          </div>

          {/* Info note */}
          <div className="bg-slate-50 rounded-xl p-3 border border-slate-200/80 text-[11px] text-slate-600 flex items-start gap-2">
            <Sparkles className="w-4 h-4 text-[#4F46E5] flex-shrink-0 mt-0.5" />
            <span>
              Once sent, the alumnus will receive your request and profile. You can track status and response in your Mentorship tab.
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
              disabled={loading}
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
                  <span>Send Request</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RequestMentorshipModal;
