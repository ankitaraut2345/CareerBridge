import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { getTpoDashboard } from '../services/dashboardService';
import {
  StatCard,
  DoughnutChart,
  TrendChart,
  HorizontalDistributionBar,
} from '../components/charts/DashboardCharts';
import {
  Building2,
  Users,
  Briefcase,
  Calendar,
  CheckCircle2,
  Clock,
  Plus,
  ArrowRight,
  RefreshCw,
  AlertCircle,
  Video,
  MapPin,
  TrendingUp,
  FileCheck,
} from 'lucide-react';

export const TpoPage = () => {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dashboardData, setDashboardData] = useState(null);

  const fetchDashboard = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getTpoDashboard();
      setDashboardData(res);
    } catch (err) {
      console.error('Error fetching TPO dashboard:', err);
      setError(err.message || 'We could not load TPO analytics. Please try again.');
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
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-4">
          {[1, 2, 3, 4, 5, 6, 7].map((i) => (
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
        <h2 className="text-lg font-bold text-slate-800">Unable to load placement analytics</h2>
        <p className="text-sm text-slate-500 mt-1">{error || 'Something went wrong.'}</p>
        <button
          onClick={fetchDashboard}
          className="mt-4 px-4 py-2 bg-[#0284C7] text-white text-xs font-semibold rounded-xl hover:bg-sky-700 transition-colors inline-flex items-center gap-1.5"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Retry
        </button>
      </div>
    );
  }

  const {
    stats,
    placementVsInternship,
    applicationStatusDistribution,
    applicationTrend,
    departmentAnalytics,
    topOpportunities,
    recentOpportunities,
    upcomingInterviews,
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

  const typeChartData = [
    { label: 'Placement Drives', value: placementVsInternship?.placements || 0, color: '#4F46E5' },
    { label: 'Internships', value: placementVsInternship?.internships || 0, color: '#38BDF8' },
  ];

  const deptBarData = (departmentAnalytics || []).map((d) => ({
    label: d.department,
    value: d.applied,
    color: '#0284C7',
  }));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-8">
      {/* ─── 1. Header & Quick Action CTAs ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-[#E0F2FE] text-[#0284C7] mb-2">
            <Building2 className="w-3.5 h-3.5" />
            TPO Placement Operations
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#172033] tracking-tight">
            Recruitment &amp; Placement Analytics
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-0.5">
            Real-time pipeline monitoring, company drives, candidate shortlisting, and placement metrics.
          </p>
        </div>

        <div className="flex items-center gap-3 self-start sm:self-auto flex-shrink-0">
          <Link
            to="/tpo/opportunities"
            className="px-4 py-2 text-xs sm:text-sm font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl transition-colors shadow-xs"
          >
            Manage Drives
          </Link>
          <Link
            to="/tpo/opportunities/create"
            className="flex items-center gap-1.5 px-4 py-2 text-xs sm:text-sm font-semibold text-white bg-[#0284C7] hover:bg-[#0369A1] rounded-xl transition-colors shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Create Opportunity</span>
          </Link>
        </div>
      </div>

      {/* ─── 2. Metric Stat Cards ─── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 sm:gap-4">
        <StatCard
          icon={Building2}
          title="Total Drives"
          value={stats?.totalOpportunities || 0}
          color="indigo"
          onClick={() => navigate('/tpo/opportunities')}
        />
        <StatCard
          icon={CheckCircle2}
          title="Active Drives"
          value={stats?.activeOpportunities || 0}
          color="sky"
          onClick={() => navigate('/tpo/opportunities')}
        />
        <StatCard
          icon={Users}
          title="Applicants"
          value={stats?.totalApplications || 0}
          color="amber"
          onClick={() => navigate('/tpo/opportunities')}
        />
        <StatCard
          icon={Calendar}
          title="Interviews"
          value={stats?.interviewsScheduled || 0}
          color="purple"
          onClick={() => navigate('/tpo/opportunities')}
        />
        <StatCard
          icon={FileCheck}
          title="Selected"
          value={stats?.selectedStudents || 0}
          color="emerald"
          onClick={() => navigate('/tpo/opportunities')}
        />
        <StatCard
          icon={Briefcase}
          title="Placements"
          value={stats?.placementsCount || 0}
          color="indigo"
          onClick={() => navigate('/tpo/opportunities')}
        />
        <StatCard
          icon={TrendingUp}
          title="Selection Rate"
          value={stats?.selectionRate || '0.0%'}
          color="emerald"
        />
      </div>

      {/* ─── 3. Application Pipeline Analytics & Trends ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Status Distribution */}
        <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-sm">
          <div className="pb-4 mb-2 border-b border-slate-100">
            <h2 className="text-base font-bold text-[#172033]">Candidate Pipeline Funnel</h2>
            <p className="text-xs text-slate-400 mt-0.5">Aggregate status across all drives</p>
          </div>
          <DoughnutChart data={statusChartData} size={160} />
        </div>

        {/* 6-Month Influx Trend */}
        <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-sm">
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
            <div>
              <h2 className="text-base font-bold text-[#172033]">Application Influx Trend</h2>
              <p className="text-xs text-slate-400 mt-0.5">Applications received (last 6 months)</p>
            </div>
            <span className="text-xs font-semibold text-slate-500">
              Total: {stats?.totalApplications || 0}
            </span>
          </div>
          <TrendChart data={applicationTrend} height={160} color="#0284C7" />
        </div>

        {/* Placement vs Internship Breakdown */}
        <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-sm">
          <div className="pb-4 mb-2 border-b border-slate-100">
            <h2 className="text-base font-bold text-[#172033]">Placement vs Internship</h2>
            <p className="text-xs text-slate-400 mt-0.5">Opportunity type distribution</p>
          </div>
          <DoughnutChart data={typeChartData} size={160} />
        </div>
      </div>

      {/* ─── 4. Department Analytics & Upcoming Interviews ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Department Participation */}
        <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-sm flex flex-col justify-between">
          <div>
            <div className="pb-4 mb-4 border-b border-slate-100">
              <h2 className="text-base font-bold text-[#172033]">Department Participation</h2>
              <p className="text-xs text-slate-400 mt-0.5">Applications submitted by academic branch</p>
            </div>

            {deptBarData.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-400">
                No department data recorded yet.
              </div>
            ) : (
              <HorizontalDistributionBar data={deptBarData} />
            )}
          </div>
        </div>

        {/* Upcoming Scheduled Interviews */}
        <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
              <div>
                <h2 className="text-base font-bold text-[#172033]">Upcoming Scheduled Interviews</h2>
                <p className="text-xs text-slate-400 mt-0.5">Candidate rounds scheduled across all drives</p>
              </div>
              <Link
                to="/tpo/opportunities"
                className="text-xs font-semibold text-[#0284C7] hover:text-sky-800"
              >
                Manage
              </Link>
            </div>

            {upcomingInterviews?.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-400">
                No active interviews currently scheduled.
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {upcomingInterviews.map((item, idx) => (
                  <div key={idx} className="py-3 flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-[#172033]">{item.studentName}</p>
                      <p className="text-[11px] text-slate-500">
                        {item.role} • {item.company}
                      </p>
                      <span className="text-[10px] font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded mt-1 inline-block">
                        {item.round}
                      </span>
                    </div>

                    <div className="text-right text-xs text-slate-600 flex-shrink-0">
                      <p className="font-semibold">{item.date}</p>
                      <p className="text-[11px] text-slate-400">{item.startTime}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ─── 5. Recent Campus Drives Table ─── */}
      <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-sm">
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
          <div>
            <h2 className="text-base font-bold text-[#172033]">Recent Campus Drives &amp; Openings</h2>
            <p className="text-xs text-slate-400 mt-0.5">Overview of active company recruitments</p>
          </div>
          <Link
            to="/tpo/opportunities"
            className="text-xs font-semibold text-[#0284C7] hover:text-sky-800 flex items-center gap-1"
          >
            <span>View all opportunities</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {recentOpportunities?.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-400">
            No opportunities created yet. Create one to get started.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-y border-slate-100">
                <tr>
                  <th className="py-3 px-4">Opportunity</th>
                  <th className="py-3 px-4">Company</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Applicants</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentOpportunities.map((opp) => (
                  <tr key={opp.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-bold text-[#172033]">{opp.title}</td>
                    <td className="py-3 px-4 text-slate-600">{opp.companyName}</td>
                    <td className="py-3 px-4">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                        {opp.type}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          opp.status === 'PUBLISHED'
                            ? 'bg-emerald-50 text-emerald-700'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {opp.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-semibold text-[#172033]">{opp.applicantCount || 0}</td>
                    <td className="py-3 px-4 text-right">
                      <Link
                        to={`/tpo/opportunities/${opp.id}/applicants`}
                        className="text-xs font-semibold text-[#0284C7] hover:text-sky-800"
                      >
                        View Applicants
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default TpoPage;
