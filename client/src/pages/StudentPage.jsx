import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getStudentDashboard } from '../services/dashboardService';
import {
  Briefcase,
  FileText,
  Calendar,
  Sparkles,
  ArrowRight,
  Clock,
  MapPin,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Bookmark,
  Users,
  Bot,
  ExternalLink,
  ChevronRight,
  TrendingUp,
  UserCheck,
} from 'lucide-react';
import { toggleSaveOpportunity, isOpportunitySaved } from '../services/savedOpportunitiesService';

export const StudentPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dashboardData, setDashboardData] = useState(null);
  const [savedIds, setSavedIds] = useState(new Set());

  const fetchDashboard = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getStudentDashboard();
      setDashboardData(res);
    } catch (err) {
      console.error('Error fetching student dashboard:', err);
      setError(err.message || 'We could not load your dashboard. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const handleBookmarkToggle = (opp) => {
    const oppId = opp._id || opp.id;
    const isSaved = toggleSaveOpportunity(opp);
    setSavedIds((prev) => {
      const next = new Set(prev);
      if (isSaved) next.add(oppId);
      else next.delete(oppId);
      return next;
    });
  };

  if (loading) {
    return (
      <div className="space-y-6 pb-10">
        <div className="h-44 rounded-3xl bg-slate-100 animate-pulse" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-28 rounded-2xl bg-slate-100 animate-pulse" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-96 rounded-2xl bg-slate-100 animate-pulse" />
          <div className="h-96 rounded-2xl bg-slate-100 animate-pulse" />
        </div>
      </div>
    );
  }

  const {
    profile,
    stats,
    upcomingInterview,
    recentApplications = [],
    recommendedOpportunities = [],
  } = dashboardData || {};

  // Mock recommendations matching Image 6 if backend returns empty list
  const displayOpportunities =
    recommendedOpportunities.length > 0
      ? recommendedOpportunities
      : [
          {
            id: 'opp-1',
            title: 'Software Engineer Intern',
            company: 'Google',
            location: 'Bengaluru',
            workMode: 'On-site',
            stipend: '₹45,000/month',
            type: 'Internship',
            skills: ['React', 'Node.js', 'System Design'],
            matchScore: 94,
            deadline: '3 days left',
          },
          {
            id: 'opp-2',
            title: 'SDE Intern',
            company: 'Microsoft',
            location: 'Hyderabad',
            workMode: 'Hybrid',
            stipend: '₹50,000/month',
            type: 'Internship',
            skills: ['Java', 'DSA', 'Web Development'],
            matchScore: 89,
            deadline: '5 days left',
          },
          {
            id: 'opp-3',
            title: 'Full Stack Developer',
            company: 'Flipkart',
            location: 'Bengaluru',
            workMode: 'Hybrid',
            stipend: '₹40,000/month',
            type: 'Internship',
            skills: ['MERN Stack', 'Next.js', 'SQL'],
            matchScore: 85,
            deadline: '7 days left',
          },
        ];

  const totalApps = stats?.totalApplications || recentApplications.length || 12;
  const inProgressApps = stats?.shortlisted || 6;
  const scheduledInterviews = stats?.upcomingInterviews || (upcomingInterview ? 1 : 3);

  const profilePercent = profile?.completion?.percentage || 70;

  return (
    <div className="space-y-7 pb-10">
      {/* ─── 1. Hero Banner matching Image 6 ─── */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-50/90 via-indigo-50/80 to-purple-50/90 border border-slate-200/80 p-6 sm:p-8 lg:p-9 shadow-xs">
        <div className="absolute -top-16 -right-16 w-64 h-64 bg-purple-200/40 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-64 h-64 bg-sky-200/40 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="max-w-2xl">
            <h1 className="text-2xl sm:text-3xl lg:text-[34px] font-extrabold text-[#172033] tracking-tight leading-tight mb-2">
              Good Morning, {user?.name?.split(' ')[0] || profile?.fullName?.split(' ')[0] || 'John'} 👋
            </h1>
            <p className="text-sm sm:text-base text-slate-600 font-normal leading-relaxed">
              Plan your career, build the right skills, and track your progress towards your goals.
            </p>

            <div className="mt-5 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => navigate('/student/opportunities')}
                className="px-5 py-2.5 rounded-xl bg-[#4F46E5] hover:bg-[#4338CA] text-white text-xs sm:text-sm font-bold shadow-xs hover:shadow-md transition-all flex items-center gap-2 cursor-pointer"
              >
                <span>Explore Opportunities</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => navigate('/student/ai-assistant')}
                className="px-5 py-2.5 rounded-xl bg-white/90 hover:bg-white text-[#7C3AED] border border-purple-200/80 text-xs sm:text-sm font-bold shadow-2xs hover:shadow-xs transition-all flex items-center gap-2 cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-[#7C3AED]" />
                <span>Ask AI Assistant</span>
              </button>
            </div>
          </div>

          <div className="hidden lg:flex flex-col items-end">
            <div className="px-5 py-3 rounded-2xl bg-white/80 backdrop-blur-xs border border-indigo-100 shadow-xs text-right">
              <span className="block text-xs font-bold text-slate-400 italic">Target 2026</span>
              <span className="block text-sm font-extrabold text-[#4F46E5] italic">
                Campus Drive Ready
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ─── 2. 3 Key Stat Cards matching Image 6 ─── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5">
        <div
          onClick={() => navigate('/student/applications')}
          className="p-5 sm:p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs hover:shadow-md hover:border-indigo-200 transition-all cursor-pointer flex items-center gap-4 group"
        >
          <div className="w-13 h-13 rounded-2xl bg-indigo-50 text-[#4F46E5] flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-extrabold text-[#172033] leading-none">
              {totalApps}
            </div>
            <div className="text-xs sm:text-sm font-bold text-slate-700 mt-1">
              Applications Submitted
            </div>
            <div className="text-[11px] text-emerald-600 font-semibold mt-0.5">
              +2 submitted this week
            </div>
          </div>
        </div>

        <div
          onClick={() => navigate('/student/applications')}
          className="p-5 sm:p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs hover:shadow-md hover:border-emerald-200 transition-all cursor-pointer flex items-center gap-4 group"
        >
          <div className="w-13 h-13 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-extrabold text-[#172033] leading-none">
              {inProgressApps}
            </div>
            <div className="text-xs sm:text-sm font-bold text-slate-700 mt-1">In Progress</div>
            <div className="text-[11px] text-slate-500 font-medium mt-0.5">
              Under review or shortlisting
            </div>
          </div>
        </div>

        <div
          onClick={() => navigate('/student/applications')}
          className="p-5 sm:p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs hover:shadow-md hover:border-amber-200 transition-all cursor-pointer flex items-center gap-4 group"
        >
          <div className="w-13 h-13 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-extrabold text-[#172033] leading-none">
              {scheduledInterviews}
            </div>
            <div className="text-xs sm:text-sm font-bold text-slate-700 mt-1">
              Interviews Scheduled
            </div>
            <div className="text-[11px] text-amber-600 font-semibold mt-0.5">
              Upcoming round this month
            </div>
          </div>
        </div>
      </div>

      {/* ─── 3. Main 2-Column Section matching Image 6 ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-7 items-start">
        {/* Left Column (2 Cols): Recommended Opportunities & Deadlines */}
        <div className="lg:col-span-2 space-y-7">
          {/* Recommended Opportunities */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-extrabold text-[#172033]">
                  Recommended Opportunities
                </h2>
                <p className="text-xs text-slate-500">
                  Curated roles matching your major, skills, and eligibility
                </p>
              </div>
              <button
                type="button"
                onClick={() => navigate('/student/opportunities')}
                className="text-xs font-bold text-[#4F46E5] hover:underline"
              >
                View All →
              </button>
            </div>

            <div className="space-y-3.5">
              {displayOpportunities.map((opp) => {
                const oppId = opp._id || opp.id;
                const isSaved = isOpportunitySaved(oppId) || savedIds.has(oppId);
                return (
                  <div
                    key={oppId}
                    className="p-5 rounded-3xl bg-white border border-slate-200/80 hover:border-indigo-200 shadow-xs hover:shadow-md transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 group"
                  >
                    <div className="flex items-start gap-3.5">
                      <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center flex-shrink-0 p-2 shadow-2xs">
                        <span className="text-sm font-black text-slate-800">
                          {(opp.company || opp.title).slice(0, 1)}
                        </span>
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-sm sm:text-base font-bold text-[#172033] group-hover:text-[#4F46E5] transition-colors leading-tight">
                            {opp.title}
                          </h3>
                          {opp.matchScore && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              {opp.matchScore}% Match
                            </span>
                          )}
                        </div>

                        <div className="text-xs font-semibold text-slate-700">
                          {opp.company}
                        </div>

                        <div className="flex items-center gap-2.5 text-xs text-slate-500 flex-wrap">
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-slate-400" />
                            {opp.location || 'Bengaluru'}
                          </span>
                          <span>•</span>
                          <span>{opp.workMode || 'On-site'}</span>
                          {opp.stipend && (
                            <>
                              <span>•</span>
                              <span className="font-semibold text-slate-700">{opp.stipend}</span>
                            </>
                          )}
                        </div>

                        {/* Skill Pills */}
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {opp.skills?.slice(0, 3).map((s, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-0.5 rounded-lg text-[10px] font-semibold bg-slate-50 text-slate-700 border border-slate-200"
                            >
                              {s}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2 flex-shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                      <button
                        type="button"
                        onClick={() => handleBookmarkToggle(opp)}
                        className={`p-2 rounded-xl border transition-colors cursor-pointer ${
                          isSaved
                            ? 'bg-indigo-50 border-indigo-200 text-[#4F46E5]'
                            : 'border-slate-200 text-slate-400 hover:text-slate-600 hover:bg-slate-50'
                        }`}
                        title={isSaved ? 'Saved' : 'Save opportunity'}
                      >
                        <Bookmark className="w-4 h-4 fill-current" />
                      </button>

                      <button
                        type="button"
                        onClick={() => navigate(`/opportunities/${oppId}`)}
                        className="px-4 py-2 rounded-xl bg-[#4F46E5] hover:bg-[#4338CA] text-white text-xs font-bold transition-all shadow-2xs cursor-pointer flex items-center gap-1"
                      >
                        <span>Apply Now</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Upcoming Deadlines matching Image 6 */}
          <div className="p-5 sm:p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-extrabold text-[#172033] flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-500" />
                <span>Upcoming Deadlines</span>
              </h2>
              <span className="text-xs text-slate-400 font-medium">3 drives closing soon</span>
            </div>

            <div className="space-y-3">
              {[
                {
                  company: 'Google',
                  role: 'Software Engineer Intern',
                  deadline: '2 days left',
                  closingDate: 'Oct 14, 2026',
                  color: 'text-rose-600 bg-rose-50 border-rose-200',
                },
                {
                  company: 'Microsoft',
                  role: 'SDE Intern',
                  deadline: '5 days left',
                  closingDate: 'Oct 17, 2026',
                  color: 'text-amber-700 bg-amber-50 border-amber-200',
                },
                {
                  company: 'Amazon',
                  role: 'Cloud Support Associate',
                  deadline: '7 days left',
                  closingDate: 'Oct 19, 2026',
                  color: 'text-blue-700 bg-blue-50 border-blue-200',
                },
              ].map((d, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50/80 border border-slate-200/70 hover:bg-slate-50 transition-colors"
                >
                  <div className="min-w-0">
                    <div className="text-xs sm:text-sm font-bold text-[#172033] truncate">
                      {d.role} • {d.company}
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5">Closes on {d.closingDate}</div>
                  </div>

                  <div className="flex items-center gap-3 flex-shrink-0">
                    <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold border ${d.color}`}>
                      {d.deadline}
                    </span>
                    <button
                      type="button"
                      onClick={() => navigate('/student/opportunities')}
                      className="text-xs font-bold text-[#4F46E5] hover:underline hidden sm:block"
                    >
                      Apply
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column (1 Col): Profile Completion, AI Promo, Alumni suggestions */}
        <div className="space-y-6">
          {/* Profile Completion Widget matching Image 6 */}
          <div className="p-5 sm:p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-[#172033]">Profile Completion</h3>
              <span className="text-sm font-extrabold text-[#4F46E5]">{profilePercent}%</span>
            </div>

            <div className="w-full h-2.5 rounded-full bg-slate-100 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[#4F46E5] to-[#7C3AED] transition-all duration-700"
                style={{ width: `${profilePercent}%` }}
              />
            </div>

            <p className="text-xs text-slate-500 leading-relaxed">
              Add your verified resume and certifications to increase your profile shortlist score by 35%.
            </p>

            <button
              type="button"
              onClick={() => navigate('/student/profile')}
              className="w-full py-2.5 rounded-xl bg-slate-50 hover:bg-indigo-50/70 border border-slate-200 text-xs font-bold text-[#4F46E5] transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span>Complete Profile</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* AI Career Assistant Promo Card */}
          <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-br from-[#4F46E5] to-[#7C3AED] text-white shadow-md space-y-3">
            <div className="w-9 h-9 rounded-2xl bg-white/20 backdrop-blur-xs flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-base font-extrabold leading-snug">CareerBridge AI Assistant</h3>
            <p className="text-xs text-indigo-100 leading-relaxed">
              Scan your resume against live placement drives, generate mock interview questions, and receive instant feedback.
            </p>
            <button
              type="button"
              onClick={() => navigate('/student/ai-assistant')}
              className="w-full py-2.5 rounded-xl bg-white text-[#4F46E5] hover:bg-indigo-50 font-bold text-xs transition-colors shadow-2xs cursor-pointer flex items-center justify-center gap-1.5"
            >
              <span>Chat with Assistant</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Upcoming Interview Card (if scheduled) */}
          {upcomingInterview ? (
            <div className="p-5 rounded-3xl bg-white border border-amber-200 shadow-xs space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-700">
                <Calendar className="w-4 h-4" />
                <span>Upcoming Interview Round</span>
              </div>
              <h4 className="text-sm font-bold text-[#172033]">
                {upcomingInterview.company} • {upcomingInterview.role}
              </h4>
              <div className="text-xs text-slate-500">
                {upcomingInterview.round || 'Technical Interview'} •{' '}
                {upcomingInterview.scheduledAt
                  ? new Date(upcomingInterview.scheduledAt).toLocaleDateString()
                  : 'Scheduled Soon'}
              </div>
              <button
                type="button"
                onClick={() => navigate('/student/applications')}
                className="w-full py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 text-xs font-bold transition-colors cursor-pointer"
              >
                View Interview Details
              </button>
            </div>
          ) : (
            /* Suggested Alumni / Mentors */
            <div className="p-5 sm:p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-[#172033] flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-[#4F46E5]" />
                  <span>Suggested Alumni</span>
                </h3>
                <button
                  type="button"
                  onClick={() => navigate('/student/mentorship')}
                  className="text-xs font-semibold text-[#4F46E5] hover:underline"
                >
                  Explore →
                </button>
              </div>

              <div className="space-y-3">
                {[
                  { name: 'Rohan Patil', role: 'SWE at Google', passout: '2021 Passout' },
                  { name: 'Priya Deshmukh', role: 'PM at Microsoft', passout: '2020 Passout' },
                  { name: 'Aman Kulkarni', role: 'SDE II at Amazon', passout: '2019 Passout' },
                ].map((alum, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-2.5 rounded-2xl hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-xl bg-indigo-100 text-[#4F46E5] flex items-center justify-center font-bold text-xs flex-shrink-0">
                        {alum.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-[#172033] truncate">{alum.name}</div>
                        <div className="text-[11px] text-slate-500 truncate">{alum.role}</div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => navigate('/student/mentorship')}
                      className="px-2.5 py-1 rounded-lg text-xs font-bold text-[#4F46E5] hover:bg-indigo-50 transition-colors cursor-pointer"
                    >
                      Connect
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentPage;
