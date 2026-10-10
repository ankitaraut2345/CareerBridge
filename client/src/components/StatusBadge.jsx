import React from 'react';
import {
  Clock,
  CheckCircle2,
  Calendar,
  XCircle,
  AlertCircle,
  RotateCcw,
  Sparkles,
  Layers,
} from 'lucide-react';

/**
 * Reusable CareerBridge Status Badge
 * Supports: APPLIED, SHORTLISTED, INTERVIEW, SELECTED, REJECTED, WAITLISTED, WITHDRAWN
 */
export const StatusBadge = ({ status = 'APPLIED', size = 'md' }) => {
  const norm = (status || '').toUpperCase();

  const sizeClasses = {
    sm: 'text-[10px] px-2 py-0.5 gap-1',
    md: 'text-xs px-2.5 py-1 gap-1.5',
    lg: 'text-sm px-3.5 py-1.5 gap-2 font-bold',
  }[size] || 'text-xs px-2.5 py-1 gap-1.5';

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-3.5 h-3.5',
    lg: 'w-4 h-4',
  }[size] || 'w-3.5 h-3.5';

  switch (norm) {
    case 'APPLIED':
      return (
        <span
          className={`inline-flex items-center font-semibold rounded-full bg-blue-50 text-blue-700 border border-blue-200 ${sizeClasses}`}
        >
          <Clock className={iconSizes} />
          Applied
        </span>
      );

    case 'SHORTLISTED':
      return (
        <span
          className={`inline-flex items-center font-semibold rounded-full bg-indigo-50 text-[#4F46E5] border border-indigo-200 ${sizeClasses}`}
        >
          <CheckCircle2 className={iconSizes} />
          Shortlisted
        </span>
      );

    case 'INTERVIEW':
      return (
        <span
          className={`inline-flex items-center font-semibold rounded-full bg-purple-50 text-[#7C3AED] border border-purple-200 ${sizeClasses}`}
        >
          <Calendar className={iconSizes} />
          Interview
        </span>
      );

    case 'SELECTED':
      return (
        <span
          className={`inline-flex items-center font-bold rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 shadow-sm ${sizeClasses}`}
        >
          <Sparkles className={`${iconSizes} text-emerald-600`} />
          Selected 🎉
        </span>
      );

    case 'REJECTED':
      return (
        <span
          className={`inline-flex items-center font-semibold rounded-full bg-rose-50 text-rose-700 border border-rose-200 ${sizeClasses}`}
        >
          <XCircle className={iconSizes} />
          Not Selected
        </span>
      );

    case 'WAITLISTED':
      return (
        <span
          className={`inline-flex items-center font-semibold rounded-full bg-amber-50 text-amber-800 border border-amber-200 ${sizeClasses}`}
        >
          <AlertCircle className={iconSizes} />
          Waitlisted
        </span>
      );

    case 'WITHDRAWN':
      return (
        <span
          className={`inline-flex items-center font-semibold rounded-full bg-slate-100 text-slate-600 border border-slate-200 ${sizeClasses}`}
        >
          <RotateCcw className={iconSizes} />
          Withdrawn
        </span>
      );

    default:
      return (
        <span
          className={`inline-flex items-center font-semibold rounded-full bg-slate-100 text-slate-700 ${sizeClasses}`}
        >
          <Layers className={iconSizes} />
          {status}
        </span>
      );
  }
};

export default StatusBadge;
