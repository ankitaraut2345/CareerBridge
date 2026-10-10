import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  CheckCircle2,
  AlertCircle,
  FileText,
  RefreshCw,
  ArrowRight,
  Lightbulb,
  Tag,
  ShieldCheck,
  Check,
  Code,
  Target,
} from 'lucide-react';
import { analyzeResume, getResumeAnalysis } from '../../services/aiService';

/**
 * AiResumeAnalysisCard Component
 *
 * Integrated inside OpportunityDetailPage for authenticated students.
 * Provides on-demand, advisory resume-to-opportunity matching analysis.
 */
export const AiResumeAnalysisCard = ({ opportunityId, opportunityTitle, companyName }) => {
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [initialChecking, setInitialChecking] = useState(true);
  const [hasResume, setHasResume] = useState(true);
  const [error, setError] = useState(null);

  // Fetch initial cached analysis or resume status
  useEffect(() => {
    let isMounted = true;
    const fetchExisting = async () => {
      setInitialChecking(true);
      setError(null);
      try {
        const res = await getResumeAnalysis(opportunityId);
        if (isMounted && res && res.success) {
          if (res.data) {
            setAnalysis(res.data);
          }
          if (res.hasResume !== undefined) {
            setHasResume(res.hasResume);
          }
        }
      } catch (err) {
        console.warn('Could not load previous analysis:', err.message);
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

  const handleRunAnalysis = async (force = false) => {
    setLoading(true);
    setError(null);
    setCachedNotice(false);

    try {
      const res = await analyzeResume(opportunityId, force);
      if (res && res.success) {
        setAnalysis(res.data);
        if (res.cached) {
          setCachedNotice(true);
        }
      } else {
        setError(res?.message || 'We could not analyze your resume right now. Please try again later.');
      }
    } catch (err) {
      console.error('AI Resume Analysis error:', err);
      if (err.data?.code === 'NO_RESUME') {
        setHasResume(false);
        setError('Upload your resume from your profile before running AI analysis.');
      } else {
        setError(
          err.message || 'We could not analyze your resume right now. Please try again later.'
        );
      }
    } finally {
      setLoading(false);
    }
  };

  // Helper for match score styling and tier label
  const getScoreTier = (score) => {
    if (score >= 85) {
      return {
        label: 'Excellent Match',
        badgeBg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        progressBar: 'bg-gradient-to-r from-emerald-500 to-teal-500',
        textColor: 'text-emerald-700',
        ringColor: '#10B981',
      };
    }
    if (score >= 70) {
      return {
        label: 'Strong Match',
        badgeBg: 'bg-indigo-50 text-indigo-700 border-indigo-200',
        progressBar: 'bg-gradient-to-r from-[#4F46E5] to-[#7C3AED]',
        textColor: 'text-[#4F46E5]',
        ringColor: '#4F46E5',
      };
    }
    if (score >= 40) {
      return {
        label: 'Moderate Match',
        badgeBg: 'bg-amber-50 text-amber-700 border-amber-200',
        progressBar: 'bg-gradient-to-r from-amber-400 to-amber-500',
        textColor: 'text-amber-700',
        ringColor: '#F59E0B',
      };
    }
    return {
      label: 'Low Match',
      badgeBg: 'bg-slate-100 text-slate-700 border-slate-300',
      progressBar: 'bg-gradient-to-r from-slate-400 to-slate-500',
      textColor: 'text-slate-600',
      ringColor: '#94A3B8',
    };
  };

  // ── 1. Initial Checking Skeleton ──────────────────────────────────────
  if (initialChecking) {
    return (
      <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-7 shadow-sm">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-5 h-5 rounded bg-slate-200 animate-pulse" />
          <div className="h-4 w-40 bg-slate-200 rounded animate-pulse" />
        </div>
        <div className="h-14 bg-slate-100 rounded-2xl animate-pulse" />
      </div>
    );
  }

  // ── 2. Missing Resume State ───────────────────────────────────────────
  if (!hasResume) {
    return (
      <div className="bg-white rounded-3xl border border-amber-200/80 p-6 sm:p-7 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-amber-50/70 rounded-full blur-2xl pointer-events-none -mr-10 -mt-10" />
        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center flex-shrink-0">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800">
                  <Sparkles className="w-3 h-3" /> AI Resume Analysis
                </span>
              </div>
              <h3 className="text-base font-bold text-slate-900 mt-1">Upload your resume first</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-xl leading-relaxed">
                To use AI Resume Analysis, upload a PDF resume from your profile. We'll extract your skills and projects to evaluate alignment with {companyName}.
              </p>
            </div>
          </div>
          <Link
            to="/student"
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl font-bold text-xs bg-[#4F46E5] hover:bg-indigo-700 text-white transition-all shadow-sm hover:shadow flex items-center justify-center gap-2 flex-shrink-0"
          >
            Go to Profile
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    );
  }

  // ── 3. Active Loading / Scanning State ────────────────────────────────
  if (loading) {
    return (
      <div className="bg-white rounded-3xl border border-indigo-200 p-6 sm:p-8 shadow-sm text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-50/50 via-purple-50/30 to-sky-50/50 animate-pulse pointer-events-none" />
        <div className="relative z-10 max-w-md mx-auto py-4 space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-indigo-50 border border-indigo-200 text-[#4F46E5] flex items-center justify-center mx-auto shadow-inner relative">
            <Sparkles className="w-7 h-7 animate-spin" style={{ animationDuration: '3s' }} />
          </div>
          <div>
            <h3 className="text-base font-bold text-[#172033]">Analyzing your resume...</h3>
            <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
              Comparing your skills and experience with this opportunity.
            </p>
          </div>
          <div className="w-48 mx-auto bg-slate-100 rounded-full h-1.5 overflow-hidden">
            <div className="bg-gradient-to-r from-[#4F46E5] to-[#38BDF8] h-full w-2/3 rounded-full animate-pulse" />
          </div>
          <p className="text-[11px] text-slate-400">Extracting verified sections & requirements...</p>
        </div>
      </div>
    );
  }

  // ── 4. Empty State (Not Yet Analyzed) ──────────────────────────────────
  if (!analysis) {
    return (
      <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-7 shadow-sm transition-all hover:border-indigo-200">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-indigo-50 text-[#4F46E5] border border-indigo-100">
                <Sparkles className="w-3.5 h-3.5 text-[#4F46E5]" />
                AI Resume Analysis
              </span>
              <span className="text-xs font-medium text-slate-400">Campus Guidance Tool</span>
            </div>
            <h3 className="text-lg font-bold text-[#172033]">
              See how well your resume matches this opportunity
            </h3>
            <p className="text-xs text-slate-500 max-w-xl leading-relaxed">
              Compare your current resume against {companyName}'s required qualifications to discover strengths, identify missing skills, and get personalized tailoring suggestions.
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
              onClick={() => handleRunAnalysis(false)}
              className="w-full sm:w-auto px-6 py-3.5 rounded-2xl font-bold text-xs bg-gradient-to-r from-[#4F46E5] to-[#7C3AED] hover:from-indigo-600 hover:to-purple-700 text-white shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2.5 cursor-pointer active:scale-95"
            >
              <Sparkles className="w-4 h-4 text-[#38BDF8]" />
              Analyze My Resume
            </button>
          </div>
        </div>

        {/* Advisory Note */}
        <div className="mt-5 pt-4 border-t border-slate-100 flex items-center gap-2 text-[11px] text-slate-400">
          <ShieldCheck className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
          <span>
            AI analysis is advisory and does not affect your platform eligibility or application submission.
          </span>
        </div>
      </div>
    );
  }

  // ── 5. Full Result State ──────────────────────────────────────────────
  const tier = getScoreTier(analysis.matchScore);

  return (
    <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden space-y-6 p-6 sm:p-8">
      {/* ── Header Bar ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-100 text-[#4F46E5] flex items-center justify-center shadow-xs">
            <Sparkles className="w-5 h-5 text-[#4F46E5]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-[#172033]">AI Resume Analysis</h3>
              <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${tier.badgeBg}`}>
                {tier.label}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Target: <span className="font-semibold text-slate-600">{companyName}</span> • {opportunityTitle}
            </p>
          </div>
        </div>

        {/* Action: Re-analyze button */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleRunAnalysis(true)}
            disabled={loading}
            className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-indigo-600 bg-slate-50 hover:bg-indigo-50 border border-slate-200 transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            title="Re-run analysis against this opportunity"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Re-analyze
          </button>
        </div>
      </div>

      {/* ── Staleness Notice (if resume was updated since this analysis) ── */}
      {analysis.isStale && (
        <div className="p-4 rounded-2xl bg-amber-50/90 border border-amber-200/90 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-amber-900">
          <div className="flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0" />
            <span>
              <strong>Resume Updated:</strong> Your profile resume has been updated since this analysis was created.
            </span>
          </div>
          <button
            onClick={() => handleRunAnalysis(true)}
            className="font-bold text-amber-800 underline hover:text-amber-900 flex-shrink-0 text-left"
          >
            Re-analyze now →
          </button>
        </div>
      )}

      {/* ── Score & Summary Card ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center p-5 rounded-2xl bg-slate-50/70 border border-slate-100">
        {/* Score Column */}
        <div className="flex flex-col items-center justify-center text-center p-4 bg-white rounded-2xl border border-slate-200/70 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
            Resume Match Score
          </span>
          <div className="flex items-baseline gap-1">
            <span className={`text-4xl font-extrabold ${tier.textColor}`}>
              {analysis.matchScore}
            </span>
            <span className="text-sm font-semibold text-slate-400">/ 100</span>
          </div>
          <span className={`mt-2 px-3 py-0.5 rounded-full text-xs font-bold border ${tier.badgeBg}`}>
            {tier.label}
          </span>
          <div className="w-full bg-slate-100 h-2 rounded-full mt-3 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-700 ${tier.progressBar}`}
              style={{ width: `${analysis.matchScore}%` }}
            />
          </div>
        </div>

        {/* Summary Column */}
        <div className="md:col-span-2 space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Target className="w-3.5 h-3.5 text-[#4F46E5]" />
            Analysis Overview
          </span>
          <p className="text-sm text-slate-700 leading-relaxed font-normal">
            {analysis.summary}
          </p>
          <div className="flex items-center gap-3 text-[11px] text-slate-400 pt-1">
            <span>Source: {analysis.resumeOriginalName || 'Uploaded Resume'}</span>
            <span>•</span>
            <span>Analyzed {new Date(analysis.updatedAt || analysis.createdAt).toLocaleDateString()}</span>
          </div>
        </div>
      </div>

      {/* ── Skills Breakdown Grid ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {/* Matching Skills */}
        <div className="p-5 rounded-2xl bg-emerald-50/40 border border-emerald-100 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-800 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              Matching Skills ({analysis.matchingSkills?.length || 0})
            </h4>
            <span className="text-[10px] text-emerald-700 font-semibold">Evidenced in Resume</span>
          </div>
          {analysis.matchingSkills?.length === 0 ? (
            <p className="text-xs text-slate-500 italic">No exact skill matches identified yet.</p>
          ) : (
            <div className="flex flex-wrap gap-1.5">
              {analysis.matchingSkills.map((skill, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-white border border-emerald-200 text-emerald-800 shadow-xs"
                >
                  <Check className="w-3 h-3 text-emerald-600" />
                  {skill}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Missing Skills / Skills to Consider */}
        <div className="p-5 rounded-2xl bg-amber-50/40 border border-amber-100 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase tracking-wider text-amber-800 flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4 text-amber-600" />
              Skills to Consider ({analysis.missingSkills?.length || 0})
            </h4>
            <span className="text-[10px] text-amber-700 font-semibold">Mentioned in Drive</span>
          </div>
          {analysis.missingSkills?.length === 0 ? (
            <p className="text-xs text-slate-500 italic">Great coverage! No notable skill gaps found.</p>
          ) : (
            <div className="flex flex-wrap gap-1.5">
              {analysis.missingSkills.map((skill, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-white border border-amber-200 text-amber-900 shadow-xs"
                >
                  <span className="text-amber-500 font-bold">•</span>
                  {skill}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Strengths & Suggestions ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {/* Your Strengths */}
        {analysis.strengths?.length > 0 && (
          <div className="p-5 rounded-2xl bg-white border border-slate-200/80 space-y-3 shadow-xs">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-[#4F46E5]" />
              Your Strengths
            </h4>
            <ul className="space-y-2 text-xs text-slate-600">
              {analysis.strengths.map((str, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#4F46E5] mt-1.5 flex-shrink-0" />
                  <span className="leading-relaxed">{str}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Improve Your Resume */}
        {analysis.improvementSuggestions?.length > 0 && (
          <div className="p-5 rounded-2xl bg-white border border-slate-200/80 space-y-3 shadow-xs">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <Lightbulb className="w-4 h-4 text-amber-500" />
              Improve Your Resume
            </h4>
            <ul className="space-y-2 text-xs text-slate-600">
              {analysis.improvementSuggestions.map((sug, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 flex-shrink-0" />
                  <span className="leading-relaxed">{sug}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* ── Keywords & Project Recommendations ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {/* High-Impact Keyword Suggestions */}
        {analysis.keywordSuggestions?.length > 0 && (
          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100 space-y-2.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-indigo-500" />
              Keyword Suggestions to Incorporate
            </h4>
            <p className="text-[11px] text-slate-500">
              Consider integrating these keywords into your project descriptions where relevant:
            </p>
            <div className="flex flex-wrap gap-1.5 pt-1">
              {analysis.keywordSuggestions.map((kw, idx) => (
                <span
                  key={idx}
                  className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-white text-slate-700 border border-slate-200 shadow-xs"
                >
                  #{kw}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Project Suggestions */}
        {analysis.projectSuggestions?.length > 0 && (
          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100 space-y-2.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <Code className="w-3.5 h-3.5 text-[#7C3AED]" />
              Project Gap Recommendations
            </h4>
            <p className="text-[11px] text-slate-500">
              Demonstrate hands-on competence to bridge identified skill requirements:
            </p>
            <ul className="space-y-1.5 text-xs text-slate-600 pt-1">
              {analysis.projectSuggestions.map((proj, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-purple-500 font-bold">→</span>
                  <span className="leading-relaxed">{proj}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* ── Mandatory AI Disclaimer ── */}
      <div className="pt-4 border-t border-slate-100 flex items-start gap-2.5 text-xs text-slate-500 bg-slate-50/60 p-4 rounded-2xl">
        <AlertCircle className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
        <p className="leading-relaxed">
          <strong>Advisory Notice:</strong> AI-generated insights are suggestions for improving your resume and should not be treated as a hiring or eligibility decision. Platform application eligibility is evaluated strictly against college criteria.
        </p>
      </div>
    </div>
  );
};

export default AiResumeAnalysisCard;
