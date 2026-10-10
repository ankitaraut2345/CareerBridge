import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Building2,
  MapPin,
  Briefcase,
  Clock,
  Sparkles,
  ArrowRight,
  Send,
  CheckCircle,
  User,
} from 'lucide-react';
import ReferralStatusBadge from './ReferralStatusBadge';

export const ReferralCard = ({ referral, onRequestClick }) => {
  const navigate = useNavigate();

  const {
    id,
    _id,
    title,
    companyName,
    role,
    workMode = 'Hybrid',
    location,
    employmentType = 'Full-time',
    experienceRequired = 0,
    salaryOrPackage,
    requiredSkills = [],
    applicationDeadline,
    status = 'OPEN',
    referralAvailable = true,
    matchScore,
    matchLabel = 'Profile Match',
    matchReasons = [],
    alumni = {},
  } = referral;

  const targetId = _id || id;
  const isExpired = new Date(applicationDeadline).getTime() < Date.now();
  const isAvailable = status === 'OPEN' && referralAvailable && !isExpired;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between overflow-hidden group">
      {/* Card Content */}
      <div className="p-5 pb-4">
        {/* Top Header: Company & Match Badge */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center text-[#4F46E5] font-bold text-sm shadow-2xs flex-shrink-0">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
                {companyName}
              </span>
              <h3 className="text-base font-bold text-[#172033] group-hover:text-[#4F46E5] transition-colors leading-tight line-clamp-1">
                {title}
              </h3>
            </div>
          </div>

          {/* Match Score */}
          {matchScore !== undefined && (
            <div
              className={`flex-shrink-0 flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-bold border ${
                matchScore >= 80
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : matchScore >= 65
                  ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                  : 'bg-slate-50 text-slate-700 border-slate-200'
              }`}
              title={`${matchLabel}: ${matchScore}% correlation based on your skills & profile`}
            >
              <Sparkles className="w-3 h-3" />
              <span>{matchScore}% Match</span>
            </div>
          )}
        </div>

        {/* Role & Work Mode Tags */}
        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-600 mb-3">
          <span className="font-semibold text-slate-800">{role}</span>
          <span className="text-slate-300">•</span>
          <span className="px-2 py-0.5 rounded-lg bg-slate-100 font-medium text-slate-700">
            {workMode}
          </span>
          <span className="px-2 py-0.5 rounded-lg bg-slate-100 font-medium text-slate-700">
            {employmentType}
          </span>
          {experienceRequired > 0 ? (
            <span className="text-slate-500">{experienceRequired}+ yrs exp</span>
          ) : (
            <span className="text-emerald-700 font-medium bg-emerald-50 px-2 py-0.5 rounded-lg">
              Freshers Eligible
            </span>
          )}
        </div>

        {/* Location & Package */}
        <div className="flex items-center gap-3 text-xs text-slate-500 mb-3 pb-3 border-b border-slate-100">
          <span className="flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 text-slate-400" />
            <span className="truncate max-w-[150px]">{location}</span>
          </span>
          {salaryOrPackage && (
            <>
              <span className="text-slate-300">•</span>
              <span className="font-semibold text-[#172033]">{salaryOrPackage}</span>
            </>
          )}
        </div>

        {/* Match Reasons Snippet */}
        {matchReasons && matchReasons.length > 0 && (
          <div className="mb-3.5 bg-slate-50/80 rounded-xl p-2.5 border border-slate-100">
            <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
              Why this referral matches you:
            </p>
            <div className="space-y-1">
              {matchReasons.slice(0, 2).map((reason, idx) => (
                <p key={idx} className="text-xs text-slate-700 font-medium flex items-start gap-1.5 leading-snug">
                  <span className="text-[#4F46E5] font-bold">✓</span>
                  <span>{reason}</span>
                </p>
              ))}
            </div>
          </div>
        )}

        {/* Required Skills Chips */}
        {requiredSkills && requiredSkills.length > 0 && (
          <div className="mb-3.5">
            <div className="flex flex-wrap gap-1.5">
              {requiredSkills.slice(0, 4).map((skill, idx) => (
                <span
                  key={idx}
                  className="px-2 py-0.5 rounded-lg text-xs font-medium bg-[#EEF2FF] text-[#4F46E5] border border-indigo-100/60"
                >
                  {skill}
                </span>
              ))}
              {requiredSkills.length > 4 && (
                <span className="px-1.5 py-0.5 rounded-lg text-[11px] text-slate-400 bg-slate-100">
                  +{requiredSkills.length - 4}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Alumni Info Row */}
        <div className="flex items-center justify-between text-xs pt-1">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-violet-100 text-[#7C3AED] flex items-center justify-center font-bold text-[10px]">
              {alumni.fullName ? alumni.fullName.charAt(0) : <User className="w-3 h-3" />}
            </div>
            <div className="flex items-center gap-1">
              <span className="font-semibold text-slate-800 truncate max-w-[120px]">
                {alumni.fullName || 'Alumnus'}
              </span>
              <CheckCircle className="w-3 h-3 text-[#7C3AED]" title="Verified Alumni" />
            </div>
          </div>

          <div className="flex items-center gap-1 text-slate-500 text-[11px]">
            <Clock className="w-3 h-3 text-slate-400" />
            <span>Due {new Date(applicationDeadline).toLocaleDateString()}</span>
          </div>
        </div>
      </div>

      {/* Card Actions Footer */}
      <div className="p-4 bg-slate-50/60 border-t border-slate-100 flex items-center gap-2">
        <button
          type="button"
          onClick={() => navigate(`/student/referrals/${targetId}`)}
          className="flex-1 py-2 px-3 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 hover:text-[#172033] transition-colors flex items-center justify-center gap-1 shadow-2xs"
        >
          <span>View Details</span>
          <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
        </button>

        {isAvailable ? (
          <button
            type="button"
            onClick={() => onRequestClick && onRequestClick(referral)}
            className="flex-1 py-2 px-3 text-xs font-semibold text-white bg-[#4F46E5] hover:bg-[#4338CA] rounded-xl transition-colors flex items-center justify-center gap-1.5 shadow-2xs"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Request Referral</span>
          </button>
        ) : (
          <span className="flex-1 py-2 px-3 text-xs font-semibold text-slate-400 bg-slate-100 rounded-xl text-center">
            {isExpired ? 'Deadline Passed' : 'Unavailable'}
          </span>
        )}
      </div>
    </div>
  );
};

export default ReferralCard;
