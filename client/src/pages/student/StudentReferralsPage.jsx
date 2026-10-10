import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Building2,
  Sparkles,
  Info,
  Clock,
  Loader2,
  AlertCircle,
  X,
  ArrowRight,
  CheckCircle2,
  Send,
} from 'lucide-react';
import ReferralCard from '../../components/ReferralCard';
import RequestReferralModal from '../../components/RequestReferralModal';
import { getReferralOpportunities } from '../../services/referralService';

export const StudentReferralsPage = () => {
  const navigate = useNavigate();

  // Search & Filter state
  const [search, setSearch] = useState('');
  const [company, setCompany] = useState('');
  const [industry, setIndustry] = useState('');
  const [workMode, setWorkMode] = useState('');
  const [location, setLocation] = useState('');
  const [sort, setSort] = useState('recommended');

  // Data state
  const [referrals, setReferrals] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal & Toast state
  const [selectedReferral, setSelectedReferral] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  const fetchReferrals = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getReferralOpportunities({
        search,
        company,
        industry,
        workMode,
        location,
        sort,
      });
      const data = res.data?.data || {};
      setReferrals(data.referrals || []);
      setTotal(data.total || 0);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          'Failed to load referral opportunities. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReferrals();
  }, [company, industry, workMode, location, sort]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchReferrals();
  };

  const handleClearFilters = () => {
    setSearch('');
    setCompany('');
    setIndustry('');
    setWorkMode('');
    setLocation('');
    setSort('recommended');
  };

  const handleRequestSuccess = () => {
    setToastMessage(`Referral request sent for ${selectedReferral?.role} at ${selectedReferral?.companyName}!`);
    setTimeout(() => setToastMessage(null), 5000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-900 text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-3 border border-emerald-700 animate-in slide-in-from-bottom duration-200">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
          <span className="text-xs font-semibold">{toastMessage}</span>
          <button
            onClick={() => setToastMessage(null)}
            className="text-emerald-300 hover:text-white ml-2"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-8 border-b border-slate-200">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-[#EEF2FF] text-[#4F46E5] mb-2">
            <Building2 className="w-3.5 h-3.5" />
            Alumni Career Referrals
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#172033] tracking-tight">
            Alumni Referral Opportunities
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Request internal employee referrals directly from verified campus alumni working at top organizations.
          </p>
        </div>

        <div className="flex items-center gap-3 flex-shrink-0">
          <button
            onClick={() => navigate('/student/referrals/my')}
            className="px-4 py-2 text-xs font-semibold text-[#4F46E5] bg-white border border-[#4F46E5] rounded-xl hover:bg-[#EEF2FF] transition-colors flex items-center gap-1.5 shadow-2xs"
          >
            <Send className="w-4 h-4" />
            <span>My Referral Requests</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Match & Disclaimer Banner */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Match Scoring Note */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-[#EEF2FF] to-white border border-indigo-100 flex items-start gap-3">
          <div className="w-8 h-8 rounded-xl bg-white shadow-xs text-[#4F46E5] flex items-center justify-center flex-shrink-0 border border-indigo-50">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-xs font-bold text-[#172033] flex items-center gap-1.5">
              <span>Profile-Based Match</span>
              <span className="px-2 py-0.2 rounded-full text-[10px] bg-[#4F46E5] text-white font-semibold">
                Deterministic
              </span>
            </h2>
            <p className="text-xs text-slate-600 mt-0.5">
              Referrals are ranked based on overlapping skills, target roles, and industries from your student profile.
            </p>
          </div>
        </div>

        {/* Hiring Disclaimer */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-start gap-3">
          <div className="w-8 h-8 rounded-xl bg-white shadow-xs text-slate-500 flex items-center justify-center flex-shrink-0 border border-slate-200">
            <Info className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-xs font-bold text-[#172033]">
              Hiring Notice
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Referral support does not guarantee interview shortlisting or job offers. Final hiring decisions are made solely by the hiring company.
            </p>
          </div>
        </div>
      </div>

      {/* Search and Filters Bar */}
      <div className="mt-6 bg-white rounded-2xl border border-slate-200 p-4 shadow-sm space-y-4">
        {/* Search Input */}
        <form onSubmit={handleSearchSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by company, role title, skills (e.g., Google, React, Python)..."
              className="w-full pl-10 pr-4 py-2.5 text-xs text-slate-900 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4F46E5] focus:border-transparent bg-slate-50/50 focus:bg-white"
            />
          </div>
          <button
            type="submit"
            className="px-5 py-2.5 bg-[#4F46E5] hover:bg-[#4338CA] text-white text-xs font-semibold rounded-xl transition-colors flex items-center gap-1.5 shadow-2xs"
          >
            <span>Search</span>
          </button>
        </form>

        {/* Filter Dropdowns */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-3 pt-2 border-t border-slate-100">
          {/* Company */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
              Company
            </label>
            <select
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              className="w-full text-xs py-2 px-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#4F46E5]"
            >
              <option value="">All Companies</option>
              <option value="Google">Google</option>
              <option value="Microsoft">Microsoft</option>
              <option value="Amazon">Amazon</option>
              <option value="Flipkart">Flipkart</option>
              <option value="Samsung">Samsung</option>
            </select>
          </div>

          {/* Work Mode */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
              Work Mode
            </label>
            <select
              value={workMode}
              onChange={(e) => setWorkMode(e.target.value)}
              className="w-full text-xs py-2 px-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#4F46E5]"
            >
              <option value="">All Work Modes</option>
              <option value="Hybrid">Hybrid</option>
              <option value="Remote">Remote</option>
              <option value="Onsite">Onsite</option>
            </select>
          </div>

          {/* Industry */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
              Industry
            </label>
            <select
              value={industry}
              onChange={(e) => setIndustry(e.target.value)}
              className="w-full text-xs py-2 px-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#4F46E5]"
            >
              <option value="">All Industries</option>
              <option value="Technology">Technology</option>
              <option value="E-commerce">E-commerce</option>
              <option value="Finance">Finance</option>
              <option value="Manufacturing">Manufacturing</option>
            </select>
          </div>

          {/* Location */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
              Location
            </label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. Bengaluru"
              className="w-full text-xs py-2 px-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#4F46E5]"
            />
          </div>

          {/* Sort By */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
              Sort By
            </label>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="w-full text-xs py-2 px-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#4F46E5]"
            >
              <option value="recommended">Profile Match</option>
              <option value="newest">Newest First</option>
              <option value="deadline">Application Deadline</option>
              <option value="company">Company Name</option>
            </select>
          </div>
        </div>

        {/* Clear Filters if active */}
        {(search || company || industry || workMode || location || sort !== 'recommended') && (
          <div className="flex items-center justify-between pt-1">
            <span className="text-xs text-slate-500">Active filters applied</span>
            <button
              onClick={handleClearFilters}
              className="text-xs font-semibold text-[#4F46E5] hover:underline flex items-center gap-1"
            >
              <X className="w-3.5 h-3.5" />
              <span>Reset filters</span>
            </button>
          </div>
        )}
      </div>

      {/* Referrals Grid */}
      <div className="mt-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-bold text-[#172033]">
            Open Referral Opportunities ({total})
          </h2>
          <span className="text-xs text-slate-400">
            Posted by verified campus alumni
          </span>
        </div>

        {loading ? (
          <div className="p-16 flex flex-col items-center justify-center bg-white rounded-2xl border border-slate-200">
            <Loader2 className="w-8 h-8 animate-spin text-[#4F46E5] mb-3" />
            <p className="text-xs font-semibold text-slate-600">
              Matching and loading referral opportunities...
            </p>
          </div>
        ) : error ? (
          <div className="p-8 bg-rose-50 border border-rose-200 rounded-2xl text-center">
            <AlertCircle className="w-8 h-8 text-rose-500 mx-auto mb-2" />
            <p className="text-sm font-semibold text-rose-800">{error}</p>
            <button
              onClick={fetchReferrals}
              className="mt-3 px-4 py-1.5 text-xs font-semibold text-white bg-rose-600 rounded-xl hover:bg-rose-700"
            >
              Try Again
            </button>
          </div>
        ) : referrals.length === 0 ? (
          <div className="p-16 bg-white rounded-2xl border border-slate-200 text-center">
            <Building2 className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-[#172033] mb-1">
              No referral opportunities match your search
            </h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto mb-4">
              Try broadening your filters or clearing search criteria to view open referrals.
            </p>
            <button
              onClick={handleClearFilters}
              className="px-4 py-2 text-xs font-semibold text-[#4F46E5] bg-[#EEF2FF] rounded-xl hover:bg-indigo-100"
            >
              Clear All Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {referrals.map((referral) => (
              <ReferralCard
                key={referral.id || referral._id}
                referral={referral}
                onRequestClick={(ref) => setSelectedReferral(ref)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Request Referral Modal */}
      {selectedReferral && (
        <RequestReferralModal
          referral={selectedReferral}
          isOpen={Boolean(selectedReferral)}
          onClose={() => setSelectedReferral(null)}
          onSuccess={handleRequestSuccess}
        />
      )}
    </div>
  );
};

export default StudentReferralsPage;
