import { DEMO_USERS, createInitialSandboxData } from '../fixtures/demoSandboxFixtures';

const SANDBOX_SESSION_KEY = 'careerbridge_demo_sandbox';
const SANDBOX_DATA_KEY = 'careerbridge_demo_data';

/**
 * Check if the current browser session is running in Isolated Demo Sandbox mode
 */
export const isSandboxActive = () => {
  try {
    return !!sessionStorage.getItem(SANDBOX_SESSION_KEY);
  } catch {
    return false;
  }
};

/**
 * Get active sandbox session details
 */
export const getSandboxSession = () => {
  try {
    const raw = sessionStorage.getItem(SANDBOX_SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

/**
 * Get or initialize persistent in-session demo data
 */
export const getSandboxState = () => {
  try {
    const raw = sessionStorage.getItem(SANDBOX_DATA_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (err) {
    console.warn('Error reading sandbox data from sessionStorage:', err);
  }

  const initial = createInitialSandboxData();
  saveSandboxState(initial);
  return initial;
};

/**
 * Save updated sandbox state to sessionStorage
 */
export const saveSandboxState = (data) => {
  try {
    sessionStorage.setItem(SANDBOX_DATA_KEY, JSON.stringify(data));
  } catch (err) {
    console.warn('Error writing sandbox data to sessionStorage:', err);
  }
};

/**
 * Activate demo sandbox for a specific role
 */
export const activateSandbox = (role) => {
  const normalizedRole = (role || 'STUDENT').toUpperCase();
  const user = DEMO_USERS[normalizedRole] || DEMO_USERS.STUDENT;

  // Initialize fresh or retain existing session data
  let data = null;
  try {
    const existing = sessionStorage.getItem(SANDBOX_DATA_KEY);
    data = existing ? JSON.parse(existing) : createInitialSandboxData();
  } catch {
    data = createInitialSandboxData();
  }
  saveSandboxState(data);

  const session = {
    role: normalizedRole,
    user,
    startedAt: Date.now(),
  };

  sessionStorage.setItem(SANDBOX_SESSION_KEY, JSON.stringify(session));
  return user;
};

/**
 * Clear all sandbox session and state data
 */
export const clearSandbox = () => {
  try {
    sessionStorage.removeItem(SANDBOX_SESSION_KEY);
    sessionStorage.removeItem(SANDBOX_DATA_KEY);
  } catch (err) {
    console.warn('Error clearing sandbox state:', err);
  }
};

/**
 * Helper to build an Axios-compatible response object
 */
const mockResponse = (data, config, status = 200, statusText = 'OK') => ({
  data,
  status,
  statusText,
  headers: { 'content-type': 'application/json' },
  config,
  request: {},
});

/**
 * Core Request Interceptor / Adapter for Isolated Demo Sandbox
 * Handles all reads & writes locally using sessionStorage fixtures.
 * Zero requests are sent to the production backend.
 */
export const handleSandboxRequest = async (config) => {
  const method = (config.method || 'get').toLowerCase();
  let url = config.url || '';

  // Strip leading baseURL (/api or full host) if present
  url = url.replace(/^(?:https?:\/\/[^/]+)?\/api\/?/, '/');
  if (!url.startsWith('/')) url = '/' + url;

  // Parse path and query params
  const [pathOnly, queryString] = url.split('?');
  const queryParams = new URLSearchParams(queryString || '');
  if (config.params) {
    Object.entries(config.params).forEach(([k, v]) => {
      if (v !== undefined && v !== null) queryParams.set(k, String(v));
    });
  }

  let body = {};
  if (config.data) {
    try {
      body = typeof config.data === 'string' ? JSON.parse(config.data) : config.data;
    } catch {
      body = {};
    }
  }

  const state = getSandboxState();
  const session = getSandboxSession();
  const activeUser = session?.user || DEMO_USERS.STUDENT;
  const activeRole = session?.role || 'STUDENT';

  // ───────────────────────────────────────────────────────────────────────────
  // 1. DASHBOARD ENDPOINTS
  // ───────────────────────────────────────────────────────────────────────────
  if (pathOnly === '/dashboard/student') {
    const studentApps = state.applications.filter((a) => a.studentId === activeUser.id);
    const statusCounts = {
      APPLIED: 0,
      SHORTLISTED: 0,
      INTERVIEW: 0,
      SELECTED: 0,
      REJECTED: 0,
      WAITLISTED: 0,
    };
    studentApps.forEach((a) => {
      const st = (a.status || 'APPLIED').toUpperCase();
      if (statusCounts[st] !== undefined) statusCounts[st]++;
    });

    const upcomingInterviewApp = studentApps.find(
      (a) => a.interview && a.interview.status !== 'CANCELLED' && a.status !== 'REJECTED'
    );

    const data = {
      profile: {
        fullName: activeUser.name,
        department: activeUser.department,
        graduationYear: activeUser.graduationYear,
        cgpa: activeUser.cgpa,
        completion: { percentage: 85, missing: ['Add GitHub / Portfolio Link'] },
      },
      stats: {
        totalApplications: studentApps.length,
        upcomingInterviews: upcomingInterviewApp ? 1 : 0,
        shortlisted: statusCounts.SHORTLISTED,
        selected: statusCounts.SELECTED,
        availableOpportunities: state.opportunities.length,
        activeMentorship: state.mentorships.filter((m) => m.status === 'ACCEPTED').length,
        pendingReferrals: state.referralRequests.filter((r) => r.status === 'PENDING').length,
      },
      applicationStatusDistribution: statusCounts,
      applicationTrend: [
        { label: 'May', count: 1 },
        { label: 'Jun', count: 2 },
        { label: 'Jul', count: 1 },
        { label: 'Aug', count: 3 },
        { label: 'Sep', count: 4 },
        { label: 'Oct', count: studentApps.length },
      ],
      upcomingInterview: upcomingInterviewApp
        ? {
            applicationId: upcomingInterviewApp.id,
            company: upcomingInterviewApp.opportunity?.companyName || 'Google Cloud',
            role: upcomingInterviewApp.opportunity?.role || 'Software Engineer',
            round: upcomingInterviewApp.interview.round || 'Technical Round 2',
            title: upcomingInterviewApp.interview.title || 'Systems Architecture',
            date: upcomingInterviewApp.interview.date,
            startTime: upcomingInterviewApp.interview.startTime,
            endTime: upcomingInterviewApp.interview.endTime,
            mode: upcomingInterviewApp.interview.mode || 'ONLINE',
            meetingLink: upcomingInterviewApp.interview.meetingLink,
            location: upcomingInterviewApp.interview.location,
            instructions: upcomingInterviewApp.interview.instructions,
          }
        : null,
      recentApplications: studentApps.slice(0, 5).map((app) => ({
        id: app.id,
        company: app.opportunity?.companyName || 'Company',
        role: app.opportunity?.role || app.opportunity?.title || 'Role',
        type: app.opportunity?.type || 'PLACEMENT',
        status: app.status || 'APPLIED',
        appliedAt: app.appliedAt,
        interview: app.interview || null,
      })),
      recommendedOpportunities: state.opportunities.slice(0, 4).map((opp) => ({
        id: opp.id,
        title: opp.title,
        companyName: opp.companyName,
        companyLogo: opp.companyLogo,
        type: opp.type,
        location: opp.location,
        salary: opp.salary,
        applicationDeadline: opp.applicationDeadline,
      })),
      mentorship: {
        activeCount: state.mentorships.filter((m) => m.status === 'ACCEPTED').length,
        pendingCount: state.mentorships.filter((m) => m.status === 'PENDING').length,
        totalCount: state.mentorships.length,
      },
      referrals: {
        pendingCount: state.referralRequests.filter((r) => r.status === 'PENDING').length,
        acceptedCount: state.referralRequests.filter((r) => r.status === 'ACCEPTED').length,
        referredCount: state.referralRequests.filter((r) => r.status === 'REFERRED').length,
        totalCount: state.referralRequests.length,
      },
      recentNotifications: state.notifications.slice(0, 5),
      unreadNotificationsCount: state.notifications.filter((n) => !n.isRead).length,
      quickActions: [
        { label: 'Browse Opportunities', path: '/student/opportunities', icon: 'Briefcase' },
        { label: 'My Applications', path: '/student/applications', icon: 'FileText' },
        { label: 'Find a Mentor', path: '/student/mentors', icon: 'Compass' },
        { label: 'Alumni Referrals', path: '/student/referrals', icon: 'Award' },
        { label: 'Messages', path: '/student/chat', icon: 'MessageCircle' },
      ],
    };
    return mockResponse({ success: true, data }, config);
  }

  if (pathOnly === '/dashboard/alumni') {
    const alumniProfile = state.alumniProfiles[0];
    const mentorshipStatus = { PENDING: 1, ACCEPTED: 1, REJECTED: 0, COMPLETED: 2, CANCELLED: 0 };
    const referralStatus = { PENDING: 1, ACCEPTED: 0, REFERRED: 1, REJECTED: 0, COMPLETED: 0 };

    const data = {
      profile: {
        fullName: activeUser.name,
        currentCompany: alumniProfile.currentCompany,
        currentRole: alumniProfile.currentRole,
        verificationStatus: alumniProfile.verificationStatus,
        mentorshipAvailable: true,
        completion: { percentage: 95, missing: [] },
      },
      stats: {
        pendingMentorshipRequests: 1,
        activeMentorships: 2,
        completedMentorships: 4,
        totalReferralOpportunities: state.referrals.length,
        openReferralOpportunities: state.referrals.filter((r) => r.status === 'OPEN').length,
        totalReferralRequestsReceived: state.referralRequests.length,
        pendingReferralRequests: 1,
        referredRequests: 1,
        activeConversations: 3,
      },
      mentorshipDistribution: mentorshipStatus,
      referralDistribution: referralStatus,
      recentMentorshipRequests: state.mentorships.map((m) => ({
        id: m.id,
        studentName: m.student?.fullName || 'Student',
        department: m.student?.department || 'Engineering',
        message: m.requestMessage,
        areas: m.mentorshipAreas || [],
        createdAt: m.createdAt,
      })),
      recentReferralRequests: state.referralRequests.map((r) => ({
        id: r.id,
        studentName: r.student?.fullName || 'Student',
        role: r.opportunity?.role || 'Software Engineer',
        company: r.opportunity?.companyName || 'Google Cloud',
        status: r.status,
        resumeUrl: r.resumeUrl,
        createdAt: r.createdAt,
      })),
      recentConversations: [
        {
          id: 'conv_1',
          otherUserName: 'Alex Morgan',
          otherUserRole: 'STUDENT',
          lastMessage: 'Thank you for reviewing my resume, Priya!',
          lastMessageAt: new Date(Date.now() - 3600000).toISOString(),
        },
      ],
      recentNotifications: state.notifications.slice(0, 5),
      unreadNotificationsCount: state.notifications.filter((n) => !n.isRead).length,
      quickActions: [
        { label: 'Mentorship Hub', path: '/alumni/mentorship', icon: 'Handshake' },
        { label: 'Create Referral Opening', path: '/alumni/referrals/create', icon: 'PlusCircle' },
        { label: 'Manage Referrals', path: '/alumni/referrals', icon: 'Award' },
        { label: 'Direct Messages', path: '/alumni/chat', icon: 'MessageCircle' },
        { label: 'Update Profile', path: '/alumni/profile', icon: 'UserCircle' },
      ],
    };
    return mockResponse({ success: true, data }, config);
  }

  if (pathOnly === '/dashboard/tpo') {
    const opps = state.opportunities;
    const apps = state.applications;
    const statusCounts = {
      APPLIED: 0,
      SHORTLISTED: 0,
      INTERVIEW: 0,
      SELECTED: 0,
      REJECTED: 0,
      WAITLISTED: 0,
    };
    apps.forEach((a) => {
      const st = (a.status || 'APPLIED').toUpperCase();
      if (statusCounts[st] !== undefined) statusCounts[st]++;
    });

    const data = {
      stats: {
        totalOpportunities: opps.length,
        activeOpportunities: opps.filter((o) => o.status === 'PUBLISHED').length,
        totalApplications: apps.length * 12, // scaled for realistic campus volume showcase
        interviewsScheduled: 32,
        selectedStudents: 48,
        placementsCount: opps.filter((o) => o.type === 'PLACEMENT').length,
        internshipsCount: opps.filter((o) => o.type === 'INTERNSHIP').length,
        selectionRate: '26.8%',
      },
      placementVsInternship: {
        placements: opps.filter((o) => o.type === 'PLACEMENT').length,
        internships: opps.filter((o) => o.type === 'INTERNSHIP').length,
      },
      applicationStatusDistribution: {
        APPLIED: 84,
        SHORTLISTED: 42,
        INTERVIEW: 32,
        SELECTED: 48,
        REJECTED: 22,
        WAITLISTED: 8,
      },
      applicationTrend: [
        { label: 'May', count: 18 },
        { label: 'Jun', count: 34 },
        { label: 'Jul', count: 48 },
        { label: 'Aug', count: 62 },
        { label: 'Sep', count: 95 },
        { label: 'Oct', count: 124 },
      ],
      departmentAnalytics: [
        { department: 'Computer Science & Engineering', applied: 88, selected: 24 },
        { department: 'Information Technology', applied: 56, selected: 14 },
        { department: 'Electronics & Comm.', applied: 42, selected: 10 },
      ],
      topOpportunities: opps.slice(0, 5),
      recentOpportunities: opps.slice(0, 5),
      upcomingInterviews: [
        {
          applicationId: 'app_demo_1',
          studentName: 'Alex Morgan',
          company: 'Google Cloud',
          role: 'Software Development Engineer',
          round: 'Technical Round 2',
          date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
          startTime: '10:00 AM',
          mode: 'ONLINE',
        },
        {
          applicationId: 'app_demo_8',
          studentName: 'Sarah Jenkins',
          company: 'PwC India',
          role: 'Technology Consultant',
          round: 'Advisory Case Round',
          date: new Date(Date.now() + 2 * 86400000).toISOString().split('T')[0],
          startTime: '02:00 PM',
          mode: 'ONLINE',
        },
      ],
      quickActions: [
        { label: 'Create Opportunity', path: '/tpo/opportunities/create', icon: 'PlusCircle' },
        { label: 'Manage Campus Drives', path: '/tpo/opportunities', icon: 'Building2' },
        { label: 'Review Applicants', path: '/tpo/opportunities', icon: 'Users' },
        { label: 'View Notifications', path: '/notifications', icon: 'Bell' },
      ],
    };
    return mockResponse({ success: true, data }, config);
  }

  if (pathOnly === '/dashboard/admin') {
    const pendingAlumni = state.alumniProfiles.filter((a) => a.verificationStatus === 'PENDING');
    const verifiedAlumni = state.alumniProfiles.filter((a) => a.verificationStatus === 'VERIFIED');

    const data = {
      userCounts: {
        total: 284,
        students: 210,
        alumni: 64,
        tpo: 4,
        admin: 6,
      },
      alumniVerification: {
        verified: verifiedAlumni.length + 58,
        pending: pendingAlumni.length,
        rejected: 2,
      },
      systemHealth: {
        status: 'HEALTHY',
        uptime: '99.98%',
        storage: 'Isolated Showcase Sandbox',
        activeSessions: 14,
      },
      growthTrend: [
        { label: 'May', count: 32 },
        { label: 'Jun', count: 48 },
        { label: 'Jul', count: 65 },
        { label: 'Aug', count: 94 },
        { label: 'Sep', count: 142 },
        { label: 'Oct', count: 284 },
      ],
      recentPendingVerifications: pendingAlumni.map((a) => ({
        id: a.id,
        fullName: a.fullName,
        email: a.email,
        company: a.currentCompany,
        role: a.currentRole,
        graduationYear: a.graduationYear,
        department: a.department,
      })),
      recentActivityLogs: [
        {
          id: 'log_1',
          action: 'Alumni Profile Registered',
          user: 'Arjun Rao (Stripe)',
          timestamp: new Date(Date.now() - 3600000).toISOString(),
        },
        {
          id: 'log_2',
          action: 'Placement Drive Published',
          user: 'TPO Officer (Google Cloud)',
          timestamp: new Date(Date.now() - 7200000).toISOString(),
        },
        {
          id: 'log_3',
          action: 'Alumni Verified',
          user: 'Admin Office (Priya Sharma)',
          timestamp: new Date(Date.now() - 86400000).toISOString(),
        },
      ],
      quickActions: [
        { label: 'Verify Alumni', path: '/admin/alumni-verification', icon: 'ShieldCheck' },
        { label: 'Placement Drives', path: '/tpo/opportunities', icon: 'Building2' },
        { label: 'Campus Mentors', path: '/student/mentors', icon: 'Users' },
      ],
    };
    return mockResponse({ success: true, data }, config);
  }

  // ───────────────────────────────────────────────────────────────────────────
  // 2. OPPORTUNITY ENDPOINTS
  // ───────────────────────────────────────────────────────────────────────────
  if (pathOnly === '/opportunities' && method === 'get') {
    return mockResponse(
      {
        success: true,
        data: state.opportunities,
        opportunities: state.opportunities,
        total: state.opportunities.length,
        pagination: { page: 1, limit: 20, total: state.opportunities.length, totalPages: 1 },
      },
      config
    );
  }

  if (pathOnly === '/opportunities/manage' && method === 'get') {
    return mockResponse(
      {
        success: true,
        data: state.opportunities,
        opportunities: state.opportunities,
        total: state.opportunities.length,
      },
      config
    );
  }

  if (pathOnly === '/opportunities/stats' && method === 'get') {
    return mockResponse(
      {
        success: true,
        total: state.opportunities.length,
        published: state.opportunities.filter((o) => o.status === 'PUBLISHED').length,
        placements: state.opportunities.filter((o) => o.type === 'PLACEMENT').length,
        internships: state.opportunities.filter((o) => o.type === 'INTERNSHIP').length,
      },
      config
    );
  }

  // Single opportunity: /opportunities/:id
  const oppMatch = pathOnly.match(/^\/opportunities\/([^/]+)$/);
  if (oppMatch) {
    const oppId = oppMatch[1];
    if (method === 'get') {
      const opp = state.opportunities.find((o) => o.id === oppId || o._id === oppId) || state.opportunities[0];
      return mockResponse({ success: true, data: opp, opportunity: opp }, config);
    }
    if (method === 'put' || method === 'patch') {
      const idx = state.opportunities.findIndex((o) => o.id === oppId || o._id === oppId);
      if (idx !== -1) {
        state.opportunities[idx] = { ...state.opportunities[idx], ...body };
        saveSandboxState(state);
        return mockResponse({ success: true, data: state.opportunities[idx], message: 'Opportunity updated (Demo Mode)' }, config);
      }
    }
    if (method === 'delete') {
      state.opportunities = state.opportunities.filter((o) => o.id !== oppId && o._id !== oppId);
      saveSandboxState(state);
      return mockResponse({ success: true, message: 'Opportunity deleted (Demo Mode)' }, config);
    }
  }

  // Eligibility check: /opportunities/:id/eligibility
  const eligMatch = pathOnly.match(/^\/opportunities\/([^/]+)\/eligibility$/);
  if (eligMatch && method === 'get') {
    return mockResponse({ success: true, eligible: true, reasons: [] }, config);
  }

  // Apply to opportunity: /opportunities/:id/apply
  const applyMatch = pathOnly.match(/^\/opportunities\/([^/]+)\/apply$/);
  if (applyMatch && method === 'post') {
    const oppId = applyMatch[1];
    const opp = state.opportunities.find((o) => o.id === oppId || o._id === oppId) || state.opportunities[0];

    const newApp = {
      id: `app_demo_${Date.now()}`,
      _id: `app_demo_${Date.now()}`,
      studentId: activeUser.id,
      studentSnapshot: {
        fullName: activeUser.name,
        department: activeUser.department,
        cgpa: activeUser.cgpa || 8.85,
        graduationYear: activeUser.graduationYear || 2026,
        email: activeUser.email,
      },
      opportunityId: oppId,
      opportunity: opp,
      status: 'APPLIED',
      appliedAt: new Date().toISOString(),
    };

    state.applications.unshift(newApp);
    if (opp) {
      opp.applicantCount = (opp.applicantCount || 0) + 1;
    }
    saveSandboxState(state);

    return mockResponse(
      {
        success: true,
        data: newApp,
        application: newApp,
        message: 'Application submitted successfully (Demo Mode)',
      },
      config
    );
  }

  // Opportunity applicants for TPO: /opportunities/:id/applications
  const oppAppsMatch = pathOnly.match(/^\/opportunities\/([^/]+)\/applications$/);
  if (oppAppsMatch && method === 'get') {
    const oppId = oppAppsMatch[1];
    const matchingApps = state.applications.filter((a) => a.opportunityId === oppId);
    return mockResponse(
      {
        success: true,
        data: matchingApps,
        applications: matchingApps,
        total: matchingApps.length,
      },
      config
    );
  }

  // Create opportunity: POST /opportunities
  if (pathOnly === '/opportunities' && method === 'post') {
    const newOpp = {
      id: `opp_demo_${Date.now()}`,
      _id: `opp_demo_${Date.now()}`,
      ...body,
      status: body.status || 'PUBLISHED',
      applicantCount: 0,
      createdAt: new Date().toISOString(),
    };
    state.opportunities.unshift(newOpp);
    saveSandboxState(state);
    return mockResponse({ success: true, data: newOpp, message: 'Opportunity created (Demo Mode)' }, config);
  }

  // ───────────────────────────────────────────────────────────────────────────
  // 3. APPLICATION LIFECYCLE & INTERVIEW ENDPOINTS
  // ───────────────────────────────────────────────────────────────────────────
  if (pathOnly === '/applications/my' && method === 'get') {
    const myApps = state.applications.filter((a) => a.studentId === activeUser.id);
    return mockResponse(
      {
        success: true,
        data: myApps,
        applications: myApps,
        total: myApps.length,
      },
      config
    );
  }

  const appSingleMatch = pathOnly.match(/^\/applications\/([^/]+)$/);
  if (appSingleMatch && method === 'get') {
    const appId = appSingleMatch[1];
    const app = state.applications.find((a) => a.id === appId || a._id === appId) || state.applications[0];
    return mockResponse({ success: true, data: app, application: app }, config);
  }

  const withdrawMatch = pathOnly.match(/^\/applications\/([^/]+)\/withdraw$/);
  if (withdrawMatch && method === 'patch') {
    const appId = withdrawMatch[1];
    const app = state.applications.find((a) => a.id === appId || a._id === appId);
    if (app) {
      app.status = 'WITHDRAWN';
      saveSandboxState(state);
    }
    return mockResponse({ success: true, message: 'Application withdrawn (Demo Mode)' }, config);
  }

  const statusMatch = pathOnly.match(/^\/applications\/([^/]+)\/status$/);
  if (statusMatch && method === 'patch') {
    const appId = statusMatch[1];
    const app = state.applications.find((a) => a.id === appId || a._id === appId);
    if (app) {
      app.status = body.status || app.status;
      saveSandboxState(state);
    }
    return mockResponse({ success: true, data: app, message: 'Application status updated (Demo Mode)' }, config);
  }

  const interviewMatch = pathOnly.match(/^\/applications\/([^/]+)\/interview$/);
  if (interviewMatch) {
    const appId = interviewMatch[1];
    const app = state.applications.find((a) => a.id === appId || a._id === appId);
    if (app) {
      if (method === 'post' || method === 'put') {
        app.interview = { ...body };
        app.status = 'INTERVIEW';
        saveSandboxState(state);
        return mockResponse({ success: true, data: app, message: 'Interview scheduled (Demo Mode)' }, config);
      }
      if (method === 'delete') {
        app.interview = null;
        saveSandboxState(state);
        return mockResponse({ success: true, message: 'Interview cancelled (Demo Mode)' }, config);
      }
    }
  }

  // ───────────────────────────────────────────────────────────────────────────
  // 4. ALUMNI VERIFICATION & ADMIN ENDPOINTS
  // ───────────────────────────────────────────────────────────────────────────
  if (pathOnly === '/admin/alumni/pending' && method === 'get') {
    const pending = state.alumniProfiles.filter((a) => a.verificationStatus === 'PENDING');
    return mockResponse({ success: true, data: pending }, config);
  }

  const verifyMatch = pathOnly.match(/^\/admin\/alumni\/([^/]+)\/verification$/);
  if (verifyMatch && method === 'patch') {
    const alumniId = verifyMatch[1];
    const target = state.alumniProfiles.find((a) => a.id === alumniId || a._id === alumniId);
    if (target) {
      target.verificationStatus = body.status || 'VERIFIED';
      saveSandboxState(state);
    }
    return mockResponse(
      {
        success: true,
        message: `Alumni verification status updated to ${body.status || 'VERIFIED'} (Demo Mode)`,
      },
      config
    );
  }

  // ───────────────────────────────────────────────────────────────────────────
  // 5. MENTORSHIP & REFERRAL ENDPOINTS
  // ───────────────────────────────────────────────────────────────────────────
  if (pathOnly === '/mentorship/mentors' && method === 'get') {
    const verified = state.alumniProfiles.filter((a) => a.verificationStatus === 'VERIFIED');
    return mockResponse({ success: true, data: verified, mentors: verified }, config);
  }

  const mentorSingleMatch = pathOnly.match(/^\/mentorship\/mentors\/([^/]+)$/);
  if (mentorSingleMatch && method === 'get') {
    const mId = mentorSingleMatch[1];
    const mentor = state.alumniProfiles.find((a) => a.id === mId || a._id === mId) || state.alumniProfiles[0];
    return mockResponse({ success: true, data: mentor, mentor }, config);
  }

  if (pathOnly === '/mentorship/student' && method === 'get') {
    return mockResponse({ success: true, data: state.mentorships, mentorships: state.mentorships }, config);
  }

  if (pathOnly === '/mentorship/alumni/requests' && method === 'get') {
    return mockResponse({ success: true, data: state.mentorships, requests: state.mentorships }, config);
  }

  if (pathOnly === '/mentorship/request' && method === 'post') {
    const newM = {
      id: `mentor_req_${Date.now()}`,
      _id: `mentor_req_${Date.now()}`,
      studentId: activeUser.id,
      student: { fullName: activeUser.name, department: activeUser.department },
      alumniId: body.alumniId,
      mentorshipAreas: body.areas || ['Career Guidance'],
      requestMessage: body.message || 'Interested in mentorship',
      status: 'PENDING',
      createdAt: new Date().toISOString(),
    };
    state.mentorships.unshift(newM);
    saveSandboxState(state);
    return mockResponse({ success: true, data: newM, message: 'Mentorship request sent (Demo Mode)' }, config);
  }

  const mentorActionMatch = pathOnly.match(/^\/mentorship\/([^/]+)\/(accept|reject|complete|cancel)$/);
  if (mentorActionMatch && method === 'patch') {
    const mId = mentorActionMatch[1];
    const action = mentorActionMatch[2];
    const m = state.mentorships.find((item) => item.id === mId || item._id === mId);
    if (m) {
      if (action === 'accept') m.status = 'ACCEPTED';
      else if (action === 'reject') m.status = 'REJECTED';
      else if (action === 'complete') m.status = 'COMPLETED';
      else if (action === 'cancel') m.status = 'CANCELLED';
      saveSandboxState(state);
    }
    return mockResponse({ success: true, message: `Mentorship ${action}ed (Demo Mode)` }, config);
  }

  if (pathOnly === '/referrals/opportunities' && method === 'get') {
    return mockResponse({ success: true, data: state.referrals, opportunities: state.referrals }, config);
  }

  if (pathOnly === '/referrals/my-requests' && method === 'get') {
    return mockResponse({ success: true, data: state.referralRequests, requests: state.referralRequests }, config);
  }

  if (pathOnly === '/referrals/alumni/my' && method === 'get') {
    return mockResponse({ success: true, data: state.referrals, opportunities: state.referrals }, config);
  }

  if (pathOnly === '/referrals/alumni/requests' && method === 'get') {
    return mockResponse({ success: true, data: state.referralRequests, requests: state.referralRequests }, config);
  }

  if (pathOnly === '/referrals/opportunities' && method === 'post') {
    const newRef = {
      id: `ref_opp_${Date.now()}`,
      _id: `ref_opp_${Date.now()}`,
      alumniId: activeUser.id,
      companyName: body.companyName || 'Google Cloud',
      role: body.role || 'Software Engineer',
      location: body.location || 'Bengaluru',
      skills: body.skills || [],
      status: 'OPEN',
      description: body.description || '',
      createdAt: new Date().toISOString(),
    };
    state.referrals.unshift(newRef);
    saveSandboxState(state);
    return mockResponse({ success: true, data: newRef, message: 'Referral opening created (Demo Mode)' }, config);
  }

  const refReqMatch = pathOnly.match(/^\/referrals\/opportunities\/([^/]+)\/request$/);
  if (refReqMatch && method === 'post') {
    const newReq = {
      id: `ref_req_${Date.now()}`,
      _id: `ref_req_${Date.now()}`,
      opportunityId: refReqMatch[1],
      studentId: activeUser.id,
      student: { fullName: activeUser.name, department: activeUser.department },
      status: 'PENDING',
      notes: body.notes || '',
      resumeUrl: body.resumeUrl || 'https://example.com/demo/alex-morgan-resume.pdf',
      createdAt: new Date().toISOString(),
    };
    state.referralRequests.unshift(newReq);
    saveSandboxState(state);
    return mockResponse({ success: true, data: newReq, message: 'Referral request submitted (Demo Mode)' }, config);
  }

  // ───────────────────────────────────────────────────────────────────────────
  // 6. PROFILES, NOTIFICATIONS, CHAT, & AUTH
  // ───────────────────────────────────────────────────────────────────────────
  if (pathOnly === '/students/profile') {
    if (method === 'get') {
      return mockResponse({ success: true, data: state.studentProfile, profile: state.studentProfile }, config);
    }
    if (method === 'put') {
      state.studentProfile = { ...state.studentProfile, ...body };
      saveSandboxState(state);
      return mockResponse({ success: true, data: state.studentProfile, message: 'Profile updated (Demo Mode)' }, config);
    }
  }

  if (pathOnly === '/alumni/profile') {
    const profile = state.alumniProfiles[0];
    if (method === 'get') {
      return mockResponse({ success: true, data: profile, profile }, config);
    }
    if (method === 'put' || method === 'post') {
      state.alumniProfiles[0] = { ...profile, ...body };
      saveSandboxState(state);
      return mockResponse({ success: true, data: state.alumniProfiles[0], message: 'Profile updated (Demo Mode)' }, config);
    }
  }

  if (pathOnly === '/notifications' && method === 'get') {
    return mockResponse({ success: true, data: state.notifications, total: state.notifications.length }, config);
  }

  if (pathOnly === '/notifications/unread-count' && method === 'get') {
    const count = state.notifications.filter((n) => !n.isRead).length;
    return mockResponse({ success: true, count }, config);
  }

  if (pathOnly === '/notifications/read-all' && method === 'patch') {
    state.notifications.forEach((n) => (n.isRead = true));
    saveSandboxState(state);
    return mockResponse({ success: true, message: 'All notifications marked as read' }, config);
  }

  const notifReadMatch = pathOnly.match(/^\/notifications\/([^/]+)\/read$/);
  if (notifReadMatch && method === 'patch') {
    const notif = state.notifications.find((n) => n.id === notifReadMatch[1]);
    if (notif) notif.isRead = true;
    saveSandboxState(state);
    return mockResponse({ success: true }, config);
  }

  if (pathOnly === '/auth/me' && method === 'get') {
    return mockResponse({ success: true, user: activeUser }, config);
  }

  if (pathOnly === '/auth/demo-login') {
    // Keep backend semantics: reporting disabled in production
    return mockResponse({ enabled: false, message: 'Backend demo login is disabled. Client demo sandbox active.' }, config);
  }

  if (pathOnly.startsWith('/chat')) {
    return mockResponse(
      {
        success: true,
        data: [],
        conversations: [],
        messages: [],
      },
      config
    );
  }

  // Fallback for any other internal endpoint
  return mockResponse({ success: true, data: [] }, config);
};
