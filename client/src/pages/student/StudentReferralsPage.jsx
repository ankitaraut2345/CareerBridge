import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Filter,
  Send,
  MessageSquare,
  Users,
  Briefcase,
  CheckCircle,
  Building,
  Sparkles,
  MapPin,
  Clock,
  ArrowRight,
  ExternalLink,
  ChevronRight,
  CheckCircle2,
  X,
  HelpCircle,
  Bookmark,
  Share2,
} from 'lucide-react';
import RequestReferralModal from '../../components/RequestReferralModal';
import { getReferralOpportunities, getMyReferralRequests } from '../../services/referralService';

const SAMPLE_IMAGE_REFERRALS = [
  {
    id: 'ref-1',
    role: 'Software Engineer Intern',
    companyName: 'Google',
    companyLogo: 'https://www.google.com/favicon.ico',
    companyColor: '#4285F4',
    location: 'Bengaluru',
    jobType: 'Internship',
    workMode: 'On-site',
    skills: ['React', 'Node.js', 'System Design'],
    alumni: {
      id: 'alumni-1',
      name: 'Rohan Patil',
      role: 'Software Engineer',
      initials: 'RP',
      passoutYear: 2021,
    },
  },
  {
    id: 'ref-2',
    role: 'SDE Intern',
    companyName: 'Microsoft',
    companyLogo: 'https://www.microsoft.com/favicon.ico',
    companyColor: '#00A4EF',
    location: 'Hyderabad',
    jobType: 'Internship',
    workMode: 'Hybrid',
    skills: ['Java', 'DSA', 'Web Development'],
    alumni: {
      id: 'alumni-2',
      name: 'Priya Deshmukh',
      role: 'Product Manager',
      initials: 'PD',
      passoutYear: 2020,
    },
  },
  {
    id: 'ref-3',
    role: 'Software Development Engineer',
    companyName: 'Amazon',
    companyLogo: 'https://www.amazon.com/favicon.ico',
    companyColor: '#FF9900',
    location: 'Bengaluru',
    jobType: 'Full-time',
    workMode: 'On-site',
    skills: ['System Design', 'Cloud', 'DSA'],
    alumni: {
      id: 'alumni-3',
      name: 'Aman Kulkarni',
      role: 'SDE II',
      initials: 'AK',
      passoutYear: 2019,
    },
  },
  {
    id: 'ref-4',
    role: 'Product Intern',
    companyName: 'Flipkart',
    companyLogo: 'https://www.flipkart.com/favicon.ico',
    companyColor: '#2874F0',
    location: 'Bengaluru',
    jobType: 'Internship',
    workMode: 'Hybrid',
    skills: ['Product Strategy', 'Data Analysis', 'SQL'],
    alumni: {
      id: 'alumni-4',
      name: 'Sneha Nair',
      role: 'Product Manager',
      initials: 'SN',
      passoutYear: 2018,
    },
  },
  {
    id: 'ref-5',
    role: 'Software Engineer',
    companyName: 'TCS',
    companyLogo: 'https://www.tcs.com/favicon.ico',
    companyColor: '#003366',
    location: 'Pune',
    jobType: 'Full-time',
    workMode: 'On-site',
    skills: ['Java', 'Spring Boot', 'Database'],
    alumni: {
      id: 'alumni-5',
      name: 'Vikram Taware',
      role: 'Software Engineer',
      initials: 'VT',
      passoutYear: 2022,
    },
  },
];

export const StudentReferralsPage = () => {
  const navigate = useNavigate();

  // Tabs matching Image 13
  const [activeTab, setActiveTab] = useState('Explore Referrals');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCompany, setSelectedCompany] = useState('All Companies');
  const [selectedJobType, setSelectedJobType] = useState('All Job Types');
  const [sortBy, setSortBy] = useState('Most Relevant');

  // Backend state
  const [referrals, setReferrals] = useState([]);
  const [myRequests, setMyRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedReferralForModal, setSelectedReferralForModal] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  const fetchReferralsData = async () => {
    setLoading(true);
    try {
      const [refRes, myRes] = await Promise.allSettled([
        getReferralOpportunities({ search: searchQuery }),
        getMyReferralRequests(),
      ]);

      const apiReferrals = refRes.status === 'fulfilled' ? refRes.value.data?.data?.referrals || [] : [];
      if (myRes.status === 'fulfilled') {
        setMyRequests(myRes.value.data?.data || []);
      }

      if (apiReferrals.length > 0) {
        // Adapt api referrals to card format
        const adapted = apiReferrals.map((r, idx) => ({
          ...r,
          jobType: r.jobType || (idx % 2 === 0 ? 'Internship' : 'Full-time'),
          workMode: r.workMode || 'On-site',
          alumni: {
            id: r.alumniId || r.postedBy?._id,
            name: r.alumniName || r.postedBy?.name || 'Verified Alumni',
            role: r.alumniRole || 'Software Engineer',
            initials: (r.alumniName || 'Alumni').slice(0, 2).toUpperCase(),
            passoutYear: r.passoutYear || 2021,
          },
        }));
        setReferrals(adapted);
      } else {
        setReferrals(SAMPLE_IMAGE_REFERRALS);
      }
    } catch (err) {
      console.warn('Using sample referrals from image:', err);
      setReferrals(SAMPLE_IMAGE_REFERRALS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReferralsData();
  }, [searchQuery]);

  // Filtering
  const filteredReferrals = referrals.filter((r) => {
    const matchesSearch =
      !searchQuery ||
      r.role?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.companyName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.alumni?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.skills?.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCompany =
      selectedCompany === 'All Companies' ||
      r.companyName?.toLowerCase() === selectedCompany.toLowerCase();

    const matchesType =
      selectedJobType === 'All Job Types' ||
      r.jobType?.toLowerCase() === selectedJobType.toLowerCase();

    return matchesSearch && matchesCompany && matchesType;
  });

  return (
    <div className="space-y-7 pb-10">
      {/* 1. Hero Banner matching Image 13 */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-50/90 via-indigo-50/80 to-purple-50/90 border border-slate-200/80 p-6 sm:p-8 lg:p-9 shadow-xs">
        <div className="absolute -top-16 -right-16 w-64 h-64 bg-purple-200/40 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-64 h-64 bg-sky-200/40 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="max-w-2xl">
            <h1 className="text-2xl sm:text-3xl lg:text-[34px] font-extrabold text-[#172033] tracking-tight leading-tight mb-2">
              Referrals
            </h1>
            <p className="text-sm sm:text-base text-slate-600 font-normal leading-relaxed">
              Get referred by alumni, mentors, and peers to increase your chances of landing internships and jobs.
            </p>
          </div>

          {/* Banner Tagline Artwork matching Image 13 ("Opportunities Through Connections" with paper airplane) */}
          <div className="hidden md:flex flex-col items-end justify-center">
            <div className="px-5 py-3 rounded-2xl bg-white/80 backdrop-blur-xs border border-indigo-100 shadow-xs text-right">
              <span className="block text-xs font-bold text-slate-400 italic">
                Opportunities
              </span>
              <span className="block text-sm font-extrabold text-[#4F46E5] italic">
                Through Connections ✈
              </span>
            </div>
          </div>
        </div>

        {/* 4 Feature Guidance Cards matching Image 13 */}
        <div className="relative z-10 grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-indigo-100/70">
          {[
            { title: 'Better Chances', desc: 'Get noticed faster', icon: Sparkles, color: 'bg-emerald-100 text-emerald-700' },
            { title: 'Verified Alumni', desc: 'Connect with trusted professionals', icon: Users, color: 'bg-purple-100 text-[#7C3AED]' },
            { title: 'Direct Referrals', desc: 'Request and track referrals', icon: Send, color: 'bg-blue-100 text-[#4F46E5]' },
            { title: 'Guidance & Tips', desc: 'Learn how to ask effectively', icon: HelpCircle, color: 'bg-amber-100 text-amber-700' },
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

      {/* 2. Tabs Navigation matching Image 13 */}
      <div className="flex items-center gap-6 border-b border-slate-200 pb-2 overflow-x-auto no-scrollbar">
        {[
          'Explore Referrals',
          'My Referral Requests',
          'Received Referrals',
          'Referral Insights',
        ].map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className={`text-sm font-bold pb-2 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === tab
                ? 'border-[#4F46E5] text-[#4F46E5]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* 3. Search & Filter Bar matching Image 13 */}
      <div className="flex flex-col sm:flex-row items-center gap-3 bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by job role, company, skills, or alumni name..."
            className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm bg-slate-50 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#4F46E5] focus:bg-white transition-all text-[#172033]"
          />
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto">
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
            <option>TCS</option>
          </select>

          <select
            value={selectedJobType}
            onChange={(e) => setSelectedJobType(e.target.value)}
            className="px-3 py-2 text-xs font-semibold rounded-xl bg-slate-50 border border-slate-200 text-slate-700 focus:outline-none cursor-pointer"
          >
            <option>All Job Types</option>
            <option>Internship</option>
            <option>Full-time</option>
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

      {/* 4. Main 2-Column Layout matching Image 13 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-7 items-start">
        {/* Left Column (2 Cols): Referral Cards List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-500 px-1">
            <span className="font-bold text-[#172033]">
              {filteredReferrals.length} referral opportunities
            </span>
            <div className="flex items-center gap-2">
              <span>Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="font-bold text-[#172033] bg-transparent focus:outline-none cursor-pointer"
              >
                <option>Most Relevant</option>
                <option>Newest First</option>
              </select>
            </div>
          </div>

          {/* Referral Cards matching Image 13 */}
          <div className="space-y-4">
            {filteredReferrals.map((item) => (
              <div
                key={item.id}
                className="p-5 sm:p-6 rounded-3xl bg-white border border-slate-200/80 hover:border-indigo-200 shadow-xs hover:shadow-md transition-all space-y-4 group"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  {/* Company & Role Details */}
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center flex-shrink-0 p-2 shadow-2xs">
                      <span className="text-sm font-black text-slate-800">
                        {item.companyName.slice(0, 1)}
                      </span>
                    </div>

                    <div className="space-y-1">
                      <h3 className="text-base font-extrabold text-[#172033] group-hover:text-[#4F46E5] transition-colors leading-tight">
                        {item.role}
                      </h3>
                      <div className="text-xs font-semibold text-slate-700">
                        {item.companyName}
                      </div>
                      <div className="flex items-center gap-2.5 text-xs text-slate-500 flex-wrap pt-0.5">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          {item.location}
                        </span>
                        <span>•</span>
                        <span className="font-medium text-slate-600">{item.jobType}</span>
                        <span>•</span>
                        <span className="font-medium text-slate-600">{item.workMode}</span>
                      </div>
                    </div>
                  </div>

                  {/* Alumni Badge matching Image 13 */}
                  <div className="flex items-center gap-3 p-2.5 rounded-2xl bg-slate-50 border border-slate-200/70 sm:self-start">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#4F46E5] to-[#7C3AED] text-white flex items-center justify-center font-bold text-xs shadow-2xs flex-shrink-0">
                      {item.alumni.initials}
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-[#172033] leading-tight truncate">
                        {item.alumni.name}
                      </div>
                      <div className="text-[11px] text-slate-500 leading-tight">
                        {item.alumni.role}
                      </div>
                      <div className="text-[10px] text-indigo-600 font-semibold leading-tight">
                        Alumni • {item.alumni.passoutYear} Passout
                      </div>
                    </div>
                  </div>
                </div>

                {/* Skills tags and Actions row */}
                <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex flex-wrap gap-1.5">
                    {item.skills?.map((skill, sIdx) => (
                      <span
                        key={sIdx}
                        className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-50 text-slate-700 border border-slate-200/80"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center gap-2 justify-end">
                    <button
                      type="button"
                      onClick={() => navigate('/chat')}
                      className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:text-[#4F46E5] hover:bg-indigo-50/60 transition-colors cursor-pointer"
                      title="Chat with Alumnus"
                    >
                      <MessageSquare className="w-4 h-4" />
                    </button>

                    <button
                      type="button"
                      onClick={() => setSelectedReferralForModal(item)}
                      className="px-4 py-2 rounded-xl bg-[#4F46E5] hover:bg-[#4338CA] text-white text-xs font-bold transition-all shadow-2xs cursor-pointer"
                    >
                      Request Referral
                    </button>

                    <button
                      type="button"
                      onClick={() => navigate(`/student/mentors/${item.alumni.id}`)}
                      className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                    >
                      View Profile
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column (1 Col): Referral Stats & How Referrals Work matching Image 13 */}
        <div className="space-y-6">
          {/* Widget 1: Your Referral Stats */}
          <div className="p-5 sm:p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-[#172033] flex items-center gap-2">
                <Send className="w-4 h-4 text-[#4F46E5]" />
                <span>Your Referral Stats</span>
              </h3>
              <button
                type="button"
                onClick={() => setActiveTab('My Referral Requests')}
                className="text-xs font-semibold text-[#4F46E5] hover:underline"
              >
                View All →
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3.5 rounded-2xl bg-purple-50/60 border border-purple-100 flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-purple-100 text-[#7C3AED] flex items-center justify-center font-bold">
                  ✈
                </div>
                <div>
                  <div className="text-lg font-extrabold text-[#172033]">5</div>
                  <div className="text-[11px] text-slate-500 font-medium">Requests Sent</div>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-emerald-50/60 border border-emerald-100 flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                  💬
                </div>
                <div>
                  <div className="text-lg font-extrabold text-[#172033]">2</div>
                  <div className="text-[11px] text-slate-500 font-medium">Responses</div>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-rose-50/60 border border-rose-100 flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center font-bold">
                  🔖
                </div>
                <div>
                  <div className="text-lg font-extrabold text-[#172033]">1</div>
                  <div className="text-[11px] text-slate-500 font-medium">Referrals Granted</div>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-blue-50/60 border border-blue-100 flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                  ⏱
                </div>
                <div>
                  <div className="text-lg font-extrabold text-[#172033]">3</div>
                  <div className="text-[11px] text-slate-500 font-medium">In Progress</div>
                </div>
              </div>
            </div>
          </div>

          {/* Widget 2: How Referrals Work from Image 13 */}
          <div className="p-5 sm:p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-[#172033] flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>How Referrals Work</span>
            </h3>

            <div className="space-y-3">
              {[
                { step: '1', title: 'Browse referral opportunities', desc: 'Find roles shared by verified alumni.' },
                { step: '2', title: 'Connect with the right person', desc: 'Check their background & current team.' },
                { step: '3', title: 'Request a referral', desc: 'Send a personalized note with your resume.' },
                { step: '4', title: 'Track your requests', desc: 'Get live updates on the alumni dashboard.' },
              ].map((item) => (
                <div key={item.step} className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-indigo-50 text-[#4F46E5] font-extrabold text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
                    {item.step}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-[#172033]">{item.title}</div>
                    <div className="text-[11px] text-slate-500">{item.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Widget 3: Tips for a Successful Referral from Image 13 */}
          <div className="p-5 sm:p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-[#172033] flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#7C3AED]" />
              <span>Tips for a Successful Referral</span>
            </h3>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
                <div className="font-bold text-[#172033]">Personalize your request</div>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  Mention the specific job role and explain why your experience fits.
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
                <div className="font-bold text-[#172033]">Highlight relevant skills</div>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  Keep your pitch concise and focused on 2-3 key accomplishments.
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
                <div className="font-bold text-[#172033]">Be professional and polite</div>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  Respect the alumni's busy time and thank them in advance.
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
                <div className="font-bold text-[#172033]">Follow up respectfully</div>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  Give them at least 4-5 business days before sending a friendly check-in.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal for Requesting Referral */}
      {selectedReferralForModal && (
        <RequestReferralModal
          referral={selectedReferralForModal}
          isOpen={Boolean(selectedReferralForModal)}
          onClose={() => setSelectedReferralForModal(null)}
          onSuccess={() => {
            setSelectedReferralForModal(null);
            setToastMessage('Referral request successfully submitted!');
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

export default StudentReferralsPage;
