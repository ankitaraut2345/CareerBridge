import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getOpportunities } from '../../services/opportunityService';
import {
  Search,
  Filter,
  Briefcase,
  MapPin,
  Clock,
  Bookmark,
  ArrowRight,
  ChevronDown,
  Building,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  CheckCircle2,
  X,
  ExternalLink,
} from 'lucide-react';
import { toggleSaveOpportunity, isOpportunitySaved } from '../../services/savedOpportunitiesService';

export const StudentOpportunitiesPage = () => {
  const navigate = useNavigate();

  const [opportunities, setOpportunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Tabs & Search
  const [activeTab, setActiveTab] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [selectedSort, setSelectedSort] = useState('newest');

  // Facet Checkbox Filters
  const [selectedJobTypes, setSelectedJobTypes] = useState([]);
  const [selectedWorkModes, setSelectedWorkModes] = useState([]);

  // Bookmark sync state
  const [savedIds, setSavedIds] = useState(new Set());

  // Pagination
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
  });

  const fetchOpportunities = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const typeParam =
        activeTab === 'Internships'
          ? 'INTERNSHIP'
          : activeTab === 'Full-time Jobs'
          ? 'FULL_TIME'
          : selectedJobTypes[0] || '';

      const workModeParam =
        activeTab === 'Remote Roles' ? 'REMOTE' : selectedWorkModes[0] || '';

      const res = await getOpportunities({
        search: searchTerm,
        type: typeParam,
        workMode: workModeParam,
        location: selectedLocation,
        sort: selectedSort,
        page,
        limit: 9,
      });

      if (res && res.success) {
        setOpportunities(res.data || []);
        if (res.pagination) {
          setPagination(res.pagination);
        }
      }
    } catch (err) {
      console.warn('Error fetching opportunities:', err);
      setError(err.message || 'Failed to load opportunities.');
    } finally {
      setLoading(false);
    }
  }, [searchTerm, activeTab, selectedJobTypes, selectedWorkModes, selectedLocation, selectedSort, page]);

  useEffect(() => {
    fetchOpportunities();
  }, [fetchOpportunities]);

  const handleBookmarkToggle = (opp) => {
    const oppId = opp._id || opp.id;
    const isSaved = toggleSaveOpportunity(opp);
    setSavedIds((prev) => {
      const next = new Set(prev);
      if (isSaved) next.add(oppId);
      else next.delete(oppId);
      return next;
    });
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setSelectedLocation('');
    setSelectedJobTypes([]);
    setSelectedWorkModes([]);
    setActiveTab('All');
    setSelectedSort('newest');
    setPage(1);
  };

  return (
    <div className="space-y-7 pb-10">
      {/* 1. SaaS Hero Banner matching Image 7 */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-50/90 via-indigo-50/80 to-purple-50/90 border border-slate-200/80 p-6 sm:p-8 lg:p-9 shadow-xs">
        <div className="absolute -top-16 -right-16 w-64 h-64 bg-purple-200/40 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-64 h-64 bg-sky-200/40 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="max-w-2xl">
            <h1 className="text-2xl sm:text-3xl lg:text-[34px] font-extrabold text-[#172033] tracking-tight leading-tight mb-2">
              Explore Opportunities
            </h1>
            <p className="text-sm sm:text-base text-slate-600 font-normal leading-relaxed">
              Discover internships and job opportunities from top companies visiting your campus.
            </p>
          </div>

          <div className="hidden md:flex flex-col items-end justify-center">
            <div className="px-5 py-3 rounded-2xl bg-white/80 backdrop-blur-xs border border-indigo-100 shadow-xs text-right">
              <span className="block text-xs font-bold text-slate-400 italic">Curated Drives</span>
              <span className="block text-sm font-extrabold text-[#4F46E5] italic">
                Verified Recruiters
              </span>
            </div>
          </div>
        </div>

        {/* 4 Feature Guidance Cards matching Image 7 */}
        <div className="relative z-10 grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-indigo-100/70">
          {[
            { title: 'Internships', desc: 'Pre-final & final year roles', icon: Briefcase, color: 'bg-blue-100 text-[#4F46E5]' },
            { title: 'Full-time Jobs', desc: 'Graduating batch placements', icon: Building, color: 'bg-purple-100 text-[#7C3AED]' },
            { title: 'Verified Companies', desc: 'Direct TPO approved drives', icon: CheckCircle2, color: 'bg-emerald-100 text-emerald-700' },
            { title: 'Quick Apply', desc: '1-click resume submission', icon: Sparkles, color: 'bg-amber-100 text-amber-700' },
          ].map((card, idx) => {
            const Icon = card.icon;
            return (
              <div
                key={idx}
                className="flex items-center gap-3 p-3 rounded-2xl bg-white/70 backdrop-blur-2xs border border-slate-200/60 shadow-2xs"
              >
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${card.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-bold text-[#172033] truncate">{card.title}</div>
                  <div className="text-[11px] text-slate-500 truncate">{card.desc}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. Job Type Tabs matching Image 7 */}
      <div className="flex items-center gap-6 border-b border-slate-200 pb-2 overflow-x-auto no-scrollbar">
        {['All', 'Internships', 'Full-time Jobs', 'Remote Roles'].map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => {
              setActiveTab(tab);
              setPage(1);
            }}
            className={`text-sm font-bold pb-2 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === tab
                ? 'border-[#4F46E5] text-[#4F46E5]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* 3. Search & Filter Bar matching Image 7 */}
      <div className="flex flex-col sm:flex-row items-center gap-3 bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search roles, skills, or companies..."
            className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm bg-slate-50 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#4F46E5] focus:bg-white transition-all text-[#172033]"
          />
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <select
            value={selectedLocation}
            onChange={(e) => setSelectedLocation(e.target.value)}
            className="px-3 py-2 text-xs font-semibold rounded-xl bg-slate-50 border border-slate-200 text-slate-700 focus:outline-none cursor-pointer"
          >
            <option value="">All Locations</option>
            <option value="Bengaluru">Bengaluru</option>
            <option value="Hyderabad">Hyderabad</option>
            <option value="Pune">Pune</option>
            <option value="Mumbai">Mumbai</option>
            <option value="Delhi NCR">Delhi NCR</option>
          </select>

          <button
            type="button"
            onClick={fetchOpportunities}
            className="px-4 py-2 text-xs font-bold rounded-xl bg-[#4F46E5] text-white hover:bg-[#4338CA] transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <span>Search</span>
          </button>
        </div>
      </div>

      {/* 4. Main 2-Column Layout matching Image 7 */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-7 items-start">
        {/* Left Column (3 Cols): Opportunities List */}
        <div className="lg:col-span-3 space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-500 px-1">
            <span className="font-bold text-[#172033]">
              {opportunities.length} opportunities available
            </span>
            <div className="flex items-center gap-2">
              <span>Sort by:</span>
              <select
                value={selectedSort}
                onChange={(e) => setSelectedSort(e.target.value)}
                className="font-bold text-[#172033] bg-transparent focus:outline-none cursor-pointer"
              >
                <option value="newest">Most Recent</option>
                <option value="deadline">Deadline Approaching</option>
              </select>
            </div>
          </div>

          {opportunities.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-3xl border border-slate-200">
              <Briefcase className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <h3 className="text-base font-bold text-[#172033]">No opportunities found</h3>
              <p className="text-xs text-slate-500 mt-1">
                Try modifying your search or clearing your active filters.
              </p>
              <button
                type="button"
                onClick={handleClearFilters}
                className="mt-4 px-4 py-2 bg-[#4F46E5] text-white rounded-xl text-xs font-bold"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {opportunities.map((opp) => {
                const oppId = opp._id || opp.id;
                const isSaved = isOpportunitySaved(oppId) || savedIds.has(oppId);

                return (
                  <div
                    key={oppId}
                    className="p-5 sm:p-6 rounded-3xl bg-white border border-slate-200/80 hover:border-indigo-200 shadow-xs hover:shadow-md transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-5 group"
                  >
                    <div className="flex items-start gap-4">
                      {/* Company Letter / Logo Badge */}
                      <div className="w-13 h-13 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center flex-shrink-0 p-2 shadow-2xs">
                        <span className="text-base font-black text-slate-800">
                          {(opp.company || opp.title).slice(0, 1)}
                        </span>
                      </div>

                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-base font-extrabold text-[#172033] group-hover:text-[#4F46E5] transition-colors leading-tight">
                            {opp.title}
                          </h3>
                          {opp.type && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-[#4F46E5] border border-indigo-100">
                              {opp.type.replace('_', ' ')}
                            </span>
                          )}
                        </div>

                        <div className="text-xs font-bold text-slate-700">
                          {opp.company}
                        </div>

                        <div className="flex items-center gap-3 text-xs text-slate-500 flex-wrap">
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-slate-400" />
                            {opp.location || 'Remote'}
                          </span>
                          <span>•</span>
                          <span>{opp.workMode || 'On-site'}</span>
                          {opp.salary?.stipend && (
                            <>
                              <span>•</span>
                              <span className="font-semibold text-slate-800">
                                {opp.salary.stipend}
                              </span>
                            </>
                          )}
                          {opp.deadline && (
                            <>
                              <span>•</span>
                              <span className="text-amber-600 font-semibold flex items-center gap-1">
                                <Clock className="w-3.5 h-3.5" />
                                Closes {new Date(opp.deadline).toLocaleDateString()}
                              </span>
                            </>
                          )}
                        </div>

                        {/* Skill Tags */}
                        {opp.requiredSkills && opp.requiredSkills.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 pt-1">
                            {opp.requiredSkills.slice(0, 4).map((skill, sIdx) => (
                              <span
                                key={sIdx}
                                className="px-2.5 py-0.5 rounded-lg text-[11px] font-semibold bg-slate-50 text-slate-700 border border-slate-200/80"
                              >
                                {skill}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Right Actions */}
                    <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2.5 flex-shrink-0 pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                      <button
                        type="button"
                        onClick={() => handleBookmarkToggle(opp)}
                        className={`p-2 rounded-xl border transition-colors cursor-pointer ${
                          isSaved
                            ? 'bg-indigo-50 border-indigo-200 text-[#4F46E5]'
                            : 'border-slate-200 text-slate-400 hover:text-slate-600 hover:bg-slate-50'
                        }`}
                        title={isSaved ? 'Bookmarked' : 'Save opportunity'}
                      >
                        <Bookmark className="w-4 h-4 fill-current" />
                      </button>

                      <button
                        type="button"
                        onClick={() => navigate(`/opportunities/${oppId}`)}
                        className="px-4 py-2 rounded-xl bg-[#4F46E5] hover:bg-[#4338CA] text-white text-xs font-bold transition-all shadow-2xs cursor-pointer flex items-center gap-1.5 whitespace-nowrap"
                      >
                        <span>Apply Now</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between pt-4 border-t border-slate-200">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold disabled:opacity-40"
              >
                Previous
              </button>
              <span className="text-xs font-bold text-slate-600">
                Page {page} of {pagination.totalPages}
              </span>
              <button
                type="button"
                disabled={page >= pagination.totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold disabled:opacity-40"
              >
                Next
              </button>
            </div>
          )}
        </div>

        {/* Right Column (1 Col): Filter Sidebar matching Image 7 */}
        <div className="space-y-6">
          <div className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-[#172033] flex items-center gap-2">
                <Filter className="w-4 h-4 text-slate-500" />
                <span>Filters</span>
              </h3>
              <button
                type="button"
                onClick={handleClearFilters}
                className="text-xs font-semibold text-[#4F46E5] hover:underline"
              >
                Clear All
              </button>
            </div>

            {/* Job Type Filter */}
            <div className="space-y-2.5">
              <div className="text-xs font-bold text-[#172033] flex items-center justify-between">
                <span>Job Type</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </div>
              <div className="space-y-2 pt-1 text-xs">
                {['INTERNSHIP', 'FULL_TIME'].map((type) => (
                  <label
                    key={type}
                    className="flex items-center gap-2 text-slate-600 hover:text-slate-900 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={selectedJobTypes.includes(type)}
                      onChange={() => {
                        setSelectedJobTypes((prev) =>
                          prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
                        );
                        setPage(1);
                      }}
                      className="rounded text-[#4F46E5] focus:ring-[#4F46E5]"
                    />
                    <span>{type === 'INTERNSHIP' ? 'Internship' : 'Full-time'}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Work Mode Filter */}
            <div className="pt-3 border-t border-slate-100 space-y-2.5">
              <div className="text-xs font-bold text-[#172033] flex items-center justify-between">
                <span>Work Mode</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </div>
              <div className="space-y-2 pt-1 text-xs">
                {['ON_SITE', 'HYBRID', 'REMOTE'].map((mode) => (
                  <label
                    key={mode}
                    className="flex items-center gap-2 text-slate-600 hover:text-slate-900 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={selectedWorkModes.includes(mode)}
                      onChange={() => {
                        setSelectedWorkModes((prev) =>
                          prev.includes(mode) ? prev.filter((m) => m !== mode) : [...prev, mode]
                        );
                        setPage(1);
                      }}
                      className="rounded text-[#4F46E5] focus:ring-[#4F46E5]"
                    />
                    <span>{mode.replace('_', ' ')}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Other Collapsible Filter Facets */}
            {['Experience Level', 'Department', 'Stipend Range', 'Skills'].map((filterTitle) => (
              <div
                key={filterTitle}
                className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-slate-700 hover:text-slate-900 cursor-pointer"
              >
                <span>{filterTitle}</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentOpportunitiesPage;
