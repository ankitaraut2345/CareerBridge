import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getStudentDashboard } from '../services/dashboardService';
import {
  StatCard,
  DoughnutChart,
  TrendChart,
} from '../components/charts/DashboardCharts';
import {
  GraduationCap,
  Briefcase,
  FileText,
  Compass,
  Award,
  Calendar,
  Clock,
  Video,
  MapPin,
  ArrowRight,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  RefreshCw,
  Bell,
} from 'lucide-react';

export const StudentPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dashboardData, setDashboardData] = useState(null);

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

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
        <div className="h-28 rounded-2xl bg-slate-100 animate-pulse" />
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-28 rounded-2xl bg-slate-100 animate-pulse" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-64 rounded-2xl bg-slate-100 animate-pulse" />
          <div className="h-64 rounded-2xl bg-slate-100 animate-pulse" />
        </div>
      </div>
    );
  }

  if (error || !dashboardData) {
    return (
      <div className="max-w-xl mx-auto my-16 p-8 rounded-2xl bg-white border border-rose-100 text-center shadow-sm">
        <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-3">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h2 className="text-lg font-bold text-slate-800">Unable to load dashboard</h2>
        <p className="text-sm text-slate-500 mt-1">{error || 'Something went wrong.'}</p>
        <button
          onClick={fetchDashboard}
          className="mt-4 px-4 py-2 bg-[#4F46E5] text-white text-xs font-semibold rounded-xl hover:bg-indigo-700 transition-colors inline-flex items-center gap-1.5"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Retry
        </button>
      </div>
    );
  }

  const {
    profile,
    stats,
    applicationStatusDistribution,
    applicationTrend,
    upcomingInterview,
    recentApplications,
    recommendedOpportunities,
    recentNotifications,
    quickActions,
  } = dashboardData;

  const statusChartData = [
    { label: 'Applied', value: applicationStatusDistribution?.APPLIED || 0, color: '#38BDF8' },
    { label: 'Shortlisted', value: applicationStatusDistribution?.SHORTLISTED || 0, color: '#6366F1' },
    { label: 'Interview', value: applicationStatusDistribution?.INTERVIEW || 0, color: '#F59E0B' },
    { label: 'Selected', value: applicationStatusDistribution?.SELECTED || 0, color: '#10B981' },
    { label: 'Rejected', value: applicationStatusDistribution?.REJECTED || 0, color: '#F43F5E' },
    { label: 'Waitlisted', value: applicationStatusDistribution?.WAITLISTED || 0, color: '#94A3B8' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-8">
      {/* ─── 1. Welcome & Profile Completion Banner ─── */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#172033] via-[#1E1B4B] to-[#312E81] text-white p-6 sm:p-8 shadow-md">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white/10 text-indigo-200 backdrop-blur-xs border border-white/10">
              <GraduationCap className="w-3.5 h-3.5" />
              <span>Student Career Command Center</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Welcome back, {user?.name || profile?.fullName} 👋
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm max-w-xl">
              Track your campus placement applications, interview rounds, and alumni guidance in real time.
            </p>
          </div>

          {/* Profile Completion Widget */}
          <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 max-w-xs w-full flex-shrink-0">
            <div className="flex items-center justify-between text-xs mb-1.5 font-medium">
              <span className="text-slate-200">Profile Completion</span>
              <span className="font-bold text-white">{profile?.completion?.percentage || 0}%</span>
            </div>
            <div className="w-full h-2 rounded-full bg-white/20 overflow-hidden">
              <div
                className="h-full rounded-full bg-emerald-400 transition-all duration-500"
                style={{ width: `${profile?.completion?.percentage || 0}%` }}
              />
            </div>
            {profile?.completion?.missing?.length > 0 ? (
              <p className="text-[11px] text-slate-300 mt-2 line-clamp-1">
                Tip: Add {profile.completion.missing[0]}
              </p>
            ) : (
              <p className="text-[11px] text-emerald-300 mt-2 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Profile 100% complete
              </p>
            )}
          </div>
        </div>
      </div>

      {/* ─── 2. Key Metric Stat Cards ─── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        <StatCard
          icon={FileText}
          title="Applications"
          value={stats?.totalApplications || 0}
          color="indigo"
          onClick={() => navigate('/student/applications')}
        />
        <StatCard
          icon={Calendar}
          title="Interviews"
          value={stats?.upcomingInterviews || 0}
          color="amber"
          onClick={() => navigate('/student/applications')}
        />
        <StatCard
          icon={Sparkles}
          title="Shortlisted"
          value={stats?.shortlisted || 0}
          color="purple"
          onClick={() => navigate('/student/applications')}
        />
        <StatCard
          icon={CheckCircle2}
          title="Selected"
          value={stats?.selected || 0}
          color="emerald"
          onClick={() => navigate('/student/applications')}
        />
        <StatCard
          icon={Compass}
          title="Mentors"
          value={stats?.activeMentorship || 0}
          color="sky"
          onClick={() => navigate('/student/mentorship')}
        />
        <StatCard
          icon={Award}
          title="Referrals"
          value={stats?.pendingReferrals || 0}
          color="rose"
          onClick={() => navigate('/student/referrals')}
        />
      </div>

      {/* ─── 3. Upcoming Interview Highlight ─── */}
      {upcomingInterview ? (
        <div className="p-6 rounded-3xl bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center flex-shrink-0 shadow-sm">
              <Calendar className="w-6 h-6" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase bg-amber-100 text-amber-800 mb-1">
                Upcoming Interview
              </div>
              <h3 className="text-lg font-extrabold text-[#172033]">
                {upcomingInterview.company} — {upcomingInterview.round}
              </h3>
              <p className="text-xs text-slate-600 mt-0.5">Role: {upcomingInterview.role}</p>

              <div className="flex flex-wrap items-center gap-4 mt-3 text-xs text-slate-600">
                <span className="flex items-center gap-1 font-semibold text-slate-800">
                  <Calendar className="w-3.5 h-3.5 text-amber-600" />
                  {upcomingInterview.date}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  {upcomingInterview.startTime}
                </span>
                <span className="flex items-center gap-1">
                  {upcomingInterview.mode === 'ONLINE' ? (
                    <Video className="w-3.5 h-3.5 text-indigo-500" />
                  ) : (
                    <MapPin className="w-3.5 h-3.5 text-rose-500" />
                  )}
                  {upcomingInterview.mode}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {upcomingInterview.meetingLink && (
              <a
                href={upcomingInterview.meetingLink}
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2.5 rounded-xl bg-[#4F46E5] text-white text-xs font-semibold hover:bg-indigo-700 transition-colors inline-flex items-center gap-1.5"
              >
                <span>Join Meeting</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
            <Link
              to={`/student/applications/${upcomingInterview.applicationId}`}
              className="px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50 transition-colors"
            >
              View Application
            </Link>
          </div>
        </div>
      ) : null}

      {/* ─── 4. Application Analytics (Distribution & Trend) ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status Distribution */}
        <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-sm">
          <div className="flex items-center justify-between pb-4 mb-2 border-b border-slate-100">
            <div>
              <h2 className="text-base font-bold text-[#172033]">Application Status Distribution</h2>
              <p className="text-xs text-slate-400 mt-0.5">Current state of submitted campus drives</p>
            </div>
            <Link
              to="/student/applications"
              className="text-xs font-semibold text-[#4F46E5] hover:text-indigo-700 flex items-center gap-1"
            >
              <span>View all</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <DoughnutChart data={statusChartData} size={170} />
        </div>

        {/* 6-Month Activity Trend */}
        <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-sm">
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
            <div>
              <h2 className="text-base font-bold text-[#172033]">Application Activity Trend</h2>
              <p className="text-xs text-slate-400 mt-0.5">Application submission frequency (last 6 months)</p>
            </div>
            <span className="text-xs font-semibold text-slate-500">
              Total: {stats?.totalApplications || 0}
            </span>
          </div>

          <TrendChart data={applicationTrend} height={160} color="#4F46E5" />
        </div>
      </div>

      {/* ─── 5. Recent Applications & Recommended Opportunities ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Applications (2 cols) */}
        <div className="lg:col-span-2 p-6 rounded-3xl bg-white border border-slate-200/90 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
              <div>
                <h2 className="text-base font-bold text-[#172033]">Recent Applications</h2>
                <p className="text-xs text-slate-400 mt-0.5">Your most recent campus recruitment submissions</p>
              </div>
              <Link
                to="/student/applications"
                className="text-xs font-semibold text-[#4F46E5] hover:text-indigo-700 flex items-center gap-1"
              >
                <span>View all</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {recentApplications?.length === 0 ? (
              <div className="py-12 text-center">
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-[#4F46E5] flex items-center justify-center mx-auto mb-3">
                  <Briefcase className="w-6 h-6" />
                </div>
                <h3 className="text-sm font-bold text-slate-700">No applications submitted yet</h3>
                <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                  Explore available placement and internship drives to kickstart your campus recruitment process.
                </p>
                <Link
                  to="/student/opportunities"
                  className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#4F46E5] text-white text-xs font-semibold hover:bg-indigo-700 transition-colors"
                >
                  Explore Opportunities
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {recentApplications.map((app) => (
                  <div
                    key={app.id}
                    onClick={() => navigate(`/student/applications/${app.id}`)}
                    className="py-3 flex items-center justify-between gap-4 hover:bg-slate-50/80 -mx-2 px-2 rounded-xl transition-colors cursor-pointer"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-[#172033] truncate">{app.role}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{app.company}</p>
                    </div>

                    <div className="flex items-center gap-3 flex-shrink-0">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
                        {app.type}
                      </span>
                      <span
                        className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                          app.status === 'SELECTED'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                            : app.status === 'SHORTLISTED'
                            ? 'bg-indigo-50 text-[#4F46E5] border border-indigo-100'
                            : app.status === 'INTERVIEW'
                            ? 'bg-amber-50 text-amber-700 border border-amber-100'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {app.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Recommended Opportunities (1 col) */}
        <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
              <div>
                <h2 className="text-base font-bold text-[#172033]">Recommended For You</h2>
                <p className="text-xs text-slate-400 mt-0.5">Matching your department profile</p>
              </div>
              <Link
                to="/student/opportunities"
                className="text-xs font-semibold text-[#4F46E5] hover:text-indigo-700"
              >
                Browse all
              </Link>
            </div>

            {recommendedOpportunities?.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">
                No matching open opportunities right now.
              </div>
            ) : (
              <div className="space-y-3">
                {recommendedOpportunities.map((opp) => (
                  <div
                    key={opp.id}
                    onClick={() => navigate(`/opportunities/${opp.id}`)}
                    className="p-3 rounded-2xl border border-slate-100 hover:border-indigo-100 hover:bg-indigo-50/20 transition-all cursor-pointer"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="text-xs font-bold text-[#172033] line-clamp-1">{opp.title}</h3>
                      <span className="text-[10px] font-bold text-[#4F46E5] bg-indigo-50 px-1.5 py-0.5 rounded flex-shrink-0">
                        {opp.type}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">{opp.companyName}</p>
                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100/80 text-[10px] text-slate-400 font-medium">
                      <span>{opp.location || 'Campus / Hybrid'}</span>
                      <span className="font-semibold text-slate-700">{opp.salary}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ─── AI Resume Analysis Feature Card ─── */}
      <div className="rounded-3xl bg-gradient-to-r from-indigo-50/80 via-purple-50/60 to-white border border-indigo-100 p-6 sm:p-7 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-white border border-indigo-200 text-[#4F46E5] flex items-center justify-center flex-shrink-0 shadow-xs">
            <Sparkles className="w-6 h-6 text-[#4F46E5]" />
          </div>
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#4F46E5]/10 text-[#4F46E5] mb-1">
              AI Career Assistant
            </div>
            <h3 className="text-base font-bold text-[#172033]">AI Resume Analysis</h3>
            <p className="text-xs text-slate-500 mt-0.5 max-w-xl leading-relaxed">
              Analyze how well your resume matches target opportunities to discover strengths, identify missing skills, and get personalized tailoring suggestions.
            </p>
          </div>
        </div>
        <Link
          to="/student/opportunities"
          className="w-full md:w-auto px-5 py-2.5 rounded-xl font-bold text-xs bg-[#4F46E5] hover:bg-indigo-700 text-white shadow-sm hover:shadow transition-all flex items-center justify-center gap-2 flex-shrink-0"
        >
          Explore Opportunities
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* ─── 6. Quick Actions & Recent Notifications ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions (2 cols) */}
        <div className="lg:col-span-2 p-6 rounded-3xl bg-white border border-slate-200/90 shadow-sm">
          <h2 className="text-base font-bold text-[#172033] mb-4">Quick Navigation</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {quickActions?.map((act, idx) => (
              <Link
                key={idx}
                to={act.path}
                className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 hover:bg-indigo-50/50 hover:border-indigo-200 transition-all flex flex-col justify-between group"
              >
                <span className="text-xs font-bold text-slate-800 group-hover:text-[#4F46E5] transition-colors">
                  {act.label}
                </span>
                <div className="mt-4 flex items-center justify-end text-slate-400 group-hover:text-[#4F46E5] transition-colors">
                  <ArrowRight className="w-4 h-4" />
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Recent Notifications (1 col) */}
        <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
              <div className="flex items-center gap-1.5">
                <Bell className="w-4 h-4 text-[#4F46E5]" />
                <h2 className="text-base font-bold text-[#172033]">Recent Alerts</h2>
              </div>
              <Link
                to="/notifications"
                className="text-xs font-semibold text-[#4F46E5] hover:text-indigo-700"
              >
                View all
              </Link>
            </div>

            {recentNotifications?.length === 0 ? (
              <p className="py-6 text-center text-xs text-slate-400">All caught up! No alerts.</p>
            ) : (
              <div className="space-y-2.5">
                {recentNotifications.slice(0, 3).map((n) => (
                  <div
                    key={n._id || n.id}
                    onClick={() => {
                      if (n.actionUrl) navigate(n.actionUrl);
                      else navigate('/notifications');
                    }}
                    className="p-2.5 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer"
                  >
                    <p className="text-xs font-bold text-slate-800 truncate">{n.title}</p>
                    <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">{n.message}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentPage;
