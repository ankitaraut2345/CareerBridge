import React from 'react';
import {
  CheckCircle2,
  Clock,
  Calendar,
  Sparkles,
  XCircle,
  AlertCircle,
  RotateCcw,
  User,
  MessageSquare,
} from 'lucide-react';

/**
 * CareerBridge Application Timeline Component
 * Renders the recruitment stage progress bar and detailed event audit trail.
 */
export const ApplicationTimeline = ({ currentStatus = 'APPLIED', history = [] }) => {
  const normStatus = (currentStatus || '').toUpperCase();

  // Define standard linear progression milestones
  const milestones = [
    { key: 'APPLIED', label: 'Applied' },
    { key: 'SHORTLISTED', label: 'Shortlisted' },
    { key: 'INTERVIEW', label: 'Interview' },
    { key: 'RESULT', label: 'Decision' },
  ];

  const getMilestoneIndex = (status) => {
    switch (status) {
      case 'APPLIED':
        return 0;
      case 'SHORTLISTED':
        return 1;
      case 'INTERVIEW':
        return 2;
      case 'SELECTED':
      case 'REJECTED':
      case 'WAITLISTED':
        return 3;
      case 'WITHDRAWN':
        return -1;
      default:
        return 0;
    }
  };

  const currentIndex = getMilestoneIndex(normStatus);

  const getResultLabel = () => {
    if (normStatus === 'SELECTED') return 'Selected 🎉';
    if (normStatus === 'REJECTED') return 'Not Selected';
    if (normStatus === 'WAITLISTED') return 'Waitlisted';
    return 'Decision';
  };

  return (
    <div className="space-y-6">
      {/* ── Visual Progression Step Bar ── */}
      {normStatus !== 'WITHDRAWN' ? (
        <div className="bg-slate-50/80 rounded-2xl p-6 border border-slate-200/80">
          <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-6">
            Recruitment Journey
          </h4>

          <div className="relative flex items-center justify-between">
            {/* Connecting progress line */}
            <div className="absolute left-6 right-6 top-1/2 -translate-y-1/2 h-1 bg-slate-200 -z-0">
              <div
                className="h-full bg-[#4F46E5] transition-all duration-500"
                style={{
                  width: `${Math.min(100, Math.max(0, (currentIndex / (milestones.length - 1)) * 100))}%`,
                }}
              ></div>
            </div>

            {milestones.map((step, idx) => {
              const isPast = idx < currentIndex;
              const isCurrent = idx === currentIndex;
              const isFuture = idx > currentIndex;

              let circleClasses = 'bg-white border-2 border-slate-300 text-slate-400';
              if (isPast) {
                circleClasses = 'bg-[#4F46E5] border-2 border-[#4F46E5] text-white shadow-sm';
              } else if (isCurrent) {
                if (normStatus === 'SELECTED') {
                  circleClasses = 'bg-emerald-600 border-2 border-emerald-600 text-white shadow-md ring-4 ring-emerald-100';
                } else if (normStatus === 'REJECTED') {
                  circleClasses = 'bg-rose-600 border-2 border-rose-600 text-white shadow-md ring-4 ring-rose-100';
                } else if (normStatus === 'WAITLISTED') {
                  circleClasses = 'bg-amber-500 border-2 border-amber-500 text-white shadow-md ring-4 ring-amber-100';
                } else {
                  circleClasses = 'bg-[#4F46E5] border-2 border-[#4F46E5] text-white shadow-md ring-4 ring-indigo-100';
                }
              }

              const labelText = step.key === 'RESULT' ? getResultLabel() : step.label;

              return (
                <div key={step.key} className="relative z-10 flex flex-col items-center">
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs transition-all ${circleClasses}`}
                  >
                    {isPast ? (
                      <CheckCircle2 className="w-5 h-5" />
                    ) : isCurrent ? (
                      step.key === 'RESULT' && normStatus === 'SELECTED' ? (
                        <Sparkles className="w-4 h-4" />
                      ) : step.key === 'RESULT' && normStatus === 'REJECTED' ? (
                        <XCircle className="w-4 h-4" />
                      ) : (
                        <Clock className="w-4 h-4" />
                      )
                    ) : (
                      <span>{idx + 1}</span>
                    )}
                  </div>
                  <span
                    className={`mt-2 text-xs font-semibold tracking-tight text-center ${
                      isCurrent
                        ? normStatus === 'SELECTED'
                          ? 'text-emerald-700 font-bold'
                          : normStatus === 'REJECTED'
                          ? 'text-rose-700 font-bold'
                          : 'text-[#4F46E5] font-bold'
                        : isPast
                        ? 'text-slate-800'
                        : 'text-slate-400'
                    }`}
                  >
                    {labelText}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 flex items-center gap-3">
          <RotateCcw className="w-5 h-5 text-slate-500" />
          <span className="text-xs font-semibold text-slate-700">
            This application was withdrawn by the student.
          </span>
        </div>
      )}

      {/* ── Status History Audit Trail ── */}
      <div className="space-y-4">
        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
          Timeline &amp; Activity Log
        </h4>

        {history && history.length > 0 ? (
          <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
            {history.map((event, idx) => {
              const eventDate = new Date(event.changedAt || event.timestamp);
              const dateStr = !isNaN(eventDate.getTime())
                ? eventDate.toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })
                : 'Just now';

              let dotColor = 'bg-[#4F46E5]';
              if (event.status === 'SELECTED') dotColor = 'bg-emerald-500';
              if (event.status === 'REJECTED') dotColor = 'bg-rose-500';
              if (event.status === 'INTERVIEW') dotColor = 'bg-purple-500';
              if (event.status === 'WITHDRAWN') dotColor = 'bg-slate-400';

              return (
                <div key={idx} className="relative group">
                  {/* Timeline bullet */}
                  <div
                    className={`absolute -left-[19px] top-1.5 w-3 h-3 rounded-full border-2 border-white ${dotColor} shadow-sm`}
                  ></div>

                  <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-sm hover:border-slate-300 transition-colors space-y-2">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-[#172033]">
                          {event.status === 'APPLIED'
                            ? 'Application Submitted'
                            : event.status === 'SHORTLISTED'
                            ? 'Shortlisted for Assessment'
                            : event.status === 'INTERVIEW'
                            ? 'Interview Stage'
                            : event.status === 'SELECTED'
                            ? 'Selected 🎉'
                            : event.status === 'REJECTED'
                            ? 'Not Selected'
                            : event.status === 'WAITLISTED'
                            ? 'Waitlisted'
                            : event.status === 'WITHDRAWN'
                            ? 'Application Withdrawn'
                            : event.status}
                        </span>

                        {event.changedByName && (
                          <span className="text-[11px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md font-medium inline-flex items-center gap-1">
                            <User className="w-3 h-3" />
                            {event.changedByName}
                          </span>
                        )}
                      </div>

                      <span className="text-[11px] text-slate-500 font-medium">{dateStr}</span>
                    </div>

                    {/* Optional Note */}
                    {event.note && (
                      <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-100 italic leading-relaxed">
                        "{event.note}"
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-xs text-slate-500">No status events recorded yet.</p>
        )}
      </div>
    </div>
  );
};

export default ApplicationTimeline;
