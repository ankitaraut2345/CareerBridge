import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  getOpportunityApplicants,
  updateApplicationStatus,
  scheduleInterview,
  updateInterview,
  cancelInterview,
} from '../../services/applicationService';
import { getOpportunityById } from '../../services/opportunityService';
import {
  ArrowLeft,
  Building2,
  Users,
  Search,
  Filter,
  Download,
  ExternalLink,
  FileText,
  Calendar,
  Clock,
  GraduationCap,
  Briefcase,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Mail,
  RotateCcw,
  Edit,
  Eye,
  Video,
} from 'lucide-react';
import StatusBadge from '../../components/StatusBadge';
import UpdateStatusModal from '../../components/UpdateStatusModal';
import InterviewModal from '../../components/InterviewModal';

export const OpportunityApplicantsPage = () => {
  const { id } = useParams();

  const [opportunity, setOpportunity] = useState(null);
  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [feedback, setFeedback] = useState({ message: '', type: '' });

  // Modal States
  const [activeStatusApp, setActiveStatusApp] = useState(null);
  const [activeInterviewApp, setActiveInterviewApp] = useState(null);

  // Search & Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDept, setSelectedDept] = useState('');
  const [selectedGradYear, setSelectedGradYear] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [minCgpa, setMinCgpa] = useState('');
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

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [oppRes, appRes] = await Promise.all([
        getOpportunityById(id),
        getOpportunityApplicants(id, {
          page,
          limit: 10,
          search: searchTerm,
          department: selectedDept,
          graduationYear: selectedGradYear,
          status: selectedStatus,
          minCgpa: minCgpa || undefined,
          sort: selectedSort,
        }),
      ]);

      if (oppRes && oppRes.success) {
        setOpportunity(oppRes.data);
      }

      if (appRes && appRes.success) {
        setApplicants(appRes.data || []);
        if (appRes.pagination) {
          setPagination(appRes.pagination);
        }
      }
    } catch (err) {
      setError(err.message || 'Failed to load opportunity applicants.');
    } finally {
      setLoading(false);
    }
  }, [id, page, searchTerm, selectedDept, selectedGradYear, selectedStatus, minCgpa, selectedSort]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleStatusUpdate = async (appId, newStatus, note) => {
    const res = await updateApplicationStatus(appId, { status: newStatus, note });
    if (res && res.success) {
      setFeedback({
        message: `Candidate status updated to ${newStatus}`,
        type: 'success',
      });
      fetchData();
    }
    setTimeout(() => setFeedback({ message: '', type: '' }), 4000);
  };

  const handleInterviewSave = async (appId, interviewData) => {
    let res;
    if (activeInterviewApp?.interview) {
      res = await updateInterview(appId, interviewData);
    } else {
      res = await scheduleInterview(appId, interviewData);
    }

    if (res && res.success) {
      setFeedback({
        message: 'Interview details saved successfully.',
        type: 'success',
      });
      fetchData();
    }
    setTimeout(() => setFeedback({ message: '', type: '' }), 4000);
  };

  const handleInterviewCancel = async (appId, reason) => {
    const res = await cancelInterview(appId, reason);
    if (res && res.success) {
      setFeedback({
        message: 'Interview has been cancelled.',
        type: 'success',
      });
      fetchData();
    }
    setTimeout(() => setFeedback({ message: '', type: '' }), 4000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Navigation Breadcrumb */}
      <div className="mb-6 flex items-center justify-between">
        <Link
          to="/tpo/opportunities"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-[#4F46E5] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to TPO Opportunities
        </Link>

        {opportunity && (
          <Link
            to={`/opportunities/${id}`}
            className="inline-flex items-center gap-1 text-xs font-semibold text-[#4F46E5] hover:underline"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            View Drive Posting
          </Link>
        )}
      </div>

      {/* User Feedback Alerts */}
      {feedback.message && (
        <div
          className={`mb-6 p-4 rounded-xl border text-sm font-medium flex items-center gap-3 animate-in fade-in ${
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

      {/* Opportunity Overview Header Card */}
      {opportunity && (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                {opportunity.companyName}
              </span>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                  opportunity.type === 'PLACEMENT'
                    ? 'bg-indigo-50 text-[#4F46E5] border-indigo-200'
                    : 'bg-purple-50 text-[#7C3AED] border-purple-200'
                }`}
              >
                {opportunity.type}
              </span>
            </div>
            <h1 className="text-2xl font-bold text-[#172033] tracking-tight">{opportunity.title}</h1>
            <p className="text-xs text-slate-500 font-medium">
              Role: <strong className="text-slate-700">{opportunity.role}</strong> • Location: {opportunity.location} ({opportunity.workMode})
            </p>
          </div>

          <div className="flex items-center gap-4 bg-slate-50 px-5 py-3 rounded-xl border border-slate-200 self-start md:self-auto">
            <div className="w-10 h-10 rounded-xl bg-indigo-100 text-[#4F46E5] flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                Total Applicants
              </span>
              <span className="text-xl font-bold text-[#172033]">
                {pagination.totalItems} Candidates
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Filters and Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-4 mb-6">
        <div className="flex flex-col md:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by candidate name, email, or skill..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(1);
              }}
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#4F46E5] focus:bg-white text-[#172033]"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            {/* Department Filter */}
            <select
              value={selectedDept}
              onChange={(e) => {
                setSelectedDept(e.target.value);
                setPage(1);
              }}
              className="px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 text-slate-700 font-medium focus:outline-none focus:ring-1 focus:ring-[#4F46E5]"
            >
              <option value="">All Departments</option>
              <option value="CS">Computer Science</option>
              <option value="IT">Information Tech</option>
              <option value="ENTC">Electronics &amp; TC</option>
              <option value="MECH">Mechanical</option>
              <option value="CIVIL">Civil</option>
              <option value="ELECTRICAL">Electrical</option>
            </select>

            {/* Min CGPA Filter */}
            <select
              value={minCgpa}
              onChange={(e) => {
                setMinCgpa(e.target.value);
                setPage(1);
              }}
              className="px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 text-slate-700 font-medium focus:outline-none focus:ring-1 focus:ring-[#4F46E5]"
            >
              <option value="">Any CGPA</option>
              <option value="7.0">CGPA ≥ 7.0</option>
              <option value="7.5">CGPA ≥ 7.5</option>
              <option value="8.0">CGPA ≥ 8.0</option>
              <option value="8.5">CGPA ≥ 8.5</option>
              <option value="9.0">CGPA ≥ 9.0</option>
            </select>

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
              <option value="APPLIED">Applied</option>
              <option value="SHORTLISTED">Shortlisted</option>
              <option value="INTERVIEW">Interview</option>
              <option value="SELECTED">Selected</option>
              <option value="WAITLISTED">Waitlisted</option>
              <option value="REJECTED">Rejected</option>
              <option value="WITHDRAWN">Withdrawn</option>
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
              <option value="newest">Applied: Newest First</option>
              <option value="oldest">Applied: Oldest First</option>
              <option value="cgpaHigh">CGPA: High to Low</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-16 bg-white rounded-xl border border-slate-200 p-4 animate-pulse"></div>
          ))}
        </div>
      ) : error ? (
        <div className="bg-rose-50 border border-rose-200 rounded-2xl p-8 text-center my-8">
          <AlertCircle className="w-10 h-10 text-rose-500 mx-auto mb-3" />
          <h3 className="font-bold text-rose-900 text-lg">Failed to load applicants</h3>
          <p className="text-sm text-rose-700 mt-1">{error}</p>
          <button
            onClick={fetchData}
            className="mt-4 px-4 py-2 bg-rose-600 text-white rounded-lg text-xs font-semibold"
          >
            Retry
          </button>
        </div>
      ) : applicants.length === 0 ? (
        <div className="bg-white border border-slate-200/80 rounded-2xl p-12 text-center max-w-lg mx-auto my-8 shadow-sm">
          <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-[#4F46E5] flex items-center justify-center mx-auto mb-3">
            <Users className="w-7 h-7" />
          </div>
          <h3 className="font-bold text-lg text-[#172033]">No applications found</h3>
          <p className="text-sm text-slate-500 mt-1 max-w-sm mx-auto">
            Eligible students who submit applications matching your filter criteria will appear here.
          </p>
        </div>
      ) : (
        <>
          {/* Desktop Table View */}
          <div className="hidden lg:block bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3.5 px-4">Candidate</th>
                  <th className="py-3.5 px-4">Dept &amp; Batch</th>
                  <th className="py-3.5 px-4">CGPA / Backlogs</th>
                  <th className="py-3.5 px-4">Skills</th>
                  <th className="py-3.5 px-4">Resume</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {applicants.map((app) => {
                  const appId = app.id || app._id;
                  const student = app.student || {};
                  const studentSnapshot = app.studentSnapshot || app.studentProfileSnapshot || {};
                  const appliedDate = app.appliedAt ? new Date(app.appliedAt) : new Date(app.createdAt);
                  const appliedDateStr = !isNaN(appliedDate.getTime())
                    ? appliedDate.toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })
                    : 'N/A';

                  const cgpa = studentSnapshot.cgpa || student.cgpa || 'N/A';
                  const backlogs = studentSnapshot.backlogs ?? student.backlogs ?? 0;
                  const department = studentSnapshot.department || student.department || 'N/A';
                  const gradYear = studentSnapshot.graduationYear || student.graduationYear || 'N/A';
                  const skills = studentSnapshot.skills || student.skills || [];

                  return (
                    <tr key={appId} className="hover:bg-slate-50/50 transition-colors">
                      {/* Candidate */}
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-[#172033]">
                          <Link
                            to={`/tpo/applications/${appId}`}
                            className="hover:text-[#4F46E5] transition-colors"
                          >
                            {student.name || 'Candidate'}
                          </Link>
                        </div>
                        <div className="text-xs text-slate-500 flex items-center gap-1">
                          <Mail className="w-3 h-3 text-slate-400" />
                          {student.email || 'N/A'}
                        </div>

                        {/* Interview tag if scheduled */}
                        {app.interview && app.interview.status !== 'CANCELLED' && (
                          <div className="mt-1 inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-purple-50 text-[#7C3AED] text-[10px] font-bold border border-purple-100">
                            <Video className="w-3 h-3" />
                            {app.interview.round} • {app.interview.date} ({app.interview.startTime})
                          </div>
                        )}
                      </td>

                      {/* Dept & Batch */}
                      <td className="py-3.5 px-4">
                        <span className="font-semibold text-slate-800 text-xs">{department}</span>
                        <div className="text-[11px] text-slate-500">Batch of {gradYear}</div>
                      </td>

                      {/* CGPA / Backlogs */}
                      <td className="py-3.5 px-4">
                        <span className="font-bold text-emerald-700 text-xs">{cgpa}</span>
                        <div className="text-[11px] text-slate-500">
                          {backlogs === 0 ? (
                            <span className="text-slate-600">0 backlogs</span>
                          ) : (
                            <span className="text-amber-600 font-semibold">{backlogs} backlogs</span>
                          )}
                        </div>
                      </td>

                      {/* Skills */}
                      <td className="py-3.5 px-4">
                        <div className="flex flex-wrap gap-1 max-w-xs">
                          {skills.slice(0, 3).map((skill, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10px] font-medium"
                            >
                              {skill}
                            </span>
                          ))}
                          {skills.length > 3 && (
                            <span className="px-1.5 py-0.5 rounded-md bg-slate-50 text-slate-500 text-[10px]">
                              +{skills.length - 3}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Resume */}
                      <td className="py-3.5 px-4">
                        {app.resume?.url ? (
                          <a
                            href={app.resume.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold text-[#4F46E5] bg-indigo-50 hover:bg-indigo-100 transition-colors"
                          >
                            <FileText className="w-3.5 h-3.5" />
                            View
                          </a>
                        ) : (
                          <span className="text-xs text-slate-400">None</span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        <StatusBadge status={app.status} size="sm" />
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="inline-flex items-center gap-1.5 justify-end">
                          <button
                            type="button"
                            onClick={() => setActiveStatusApp(app)}
                            className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                            title="Update Recruitment Status"
                          >
                            Status
                          </button>

                          <button
                            type="button"
                            onClick={() => setActiveInterviewApp(app)}
                            className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-purple-50 hover:bg-purple-100 text-[#7C3AED] transition-colors"
                            title="Schedule or Manage Interview"
                          >
                            Interview
                          </button>

                          <Link
                            to={`/tpo/applications/${appId}`}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-[#4F46E5] hover:bg-indigo-50 transition-colors"
                            title="View Full Application Timeline"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile Stacked Card View */}
          <div className="lg:hidden space-y-4">
            {applicants.map((app) => {
              const appId = app.id || app._id;
              const student = app.student || {};
              const studentSnapshot = app.studentSnapshot || app.studentProfileSnapshot || {};
              const appliedDate = app.appliedAt ? new Date(app.appliedAt) : new Date(app.createdAt);
              const appliedDateStr = !isNaN(appliedDate.getTime())
                ? appliedDate.toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })
                : 'N/A';

              const cgpa = studentSnapshot.cgpa || student.cgpa || 'N/A';
              const backlogs = studentSnapshot.backlogs ?? student.backlogs ?? 0;
              const department = studentSnapshot.department || student.department || 'N/A';
              const gradYear = studentSnapshot.graduationYear || student.graduationYear || 'N/A';
              const skills = studentSnapshot.skills || student.skills || [];

              return (
                <div key={appId} className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="font-bold text-base text-[#172033]">
                        <Link to={`/tpo/applications/${appId}`}>{student.name || 'Candidate'}</Link>
                      </h4>
                      <p className="text-xs text-slate-500">{student.email}</p>
                    </div>
                    <StatusBadge status={app.status} size="sm" />
                  </div>

                  {app.interview && app.interview.status !== 'CANCELLED' && (
                    <div className="bg-purple-50 p-2.5 rounded-lg text-xs text-purple-900 font-semibold flex items-center gap-2">
                      <Video className="w-4 h-4 text-[#7C3AED]" />
                      <span>{app.interview.round} • {app.interview.date} ({app.interview.startTime})</span>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 p-3 rounded-lg">
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-semibold">Dept &amp; Batch</span>
                      <span className="font-semibold text-slate-700">{department} ({gradYear})</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-semibold">CGPA / Backlogs</span>
                      <span className="font-bold text-emerald-700">{cgpa}</span> ({backlogs} backlogs)
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      {app.resume?.url && (
                        <a
                          href={app.resume.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs font-semibold text-[#4F46E5] hover:underline flex items-center gap-1"
                        >
                          <FileText className="w-3.5 h-3.5" /> Resume
                        </a>
                      )}
                      <Link
                        to={`/tpo/applications/${appId}`}
                        className="text-xs text-slate-500 hover:text-slate-700 ml-2"
                      >
                        Details
                      </Link>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => setActiveStatusApp(app)}
                        className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200"
                      >
                        Status
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveInterviewApp(app)}
                        className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-purple-50 text-[#7C3AED] hover:bg-purple-100"
                      >
                        Interview
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
                Page {pagination.currentPage} of {pagination.totalPages} ({pagination.totalItems} applicants)
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

      {/* Modals */}
      <UpdateStatusModal
        isOpen={!!activeStatusApp}
        onClose={() => setActiveStatusApp(null)}
        application={activeStatusApp}
        onSuccess={handleStatusUpdate}
      />

      <InterviewModal
        isOpen={!!activeInterviewApp}
        onClose={() => setActiveInterviewApp(null)}
        application={activeInterviewApp}
        onSave={handleInterviewSave}
        onCancelInterview={handleInterviewCancel}
      />
    </div>
  );
};

export default OpportunityApplicantsPage;
