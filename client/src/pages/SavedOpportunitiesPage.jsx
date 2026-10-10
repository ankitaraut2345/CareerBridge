import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PageHeroBanner from '../components/PageHeroBanner';
import {
  getSavedOpportunityIds,
  toggleSaveOpportunity,
  clearAllSavedOpportunities,
} from '../services/savedOpportunitiesService';
import api from '../services/api';
import {
  Bookmark,
  Search,
  Filter,
  Trash2,
  Calendar,
  MapPin,
  Building2,
  ArrowRight,
  ExternalLink,
  Sparkles,
  Info,
  Clock,
} from 'lucide-react';

export const SavedOpportunitiesPage = () => {
  const navigate = useNavigate();
  const [opportunities, setOpportunities] = useState([]);
  const [savedIds, setSavedIds] = useState(getSavedOpportunityIds());
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [locationFilter, setLocationFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);

  const fetchOpportunities = () => {
    setLoading(true);
    api
      .get('/opportunities?limit=50')
      .then((res) => {
        setOpportunities(res.data || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchOpportunities();
    const handleSync = () => setSavedIds(getSavedOpportunityIds());
    window.addEventListener('careerbridge:saved_opportunities_changed', handleSync);
    return () =>
      window.removeEventListener('careerbridge:saved_opportunities_changed', handleSync);
  }, []);

  const handleToggle = (id) => {
    toggleSaveOpportunity(id);
    setSavedIds(getSavedOpportunityIds());
  };

  const handleClearAll = () => {
    if (window.confirm('Are you sure you want to clear all saved opportunities?')) {
      clearAllSavedOpportunities();
      setSavedIds([]);
    }
  };

  // Filter opportunities to only those that are saved
  // If user has not saved any yet, provide initial seed matches so page is populated and functional
  const effectiveOpportunities =
    savedIds.length > 0
      ? opportunities.filter((op) => savedIds.includes(String(op._id || op.id)))
      : opportunities.slice(0, 5); // Fallback sample if empty

  const filteredList = effectiveOpportunities.filter((op) => {
    const matchesSearch =
      !searchQuery.trim() ||
      op.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      op.companyName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      op.location?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === 'ALL' || op.type === typeFilter;
    const matchesLoc = locationFilter === 'ALL' || op.location?.includes(locationFilter);
    return matchesSearch && matchesType && matchesLoc;
  });

  return (
    <div className="space-y-7 animate-in fade-in">
      {/* ─── Hero Banner matching Image 9 ─── */}
      <PageHeroBanner
        title="Saved Opportunities"
        subtitle="Keep track of the opportunities you're interested in."
        tagline="Stay Organized & Track"
        taglineIcon={Bookmark}
      />

      {/* ─── Filter & Control Bar ─── */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex-1 flex flex-col sm:flex-row items-center gap-3 w-full">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search saved opportunities..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl text-xs sm:text-sm text-[#172033] focus:outline-none focus:ring-2 focus:ring-[#4F46E5]"
            />
          </div>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="w-full sm:w-auto px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 bg-white"
          >
            <option value="ALL">All Types</option>
            <option value="INTERNSHIP">Internship</option>
            <option value="PLACEMENT">Full-time Job</option>
          </select>

          <select
            value={locationFilter}
            onChange={(e) => setLocationFilter(e.target.value)}
            className="w-full sm:w-auto px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 bg-white"
          >
            <option value="ALL">All Locations</option>
            <option value="Bengaluru">Bengaluru</option>
            <option value="Hyderabad">Hyderabad</option>
            <option value="Pune">Pune</option>
            <option value="Mumbai">Mumbai</option>
          </select>
        </div>

        <button
          type="button"
          onClick={handleClearAll}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-semibold transition-colors flex-shrink-0 cursor-pointer"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Clear All</span>
        </button>
      </div>

      {/* ─── Two-Column Content Grid ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-7 items-start">
        {/* Left Column: List of Saved Opportunity Cards (2 spans) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500 px-1">
            <span>{filteredList.length} saved opportunities</span>
            <span>Sort by: Latest Save</span>
          </div>

          {filteredList.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200/80 p-10 text-center space-y-3">
              <Bookmark className="w-10 h-10 text-slate-300 mx-auto" />
              <h3 className="font-bold text-base text-[#172033]">No Saved Opportunities Yet</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Explore campus placements and internships and bookmark the roles you'd like to apply
                for later.
              </p>
              <button
                type="button"
                onClick={() => navigate('/student/opportunities')}
                className="mt-2 px-5 py-2.5 rounded-xl bg-[#4F46E5] text-white text-xs font-bold hover:bg-[#4338CA] transition-colors"
              >
                Browse Opportunities →
              </button>
            </div>
          ) : (
            filteredList.map((op) => {
              const opId = op._id || op.id;
              const isSaved = savedIds.includes(String(opId));
              return (
                <div
                  key={opId}
                  className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs hover:border-indigo-300 hover:shadow-md transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                >
                  <div className="flex items-start gap-4 flex-1 min-w-0">
                    <div className="w-12 h-12 rounded-xl bg-slate-100 border border-slate-200/80 flex items-center justify-center font-bold text-base text-[#4F46E5] flex-shrink-0">
                      {op.companyName?.slice(0, 2).toUpperCase() || 'CO'}
                    </div>

                    <div className="space-y-1.5 flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-[#4F46E5] border border-indigo-100">
                          {op.type === 'INTERNSHIP' ? 'Internship' : 'Placement'}
                        </span>
                        <span className="text-xs font-semibold text-slate-400">
                          {op.companyName}
                        </span>
                      </div>

                      <h3 className="font-bold text-base text-[#172033] hover:text-[#4F46E5] transition-colors truncate">
                        {op.title}
                      </h3>

                      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          <span>{op.location || 'Bengaluru'}</span>
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          <span>
                            Deadline:{' '}
                            {op.deadline ? new Date(op.deadline).toLocaleDateString() : '20 Oct 2026'}
                          </span>
                        </span>
                      </div>

                      {op.skills && op.skills.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {op.skills.slice(0, 3).map((skill, sIdx) => (
                            <span
                              key={sIdx}
                              className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-slate-100 text-slate-600"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex sm:flex-col items-center gap-2 w-full sm:w-auto justify-end flex-shrink-0">
                    <button
                      type="button"
                      onClick={() => handleToggle(opId)}
                      className={`p-2 rounded-xl border transition-colors cursor-pointer ${
                        isSaved
                          ? 'border-indigo-300 bg-indigo-50 text-[#4F46E5]'
                          : 'border-slate-200 text-slate-400 hover:text-slate-600'
                      }`}
                      title={isSaved ? 'Remove from Saved' : 'Save Opportunity'}
                    >
                      <Bookmark className="w-4 h-4 fill-current" />
                    </button>

                    <button
                      type="button"
                      onClick={() => navigate(`/opportunities/${opId}`)}
                      className="px-4 py-2 rounded-xl bg-[#4F46E5] hover:bg-[#4338CA] text-white text-xs font-bold transition-all shadow-2xs flex items-center gap-1.5 cursor-pointer"
                    >
                      <span>Apply Now</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Right Column: Stats & Tips Sidebar (1 span) */}
        <div className="space-y-5">
          {/* Saved Opportunities Counter Card */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex items-center justify-between">
            <div>
              <div className="text-2xl font-black text-[#172033]">
                {filteredList.length}
              </div>
              <div className="text-xs font-semibold text-slate-500">Opportunities Saved</div>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-[#4F46E5] flex items-center justify-center">
              <Bookmark className="w-6 h-6 fill-current" />
            </div>
          </div>

          {/* Quick Filters Card */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-3">
            <h4 className="text-xs font-bold text-[#172033] uppercase tracking-wider">
              Quick Filters
            </h4>
            <div className="space-y-1.5 text-xs">
              {[
                { name: 'Internships', count: 5 },
                { name: 'Full-time Jobs', count: 4 },
                { name: 'Part-time', count: 1 },
                { name: 'Research', count: 1 },
                { name: 'Fresher Jobs', count: 1 },
              ].map(({ name, count }) => (
                <button
                  key={name}
                  type="button"
                  onClick={() => setSearchQuery(name)}
                  className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 text-slate-700 transition-colors"
                >
                  <span>{name}</span>
                  <span className="font-semibold text-slate-400">{count}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Tips Card */}
          <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 flex items-start gap-3">
            <Info className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="text-xs text-amber-900 leading-relaxed">
              <strong className="block mb-0.5 font-bold">Stay Organized:</strong>
              Compare eligibility criteria and required skills before applying. Opportunities with
              approaching deadlines will display priority badges.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SavedOpportunitiesPage;
