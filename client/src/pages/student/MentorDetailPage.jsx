import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Briefcase,
  GraduationCap,
  Link2,
  Globe,
  CheckCircle,
  Sparkles,
  Send,
  Loader2,
  AlertCircle,
  Award,
  Ban,
  CheckCircle2,
  X,
  MessageCircle,
} from 'lucide-react';
import {
  getMentorById,
  completeMentorship,
  cancelMentorship,
} from '../../services/mentorshipService';
import MentorshipStatusBadge from '../../components/MentorshipStatusBadge';
import RequestMentorshipModal from '../../components/RequestMentorshipModal';

export const MentorDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [mentor, setMentor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  const fetchMentor = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getMentorById(id);
      setMentor(res.data?.data || null);
    } catch (err) {
      setError(
        err.response?.data?.message || 'Unable to load mentor profile details.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMentor();
  }, [id]);

  const handleComplete = async (mentorshipId) => {
    if (!window.confirm('Mark this mentorship as completed?')) return;
    setActionLoading(true);
    try {
      await completeMentorship(mentorshipId);
      setToastMessage('Mentorship successfully marked as completed!');
      await fetchMentor();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to complete mentorship.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancel = async (mentorshipId) => {
    if (!window.confirm('Are you sure you want to cancel this mentorship request?')) return;
    setActionLoading(true);
    try {
      await cancelMentorship(mentorshipId);
      setToastMessage('Mentorship request cancelled.');
      await fetchMentor();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to cancel mentorship.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRequestSuccess = () => {
    setToastMessage('Mentorship request successfully submitted!');
    fetchMentor();
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#4F46E5] mx-auto mb-3" />
        <p className="text-xs font-semibold text-slate-600">Loading mentor profile...</p>
      </div>
    );
  }

  if (error || !mentor) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12">
        <div className="p-8 bg-rose-50 border border-rose-200 rounded-2xl text-center">
          <AlertCircle className="w-8 h-8 text-rose-500 mx-auto mb-2" />
          <h2 className="text-base font-bold text-rose-800 mb-1">Mentor Not Found</h2>
          <p className="text-xs text-rose-600 mb-4">{error || 'Unable to retrieve this mentor profile.'}</p>
          <button
            onClick={() => navigate('/student/mentors')}
            className="px-4 py-2 text-xs font-semibold text-white bg-rose-600 rounded-xl hover:bg-rose-700"
          >
            Back to Mentors
          </button>
        </div>
      </div>
    );
  }

  const existing = mentor.existingMentorship;
  const initials = mentor.fullName
    ? mentor.fullName
        .split(' ')
        .map((n) => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : 'AL';

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
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

      {/* Back Button */}
      <button
        onClick={() => navigate('/student/mentors')}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-[#172033] mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Mentors</span>
      </button>

      {/* Main Profile Header Card */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm mb-6">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
            {mentor.profilePhoto ? (
              <img
                src={mentor.profilePhoto}
                alt={mentor.fullName}
                className="w-20 h-20 rounded-2xl object-cover border border-slate-200 shadow-xs"
              />
            ) : (
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#EEF2FF] to-[#E0E7FF] text-[#4F46E5] font-extrabold text-2xl flex items-center justify-center border border-indigo-100 shadow-xs">
                {initials}
              </div>
            )}
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-[#172033]">
                  {mentor.fullName}
                </h1>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                  Verified Alumni
                </span>
              </div>
              <p className="text-sm font-semibold text-slate-800 mt-1 flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-[#4F46E5]" />
                <span>{mentor.currentRole}</span>
                <span className="text-slate-300">•</span>
                <span className="text-[#4F46E5] font-bold">{mentor.currentCompany}</span>
              </p>
              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mt-2">
                <span className="flex items-center gap-1">
                  <GraduationCap className="w-3.5 h-3.5 text-slate-400" />
                  {mentor.department} (Class of {mentor.graduationYear})
                </span>
                <span>•</span>
                <span>{mentor.college}</span>
                {mentor.yearsOfExperience > 0 && (
                  <>
                    <span>•</span>
                    <span className="font-semibold text-slate-700">
                      {mentor.yearsOfExperience} Years Experience
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Social Links */}
          <div className="flex items-center gap-2">
            {mentor.linkedinUrl && (
              <a
                href={mentor.linkedinUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2.5 rounded-xl bg-slate-50 text-slate-600 hover:text-[#0A66C2] hover:bg-sky-50 border border-slate-200 transition-colors flex items-center gap-1.5 text-xs font-semibold"
                title="LinkedIn Profile"
              >
                <Link2 className="w-4 h-4 text-[#0A66C2]" />
                <span>LinkedIn</span>
              </a>
            )}
            {mentor.githubUrl && (
              <a
                href={mentor.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2.5 rounded-xl bg-slate-50 text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 transition-colors flex items-center gap-1.5 text-xs font-semibold"
                title="GitHub Profile"
              >
                <Globe className="w-4 h-4 text-slate-700" />
                <span>GitHub</span>
              </a>
            )}
          </div>
        </div>

        {/* Current Mentorship Status Banner / Action */}
        <div className="mt-8 pt-6 border-t border-slate-100">
          {!existing || existing.status === 'CANCELLED' ? (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-[#EEF2FF] to-white p-5 rounded-2xl border border-indigo-100">
              <div>
                <h3 className="text-sm font-bold text-[#172033]">
                  Ready to connect with {mentor.fullName}?
                </h3>
                <p className="text-xs text-slate-600 mt-0.5">
                  Request 1-on-1 career guidance, technical mock discussion, or resume feedback.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(true)}
                className="px-6 py-2.5 text-xs font-semibold text-white bg-[#4F46E5] hover:bg-[#4338CA] rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 flex-shrink-0"
              >
                <Send className="w-4 h-4" />
                <span>Request Mentorship</span>
              </button>
            </div>
          ) : existing.status === 'PENDING' ? (
            <div className="p-5 rounded-2xl bg-amber-50/80 border border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <MentorshipStatusBadge status="PENDING" />
                  <span className="text-xs text-slate-500">
                    Requested on {new Date(existing.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-xs text-amber-900 font-medium">
                  Your request has been delivered to {mentor.fullName}. You will be notified once they respond.
                </p>
                {existing.requestMessage && (
                  <p className="text-xs text-slate-600 italic bg-white/70 p-2.5 rounded-xl border border-amber-200/60 mt-2">
                    "{existing.requestMessage}"
                  </p>
                )}
              </div>
              <button
                type="button"
                disabled={actionLoading}
                onClick={() => handleCancel(existing._id || existing.id)}
                className="px-4 py-2 text-xs font-semibold text-rose-700 bg-white border border-rose-200 hover:bg-rose-50 rounded-xl transition-colors flex items-center justify-center gap-1.5 flex-shrink-0 disabled:opacity-50"
              >
                <Ban className="w-3.5 h-3.5" />
                <span>Cancel Request</span>
              </button>
            </div>
          ) : existing.status === 'ACCEPTED' ? (
            <div className="p-5 rounded-2xl bg-emerald-50/80 border border-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <MentorshipStatusBadge status="ACCEPTED" />
                  <span className="text-xs text-slate-500">
                    Active since {new Date(existing.startedAt || existing.updatedAt).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-xs text-emerald-900 font-medium">
                  Mentorship active! You can now coordinate guidance sessions and discussions with {mentor.fullName}.
                </p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  type="button"
                  onClick={() => navigate(`/student/chat?with=${id}`)}
                  className="px-4 py-2 text-xs font-semibold text-indigo-700 bg-indigo-50 border border-indigo-200 hover:bg-indigo-100 rounded-xl transition-colors flex items-center gap-1.5"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>Message</span>
                </button>
                <button
                  type="button"
                  disabled={actionLoading}
                  onClick={() => handleComplete(existing._id || existing.id)}
                  className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors flex items-center gap-1.5 disabled:opacity-50"
                >
                  <Award className="w-3.5 h-3.5" />
                  <span>Mark Completed</span>
                </button>
                <button
                  type="button"
                  disabled={actionLoading}
                  onClick={() => handleCancel(existing._id || existing.id)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl transition-colors flex items-center gap-1.5 disabled:opacity-50"
                >
                  <Ban className="w-3.5 h-3.5" />
                  <span>End Mentorship</span>
                </button>
              </div>
            </div>
          ) : existing.status === 'COMPLETED' ? (
            <div className="p-5 rounded-2xl bg-indigo-50/80 border border-indigo-200 flex items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <MentorshipStatusBadge status="COMPLETED" />
                  <span className="text-xs text-slate-500">
                    Completed on {new Date(existing.completedAt || existing.updatedAt).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-xs text-indigo-900 font-medium">
                  This mentorship relationship has successfully concluded.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(true)}
                className="px-4 py-2 text-xs font-semibold text-[#4F46E5] bg-white border border-indigo-200 hover:bg-indigo-50 rounded-xl transition-colors"
              >
                Request Again
              </button>
            </div>
          ) : existing.status === 'REJECTED' ? (
            <div className="p-5 rounded-2xl bg-rose-50/80 border border-rose-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <MentorshipStatusBadge status="REJECTED" />
                  <span className="text-xs text-slate-500">
                    Declined on {new Date(existing.rejectedAt || existing.updatedAt).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-xs text-rose-900 font-medium">
                  Mentor declined this request.
                  {existing.responseMessage && (
                    <span className="italic block mt-1 text-slate-700">
                      Note from mentor: "{existing.responseMessage}"
                    </span>
                  )}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(true)}
                className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl transition-colors"
              >
                Send New Request
              </button>
            </div>
          ) : null}
        </div>
      </div>

      {/* Two Column Layout: Details & Match Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Bio, Skills, Mentorship Areas */}
        <div className="lg:col-span-2 space-y-6">
          {/* About / Bio */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <h2 className="text-sm font-bold text-[#172033] mb-3">About the Mentor</h2>
            <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-line">
              {mentor.bio ||
                'Experienced graduate actively contributing to industry solutions and open to mentoring motivated campus juniors.'}
            </p>
          </div>

          {/* Mentorship Areas */}
          {mentor.mentorshipAreas && mentor.mentorshipAreas.length > 0 && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <h2 className="text-sm font-bold text-[#172033] mb-3">
                Mentorship &amp; Guidance Topics
              </h2>
              <div className="flex flex-wrap gap-2">
                {mentor.mentorshipAreas.map((area, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 rounded-xl text-xs font-semibold bg-[#EEF2FF] text-[#4F46E5] border border-indigo-100"
                  >
                    {area}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Professional Skills */}
          {mentor.skills && mentor.skills.length > 0 && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <h2 className="text-sm font-bold text-[#172033] mb-3">
                Technical &amp; Domain Skills
              </h2>
              <div className="flex flex-wrap gap-2">
                {mentor.skills.map((skill, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 rounded-xl text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200/60"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Previous Companies */}
          {mentor.previousCompanies && mentor.previousCompanies.length > 0 && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <h2 className="text-sm font-bold text-[#172033] mb-3">Previous Companies</h2>
              <div className="flex flex-wrap gap-2">
                {mentor.previousCompanies.map((c, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 rounded-xl text-xs font-medium bg-slate-50 text-slate-700 border border-slate-200"
                  >
                    {c}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Match Analysis Card */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-xl bg-[#EEF2FF] text-[#4F46E5] flex items-center justify-center">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-[#172033]">Profile Match Breakdown</h3>
                <span className="text-[11px] text-slate-400 font-medium">Deterministic Scoring</span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 mb-4 text-center">
              <span className="text-3xl font-extrabold text-[#4F46E5]">
                {mentor.matchScore || 60}%
              </span>
              <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mt-1">
                {mentor.matchLabel || 'Profile Match'}
              </p>
            </div>

            {mentor.matchReasons && mentor.matchReasons.length > 0 ? (
              <div className="space-y-2">
                <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  Why you match:
                </p>
                {mentor.matchReasons.map((reason, idx) => (
                  <div
                    key={idx}
                    className="text-xs text-slate-700 font-medium flex items-start gap-2 bg-white p-2 rounded-lg border border-slate-100"
                  >
                    <span className="text-[#4F46E5] font-bold">✓</span>
                    <span>{reason}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-500">
                Alumnus from your campus network with verified credentials.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Request Modal */}
      {isModalOpen && (
        <RequestMentorshipModal
          mentor={mentor}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSuccess={handleRequestSuccess}
        />
      )}
    </div>
  );
};

export default MentorDetailPage;
