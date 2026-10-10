import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  getManageOpportunities,
  getOpportunityStats,
  updateOpportunityStatus,
  deleteOpportunity,
} from '../../services/opportunityService';
import {
  Building2,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Eye,
  Edit,
  Trash2,
  Clock,
  Layers,
  ChevronLeft,
  ChevronRight,
  Archive,
  RotateCcw,
  Briefcase,
  GraduationCap,
  Users,
} from 'lucide-react';

export const TpoOpportunitiesPage = () => {
  const navigate = useNavigate();

  const [opportunities, setOpportunities] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    published: 0,
    draft: 0,
    closed: 0,
    archived: 0,
    placements: 0,
    internships: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [feedback, setFeedback] = useState({ message: '', type: '' });

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [selectedSort, setSelectedSort] = useState('newest');

  // Pagination
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    hasNextPage: false,
    hasPreviousPage: false,
  });

  // Delete modal state
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    opportunity: null,
    isDeleting: false,
  });

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [oppsRes, statsRes] = await Promise.all([
        getManageOpportunities({
          search: searchTerm,
          status: selectedStatus,
          type: selectedType,
          sort: selectedSort,
          page,
          limit: 10,
        }),
        getOpportunityStats(),
      ]);

      if (oppsRes && oppsRes.success) {
        setOpportunities(oppsRes.data || []);
        if (oppsRes.pagination) setPagination(oppsRes.pagination);
      }
      if (statsRes && statsRes.success) {
        setStats(statsRes.data);
      }
    } catch (err) {
      setError(err.message || 'Failed to load opportunities');
    } finally {
      setLoading(false);
    }
  }, [searchTerm, selectedStatus, selectedType, selectedSort, page]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleStatusChange = async (id, newStatus) => {
    try {
      const res = await updateOpportunityStatus(id, newStatus);
      if (res && res.success) {
        setFeedback({
          message: `Opportunity status updated to ${newStatus}`,
          type: 'success',
        });
        fetchData();
      }
    } catch (err) {
      setFeedback({
        message: err.message || 'Failed to update status',
        type: 'error',
      });
    }
    setTimeout(() => setFeedback({ message: '', type: '' }), 4000);
  };

  const confirmDelete = async () => {
    if (!deleteModal.opportunity) return;
    setDeleteModal((prev) => ({ ...prev, isDeleting: true }));
    try {
      const res = await deleteOpportunity(deleteModal.opportunity.id || deleteModal.opportunity._id);
      if (res && res.success) {
        setFeedback({ message: 'Opportunity deleted successfully', type: 'success' });
        setDeleteModal({ isOpen: false, opportunity: null, isDeleting: false });
        fetchData();
      }
    } catch (err) {
      setFeedback({ message: err.message || 'Failed to delete opportunity', type: 'error' });
      setDeleteModal((prev) => ({ ...prev, isDeleting: false }));
    }
    setTimeout(() => setFeedback({ message: '', type: '' }), 4000);
  };

  const statusBadge = (status) => {
    switch (status) {
      case 'PUBLISHED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            Published
          </span>
        );
      case 'DRAFT':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200">
            <Clock className="w-3 h-3 text-amber-600" />
            Draft
          </span>
        );
      case 'CLOSED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-100 text-rose-800 border border-rose-200">
            <XCircle className="w-3 h-3 text-rose-600" />
            Closed
          </span>
        );
      case 'ARCHIVED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
            <Archive className="w-3 h-3 text-slate-500" />
            Archived
          </span>
        );
      default:
        return <span>{status}</span>;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-[#E0F2FE] text-[#0284C7] mb-2">
            <Building2 className="w-3.5 h-3.5" />
            TPO Officer Portal
          </div>
          <h1 className="text-3xl font-bold text-[#172033] tracking-tight">Opportunities</h1>
          <p className="text-slate-500 text-sm mt-1">
            Manage placement drives, internships, candidate deadlines, and lifecycle states.
          </p>
        </div>

        <Link
          to="/tpo/opportunities/create"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#4F46E5] hover:bg-[#4338CA] text-white font-semibold text-sm rounded-xl shadow-sm transition-colors self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Create Opportunity
        </Link>
      </div>

      {/* User Feedback Alerts */}
      {feedback.message && (
        <div
          className={`mt-6 p-4 rounded-xl border text-sm font-medium flex items-center gap-3 animate-in fade-in ${
            feedback.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : 'bg-rose-50 text-rose-800 border-rose-200'
          }`}
        >
          {feedback.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />
          )}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mt-6">
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm">
          <span className="text-slate-500 text-xs font-semibold uppercase tracking-wider block">Total</span>
          <span className="text-2xl font-bold text-[#172033] mt-1 block">{stats.total}</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm">
          <span className="text-emerald-600 text-xs font-semibold uppercase tracking-wider block">Published</span>
          <span className="text-2xl font-bold text-emerald-700 mt-1 block">{stats.published}</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm">
          <span className="text-amber-600 text-xs font-semibold uppercase tracking-wider block">Drafts</span>
          <span className="text-2xl font-bold text-amber-700 mt-1 block">{stats.draft}</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm">
          <span className="text-rose-600 text-xs font-semibold uppercase tracking-wider block">Closed</span>
          <span className="text-2xl font-bold text-rose-700 mt-1 block">{stats.closed}</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm">
          <span className="text-[#4F46E5] text-xs font-semibold uppercase tracking-wider block">Placements</span>
          <span className="text-2xl font-bold text-[#4F46E5] mt-1 block">{stats.placements}</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm">
          <span className="text-[#7C3AED] text-xs font-semibold uppercase tracking-wider block">Internships</span>
          <span className="text-2xl font-bold text-[#7C3AED] mt-1 block">{stats.internships}</span>
        </div>
      </div>

      {/* Search and Filters Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-4 mt-6 mb-6">
        <div className="flex flex-col md:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by title, company name, or role..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(1);
              }}
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#4F46E5] focus:bg-white text-[#172033]"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            {/* Status Filter */}
            <select
              value={selectedStatus}
              onChange={(e) => {
                setSelectedStatus(e.target.value);
                setPage(1);
              }}
              className="px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 text-slate-700 font-medium focus:outline-none focus:ring-1 focus:ring-[#4F46E5]"
            >
              <option value="">All Statuses</option>
              <option value="PUBLISHED">Published</option>
              <option value="DRAFT">Draft</option>
              <option value="CLOSED">Closed</option>
              <option value="ARCHIVED">Archived</option>
            </select>

            {/* Type Filter */}
            <select
              value={selectedType}
              onChange={(e) => {
                setSelectedType(e.target.value);
                setPage(1);
              }}
              className="px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 text-slate-700 font-medium focus:outline-none focus:ring-1 focus:ring-[#4F46E5]"
            >
              <option value="">All Types</option>
              <option value="PLACEMENT">Placements</option>
              <option value="INTERNSHIP">Internships</option>
            </select>

            {/* Sort */}
            <select
              value={selectedSort}
              onChange={(e) => {
                setSelectedSort(e.target.value);
                setPage(1);
              }}
              className="px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 text-slate-700 font-medium focus:outline-none focus:ring-1 focus:ring-[#4F46E5]"
            >
              <option value="newest">Newest First</option>
              <option value="deadlineSoonest">Deadline Soonest</option>
              <option value="deadlineLatest">Deadline Latest</option>
              <option value="oldest">Oldest First</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Content Area: Table / Responsive Cards */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-16 bg-white rounded-xl border border-slate-200 p-4 animate-pulse"></div>
          ))}
        </div>
      ) : error ? (
        <div className="bg-rose-50 border border-rose-200 rounded-2xl p-8 text-center my-8">
          <AlertCircle className="w-10 h-10 text-rose-500 mx-auto mb-3" />
          <h3 className="font-bold text-rose-900 text-lg">Failed to load opportunities</h3>
          <p className="text-sm text-rose-700 mt-1">{error}</p>
          <button
            onClick={fetchData}
            className="mt-4 px-4 py-2 bg-rose-600 text-white rounded-lg text-xs font-semibold"
          >
            Retry
          </button>
        </div>
      ) : opportunities.length === 0 ? (
        <div className="bg-white border border-slate-200/80 rounded-2xl p-12 text-center max-w-lg mx-auto my-8 shadow-sm">
          <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-[#4F46E5] flex items-center justify-center mx-auto mb-3">
            <Building2 className="w-7 h-7" />
          </div>
          <h3 className="font-bold text-lg text-[#172033]">You haven't created any opportunities yet</h3>
          <p className="text-sm text-slate-500 mt-1 max-w-sm mx-auto">
            Create your first campus placement or internship drive to start welcoming eligible students.
          </p>
          <Link
            to="/tpo/opportunities/create"
            className="mt-5 px-5 py-2.5 bg-[#4F46E5] hover:bg-[#4338CA] text-white rounded-xl text-sm font-semibold transition-colors shadow-sm inline-flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Create Opportunity Now
          </Link>
        </div>
      ) : (
        <>
          {/* Desktop Table View */}
          <div className="hidden md:block bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3.5 px-4">Company &amp; Opportunity</th>
                  <th className="py-3.5 px-4">Type</th>
                  <th className="py-3.5 px-4">Role &amp; Mode</th>
                  <th className="py-3.5 px-4">Deadline</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {opportunities.map((opp) => {
                  const oppId = opp.id || opp._id;
                  const deadline = new Date(opp.applicationDeadline);
                  const deadlineStr = !isNaN(deadline.getTime())
                    ? deadline.toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })
                    : 'N/A';

                  return (
                    <tr key={oppId} className="hover:bg-slate-50/50 transition-colors">
                      {/* Company & Title */}
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-[#172033] hover:text-[#4F46E5] transition-colors">
                          <Link to={`/opportunities/${oppId}`}>{opp.title}</Link>
                        </div>
                        <div className="text-xs text-slate-500 font-medium">{opp.companyName}</div>
                      </td>

                      {/* Type */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider border ${
                            opp.type === 'PLACEMENT'
                              ? 'bg-indigo-50 text-[#4F46E5] border-indigo-200'
                              : 'bg-purple-50 text-[#7C3AED] border-purple-200'
                          }`}
                        >
                          {opp.type}
                        </span>
                      </td>

                      {/* Role & Mode */}
                      <td className="py-3.5 px-4">
                        <div className="text-xs font-semibold text-slate-800">{opp.role}</div>
                        <div className="text-[11px] text-slate-500">
                          {opp.workMode} • {opp.location}
                        </div>
                      </td>

                      {/* Deadline */}
                      <td className="py-3.5 px-4">
                        <div className="text-xs font-medium text-slate-700">{deadlineStr}</div>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">{statusBadge(opp.status)}</td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="inline-flex items-center gap-1.5 justify-end">
                          <Link
                            to={`/opportunities/${oppId}`}
                            className="p-1.5 rounded-lg text-slate-600 hover:text-[#4F46E5] hover:bg-slate-100 transition-colors"
                            title="View Public Details"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>

                          <Link
                            to={`/tpo/opportunities/${oppId}/edit`}
                            className="p-1.5 rounded-lg text-slate-600 hover:text-[#4F46E5] hover:bg-slate-100 transition-colors"
                            title="Edit Opportunity"
                          >
                            <Edit className="w-4 h-4" />
                          </Link>

                          <Link
                            to={`/tpo/opportunities/${oppId}/applicants`}
                            className="p-1.5 rounded-lg text-slate-600 hover:text-[#4F46E5] hover:bg-indigo-50 transition-colors"
                            title="View Applicants"
                          >
                            <Users className="w-4 h-4" />
                          </Link>

                          {/* Quick Status Toggles */}
                          {opp.status === 'DRAFT' && (
                            <button
                              onClick={() => handleStatusChange(oppId, 'PUBLISHED')}
                              className="px-2 py-1 rounded-md text-[11px] font-semibold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors"
                              title="Publish Drive"
                            >
                              Publish
                            </button>
                          )}

                          {opp.status === 'PUBLISHED' && (
                            <button
                              onClick={() => handleStatusChange(oppId, 'CLOSED')}
                              className="px-2 py-1 rounded-md text-[11px] font-semibold bg-rose-50 text-rose-700 hover:bg-rose-100 transition-colors"
                              title="Close Drive"
                            >
                              Close
                            </button>
                          )}

                          {opp.status === 'CLOSED' && (
                            <button
                              onClick={() => handleStatusChange(oppId, 'ARCHIVED')}
                              className="px-2 py-1 rounded-md text-[11px] font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
                              title="Archive Drive"
                            >
                              Archive
                            </button>
                          )}

                          <button
                            onClick={() =>
                              setDeleteModal({
                                isOpen: true,
                                opportunity: opp,
                                isDeleting: false,
                              })
                            }
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                            title="Delete Opportunity"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile Stacked Card View */}
          <div className="md:hidden space-y-4">
            {opportunities.map((opp) => {
              const oppId = opp.id || opp._id;
              const deadline = new Date(opp.applicationDeadline);
              const deadlineStr = !isNaN(deadline.getTime())
                ? deadline.toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })
                : 'N/A';

              return (
                <div
                  key={oppId}
                  className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-xs text-slate-500 font-semibold">{opp.companyName}</span>
                      <h4 className="font-bold text-base text-[#172033]">
                        <Link to={`/opportunities/${oppId}`}>{opp.title}</Link>
                      </h4>
                    </div>
                    {statusBadge(opp.status)}
                  </div>

                  <div className="flex flex-wrap gap-2 text-xs text-slate-600">
                    <span className="px-2 py-0.5 rounded bg-slate-100">{opp.type}</span>
                    <span className="px-2 py-0.5 rounded bg-slate-100">{opp.workMode}</span>
                    <span className="px-2 py-0.5 rounded bg-slate-100">Due: {deadlineStr}</span>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                    <div className="flex gap-2">
                      <Link
                        to={`/opportunities/${oppId}`}
                        className="text-xs font-semibold text-[#4F46E5] hover:underline"
                      >
                        View
                      </Link>
                      <span>•</span>
                      <Link
                        to={`/tpo/opportunities/${oppId}/edit`}
                        className="text-xs font-semibold text-slate-700 hover:underline"
                      >
                        Edit
                      </Link>
                      <span>•</span>
                      <Link
                        to={`/tpo/opportunities/${oppId}/applicants`}
                        className="text-xs font-semibold text-[#4F46E5] hover:underline"
                      >
                        Applicants
                      </Link>
                    </div>

                    <div className="flex items-center gap-2">
                      {opp.status === 'DRAFT' && (
                        <button
                          onClick={() => handleStatusChange(oppId, 'PUBLISHED')}
                          className="px-2.5 py-1 rounded text-xs font-bold bg-emerald-50 text-emerald-700"
                        >
                          Publish
                        </button>
                      )}
                      {opp.status === 'PUBLISHED' && (
                        <button
                          onClick={() => handleStatusChange(oppId, 'CLOSED')}
                          className="px-2.5 py-1 rounded text-xs font-bold bg-rose-50 text-rose-700"
                        >
                          Close
                        </button>
                      )}
                      <button
                        onClick={() =>
                          setDeleteModal({
                            isOpen: true,
                            opportunity: opp,
                            isDeleting: false,
                          })
                        }
                        className="text-slate-400 hover:text-rose-600 p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="mt-8 flex items-center justify-between pt-4 border-t border-slate-200 text-xs">
              <span className="text-slate-500 font-medium">
                Page {pagination.currentPage} of {pagination.totalPages} ({pagination.totalItems} items)
              </span>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={!pagination.hasPreviousPage}
                  className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 disabled:opacity-40"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
                  disabled={!pagination.hasNextPage}
                  className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 disabled:opacity-40"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200 space-y-4">
            <div className="w-12 h-12 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>

            <div className="text-center">
              <h3 className="text-lg font-bold text-[#172033]">Delete Opportunity</h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Are you sure you want to permanently delete{' '}
                <strong className="text-slate-800">{deleteModal.opportunity?.title}</strong>? This action cannot be
                undone.
              </p>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteModal({ isOpen: false, opportunity: null, isDeleting: false })}
                disabled={deleteModal.isDeleting}
                className="w-1/2 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-semibold text-xs hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                disabled={deleteModal.isDeleting}
                className="w-1/2 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs shadow-sm transition-colors flex items-center justify-center gap-1.5"
              >
                {deleteModal.isDeleting ? 'Deleting...' : 'Delete Permanently'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TpoOpportunitiesPage;
