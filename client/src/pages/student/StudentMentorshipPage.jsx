import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Filter,
  Sparkles,
  Users,
  Briefcase,
  GraduationCap,
  MessageSquare,
  Send,
  Star,
  MapPin,
  Clock,
  ChevronDown,
  CheckCircle,
  ArrowRight,
  X,
  Compass,
  CheckCircle2,
  Calendar,
} from 'lucide-react';
import { getMentors, getStudentMentorships } from '../../services/mentorshipService';
import RequestMentorshipModal from '../../components/RequestMentorshipModal';

// Sample mentors from Image 12 for high-fidelity fallback when database is fresh
const SAMPLE_IMAGE_MENTORS = [
  {
    id: 'm1',
    fullName: 'Rohan Patil',
    currentRole: 'Software Engineer',
    currentCompany: 'Google',
    companyLogo: 'https://www.google.com/favicon.ico',
    companyColor: '#EA4335',
    location: 'Bengaluru',
    yearsOfExperience: 3,
    department: 'Computer Engineering',
    skills: ['System Design', 'Interview Prep', 'Data Structures', 'Career Guidance'],
    rating: 4.9,
    sessionsCount: 38,
  },
  {
    id: 'm2',
    fullName: 'Priya Deshmukh',
    currentRole: 'Product Manager',
    currentCompany: 'Microsoft',
    companyLogo: 'https://www.microsoft.com/favicon.ico',
    companyColor: '#00A4EF',
    location: 'Hyderabad',
    yearsOfExperience: 5,
    department: 'Computer Engineering',
    skills: ['Product Management', 'Career Growth', 'Resume Review', 'Leadership'],
    rating: 4.8,
    sessionsCount: 42,
  },
  {
    id: 'm3',
    fullName: 'Aman Kulkarni',
    currentRole: 'Software Development Engineer',
    currentCompany: 'Amazon',
    companyLogo: 'https://www.amazon.com/favicon.ico',
    companyColor: '#FF9900',
    location: 'Bengaluru',
    yearsOfExperience: 4,
    department: 'Information Technology',
    skills: ['Backend Development', 'System Design', 'Interview Prep', 'Career Transition'],
    rating: 4.9,
    sessionsCount: 29,
  },
  {
    id: 'm4',
    fullName: 'Sneha Nair',
    currentRole: 'Senior Software Engineer',
    currentCompany: 'Flipkart',
    companyLogo: 'https://www.flipkart.com/favicon.ico',
    companyColor: '#2874F0',
    location: 'Bengaluru',
    yearsOfExperience: 4,
    department: 'Computer Engineering',
    skills: ['Full Stack Development', 'Resume Review', 'Interview Prep', 'Career Roadmap'],
    rating: 4.7,
    sessionsCount: 31,
  },
];

export const StudentMentorshipPage = () => {
  const navigate = useNavigate();

  // Navigation Subtabs matching Image 12
  const [activeSubTab, setActiveSubTab] = useState('All Mentors');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDomain, setSelectedDomain] = useState('All Domains');
  const [selectedCompany, setSelectedCompany] = useState('All Companies');
  const [sortBy, setSortBy] = useState('Most Relevant');

  // Backend state
  const [mentors, setMentors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMentorForModal, setSelectedMentorForModal] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  // Filters accordion / checkboxes
  const [selectedDomains, setSelectedDomains] = useState([]);

  const fetchMentorsData = async () => {
    setLoading(true);
    try {
      const res = await getMentors({ search: searchQuery });
      const payload = res?.data?.mentors ? res.data : (res?.data ?? res ?? {});
      const apiMentors = payload.mentors || (Array.isArray(payload) ? payload : []);
      if (apiMentors.length > 0) {
        // Merge with visual enhancements
        const enhanced = apiMentors.map((m, idx) => ({
          ...m,
          location: m.location || (idx % 2 === 0 ? 'Bengaluru' : 'Hyderabad'),
          yearsOfExperience: m.yearsOfExperience || (idx + 3),
          skills: m.mentorshipAreas?.length ? m.mentorshipAreas : ['System Design', 'Interview Prep', 'DSA'],
        }));
        setMentors(enhanced);
      } else {
        setMentors(SAMPLE_IMAGE_MENTORS);
      }
    } catch (err) {
      console.warn('Using mock mentors from image:', err);
      setMentors(SAMPLE_IMAGE_MENTORS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMentorsData();
  }, [searchQuery]);

  const handleDomainToggle = (domain) => {
    setSelectedDomains((prev) =>
      prev.includes(domain) ? prev.filter((d) => d !== domain) : [...prev, domain]
    );
  };

  // Filter logic
  const filteredMentors = mentors.filter((m) => {
    const matchesSearch =
      !searchQuery ||
      m.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.currentCompany?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.skills?.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesDomain =
      selectedDomain === 'All Domains' ||
      m.skills?.some((s) => s.toLowerCase().includes(selectedDomain.toLowerCase()));

    const matchesCompany =
      selectedCompany === 'All Companies' ||
      m.currentCompany?.toLowerCase() === selectedCompany.toLowerCase();

    return matchesSearch && matchesDomain && matchesCompany;
  });

  return (
    <div className="space-y-7 pb-10">
      {/* 1. Hero Banner matching Image 12 */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-50/90 via-indigo-50/80 to-purple-50/90 border border-slate-200/80 p-6 sm:p-8 lg:p-9 shadow-xs">
        <div className="absolute -top-16 -right-16 w-64 h-64 bg-purple-200/40 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-64 h-64 bg-sky-200/40 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="max-w-2xl">
            <h1 className="text-2xl sm:text-3xl lg:text-[34px] font-extrabold text-[#172033] tracking-tight leading-tight mb-2">
              Mentorship
            </h1>
            <p className="text-sm sm:text-base text-slate-600 font-normal leading-relaxed">
              Learn from experienced professionals, get career guidance, and grow with the CareerBridge community.
            </p>
          </div>

          {/* Banner Tagline Artwork matching Image 12 ("Guidance Today A Brighter Tomorrow") */}
          <div className="hidden md:flex flex-col items-end justify-center">
            <div className="px-5 py-3 rounded-2xl bg-white/80 backdrop-blur-xs border border-indigo-100 shadow-xs text-right">
              <span className="block text-xs font-bold text-slate-400 italic">Guidance Today</span>
              <span className="block text-sm font-extrabold text-[#4F46E5] italic">
                A Brighter Tomorrow
              </span>
            </div>
          </div>
        </div>

        {/* 4 Feature Guidance Cards matching Image 12 */}
        <div className="relative z-10 grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-indigo-100/70">
          {[
            { title: '1:1 Guidance', desc: 'Get personalized advice', icon: Users, color: 'bg-purple-100 text-[#7C3AED]' },
            { title: 'Career Insights', desc: 'Learn from real experiences', icon: Compass, color: 'bg-blue-100 text-[#4F46E5]' },
            { title: 'Skill Development', desc: 'Grow with expert guidance', icon: Briefcase, color: 'bg-emerald-100 text-emerald-700' },
            { title: 'Build Your Network', desc: 'Connect and collaborate', icon: MessageSquare, color: 'bg-amber-100 text-amber-700' },
          ].map((card, idx) => {
            const Icon = card.icon;
            return (
              <div
                key={idx}
                className="flex items-center gap-3 p-3 rounded-2xl bg-white/70 backdrop-blur-2xs border border-slate-200/60 shadow-2xs"
              >
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${card.color}`}
                >
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

      {/* 2. Subtabs Navigation matching Image 12 */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-2">
        <div className="flex items-center gap-6 overflow-x-auto no-scrollbar">
          {['All Mentors', 'By Domain', 'By Company', 'By Department'].map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveSubTab(tab)}
              className={`text-sm font-bold pb-2 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                activeSubTab === tab
                  ? 'border-[#4F46E5] text-[#4F46E5]'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Quick Stats Ribbon from Image 12 */}
        <div className="hidden lg:flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-700 font-bold">
            <Users className="w-3.5 h-3.5" />
            <span>50 Active Mentors</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-700 font-bold">
            <CheckCircle className="w-3.5 h-3.5" />
            <span>120+ Sessions</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-100 text-amber-700 font-bold">
            <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
            <span>4.8 Rating</span>
          </div>
        </div>
      </div>

      {/* 3. Search & Filter Bar matching Image 12 */}
      <div className="flex flex-col sm:flex-row items-center gap-3 bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search mentors by name, company, skills, or domain..."
            className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm bg-slate-50 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#4F46E5] focus:bg-white transition-all text-[#172033]"
          />
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <select
            value={selectedDomain}
            onChange={(e) => setSelectedDomain(e.target.value)}
            className="px-3 py-2 text-xs font-semibold rounded-xl bg-slate-50 border border-slate-200 text-slate-700 focus:outline-none cursor-pointer"
          >
            <option>All Domains</option>
            <option>Software Development</option>
            <option>Data Science</option>
            <option>Product Management</option>
          </select>

          <select
            value={selectedCompany}
            onChange={(e) => setSelectedCompany(e.target.value)}
            className="px-3 py-2 text-xs font-semibold rounded-xl bg-slate-50 border border-slate-200 text-slate-700 focus:outline-none cursor-pointer"
          >
            <option>All Companies</option>
            <option>Google</option>
            <option>Microsoft</option>
            <option>Amazon</option>
            <option>Flipkart</option>
          </select>

          <button
            type="button"
            className="px-3.5 py-2 text-xs font-bold rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 flex items-center gap-1.5 cursor-pointer"
          >
            <Filter className="w-3.5 h-3.5 text-slate-500" />
            <span>Filters</span>
          </button>
        </div>
      </div>

      {/* 4. Main 2-Column Layout: Left Mentor Cards, Right Filter Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-7 items-start">
        {/* Left Column (3 Cols): Mentor Cards List */}
        <div className="lg:col-span-3 space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-500 px-1">
            <span className="font-bold text-[#172033]">
              {filteredMentors.length} mentors found
            </span>
            <div className="flex items-center gap-2">
              <span>Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="font-bold text-[#172033] bg-transparent focus:outline-none cursor-pointer"
              >
                <option>Most Relevant</option>
                <option>Highest Rated</option>
                <option>Most Experienced</option>
              </select>
            </div>
          </div>

          {/* Mentor Cards matching Image 12 */}
          <div className="space-y-4">
            {filteredMentors.map((mentor) => (
              <div
                key={mentor.id}
                className="p-5 sm:p-6 rounded-3xl bg-white border border-slate-200/80 hover:border-indigo-200 shadow-xs hover:shadow-md transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-5 group"
              >
                <div className="flex items-start gap-4">
                  {/* Avatar */}
                  <div className="relative">
                    <div className="w-13 h-13 rounded-2xl bg-gradient-to-tr from-indigo-100 to-purple-100 text-[#4F46E5] font-extrabold text-base flex items-center justify-center border border-indigo-200/60 shadow-2xs">
                      {mentor.fullName.slice(0, 2).toUpperCase()}
                    </div>
                    {/* Small Company Logo Icon badge */}
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-md bg-white border border-slate-200 shadow-2xs flex items-center justify-center p-0.5">
                      <span className="text-[10px] font-black text-slate-800">
                        {mentor.currentCompany.slice(0, 1)}
                      </span>
                    </div>
                  </div>

                  {/* Mentor Info */}
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-extrabold text-[#172033] group-hover:text-[#4F46E5] transition-colors">
                        {mentor.fullName}
                      </h3>
                      <CheckCircle className="w-4 h-4 text-[#4F46E5]" title="Verified Alumnus" />
                    </div>

                    <div className="text-xs font-semibold text-slate-700">
                      {mentor.currentRole} at{' '}
                      <span className="font-extrabold text-[#172033]">{mentor.currentCompany}</span>
                    </div>

                    <div className="flex items-center gap-3 text-xs text-slate-500 flex-wrap">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        {mentor.location || 'Bengaluru'}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Briefcase className="w-3.5 h-3.5 text-slate-400" />
                        {mentor.yearsOfExperience}+ years experience
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <GraduationCap className="w-3.5 h-3.5 text-slate-400" />
                        {mentor.department || 'Computer Engineering'}
                      </span>
                    </div>

                    {/* Skill Tags from Image 12 */}
                    <div className="flex flex-wrap gap-1.5 pt-1.5">
                      {mentor.skills?.slice(0, 4).map((skill, sIdx) => (
                        <span
                          key={sIdx}
                          className="px-2.5 py-0.5 rounded-lg text-[11px] font-semibold bg-slate-50 text-slate-700 border border-slate-200/80"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Right Action Buttons matching Image 12 */}
                <div className="flex items-center sm:flex-col justify-end gap-2.5 flex-shrink-0 pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <button
                      type="button"
                      onClick={() => navigate('/chat')}
                      className="p-2.5 rounded-xl border border-slate-200 text-slate-600 hover:text-[#4F46E5] hover:bg-indigo-50/60 transition-colors cursor-pointer"
                      title="Direct Chat"
                    >
                      <MessageSquare className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedMentorForModal(mentor)}
                      className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl bg-[#4F46E5] hover:bg-[#4338CA] text-white text-xs font-bold transition-all shadow-2xs cursor-pointer whitespace-nowrap"
                    >
                      Request Mentorship
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => navigate(`/student/mentors/${mentor.id || mentor.userId}`)}
                    className="w-full text-center px-4 py-1.5 text-xs font-semibold text-slate-600 hover:text-[#172033] hover:underline"
                  >
                    View Profile
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column (1 Col): Filters & Promo Sidebar matching Image 12 */}
        <div className="space-y-6">
          <div className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-[#172033] flex items-center gap-2">
                <Filter className="w-4 h-4 text-slate-500" />
                <span>Filters</span>
              </h3>
              <button
                type="button"
                onClick={() => setSelectedDomains([])}
                className="text-xs font-semibold text-[#4F46E5] hover:underline"
              >
                Clear All
              </button>
            </div>

            {/* Domain Accordion Facet from Image 12 */}
            <div className="space-y-2.5">
              <div className="text-xs font-bold text-[#172033] flex items-center justify-between">
                <span>Domain</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </div>
              <div className="space-y-2 pt-1 text-xs">
                {[
                  { name: 'Software Development', count: 18 },
                  { name: 'Data Science', count: 10 },
                  { name: 'Product Management', count: 8 },
                  { name: 'Data Analytics', count: 6 },
                  { name: 'DevOps', count: 5 },
                ].map((d) => (
                  <label
                    key={d.name}
                    className="flex items-center justify-between text-slate-600 hover:text-slate-900 cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={selectedDomains.includes(d.name)}
                        onChange={() => handleDomainToggle(d.name)}
                        className="rounded text-[#4F46E5] focus:ring-[#4F46E5]"
                      />
                      <span>{d.name}</span>
                    </div>
                    <span className="text-slate-400 font-medium">{d.count}</span>
                  </label>
                ))}
                <button
                  type="button"
                  className="text-[11px] font-bold text-[#4F46E5] hover:underline pt-1 block"
                >
                  Show More ▾
                </button>
              </div>
            </div>

            {/* Other Collapsible Filter Labels from Image 12 */}
            {['Company', 'Experience Level', 'Department', 'Location', 'Skills'].map((filterTitle) => (
              <div
                key={filterTitle}
                className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-slate-700 hover:text-slate-900 cursor-pointer"
              >
                <span>{filterTitle}</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </div>
            ))}
          </div>

          {/* Bottom Blue Promotion Card from Image 12 */}
          <div className="p-5 rounded-3xl bg-gradient-to-br from-[#4F46E5] to-[#7C3AED] text-white shadow-md space-y-3">
            <div className="w-8 h-8 rounded-xl bg-white/20 backdrop-blur-xs flex items-center justify-center">
              <Calendar className="w-4 h-4 text-white" />
            </div>
            <h4 className="text-sm font-extrabold leading-snug">Need specific guidance?</h4>
            <p className="text-xs text-indigo-100 leading-relaxed">
              Request a mentorship session with a verified alumnus of your choice.
            </p>
            <button
              type="button"
              onClick={() => {
                if (filteredMentors.length > 0) setSelectedMentorForModal(filteredMentors[0]);
              }}
              className="w-full py-2.5 rounded-xl bg-white text-[#4F46E5] hover:bg-indigo-50 font-bold text-xs transition-colors shadow-2xs cursor-pointer flex items-center justify-center gap-1.5"
            >
              <span>Request a Session</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Modal for Request Mentorship */}
      {selectedMentorForModal && (
        <RequestMentorshipModal
          mentor={selectedMentorForModal}
          isOpen={Boolean(selectedMentorForModal)}
          onClose={() => setSelectedMentorForModal(null)}
          onSuccess={() => {
            setSelectedMentorForModal(null);
            setToastMessage('Mentorship request successfully sent!');
            setTimeout(() => setToastMessage(null), 5000);
          }}
        />
      )}

      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#172033] text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-3 border border-slate-700">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          <span className="text-xs font-semibold">{toastMessage}</span>
          <button
            type="button"
            onClick={() => setToastMessage(null)}
            className="text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};

export default StudentMentorshipPage;
