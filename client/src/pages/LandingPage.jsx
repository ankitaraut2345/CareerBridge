import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Button from '../components/Button';
import Card from '../components/Card';
import SectionHeading from '../components/SectionHeading';
import { checkHealth } from '../services/api';
import {
  Briefcase,
  Users,
  Compass,
  FileCheck2,
  Sparkles,
  ArrowRight,
  Building2,
  CheckCircle2,
  Clock,
  TrendingUp,
  Award,
  ShieldCheck,
  ChevronRight,
  Server,
  Zap,
} from 'lucide-react';

export const LandingPage = () => {
  // Live backend API health check verification state
  const [apiStatus, setApiStatus] = useState({
    checked: false,
    online: false,
    message: 'Checking CareerBridge API status...',
  });

  useEffect(() => {
    let isMounted = true;
    const verifyApi = async () => {
      try {
        const data = await checkHealth();
        if (isMounted) {
          setApiStatus({
            checked: true,
            online: true,
            message: data?.message || 'CareerBridge API is running',
          });
        }
      } catch (err) {
        if (isMounted) {
          setApiStatus({
            checked: true,
            online: false,
            message: err.message || 'API currently offline',
          });
        }
      }
    };
    verifyApi();
    return () => {
      isMounted = false;
    };
  }, []);

  // Feature previews as defined in requirements
  const features = [
    {
      title: 'Placement & Internship Opportunities',
      description:
        'Unified portal for full-time campus placements and seasonal internships with dynamic eligibility filtering and 1-click applications.',
      icon: Briefcase,
      badge: 'Core Workflow',
      badgeColor: 'bg-indigo-50 text-[#4F46E5] border-indigo-100',
      link: '/student',
    },
    {
      title: 'Alumni Mentorship',
      description:
        'Connect directly with alumni in your target companies and roles for one-to-one guidance, career roadmaps, and mock interviews.',
      icon: Compass,
      badge: 'Guidance',
      badgeColor: 'bg-purple-50 text-[#7C3AED] border-purple-100',
      link: '/alumni',
    },
    {
      title: 'Professional Referrals',
      description:
        'Request verified referrals from trusted alumni inside leading engineering and product organizations to stand out.',
      icon: Users,
      badge: 'Networking',
      badgeColor: 'bg-sky-50 text-[#0284C7] border-sky-100',
      link: '/alumni',
    },
    {
      title: 'Application Tracking',
      description:
        'Single-view transparent pipeline: track resume screening, test results, interview schedules, and offer letters in real time.',
      icon: FileCheck2,
      badge: 'Transparency',
      badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-100',
      link: '/student',
    },
    {
      title: 'AI Career Preparation',
      description:
        'Tailor your resume to specific opportunities with targeted ATS scoring and simulate role-specific technical interview rounds.',
      icon: Sparkles,
      badge: 'Intelligence',
      badgeColor: 'bg-violet-50 text-[#7C3AED] border-violet-100',
      link: '/student',
    },
  ];

  // 4 Stakeholder ecosystem pillars
  const stakeholders = [
    {
      role: 'Students',
      description:
        'Explore verified jobs, track stage-by-stage applications, and learn directly from seniors who walked the path.',
      tag: 'Explore Drives',
      href: '/student',
      borderAccent: 'border-l-[#4F46E5]',
    },
    {
      role: 'Alumni',
      description:
        'Give back to your alma mater by offering mentorship, sharing domain advice, and referring high-potential candidates.',
      tag: 'Mentor Students',
      href: '/alumni',
      borderAccent: 'border-l-[#7C3AED]',
    },
    {
      role: 'TPOs & Placement Officers',
      description:
        'Coordinate campus recruitment drives, enforce criteria automatically, and monitor department-wise analytics.',
      tag: 'Manage Drives',
      href: '/tpo',
      borderAccent: 'border-l-[#38BDF8]',
    },
    {
      role: 'Administrators',
      description:
        'Govern institutional identity, verify alumni credentials, manage permissions, and maintain data security.',
      tag: 'Admin Console',
      href: '/admin',
      borderAccent: 'border-l-slate-800',
    },
  ];

  return (
    <div className="space-y-20 lg:space-y-28 pb-20">
      {/* HERO SECTION */}
      <section className="relative pt-12 pb-16 lg:pt-20 lg:pb-24 overflow-hidden">
        {/* Subtle background glow elements */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 pointer-events-none -z-10">
          <div className="absolute top-10 left-1/4 w-80 h-80 bg-[#4F46E5]/10 rounded-full blur-3xl"></div>
          <div className="absolute top-16 right-1/4 w-80 h-80 bg-[#7C3AED]/10 rounded-full blur-3xl"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            {/* Ecosystem Tagline Pill */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-medium bg-[#EEF2FF] text-[#4F46E5] border border-[#C7D2FE] mb-6">
              <span className="w-2 h-2 rounded-full bg-[#38BDF8]"></span>
              Campus Career &amp; Mentorship Ecosystem
            </div>

            {/* Locked Primary Tagline Heading */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-[#172033] tracking-tight leading-[1.12]">
              Where Talent Meets{' '}
              <span className="text-[#4F46E5]">Opportunity</span> &amp; the{' '}
              <span className="text-[#7C3AED]">Right Guidance</span>
            </h1>

            {/* Description */}
            <p className="mt-6 text-lg sm:text-xl text-slate-600 max-w-3xl mx-auto font-normal leading-relaxed">
              CareerBridge connects <span className="font-semibold text-[#172033]">Students</span>,{' '}
              <span className="font-semibold text-[#172033]">Alumni</span>,{' '}
              <span className="font-semibold text-[#172033]">TPOs</span>, and{' '}
              <span className="font-semibold text-[#172033]">Admins</span> for placements,
              internships, mentorship, referrals, and AI-assisted career preparation.
            </p>

            {/* Call to Actions */}
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button
                to="/student"
                variant="primary"
                size="lg"
                icon={Briefcase}
                className="w-full sm:w-auto shadow-md hover:shadow-lg"
              >
                Explore Opportunities
              </Button>
              <Button
                to="/alumni"
                variant="outline"
                size="lg"
                icon={Users}
                className="w-full sm:w-auto"
              >
                Connect with Alumni
              </Button>
            </div>

            {/* API Health Connection Badge */}
            <div className="mt-8 inline-flex items-center gap-2 text-xs text-slate-500 bg-white border border-slate-200 px-3 py-1.5 rounded-lg shadow-sm">
              <Server className="w-3.5 h-3.5 text-slate-400" />
              <span>Backend API Status:</span>
              {apiStatus.checked ? (
                apiStatus.online ? (
                  <span className="inline-flex items-center gap-1 font-semibold text-emerald-600">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                    Online (Connected to server)
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 font-semibold text-amber-600">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                    Offline ({apiStatus.message})
                  </span>
                )
              ) : (
                <span className="text-slate-400">Pinging /api/health...</span>
              )}
            </div>
          </div>

          {/* VISUAL DASHBOARD PREVIEW AREA */}
          <div className="mt-14 max-w-5xl mx-auto">
            <div className="rounded-2xl border border-slate-200/90 bg-white shadow-xl overflow-hidden">
              {/* Mock Browser Header */}
              <div className="bg-slate-50 border-b border-slate-200/80 px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-400/80"></div>
                  <div className="w-3 h-3 rounded-full bg-amber-400/80"></div>
                  <div className="w-3 h-3 rounded-full bg-emerald-400/80"></div>
                  <span className="ml-2 text-xs font-mono text-slate-400 hidden sm:inline">
                    careerbridge.campus/dashboard/preview
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <span className="inline-block w-2 h-2 rounded-full bg-[#38BDF8]"></span>
                  Unified Pipeline
                </div>
              </div>

              {/* Mock SaaS Dashboard Content */}
              <div className="p-4 sm:p-6 lg:p-8 bg-[#F8FAFC]/50 space-y-6">
                {/* Metric Summary row */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                  <div className="bg-white p-4 rounded-lg border border-slate-200/80 shadow-xs">
                    <span className="text-xs text-slate-500 font-medium">Active Opportunities</span>
                    <p className="text-xl sm:text-2xl font-bold text-[#172033] mt-1">42</p>
                    <span className="text-[11px] text-emerald-600 font-medium flex items-center gap-0.5 mt-0.5">
                      <TrendingUp className="w-3 h-3" /> 8 drives this week
                    </span>
                  </div>

                  <div className="bg-white p-4 rounded-lg border border-slate-200/80 shadow-xs">
                    <span className="text-xs text-slate-500 font-medium">Applications In Flight</span>
                    <p className="text-xl sm:text-2xl font-bold text-[#172033] mt-1">6</p>
                    <span className="text-[11px] text-[#4F46E5] font-medium flex items-center gap-0.5 mt-0.5">
                      <Clock className="w-3 h-3" /> 2 interviews scheduled
                    </span>
                  </div>

                  <div className="bg-white p-4 rounded-lg border border-slate-200/80 shadow-xs">
                    <span className="text-xs text-slate-500 font-medium">Alumni Mentors</span>
                    <p className="text-xl sm:text-2xl font-bold text-[#172033] mt-1">180+</p>
                    <span className="text-[11px] text-[#7C3AED] font-medium flex items-center gap-0.5 mt-0.5">
                      <Award className="w-3 h-3" /> Verified across 45 orgs
                    </span>
                  </div>

                  <div className="bg-white p-4 rounded-lg border border-slate-200/80 shadow-xs">
                    <span className="text-xs text-slate-500 font-medium">AI Readiness</span>
                    <p className="text-xl sm:text-2xl font-bold text-[#172033] mt-1">94%</p>
                    <span className="text-[11px] text-[#0284C7] font-medium flex items-center gap-0.5 mt-0.5">
                      <Sparkles className="w-3 h-3" /> ATS Target Met
                    </span>
                  </div>
                </div>

                {/* Split preview layout */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                  {/* Left: Live Opportunity Card */}
                  <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs space-y-4">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-[#EEF2FF] text-[#4F46E5] font-bold flex items-center justify-center text-sm border border-indigo-100">
                          CB
                        </div>
                        <div>
                          <h4 className="font-semibold text-sm sm:text-base text-[#172033]">
                            Associate Software Engineer — Campus Drive 2026
                          </h4>
                          <p className="text-xs text-slate-500">CloudMatrix Tech • Placement (Full Time)</p>
                        </div>
                      </div>
                      <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        Eligible
                      </span>
                    </div>

                    {/* Progress tracking preview */}
                    <div>
                      <span className="text-xs font-medium text-slate-500 mb-2 block">
                        Live Application Progress
                      </span>
                      <div className="grid grid-cols-4 gap-2 text-center text-[11px]">
                        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 py-1.5 rounded font-medium flex items-center justify-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Applied
                        </div>
                        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 py-1.5 rounded font-medium flex items-center justify-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Shortlisted
                        </div>
                        <div className="bg-indigo-50 border border-indigo-300 text-[#4F46E5] py-1.5 rounded font-bold flex items-center justify-center gap-1">
                          <Clock className="w-3 h-3 text-[#4F46E5] animate-pulse" /> Interview
                        </div>
                        <div className="bg-slate-50 border border-slate-200 text-slate-400 py-1.5 rounded font-medium">
                          Offer
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 text-xs text-slate-500">
                      <span>CTC: 14.5 LPA • Location: Bangalore / Remote</span>
                      <span className="text-[#4F46E5] font-medium flex items-center gap-1">
                        Interview: Oct 8, 2026 <ChevronRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>

                  {/* Right: Alumni Mentor & Referral Snippet */}
                  <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-bold uppercase tracking-wider text-[#7C3AED]">
                          Alumni Connection
                        </span>
                        <span className="text-[10px] bg-purple-50 text-[#7C3AED] px-2 py-0.5 rounded font-semibold border border-purple-100">
                          Class of '22
                        </span>
                      </div>

                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#4F46E5] to-[#7C3AED] text-white flex items-center justify-center font-bold text-sm">
                          AK
                        </div>
                        <div>
                          <p className="text-sm font-bold text-[#172033]">Aarav Kapoor</p>
                          <p className="text-xs text-slate-500">Senior Engineer @ Atlassian</p>
                        </div>
                      </div>

                      <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-100 italic leading-relaxed">
                        "Available for technical mock interviews and backend referrals for the upcoming season."
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                      <span className="text-emerald-600 font-medium">● 3 Referral Slots Open</span>
                      <Link to="/alumni" className="text-[#7C3AED] font-semibold hover:underline">
                        Message →
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURE PREVIEW SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeading
          badge="Platform Architecture"
          title="Everything You Need in One Unified Career Engine"
          subtitle="Engineered for institutions, students, recruiters, and alumni — replacing disconnected spreadsheets and legacy ERPs."
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((item, idx) => {
            const Icon = item.icon;
            return (
              <Card
                key={idx}
                hoverEffect={true}
                className="flex flex-col justify-between"
                padding="lg"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 rounded-xl bg-slate-50 text-[#4F46E5] flex items-center justify-center border border-slate-200">
                      <Icon className="w-6 h-6" />
                    </div>
                    <span
                      className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${item.badgeColor}`}
                    >
                      {item.badge}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-[#172033] mb-2">{item.title}</h3>
                  <p className="text-sm text-slate-600 leading-relaxed">{item.description}</p>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100">
                  <Link
                    to={item.link}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#4F46E5] hover:text-[#4338CA] transition-colors"
                  >
                    View module details <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </Card>
            );
          })}

          {/* Locked Architecture Rules Reminder Card */}
          <Card
            className="flex flex-col justify-between bg-gradient-to-br from-[#172033] to-[#0F172A] text-white border-0"
            padding="lg"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-white/10 text-[#38BDF8] flex items-center justify-center border border-white/10">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[#38BDF8]/20 text-[#38BDF8] border border-[#38BDF8]/30">
                  Architecture
                </span>
              </div>

              <h3 className="text-lg font-bold text-white mb-2">Clean Locked Data Design</h3>
              <p className="text-sm text-slate-300 leading-relaxed">
                Consolidated Opportunity model (Placement + Internship), unified single Application
                workflow, in-app notifications, and deterministic skill-based alumni matching.
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-white/10 text-xs text-slate-400">
              <span>Production Standards • MERN Architecture</span>
            </div>
          </Card>
        </div>
      </section>

      {/* STAKEHOLDERS SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeading
          badge="Stakeholder Ecosystem"
          title="Designed for Every Campus Role"
          subtitle="A harmonious workflow uniting students, alumni mentors, placement officers, and institutional leaders."
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {stakeholders.map((item, idx) => (
            <Card
              key={idx}
              hoverEffect={true}
              className={`border-l-4 ${item.borderAccent} flex flex-col justify-between`}
            >
              <div>
                <h3 className="text-lg font-bold text-[#172033] mb-2">{item.role}</h3>
                <p className="text-sm text-slate-600 leading-relaxed">{item.description}</p>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100">
                <Link
                  to={item.href}
                  className="text-xs font-semibold text-[#4F46E5] hover:text-[#4338CA] flex items-center justify-between"
                >
                  <span>{item.tag}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* BOTTOM CTA BANNER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-2xl bg-gradient-to-r from-[#4F46E5] to-[#7C3AED] px-6 py-12 sm:px-12 sm:py-16 text-center text-white shadow-lg overflow-hidden">
          {/* Subtle geometric pattern accent */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>

          <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-white/20 text-white mb-4">
            Unified Campus Career Ecosystem
          </span>

          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight max-w-2xl mx-auto">
            Ready to Build the Future of Campus Placements?
          </h2>

          <p className="mt-4 text-base sm:text-lg text-indigo-100 max-w-xl mx-auto">
            CareerBridge is poised to streamline institutional recruitment, alumni engagement, and
            career acceleration.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              to="/register"
              variant="white"
              size="lg"
              icon={ArrowRight}
              iconPosition="right"
              className="w-full sm:w-auto font-bold"
            >
              Get Started Now
            </Button>
            <Button
              to="/student"
              variant="ghost"
              size="lg"
              className="w-full sm:w-auto text-white hover:bg-white/10 hover:text-white"
            >
              Browse Roles
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
