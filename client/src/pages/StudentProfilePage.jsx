import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import PageHeroBanner from '../components/PageHeroBanner';
import api from '../services/api';
import {
  User,
  GraduationCap,
  Briefcase,
  Code2,
  Target,
  Heart,
  Link as LinkIcon,
  MapPin,
  Mail,
  Phone,
  Camera,
  Edit2,
  ExternalLink,
  Save,
  X,
  CheckCircle2,
  Sparkles,
  FileText,
} from 'lucide-react';

export const StudentProfilePage = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('Overview');
  const [loading, setLoading] = useState(true);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Profile state initialized with rich defaults and synced with backend
  const [profile, setProfile] = useState({
    fullName: user?.name || 'John Doe',
    title: 'Student | Computer Engineering',
    college: "Vidya Pratishthan's Kamalnayan Bajaj Institute of Engineering and Technology",
    location: 'Baramati, Maharashtra',
    email: user?.email || 'john.doe@example.com',
    phone: '+91 98765 43210',
    linkedin: 'linkedin.com/in/johndoe',
    github: 'github.com/johndoe',
    portfolio: 'johndoe.dev',
    bio: 'I am a final year Computer Engineering student with a strong interest in software development, problem solving and learning new technologies. I am actively looking for internship and job opportunities to apply my skills and learn from experienced professionals.',
    skills: [
      'JavaScript',
      'React.js',
      'Node.js',
      'Express.js',
      'MongoDB',
      'HTML',
      'CSS',
      'Tailwind CSS',
      'Data Structures & Algorithms',
      'SQL',
      'Git & GitHub',
      'Problem Solving',
    ],
    education: {
      degree: 'B.Tech in Computer Engineering',
      institution: "Vidya Pratishthan's Kamalnayan Bajaj Institute of Engineering and Technology",
      year: '2023 - 2027',
      cgpa: '9.18',
    },
    experience: {
      role: 'Software Engineering Intern',
      company: 'Anvistar Technology',
      location: 'Pune',
      period: 'Jun 2026 - Aug 2026',
      type: 'Internship',
      points: [
        'Worked on web development features using React and Node.js.',
        'Collaborated with team to build and test new modules.',
      ],
    },
    careerGoals: ['Software Development', 'Full-time Opportunities', 'Open to Relocation'],
    interests: [
      'Web Development',
      'Artificial Intelligence',
      'Cricket',
      'Chess',
      'Tech Blogs',
      'Open Source',
    ],
  });

  useEffect(() => {
    api
      .get('/student/profile')
      .then((res) => {
        if (res.data) {
          const d = res.data;
          setProfile((prev) => ({
            ...prev,
            fullName: d.fullName || prev.fullName,
            phone: d.phone || prev.phone,
            location: d.location || prev.location,
            college: d.college || prev.college,
            title: `Student | ${d.department || 'Computer Engineering'}`,
            bio: d.bio || prev.bio,
            skills: d.skills && d.skills.length > 0 ? d.skills : prev.skills,
            education: {
              ...prev.education,
              institution: d.college || prev.education.institution,
              degree: `B.Tech in ${d.department || 'Computer Engineering'}`,
              cgpa: d.cgpa ? String(d.cgpa) : prev.education.cgpa,
              year: d.graduationYear ? `2023 - ${d.graduationYear}` : prev.education.year,
            },
          }));
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    try {
      await api.put('/student/profile', {
        fullName: profile.fullName,
        phone: profile.phone,
        location: profile.location,
        college: profile.college,
        bio: profile.bio,
        skills: profile.skills,
        cgpa: Number(profile.education.cgpa) || 9.18,
      });
      setSaveSuccess(true);
      setEditModalOpen(false);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch {
      setEditModalOpen(false);
    }
  };

  const tabs = [
    'Overview',
    'Skills',
    'Education',
    'Experience',
    'Projects',
    'Achievements',
    'Interests',
  ];

  return (
    <div className="space-y-7 animate-in fade-in">
      {/* ─── Hero Banner matching Image 3 ─── */}
      <PageHeroBanner
        title="My Profile"
        subtitle="Showcase your skills, experience, and interests to connect with the right opportunities."
        tagline="Build Your Career Story"
        taglineIcon={Sparkles}
      />

      {saveSuccess && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>Profile updated successfully!</span>
        </div>
      )}

      {/* ─── Main Profile Header Card ─── */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-left">
            {/* Avatar with Camera badge */}
            <div className="relative">
              <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-[#4F46E5] to-[#7C3AED] text-white flex items-center justify-center font-bold text-3xl shadow-md">
                {profile.fullName.slice(0, 2).toUpperCase()}
              </div>
              <button
                type="button"
                onClick={() => setEditModalOpen(true)}
                className="absolute bottom-1 right-1 p-2 rounded-full bg-[#172033] hover:bg-[#4F46E5] text-white shadow-xs transition-colors"
                title="Change Photo"
              >
                <Camera className="w-4 h-4" />
              </button>
            </div>

            {/* User Info Details */}
            <div className="space-y-2">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3">
                <h2 className="text-2xl font-extrabold text-[#172033]">{profile.fullName}</h2>
              </div>
              <p className="text-sm font-semibold text-slate-600">{profile.title}</p>
              <p className="text-xs text-slate-500 flex items-center justify-center sm:justify-start gap-1.5">
                <GraduationCap className="w-4 h-4 text-slate-400" />
                <span>{profile.college}</span>
              </p>
              <p className="text-xs text-slate-500 flex items-center justify-center sm:justify-start gap-1.5">
                <MapPin className="w-4 h-4 text-slate-400" />
                <span>{profile.location}</span>
              </p>

              {/* Contacts Row */}
              <div className="pt-2 flex flex-wrap items-center justify-center sm:justify-start gap-4 text-xs text-slate-600">
                <span className="flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  <span>{profile.email}</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  <span>{profile.phone}</span>
                </span>
                <span className="flex items-center gap-1.5 text-[#4F46E5] font-medium">
                  <LinkIcon className="w-3.5 h-3.5 text-[#4F46E5]" />
                  <span>{profile.linkedin}</span>
                </span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setEditModalOpen(true)}
            className="self-center sm:self-start inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-300 hover:border-[#4F46E5] hover:text-[#4F46E5] text-xs font-bold text-[#172033] transition-colors shadow-2xs cursor-pointer"
          >
            <Edit2 className="w-3.5 h-3.5" />
            <span>Edit Profile</span>
          </button>
        </div>
      </div>

      {/* ─── Navigation Tabs Row ─── */}
      <div className="flex items-center gap-2 overflow-x-auto border-b border-slate-200 pb-2 scrollbar-none">
        {tabs.map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all cursor-pointer ${
              activeTab === tab
                ? 'bg-indigo-50 text-[#4F46E5] border border-indigo-200 shadow-2xs'
                : 'text-slate-600 hover:text-[#172033] hover:bg-slate-100'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* ─── Two-Column Content Grid (Left: 2/3, Right: 1/3) ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left Column (2 spans) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Card 1: About Me */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
              <div className="flex items-center gap-2 font-bold text-sm text-[#172033]">
                <User className="w-4 h-4 text-[#4F46E5]" />
                <span>About Me</span>
              </div>
              <button
                type="button"
                onClick={() => setEditModalOpen(true)}
                className="text-xs font-semibold text-slate-500 hover:text-[#4F46E5] inline-flex items-center gap-1"
              >
                <Edit2 className="w-3 h-3" /> Edit
              </button>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">{profile.bio}</p>
          </div>

          {/* Card 2: Skills */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
              <div className="flex items-center gap-2 font-bold text-sm text-[#172033]">
                <Code2 className="w-4 h-4 text-[#4F46E5]" />
                <span>Skills</span>
              </div>
              <button
                type="button"
                onClick={() => setEditModalOpen(true)}
                className="text-xs font-semibold text-slate-500 hover:text-[#4F46E5] inline-flex items-center gap-1"
              >
                <Edit2 className="w-3 h-3" /> Edit
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {profile.skills.map((skill, sIdx) => (
                <span
                  key={sIdx}
                  className="px-3 py-1.5 rounded-xl bg-slate-100/80 hover:bg-indigo-50 hover:text-[#4F46E5] text-xs font-semibold text-slate-700 transition-colors"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>

          {/* Card 3: Education */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
              <div className="flex items-center gap-2 font-bold text-sm text-[#172033]">
                <GraduationCap className="w-4 h-4 text-[#4F46E5]" />
                <span>Education</span>
              </div>
              <button
                type="button"
                onClick={() => setEditModalOpen(true)}
                className="text-xs font-semibold text-slate-500 hover:text-[#4F46E5] inline-flex items-center gap-1"
              >
                <Edit2 className="w-3 h-3" /> Edit
              </button>
            </div>
            <div>
              <h4 className="text-sm font-bold text-[#172033]">{profile.education.degree}</h4>
              <p className="text-xs text-slate-500 mt-0.5">{profile.education.institution}</p>
              <div className="mt-2 text-xs text-slate-600 flex items-center gap-4">
                <span>{profile.education.year}</span>
                <span>•</span>
                <span className="font-semibold text-slate-800">CGPA: {profile.education.cgpa}</span>
              </div>
            </div>
          </div>

          {/* Card 4: Experience */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
              <div className="flex items-center gap-2 font-bold text-sm text-[#172033]">
                <Briefcase className="w-4 h-4 text-[#4F46E5]" />
                <span>Experience</span>
              </div>
              <button
                type="button"
                onClick={() => setEditModalOpen(true)}
                className="text-xs font-semibold text-slate-500 hover:text-[#4F46E5] inline-flex items-center gap-1"
              >
                <Edit2 className="w-3 h-3" /> Edit
              </button>
            </div>
            <div>
              <h4 className="text-sm font-bold text-[#172033]">{profile.experience.role}</h4>
              <p className="text-xs text-slate-500 mt-0.5">
                {profile.experience.company} • {profile.experience.location}
              </p>
              <p className="text-xs text-slate-400 mt-0.5">
                {profile.experience.period} • {profile.experience.type}
              </p>
              <ul className="mt-3 list-disc list-inside text-xs text-slate-600 space-y-1">
                {profile.experience.points.map((pt, pIdx) => (
                  <li key={pIdx}>{pt}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Right Column (1 span) */}
        <div className="space-y-6">
          {/* Card 1: Career Goals */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
              <div className="flex items-center gap-2 font-bold text-sm text-[#172033]">
                <Target className="w-4 h-4 text-[#7C3AED]" />
                <span>Career Goals</span>
              </div>
              <button
                type="button"
                onClick={() => setEditModalOpen(true)}
                className="text-xs font-semibold text-slate-500 hover:text-[#7C3AED] inline-flex items-center gap-1"
              >
                <Edit2 className="w-3 h-3" /> Edit
              </button>
            </div>
            <div className="space-y-2">
              {profile.careerGoals.map((goal, gIdx) => (
                <div
                  key={gIdx}
                  className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/60 text-xs font-semibold text-slate-700"
                >
                  {goal}
                </div>
              ))}
            </div>
          </div>

          {/* Card 2: Interests */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
              <div className="flex items-center gap-2 font-bold text-sm text-[#172033]">
                <Heart className="w-4 h-4 text-rose-500" />
                <span>Interests</span>
              </div>
              <button
                type="button"
                onClick={() => setEditModalOpen(true)}
                className="text-xs font-semibold text-slate-500 hover:text-rose-500 inline-flex items-center gap-1"
              >
                <Edit2 className="w-3 h-3" /> Edit
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {profile.interests.map((interest, iIdx) => (
                <span
                  key={iIdx}
                  className="px-3 py-1.5 rounded-xl bg-rose-50/60 text-rose-700 text-xs font-semibold"
                >
                  {interest}
                </span>
              ))}
            </div>
          </div>

          {/* Card 3: Social Links */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
              <div className="flex items-center gap-2 font-bold text-sm text-[#172033]">
                <LinkIcon className="w-4 h-4 text-[#4F46E5]" />
                <span>Social Links</span>
              </div>
              <button
                type="button"
                onClick={() => setEditModalOpen(true)}
                className="text-xs font-semibold text-slate-500 hover:text-[#4F46E5] inline-flex items-center gap-1"
              >
                <Edit2 className="w-3 h-3" /> Edit
              </button>
            </div>
            <div className="space-y-3 text-xs">
              <a
                href={`https://${profile.linkedin}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 text-slate-700 font-medium group transition-colors"
              >
                <span className="truncate">{profile.linkedin}</span>
                <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#4F46E5]" />
              </a>
              <a
                href={`https://${profile.github}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 text-slate-700 font-medium group transition-colors"
              >
                <span className="truncate">{profile.github}</span>
                <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#4F46E5]" />
              </a>
              <a
                href={`https://${profile.portfolio}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 text-slate-700 font-medium group transition-colors"
              >
                <span className="truncate">{profile.portfolio}</span>
                <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#4F46E5]" />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Edit Profile Modal ─── */}
      {editModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
              <h3 className="font-bold text-lg text-[#172033]">Edit Student Profile</h3>
              <button
                type="button"
                onClick={() => setEditModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={profile.fullName}
                  onChange={(e) => setProfile({ ...profile, fullName: e.target.value })}
                  className="w-full p-2.5 border border-slate-300 rounded-xl text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">About Me (Bio)</label>
                <textarea
                  rows={3}
                  value={profile.bio}
                  onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                  className="w-full p-2.5 border border-slate-300 rounded-xl text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Phone</label>
                  <input
                    type="text"
                    value={profile.phone}
                    onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                    className="w-full p-2.5 border border-slate-300 rounded-xl text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Location</label>
                  <input
                    type="text"
                    value={profile.location}
                    onChange={(e) => setProfile({ ...profile, location: e.target.value })}
                    className="w-full p-2.5 border border-slate-300 rounded-xl text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">College</label>
                  <input
                    type="text"
                    value={profile.college}
                    onChange={(e) => setProfile({ ...profile, college: e.target.value })}
                    className="w-full p-2.5 border border-slate-300 rounded-xl text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">CGPA</label>
                  <input
                    type="text"
                    value={profile.education.cgpa}
                    onChange={(e) =>
                      setProfile({
                        ...profile,
                        education: { ...profile.education, cgpa: e.target.value },
                      })
                    }
                    className="w-full p-2.5 border border-slate-300 rounded-xl text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Skills (comma separated)
                </label>
                <input
                  type="text"
                  value={profile.skills.join(', ')}
                  onChange={(e) =>
                    setProfile({
                      ...profile,
                      skills: e.target.value
                        .split(',')
                        .map((s) => s.trim())
                        .filter(Boolean),
                    })
                  }
                  className="w-full p-2.5 border border-slate-300 rounded-xl text-sm"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setEditModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-[#4F46E5] hover:bg-[#4338CA] text-white text-xs font-bold shadow-xs transition-colors"
                >
                  Save Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentProfilePage;
