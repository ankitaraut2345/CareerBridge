import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Code2,
  BarChart3,
  Briefcase,
  Palette,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Circle,
  FileText,
  ChevronRight,
  ExternalLink,
  BookOpen,
  Trophy,
  Sparkles,
  ArrowRight,
  RefreshCw,
  PlayCircle,
  FolderGit2,
  Award,
  Compass,
  Lightbulb,
  X,
} from 'lucide-react';

const TRACKS = [
  {
    id: 'software',
    title: 'Software Development',
    subtitle: 'Web, Mobile & Full Stack',
    icon: Code2,
    accent: '#4F46E5',
    stages: [
      {
        id: 1,
        title: 'Learn the Basics',
        description: 'Understand the fundamentals of programming, computer science concepts, and problem solving.',
        skills: ['Programming Basics', 'Data Structures', 'Problem Solving'],
        resourcesCount: 18,
        status: 'Completed',
        resources: [
          { title: 'CS50: Introduction to Computer Science', type: 'Course', duration: '12 hrs', link: 'https://cs50.harvard.edu' },
          { title: 'Data Structures & Algorithms in JS/Python', type: 'Video Series', duration: '8 hrs', link: '#' },
          { title: 'Clean Code Principles & Git Basics', type: 'Guide', duration: '2 hrs', link: '#' },
        ],
      },
      {
        id: 2,
        title: 'Frontend Development',
        description: 'Learn HTML, CSS, JavaScript and modern frontend frameworks.',
        skills: ['HTML', 'CSS', 'JavaScript', 'React.js', 'Tailwind CSS'],
        resourcesCount: 24,
        status: 'In Progress',
        resources: [
          { title: 'Modern JavaScript (ES6+) Complete Guide', type: 'Course', duration: '10 hrs', link: '#' },
          { title: 'React 18 & State Management Deep Dive', type: 'Documentation', duration: '6 hrs', link: '#' },
          { title: 'Responsive UI Design with Tailwind CSS', type: 'Interactive Lab', duration: '4 hrs', link: '#' },
        ],
      },
      {
        id: 3,
        title: 'Backend Development',
        description: 'Learn server-side development, databases and APIs.',
        skills: ['Node.js', 'Express.js', 'MongoDB', 'SQL', 'REST APIs'],
        resourcesCount: 22,
        status: 'Not Started',
        resources: [
          { title: 'Node.js & Express Architecture Masterclass', type: 'Course', duration: '9 hrs', link: '#' },
          { title: 'Database Design: SQL vs NoSQL Essentials', type: 'Article', duration: '3 hrs', link: '#' },
          { title: 'JWT Authentication & Role-Based Access Control', type: 'Code Walkthrough', duration: '4 hrs', link: '#' },
        ],
      },
      {
        id: 4,
        title: 'Projects & Portfolio',
        description: 'Build real-world projects to showcase your skills.',
        skills: ['Full Stack Projects', 'Git & GitHub', 'Deployment', 'Portfolio'],
        resourcesCount: 15,
        status: 'Not Started',
        resources: [
          { title: 'Build a Production MERN E-Commerce Platform', type: 'Hands-on Project', duration: '14 hrs', link: '#' },
          { title: 'CI/CD Pipelines & Cloud Hosting with Docker/Vercel', type: 'Tutorial', duration: '5 hrs', link: '#' },
          { title: 'Showcase-Worthy Developer Portfolio Blueprint', type: 'Template', duration: '3 hrs', link: '#' },
        ],
      },
      {
        id: 5,
        title: 'Interview Preparation',
        description: 'Practice coding, system design and behavioral questions.',
        skills: ['DSA', 'System Design', 'Mock Interviews', 'Aptitude'],
        resourcesCount: 28,
        status: 'Not Started',
        resources: [
          { title: 'Top 75 LeetCode Coding Patterns', type: 'Practice Set', duration: '20 hrs', link: '#' },
          { title: 'System Design for College Placements', type: 'Video Series', duration: '8 hrs', link: '#' },
          { title: 'STAR Method for HR Behavioral Rounds', type: 'Interview Prep', duration: '3 hrs', link: '#' },
        ],
      },
      {
        id: 6,
        title: 'Get Placed',
        description: 'Apply for internships and full-time opportunities.',
        skills: ['Resume Building', 'LinkedIn Profile', 'Interview Tips', 'Job Search'],
        resourcesCount: 12,
        status: 'Not Started',
        resources: [
          { title: 'ATS-Friendly Tech Resume Formats & Tips', type: 'Downloadable Kit', duration: '2 hrs', link: '#' },
          { title: 'Alumni Referral Outreach Scripts', type: 'Templates', duration: '1 hr', link: '#' },
          { title: 'Campus Drive Negotiation & Offer Evaluation', type: 'Guide', duration: '2 hrs', link: '#' },
        ],
      },
    ],
  },
  {
    id: 'datascience',
    title: 'Data Science',
    subtitle: 'Analytics & AI',
    icon: BarChart3,
    accent: '#0284C7',
    stages: [
      {
        id: 1,
        title: 'Python & Mathematics',
        description: 'Linear Algebra, Probability, Statistics, and Python programming.',
        skills: ['Python', 'NumPy', 'Pandas', 'Statistics'],
        resourcesCount: 20,
        status: 'In Progress',
        resources: [{ title: 'Statistical Thinking for Data Analysis', type: 'Course', duration: '8 hrs' }],
      },
      {
        id: 2,
        title: 'Exploratory Data Analysis',
        description: 'Data cleaning, feature engineering, and visualization techniques.',
        skills: ['Matplotlib', 'Seaborn', 'SQL', 'Data Wrangling'],
        resourcesCount: 16,
        status: 'Not Started',
        resources: [{ title: 'Hands-on Data Storytelling', type: 'Lab', duration: '5 hrs' }],
      },
      {
        id: 3,
        title: 'Machine Learning Fundamentals',
        description: 'Supervised and unsupervised learning with scikit-learn.',
        skills: ['Scikit-Learn', 'Regression', 'Classification', 'Clustering'],
        resourcesCount: 24,
        status: 'Not Started',
        resources: [{ title: 'Applied Machine Learning', type: 'Course', duration: '15 hrs' }],
      },
    ],
  },
  {
    id: 'pm',
    title: 'Product Management',
    subtitle: 'Strategy & Product',
    icon: Briefcase,
    accent: '#10B981',
    stages: [
      {
        id: 1,
        title: 'Product Thinking & User Empathy',
        description: 'User interviews, problem framing, and PRD writing.',
        skills: ['PRD Writing', 'Customer Discovery', 'UX Wireframing'],
        resourcesCount: 14,
        status: 'Not Started',
        resources: [{ title: 'Product Sense Fundamentals', type: 'Guide', duration: '4 hrs' }],
      },
    ],
  },
  {
    id: 'design',
    title: 'UI/UX Design',
    subtitle: 'Design & Creativity',
    icon: Palette,
    accent: '#EC4899',
    stages: [
      {
        id: 1,
        title: 'Design Systems & Figma',
        description: 'Visual hierarchy, typography, color theory, and prototyping in Figma.',
        skills: ['Figma', 'Typography', 'Color Systems', 'Wireframing'],
        resourcesCount: 18,
        status: 'Not Started',
        resources: [{ title: 'Figma Mastery from Scratch', type: 'Video Series', duration: '10 hrs' }],
      },
    ],
  },
  {
    id: 'cyber',
    title: 'Cyber Security',
    subtitle: 'Security & Networks',
    icon: ShieldCheck,
    accent: '#0EA5E9',
    stages: [
      {
        id: 1,
        title: 'Networking & OS Security',
        description: 'TCP/IP protocols, Linux administration, and network packet analysis.',
        skills: ['Linux', 'Wireshark', 'TCP/IP', 'OWASP Top 10'],
        resourcesCount: 22,
        status: 'Not Started',
        resources: [{ title: 'Cybersecurity Fundamentals', type: 'Lab', duration: '12 hrs' }],
      },
    ],
  },
];

export const CareerRoadmapPage = () => {
  const [selectedTrackId, setSelectedTrackId] = useState('software');
  const [activeStageDetail, setActiveStageDetail] = useState(null);

  // Manage stage status toggles
  const [stageStatuses, setStageStatuses] = useState({
    1: 'Completed',
    2: 'In Progress',
    3: 'Not Started',
    4: 'Not Started',
    5: 'Not Started',
    6: 'Not Started',
  });

  const currentTrack = TRACKS.find((t) => t.id === selectedTrackId) || TRACKS[0];

  const handleToggleStageStatus = (stageId) => {
    setStageStatuses((prev) => {
      const current = prev[stageId] || 'Not Started';
      const next =
        current === 'Not Started'
          ? 'In Progress'
          : current === 'In Progress'
          ? 'Completed'
          : 'Not Started';
      return { ...prev, [stageId]: next };
    });
  };

  // Calculate dynamic progress
  const completedStagesCount = Object.values(stageStatuses).filter(
    (s) => s === 'Completed'
  ).length;
  const totalStages = currentTrack.stages.length;
  const progressPercentage = Math.round((completedStagesCount / totalStages) * 100);

  return (
    <div className="space-y-7 pb-10">
      {/* 1. SaaS Hero Banner matching Image 1 */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-50/90 via-indigo-50/80 to-purple-50/90 border border-slate-200/80 p-6 sm:p-8 lg:p-9 shadow-xs">
        {/* Soft background decor */}
        <div className="absolute -top-16 -right-16 w-64 h-64 bg-purple-200/40 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-64 h-64 bg-sky-200/40 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="max-w-2xl">
            <h1 className="text-2xl sm:text-3xl lg:text-[34px] font-extrabold text-[#172033] tracking-tight leading-tight mb-2">
              Career Roadmap
            </h1>
            <p className="text-sm sm:text-base text-slate-600 font-normal leading-relaxed">
              Plan your career, build the right skills, and track your progress towards your goals.
            </p>
          </div>

          {/* Decorative Visual Badge from Image 1 ("Small Steps Big Careers" banner) */}
          <div className="hidden md:flex items-center gap-3 bg-white/80 backdrop-blur-xs px-5 py-3 rounded-2xl border border-indigo-100 shadow-xs">
            <div className="flex flex-col items-center">
              <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-500">
                Milestone Path
              </span>
              <div className="flex items-center gap-1.5 mt-1 text-xs font-semibold text-[#172033]">
                <span className="px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-600">Learn</span>
                <span>→</span>
                <span className="px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-600">Practice</span>
                <span>→</span>
                <span className="px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-600">Build</span>
                <span>→</span>
                <span className="px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-600">Grow</span>
              </div>
            </div>
            <div className="h-8 w-px bg-slate-200" />
            <div className="text-right">
              <span className="block text-xs font-bold text-slate-400 italic">Small Steps</span>
              <span className="block text-sm font-extrabold text-[#4F46E5] italic">
                Big Careers
              </span>
            </div>
          </div>
        </div>

        {/* 5 Career Domain Cards / Tabs matching Image 1 */}
        <div className="relative z-10 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mt-7 pt-6 border-t border-indigo-100/70">
          {TRACKS.map((track) => {
            const Icon = track.icon;
            const isSelected = selectedTrackId === track.id;
            return (
              <button
                key={track.id}
                type="button"
                onClick={() => setSelectedTrackId(track.id)}
                className={`flex items-center gap-3 p-3.5 rounded-2xl text-left transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-white shadow-md border-2 border-[#4F46E5] scale-[1.02]'
                    : 'bg-white/60 border border-slate-200/70 hover:bg-white hover:border-slate-300'
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors ${
                    isSelected
                      ? 'bg-[#4F46E5] text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div
                    className={`text-xs sm:text-sm font-bold truncate ${
                      isSelected ? 'text-[#172033]' : 'text-slate-700'
                    }`}
                  >
                    {track.title}
                  </div>
                  <div className="text-[11px] text-slate-500 truncate">{track.subtitle}</div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Main 2-Column Content: Left Roadmap Timeline, Right Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-7 items-start">
        {/* Left Column (2 Cols): Timeline Track */}
        <div className="lg:col-span-2 space-y-6">
          {/* Section Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
            <div>
              <h2 className="text-lg sm:text-xl font-extrabold text-[#172033]">
                {currentTrack.title} Roadmap
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                A step-by-step guide to become a successful {currentTrack.title.toLowerCase()} professional.
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                const nextIdx = (TRACKS.findIndex((t) => t.id === selectedTrackId) + 1) % TRACKS.length;
                setSelectedTrackId(TRACKS[nextIdx].id);
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 hover:border-indigo-300 text-xs font-semibold text-slate-700 hover:text-[#4F46E5] bg-slate-50 hover:bg-indigo-50/50 transition-colors cursor-pointer self-start sm:self-auto"
            >
              <RefreshCw className="w-3.5 h-3.5 text-indigo-600" />
              <span>Change Path</span>
            </button>
          </div>

          {/* Timeline Stages List */}
          <div className="relative pl-6 sm:pl-8 space-y-5 before:absolute before:left-3 sm:before:left-4 before:top-4 before:bottom-4 before:w-0.5 before:bg-indigo-100">
            {currentTrack.stages.map((stage, idx) => {
              const status = stageStatuses[stage.id] || stage.status || 'Not Started';
              const isCompleted = status === 'Completed';
              const isInProgress = status === 'In Progress';

              return (
                <div key={stage.id} className="relative group">
                  {/* Timeline Node Badge */}
                  <div
                    className={`absolute -left-6 sm:-left-8 top-5 w-6 sm:w-8 h-6 sm:h-8 rounded-full flex items-center justify-center text-xs font-extrabold transition-transform group-hover:scale-110 shadow-xs ${
                      isCompleted
                        ? 'bg-emerald-600 text-white ring-4 ring-emerald-50'
                        : isInProgress
                        ? 'bg-[#4F46E5] text-white ring-4 ring-indigo-50'
                        : 'bg-white border-2 border-slate-300 text-slate-500'
                    }`}
                  >
                    {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : stage.id}
                  </div>

                  {/* Stage Card */}
                  <div className="p-5 sm:p-6 rounded-2xl bg-white border border-slate-200/80 hover:border-indigo-200/80 shadow-xs hover:shadow-md transition-all">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2.5 flex-wrap">
                          <h3 className="text-base sm:text-lg font-bold text-[#172033]">
                            {stage.title}
                          </h3>
                          {/* Status Badge */}
                          <button
                            type="button"
                            onClick={() => handleToggleStageStatus(stage.id)}
                            title="Click to toggle progress status"
                            className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold transition-transform active:scale-95 cursor-pointer ${
                              isCompleted
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                                : isInProgress
                                ? 'bg-sky-50 text-[#0284C7] border border-sky-200 hover:bg-sky-100'
                                : 'bg-slate-100 text-slate-600 border border-slate-200 hover:bg-slate-200'
                            }`}
                          >
                            {isCompleted && <CheckCircle2 className="w-3 h-3 text-emerald-600" />}
                            {isInProgress && <Clock className="w-3 h-3 text-[#0284C7]" />}
                            {!isCompleted && !isInProgress && (
                              <Circle className="w-3 h-3 text-slate-400" />
                            )}
                            <span>{status}</span>
                          </button>
                        </div>

                        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-xl">
                          {stage.description}
                        </p>
                      </div>

                      {/* Resource Count & Action Button */}
                      <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-3 flex-shrink-0">
                        <div className="inline-flex items-center gap-1.5 text-xs text-slate-500">
                          <FileText className="w-3.5 h-3.5 text-slate-400" />
                          <span>{stage.resourcesCount} resources</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setActiveStageDetail(stage)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-indigo-200 text-xs font-bold text-[#4F46E5] hover:bg-indigo-50 transition-colors cursor-pointer"
                        >
                          <span>View Details</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Skill Tags */}
                    {stage.skills && stage.skills.length > 0 && (
                      <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap gap-2">
                        {stage.skills.map((skill, sIdx) => (
                          <span
                            key={sIdx}
                            className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-50 text-slate-700 border border-slate-200/70"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column (1 Col): Sidebar Widgets matching Image 1 */}
        <div className="space-y-6">
          {/* Widget 1: Your Progress */}
          <div className="p-5 sm:p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-[#172033] flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-[#4F46E5]" />
                <span>Your Progress</span>
              </h3>
              <span className="text-xs font-semibold text-slate-500">
                {completedStagesCount} of {totalStages} completed
              </span>
            </div>

            {/* Circular / Radial Gauge representation */}
            <div className="flex items-center gap-5 p-4 rounded-xl bg-slate-50 border border-slate-100">
              <div className="relative w-16 h-16 rounded-full flex items-center justify-center bg-white shadow-inner flex-shrink-0">
                {/* SVG Progress Ring */}
                <svg className="w-16 h-16 transform -rotate-90">
                  <circle
                    cx="32"
                    cy="32"
                    r="26"
                    className="stroke-slate-200"
                    strokeWidth="5"
                    fill="transparent"
                  />
                  <circle
                    cx="32"
                    cy="32"
                    r="26"
                    className="stroke-[#4F46E5] transition-all duration-700 ease-out"
                    strokeWidth="5"
                    strokeDasharray={163.3}
                    strokeDashoffset={163.3 - (163.3 * progressPercentage) / 100}
                    strokeLinecap="round"
                    fill="transparent"
                  />
                </svg>
                <span className="absolute text-sm font-extrabold text-[#172033]">
                  {progressPercentage}%
                </span>
              </div>
              <div>
                <div className="text-xs font-bold text-[#172033]">Stage Completion</div>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  Keep going! Complete modules to boost your campus hiring readiness.
                </div>
              </div>
            </div>

            {/* 3 Metric Mini-Tiles */}
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="p-2.5 rounded-xl bg-indigo-50/60 border border-indigo-100/70">
                <div className="w-6 h-6 mx-auto mb-1 rounded-lg bg-indigo-100 text-[#4F46E5] flex items-center justify-center">
                  <BookOpen className="w-3.5 h-3.5" />
                </div>
                <div className="text-sm font-extrabold text-[#172033]">18</div>
                <div className="text-[10px] text-slate-500 font-medium">Resources</div>
              </div>
              <div className="p-2.5 rounded-xl bg-purple-50/60 border border-purple-100/70">
                <div className="w-6 h-6 mx-auto mb-1 rounded-lg bg-purple-100 text-[#7C3AED] flex items-center justify-center">
                  <Code2 className="w-3.5 h-3.5" />
                </div>
                <div className="text-sm font-extrabold text-[#172033]">3</div>
                <div className="text-[10px] text-slate-500 font-medium">Skills</div>
              </div>
              <div className="p-2.5 rounded-xl bg-amber-50/60 border border-amber-100/70">
                <div className="w-6 h-6 mx-auto mb-1 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center">
                  <Trophy className="w-3.5 h-3.5" />
                </div>
                <div className="text-sm font-extrabold text-[#172033]">0</div>
                <div className="text-[10px] text-slate-500 font-medium">Milestones</div>
              </div>
            </div>
          </div>

          {/* Widget 2: Recommended for You */}
          <div className="p-5 sm:p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-[#172033] flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-[#7C3AED]" />
                <span>Recommended for You</span>
              </h3>
              <button
                type="button"
                className="text-xs font-semibold text-[#4F46E5] hover:underline"
              >
                View All →
              </button>
            </div>

            <div className="space-y-3">
              {[
                {
                  title: 'Complete JavaScript Course',
                  type: 'YouTube',
                  duration: '4 hours',
                  iconBg: 'bg-red-50 text-red-600',
                  icon: PlayCircle,
                },
                {
                  title: 'React.js Documentation',
                  type: 'Article',
                  duration: '30 mins',
                  iconBg: 'bg-blue-50 text-blue-600',
                  icon: FileText,
                },
                {
                  title: 'Build a Full Stack Project',
                  type: 'Project',
                  duration: '2 hours',
                  iconBg: 'bg-teal-50 text-teal-600',
                  icon: FolderGit2,
                },
                {
                  title: 'DSA for Interviews',
                  type: 'Playlist',
                  duration: '6 hours',
                  iconBg: 'bg-purple-50 text-purple-600',
                  icon: PlayCircle,
                },
              ].map((item, idx) => {
                const Icon = item.icon;
                return (
                  <div
                    key={idx}
                    className="flex items-center justify-between gap-3 p-3 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-all cursor-pointer group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${item.iconBg}`}
                      >
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-[#172033] truncate group-hover:text-[#4F46E5] transition-colors">
                          {item.title}
                        </div>
                        <div className="text-[11px] text-slate-500">
                          {item.type} • {item.duration}
                        </div>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                );
              })}
            </div>
          </div>

          {/* Widget 3: Career Tips */}
          <div className="p-5 sm:p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-[#172033] flex items-center gap-1.5">
                <Lightbulb className="w-4 h-4 text-amber-500" />
                <span>Career Tips</span>
              </h3>
              <button
                type="button"
                className="text-xs font-semibold text-[#4F46E5] hover:underline"
              >
                View All →
              </button>
            </div>

            <div className="space-y-3.5">
              <div className="flex items-start gap-3 p-3 rounded-xl bg-amber-50/40 border border-amber-100/60">
                <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center flex-shrink-0 mt-0.5 text-xs font-bold">
                  ⚡
                </div>
                <div>
                  <div className="text-xs font-bold text-[#172033]">Build real-world projects</div>
                  <div className="text-[11px] text-slate-600 mt-0.5 leading-relaxed">
                    Projects showcase your practical skills better than just theory.
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-xl bg-blue-50/40 border border-blue-100/60">
                <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center flex-shrink-0 mt-0.5 text-xs font-bold">
                  📅
                </div>
                <div>
                  <div className="text-xs font-bold text-[#172033]">Be consistent</div>
                  <div className="text-[11px] text-slate-600 mt-0.5 leading-relaxed">
                    Dedicate time daily for learning and continuous coding practice.
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-xl bg-purple-50/40 border border-purple-100/60">
                <div className="w-7 h-7 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center flex-shrink-0 mt-0.5 text-xs font-bold">
                  🤝
                </div>
                <div>
                  <div className="text-xs font-bold text-[#172033]">Network with professionals</div>
                  <div className="text-[11px] text-slate-600 mt-0.5 leading-relaxed">
                    Connect with alumni and mentors on CareerBridge to unlock opportunities.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stage Detail Modal */}
      {activeStageDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-2xs p-4 animate-in fade-in">
          <div className="w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex items-start justify-between">
              <div>
                <span className="text-[11px] font-bold text-[#4F46E5] uppercase tracking-wider">
                  Stage {activeStageDetail.id} Resources
                </span>
                <h3 className="text-xl font-extrabold text-[#172033] mt-0.5">
                  {activeStageDetail.title}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setActiveStageDetail(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
              <p className="text-sm text-slate-600">{activeStageDetail.description}</p>

              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                  Skills Covered
                </h4>
                <div className="flex flex-wrap gap-2">
                  {activeStageDetail.skills.map((skill, sIdx) => (
                    <span
                      key={sIdx}
                      className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-indigo-50 text-[#4F46E5]"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                  Curated Learning Modules
                </h4>
                <div className="space-y-2.5">
                  {activeStageDetail.resources.map((res, rIdx) => (
                    <div
                      key={rIdx}
                      className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 hover:bg-indigo-50/50 hover:border-indigo-200 transition-colors"
                    >
                      <div>
                        <div className="text-xs sm:text-sm font-bold text-[#172033]">
                          {res.title}
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          {res.type} • {res.duration}
                        </div>
                      </div>
                      <a
                        href={res.link || '#'}
                        target="_blank"
                        rel="noreferrer"
                        className="p-2 rounded-xl bg-white border border-slate-200 text-[#4F46E5] hover:bg-[#4F46E5] hover:text-white transition-colors"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
              <button
                type="button"
                onClick={() => {
                  handleToggleStageStatus(activeStageDetail.id);
                  setActiveStageDetail(null);
                }}
                className="px-4 py-2 rounded-xl bg-[#4F46E5] text-white text-xs font-bold hover:bg-[#4338CA] transition-colors cursor-pointer"
              >
                Mark Stage Status Toggle
              </button>
              <button
                type="button"
                onClick={() => setActiveStageDetail(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-100"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CareerRoadmapPage;
