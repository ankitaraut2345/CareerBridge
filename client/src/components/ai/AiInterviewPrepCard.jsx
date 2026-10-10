import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  Code,
  FolderGit2,
  Users,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Lightbulb,
  AlertCircle,
  ShieldCheck,
  Calendar,
  ArrowRight,
  Target,
} from 'lucide-react';
import { prepareInterview, getInterviewPreparation } from '../../services/aiService';

/**
 * AiInterviewPrepCard Component (Phase 14)
 *
 * Provides a tailored AI-powered interview preparation guide
 * based on the target opportunity and the student's profile/projects.
 */
export const AiInterviewPrepCard = ({ opportunityId, opportunityTitle, companyName }) => {
  const [prepData, setPrepData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [initialChecking, setInitialChecking] = useState(true);
  const [hasProfile, setHasProfile] = useState(true);
  const [scheduledInfo, setScheduledInfo] = useState(null);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('technical'); // 'technical' | 'project' | 'hr' | 'tips'
  const [expandedIndices, setExpandedIndices] = useState({
    technical: {},
    project: {},
    hr: {},
  });

  // Check for existing/cached preparation guide
  useEffect(() => {
    let isMounted = true;
    const fetchExisting = async () => {
      setInitialChecking(true);
      setError(null);
      try {
        const res = await getInterviewPreparation(opportunityId);
        if (isMounted && res && res.success) {
          if (res.data) {
            setPrepData(res.data);
          }
          if (res.hasProfile !== undefined) {
            setHasProfile(res.hasProfile);
          }
          if (res.hasScheduledInterview) {
            setScheduledInfo({
              round: res.scheduledInterviewRound || 'Technical Round',
            });
          }
        }
      } catch (err) {
        console.warn('Could not load previous interview prep:', err.message);
      } finally {
        if (isMounted) setInitialChecking(false);
      }
    };

    if (opportunityId) {
      fetchExisting();
    }

    return () => {
      isMounted = false;
    };
  }, [opportunityId]);

  const handleGeneratePrep = async (force = false) => {
    setLoading(true);
    setError(null);

    try {
      const res = await prepareInterview(opportunityId, force);
      if (res && res.success) {
        setPrepData(res.data);
        // Expand first question in each section for nice default preview
        setExpandedIndices({
          technical: { 0: true },
          project: { 0: true },
          hr: { 0: true },
        });
      } else {
        setError(res?.message || 'We could not generate interview preparation right now. Please try again.');
      }
    } catch (err) {
      console.error('AI Interview Preparation error:', err);
      if (err.data?.code === 'NO_PROFILE') {
        setHasProfile(false);
        setError('Please complete your student profile before generating interview preparation.');
      } else {
        setError(
          err.message || 'We could not generate interview preparation right now. Please try again later.'
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const toggleExpand = (section, idx) => {
    setExpandedIndices((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [idx]: !prev[section]?.[idx],
      },
    }));
  };

  const getDifficultyBadge = (difficulty) => {
    switch (String(difficulty).toUpperCase()) {
      case 'HARD':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'EASY':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'MEDIUM':
      default:
        return 'bg-indigo-50 text-[#4F46E5] border-indigo-200';
    }
  };

  // ── 1. Initial Checking Skeleton ──────────────────────────────────────
  if (initialChecking) {
    return (
      <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-7 shadow-sm">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-5 h-5 rounded bg-slate-200 animate-pulse" />
          <div className="h-4 w-44 bg-slate-200 rounded animate-pulse" />
        </div>
        <div className="h-16 bg-slate-100 rounded-2xl animate-pulse" />
      </div>
    );
  }

  // ── 2. Missing Profile State ──────────────────────────────────────────
  if (!hasProfile) {
    return (
      <div className="bg-white rounded-3xl border border-amber-200/80 p-6 sm:p-7 shadow-sm relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center flex-shrink-0">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800">
                <Sparkles className="w-3 h-3" /> Profile Incomplete
              </span>
              <h3 className="text-base font-bold text-slate-900 mt-1">Complete your profile to prepare</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-xl leading-relaxed">
                Add your technical skills and past projects so the AI can craft role-specific questions and project deep-dives tailored to your background.
              </p>
            </div>
          </div>
          <Link
            to="/student"
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl font-bold text-xs bg-[#4F46E5] hover:bg-indigo-700 text-white transition-all shadow-sm flex items-center justify-center gap-2 flex-shrink-0"
          >
            Update Profile
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    );
  }

  // ── 3. Active Loading / Generation State ──────────────────────────────
  if (loading) {
    return (
      <div className="bg-white rounded-3xl border border-purple-200 p-6 sm:p-8 shadow-sm text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-50/50 via-indigo-50/30 to-sky-50/50 animate-pulse pointer-events-none" />
        <div className="relative z-10 max-w-md mx-auto py-4 space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-purple-50 border border-purple-200 text-[#7C3AED] flex items-center justify-center mx-auto shadow-inner relative">
            <Sparkles className="w-7 h-7 animate-spin" style={{ animationDuration: '3s' }} />
          </div>
          <div>
            <h3 className="text-base font-bold text-[#172033]">Formulating interview preparation...</h3>
            <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
              Synthesizing role requirements, technical competencies, and your actual projects into a personalized practice guide.
            </p>
          </div>
          <div className="w-48 mx-auto bg-slate-100 rounded-full h-1.5 overflow-hidden">
            <div className="bg-gradient-to-r from-[#7C3AED] to-[#38BDF8] h-full w-2/3 rounded-full animate-pulse" />
          </div>
          <p className="text-[11px] text-slate-400">Crafting technical, project, and behavioral questions...</p>
        </div>
      </div>
    );
  }

  // ── 4. Empty State (Not Yet Generated) ────────────────────────────────
  if (!prepData) {
    return (
      <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-7 shadow-sm transition-all hover:border-purple-200">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-purple-50 text-[#7C3AED] border border-purple-100">
                <Sparkles className="w-3.5 h-3.5 text-[#7C3AED]" />
                AI Interview Preparation
              </span>
              {scheduledInfo && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <Calendar className="w-3 h-3" /> Interview Scheduled: {scheduledInfo.round}
                </span>
              )}
            </div>
            <h3 className="text-lg font-bold text-[#172033]">
              Prepare for your interview at {companyName}
            </h3>
            <p className="text-xs text-slate-500 max-w-xl leading-relaxed">
              Get an interview guide featuring technical questions tailored to {companyName}'s stack, project questions referencing your personal work, and sample behavioral questions.
            </p>
            {error && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2 mt-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}
          </div>

          <div className="flex-shrink-0">
            <button
              onClick={() => handleGeneratePrep(false)}
              className="w-full sm:w-auto px-6 py-3.5 rounded-2xl font-bold text-xs bg-gradient-to-r from-[#7C3AED] to-[#4F46E5] hover:from-purple-700 hover:to-indigo-600 text-white shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2.5 cursor-pointer active:scale-95"
            >
              <Sparkles className="w-4 h-4 text-[#38BDF8]" />
              Prepare with AI
            </button>
          </div>
        </div>

        {/* Advisory Note */}
        <div className="mt-5 pt-4 border-t border-slate-100 flex items-center gap-2 text-[11px] text-slate-400">
          <ShieldCheck className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
          <span>
            Practice questions are advisory simulations to assist your preparation. Questions are not guaranteed to be asked.
          </span>
        </div>
      </div>
    );
  }

  // ── 5. Full Generated Interview Guide ─────────────────────────────────
  const technicalCount = prepData.technicalQuestions?.length || 0;
  const projectCount = prepData.projectQuestions?.length || 0;
  const hrCount = prepData.hrQuestions?.length || 0;
  const tipsCount = prepData.preparationTips?.length || 0;

  return (
    <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden space-y-6 p-6 sm:p-8">
      {/* ── Header Bar ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-purple-50 border border-purple-100 text-[#7C3AED] flex items-center justify-center shadow-xs">
            <Sparkles className="w-5 h-5 text-[#7C3AED]" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-base font-bold text-[#172033]">AI Interview Preparation Guide</h3>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-purple-50 text-[#7C3AED] border border-purple-200">
                Tailored for {companyName}
              </span>
              {prepData.hasScheduledInterview && (
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 inline-flex items-center gap-1">
                  <Calendar className="w-3 h-3" /> {prepData.scheduledInterviewRound || 'Scheduled Round'}
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Role: <span className="font-semibold text-slate-600">{opportunityTitle}</span>
            </p>
          </div>
        </div>

        {/* Action: Regenerate */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleGeneratePrep(true)}
            disabled={loading}
            className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-purple-700 bg-slate-50 hover:bg-purple-50 border border-slate-200 transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            title="Regenerate interview preparation guide"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Regenerate Guide
          </button>
        </div>
      </div>

      {/* ── Overview & Focus Areas Card ── */}
      <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-50 via-purple-50/20 to-indigo-50/20 border border-slate-100 space-y-3">
        <div className="flex items-center gap-2">
          <Target className="w-4 h-4 text-[#7C3AED]" />
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">Interview Strategy & Focus</h4>
        </div>
        <p className="text-sm text-slate-700 leading-relaxed font-normal">
          {prepData.overview}
        </p>

        {prepData.focusAreas?.length > 0 && (
          <div className="pt-2 border-t border-slate-200/60 flex items-center gap-2 flex-wrap text-xs">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Key Focus Areas:</span>
            {prepData.focusAreas.map((area, idx) => (
              <span
                key={idx}
                className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-white text-indigo-700 border border-indigo-100 shadow-xs"
              >
                #{area}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* ── Section Navigation Tabs ── */}
      <div className="flex items-center gap-2 border-b border-slate-100 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('technical')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 flex-shrink-0 cursor-pointer ${
            activeTab === 'technical'
              ? 'bg-[#4F46E5] text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          <Code className="w-4 h-4" />
          Technical Questions ({technicalCount})
        </button>

        <button
          onClick={() => setActiveTab('project')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 flex-shrink-0 cursor-pointer ${
            activeTab === 'project'
              ? 'bg-[#7C3AED] text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          <FolderGit2 className="w-4 h-4" />
          Project Questions ({projectCount})
        </button>

        <button
          onClick={() => setActiveTab('hr')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 flex-shrink-0 cursor-pointer ${
            activeTab === 'hr'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          <Users className="w-4 h-4" />
          HR & Behavioral ({hrCount})
        </button>

        <button
          onClick={() => setActiveTab('tips')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 flex-shrink-0 cursor-pointer ${
            activeTab === 'tips'
              ? 'bg-amber-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          <Lightbulb className="w-4 h-4" />
          Preparation Tips ({tipsCount})
        </button>
      </div>

      {/* ── Tab Content: Technical Questions ── */}
      {activeTab === 'technical' && (
        <div className="space-y-4">
          {prepData.technicalQuestions?.map((item, idx) => {
            const isExpanded = Boolean(expandedIndices.technical?.[idx]);
            return (
              <div
                key={idx}
                className="rounded-2xl border border-slate-200/90 overflow-hidden bg-white shadow-xs transition-all hover:border-indigo-200"
              >
                <div
                  onClick={() => toggleExpand('technical', idx)}
                  className="p-4 sm:p-5 flex items-start justify-between gap-4 cursor-pointer select-none bg-slate-50/50 hover:bg-indigo-50/30 transition-colors"
                >
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[11px] font-bold text-slate-400">Q{idx + 1}</span>
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-700">
                        {item.category}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${getDifficultyBadge(
                          item.difficulty
                        )}`}
                      >
                        {item.difficulty}
                      </span>
                    </div>
                    <h4 className="text-sm font-bold text-[#172033] leading-snug">{item.question}</h4>
                    {item.whatItTests && (
                      <p className="text-xs text-slate-500">
                        <strong>What it tests:</strong> {item.whatItTests}
                      </p>
                    )}
                  </div>
                  <div className="p-1 rounded-lg text-slate-400 hover:text-slate-600 flex-shrink-0">
                    {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                  </div>
                </div>

                {/* Collapsible Answer Guidance */}
                {isExpanded && (
                  <div className="p-4 sm:p-5 border-t border-slate-100 space-y-3 bg-white">
                    <div>
                      <h5 className="text-xs font-bold uppercase tracking-wider text-[#4F46E5] mb-1">
                        Answer Guidance & Approach
                      </h5>
                      <p className="text-xs text-slate-700 leading-relaxed font-normal">
                        {item.answerGuidance}
                      </p>
                    </div>

                    {item.keyPoints?.length > 0 && (
                      <div className="pt-2 border-t border-slate-100">
                        <h6 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                          Key Points to Hit:
                        </h6>
                        <ul className="space-y-1.5 text-xs text-slate-600">
                          {item.keyPoints.map((pt, pIdx) => (
                            <li key={pIdx} className="flex items-start gap-2">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 mt-0.5 flex-shrink-0" />
                              <span className="leading-relaxed">{pt}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ── Tab Content: Project Deep-Dive Questions ── */}
      {activeTab === 'project' && (
        <div className="space-y-4">
          <div className="p-3.5 rounded-xl bg-purple-50/70 border border-purple-100 text-xs text-purple-900 flex items-center gap-2">
            <FolderGit2 className="w-4 h-4 text-[#7C3AED] flex-shrink-0" />
            <span>
              These questions are specifically tailored to your verified profile projects. Practice explaining trade-offs, architecture, and edge cases.
            </span>
          </div>

          {prepData.projectQuestions?.map((item, idx) => {
            const isExpanded = Boolean(expandedIndices.project?.[idx]);
            return (
              <div
                key={idx}
                className="rounded-2xl border border-slate-200/90 overflow-hidden bg-white shadow-xs transition-all hover:border-purple-200"
              >
                <div
                  onClick={() => toggleExpand('project', idx)}
                  className="p-4 sm:p-5 flex items-start justify-between gap-4 cursor-pointer select-none bg-slate-50/50 hover:bg-purple-50/30 transition-colors"
                >
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[11px] font-bold text-slate-400">Project Q{idx + 1}</span>
                      <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-purple-100 text-purple-800">
                        📁 {item.projectName || 'Featured Project'}
                      </span>
                    </div>
                    <h4 className="text-sm font-bold text-[#172033] leading-snug">{item.question}</h4>
                  </div>
                  <div className="p-1 rounded-lg text-slate-400 hover:text-slate-600 flex-shrink-0">
                    {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                  </div>
                </div>

                {/* Collapsible Answer Guidance */}
                {isExpanded && (
                  <div className="p-4 sm:p-5 border-t border-slate-100 space-y-3 bg-white">
                    <div>
                      <h5 className="text-xs font-bold uppercase tracking-wider text-[#7C3AED] mb-1">
                        Answer Guidance (STAR Method)
                      </h5>
                      <p className="text-xs text-slate-700 leading-relaxed font-normal">
                        {item.answerGuidance}
                      </p>
                    </div>

                    {item.keyPoints?.length > 0 && (
                      <div className="pt-2 border-t border-slate-100">
                        <h6 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                          Points to Emphasize:
                        </h6>
                        <ul className="space-y-1.5 text-xs text-slate-600">
                          {item.keyPoints.map((pt, pIdx) => (
                            <li key={pIdx} className="flex items-start gap-2">
                              <CheckCircle2 className="w-3.5 h-3.5 text-purple-600 mt-0.5 flex-shrink-0" />
                              <span className="leading-relaxed">{pt}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ── Tab Content: HR & Behavioral Questions ── */}
      {activeTab === 'hr' && (
        <div className="space-y-4">
          {prepData.hrQuestions?.map((item, idx) => {
            const isExpanded = Boolean(expandedIndices.hr?.[idx]);
            return (
              <div
                key={idx}
                className="rounded-2xl border border-slate-200/90 overflow-hidden bg-white shadow-xs transition-all hover:border-slate-300"
              >
                <div
                  onClick={() => toggleExpand('hr', idx)}
                  className="p-4 sm:p-5 flex items-start justify-between gap-4 cursor-pointer select-none bg-slate-50/50 hover:bg-slate-100/40 transition-colors"
                >
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[11px] font-bold text-slate-400">HR Q{idx + 1}</span>
                      <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-slate-200 text-slate-800">
                        {item.category}
                      </span>
                    </div>
                    <h4 className="text-sm font-bold text-[#172033] leading-snug">{item.question}</h4>
                  </div>
                  <div className="p-1 rounded-lg text-slate-400 hover:text-slate-600 flex-shrink-0">
                    {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                  </div>
                </div>

                {isExpanded && (
                  <div className="p-4 sm:p-5 border-t border-slate-100 space-y-3 bg-white">
                    <div>
                      <h5 className="text-xs font-bold uppercase tracking-wider text-slate-800 mb-1">
                        Response Strategy & Fit
                      </h5>
                      <p className="text-xs text-slate-700 leading-relaxed font-normal">
                        {item.answerGuidance}
                      </p>
                    </div>

                    {item.keyPoints?.length > 0 && (
                      <div className="pt-2 border-t border-slate-100">
                        <h6 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                          Key Takeaways:
                        </h6>
                        <ul className="space-y-1.5 text-xs text-slate-600">
                          {item.keyPoints.map((pt, pIdx) => (
                            <li key={pIdx} className="flex items-start gap-2">
                              <CheckCircle2 className="w-3.5 h-3.5 text-slate-700 mt-0.5 flex-shrink-0" />
                              <span className="leading-relaxed">{pt}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ── Tab Content: Preparation Tips ── */}
      {activeTab === 'tips' && (
        <div className="p-6 rounded-2xl bg-amber-50/40 border border-amber-200/80 space-y-4">
          <div className="flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-amber-600" />
            <h4 className="text-sm font-bold text-amber-950">
              High-Impact Preparation Strategies for {companyName}
            </h4>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {prepData.preparationTips?.map((tip, idx) => (
              <div key={idx} className="p-3.5 rounded-xl bg-white border border-amber-200/60 shadow-xs flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-amber-100 text-amber-800 font-bold text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
                  {idx + 1}
                </span>
                <p className="text-xs text-slate-700 leading-relaxed font-normal">
                  {tip}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Mandatory Advisory Disclaimer ── */}
      <div className="pt-4 border-t border-slate-100 flex items-start gap-2.5 text-xs text-slate-500 bg-slate-50/60 p-4 rounded-2xl">
        <AlertCircle className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
        <p className="leading-relaxed">
          <strong>AI-generated preparation is advisory and may contain errors. Interview questions are not guaranteed to be asked and AI does not determine eligibility, hiring, or selection decisions.</strong>
        </p>
      </div>
    </div>
  );
};

export default AiInterviewPrepCard;
