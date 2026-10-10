import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Compass,
  Users,
  Clock,
  CheckCircle2,
  Award,
  Ban,
  ArrowRight,
  Briefcase,
  Loader2,
  AlertCircle,
  MessageSquare,
  Search,
  MessageCircle,
} from 'lucide-react';
import {
  getStudentMentorships,
  completeMentorship,
  cancelMentorship,
} from '../../services/mentorshipService';
import MentorshipStatusBadge from '../../components/MentorshipStatusBadge';

export const StudentMentorshipPage = () => {
  const navigate = useNavigate();

  const [mentorships, setMentorships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('ALL');
  const [actionLoadingId, setActionLoadingId] = useState(null);

  const fetchMentorships = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getStudentMentorships();
      setMentorships(res.data?.data || []);
    } catch (err) {
      setError(
        err.response?.data?.message || 'Failed to load your mentorship records.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMentorships();
  }, []);

  const handleComplete = async (id) => {
    if (!window.confirm('Mark this mentorship as completed?')) return;
    setActionLoadingId(id);
    try {
      await completeMentorship(id);
      await fetchMentorships();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to complete mentorship.');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleCancel = async (id) => {
    if (!window.confirm('Cancel this mentorship relationship?')) return;
    setActionLoadingId(id);
    try {
      await cancelMentorship(id);
      await fetchMentorships();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to cancel mentorship.');
    } finally {
      setActionLoadingId(null);
    }
  };

  // Counts
  const counts = {
    ALL: mentorships.length,
    ACTIVE: mentorships.filter((m) => m.status === 'ACCEPTED').length,
    PENDING: mentorships.filter((m) => m.status === 'PENDING').length,
    COMPLETED: mentorships.filter((m) => m.status === 'COMPLETED').length,
  };

  // Filtered by tab
  const filtered = mentorships.filter((m) => {
    if (activeTab === 'ACTIVE') return m.status === 'ACCEPTED';
    if (activeTab === 'PENDING') return m.status === 'PENDING';
    if (activeTab === 'COMPLETED') return m.status === 'COMPLETED';
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-8 border-b border-slate-200">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-[#EEF2FF] text-[#4F46E5] mb-2">
            <Compass className="w-3.5 h-3.5" />
            Mentorship Tracking
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#172033] tracking-tight">
            My Mentorships &amp; Requests
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Track your ongoing mentor connections, pending requests, and career advisory milestones.
          </p>
        </div>

        <button
          onClick={() => navigate('/student/mentors')}
          className="px-5 py-2.5 text-xs font-semibold text-white bg-[#4F46E5] hover:bg-[#4338CA] rounded-xl transition-all shadow-xs flex items-center gap-2 flex-shrink-0"
        >
          <Search className="w-4 h-4" />
          <span>Find More Mentors</span>
        </button>
      </div>

      {/* Summary Metrics */}
      <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
            Total Relationships
          </span>
          <span className="text-2xl font-extrabold text-[#172033] mt-1 block">
            {counts.ALL}
          </span>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
          <span className="text-[11px] font-semibold text-emerald-600 uppercase tracking-wider block">
            Active Mentors
          </span>
          <span className="text-2xl font-extrabold text-emerald-700 mt-1 block">
            {counts.ACTIVE}
          </span>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
          <span className="text-[11px] font-semibold text-amber-600 uppercase tracking-wider block">
            Pending Requests
          </span>
          <span className="text-2xl font-extrabold text-amber-700 mt-1 block">
            {counts.PENDING}
          </span>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
          <span className="text-[11px] font-semibold text-indigo-600 uppercase tracking-wider block">
            Completed
          </span>
          <span className="text-2xl font-extrabold text-[#4F46E5] mt-1 block">
            {counts.COMPLETED}
          </span>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="mt-8 flex items-center gap-2 border-b border-slate-200 pb-3">
        {[
          { key: 'ALL', label: 'All', count: counts.ALL },
          { key: 'ACTIVE', label: 'Active', count: counts.ACTIVE },
          { key: 'PENDING', label: 'Pending', count: counts.PENDING },
          { key: 'COMPLETED', label: 'Completed', count: counts.COMPLETED },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
              activeTab === tab.key
                ? 'bg-[#EEF2FF] text-[#4F46E5] border border-indigo-200 shadow-2xs'
                : 'text-slate-600 hover:text-[#172033] hover:bg-slate-100'
            }`}
          >
            <span>{tab.label}</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                activeTab === tab.key
                  ? 'bg-[#4F46E5] text-white'
                  : 'bg-slate-200/80 text-slate-600'
              }`}
            >
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* List Content */}
      <div className="mt-6 space-y-4">
        {loading ? (
          <div className="p-16 flex flex-col items-center justify-center bg-white rounded-2xl border border-slate-200">
            <Loader2 className="w-8 h-8 animate-spin text-[#4F46E5] mb-3" />
            <p className="text-xs font-semibold text-slate-600">Loading your mentorships...</p>
          </div>
        ) : error ? (
          <div className="p-8 bg-rose-50 border border-rose-200 rounded-2xl text-center">
            <AlertCircle className="w-8 h-8 text-rose-500 mx-auto mb-2" />
            <p className="text-sm font-semibold text-rose-800">{error}</p>
            <button
              onClick={fetchMentorships}
              className="mt-3 px-4 py-1.5 text-xs font-semibold text-white bg-rose-600 rounded-xl hover:bg-rose-700"
            >
              Try Again
            </button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-16 bg-white rounded-2xl border border-slate-200 text-center">
            <Users className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-[#172033] mb-1">
              No mentorships in this category
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mb-4">
              Explore verified alumni working at top companies and request mentorship today.
            </p>
            <button
              onClick={() => navigate('/student/mentors')}
              className="px-5 py-2 text-xs font-semibold text-white bg-[#4F46E5] rounded-xl hover:bg-[#4338CA] transition-colors"
            >
              Browse Mentors
            </button>
          </div>
        ) : (
          filtered.map((item) => {
            const m = item.mentor || {};
            const isProcessing = actionLoadingId === item._id;

            return (
              <div
                key={item._id}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:border-slate-300 transition-all flex flex-col md:flex-row md:items-center justify-between gap-5"
              >
                {/* Left: Mentor Info & Topics */}
                <div className="flex items-start gap-4 flex-1">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#EEF2FF] to-[#E0E7FF] text-[#4F46E5] font-bold text-sm flex items-center justify-center flex-shrink-0 border border-indigo-100 shadow-2xs">
                    {m.fullName
                      ? m.fullName
                          .split(' ')
                          .map((n) => n[0])
                          .slice(0, 2)
                          .join('')
                      : 'AL'}
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-base font-bold text-[#172033]">
                        {m.fullName || 'Alumnus'}
                      </h3>
                      <MentorshipStatusBadge status={item.status} size="sm" />
                    </div>

                    <p className="text-xs text-slate-600 font-medium flex items-center gap-1.5">
                      <Briefcase className="w-3.5 h-3.5 text-slate-400" />
                      <span>{m.currentRole}</span>
                      <span className="text-slate-300">•</span>
                      <span className="font-semibold text-[#4F46E5]">{m.currentCompany}</span>
                    </p>

                    {/* Areas */}
                    {item.mentorshipAreas && item.mentorshipAreas.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {item.mentorshipAreas.map((area, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 rounded-lg text-[11px] font-medium bg-[#EEF2FF] text-[#4F46E5] border border-indigo-100"
                          >
                            {area}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Request Note */}
                    {item.requestMessage && (
                      <p className="text-xs text-slate-600 italic bg-slate-50 p-2.5 rounded-xl border border-slate-100 mt-2 max-w-xl">
                        "{item.requestMessage}"
                      </p>
                    )}

                    {/* Response Message if rejected */}
                    {item.responseMessage && (
                      <p className="text-xs text-rose-700 italic bg-rose-50 p-2.5 rounded-xl border border-rose-100 mt-2 max-w-xl">
                        Mentor note: "{item.responseMessage}"
                      </p>
                    )}

                    {/* Meta Timestamps */}
                    <p className="text-[11px] text-slate-400 pt-1">
                      {item.status === 'PENDING' &&
                        `Requested on ${new Date(item.createdAt).toLocaleDateString()}`}
                      {item.status === 'ACCEPTED' &&
                        `Active since ${new Date(item.startedAt || item.updatedAt).toLocaleDateString()}`}
                      {item.status === 'COMPLETED' &&
                        `Completed on ${new Date(item.completedAt || item.updatedAt).toLocaleDateString()}`}
                      {item.status === 'REJECTED' &&
                        `Declined on ${new Date(item.rejectedAt || item.updatedAt).toLocaleDateString()}`}
                      {item.status === 'CANCELLED' &&
                        `Cancelled on ${new Date(item.cancelledAt || item.updatedAt).toLocaleDateString()}`}
                    </p>
                  </div>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-2 flex-shrink-0 self-end md:self-center">
                  <button
                    onClick={() => navigate(`/student/mentors/${m.userId || m.id || item.alumniId}`)}
                    className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl transition-colors flex items-center gap-1 shadow-2xs"
                  >
                    <span>View Profile</span>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                  </button>

                  {item.status === 'PENDING' && (
                    <button
                      disabled={isProcessing}
                      onClick={() => handleCancel(item._id)}
                      className="px-3.5 py-2 text-xs font-semibold text-rose-700 bg-white border border-rose-200 hover:bg-rose-50 rounded-xl transition-colors flex items-center gap-1 shadow-2xs disabled:opacity-50"
                    >
                      <Ban className="w-3.5 h-3.5" />
                      <span>Cancel</span>
                    </button>
                  )}

                  {item.status === 'ACCEPTED' && (
                    <>
                      <button
                        type="button"
                        onClick={() => navigate(`/student/chat?with=${m.userId || m.id || item.alumniId}`)}
                        className="px-3.5 py-2 text-xs font-semibold text-[#4F46E5] bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-xl transition-colors flex items-center gap-1.5 shadow-2xs"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        <span>Message</span>
                      </button>
                      <button
                        disabled={isProcessing}
                        onClick={() => handleComplete(item._id)}
                        className="px-3.5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors flex items-center gap-1 shadow-2xs disabled:opacity-50"
                      >
                        <Award className="w-3.5 h-3.5" />
                        <span>Complete</span>
                      </button>
                      <button
                        disabled={isProcessing}
                        onClick={() => handleCancel(item._id)}
                        className="px-3 py-2 text-xs font-semibold text-slate-500 hover:text-slate-700 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors disabled:opacity-50"
                      >
                        End
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default StudentMentorshipPage;
