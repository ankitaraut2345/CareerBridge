import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { chatCareerAssistant } from '../services/aiService';
import {
  Sparkles,
  Send,
  Bot,
  User,
  FileText,
  Briefcase,
  Compass,
  Code2,
  RefreshCw,
  Lightbulb,
  CheckCircle2,
  ArrowRight,
  HelpCircle,
  Clock,
  ShieldCheck,
  Award,
} from 'lucide-react';

const SUGGESTED_SHORTCUTS = [
  {
    title: 'Improve my resume',
    desc: 'Get ATS suggestions and actionable feedback for tech roles.',
    prompt: 'How can I optimize my resume for software engineering campus placements?',
    icon: FileText,
    iconBg: 'bg-blue-100 text-[#4F46E5]',
  },
  {
    title: 'Find internships',
    desc: 'Explore active internships matching your skills & branch.',
    prompt: 'Which software development internships are best suited for my current profile?',
    icon: Briefcase,
    iconBg: 'bg-emerald-100 text-emerald-700',
  },
  {
    title: 'Prepare for interviews',
    desc: 'Practice technical DSA and behavioral questions.',
    prompt: 'Can you quiz me on top technical and HR interview questions for campus recruitment?',
    icon: Code2,
    iconBg: 'bg-purple-100 text-[#7C3AED]',
  },
  {
    title: 'Suggest skills to learn',
    desc: 'Discover high-demand roadmap skills for 2026+.',
    prompt: 'What full-stack and cloud skills should I learn to stand out to recruiters?',
    icon: Compass,
    iconBg: 'bg-amber-100 text-amber-700',
  },
];

export const AiAssistantPage = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      sender: 'ai',
      text: `Hello ${user?.name || 'there'}! I'm your CareerBridge AI Assistant. I can help analyze your resume, recommend skills for campus placements, conduct mock interview questions, or find internships matching your profile. What would you like to explore today?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [inputPrompt, setInputPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSendMessage = async (textToSend) => {
    const prompt = (textToSend || inputPrompt).trim();
    if (!prompt || loading) return;

    const userMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: prompt,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputPrompt('');
    setLoading(true);

    try {
      const res = await chatCareerAssistant(prompt);
      const reply = res?.data?.reply || res?.reply;

      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: 'ai',
          text: reply || 'Here is some guidance based on your profile and placement trends.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } catch (err) {
      console.warn('AI chat error, using local advisory response:', err);
      // Fallback local heuristic reply if network is interrupted
      let fallback = `Here is tailored advice for your query:\n\n• **Continuous DSA Practice:** Focus on Trees, Graphs, and Hash Tables.\n• **Projects:** Ensure your GitHub repositories include clean READMEs and deployed links.\n• **Campus Placement Tip:** Network with CareerBridge alumni from your target companies!`;
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: 'ai',
          text: fallback,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-7 pb-10">
      {/* 1. SaaS Hero Banner matching Image 10 */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-50/90 via-indigo-50/80 to-purple-50/90 border border-slate-200/80 p-6 sm:p-8 lg:p-9 shadow-xs">
        <div className="absolute -top-16 -right-16 w-64 h-64 bg-purple-200/40 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-64 h-64 bg-sky-200/40 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-indigo-100/90 text-[#4F46E5] mb-2.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Career Intelligence</span>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-[34px] font-extrabold text-[#172033] tracking-tight leading-tight mb-2">
              CareerBridge AI Assistant
            </h1>
            <p className="text-sm sm:text-base text-slate-600 font-normal leading-relaxed">
              Your intelligent placement companion powered by Gemini AI. Get guidance, elevate your resume, and ace technical interviews.
            </p>
          </div>

          <div className="hidden md:flex items-center gap-2 px-4 py-2 rounded-2xl bg-white/80 backdrop-blur-xs border border-indigo-100 shadow-xs">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-bold text-slate-700">AI Assistant Online</span>
          </div>
        </div>

        {/* 4 Feature Pills */}
        <div className="relative z-10 grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-indigo-100/70">
          {[
            { title: 'Career Guidance', desc: 'Personalized advice & roadmaps', icon: Compass },
            { title: 'Resume Help', desc: 'ATS optimization & feedback', icon: FileText },
            { title: 'Interview Prep', desc: 'Targeted technical & HR questions', icon: Code2 },
            { title: 'Opportunity Match', desc: 'Eligibility analysis & scoring', icon: Briefcase },
          ].map((pill, idx) => {
            const Icon = pill.icon;
            return (
              <div
                key={idx}
                className="flex items-center gap-3 p-3 rounded-2xl bg-white/70 backdrop-blur-2xs border border-slate-200/60 shadow-2xs"
              >
                <div className="w-9 h-9 rounded-xl bg-indigo-50 text-[#4F46E5] flex items-center justify-center flex-shrink-0">
                  <Icon className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-bold text-[#172033] truncate">{pill.title}</div>
                  <div className="text-[11px] text-slate-500 truncate">{pill.desc}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. Main 2-Column Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-7 items-start">
        {/* Left Column (2 Cols): Interactive Chat View */}
        <div className="lg:col-span-2 rounded-3xl bg-white border border-slate-200/80 shadow-xs overflow-hidden flex flex-col h-[650px]">
          {/* Chat Header */}
          <div className="p-4 sm:px-6 bg-slate-50/80 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#4F46E5] to-[#7C3AED] text-white flex items-center justify-center shadow-xs">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <div className="text-sm font-bold text-[#172033] flex items-center gap-2">
                  <span>CareerBridge AI Copilot</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    Active
                  </span>
                </div>
                <div className="text-xs text-slate-500">
                  Grounded in your student profile & campus placement database
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() =>
                setMessages([
                  {
                    id: 'welcome',
                    sender: 'ai',
                    text: `Chat reset. What would you like to prepare next?`,
                    timestamp: new Date().toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    }),
                  },
                ])
              }
              className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition-colors"
              title="Clear chat"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>

          {/* Chat Messages Body */}
          <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4">
            {messages.map((m) => {
              const isAi = m.sender === 'ai';
              return (
                <div
                  key={m.id}
                  className={`flex items-start gap-3 ${isAi ? 'justify-start' : 'justify-end'}`}
                >
                  {isAi && (
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#4F46E5] to-[#7C3AED] text-white flex items-center justify-center flex-shrink-0 mt-1 shadow-2xs">
                      <Sparkles className="w-4 h-4" />
                    </div>
                  )}

                  <div
                    className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-4 text-xs sm:text-sm leading-relaxed ${
                      isAi
                        ? 'bg-slate-50 border border-slate-200/80 text-[#172033] rounded-tl-sm whitespace-pre-line'
                        : 'bg-[#4F46E5] text-white rounded-tr-sm'
                    }`}
                  >
                    <div className="font-normal">{m.text}</div>
                    <div
                      className={`text-[10px] mt-1.5 text-right ${
                        isAi ? 'text-slate-400' : 'text-indigo-200'
                      }`}
                    >
                      {m.timestamp}
                    </div>
                  </div>

                  {!isAi && (
                    <div className="w-8 h-8 rounded-xl bg-slate-200 text-slate-700 flex items-center justify-center flex-shrink-0 mt-1 font-bold text-xs">
                      {user?.name ? user.name.slice(0, 2).toUpperCase() : 'ME'}
                    </div>
                  )}
                </div>
              );
            })}

            {loading && (
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#4F46E5] to-[#7C3AED] text-white flex items-center justify-center flex-shrink-0 mt-1">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs text-slate-500 rounded-tl-sm flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#4F46E5] animate-bounce" />
                  <span
                    className="w-2 h-2 rounded-full bg-[#7C3AED] animate-bounce"
                    style={{ animationDelay: '0.2s' }}
                  />
                  <span
                    className="w-2 h-2 rounded-full bg-[#38BDF8] animate-bounce"
                    style={{ animationDelay: '0.4s' }}
                  />
                  <span className="ml-1 text-slate-500 font-medium">
                    Analyzing career database...
                  </span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompt Cards (if only 1 welcome message) */}
          {messages.length <= 1 && (
            <div className="px-4 sm:px-6 pb-4">
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2.5">
                Suggested Prompts
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {SUGGESTED_SHORTCUTS.map((item, idx) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSendMessage(item.prompt)}
                      className="p-3 rounded-2xl bg-slate-50 hover:bg-indigo-50/60 border border-slate-200/80 hover:border-indigo-200 text-left transition-all group cursor-pointer"
                    >
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${item.iconBg}`}
                        >
                          <Icon className="w-3.5 h-3.5" />
                        </div>
                        <div className="text-xs font-bold text-[#172033] group-hover:text-[#4F46E5]">
                          {item.title}
                        </div>
                      </div>
                      <div className="text-[11px] text-slate-500 mt-1 line-clamp-1">{item.desc}</div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Message Input Box */}
          <div className="p-4 sm:p-5 border-t border-slate-100 bg-white">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-center gap-2.5"
            >
              <input
                type="text"
                value={inputPrompt}
                onChange={(e) => setInputPrompt(e.target.value)}
                placeholder="Ask anything about career, interviews, resumes, or opportunities..."
                disabled={loading}
                className="flex-1 px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200/90 text-xs sm:text-sm text-[#172033] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#4F46E5] focus:bg-white transition-all"
              />
              <button
                type="submit"
                disabled={!inputPrompt.trim() || loading}
                className="p-3 rounded-2xl bg-[#4F46E5] hover:bg-[#4338CA] text-white disabled:opacity-50 disabled:cursor-not-allowed shadow-xs transition-colors cursor-pointer"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>

        {/* Right Column (1 Col): Quick Actions & Insights matching Image 10 */}
        <div className="space-y-6">
          {/* Quick Actions Card */}
          <div className="p-5 sm:p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-[#172033] flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#7C3AED]" />
              <span>AI Quick Tools</span>
            </h3>

            <div className="space-y-2.5">
              <button
                type="button"
                onClick={() =>
                  handleSendMessage('Analyze my current profile readiness for upcoming campus drives')
                }
                className="w-full flex items-center justify-between p-3 rounded-2xl bg-slate-50 hover:bg-indigo-50/60 border border-slate-200/80 hover:border-indigo-200 text-left transition-colors cursor-pointer group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-blue-100 text-[#4F46E5] flex items-center justify-center">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-[#172033] group-hover:text-[#4F46E5]">
                      Profile ATS Score
                    </div>
                    <div className="text-[10px] text-slate-500">Scan skills match</div>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
              </button>

              <button
                type="button"
                onClick={() =>
                  handleSendMessage(
                    'Simulate a 5-question technical interview for an entry-level software engineer'
                  )
                }
                className="w-full flex items-center justify-between p-3 rounded-2xl bg-slate-50 hover:bg-purple-50/60 border border-slate-200/80 hover:border-purple-200 text-left transition-colors cursor-pointer group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-purple-100 text-[#7C3AED] flex items-center justify-center">
                    <Code2 className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-[#172033] group-hover:text-[#7C3AED]">
                      Mock Tech Round
                    </div>
                    <div className="text-[10px] text-slate-500">Practice questions</div>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
              </button>

              <button
                type="button"
                onClick={() =>
                  handleSendMessage(
                    'Give me the best behavioral answers for "Tell me about a difficult challenge you solved"'
                  )
                }
                className="w-full flex items-center justify-between p-3 rounded-2xl bg-slate-50 hover:bg-amber-50/60 border border-slate-200/80 hover:border-amber-200 text-left transition-colors cursor-pointer group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
                    <Lightbulb className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-[#172033] group-hover:text-amber-700">
                      HR Round Tips
                    </div>
                    <div className="text-[10px] text-slate-500">STAR method scripts</div>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>
          </div>

          {/* Suggested Prompts Card */}
          <div className="p-5 sm:p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-[#172033] flex items-center gap-2">
              <Lightbulb className="w-4 h-4 text-amber-500" />
              <span>Trending Inquiries</span>
            </h3>

            <div className="space-y-2">
              {[
                'How to structure a GitHub portfolio for campus recruiters?',
                'What are common traps in system design interviews for freshers?',
                'How do I politely ask an alumni for a job referral?',
                'Which backend framework is best to learn alongside React in 2026?',
              ].map((query, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSendMessage(query)}
                  className="w-full p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-left text-xs font-medium text-slate-700 transition-colors cursor-pointer flex items-center gap-2"
                >
                  <span className="text-indigo-500 font-bold">›</span>
                  <span className="line-clamp-2">{query}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AiAssistantPage;
