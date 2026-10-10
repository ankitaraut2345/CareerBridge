const mongoose = require('mongoose');
const User = require('../models/user.model');
const StudentProfile = require('../models/StudentProfile.model');
const AlumniProfile = require('../models/AlumniProfile.model');
const Opportunity = require('../models/Opportunity.model');
const Application = require('../models/Application.model');
const Mentorship = require('../models/Mentorship.model');
const ReferralOpportunity = require('../models/ReferralOpportunity.model');
const ReferralRequest = require('../models/ReferralRequest.model');
const Conversation = require('../models/Conversation.model');
const Message = require('../models/Message.model');
const Notification = require('../models/Notification.model');

const { findProfileByUserId: findStudentProfile } = require('./studentProfileStore.service');
const { findProfileByUserId: findAlumniProfile } = require('./alumniProfileStore.service');
const { findApplicationsByStudent } = require('./applicationStore.service');
const { findOpportunities, getOpportunityStats } = require('./opportunityStore.service');
const { getStudentMentorships, getAlumniMentorships } = require('./mentorshipStore.service');
const { getStudentReferralRequests, getAlumniReferralOpportunities, getAllIncomingRequestsForAlumni } = require('./referralStore.service');
const { getConversationsForUser } = require('./chatStore.service');
const { getNotificationsForUser, getUnreadCountForUser } = require('./notificationStore.service');

const isDbConnected = () => mongoose.connection.readyState === 1;

/**
 * Standard Month Names helper for grouping trends (last 6 months)
 */
const getLast6MonthsLabels = () => {
  const months = [];
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const label = d.toLocaleString('default', { month: 'short' });
    const year = d.getFullYear();
    const key = `${year}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    months.push({ key, label, count: 0 });
  }
  return months;
};

/**
 * Calculate Student Profile completion percentage
 */
const calculateStudentProfileCompletion = (profile) => {
  if (!profile) return { percentage: 20, missing: ['Academic Details', 'Skills', 'Resume', 'Bio'] };
  let score = 0;
  const missing = [];

  // Basic info (20)
  if (profile.fullName && profile.phone && profile.location) {
    score += 20;
  } else {
    missing.push('Basic Contact Info');
  }

  // Academic Details (25)
  if (profile.department && profile.graduationYear && profile.cgpa !== undefined && profile.cgpa !== null) {
    score += 25;
  } else {
    missing.push('Academic Details (CGPA, Branch)');
  }

  // Skills (20)
  if (Array.isArray(profile.skills) && profile.skills.length >= 3) {
    score += 20;
  } else {
    missing.push('Add at least 3 skills');
  }

  // Bio & Interests (15)
  if (profile.bio && (profile.careerInterests?.length > 0 || profile.preferredRoles?.length > 0)) {
    score += 15;
  } else {
    missing.push('Bio & Career Interests');
  }

  // Resume (20)
  if (profile.resume && profile.resume.url) {
    score += 20;
  } else {
    missing.push('Upload PDF Resume');
  }

  return { percentage: Math.min(100, score), missing };
};

/**
 * Calculate Alumni Profile completion percentage
 */
const calculateAlumniProfileCompletion = (profile) => {
  if (!profile) return { percentage: 20, missing: ['Professional Details', 'Mentorship Settings', 'Bio & Skills'] };
  let score = 0;
  const missing = [];

  // Basic Info (20)
  if (profile.fullName && profile.phone && profile.location) {
    score += 20;
  } else {
    missing.push('Contact Information');
  }

  // Education (20)
  if (profile.department && profile.graduationYear) {
    score += 20;
  } else {
    missing.push('Graduation Details');
  }

  // Professional Role (25)
  if (profile.currentCompany && profile.currentRole) {
    score += 25;
  } else {
    missing.push('Current Organization & Role');
  }

  // Bio & Skills (20)
  if (profile.bio && Array.isArray(profile.skills) && profile.skills.length > 0) {
    score += 20;
  } else {
    missing.push('Professional Bio & Key Skills');
  }

  // Mentorship Setup (15)
  if (profile.mentorshipAvailable !== undefined && Array.isArray(profile.mentorshipAreas) && profile.mentorshipAreas.length > 0) {
    score += 15;
  } else {
    missing.push('Mentorship Availability & Areas');
  }

  return { percentage: Math.min(100, score), missing };
};

// ─────────────────────────────────────────────────────────────────────────────
// 1. STUDENT DASHBOARD
// ─────────────────────────────────────────────────────────────────────────────
const getStudentDashboardData = async (userId) => {
  const sId = String(userId);

  // 1. Student Profile
  const profile = await findStudentProfile(sId);
  const completion = calculateStudentProfileCompletion(profile);

  // 2. Applications submitted by this student
  const appResult = await findApplicationsByStudent(sId, { limit: 50 });
  const allApplications = appResult.applications || [];

  // Status Distribution
  const statusCounts = {
    APPLIED: 0,
    SHORTLISTED: 0,
    INTERVIEW: 0,
    SELECTED: 0,
    REJECTED: 0,
    WAITLISTED: 0,
  };

  // Monthly trends for last 6 months
  const trendBuckets = getLast6MonthsLabels();

  allApplications.forEach((app) => {
    const st = (app.status || 'APPLIED').toUpperCase();
    if (statusCounts[st] !== undefined) {
      statusCounts[st]++;
    }

    // Trend grouping
    const date = new Date(app.appliedAt || app.createdAt || Date.now());
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    const bucket = trendBuckets.find((b) => b.key === key);
    if (bucket) {
      bucket.count++;
    }
  });

  // Recent 5 applications
  const recentApplications = allApplications.slice(0, 5).map((app) => ({
    id: app._id || app.id,
    company: app.opportunity?.companyName || 'Company',
    role: app.opportunity?.role || app.opportunity?.title || 'Role',
    type: app.opportunity?.type || 'PLACEMENT',
    status: app.status || 'APPLIED',
    appliedAt: app.appliedAt || app.createdAt,
    interview: app.interview || null,
  }));

  // Nearest upcoming interview
  const upcomingInterviewApp = allApplications.find(
    (app) => app.interview && app.interview.status !== 'CANCELLED' && app.status !== 'REJECTED'
  );
  const upcomingInterview = upcomingInterviewApp
    ? {
        applicationId: upcomingInterviewApp._id || upcomingInterviewApp.id,
        company: upcomingInterviewApp.opportunity?.companyName || 'Company',
        role: upcomingInterviewApp.opportunity?.role || upcomingInterviewApp.opportunity?.title || 'Role',
        round: upcomingInterviewApp.interview.round || 'Interview Round',
        title: upcomingInterviewApp.interview.title || 'Technical Interview',
        date: upcomingInterviewApp.interview.date,
        startTime: upcomingInterviewApp.interview.startTime,
        endTime: upcomingInterviewApp.interview.endTime,
        mode: upcomingInterviewApp.interview.mode || 'ONLINE',
        meetingLink: upcomingInterviewApp.interview.meetingLink,
        location: upcomingInterviewApp.interview.location,
        instructions: upcomingInterviewApp.interview.instructions,
      }
    : null;

  // 3. Recommended / Available Opportunities
  const oppResult = await findOpportunities({
    department: profile?.department || '',
    limit: 4,
    status: 'PUBLISHED',
  });
  const recommendedOpportunities = (oppResult.opportunities || []).slice(0, 4).map((opp) => ({
    id: opp._id || opp.id,
    title: opp.title,
    companyName: opp.companyName,
    companyLogo: opp.companyLogo,
    type: opp.type,
    location: opp.location,
    salary: opp.salary || opp.stipend || 'Competitive',
    applicationDeadline: opp.applicationDeadline,
  }));

  const oppStats = await getOpportunityStats();

  // 4. Mentorship
  const mentorships = await getStudentMentorships(sId);
  const activeMentorshipsCount = mentorships.filter((m) => m.status === 'ACCEPTED').length;
  const pendingMentorshipsCount = mentorships.filter((m) => m.status === 'PENDING').length;

  // 5. Referrals
  const referralRequests = await getStudentReferralRequests(sId);
  const pendingReferralsCount = referralRequests.filter((r) => r.status === 'PENDING').length;
  const acceptedReferralsCount = referralRequests.filter((r) => r.status === 'ACCEPTED').length;
  const referredReferralsCount = referralRequests.filter((r) => r.status === 'REFERRED').length;

  // 6. Notifications
  const notifResult = await getNotificationsForUser(sId, { limit: 5 });
  const unreadCount = await getUnreadCountForUser(sId);

  return {
    profile: {
      fullName: profile?.fullName || 'Student',
      department: profile?.department || 'Engineering',
      graduationYear: profile?.graduationYear || null,
      cgpa: profile?.cgpa || null,
      completion,
    },
    stats: {
      totalApplications: allApplications.length,
      upcomingInterviews: upcomingInterview ? 1 : 0,
      shortlisted: statusCounts.SHORTLISTED,
      selected: statusCounts.SELECTED,
      availableOpportunities: oppStats.published || 0,
      activeMentorship: activeMentorshipsCount,
      pendingReferrals: pendingReferralsCount,
    },
    applicationStatusDistribution: statusCounts,
    applicationTrend: trendBuckets.map((t) => ({ label: t.label, count: t.count })),
    upcomingInterview,
    recentApplications,
    recommendedOpportunities,
    mentorship: {
      activeCount: activeMentorshipsCount,
      pendingCount: pendingMentorshipsCount,
      totalCount: mentorships.length,
    },
    referrals: {
      pendingCount: pendingReferralsCount,
      acceptedCount: acceptedReferralsCount,
      referredCount: referredReferralsCount,
      totalCount: referralRequests.length,
    },
    recentNotifications: notifResult.data || [],
    unreadNotificationsCount: unreadCount,
    quickActions: [
      { label: 'Browse Opportunities', path: '/student/opportunities', icon: 'Briefcase' },
      { label: 'My Applications', path: '/student/applications', icon: 'FileText' },
      { label: 'Find a Mentor', path: '/student/mentors', icon: 'Compass' },
      { label: 'Alumni Referrals', path: '/student/referrals', icon: 'Award' },
      { label: 'Messages', path: '/student/chat', icon: 'MessageCircle' },
    ],
  };
};

// ─────────────────────────────────────────────────────────────────────────────
// 2. ALUMNI DASHBOARD
// ─────────────────────────────────────────────────────────────────────────────
const getAlumniDashboardData = async (userId) => {
  const aId = String(userId);

  // 1. Alumni Profile & Verification
  const profile = await findAlumniProfile(aId);
  const completion = calculateAlumniProfileCompletion(profile);

  // 2. Mentorship
  const allMentorships = await getAlumniMentorships(aId);
  const mentorshipStatus = {
    PENDING: 0,
    ACCEPTED: 0,
    REJECTED: 0,
    COMPLETED: 0,
    CANCELLED: 0,
  };
  allMentorships.forEach((m) => {
    const st = (m.status || 'PENDING').toUpperCase();
    if (mentorshipStatus[st] !== undefined) {
      mentorshipStatus[st]++;
    }
  });

  const recentMentorshipRequests = allMentorships
    .filter((m) => m.status === 'PENDING')
    .slice(0, 5)
    .map((m) => ({
      id: m._id || m.id,
      studentName: m.student?.fullName || m.student?.name || 'Student',
      department: m.student?.department || 'Engineering',
      message: m.requestMessage || 'Interested in mentorship',
      areas: m.mentorshipAreas || [],
      createdAt: m.createdAt,
    }));

  // 3. Referrals
  const myOpportunities = await getAlumniReferralOpportunities(aId);
  const openOpportunitiesCount = myOpportunities.filter((o) => o.status === 'OPEN').length;

  const incomingRequests = await getAllIncomingRequestsForAlumni(aId);
  const referralStatus = {
    PENDING: 0,
    ACCEPTED: 0,
    REFERRED: 0,
    REJECTED: 0,
    COMPLETED: 0,
  };
  incomingRequests.forEach((r) => {
    const st = (r.status || 'PENDING').toUpperCase();
    if (referralStatus[st] !== undefined) {
      referralStatus[st]++;
    }
  });

  const recentReferralRequests = incomingRequests.slice(0, 5).map((r) => ({
    id: r._id || r.id,
    studentName: r.student?.fullName || r.student?.name || 'Student',
    role: r.opportunity?.role || 'Engineer',
    company: r.opportunity?.companyName || profile?.currentCompany || 'Company',
    status: r.status,
    resumeUrl: r.resumeUrl,
    createdAt: r.createdAt,
  }));

  // 4. Chat & Conversations
  const conversations = await getConversationsForUser(aId);
  const recentConversations = (conversations || []).slice(0, 4).map((c) => ({
    id: c._id || c.id,
    otherUserName: c.otherUser?.name || 'Student',
    otherUserRole: c.otherUser?.role || 'STUDENT',
    lastMessage: c.lastMessage || 'Connected on CareerBridge',
    lastMessageAt: c.lastMessageAt || c.updatedAt,
  }));

  // 5. Notifications
  const notifResult = await getNotificationsForUser(aId, { limit: 5 });
  const unreadCount = await getUnreadCountForUser(aId);

  return {
    profile: {
      fullName: profile?.fullName || 'Alumni',
      currentCompany: profile?.currentCompany || 'Organization',
      currentRole: profile?.currentRole || 'Professional',
      verificationStatus: profile?.verificationStatus || 'VERIFIED',
      mentorshipAvailable: profile?.mentorshipAvailable ?? true,
      completion,
    },
    stats: {
      pendingMentorshipRequests: mentorshipStatus.PENDING,
      activeMentorships: mentorshipStatus.ACCEPTED,
      completedMentorships: mentorshipStatus.COMPLETED,
      totalReferralOpportunities: myOpportunities.length,
      openReferralOpportunities: openOpportunitiesCount,
      totalReferralRequestsReceived: incomingRequests.length,
      pendingReferralRequests: referralStatus.PENDING,
      referredRequests: referralStatus.REFERRED,
      activeConversations: (conversations || []).length,
    },
    mentorshipDistribution: mentorshipStatus,
    referralDistribution: referralStatus,
    recentMentorshipRequests,
    recentReferralRequests,
    recentConversations,
    recentNotifications: notifResult.data || [],
    unreadNotificationsCount: unreadCount,
    quickActions: [
      { label: 'Mentorship Hub', path: '/alumni/mentorship', icon: 'Handshake' },
      { label: 'Create Referral Opening', path: '/alumni/referrals/create', icon: 'PlusCircle' },
      { label: 'Manage Referrals', path: '/alumni/referrals', icon: 'Award' },
      { label: 'Direct Messages', path: '/alumni/chat', icon: 'MessageCircle' },
      { label: 'Update Profile', path: '/alumni/profile', icon: 'UserCircle' },
    ],
  };
};

// ─────────────────────────────────────────────────────────────────────────────
// 3. TPO DASHBOARD
// ─────────────────────────────────────────────────────────────────────────────
const getTpoDashboardData = async (user) => {
  const userRole = user.role;
  const tpoId = String(user.id);

  // 1. Opportunities & Drives
  const oppStats = await getOpportunityStats({
    userRole,
    tpoUserId: userRole === 'TPO' ? tpoId : null,
  });

  const oppResult = await findOpportunities({
    limit: 100,
    userRole,
  });
  const allOpps = oppResult.opportunities || [];
  const recentOpportunities = allOpps.slice(0, 5).map((o) => ({
    id: o._id || o.id,
    title: o.title,
    companyName: o.companyName,
    type: o.type,
    status: o.status,
    location: o.location,
    applicationDeadline: o.applicationDeadline,
    applicantCount: o.applicantCount || 0,
  }));

  // 2. Application Pipeline Analytics
  let allApplications = [];
  if (isDbConnected()) {
    try {
      allApplications = await Application.find()
        .populate('opportunityId', 'title companyName type createdBy')
        .lean();
    } catch {
      allApplications = [];
    }
  } else {
    const { memoryApplications } = require('./applicationStore.service');
    allApplications = [...(memoryApplications || [])];
  }

  // Filter for this TPO if TPO role
  let tpoApplications = allApplications;
  if (userRole === 'TPO') {
    tpoApplications = allApplications.filter((a) => {
      const opp = a.opportunity || a.opportunityId;
      return !opp || !opp.createdBy || String(opp.createdBy) === tpoId;
    });
  }

  // Application Status Distribution
  const statusCounts = {
    APPLIED: 0,
    SHORTLISTED: 0,
    INTERVIEW: 0,
    SELECTED: 0,
    REJECTED: 0,
    WAITLISTED: 0,
  };

  // Trend buckets (last 6 months)
  const trendBuckets = getLast6MonthsLabels();

  // Department analytics
  const departmentCounts = {};

  // Upcoming interviews
  const upcomingInterviews = [];

  tpoApplications.forEach((app) => {
    const st = (app.status || 'APPLIED').toUpperCase();
    if (statusCounts[st] !== undefined) {
      statusCounts[st]++;
    }

    // Trend
    const date = new Date(app.appliedAt || app.createdAt || Date.now());
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    const bucket = trendBuckets.find((b) => b.key === key);
    if (bucket) {
      bucket.count++;
    }

    // Department breakdown
    const dept =
      app.studentSnapshot?.department ||
      app.studentProfileSnapshot?.department ||
      'Other Department';
    if (!departmentCounts[dept]) {
      departmentCounts[dept] = { department: dept, applied: 0, selected: 0 };
    }
    departmentCounts[dept].applied++;
    if (st === 'SELECTED') {
      departmentCounts[dept].selected++;
    }

    // Upcoming interview collection
    if (app.interview && app.interview.status !== 'CANCELLED' && upcomingInterviews.length < 5) {
      upcomingInterviews.push({
        applicationId: app._id || app.id,
        studentName: app.studentSnapshot?.fullName || app.studentProfileSnapshot?.fullName || 'Student',
        company: app.opportunity?.companyName || app.opportunityId?.companyName || 'Company',
        role: app.opportunity?.role || app.opportunityId?.title || 'Drive',
        round: app.interview.round || 'Interview Round',
        date: app.interview.date,
        startTime: app.interview.startTime,
        mode: app.interview.mode || 'ONLINE',
      });
    }
  });

  const totalApplications = tpoApplications.length;
  const selectedCount = statusCounts.SELECTED;
  const selectionRate =
    totalApplications > 0
      ? `${((selectedCount / totalApplications) * 100).toFixed(1)}%`
      : '0.0%';

  // Top hiring / active opportunities by applicants
  const topOpportunities = [...recentOpportunities]
    .sort((a, b) => (b.applicantCount || 0) - (a.applicantCount || 0))
    .slice(0, 5);

  return {
    stats: {
      totalOpportunities: oppStats.total || allOpps.length,
      activeOpportunities: oppStats.published || 0,
      totalApplications,
      interviewsScheduled: statusCounts.INTERVIEW + upcomingInterviews.length,
      selectedStudents: selectedCount,
      placementsCount: oppStats.placements || 0,
      internshipsCount: oppStats.internships || 0,
      selectionRate,
    },
    placementVsInternship: {
      placements: oppStats.placements || 0,
      internships: oppStats.internships || 0,
    },
    applicationStatusDistribution: statusCounts,
    applicationTrend: trendBuckets.map((t) => ({ label: t.label, count: t.count })),
    departmentAnalytics: Object.values(departmentCounts).slice(0, 6),
    topOpportunities,
    recentOpportunities,
    upcomingInterviews,
    quickActions: [
      { label: 'Create Opportunity', path: '/tpo/opportunities/create', icon: 'PlusCircle' },
      { label: 'Manage Campus Drives', path: '/tpo/opportunities', icon: 'Building2' },
      { label: 'Review Applicants', path: '/tpo/opportunities', icon: 'Users' },
      { label: 'View Notifications', path: '/notifications', icon: 'Bell' },
    ],
  };
};

// ─────────────────────────────────────────────────────────────────────────────
// 4. ADMIN DASHBOARD
// ─────────────────────────────────────────────────────────────────────────────
const getAdminDashboardData = async () => {
  let allUsers = [];

  if (isDbConnected()) {
    try {
      allUsers = await User.find().select('-password').lean();
    } catch {
      allUsers = [];
    }
  } else {
    const { memoryUsers } = require('./userStore.service');
    allUsers = [...(memoryUsers || [])];
  }

  // User Stats & Roles Breakdown
  const roleCounts = {
    STUDENT: 0,
    ALUMNI: 0,
    TPO: 0,
    ADMIN: 0,
  };

  let verifiedAlumni = 0;
  let pendingAlumni = 0;
  let rejectedAlumni = 0;

  // User Growth trend (last 6 months)
  const growthBuckets = getLast6MonthsLabels();

  allUsers.forEach((u) => {
    const r = (u.role || 'STUDENT').toUpperCase();
    if (roleCounts[r] !== undefined) {
      roleCounts[r]++;
    }

    if (r === 'ALUMNI') {
      const v = (u.verificationStatus || 'PENDING').toUpperCase();
      if (v === 'VERIFIED') verifiedAlumni++;
      else if (v === 'PENDING') pendingAlumni++;
      else if (v === 'REJECTED') rejectedAlumni++;
    }

    // Growth
    const d = new Date(u.createdAt || Date.now());
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const b = growthBuckets.find((item) => item.key === key);
    if (b) {
      b.count++;
    }
  });

  // Platform Metrics
  const oppStats = await getOpportunityStats();

  let applicationsCount = 0;
  let mentorshipCount = 0;
  let referralOppCount = 0;
  let referralReqCount = 0;
  let notificationsCount = 0;

  if (isDbConnected()) {
    try {
      [applicationsCount, mentorshipCount, referralOppCount, referralReqCount, notificationsCount] = await Promise.all([
        Application.countDocuments(),
        Mentorship.countDocuments(),
        ReferralOpportunity.countDocuments(),
        ReferralRequest.countDocuments(),
        Notification.countDocuments(),
      ]);
    } catch {
      // Fallback
    }
  } else {
    const { memoryApplications } = require('./applicationStore.service');
    const { memoryMentorships } = require('./mentorshipStore.service');
    const { memoryReferralOpportunities, memoryReferralRequests } = require('./referralStore.service');
    const { memoryNotifications } = require('./notificationStore.service');
    applicationsCount = (memoryApplications || []).length;
    mentorshipCount = (memoryMentorships || []).length;
    referralOppCount = (memoryReferralOpportunities || []).length;
    referralReqCount = (memoryReferralRequests || []).length;
    notificationsCount = (memoryNotifications || []).length;
  }

  // Recent Activity Feed
  const recentActivity = [
    {
      id: 'act_1',
      title: 'Institutional Placement Cycle Active',
      desc: `${oppStats.published || 0} active drives currently open for student applications`,
      time: 'Real-time',
      type: 'opportunity',
    },
    {
      id: 'act_2',
      title: 'Alumni Network Registry',
      desc: `${verifiedAlumni} verified alumni mentors active across global tech organizations`,
      time: 'Live',
      type: 'alumni',
    },
    {
      id: 'act_3',
      title: 'Student Applications Pipeline',
      desc: `${applicationsCount} applications submitted across campus drives and internships`,
      time: 'Updated',
      type: 'application',
    },
    {
      id: 'act_4',
      title: 'Peer Mentorship & Guidance',
      desc: `${mentorshipCount} 1-on-1 career mentorship engagements established`,
      time: 'Platform',
      type: 'mentorship',
    },
  ];

  return {
    stats: {
      totalUsers: allUsers.length,
      studentsCount: roleCounts.STUDENT,
      alumniCount: roleCounts.ALUMNI,
      verifiedAlumniCount: verifiedAlumni,
      pendingAlumniCount: pendingAlumni,
      tpoUsersCount: roleCounts.TPO,
      adminUsersCount: roleCounts.ADMIN,
    },
    alumniVerification: {
      verified: verifiedAlumni,
      pending: pendingAlumni,
      rejected: rejectedAlumni,
    },
    roleDistribution: roleCounts,
    userGrowth: growthBuckets.map((b) => ({ label: b.label, count: b.count })),
    platformActivity: {
      totalOpportunities: oppStats.total || 0,
      totalApplications: applicationsCount,
      totalMentorships: mentorshipCount,
      totalReferralOpportunities: referralOppCount,
      totalReferralRequests: referralReqCount,
      totalNotifications: notificationsCount,
    },
    recentActivity,
    quickActions: [
      { label: 'Review Alumni Verification', path: '/admin/alumni-verification', icon: 'ShieldCheck' },
      { label: 'Oversee Campus Drives', path: '/tpo/opportunities', icon: 'Building2' },
      { label: 'View System Notifications', path: '/notifications', icon: 'Bell' },
    ],
  };
};

module.exports = {
  getStudentDashboardData,
  getAlumniDashboardData,
  getTpoDashboardData,
  getAdminDashboardData,
};
