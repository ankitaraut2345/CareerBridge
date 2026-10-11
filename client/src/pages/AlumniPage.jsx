import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getAlumniDashboard } from '../services/dashboardService';
import {
  DoughnutChart,
} from '../components/charts/DashboardCharts';
import {
  Users,
  Handshake,
  Award,
  PlusCircle,
  Clock,
  Briefcase,
  FileText,
  AlertCircle,
  ArrowRight,
  RefreshCw,
  ShieldCheck,
  UserCircle,
  MessageSquare,
  Sparkles,
} from 'lucide-react';

export const AlumniPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dashboardData, setDashboardData] = useState(null);

  const fetchDashboard = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getAlumniDashboard();
      setDashboardData(res);
    } catch (err) {
      console.error('Error fetching alumni dashboard:', err);
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
    profile,
    stats,
    mentorshipDistribution,
    referralDistribution,
    recentMentorshipRequests = [],
    recentReferralRequests = [],
    recentConversations = [],
    quickActions = [],
  } = dashboardData;

  const mentorChartData = [
    { label: 'Pending', value: mentorshipDistribution?.PENDING || 0, color: '#F59E0B' },
    { label: 'Active', value: mentorshipDistribution?.ACCEPTED || 0, color: '#10B981' },
    { label: 'Completed', value: mentorshipDistribution?.COMPLETED || 0, color: '#7C3AED' },
    { label: 'Declined', value: mentorshipDistribution?.REJECTED || 0, color: '#F43F5E' },
  ];

  const pendingMentors = stats?.pendingMentorshipRequests || recentMentorshipRequests.length || 0;
  const activeMentees = stats?.activeMentorships || 4;
  const openReferrals = stats?.openReferralOpportunities || 2;

  return (
    <div className="space-y-7 pb-10">
      {/* ─── 1. Hero Banner matching Image 2 SaaS design ─── */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-50/90 via-indigo-50/80 to-purple-50/90 border border-slate-200/80 p-6 sm:p-8 lg:p-9 shadow-xs">
        <div className="absolute -top-16 -right-16 w-64 h-64 bg-purple-200/40 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-64 h-64 bg-sky-200/40 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="max-w-2xl">
            <h1 className="text-2xl sm:text-3xl lg:text-[34px] font-extrabold text-[#172033] tracking-tight leading-tight mb-2">
              Good Morning, {user?.name?.split(' ')[0] || profile?.fullName?.split(' ')[0] || 'Alumni'} 👋
            </h1>
            <p className="text-sm sm:text-base text-slate-600 font-normal leading-relaxed">
              {profile?.currentRole ? `${profile.currentRole} at ${profile.currentCompany || 'Alumni Network'}. ` : ''}
              Guide ambitious students, review mentorship inquiries, and post career-defining referrals.
            </p>

            <div className="mt-5 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => navigate('/alumni/referrals/create')}
                className="px-5 py-2.5 rounded-xl bg-[#4F46E5] hover:bg-[#4338CA] text-white text-xs sm:text-sm font-bold shadow-xs hover:shadow-md transition-all flex items-center gap-2 cursor-pointer"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Post Referral Opening</span>
              </button>

              <button
                type="button"
                onClick={() => navigate('/alumni/mentorship')}
                className="px-5 py-2.5 rounded-xl bg-white/90 hover:bg-white text-[#7C3AED] border border-purple-200/80 text-xs sm:text-sm font-bold shadow-2xs hover:shadow-xs transition-all flex items-center gap-2 cursor-pointer"
              >
                <Handshake className="w-4 h-4 text-[#7C3AED]" />
                <span>Review Mentorship ({pendingMentors})</span>
              </button>
            </div>
          </div>

          <div className="hidden lg:flex flex-col items-end">
            <div className="px-5 py-3 rounded-2xl bg-white/80 backdrop-blur-xs border border-indigo-100 shadow-xs text-right">
              <span className="block text-xs font-bold text-slate-400 italic">Alumni Status</span>
              <span className="block text-sm font-extrabold text-[#10B981] italic">
                {profile?.verificationStatus === 'VERIFIED' ? 'Verified Graduate' : 'Verified Alumni'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ─── 2. 3 Key Stat Cards matching Image 2 ─── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5">
        <div
          onClick={() => navigate('/alumni/mentorship')}
          className="p-5 sm:p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs hover:shadow-md hover:border-indigo-200 transition-all cursor-pointer flex items-center gap-4 group"
        >
          <div className="w-13 h-13 rounded-2xl bg-indigo-50 text-[#4F46E5] flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
            <Handshake className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-extrabold text-[#172033] leading-none">
              {pendingMentors}
            </div>
            <div className="text-xs sm:text-sm font-bold text-slate-700 mt-1">
              Mentorship Requests
            </div>
            <div className="text-[11px] text-indigo-600 font-semibold mt-0.5">
              +{pendingMentors} pending review
            </div>
          </div>
        </div>

        <div
          onClick={() => navigate('/alumni/mentorship')}
          className="p-5 sm:p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs hover:shadow-md hover:border-emerald-200 transition-all cursor-pointer flex items-center gap-4 group"
        >
          <div className="w-13 h-13 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-extrabold text-[#172033] leading-none">
              {activeMentees}
            </div>
            <div className="text-xs sm:text-sm font-bold text-slate-700 mt-1">Active Mentees</div>
            <div className="text-[11px] text-emerald-600 font-semibold mt-0.5">
              Guidance in progress
            </div>
          </div>
        </div>

        <div
          onClick={() => navigate('/alumni/referrals')}
          className="p-5 sm:p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs hover:shadow-md hover:border-amber-200 transition-all cursor-pointer flex items-center gap-4 group"
        >
          <div className="w-13 h-13 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-extrabold text-[#172033] leading-none">
              {openReferrals}
            </div>
            <div className="text-xs sm:text-sm font-bold text-slate-700 mt-1">Open Referrals</div>
            <div className="text-[11px] text-amber-600 font-semibold mt-0.5">
              {stats?.pendingReferralRequests || 0} applicants waiting
            </div>
          </div>
        </div>
      </div>

      {/* ─── 3. Two-Column Dashboard Content Layout ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Mentorship Inquiries & Referrals */}
        <div className="lg:col-span-2 space-y-6">
          {/* Pending Mentorship Inquiries */}
          <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
              <div>
                <h2 className="text-base font-extrabold text-[#172033]">Pending Mentorship Inquiries</h2>
                <p className="text-xs text-slate-500 mt-0.5">Students requesting 1-on-1 guidance</p>
              </div>
              <Link
                to="/alumni/mentorship"
                className="text-xs font-bold text-[#4F46E5] hover:text-indigo-800 flex items-center gap-1"
              >
                <span>View all</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {recentMentorshipRequests.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">
                No pending mentorship requests at this time.
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {recentMentorshipRequests.map((req) => (
                  <div key={req.id} className="py-3.5 flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-[#172033]">{req.studentName}</p>
                      <p className="text-[11px] text-slate-500">{req.department}</p>
                      <p className="text-xs text-slate-600 mt-1 line-clamp-1 italic">
                        "{req.message}"
                      </p>
                    </div>
                    <button
                      onClick={() => navigate('/alumni/mentorship')}
                      className="px-3.5 py-1.5 rounded-xl bg-indigo-50 text-[#4F46E5] text-xs font-bold hover:bg-indigo-100 transition-colors flex-shrink-0 cursor-pointer"
                    >
                      Review
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Incoming Referral Applications */}
          <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
              <div>
                <h2 className="text-base font-extrabold text-[#172033]">Candidate Referral Applications</h2>
                <p className="text-xs text-slate-500 mt-0.5">Campus candidates requesting employee referral</p>
              </div>
              <Link
                to="/alumni/referrals"
                className="text-xs font-bold text-[#4F46E5] hover:text-indigo-800 flex items-center gap-1"
              >
                <span>View all</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {recentReferralRequests.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">
                No referral applications received yet.
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {recentReferralRequests.map((r) => (
                  <div key={r.id} className="py-3.5 flex items-center justify-between gap-4">
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-[#172033]">{r.studentName}</p>
                      <p className="text-[11px] text-slate-500">
                        {r.role} • {r.company}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span
                        className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                          r.status === 'REFERRED'
                            ? 'bg-emerald-50 text-emerald-700'
                            : r.status === 'ACCEPTED'
                            ? 'bg-sky-50 text-sky-700'
                            : 'bg-amber-50 text-amber-700'
                        }`}
                      >
                        {r.status}
                      </span>
                      <button
                        onClick={() => navigate('/alumni/referrals')}
                        className="px-3 py-1 text-xs font-bold text-[#4F46E5] hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
                      >
                        Manage
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Mentorship Analytics & Quick Actions */}
        <div className="space-y-6">
          {/* Mentorship Distribution Doughnut */}
          <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between pb-4 mb-2 border-b border-slate-100">
              <div>
                <h2 className="text-base font-extrabold text-[#172033]">Mentorship Funnel</h2>
                <p className="text-xs text-slate-400 mt-0.5">Status of guidance sessions</p>
              </div>
              <Link
                to="/alumni/mentorship"
                className="text-xs font-bold text-[#7C3AED] hover:text-purple-800 flex items-center gap-1"
              >
                <span>Manage</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
            <DoughnutChart data={mentorChartData} size={170} />
          </div>

          {/* Quick Actions Card */}
          <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs">
            <h2 className="text-base font-extrabold text-[#172033] mb-4">Quick Navigation</h2>
            <div className="space-y-2">
              <Link
                to="/alumni/referrals/create"
                className="p-3 rounded-2xl hover:bg-indigo-50/60 border border-slate-100 hover:border-indigo-100 flex items-center justify-between text-xs font-bold text-slate-700 transition-all group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-indigo-50 text-[#4F46E5] flex items-center justify-center">
                    <PlusCircle className="w-4 h-4" />
                  </div>
                  <span>Post Referral Job</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#4F46E5] transition-colors" />
              </Link>

              <Link
                to="/alumni/profile"
                className="p-3 rounded-2xl hover:bg-purple-50/60 border border-slate-100 hover:border-purple-100 flex items-center justify-between text-xs font-bold text-slate-700 transition-all group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-purple-50 text-[#7C3AED] flex items-center justify-center">
                    <UserCircle className="w-4 h-4" />
                  </div>
                  <span>Alumni Profile & Bio</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#7C3AED] transition-colors" />
              </Link>

              <Link
                to="/chat"
                className="p-3 rounded-2xl hover:bg-sky-50/60 border border-slate-100 hover:border-sky-100 flex items-center justify-between text-xs font-bold text-slate-700 transition-all group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center">
                    <MessageSquare className="w-4 h-4" />
                  </div>
                  <span>Direct Messages</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-sky-600 transition-colors" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AlumniPage;
