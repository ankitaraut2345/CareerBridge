import React from 'react';
import { Clock, CheckCircle2, XCircle, Award, Ban } from 'lucide-react';

const STATUS_CONFIGS = {
  PENDING: {
    label: 'Pending Approval',
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    text: 'text-amber-700',
    icon: Clock,
  },
  ACCEPTED: {
    label: 'Active Mentorship',
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
    text: 'text-emerald-700',
    icon: CheckCircle2,
  },
  REJECTED: {
    label: 'Declined',
    bg: 'bg-rose-50',
    border: 'border-rose-200',
    text: 'text-rose-700',
    icon: XCircle,
  },
  COMPLETED: {
    label: 'Completed',
    bg: 'bg-indigo-50',
    border: 'border-indigo-200',
    text: 'text-indigo-700',
    icon: Award,
  },
  CANCELLED: {
    label: 'Cancelled',
    bg: 'bg-slate-100',
    border: 'border-slate-200',
    text: 'text-slate-600',
    icon: Ban,
  },
};

export const MentorshipStatusBadge = ({ status = 'PENDING', size = 'default', showIcon = true, className = '' }) => {
  const norm = String(status).toUpperCase();
  const conf = STATUS_CONFIGS[norm] || STATUS_CONFIGS.PENDING;
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

export default MentorshipStatusBadge;
