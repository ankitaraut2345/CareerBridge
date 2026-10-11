import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getTpoDashboard } from '../services/dashboardService';
import {
  DoughnutChart,
  TrendChart,
  HorizontalDistributionBar,
} from '../components/charts/DashboardCharts';
import {
  Building2,
  Users,
  Briefcase,
  FileText,
  Calendar,
  Plus,
  ArrowRight,
  RefreshCw,
  AlertCircle,
  TrendingUp,
  FileCheck,
  CheckCircle2,
  Clock,
} from 'lucide-react';

export const TpoPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

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

  if (error || !dashboardData) {
    return (
      <div className="max-w-xl mx-auto my-16 p-8 rounded-3xl bg-white border border-rose-100 text-center shadow-xs">
        <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-3">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h2 className="text-lg font-bold text-slate-800">Unable to load dashboard</h2>
        <p className="text-sm text-slate-500 mt-1">{error || 'Something went wrong.'}</p>
        <button
          onClick={fetchDashboard}
          className="mt-4 px-4 py-2 bg-[#4F46E5] text-white text-xs font-semibold rounded-xl hover:bg-indigo-700 transition-colors inline-flex items-center gap-1.5 cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Retry
        </button>
      </div>
    );
  }

  const {
    stats,
    applicationStatusDistribution,
    placementVsInternship,
    departmentAnalytics = [],
    applicationTrend = [],
    upcomingInterviews = [],
    recentOpportunities = [],
  } = dashboardData;

  const statusChartData = [
    { label: 'Applied', value: applicationStatusDistribution?.APPLIED || 0, color: '#38BDF8' },
    { label: 'Shortlisted', value: applicationStatusDistribution?.SHORTLISTED || 0, color: '#6366F1' },
    { label: 'Interview', value: applicationStatusDistribution?.INTERVIEW || 0, color: '#F59E0B' },
    { label: 'Selected', value: applicationStatusDistribution?.SELECTED || 0, color: '#10B981' },
    { label: 'Rejected', value: applicationStatusDistribution?.REJECTED || 0, color: '#F43F5E' },
  ];

  const typeChartData = [
    { label: 'Placements', value: placementVsInternship?.placements || 0, color: '#4F46E5' },
    { label: 'Internships', value: placementVsInternship?.internships || 0, color: '#38BDF8' },
  ];

  const activeDrives = stats?.activeOpportunities || recentOpportunities.length || 0;
  const totalApps = stats?.totalApplications || 0;
  const scheduledInterviews = stats?.interviewsScheduled || upcomingInterviews.length || 0;

  return (
    <div className="space-y-7 pb-10">
      {/* ─── 1. Hero Banner matching Image 2 SaaS design ─── */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-50/90 via-indigo-50/80 to-purple-50/90 border border-slate-200/80 p-6 sm:p-8 lg:p-9 shadow-xs">
        <div className="absolute -top-16 -right-16 w-64 h-64 bg-purple-200/40 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-64 h-64 bg-sky-200/40 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="max-w-2xl">
            <h1 className="text-2xl sm:text-3xl lg:text-[34px] font-extrabold text-[#172033] tracking-tight leading-tight mb-2">
              Good Morning, {user?.name?.split(' ')[0] || 'Officer'} 👋
            </h1>
            <p className="text-sm sm:text-base text-slate-600 font-normal leading-relaxed">
              Campus placement command center: manage recruitment drives, review candidate shortlists, and track hiring conversion.
            </p>

            <div className="mt-5 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => navigate('/tpo/opportunities/create')}
                className="px-5 py-2.5 rounded-xl bg-[#4F46E5] hover:bg-[#4338CA] text-white text-xs sm:text-sm font-bold shadow-xs hover:shadow-md transition-all flex items-center gap-2 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Create Opportunity</span>
              </button>

              <button
                type="button"
                onClick={() => navigate('/tpo/opportunities')}
                className="px-5 py-2.5 rounded-xl bg-white/90 hover:bg-white text-[#4F46E5] border border-indigo-200/80 text-xs sm:text-sm font-bold shadow-2xs hover:shadow-xs transition-all flex items-center gap-2 cursor-pointer"
              >
                <Building2 className="w-4 h-4 text-[#4F46E5]" />
                <span>Manage Placement Drives ({activeDrives})</span>
              </button>
            </div>
          </div>

          <div className="hidden lg:flex flex-col items-end">
            <div className="px-5 py-3 rounded-2xl bg-white/80 backdrop-blur-xs border border-indigo-100 shadow-xs text-right">
              <span className="block text-xs font-bold text-slate-400 italic">Season 2026</span>
              <span className="block text-sm font-extrabold text-[#4F46E5] italic">
                Campus Drive Active
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ─── 2. 3 Key Stat Cards matching Image 2 ─── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5">
        <div
          onClick={() => navigate('/tpo/opportunities')}
          className="p-5 sm:p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs hover:shadow-md hover:border-indigo-200 transition-all cursor-pointer flex items-center gap-4 group"
        >
          <div className="w-13 h-13 rounded-2xl bg-indigo-50 text-[#4F46E5] flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-extrabold text-[#172033] leading-none">
              {activeDrives}
            </div>
            <div className="text-xs sm:text-sm font-bold text-slate-700 mt-1">
              Active Placement Drives
            </div>
            <div className="text-[11px] text-indigo-600 font-semibold mt-0.5">
              +{activeDrives} hiring open
            </div>
          </div>
        </div>

        <div
          onClick={() => navigate('/tpo/opportunities')}
          className="p-5 sm:p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs hover:shadow-md hover:border-emerald-200 transition-all cursor-pointer flex items-center gap-4 group"
        >
          <div className="w-13 h-13 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-extrabold text-[#172033] leading-none">
              {totalApps}
            </div>
            <div className="text-xs sm:text-sm font-bold text-slate-700 mt-1">Total Applications</div>
            <div className="text-[11px] text-emerald-600 font-semibold mt-0.5">
              Candidate submissions
            </div>
          </div>
        </div>

        <div
          onClick={() => navigate('/tpo/opportunities')}
          className="p-5 sm:p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs hover:shadow-md hover:border-amber-200 transition-all cursor-pointer flex items-center gap-4 group"
        >
          <div className="w-13 h-13 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-extrabold text-[#172033] leading-none">
              {scheduledInterviews}
            </div>
            <div className="text-xs sm:text-sm font-bold text-slate-700 mt-1">Interviews Scheduled</div>
            <div className="text-[11px] text-amber-600 font-semibold mt-0.5">
              Across company partners
            </div>
          </div>
        </div>
      </div>

      {/* ─── 3. Two-Column Dashboard Content Layout ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Recent Drives Table & Candidate Pipeline Funnel */}
        <div className="lg:col-span-2 space-y-6">
          {/* Recent Campus Drives Table */}
          <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
              <div>
                <h2 className="text-base font-extrabold text-[#172033]">Recent Campus Drives</h2>
                <p className="text-xs text-slate-500 mt-0.5">Live recruitments open for student applications</p>
              </div>
              <Link
                to="/tpo/opportunities"
                className="text-xs font-bold text-[#4F46E5] hover:text-indigo-800 flex items-center gap-1"
              >
                <span>View all</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {recentOpportunities.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">
                No opportunities created yet. Click "Create Opportunity" to launch a drive.
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
                      <th className="py-3 px-4 text-right">Applicants</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {recentOpportunities.slice(0, 5).map((opp) => (
                      <tr key={opp.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3.5 px-4 font-bold text-[#172033]">{opp.title}</td>
                        <td className="py-3.5 px-4 text-slate-600">{opp.companyName}</td>
                        <td className="py-3.5 px-4">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                            {opp.type}
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                              opp.status === 'PUBLISHED'
                                ? 'bg-emerald-50 text-emerald-700'
                                : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            {opp.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right font-extrabold text-[#4F46E5]">
                          <Link
                            to={`/tpo/opportunities/${opp.id}/applicants`}
                            className="hover:underline"
                          >
                            {opp.applicantCount || 0} candidates
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Candidate Funnel & Influx */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs">
              <div className="pb-4 mb-2 border-b border-slate-100">
                <h2 className="text-base font-extrabold text-[#172033]">Candidate Funnel</h2>
                <p className="text-xs text-slate-400 mt-0.5">Aggregate status distribution</p>
              </div>
              <DoughnutChart data={statusChartData} size={150} />
            </div>

            <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs">
              <div className="pb-4 mb-2 border-b border-slate-100">
                <h2 className="text-base font-extrabold text-[#172033]">Opportunity Types</h2>
                <p className="text-xs text-slate-400 mt-0.5">Placements vs Internships</p>
              </div>
              <DoughnutChart data={typeChartData} size={150} />
            </div>
          </div>
        </div>

        {/* Right Column: Upcoming Interviews & Quick Actions */}
        <div className="space-y-6">
          {/* Upcoming Scheduled Interviews */}
          <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
              <div>
                <h2 className="text-base font-extrabold text-[#172033]">Scheduled Interviews</h2>
                <p className="text-xs text-slate-400 mt-0.5">Active hiring rounds</p>
              </div>
              <Link
                to="/tpo/opportunities"
                className="text-xs font-bold text-[#4F46E5] hover:text-indigo-800"
              >
                Manage
              </Link>
            </div>

            {upcomingInterviews.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">
                No active interviews scheduled right now.
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {upcomingInterviews.slice(0, 4).map((item, idx) => (
                  <div key={idx} className="py-3 flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-[#172033]">{item.studentName}</p>
                      <p className="text-[11px] text-slate-500">
                        {item.role} • {item.company}
                      </p>
                      <span className="text-[10px] font-semibold text-[#4F46E5] bg-indigo-50 px-2 py-0.5 rounded mt-1 inline-block">
                        {item.round}
                      </span>
                    </div>
                    <div className="text-right text-xs text-slate-600 flex-shrink-0">
                      <p className="font-bold">{item.date}</p>
                      <p className="text-[11px] text-slate-400">{item.startTime}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Actions Card */}
          <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs">
            <h2 className="text-base font-extrabold text-[#172033] mb-4">Quick Navigation</h2>
            <div className="space-y-2">
              <Link
                to="/tpo/opportunities/create"
                className="p-3 rounded-2xl hover:bg-indigo-50/60 border border-slate-100 hover:border-indigo-100 flex items-center justify-between text-xs font-bold text-slate-700 transition-all group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-indigo-50 text-[#4F46E5] flex items-center justify-center">
                    <Plus className="w-4 h-4" />
                  </div>
                  <span>Create Placement Drive</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#4F46E5] transition-colors" />
              </Link>

              <Link
                to="/tpo/opportunities"
                className="p-3 rounded-2xl hover:bg-sky-50/60 border border-slate-100 hover:border-sky-100 flex items-center justify-between text-xs font-bold text-slate-700 transition-all group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center">
                    <Building2 className="w-4 h-4" />
                  </div>
                  <span>Manage All Drives</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-sky-600 transition-colors" />
              </Link>

              <Link
                to="/student/mentors"
                className="p-3 rounded-2xl hover:bg-purple-50/60 border border-slate-100 hover:border-purple-100 flex items-center justify-between text-xs font-bold text-slate-700 transition-all group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-purple-50 text-[#7C3AED] flex items-center justify-center">
                    <Users className="w-4 h-4" />
                  </div>
                  <span>Browse Alumni Mentors</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#7C3AED] transition-colors" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TpoPage;
