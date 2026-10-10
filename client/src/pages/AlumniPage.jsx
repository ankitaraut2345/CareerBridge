import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getAlumniDashboard } from '../services/dashboardService';
import {
  StatCard,
  DoughnutChart,
} from '../components/charts/DashboardCharts';
import {
  Users,
  Handshake,
  Award,
  MessageCircle,
  PlusCircle,
  CheckCircle2,
  Clock,
  Building,
  Briefcase,
  FileText,
  AlertCircle,
  ArrowRight,
  RefreshCw,
  ExternalLink,
  ShieldCheck,
  UserCircle,
  Bell,
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
        <div className="h-28 rounded-2xl bg-slate-100 animate-pulse" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
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
          className="mt-4 px-4 py-2 bg-[#7C3AED] text-white text-xs font-semibold rounded-xl hover:bg-purple-800 transition-colors inline-flex items-center gap-1.5"
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
    recentMentorshipRequests,
    recentReferralRequests,
    recentConversations,
    recentNotifications,
    quickActions,
  } = dashboardData;

  const mentorChartData = [
    { label: 'Pending', value: mentorshipDistribution?.PENDING || 0, color: '#F59E0B' },
    { label: 'Active', value: mentorshipDistribution?.ACCEPTED || 0, color: '#10B981' },
    { label: 'Completed', value: mentorshipDistribution?.COMPLETED || 0, color: '#7C3AED' },
    { label: 'Declined', value: mentorshipDistribution?.REJECTED || 0, color: '#F43F5E' },
  ];

  const referralChartData = [
    { label: 'Pending', value: referralDistribution?.PENDING || 0, color: '#F59E0B' },
    { label: 'Accepted', value: referralDistribution?.ACCEPTED || 0, color: '#38BDF8' },
    { label: 'Referred', value: referralDistribution?.REFERRED || 0, color: '#10B981' },
    { label: 'Completed', value: referralDistribution?.COMPLETED || 0, color: '#7C3AED' },
    { label: 'Declined', value: referralDistribution?.REJECTED || 0, color: '#F43F5E' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-8">
      {/* ─── 1. Welcome & Status Banner ─── */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#1E1B4B] via-[#2E1065] to-[#4C1D95] text-white p-6 sm:p-8 shadow-md">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white/10 text-purple-200 border border-white/10">
                <Users className="w-3.5 h-3.5" />
                Alumni Network &amp; Mentorship
              </span>

              {profile?.verificationStatus === 'VERIFIED' ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Verified Graduate
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  <Clock className="w-3.5 h-3.5" />
                  Verification Pending
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Welcome back, {user?.name || profile?.fullName} 👋
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm max-w-xl">
              {profile?.currentRole} at {profile?.currentCompany}. Guide campus talent and empower next-gen professionals.
            </p>
          </div>

          {/* Quick Create Referral CTA */}
          <div className="flex items-center gap-3 flex-shrink-0">
            <Link
              to="/alumni/referrals/create"
              className="px-5 py-2.5 rounded-xl bg-white text-[#7C3AED] hover:bg-purple-50 text-xs sm:text-sm font-bold shadow-sm transition-colors inline-flex items-center gap-2"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Post Referral Opening</span>
            </Link>
            <Link
              to="/alumni/profile"
              className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs sm:text-sm font-semibold border border-white/15 transition-colors inline-flex items-center gap-1.5"
            >
              <UserCircle className="w-4 h-4" />
              <span>Profile</span>
            </Link>
          </div>
        </div>
      </div>

      {/* ─── 2. Metric Stat Cards ─── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
        <StatCard
          icon={Handshake}
          title="Mentorship Requests"
          value={stats?.pendingMentorshipRequests || 0}
          color="amber"
          onClick={() => navigate('/alumni/mentorship')}
        />
        <StatCard
          icon={Users}
          title="Active Mentees"
          value={stats?.activeMentorships || 0}
          color="purple"
          onClick={() => navigate('/alumni/mentorship')}
        />
        <StatCard
          icon={CheckCircle2}
          title="Completed Mentees"
          value={stats?.completedMentorships || 0}
          color="emerald"
          onClick={() => navigate('/alumni/mentorship')}
        />
        <StatCard
          icon={Award}
          title="Open Referral Jobs"
          value={stats?.openReferralOpportunities || 0}
          color="indigo"
          onClick={() => navigate('/alumni/referrals')}
        />
        <StatCard
          icon={FileText}
          title="Referral Requests"
          value={stats?.pendingReferralRequests || 0}
          color="rose"
          onClick={() => navigate('/alumni/referrals')}
        />
        <StatCard
          icon={MessageCircle}
          title="Active Chats"
          value={stats?.activeConversations || 0}
          color="sky"
          onClick={() => navigate('/alumni/chat')}
        />
      </div>

      {/* ─── 3. Analytics (Mentorship & Referral Breakdown) ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-sm">
          <div className="flex items-center justify-between pb-4 mb-2 border-b border-slate-100">
            <div>
              <h2 className="text-base font-bold text-[#172033]">Mentorship Distribution</h2>
              <p className="text-xs text-slate-400 mt-0.5">Overview of guidance requests &amp; sessions</p>
            </div>
            <Link
              to="/alumni/mentorship"
              className="text-xs font-semibold text-[#7C3AED] hover:text-purple-800 flex items-center gap-1"
            >
              <span>Manage</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <DoughnutChart data={mentorChartData} size={170} />
        </div>

        <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-sm">
          <div className="flex items-center justify-between pb-4 mb-2 border-b border-slate-100">
            <div>
              <h2 className="text-base font-bold text-[#172033]">Referral Requests Distribution</h2>
              <p className="text-xs text-slate-400 mt-0.5">Candidate funnel for posted referral opportunities</p>
            </div>
            <Link
              to="/alumni/referrals"
              className="text-xs font-semibold text-[#7C3AED] hover:text-purple-800 flex items-center gap-1"
            >
              <span>Manage</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <DoughnutChart data={referralChartData} size={170} />
        </div>
      </div>

      {/* ─── 4. Incoming Action Items: Mentorship & Referrals ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending Mentorship Requests */}
        <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
              <div>
                <h2 className="text-base font-bold text-[#172033]">Pending Mentorship Inquiries</h2>
                <p className="text-xs text-slate-400 mt-0.5">Students seeking your advice and guidance</p>
              </div>
              <Link
                to="/alumni/mentorship"
                className="text-xs font-semibold text-[#7C3AED] hover:text-purple-800"
              >
                View all
              </Link>
            </div>

            {recentMentorshipRequests?.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">
                No pending mentorship requests at this time.
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {recentMentorshipRequests.map((req) => (
                  <div key={req.id} className="py-3 flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-[#172033]">{req.studentName}</p>
                      <p className="text-[11px] text-slate-500">{req.department}</p>
                      <p className="text-xs text-slate-600 mt-1 line-clamp-1 italic">
                        "{req.message}"
                      </p>
                    </div>
                    <button
                      onClick={() => navigate('/alumni/mentorship')}
                      className="px-3 py-1.5 rounded-lg bg-purple-50 text-[#7C3AED] text-xs font-semibold hover:bg-purple-100 transition-colors flex-shrink-0"
                    >
                      Review
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Incoming Referral Requests */}
        <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
              <div>
                <h2 className="text-base font-bold text-[#172033]">Incoming Referral Applicants</h2>
                <p className="text-xs text-slate-400 mt-0.5">Candidates requesting employee referral</p>
              </div>
              <Link
                to="/alumni/referrals"
                className="text-xs font-semibold text-[#7C3AED] hover:text-purple-800"
              >
                View all
              </Link>
            </div>

            {recentReferralRequests?.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">
                No referral applications received yet.
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {recentReferralRequests.map((r) => (
                  <div key={r.id} className="py-3 flex items-center justify-between gap-4">
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-[#172033]">{r.studentName}</p>
                      <p className="text-[11px] text-slate-500">
                        {r.role} • {r.company}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
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
                        className="px-2.5 py-1 text-xs font-semibold text-[#7C3AED] hover:bg-purple-50 rounded-lg transition-colors"
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
      </div>

      {/* ─── 5. Recent Conversations & Quick Actions ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 p-6 rounded-3xl bg-white border border-slate-200/90 shadow-sm">
          <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
            <h2 className="text-base font-bold text-[#172033]">Recent Direct Conversations</h2>
            <Link
              to="/alumni/chat"
              className="text-xs font-semibold text-[#7C3AED] hover:text-purple-800"
            >
              Open Messenger
            </Link>
          </div>

          {recentConversations?.length === 0 ? (
            <p className="py-6 text-center text-xs text-slate-400">No active chat messages yet.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {recentConversations.map((c) => (
                <div
                  key={c.id}
                  onClick={() => navigate('/alumni/chat')}
                  className="p-3.5 rounded-2xl bg-slate-50 hover:bg-purple-50/50 border border-slate-200/80 hover:border-purple-200 transition-all cursor-pointer flex items-center gap-3"
                >
                  <div className="w-8 h-8 rounded-full bg-purple-100 text-[#7C3AED] flex items-center justify-center font-bold text-xs flex-shrink-0">
                    {c.otherUserName ? c.otherUserName.charAt(0).toUpperCase() : 'S'}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-[#172033] truncate">{c.otherUserName}</p>
                    <p className="text-[11px] text-slate-500 truncate">{c.lastMessage}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-sm flex flex-col justify-between">
          <div>
            <h2 className="text-base font-bold text-[#172033] mb-4">Quick Navigation</h2>
            <div className="space-y-2">
              {quickActions?.map((act, idx) => (
                <Link
                  key={idx}
                  to={act.path}
                  className="p-2.5 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-200 flex items-center justify-between text-xs font-semibold text-slate-700 transition-all"
                >
                  <span>{act.label}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AlumniPage;
