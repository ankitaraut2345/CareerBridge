import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { getAdminDashboard } from '../services/dashboardService';
import {
  StatCard,
  DoughnutChart,
  TrendChart,
} from '../components/charts/DashboardCharts';
import {
  ShieldCheck,
  Users,
  GraduationCap,
  Award,
  Building2,
  Lock,
  ArrowRight,
  RefreshCw,
  AlertCircle,
  Clock,
  CheckCircle2,
  FileText,
  Activity,
  Layers,
} from 'lucide-react';

export const AdminPage = () => {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dashboardData, setDashboardData] = useState(null);

  const fetchDashboard = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getAdminDashboard();
      setDashboardData(res);
    } catch (err) {
      console.error('Error fetching admin dashboard:', err);
      setError(err.message || 'We could not load institutional telemetry. Please try again.');
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
        <h2 className="text-lg font-bold text-slate-800">Unable to load governance metrics</h2>
        <p className="text-sm text-slate-500 mt-1">{error || 'Something went wrong.'}</p>
        <button
          onClick={fetchDashboard}
          className="mt-4 px-4 py-2 bg-[#172033] text-white text-xs font-semibold rounded-xl hover:bg-slate-800 transition-colors inline-flex items-center gap-1.5"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Retry
        </button>
      </div>
    );
  }

  const {
    stats,
    alumniVerification,
    roleDistribution,
    userGrowth,
    platformActivity,
    recentActivity,
    quickActions,
  } = dashboardData;

  const roleChartData = [
    { label: 'Students', value: roleDistribution?.STUDENT || 0, color: '#4F46E5' },
    { label: 'Alumni', value: roleDistribution?.ALUMNI || 0, color: '#7C3AED' },
    { label: 'TPO Officers', value: roleDistribution?.TPO || 0, color: '#0284C7' },
    { label: 'Administrators', value: roleDistribution?.ADMIN || 0, color: '#172033' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-8">
      {/* ─── 1. Header & Verification Alert Banner ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-800 mb-2">
            <ShieldCheck className="w-3.5 h-3.5 text-[#4F46E5]" />
            Institutional Administration &amp; Governance
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#172033] tracking-tight">
            Platform Command &amp; Telemetry
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-0.5">
            Oversee user growth, verify graduating alumni, monitor recruitment pipelines, and audit system integrity.
          </p>
        </div>

        <div className="flex items-center gap-3 self-start sm:self-auto flex-shrink-0">
          <Link
            to="/admin/alumni-verification"
            className="flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-semibold text-white bg-[#4F46E5] hover:bg-indigo-700 rounded-xl transition-colors shadow-xs"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Alumni Verification</span>
            {stats?.pendingAlumniCount > 0 && (
              <span className="ml-1 px-1.5 py-0.2 bg-white text-[#4F46E5] text-[10px] font-extrabold rounded-full">
                {stats.pendingAlumniCount}
              </span>
            )}
          </Link>
        </div>
      </div>

      {/* ─── 2. Metric Stat Cards ─── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        <StatCard
          icon={Users}
          title="Total Users"
          value={stats?.totalUsers || 0}
          color="indigo"
        />
        <StatCard
          icon={GraduationCap}
          title="Students"
          value={stats?.studentsCount || 0}
          color="indigo"
        />
        <StatCard
          icon={Award}
          title="Total Alumni"
          value={stats?.alumniCount || 0}
          color="purple"
        />
        <StatCard
          icon={ShieldCheck}
          title="Verified Alumni"
          value={stats?.verifiedAlumniCount || 0}
          color="emerald"
          onClick={() => navigate('/admin/alumni-verification')}
        />
        <StatCard
          icon={Clock}
          title="Pending Verification"
          value={stats?.pendingAlumniCount || 0}
          color={stats?.pendingAlumniCount > 0 ? 'amber' : 'slate'}
          onClick={() => navigate('/admin/alumni-verification')}
        />
        <StatCard
          icon={Building2}
          title="TPO Staff"
          value={stats?.tpoUsersCount || 0}
          color="sky"
        />
      </div>

      {/* ─── 3. Alumni Verification Highlight Banner ─── */}
      {alumniVerification?.pending > 0 && (
        <div className="p-5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-200/80 text-amber-900 flex items-center justify-center flex-shrink-0">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold">
                {alumniVerification.pending} Alumni profiles awaiting degree verification
              </h3>
              <p className="text-xs text-amber-800/90 mt-0.5">
                Review graduation certificates and grant mentorship / referral privileges.
              </p>
            </div>
          </div>

          <Link
            to="/admin/alumni-verification"
            className="px-4 py-2 rounded-xl bg-amber-900 text-white text-xs font-semibold hover:bg-amber-950 transition-colors self-start sm:self-auto flex items-center gap-1.5 flex-shrink-0"
          >
            <span>Review Submissions</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}

      {/* ─── 4. User Distribution & User Growth ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-sm">
          <div className="pb-4 mb-2 border-b border-slate-100">
            <h2 className="text-base font-bold text-[#172033]">User Roles Breakdown</h2>
            <p className="text-xs text-slate-400 mt-0.5">Institutional membership distribution</p>
          </div>
          <DoughnutChart data={roleChartData} size={170} />
        </div>

        <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-sm">
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
            <div>
              <h2 className="text-base font-bold text-[#172033]">Platform User Growth</h2>
              <p className="text-xs text-slate-400 mt-0.5">New user registrations (last 6 months)</p>
            </div>
            <span className="text-xs font-semibold text-slate-500">
              Total Users: {stats?.totalUsers || 0}
            </span>
          </div>
          <TrendChart data={userGrowth} height={160} color="#172033" />
        </div>
      </div>

      {/* ─── 5. Platform Activity Ecosystem & Recent Activity Feed ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Platform Ecosystem Metrics (2 cols) */}
        <div className="lg:col-span-2 p-6 rounded-3xl bg-white border border-slate-200/90 shadow-sm">
          <div className="pb-4 mb-6 border-b border-slate-100">
            <h2 className="text-base font-bold text-[#172033]">Platform Engagement Ecosystem</h2>
            <p className="text-xs text-slate-400 mt-0.5">Cumulative activity metrics across all modules</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
              <span className="text-xs font-bold text-slate-500">Placement &amp; Internships</span>
              <p className="text-2xl font-extrabold text-[#172033] mt-2">
                {platformActivity?.totalOpportunities || 0}
              </p>
              <span className="text-[11px] text-slate-400 mt-0.5 block">Campus Drives</span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
              <span className="text-xs font-bold text-slate-500">Applications</span>
              <p className="text-2xl font-extrabold text-[#172033] mt-2">
                {platformActivity?.totalApplications || 0}
              </p>
              <span className="text-[11px] text-slate-400 mt-0.5 block">Student Submissions</span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
              <span className="text-xs font-bold text-slate-500">Mentorship Sessions</span>
              <p className="text-2xl font-extrabold text-[#172033] mt-2">
                {platformActivity?.totalMentorships || 0}
              </p>
              <span className="text-[11px] text-slate-400 mt-0.5 block">1-on-1 Engagements</span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
              <span className="text-xs font-bold text-slate-500">Referral Openings</span>
              <p className="text-2xl font-extrabold text-[#172033] mt-2">
                {platformActivity?.totalReferralOpportunities || 0}
              </p>
              <span className="text-[11px] text-slate-400 mt-0.5 block">Posted by Alumni</span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
              <span className="text-xs font-bold text-slate-500">Referral Requests</span>
              <p className="text-2xl font-extrabold text-[#172033] mt-2">
                {platformActivity?.totalReferralRequests || 0}
              </p>
              <span className="text-[11px] text-slate-400 mt-0.5 block">Candidate Inquiries</span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
              <span className="text-xs font-bold text-slate-500">Notifications</span>
              <p className="text-2xl font-extrabold text-[#172033] mt-2">
                {platformActivity?.totalNotifications || 0}
              </p>
              <span className="text-[11px] text-slate-400 mt-0.5 block">Dispatched Alerts</span>
            </div>
          </div>
        </div>

        {/* Recent Platform Feed (1 col) */}
        <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-sm flex flex-col justify-between">
          <div>
            <div className="pb-4 mb-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-[#172033]">Platform Milestones</h2>
                <p className="text-xs text-slate-400 mt-0.5">Real-time governance activity</p>
              </div>
              <Activity className="w-4 h-4 text-[#4F46E5]" />
            </div>

            <div className="space-y-3.5">
              {recentActivity?.map((act) => (
                <div key={act.id} className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-[#4F46E5] mt-1.5 flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-[#172033]">{act.title}</p>
                    <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">{act.desc}</p>
                    <span className="text-[10px] text-slate-400">{act.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-6 border-t border-slate-100 mt-6">
            <Link
              to="/tpo/opportunities"
              className="text-xs font-semibold text-[#4F46E5] hover:text-indigo-800 flex items-center justify-between"
            >
              <span>Audit Placement Drives</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPage;
