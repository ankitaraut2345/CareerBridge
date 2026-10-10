import React, { useState, useEffect, useCallback } from 'react';
import { getOpportunities } from '../../services/opportunityService';
import OpportunityCard from '../../components/OpportunityCard';
import {
  Search,
  Briefcase,
  GraduationCap,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
} from 'lucide-react';

export const StudentOpportunitiesPage = () => {
  const [opportunities, setOpportunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [selectedWorkMode, setSelectedWorkMode] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [selectedSort, setSelectedSort] = useState('newest');

  // Pagination state
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    hasNextPage: false,
    hasPreviousPage: false,
  });

  const departmentOptions = [
    'Computer Science',
    'Information Technology',
    'Data Science',
    'AI & Machine Learning',
    'Electronics & Communication',
    'Electrical Engineering',
    'Mechanical Engineering',
  ];

  const fetchOpportunities = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        search: searchTerm,
        type: selectedType,
        workMode: selectedWorkMode,
        location: selectedLocation,
        department: selectedDepartment,
        sort: selectedSort,
        page,
        limit: 9,
      };

      const res = await getOpportunities(params);
      if (res && res.success) {
        setOpportunities(res.data || []);
        if (res.pagination) {
          setPagination(res.pagination);
        }
      }
    } catch (err) {
      setError(err.message || 'Failed to load opportunities. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [searchTerm, selectedType, selectedWorkMode, selectedLocation, selectedDepartment, selectedSort, page]);

  useEffect(() => {
    fetchOpportunities();
  }, [fetchOpportunities]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchOpportunities();
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setSelectedType('');
    setSelectedWorkMode('');
    setSelectedLocation('');
    setSelectedDepartment('');
    setSelectedSort('newest');
    setPage(1);
  };

  const hasActiveFilters =
    searchTerm || selectedType || selectedWorkMode || selectedLocation || selectedDepartment || selectedSort !== 'newest';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-[#EEF2FF] text-[#4F46E5] mb-2">
            <GraduationCap className="w-3.5 h-3.5" />
            Campus Career Board
          </div>
          <h1 className="text-3xl font-bold text-[#172033] tracking-tight">
            Placement &amp; Internship Opportunities
          </h1>
          <p className="text-slate-500 text-sm mt-1 max-w-2xl">
            Explore verified company drives, check department eligibility, and prepare for upcoming campus recruitment cycles.
          </p>
        </div>

        {/* Quick Type Filter Tabs */}
        <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-xl self-start md:self-auto border border-slate-200/60">
          <button
            onClick={() => {
              setSelectedType('');
              setPage(1);
            }}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
              selectedType === ''
                ? 'bg-white text-[#4F46E5] shadow-sm font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All Drives
          </button>
          <button
            onClick={() => {
              setSelectedType('PLACEMENT');
              setPage(1);
            }}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
              selectedType === 'PLACEMENT'
                ? 'bg-white text-[#4F46E5] shadow-sm font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Placements
          </button>
          <button
            onClick={() => {
              setSelectedType('INTERNSHIP');
              setPage(1);
            }}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
              selectedType === 'INTERNSHIP'
                ? 'bg-white text-[#7C3AED] shadow-sm font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Internships
          </button>
        </div>
      </div>

      {/* Search and Filters Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-4 sm:p-5 mt-6 mb-8">
        <form onSubmit={handleSearchSubmit} className="space-y-4">
          {/* Top Row: Search input & Submit */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by job title, company name, role, or skills (e.g. React, Java)..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-sm focus:outline-none focus:ring-2 focus:ring-[#4F46E5] focus:bg-white transition-all text-[#172033]"
              />
            </div>

            <button
              type="submit"
              className="px-6 py-2.5 bg-[#4F46E5] hover:bg-[#4338CA] text-white text-sm font-semibold rounded-xl shadow-sm transition-colors flex items-center justify-center gap-2"
            >
              <Search className="w-4 h-4" />
              Search
            </button>
          </div>

          {/* Bottom Row: Granular Filters */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 pt-3 border-t border-slate-100">
            {/* Work Mode Filter */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
                Work Mode
              </label>
              <select
                value={selectedWorkMode}
                onChange={(e) => {
                  setSelectedWorkMode(e.target.value);
                  setPage(1);
                }}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 bg-slate-50/50 focus:outline-none focus:ring-1 focus:ring-[#4F46E5] text-slate-700 font-medium"
              >
                <option value="">All Work Modes</option>
                <option value="ONSITE">On-Site</option>
                <option value="HYBRID">Hybrid</option>
                <option value="REMOTE">Remote</option>
              </select>
            </div>

            {/* Department Filter */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
                Eligible Department
              </label>
              <select
                value={selectedDepartment}
                onChange={(e) => {
                  setSelectedDepartment(e.target.value);
                  setPage(1);
                }}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 bg-slate-50/50 focus:outline-none focus:ring-1 focus:ring-[#4F46E5] text-slate-700 font-medium"
              >
                <option value="">All Departments</option>
                {departmentOptions.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
            </div>

            {/* Location Filter */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
                Location
              </label>
              <input
                type="text"
                placeholder="e.g. Bengaluru, Pune..."
                value={selectedLocation}
                onChange={(e) => {
                  setSelectedLocation(e.target.value);
                  setPage(1);
                }}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 bg-slate-50/50 focus:outline-none focus:ring-1 focus:ring-[#4F46E5] text-slate-700 font-medium"
              />
            </div>

            {/* Sort Options */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
                Sort By
              </label>
              <select
                value={selectedSort}
                onChange={(e) => {
                  setSelectedSort(e.target.value);
                  setPage(1);
                }}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 bg-slate-50/50 focus:outline-none focus:ring-1 focus:ring-[#4F46E5] text-slate-700 font-medium"
              >
                <option value="newest">Newest First</option>
                <option value="deadlineSoonest">Deadline: Closing Soonest</option>
                <option value="deadlineLatest">Deadline: Latest</option>
                <option value="oldest">Oldest First</option>
              </select>
            </div>
          </div>

          {/* Active Filter Pill & Clear */}
          {hasActiveFilters && (
            <div className="flex items-center justify-between pt-2">
              <span className="text-xs text-slate-500 font-medium">
                Active filters applied
              </span>
              <button
                type="button"
                onClick={handleClearFilters}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#4F46E5] hover:text-[#4338CA] transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Clear All Filters
              </button>
            </div>
          )}
        </form>
      </div>

      {/* Main Content Area */}
      {loading ? (
        /* Loading Skeleton */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm animate-pulse flex flex-col justify-between h-64"
            >
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-slate-200 rounded-lg"></div>
                  <div className="space-y-2 flex-1">
                    <div className="h-4 bg-slate-200 rounded w-3/4"></div>
                    <div className="h-3 bg-slate-200 rounded w-1/2"></div>
                  </div>
                </div>
                <div className="h-5 bg-slate-200 rounded w-full"></div>
                <div className="h-4 bg-slate-200 rounded w-2/3"></div>
              </div>
              <div className="pt-4 border-t border-slate-100 flex justify-between items-center">
                <div className="h-4 bg-slate-200 rounded w-1/3"></div>
                <div className="h-4 bg-slate-200 rounded w-1/4"></div>
              </div>
            </div>
          ))}
        </div>
      ) : error ? (
        /* Error State */
        <div className="bg-rose-50 border border-rose-200 rounded-2xl p-8 text-center max-w-xl mx-auto my-12">
          <AlertCircle className="w-10 h-10 text-rose-500 mx-auto mb-3" />
          <h3 className="font-bold text-rose-900 text-lg">Unable to load opportunities</h3>
          <p className="text-sm text-rose-700 mt-1">{error}</p>
          <button
            onClick={fetchOpportunities}
            className="mt-4 px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-sm font-semibold transition-colors"
          >
            Retry Loading
          </button>
        </div>
      ) : opportunities.length === 0 ? (
        /* Empty State */
        <div className="bg-white border border-slate-200/80 rounded-2xl p-12 text-center max-w-lg mx-auto my-12 shadow-sm">
          <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-[#4F46E5] flex items-center justify-center mx-auto mb-4">
            <Briefcase className="w-8 h-8" />
          </div>
          <h3 className="font-bold text-lg text-[#172033]">No opportunities found</h3>
          <p className="text-sm text-slate-500 mt-1 max-w-sm mx-auto">
            We couldn't find any campus drives matching your search criteria. Try modifying your filters or search terms.
          </p>
          {hasActiveFilters && (
            <button
              onClick={handleClearFilters}
              className="mt-5 px-5 py-2 bg-[#4F46E5] hover:bg-[#4338CA] text-white rounded-xl text-sm font-semibold transition-colors shadow-sm inline-flex items-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              Reset All Filters
            </button>
          )}
        </div>
      ) : (
        /* Opportunities Grid */
        <>
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-semibold text-slate-500">
              Showing {opportunities.length} of {pagination.totalItems} available {pagination.totalItems === 1 ? 'drive' : 'drives'}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {opportunities.map((opp) => (
              <OpportunityCard key={opp.id || opp._id} opportunity={opp} />
            ))}
          </div>

          {/* Pagination Controls */}
          {pagination.totalPages > 1 && (
            <div className="mt-12 flex items-center justify-center gap-2 pt-6 border-t border-slate-200">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={!pagination.hasPreviousPage}
                className="p-2 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                aria-label="Previous Page"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-1">
                {Array.from({ length: pagination.totalPages }, (_, idx) => idx + 1).map((pg) => (
                  <button
                    key={pg}
                    onClick={() => setPage(pg)}
                    className={`w-9 h-9 rounded-lg text-xs font-semibold transition-colors ${
                      page === pg
                        ? 'bg-[#4F46E5] text-white shadow-sm'
                        : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {pg}
                  </button>
                ))}
              </div>

              <button
                onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
                disabled={!pagination.hasNextPage}
                className="p-2 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                aria-label="Next Page"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default StudentOpportunitiesPage;
