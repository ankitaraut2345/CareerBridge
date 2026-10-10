import React from 'react';
import {
  Clock,
  CheckCircle2,
  XCircle,
  Award,
  Ban,
  Send,
  Sparkles,
  Lock,
  Unlock,
} from 'lucide-react';

const STATUS_CONFIGS = {
  // Opportunity Statuses
  OPEN: {
    label: 'Open for Referrals',
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
    text: 'text-emerald-700',
    icon: Unlock,
  },
  CLOSED: {
    label: 'Referral Closed',
    bg: 'bg-rose-50',
    border: 'border-rose-200',
    text: 'text-rose-700',
    icon: Lock,
  },
  DRAFT: {
    label: 'Draft',
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    text: 'text-amber-700',
    icon: Clock,
  },
  ARCHIVED: {
    label: 'Archived',
    bg: 'bg-slate-100',
    border: 'border-slate-200',
    text: 'text-slate-600',
    icon: Ban,
  },

  // Request Statuses
  PENDING: {
    label: 'Pending Review',
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    text: 'text-amber-700',
    icon: Clock,
  },
  ACCEPTED: {
    label: 'Request Accepted',
    bg: 'bg-indigo-50',
    border: 'border-indigo-200',
    text: 'text-[#4F46E5]',
    icon: CheckCircle2,
  },
  REFERRED: {
    label: 'Referred to Company',
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
    text: 'text-emerald-700',
    icon: Send,
  },
  REJECTED: {
    label: 'Declined',
    bg: 'bg-rose-50',
    border: 'border-rose-200',
    text: 'text-rose-700',
    icon: XCircle,
  },
  WITHDRAWN: {
    label: 'Withdrawn',
    bg: 'bg-slate-100',
    border: 'border-slate-200',
    text: 'text-slate-600',
    icon: Ban,
  },
  COMPLETED: {
    label: 'Completed',
    bg: 'bg-purple-50',
    border: 'border-purple-200',
    text: 'text-purple-700',
    icon: Award,
  },
};

const OUTCOME_CONFIGS = {
  PENDING: { label: 'Awaiting Company Response', color: 'text-slate-600 bg-slate-50 border-slate-200' },
  INTERVIEW: { label: 'Interview Scheduled', color: 'text-sky-700 bg-sky-50 border-sky-200' },
  SELECTED: { label: 'Selected / Hired', color: 'text-emerald-700 bg-emerald-50 border-emerald-200' },
  NOT_SELECTED: { label: 'Not Selected', color: 'text-rose-700 bg-rose-50 border-rose-200' },
  NO_RESPONSE: { label: 'No Company Response', color: 'text-slate-600 bg-slate-50 border-slate-200' },
  WITHDRAWN: { label: 'Candidate Withdrew', color: 'text-slate-600 bg-slate-50 border-slate-200' },
  OTHER: { label: 'Other Outcome', color: 'text-slate-600 bg-slate-50 border-slate-200' },
};

export const ReferralStatusBadge = ({
  status = 'OPEN',
  size = 'default',
  showIcon = true,
  className = '',
}) => {
  const norm = String(status).toUpperCase();
  const conf = STATUS_CONFIGS[norm] || STATUS_CONFIGS.OPEN;
  const Icon = conf.icon;

  const isSmall = size === 'sm';
  const sizeClasses = isSmall
    ? 'text-[11px] px-2 py-0.5 gap-1 font-semibold'
    : 'text-xs px-2.5 py-1 gap-1.5 font-semibold';
  const iconSize = isSmall ? 'w-3 h-3' : 'w-3.5 h-3.5';

  return (
    <span
      className={`inline-flex items-center rounded-full border ${conf.bg} ${conf.border} ${conf.text} ${sizeClasses} ${className}`}
    >
      {showIcon && <Icon className={`${iconSize} flex-shrink-0`} />}
      <span>{conf.label}</span>
    </span>
  );
};

export const ReferralOutcomeBadge = ({ outcome = 'PENDING', className = '' }) => {
  const norm = String(outcome).toUpperCase();
  const conf = OUTCOME_CONFIGS[norm] || OUTCOME_CONFIGS.PENDING;

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${conf.color} ${className}`}
    >
      <Sparkles className="w-3 h-3 mr-1" />
      <span>{conf.label}</span>
    </span>
  );
};

export default ReferralStatusBadge;
