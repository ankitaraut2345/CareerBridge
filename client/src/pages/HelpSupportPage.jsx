import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageHeroBanner from '../components/PageHeroBanner';
import {
  HelpCircle,
  Search,
  User,
  Briefcase,
  Users,
  Settings,
  BookOpen,
  Headphones,
  Mail,
  MessageSquare,
  FileText,
  Clock,
  ChevronDown,
  ChevronRight,
  X,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';

const FAQS = [
  {
    q: 'How do I apply for an opportunity?',
    a: 'Navigate to Opportunities in the sidebar, choose a placement or internship drive that matches your criteria, verify your academic eligibility status, and click "Apply Now". Your stored PDF resume and profile will be submitted directly to the company.',
    category: 'applications',
  },
  {
    q: 'How can I connect with a mentor?',
    a: 'Visit the Mentorship section from the sidebar. You can browse verified alumni by domain or company, inspect their profile experience, and click "Request Mentorship" to schedule a 1:1 guidance session.',
    category: 'mentorship',
  },
  {
    q: 'Can I make my profile private?',
    a: 'Yes. In the Settings page under "Privacy & Visibility", you can adjust your profile visibility to Recruiters & Mentors only, or choose to hide your personal contact details.',
    category: 'profile',
  },
  {
    q: 'How do I upload or update my resume?',
    a: 'Go to My Profile > Edit Profile. In the Resume section, upload your latest PDF document. CareerBridge securely stores your resume and uses it for automated AI ATS analysis against job postings.',
    category: 'resume',
  },
  {
    q: "I'm not receiving notifications. What should I do?",
    a: 'Check your in-app Notifications tab in the sidebar. You can also adjust notification channels in Settings > Notification Preferences to ensure job alerts, interview invites, and message updates are enabled.',
    category: 'notifications',
  },
  {
    q: 'How do I reset my password?',
    a: 'For campus data protection and security compliance, student passwords can be reset via the Training & Placement Office (TPO) or by submitting a support ticket below.',
    category: 'account',
  },
];

export const HelpSupportPage = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [openFaq, setOpenFaq] = useState(0);
  const [ticketModalOpen, setTicketModalOpen] = useState(false);
  const [ticketForm, setTicketForm] = useState({
    subject: '',
    category: 'Technical Issue',
    description: '',
  });
  const [ticketSubmitted, setTicketSubmitted] = useState(false);
  const [generatedTicketId, setGeneratedTicketId] = useState('');

  const quickHelpCards = [
    {
      title: 'Account & Profile',
      desc: 'Manage your account, profile, and personal information.',
      icon: User,
      iconBg: 'bg-purple-50 text-[#7C3AED]',
      action: () => navigate('/student/profile'),
    },
    {
      title: 'Opportunities & Applications',
      desc: 'Get help with job/internship applications and opportunity related queries.',
      icon: Briefcase,
      iconBg: 'bg-blue-50 text-blue-600',
      action: () => navigate('/student/opportunities'),
    },
    {
      title: 'Mentorship & Networking',
      desc: 'Learn how to connect with mentors and alumni.',
      icon: Users,
      iconBg: 'bg-indigo-50 text-[#4F46E5]',
      action: () => navigate('/student/mentorship'),
    },
    {
      title: 'Technical Issues',
      desc: 'Facing a bug or technical problem? Find troubleshooting steps here.',
      icon: Settings,
      iconBg: 'bg-sky-50 text-sky-600',
      action: () => setTicketModalOpen(true),
    },
  ];

  const filteredFaqs = searchQuery.trim()
    ? FAQS.filter(
        (f) =>
          f.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
          f.a.toLowerCase().includes(searchQuery.toLowerCase()) ||
          f.category.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : FAQS;

  const handleTicketSubmit = (e) => {
    e.preventDefault();
    const id = `CB-${Math.floor(100000 + Math.random() * 900000)}`;
    setGeneratedTicketId(id);
    setTicketSubmitted(true);
  };

  return (
    <div className="space-y-8 animate-in fade-in">
      {/* ─── Hero Banner matching Image 1 ─── */}
      <PageHeroBanner
        title="Help & Support"
        subtitle="We're here to help you with any questions or issues."
        tagline="Get Support Anytime"
        taglineIcon={Sparkles}
        searchSlot={
          <div className="max-w-3xl">
            <div className="relative flex items-center">
              <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search for help articles, troubleshooting guides, or FAQs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-28 py-3.5 rounded-xl border border-slate-200 bg-white text-sm sm:text-base text-[#172033] shadow-xs focus:outline-none focus:ring-2 focus:ring-[#4F46E5] focus:border-transparent transition-all"
              />
              <button
                type="button"
                className="absolute right-2 top-1/2 -translate-y-1/2 px-5 py-2 rounded-lg bg-[#4F46E5] hover:bg-[#4338CA] text-white font-semibold text-sm shadow-xs transition-colors"
              >
                Search
              </button>
            </div>
            <div className="mt-2.5 flex flex-wrap items-center gap-1.5 text-xs text-slate-500">
              <span>Try searching for:</span>
              {['+applications', 'profile', 'resume', 'mentorship', 'notifications'].map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => setSearchQuery(tag.replace('+', ''))}
                  className="font-medium text-[#4F46E5] hover:underline"
                >
                  "{tag}"
                </button>
              ))}
            </div>
          </div>
        }
      />

      {/* ─── Quick Help Cards Section ─── */}
      <div>
        <div className="mb-4">
          <h2 className="text-lg sm:text-xl font-bold text-[#172033]">Quick Help</h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Find answers to common questions or get support quickly.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickHelpCards.map((card, idx) => {
            const Icon = card.icon;
            return (
              <div
                key={idx}
                onClick={card.action}
                className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs hover:border-[#4F46E5] hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
              >
                <div>
                  <div
                    className={`w-11 h-11 rounded-xl flex items-center justify-center mb-4 transition-transform group-hover:scale-105 ${card.iconBg}`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-sm text-[#172033] group-hover:text-[#4F46E5] transition-colors mb-1.5">
                    {card.title}
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed">{card.desc}</p>
                </div>
                <div className="mt-4 flex items-center justify-end">
                  <div className="p-1 rounded-full text-slate-400 group-hover:text-[#4F46E5] group-hover:translate-x-1 transition-all">
                    <ChevronRight className="w-4 h-4" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ─── Lower Section: FAQs & Contact Support (2 Columns) ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-7">
        {/* Left Column: Frequently Asked Questions (2 spans) */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-7 shadow-xs">
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-indigo-50 text-[#4F46E5] flex items-center justify-center">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-base text-[#172033]">Frequently Asked Questions</h3>
                <p className="text-xs text-slate-500">Get quick answers to the most common questions.</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setOpenFaq(openFaq === -1 ? 0 : -1)}
              className="text-xs font-semibold text-[#4F46E5] hover:underline"
            >
              {openFaq === -1 ? 'Expand' : 'Collapse All'}
            </button>
          </div>

          <div className="space-y-3">
            {filteredFaqs.map((faq, index) => {
              const isOpen = openFaq === index;
              return (
                <div
                  key={index}
                  className="rounded-xl border border-slate-200/70 overflow-hidden transition-colors"
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaq(isOpen ? -1 : index)}
                    className="w-full p-4 text-left font-semibold text-sm text-[#172033] flex items-center justify-between hover:bg-slate-50/60 transition-colors cursor-pointer"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown
                      className={`w-4 h-4 text-slate-400 transition-transform ${
                        isOpen ? 'rotate-180 text-[#4F46E5]' : ''
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="px-4 pb-4 pt-1 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100/60 bg-slate-50/30">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Contact Support Card (1 span) */}
        <div className="space-y-5">
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs">
            <div className="flex items-center gap-2.5 mb-2">
              <div className="w-9 h-9 rounded-xl bg-purple-50 text-[#7C3AED] flex items-center justify-center">
                <Headphones className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-base text-[#172033]">Contact Support</h3>
                <p className="text-xs text-slate-500">Still need help? Get in touch with our team.</p>
              </div>
            </div>

            <div className="mt-5 space-y-3">
              {/* Action 1: Email */}
              <a
                href="mailto:support@careerbridge.edu?subject=CareerBridge%20Support%20Request"
                className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/30 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-[#172033] group-hover:text-[#4F46E5] transition-colors">
                      Send us an Email
                    </div>
                    <div className="text-[11px] text-slate-500">Our team usually responds within 24h</div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-[#4F46E5] transition-transform group-hover:translate-x-0.5" />
              </a>

              {/* Action 2: Live Chat */}
              <button
                type="button"
                onClick={() => navigate('/chat')}
                className="w-full flex items-center justify-between p-3.5 rounded-xl border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/30 transition-all group text-left cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-purple-50 text-[#7C3AED] flex items-center justify-center">
                    <MessageSquare className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-[#172033] group-hover:text-[#4F46E5] transition-colors">
                      Live Chat
                    </div>
                    <div className="text-[11px] text-slate-500">Chat with support (Mon - Sat, 9 AM - 6 PM)</div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-[#4F46E5] transition-transform group-hover:translate-x-0.5" />
              </button>

              {/* Action 3: Support Ticket */}
              <button
                type="button"
                onClick={() => {
                  setTicketSubmitted(false);
                  setTicketModalOpen(true);
                }}
                className="w-full flex items-center justify-between p-3.5 rounded-xl border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/30 transition-all group text-left cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-[#172033] group-hover:text-[#4F46E5] transition-colors">
                      Submit a Support Ticket
                    </div>
                    <div className="text-[11px] text-slate-500">Describe your issue and we'll resolve it</div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-[#4F46E5] transition-transform group-hover:translate-x-0.5" />
              </button>
            </div>
          </div>

          {/* Support Hours Card */}
          <div className="p-4 rounded-2xl bg-indigo-50/60 border border-indigo-100 flex items-center gap-3">
            <Clock className="w-5 h-5 text-[#4F46E5] flex-shrink-0" />
            <div>
              <div className="text-xs font-bold text-[#172033]">Support Hours</div>
              <div className="text-[11px] text-slate-600">Monday - Saturday | 9:00 AM - 6:00 PM (IST)</div>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Ticket Submission Modal ─── */}
      {ticketModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
              <h3 className="font-bold text-lg text-[#172033]">
                {ticketSubmitted ? 'Support Ticket Created' : 'Submit a Support Ticket'}
              </h3>
              <button
                type="button"
                onClick={() => setTicketModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {ticketSubmitted ? (
              <div className="text-center py-6 space-y-4">
                <div className="w-14 h-14 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto shadow-xs">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-[#172033]">Ticket Received!</h4>
                  <p className="text-xs text-slate-500 mt-1">
                    Your inquiry has been assigned reference ID:
                  </p>
                  <div className="mt-2 inline-block px-3 py-1 bg-slate-100 font-mono font-bold text-sm text-[#4F46E5] rounded-lg">
                    {generatedTicketId}
                  </div>
                </div>
                <p className="text-xs text-slate-600 max-w-sm mx-auto">
                  Our placement coordination team will review your query and reply within 24 hours.
                </p>
                <button
                  type="button"
                  onClick={() => setTicketModalOpen(false)}
                  className="w-full py-2.5 rounded-xl bg-[#4F46E5] text-white font-semibold text-sm hover:bg-[#4338CA] transition-colors"
                >
                  Done
                </button>
              </div>
            ) : (
              <form onSubmit={handleTicketSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Issue Category</label>
                  <select
                    value={ticketForm.category}
                    onChange={(e) => setTicketForm({ ...ticketForm, category: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm text-[#172033] focus:ring-2 focus:ring-[#4F46E5] focus:outline-none"
                  >
                    <option value="Technical Issue">Technical Issue</option>
                    <option value="Opportunity Application">Opportunity Application</option>
                    <option value="Mentorship Request">Mentorship Request</option>
                    <option value="Resume & Profile">Resume &amp; Profile</option>
                    <option value="Password Reset">Password Reset</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Subject</label>
                  <input
                    type="text"
                    required
                    placeholder="Brief summary of your issue..."
                    value={ticketForm.subject}
                    onChange={(e) => setTicketForm({ ...ticketForm, subject: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm text-[#172033] focus:ring-2 focus:ring-[#4F46E5] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Description</label>
                  <textarea
                    required
                    rows={4}
                    placeholder="Provide detailed steps or context so we can assist promptly..."
                    value={ticketForm.description}
                    onChange={(e) => setTicketForm({ ...ticketForm, description: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm text-[#172033] focus:ring-2 focus:ring-[#4F46E5] focus:outline-none"
                  />
                </div>

                <div className="pt-2 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setTicketModalOpen(false)}
                    className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-[#4F46E5] hover:bg-[#4338CA] text-white text-xs font-bold shadow-xs transition-colors"
                  >
                    Submit Ticket
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default HelpSupportPage;
