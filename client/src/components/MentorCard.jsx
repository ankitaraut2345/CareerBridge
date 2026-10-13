import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Briefcase,
  GraduationCap,
  Sparkles,
  CheckCircle,
  ArrowRight,
  Send,
  MapPin,
  Ban,
} from 'lucide-react';

export const MentorCard = ({ mentor, onRequestClick }) => {
  const navigate = useNavigate();

  const {
    id,
    userId,
    fullName = 'Alumnus',
    profilePhoto,
    currentCompany = 'Not Specified',
    currentRole = 'Software Engineer',
    department,
    graduationYear,
    location,
    yearsOfExperience = 0,
    skills = [],
    mentorshipAreas = [],
    mentorshipAvailable = false,
    matchScore,
    matchLabel = 'Profile Match',
    matchReasons = [],
  } = mentor;

  const targetId = userId || id;

  const initials = fullName
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between overflow-hidden group">
      {/* Top Banner & Match Score */}
      <div className="p-5 pb-4">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-3">
            {profilePhoto ? (
              <img
                src={profilePhoto}
                alt={fullName}
                className="w-13 h-13 rounded-2xl object-cover border border-slate-200 shadow-xs"
              />
            ) : (
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#EEF2FF] to-[#E0E7FF] text-[#4F46E5] font-bold text-base flex items-center justify-center border border-indigo-100 shadow-xs">
                {initials}
              </div>
            )}
            <div>
              <div className="flex items-center gap-1.5 flex-wrap">
                <h3 className="text-base font-bold text-[#172033] group-hover:text-[#4F46E5] transition-colors leading-tight">
                  {fullName}
                </h3>
                <CheckCircle
                  className="w-4 h-4 text-[#4F46E5] flex-shrink-0"
                  title="Verified Alumni"
                />
              </div>
              <div className="flex items-center gap-1.5 text-xs text-slate-600 font-medium mt-1">
                <Briefcase className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                <span className="truncate max-w-[170px]">{currentRole}</span>
                <span className="text-slate-300">•</span>
                <span className="font-semibold text-slate-800">{currentCompany}</span>
              </div>
            </div>
          </div>

          {/* Match Score Badge */}
          {matchScore !== undefined && (
            <div
              className={`flex-shrink-0 flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-bold border ${
                matchScore >= 80
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : matchScore >= 65
                  ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                  : 'bg-slate-50 text-slate-700 border-slate-200'
              }`}
              title={`${matchLabel}: ${matchScore}% correlation based on skills and preferences`}
            >
              <Sparkles className="w-3 h-3" />
              <span>{matchScore}% Match</span>
            </div>
          )}
        </div>

        {/* Status Badge & Location Row */}
        <div className="flex items-center justify-between gap-2 text-xs mb-3">
          {mentorshipAvailable ? (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Available for Mentorship
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-600 border border-slate-200">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
              Not Currently Mentoring
            </span>
          )}

          {location && (
            <div className="flex items-center gap-1 text-[11px] text-slate-500 truncate max-w-[160px]" title={location}>
              <MapPin className="w-3 h-3 text-slate-400 flex-shrink-0" />
              <span className="truncate">{location}</span>
            </div>
          )}
        </div>

        {/* Academic / Experience Meta */}
        <div className="flex items-center gap-3 text-xs text-slate-500 mb-3 pb-3 border-b border-slate-100 flex-wrap">
          <div className="flex items-center gap-1">
            <GraduationCap className="w-3.5 h-3.5 text-slate-400" />
            <span>Class of {graduationYear || 'Alum'}</span>
          </div>
          {department && (
            <>
              <span className="text-slate-300">•</span>
              <span className="truncate max-w-[150px]">{department}</span>
            </>
          )}
          {yearsOfExperience > 0 && (
            <>
              <span className="text-slate-300">•</span>
              <span className="font-semibold text-slate-700">{yearsOfExperience} yrs exp</span>
            </>
          )}
        </div>

        {/* Key Skills */}
        {skills && skills.length > 0 && (
          <div className="mb-3">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">
              Key Skills
            </span>
            <div className="flex flex-wrap gap-1.5">
              {skills.slice(0, 4).map((skill, idx) => (
                <span
                  key={idx}
                  className="px-2 py-0.5 rounded-lg text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200/80"
                >
                  {skill}
                </span>
              ))}
              {skills.length > 4 && (
                <span className="px-1.5 py-0.5 rounded-lg text-[11px] text-slate-400 bg-slate-50">
                  +{skills.length - 4}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Mentorship Guidance Areas */}
        {mentorshipAreas && mentorshipAreas.length > 0 && (
          <div className="mb-3">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">
              Guidance Areas
            </span>
            <div className="flex flex-wrap gap-1.5">
              {mentorshipAreas.slice(0, 3).map((area, idx) => (
                <span
                  key={idx}
                  className="px-2 py-0.5 rounded-lg text-xs font-medium bg-[#EEF2FF] text-[#4F46E5] border border-indigo-100/60"
                >
                  {area}
                </span>
              ))}
              {mentorshipAreas.length > 3 && (
                <span className="px-1.5 py-0.5 rounded-lg text-[11px] text-slate-400 bg-slate-100">
                  +{mentorshipAreas.length - 3}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Match Reasons Highlight (Explainable match) */}
        {matchReasons && matchReasons.length > 0 && (
          <div className="bg-slate-50/80 rounded-xl p-2.5 border border-slate-100 mt-2">
            <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1">
              <span>Why This Match?</span>
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
      </div>

      {/* Card Footer Actions */}
      <div className="p-4 bg-slate-50/60 border-t border-slate-100 flex items-center gap-2">
        <button
          type="button"
          onClick={() => navigate(`/student/mentors/${targetId}`)}
          className="flex-1 py-2 px-3 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 hover:text-[#172033] transition-colors flex items-center justify-center gap-1 shadow-2xs"
        >
          <span>View Profile</span>
          <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
        </button>

        {mentorshipAvailable ? (
          <button
            type="button"
            onClick={() => onRequestClick && onRequestClick(mentor)}
            className="flex-1 py-2 px-3 text-xs font-semibold text-white bg-[#4F46E5] hover:bg-[#4338CA] rounded-xl transition-colors flex items-center justify-center gap-1.5 shadow-2xs"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Request Mentorship</span>
          </button>
        ) : (
          <button
            type="button"
            disabled
            className="flex-1 py-2 px-3 text-xs font-semibold text-slate-400 bg-slate-100 border border-slate-200 rounded-xl flex items-center justify-center gap-1.5 cursor-not-allowed opacity-80"
            title="This alumnus is currently not taking new mentorship requests."
          >
            <Ban className="w-3.5 h-3.5 text-slate-400" />
            <span>Unavailable</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default MentorCard;
