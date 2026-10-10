import React from 'react';
import {
  Calendar,
  Clock,
  Video,
  MapPin,
  Phone,
  ExternalLink,
  User,
  Info,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Edit,
} from 'lucide-react';

/**
 * CareerBridge Interview Card Component
 * Presents full scheduled interview details clearly for students and coordinators.
 */
export const InterviewCard = ({ interview, onEdit = null, isTpo = false }) => {
  if (!interview) return null;

  const {
    round = 'Technical Round',
    title = '',
    date = '',
    startTime = '',
    endTime = '',
    mode = 'ONLINE',
    meetingLink = '',
    location = '',
    interviewer = '',
    instructions = '',
    status = 'SCHEDULED',
  } = interview;

  const formattedDate = date
    ? new Date(date).toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : 'Date TBA';

  const getInterviewStatusBadge = () => {
    switch (status) {
      case 'SCHEDULED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-[#4F46E5] border border-indigo-200">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Scheduled
          </span>
        );
      case 'RESCHEDULED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200">
            <Clock className="w-3.5 h-3.5" />
            Rescheduled
          </span>
        );
      case 'COMPLETED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Completed
          </span>
        );
      case 'CANCELLED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
            <XCircle className="w-3.5 h-3.5" />
            Cancelled
          </span>
        );
      default:
        return <span>{status}</span>;
    }
  };

  return (
    <div className="bg-gradient-to-br from-indigo-50/60 to-purple-50/40 rounded-2xl border border-indigo-100 p-6 shadow-sm space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-indigo-100/80">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-[#4F46E5] text-white flex items-center justify-center shadow-sm">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[#4F46E5]">
                {round}
              </span>
              {getInterviewStatusBadge()}
            </div>
            <h3 className="text-lg font-bold text-[#172033] mt-0.5">
              {title || `${round} Evaluation`}
            </h3>
          </div>
        </div>

        {isTpo && onEdit && (
          <button
            type="button"
            onClick={onEdit}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-700 hover:text-[#4F46E5] hover:border-indigo-200 shadow-sm transition-colors"
          >
            <Edit className="w-3.5 h-3.5" />
            Edit Interview
          </button>
        )}
      </div>

      {/* Primary Details Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Date */}
        <div className="bg-white rounded-xl p-3.5 border border-indigo-50 shadow-xs flex items-center gap-3">
          <Calendar className="w-5 h-5 text-[#4F46E5] flex-shrink-0" />
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Interview Date
            </span>
            <span className="text-xs font-bold text-[#172033] block">{formattedDate}</span>
          </div>
        </div>

        {/* Time */}
        <div className="bg-white rounded-xl p-3.5 border border-indigo-50 shadow-xs flex items-center gap-3">
          <Clock className="w-5 h-5 text-[#7C3AED] flex-shrink-0" />
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Time
            </span>
            <span className="text-xs font-bold text-[#172033] block">
              {startTime} {endTime ? `– ${endTime}` : ''}
            </span>
          </div>
        </div>

        {/* Mode */}
        <div className="bg-white rounded-xl p-3.5 border border-indigo-50 shadow-xs flex items-center gap-3">
          {mode === 'ONLINE' ? (
            <Video className="w-5 h-5 text-[#0284C7] flex-shrink-0" />
          ) : mode === 'PHONE' ? (
            <Phone className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          ) : (
            <MapPin className="w-5 h-5 text-amber-600 flex-shrink-0" />
          )}
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Mode
            </span>
            <span className="text-xs font-bold text-[#172033] block">{mode}</span>
          </div>
        </div>
      </div>

      {/* Mode Specific Links / Location */}
      {mode === 'ONLINE' && meetingLink && (
        <div className="bg-white rounded-xl p-4 border border-indigo-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
          <div className="space-y-0.5">
            <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <Video className="w-4 h-4 text-[#4F46E5]" />
              Online Meeting Link
            </span>
            <span className="text-[11px] text-slate-500 font-mono truncate max-w-md block">
              {meetingLink}
            </span>
          </div>

          <a
            href={meetingLink.startsWith('http') ? meetingLink : `https://${meetingLink}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#4F46E5] hover:bg-[#4338CA] text-white text-xs font-bold shadow-sm transition-colors"
          >
            Join Interview
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      )}

      {mode === 'OFFLINE' && location && (
        <div className="bg-white rounded-xl p-4 border border-indigo-100 flex items-start gap-3 shadow-xs">
          <MapPin className="w-5 h-5 text-rose-500 flex-shrink-0 mt-0.5" />
          <div>
            <span className="text-xs font-bold text-slate-800 block">Reporting Location</span>
            <p className="text-xs text-slate-600 mt-0.5 font-medium leading-relaxed">{location}</p>
          </div>
        </div>
      )}

      {/* Interviewer */}
      {interviewer && (
        <div className="flex items-center gap-2 text-xs text-slate-700 bg-white/70 px-3.5 py-2 rounded-xl border border-indigo-50">
          <User className="w-3.5 h-3.5 text-slate-400" />
          <span>
            Interviewer / Panel: <strong>{interviewer}</strong>
          </span>
        </div>
      )}

      {/* Candidate Instructions */}
      {instructions && (
        <div className="bg-white rounded-xl p-4 border border-indigo-100 space-y-1 shadow-xs">
          <span className="text-xs font-bold text-[#172033] flex items-center gap-1.5">
            <Info className="w-4 h-4 text-[#4F46E5]" />
            Candidate Instructions
          </span>
          <p className="text-xs text-slate-600 leading-relaxed pl-5 whitespace-pre-line">
            {instructions}
          </p>
        </div>
      )}
    </div>
  );
};

export default InterviewCard;
