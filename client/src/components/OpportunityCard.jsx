import React from 'react';
import { Link } from 'react-router-dom';
import {
  Building2,
  MapPin,
  Calendar,
  Clock,
  ArrowRight,
  DollarSign,
  Briefcase,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';

/**
 * Reusable OpportunityCard Component
 * Displays placement / internship card with rich metadata, deadline indicators, and responsive styling.
 */
export const OpportunityCard = ({
  opportunity,
  manageMode = false,
  onStatusChange,
  onDelete,
}) => {
  const {
    id,
    _id,
    title,
    type,
    companyName,
    companyLogo,
    role,
    workMode,
    location,
    salary,
    stipend,
    requiredSkills = [],
    applicationDeadline,
    status,
  } = opportunity;

  const oppId = id || _id;

  // Deadline calculation
  const deadlineDate = new Date(applicationDeadline);
  const now = new Date();
  const diffTime = deadlineDate.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  const isExpired = diffTime < 0;
  const isClosingSoon = !isExpired && diffDays <= 4;

  const formattedDeadline = !isNaN(deadlineDate.getTime())
    ? deadlineDate.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : 'No deadline';

  // Work Mode Color
  const workModeStyles = {
    REMOTE: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    HYBRID: 'bg-sky-50 text-[#0284C7] border-sky-200',
    ONSITE: 'bg-slate-100 text-slate-700 border-slate-200',
  };

  // Status Badge for TPO Management
  const statusStyles = {
    PUBLISHED: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    DRAFT: 'bg-amber-100 text-amber-800 border-amber-200',
    CLOSED: 'bg-rose-100 text-rose-800 border-rose-200',
    ARCHIVED: 'bg-slate-100 text-slate-700 border-slate-200',
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between overflow-hidden group">
      <div className="p-5 sm:p-6">
        {/* Top Header: Company Avatar & Badges */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            {companyLogo ? (
              <img
                src={companyLogo}
                alt={companyName}
                className="w-12 h-12 rounded-lg object-contain bg-slate-50 border border-slate-100 p-1"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
            ) : null}
            <div
              className={`w-12 h-12 rounded-lg bg-gradient-to-br from-[#EEF2FF] to-[#E0E7FF] text-[#4F46E5] font-bold text-lg flex items-center justify-center border border-indigo-100 ${
                companyLogo ? 'hidden' : 'flex'
              }`}
            >
              {companyName ? companyName.charAt(0).toUpperCase() : 'C'}
            </div>
            <div>
              <h4 className="font-semibold text-slate-800 text-sm leading-tight group-hover:text-[#4F46E5] transition-colors">
                {companyName}
              </h4>
              <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-0.5">
                <MapPin className="w-3.5 h-3.5 flex-shrink-0 text-slate-400" />
                <span className="truncate max-w-[160px]">{location}</span>
              </div>
            </div>
          </div>

          {/* Badges */}
          <div className="flex flex-col items-end gap-1.5">
            <span
              className={`px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider border ${
                type === 'PLACEMENT'
                  ? 'bg-[#EEF2FF] text-[#4F46E5] border-indigo-200'
                  : 'bg-[#F5F3FF] text-[#7C3AED] border-purple-200'
              }`}
            >
              {type === 'PLACEMENT' ? 'Placement' : 'Internship'}
            </span>

            {manageMode && status && (
              <span
                className={`px-2 py-0.5 rounded-md text-[11px] font-semibold border ${
                  statusStyles[status] || 'bg-slate-100 text-slate-700'
                }`}
              >
                {status}
              </span>
            )}
          </div>
        </div>

        {/* Opportunity Title & Role */}
        <Link to={`/opportunities/${oppId}`} className="block focus:outline-none">
          <h3 className="font-bold text-lg text-[#172033] hover:text-[#4F46E5] transition-colors leading-snug line-clamp-1">
            {title}
          </h3>
          <p className="text-xs text-slate-500 font-medium mt-0.5 flex items-center gap-1">
            <Briefcase className="w-3 h-3 text-slate-400" />
            {role}
          </p>
        </Link>

        {/* Compensation & Work Mode Pills */}
        <div className="flex flex-wrap items-center gap-2 mt-4">
          <span
            className={`px-2.5 py-1 rounded-md text-xs font-medium border ${
              workModeStyles[workMode] || 'bg-slate-100 text-slate-700'
            }`}
          >
            {workMode}
          </span>

          {(salary || stipend) && (
            <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
              <DollarSign className="w-3 h-3 text-emerald-600" />
              <span>{salary || stipend}</span>
            </div>
          )}
        </div>

        {/* Required Skills Chips */}
        {requiredSkills && requiredSkills.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-1.5">
            {requiredSkills.slice(0, 3).map((skill, index) => (
              <span
                key={index}
                className="px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-600"
              >
                {skill}
              </span>
            ))}
            {requiredSkills.length > 3 && (
              <span className="px-1.5 py-0.5 rounded text-[11px] font-medium bg-slate-50 text-slate-400">
                +{requiredSkills.length - 3} more
              </span>
            )}
          </div>
        )}
      </div>

      {/* Card Footer: Deadline & Action */}
      <div className="px-5 py-3.5 sm:px-6 bg-slate-50/70 border-t border-slate-100 flex items-center justify-between gap-2">
        {/* Deadline Indicator */}
        <div className="flex items-center gap-1.5 text-xs">
          {status === 'CLOSED' ? (
            <span className="inline-flex items-center gap-1 text-rose-600 font-medium">
              <AlertCircle className="w-3.5 h-3.5" />
              Drive Closed
            </span>
          ) : isExpired ? (
            <span className="inline-flex items-center gap-1 text-slate-500 font-medium">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              Deadline Passed
            </span>
          ) : isClosingSoon ? (
            <span className="inline-flex items-center gap-1 text-amber-700 font-semibold bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
              <Clock className="w-3.5 h-3.5 text-amber-600 animate-pulse" />
              Closing in {diffDays} {diffDays === 1 ? 'day' : 'days'}
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-slate-500">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              Due: <strong className="text-slate-700 font-medium">{formattedDeadline}</strong>
            </span>
          )}
        </div>

        {/* View Details Link */}
        <Link
          to={`/opportunities/${oppId}`}
          className="inline-flex items-center gap-1 text-xs font-semibold text-[#4F46E5] hover:text-[#4338CA] transition-colors"
        >
          View Details
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>
    </div>
  );
};

export default OpportunityCard;
