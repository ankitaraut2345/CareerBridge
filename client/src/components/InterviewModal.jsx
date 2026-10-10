import React, { useState, useEffect } from 'react';
import {
  X,
  Calendar,
  Clock,
  Video,
  MapPin,
  User,
  AlertCircle,
  CheckCircle2,
  Trash2,
} from 'lucide-react';

export const InterviewModal = ({
  isOpen,
  onClose,
  application,
  onSave,
  onCancelInterview,
}) => {
  const existing = application?.interview || null;
  const isEditing = !!existing;

  const [round, setRound] = useState(existing?.round || 'Technical Round');
  const [title, setTitle] = useState(existing?.title || '');
  const [date, setDate] = useState(existing?.date || '');
  const [startTime, setStartTime] = useState(existing?.startTime || '');
  const [endTime, setEndTime] = useState(existing?.endTime || '');
  const [mode, setMode] = useState(existing?.mode || 'ONLINE');
  const [meetingLink, setMeetingLink] = useState(existing?.meetingLink || '');
  const [location, setLocation] = useState(existing?.location || '');
  const [interviewer, setInterviewer] = useState(existing?.interviewer || '');
  const [instructions, setInstructions] = useState(existing?.instructions || '');
  const [status, setStatus] = useState(existing?.status || 'SCHEDULED');

  const [submitting, setSubmitting] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (existing) {
      setRound(existing.round || 'Technical Round');
      setTitle(existing.title || '');
      setDate(existing.date || '');
      setStartTime(existing.startTime || '');
      setEndTime(existing.endTime || '');
      setMode(existing.mode || 'ONLINE');
      setMeetingLink(existing.meetingLink || '');
      setLocation(existing.location || '');
      setInterviewer(existing.interviewer || '');
      setInstructions(existing.instructions || '');
      setStatus(existing.status || 'SCHEDULED');
    }
  }, [existing]);

  if (!isOpen || !application) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!date) {
      setError('Please select an interview date.');
      return;
    }
    if (!startTime) {
      setError('Please enter a start time.');
      return;
    }
    if (mode === 'ONLINE' && !meetingLink.trim()) {
      setError('A meeting link is required for online interviews.');
      return;
    }
    if (mode === 'OFFLINE' && !location.trim()) {
      setError('A campus/office location is required for offline interviews.');
      return;
    }

    setSubmitting(true);
    try {
      await onSave(application.id || application._id, {
        round,
        title: title.trim() || `${round} Evaluation`,
        date,
        startTime,
        endTime,
        mode,
        meetingLink: meetingLink.trim(),
        location: location.trim(),
        interviewer: interviewer.trim(),
        instructions: instructions.trim(),
        status,
      });
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to schedule/update interview.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancelInterview = async () => {
    if (!window.confirm('Are you sure you want to cancel this interview?')) return;
    setCancelling(true);
    setError(null);
    try {
      await onCancelInterview(application.id || application._id, 'Cancelled by placement office');
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to cancel interview.');
    } finally {
      setCancelling(false);
    }
  };

  const studentName =
    application.student?.name ||
    application.studentSnapshot?.fullName ||
    'Student Candidate';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-200 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-200 my-8 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#4F46E5] block">
              {isEditing ? 'Manage Interview' : 'Schedule Interview'}
            </span>
            <h3 className="text-lg font-bold text-[#172033]">
              {studentName}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Round & Title */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Interview Round <span className="text-rose-500">*</span>
              </label>
              <select
                value={round}
                onChange={(e) => setRound(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#4F46E5]"
              >
                <option value="Technical Round 1">Technical Round 1</option>
                <option value="Technical Round 2">Technical Round 2</option>
                <option value="Coding Assessment Discussion">Coding Discussion</option>
                <option value="Managerial Round">Managerial Round</option>
                <option value="HR Round">HR Round</option>
                <option value="Final Executive Round">Final Executive Round</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Round Title (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. Data Structures & System Design"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#4F46E5]"
              />
            </div>
          </div>

          {/* Date & Times */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Date <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#4F46E5]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Start Time <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. 10:30 AM"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#4F46E5]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                End Time (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. 11:30 AM"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#4F46E5]"
              />
            </div>
          </div>

          {/* Mode Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Interview Mode <span className="text-rose-500">*</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              {['ONLINE', 'OFFLINE', 'PHONE'].map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setMode(m)}
                  className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all ${
                    mode === m
                      ? 'border-[#4F46E5] bg-indigo-50 text-[#4F46E5]'
                      : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {m === 'ONLINE' ? '🎥 Online' : m === 'OFFLINE' ? '📍 Offline' : '📞 Phone'}
                </button>
              ))}
            </div>
          </div>

          {/* Conditional Meeting Link / Location */}
          {mode === 'ONLINE' ? (
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Meeting Link <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="https://meet.google.com/... or https://teams.microsoft.com/..."
                value={meetingLink}
                onChange={(e) => setMeetingLink(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#4F46E5]"
              />
            </div>
          ) : (
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Interview Location / Room <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Placement Cell, Seminar Hall 2, Ground Floor"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#4F46E5]"
              />
            </div>
          )}

          {/* Interviewer */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Interviewer / Panel Name (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. Engineering Leadership Panel"
              value={interviewer}
              onChange={(e) => setInterviewer(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#4F46E5]"
            />
          </div>

          {/* Instructions */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Candidate Instructions (Optional)
            </label>
            <textarea
              rows={2}
              placeholder="e.g. Please join 10 minutes prior with stable internet and a college ID."
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#4F46E5] resize-none"
            ></textarea>
          </div>

          {/* Status if editing */}
          {isEditing && (
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Interview Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#4F46E5]"
              >
                <option value="SCHEDULED">Scheduled</option>
                <option value="RESCHEDULED">Rescheduled</option>
                <option value="COMPLETED">Completed</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </div>
          )}

          {/* Modal Actions */}
          <div className="flex items-center justify-between gap-3 pt-3 border-t border-slate-100">
            {isEditing && (
              <button
                type="button"
                onClick={handleCancelInterview}
                disabled={cancelling || submitting}
                className="px-3 py-2 rounded-xl bg-rose-50 text-rose-700 hover:bg-rose-100 text-xs font-semibold transition-colors inline-flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Cancel Interview
              </button>
            )}

            <div className="flex items-center gap-2 ml-auto">
              <button
                type="button"
                onClick={onClose}
                disabled={submitting}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 font-semibold text-xs hover:bg-slate-50 transition-colors"
              >
                Close
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-5 py-2 rounded-xl bg-[#4F46E5] hover:bg-[#4338CA] text-white font-semibold text-xs shadow-sm transition-colors"
              >
                {submitting ? 'Saving...' : isEditing ? 'Update Interview' : 'Schedule Interview'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default InterviewModal;
