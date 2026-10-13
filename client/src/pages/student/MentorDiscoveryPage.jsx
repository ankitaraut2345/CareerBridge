import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Search,
  Filter,
  Sparkles,
  Users,
  Briefcase,
  Layers,
  Award,
  Loader2,
  AlertCircle,
  X,
  Compass,
  ArrowRight,
  CheckCircle2,
  MapPin,
  GraduationCap,
  SlidersHorizontal,
  RotateCcw,
} from 'lucide-react';
import MentorCard from '../../components/MentorCard';
import RequestMentorshipModal from '../../components/RequestMentorshipModal';
import { getMentors } from '../../services/mentorshipService';

export const MentorDiscoveryPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Search state with debounce (supports URL query params)
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [debouncedSearch, setDebouncedSearch] = useState(searchParams.get('search') || '');

  // Filter states (supports URL query params)
  const [area, setArea] = useState(searchParams.get('area') || '');
  const [company, setCompany] = useState(searchParams.get('company') || '');
  const [department, setDepartment] = useState(searchParams.get('department') || '');
  const [industry, setIndustry] = useState(searchParams.get('industry') || '');
  const [location, setLocation] = useState(searchParams.get('location') || '');
  const [graduationYear, setGraduationYear] = useState(searchParams.get('graduationYear') || '');
  const [minExp, setMinExp] = useState(searchParams.get('minExp') || '');
  const [availability, setAvailability] = useState(searchParams.get('availability') || 'all');
  const [sort, setSort] = useState(searchParams.get('sort') || 'recommended');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(
    Boolean(
      searchParams.get('location') ||
      searchParams.get('industry') ||
      searchParams.get('graduationYear') ||
      (searchParams.get('availability') && searchParams.get('availability') !== 'all')
    )
  );

  // Data state
  const [mentors, setMentors] = useState([]);
  const [total, setTotal] = useState(0);
  const [hasStudentProfile, setHasStudentProfile] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal & Toast state
  const [selectedMentor, setSelectedMentor] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  // Debounce search input by 300ms
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const fetchMentors = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getMentors({
        search: debouncedSearch,
        company,
        department,
        industry,
        location,
        graduationYear,
        area,
        minExp,
        availability,
        sort,
      });

      // Defensive unwrap: handles { success, data: { mentors, total } } or direct { mentors, total }
      const payload = res?.data?.mentors ? res.data : (res?.data ?? res ?? {});
      const mentorsList = payload.mentors || (Array.isArray(payload) ? payload : []);

      setMentors(mentorsList);
      setTotal(payload.total !== undefined ? payload.total : mentorsList.length);
      setHasStudentProfile(Boolean(payload.hasStudentProfile));
    } catch (err) {
      console.error('[MentorDiscoveryPage] Error fetching mentors:', err);
      setError(
        err.response?.data?.message ||
          err.message ||
          'Failed to load alumni mentors. Please check your connection and try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMentors();
  }, [
    debouncedSearch,
    company,
    department,
    industry,
    location,
    graduationYear,
    area,
    minExp,
    availability,
    sort,
  ]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setDebouncedSearch(searchTerm);
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setDebouncedSearch('');
    setArea('');
    setCompany('');
    setDepartment('');
    setIndustry('');
    setLocation('');
    setGraduationYear('');
    setMinExp('');
    setAvailability('all');
    setSort('recommended');
  };

  const hasActiveFilters = Boolean(
    searchTerm ||
      area ||
      company ||
      department ||
      industry ||
      location ||
      graduationYear ||
      minExp ||
      availability !== 'all' ||
      sort !== 'recommended'
  );

  const handleRequestSuccess = (created) => {
    setToastMessage(`Mentorship request successfully sent to ${selectedMentor?.fullName}!`);
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
            <Compass className="w-3.5 h-3.5" />
            Alumni Mentorship Network
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#172033] tracking-tight">
            Find Alumni Mentors &amp; Career Guides
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Connect 1-on-1 with verified alumni for technical interview guidance, resume reviews, and career advice.
          </p>
        </div>

        <div className="flex items-center gap-3 flex-shrink-0">
          <button
            onClick={() => navigate('/student/mentorship')}
            className="px-4 py-2 text-xs font-semibold text-[#4F46E5] bg-white border border-[#4F46E5] rounded-xl hover:bg-[#EEF2FF] transition-colors flex items-center gap-1.5 shadow-2xs"
          >
            <Users className="w-4 h-4" />
            <span>My Mentorships</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Profile Match Explanation Banner */}
      <div className="mt-6 p-4 rounded-2xl bg-gradient-to-r from-[#EEF2FF] to-white border border-indigo-100/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-start sm:items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-white shadow-xs text-[#4F46E5] flex items-center justify-center flex-shrink-0 border border-indigo-50">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-xs font-bold text-[#172033] flex items-center gap-1.5">
              <span>Profile-Based Recommendation</span>
              <span className="px-2 py-0.2 rounded-full text-[10px] bg-[#4F46E5] text-white font-semibold">
                Deterministic Match
              </span>
            </h2>
            <p className="text-xs text-slate-600 mt-0.5">
              Mentors are ranked based on skill overlap, guidance areas, and department alignment.
            </p>
          </div>
        </div>
      </div>

      {/* Search and Filters Bar */}
      <div className="mt-6 bg-white rounded-2xl border border-slate-200 p-4 shadow-sm space-y-4">
        {/* Search Input with Clear Button */}
        <form onSubmit={handleSearchSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by mentor name, company, role, skills, department, location, or guidance areas..."
              className="w-full pl-10 pr-9 py-2.5 text-xs text-slate-900 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4F46E5] focus:border-transparent bg-slate-50/50 focus:bg-white"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => {
                  setSearchTerm('');
                  setDebouncedSearch('');
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                title="Clear search"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          <button
            type="submit"
            className="px-5 py-2.5 bg-[#4F46E5] hover:bg-[#4338CA] text-white text-xs font-semibold rounded-xl transition-colors flex items-center gap-1.5 shadow-2xs"
          >
            <span>Search</span>
          </button>
        </form>

        {/* Primary Filter Row */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 pt-2 border-t border-slate-100">
          {/* Mentorship Area */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
              Mentorship Area
            </label>
            <select
              value={area}
              onChange={(e) => setArea(e.target.value)}
              className="w-full text-xs py-2 px-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#4F46E5]"
            >
              <option value="">All Guidance Areas</option>
              <option value="DSA">DSA &amp; Problem Solving</option>
              <option value="System Design">System Design</option>
              <option value="Web Development">Web Development</option>
              <option value="Interview Preparation">Interview Preparation</option>
              <option value="Resume Guidance">Resume Guidance</option>
              <option value="Career Planning">Career Planning</option>
              <option value="Higher Studies">Higher Studies</option>
              <option value="Machine Learning">Machine Learning / AI</option>
              <option value="Cloud Architecture">Cloud Architecture</option>
              <option value="Cybersecurity">Cybersecurity</option>
              <option value="Embedded Systems">Embedded Systems</option>
            </select>
          </div>

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
              <option value="Atlassian">Atlassian</option>
              <option value="Goldman Sachs">Goldman Sachs</option>
              <option value="Cisco">Cisco Systems</option>
              <option value="Oracle">Oracle</option>
              <option value="Adobe">Adobe</option>
              <option value="NVIDIA">NVIDIA</option>
              <option value="Qualcomm">Qualcomm</option>
              <option value="Flipkart">Flipkart</option>
              <option value="Swiggy">Swiggy</option>
              <option value="PhonePe">PhonePe</option>
              <option value="Razorpay">Razorpay</option>
              <option value="Samsung">Samsung</option>
              <option value="TCS">TCS</option>
              <option value="Infosys">Infosys</option>
              <option value="Tata Motors">Tata Motors</option>
              <option value="Morgan Stanley">Morgan Stanley</option>
            </select>
          </div>

          {/* Department / Branch */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
              Department
            </label>
            <select
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="w-full text-xs py-2 px-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#4F46E5]"
            >
              <option value="">All Departments</option>
              <option value="Computer Science">Computer Science</option>
              <option value="Information Technology">Information Technology</option>
              <option value="Electronics & Communication">Electronics &amp; Communication</option>
              <option value="Electrical & Electronics">Electrical &amp; Electronics</option>
              <option value="Data Science">Data Science</option>
              <option value="AI & Machine Learning">AI &amp; Machine Learning</option>
              <option value="Mechanical Engineering">Mechanical Engineering</option>
              <option value="Civil Engineering">Civil Engineering</option>
            </select>
          </div>

          {/* Experience */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
              Experience
            </label>
            <select
              value={minExp}
              onChange={(e) => setMinExp(e.target.value)}
              className="w-full text-xs py-2 px-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#4F46E5]"
            >
              <option value="">Any Experience</option>
              <option value="1">1+ Years</option>
              <option value="2">2+ Years</option>
              <option value="3">3+ Years</option>
              <option value="5">5+ Years</option>
            </select>
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
              <option value="experience">Most Experienced</option>
              <option value="recent">Recent Alumni</option>
              <option value="name">Alphabetical (A-Z)</option>
            </select>
          </div>
        </div>

        {/* Toggle Advanced Filters */}
        <div className="pt-2 flex items-center justify-between border-t border-slate-100">
          <button
            type="button"
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            className="text-xs font-semibold text-[#4F46E5] hover:text-[#4338CA] flex items-center gap-1.5"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>{showAdvancedFilters ? 'Hide Additional Filters' : 'More Filters (Location, Industry, Batch, Availability)'}</span>
          </button>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={handleClearFilters}
              className="text-xs font-semibold text-slate-600 hover:text-rose-600 flex items-center gap-1 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset all filters</span>
            </button>
          )}
        </div>

        {/* Secondary / Advanced Filters */}
        {showAdvancedFilters && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-slate-100 animate-in fade-in duration-150">
            {/* Mentorship Availability */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
                Mentorship Status
              </label>
              <select
                value={availability}
                onChange={(e) => setAvailability(e.target.value)}
                className="w-full text-xs py-2 px-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#4F46E5]"
              >
                <option value="all">All Alumni</option>
                <option value="available">Available for Mentorship</option>
                <option value="unavailable">Not Currently Mentoring</option>
              </select>
            </div>

            {/* Location */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
                Location
              </label>
              <select
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full text-xs py-2 px-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#4F46E5]"
              >
                <option value="">All Locations</option>
                <option value="Bengaluru">Bengaluru</option>
                <option value="Hyderabad">Hyderabad</option>
                <option value="Pune">Pune</option>
                <option value="Mumbai">Mumbai</option>
                <option value="Delhi">Delhi-NCR</option>
                <option value="Noida">Noida</option>
                <option value="Chennai">Chennai</option>
                <option value="Kolkata">Kolkata</option>
                <option value="Remote">Remote</option>
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
                <option value="Technology">Technology &amp; SaaS</option>
                <option value="E-commerce">E-commerce</option>
                <option value="Finance">Fintech &amp; Banking</option>
                <option value="Semiconductor">Semiconductor</option>
                <option value="Telecommunications">Telecommunications</option>
                <option value="Automotive">Automotive</option>
                <option value="Consulting">Consulting</option>
                <option value="Healthcare">Healthcare</option>
              </select>
            </div>

            {/* Graduation Year */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
                Graduation Year
              </label>
              <select
                value={graduationYear}
                onChange={(e) => setGraduationYear(e.target.value)}
                className="w-full text-xs py-2 px-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#4F46E5]"
              >
                <option value="">All Batches</option>
                <option value="2024">Class of 2024</option>
                <option value="2023">Class of 2023</option>
                <option value="2022">Class of 2022</option>
                <option value="2021">Class of 2021</option>
                <option value="2020">Class of 2020</option>
                <option value="2019">Class of 2019</option>
                <option value="2018">Class of 2018</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Mentor Cards Grid / Loading / Error */}
      <div className="mt-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-bold text-[#172033]">
            Available Alumni Mentors ({total})
          </h2>
          <span className="text-xs text-slate-400">
            All mentors verified by institutional placement cell
          </span>
        </div>

        {loading ? (
          <div className="p-16 flex flex-col items-center justify-center bg-white rounded-2xl border border-slate-200">
            <Loader2 className="w-8 h-8 animate-spin text-[#4F46E5] mb-3" />
            <p className="text-xs font-semibold text-slate-600">
              Matching and loading verified alumni mentors...
            </p>
          </div>
        ) : error ? (
          <div className="p-8 bg-rose-50 border border-rose-200 rounded-2xl text-center">
            <AlertCircle className="w-8 h-8 text-rose-500 mx-auto mb-2" />
            <h3 className="text-sm font-bold text-rose-900 mb-1">Unable to Load Alumni</h3>
            <p className="text-xs font-semibold text-rose-700 max-w-md mx-auto mb-4">{error}</p>
            <button
              onClick={fetchMentors}
              className="px-4 py-2 text-xs font-semibold text-white bg-rose-600 rounded-xl hover:bg-rose-700 shadow-2xs"
            >
              Try Again
            </button>
          </div>
        ) : mentors.length === 0 ? (
          <div className="p-16 bg-white rounded-2xl border border-slate-200 text-center">
            <Users className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-[#172033] mb-1">
              No mentors match your current filters
            </h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto mb-4">
              Try adjusting your guidance area, company, location, or search criteria to view available alumni.
            </p>
            <button
              onClick={handleClearFilters}
              className="px-4 py-2 text-xs font-semibold text-[#4F46E5] bg-[#EEF2FF] rounded-xl hover:bg-indigo-100 transition-colors"
            >
              Clear All Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mentors.map((mentor) => (
              <MentorCard
                key={mentor.id || mentor.userId}
                mentor={mentor}
                onRequestClick={(m) => setSelectedMentor(m)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Request Mentorship Modal */}
      {selectedMentor && (
        <RequestMentorshipModal
          mentor={selectedMentor}
          isOpen={Boolean(selectedMentor)}
          onClose={() => setSelectedMentor(null)}
          onSuccess={handleRequestSuccess}
        />
      )}
    </div>
  );
};

export default MentorDiscoveryPage;
