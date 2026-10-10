import React, { useState } from 'react';
import { X, CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react';
import StatusBadge from './StatusBadge';

const ALLOWED_TRANSITIONS = {
  APPLIED: ['SHORTLISTED', 'REJECTED', 'WITHDRAWN'],
  SHORTLISTED: ['INTERVIEW', 'REJECTED', 'WAITLISTED', 'WITHDRAWN'],
  INTERVIEW: ['SELECTED', 'REJECTED', 'WAITLISTED', 'INTERVIEW', 'WITHDRAWN'],
  WAITLISTED: ['SELECTED', 'REJECTED', 'INTERVIEW', 'WITHDRAWN'],
  SELECTED: [],
  REJECTED: [],
  WITHDRAWN: [],
};

export const UpdateStatusModal = ({
  isOpen,
  onClose,
  application,
  onSuccess,
}) => {
  const currentStatus = (application?.status || 'APPLIED').toUpperCase();
  const allowedOptions = ALLOWED_TRANSITIONS[currentStatus] || [];

  const [selectedStatus, setSelectedStatus] = useState(
    allowedOptions.length > 0 ? allowedOptions[0] : ''
  );
  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  React.useEffect(() => {
    if (allowedOptions.length > 0) {
      setSelectedStatus(allowedOptions[0]);
    }
  }, [application?.status]);

  if (!isOpen || !application) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedStatus) return;

    setSubmitting(true);
    setError(null);
    try {
      await onSuccess(application.id || application._id, selectedStatus, note);
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to update application status.');
    } finally {
      setSubmitting(false);
    }
  };

  const studentName =
    application.student?.name ||
    application.studentSnapshot?.fullName ||
    'Student Candidate';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200 space-y-5">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
              Recruitment Action
            </span>
            <h3 className="text-lg font-bold text-[#172033]">Update Application Status</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Candidate & Current Status Summary */}
        <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-800">{studentName}</span>
            <StatusBadge status={currentStatus} size="sm" />
          </div>
          <p className="text-[11px] text-slate-500">
            Select the next recruitment stage. The system records an auditable timestamp and note for candidate tracking.
          </p>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {allowedOptions.length === 0 ? (
          <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-800 text-center">
            This application is currently in <strong>{currentStatus}</strong>, which is a terminal stage. No further transitions are available.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                New Recruitment Stage <span className="text-rose-500">*</span>
              </label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs sm:text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#4F46E5] focus:bg-white"
              >
                {allowedOptions.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt === 'SHORTLISTED'
                      ? 'Shortlisted for Assessment / Round'
                      : opt === 'INTERVIEW'
                      ? 'Interview Stage'
                      : opt === 'SELECTED'
                      ? 'Selected 🎉'
                      : opt === 'WAITLISTED'
                      ? 'Waitlisted'
                      : opt === 'REJECTED'
                      ? 'Not Selected'
                      : opt}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Status Note / Feedback (Optional)
              </label>
              <textarea
                rows={3}
                placeholder="e.g. Cleared online coding assessment; advancing to interview round..."
                value={note}
                onChange={(e) => setNote(e.target.value)}
                maxLength={1000}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#4F46E5] focus:bg-white resize-none"
              ></textarea>
              <span className="text-[10px] text-slate-400 block text-right mt-1">
                {note.length} / 1000 characters
              </span>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                disabled={submitting}
                className="w-1/2 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-semibold text-xs hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting || !selectedStatus}
                className="w-1/2 py-2.5 rounded-xl bg-[#4F46E5] hover:bg-[#4338CA] text-white font-semibold text-xs shadow-sm transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50"
              >
                {submitting ? 'Updating...' : 'Confirm Status'}
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default UpdateStatusModal;
