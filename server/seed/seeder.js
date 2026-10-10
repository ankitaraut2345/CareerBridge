/**
 * CareerBridge Phase 15 — Idempotent Database Seeder
 * Connects to MongoDB, validates execution environment, and idempotently
 * creates/updates realistic demo records for all system entities.
 */

require('dotenv').config();
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
const { Notification, NOTIFICATION_TYPES } = require('../models/Notification.model');

const {
  USERS_SEED,
  STUDENT_PROFILES_SEED,
  ALUMNI_PROFILES_SEED,
  OPPORTUNITIES_SEED,
  APPLICATIONS_SEED,
  MENTORSHIPS_SEED,
  REFERRAL_OPPORTUNITIES_SEED,
  REFERRAL_REQUESTS_SEED,
  CONVERSATIONS_SEED,
  NOTIFICATIONS_SEED,
} = require('./seedData');

/**
 * Validates environment safety.
 * Strictly prevents running against production environments.
 */
const validateEnvironment = () => {
  const env = (process.env.NODE_ENV || 'development').toLowerCase();
  if (env === 'production') {
    throw new Error('🚫 SAFETY BLOCK: Database seeding is strictly disabled in production environments!');
  }
};

/**
 * Main Seeding Routine
 */
const seedDatabase = async ({ closeOnFinish = true } = {}) => {
  validateEnvironment();

  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/careerbridge';
  console.log('\n======================================================');
  console.log('  🌱 CAREERBRIDGE PHASE 15 — DATABASE SEEDER');
  console.log('======================================================');
  console.log(`📡 Connecting to MongoDB: ${uri.replace(/\/\/.*@/, '//<credentials>@')}`);

  let isConnected = mongoose.connection.readyState === 1;
  if (!isConnected) {
    try {
      await mongoose.connect(uri, { serverSelectionTimeoutMS: 6000 });
      console.log('✅ MongoDB Connected successfully.');
    } catch (err) {
      console.error(`❌ MongoDB Connection Failed: ${err.message}`);
      throw err;
    }
  }

  const stats = {
    users: { created: 0, updated: 0, total: 0 },
    studentProfiles: { created: 0, updated: 0, total: 0 },
    alumniProfiles: { created: 0, updated: 0, total: 0 },
    opportunities: { created: 0, updated: 0, total: 0 },
    applications: { created: 0, updated: 0, total: 0 },
    mentorships: { created: 0, updated: 0, total: 0 },
    referralOpportunities: { created: 0, updated: 0, total: 0 },
    referralRequests: { created: 0, updated: 0, total: 0 },
    conversations: { created: 0, updated: 0, total: 0 },
    messages: { created: 0, updated: 0, total: 0 },
    notifications: { created: 0, updated: 0, total: 0 },
  };

  // Maps for stable internal foreign key lookups
  const userMap = new Map(); // key -> _id
  const studentProfileMap = new Map(); // key -> profile
  const alumniProfileMap = new Map(); // key -> profile
  const oppMap = new Map(); // key -> _id
  const refOppMap = new Map(); // key -> _id
  const mentorshipMap = new Map(); // key -> _id
  const referralRequestMap = new Map(); // key -> _id

  try {
    // ─── 1. SEED USERS ────────────────────────────────────────────────────────
    console.log('\n[1/10] Seeding User Accounts (Students, Alumni, TPO, Admin)...');
    for (const u of USERS_SEED) {
      const email = u.email.toLowerCase();
      let doc = await User.findOne({ email });
      if (!doc) {
        doc = await User.create({
          name: u.name,
          email,
          password: u.password, // Pre-hashed with bcrypt in seedData
          role: u.role,
          verificationStatus: u.verificationStatus,
          isActive: u.isActive,
        });
        stats.users.created++;
      } else {
        doc.name = u.name;
        doc.role = u.role;
        doc.verificationStatus = u.verificationStatus;
        doc.isActive = u.isActive;
        await doc.save();
        stats.users.updated++;
      }
      userMap.set(u.key, doc._id);
    }
    stats.users.total = await User.countDocuments();
    console.log(`   ✓ Users processed: ${stats.users.created} created, ${stats.users.updated} updated (Total in DB: ${stats.users.total})`);

    // ─── 2. SEED STUDENT PROFILES ─────────────────────────────────────────────
    console.log('\n[2/10] Seeding Student Profiles...');
    for (const p of STUDENT_PROFILES_SEED) {
      const userId = userMap.get(p.userKey);
      if (!userId) continue;

      let profile = await StudentProfile.findOne({ userId });
      const payload = {
        userId,
        fullName: p.fullName,
        phone: p.phone,
        location: p.location,
        department: p.department,
        college: p.college,
        graduationYear: p.graduationYear,
        cgpa: p.cgpa,
        backlogs: p.backlogs,
        bio: p.bio,
        skills: p.skills || [],
        projects: p.projects || [],
        certifications: p.certifications || [],
        careerInterests: p.careerInterests || [],
        preferredRoles: p.preferredRoles || [],
        preferredIndustries: p.preferredIndustries || [],
        preferredLocations: p.preferredLocations || [],
        resume: p.resume || undefined,
      };

      if (!profile) {
        profile = await StudentProfile.create(payload);
        stats.studentProfiles.created++;
      } else {
        Object.assign(profile, payload);
        await profile.save();
        stats.studentProfiles.updated++;
      }
      studentProfileMap.set(p.userKey, profile);
    }
    stats.studentProfiles.total = await StudentProfile.countDocuments();
    console.log(`   ✓ Student Profiles: ${stats.studentProfiles.created} created, ${stats.studentProfiles.updated} updated (Total in DB: ${stats.studentProfiles.total})`);

    // ─── 3. SEED ALUMNI PROFILES ──────────────────────────────────────────────
    console.log('\n[3/10] Seeding Alumni Profiles (Verified & Pending)...');
    for (const a of ALUMNI_PROFILES_SEED) {
      const userId = userMap.get(a.userKey);
      if (!userId) continue;

      let profile = await AlumniProfile.findOne({ userId });
      const payload = {
        userId,
        fullName: a.fullName,
        phone: a.phone,
        location: a.location,
        graduationYear: a.graduationYear,
        department: a.department,
        college: a.college,
        currentCompany: a.currentCompany,
        currentRole: a.currentRole,
        industry: a.industry,
        yearsOfExperience: a.yearsOfExperience,
        bio: a.bio,
        skills: a.skills || [],
        careerInterests: a.careerInterests || [],
        previousCompanies: a.previousCompanies || [],
        linkedinUrl: a.linkedinUrl,
        githubUrl: a.githubUrl,
        mentorshipAvailable: a.mentorshipAvailable,
        mentorshipAreas: a.mentorshipAreas || [],
        verificationStatus: a.verificationStatus,
      };

      if (!profile) {
        profile = await AlumniProfile.create(payload);
        stats.alumniProfiles.created++;
      } else {
        Object.assign(profile, payload);
        await profile.save();
        stats.alumniProfiles.updated++;
      }
      alumniProfileMap.set(a.userKey, profile);
    }
    stats.alumniProfiles.total = await AlumniProfile.countDocuments();
    console.log(`   ✓ Alumni Profiles: ${stats.alumniProfiles.created} created, ${stats.alumniProfiles.updated} updated (Total in DB: ${stats.alumniProfiles.total})`);

    // ─── 4. SEED OPPORTUNITIES ────────────────────────────────────────────────
    console.log('\n[4/10] Seeding Opportunities (Placements & Internships)...');
    const tpoUserId = userMap.get('demo_tpo');
    for (const opp of OPPORTUNITIES_SEED) {
      let doc = await Opportunity.findOne({
        companyName: opp.companyName,
        title: opp.title,
      });

      const payload = {
        title: opp.title,
        type: opp.type,
        companyName: opp.companyName,
        companyLogo: opp.companyLogo,
        companyWebsite: opp.companyWebsite,
        description: opp.description,
        responsibilities: opp.responsibilities,
        requiredSkills: opp.requiredSkills,
        preferredSkills: opp.preferredSkills,
        role: opp.role,
        department: opp.department,
        workMode: opp.workMode,
        location: opp.location,
        employmentType: opp.employmentType,
        experienceRequired: opp.experienceRequired,
        salary: opp.salary,
        salaryPeriod: opp.salaryPeriod,
        stipend: opp.stipend,
        otherBenefits: opp.otherBenefits,
        eligibleDepartments: opp.eligibleDepartments,
        eligibleGraduationYears: opp.eligibleGraduationYears,
        minimumCGPA: opp.minimumCGPA,
        maximumBacklogs: opp.maximumBacklogs,
        additionalEligibilityCriteria: opp.additionalEligibilityCriteria,
        applicationDeadline: opp.applicationDeadline,
        applicationStartDate: opp.applicationStartDate,
        externalApplicationUrl: opp.externalApplicationUrl,
        applicationInstructions: opp.applicationInstructions,
        status: opp.status,
        createdBy: tpoUserId,
        updatedBy: tpoUserId,
        publishedAt: opp.status === 'PUBLISHED' ? opp.applicationStartDate : undefined,
        closedAt: opp.closedAt,
      };

      if (!doc) {
        doc = await Opportunity.create(payload);
        stats.opportunities.created++;
      } else {
        Object.assign(doc, payload);
        await doc.save();
        stats.opportunities.updated++;
      }
      oppMap.set(opp.key, doc._id);
    }
    stats.opportunities.total = await Opportunity.countDocuments();
    console.log(`   ✓ Opportunities: ${stats.opportunities.created} created, ${stats.opportunities.updated} updated (Total in DB: ${stats.opportunities.total})`);

    // ─── 5. SEED APPLICATIONS & INTERVIEWS ────────────────────────────────────
    console.log('\n[5/10] Seeding Applications & Embedded Interviews...');
    for (const appSeed of APPLICATIONS_SEED) {
      const studentId = userMap.get(appSeed.studentKey);
      const opportunityId = oppMap.get(appSeed.oppKey);
      if (!studentId || !opportunityId) continue;

      const profile = studentProfileMap.get(appSeed.studentKey);
      const snapshot = profile
        ? {
            fullName: profile.fullName,
            email: USERS_SEED.find((u) => u.key === appSeed.studentKey)?.email,
            department: profile.department,
            graduationYear: profile.graduationYear,
            cgpa: profile.cgpa,
            backlogs: profile.backlogs,
            skills: profile.skills,
            college: profile.college,
            phone: profile.phone,
          }
        : {};

      const resumeSnapshot = profile?.resume?.url
        ? profile.resume
        : {
            url: 'https://res.cloudinary.com/careerbridge/raw/upload/v1728000000/resumes/default_resume.pdf',
            publicId: 'resumes/default_resume',
            originalName: `${appSeed.studentKey}_Resume.pdf`,
            uploadedAt: new Date(),
          };

      // Construct status history entries
      const statusHistory = (appSeed.history || []).map((h) => ({
        status: h.status,
        changedAt: new Date(Date.now() - (h.daysAgo || 0) * 86400000),
        changedBy: tpoUserId,
        changedByName: 'Dr. Rajesh Khanna (TPO)',
        note: h.note || `Status changed to ${h.status}`,
      }));

      // Construct embedded interview object if applicable
      let interviewObj = undefined;
      if (appSeed.interview) {
        interviewObj = {
          round: appSeed.interview.round || 'Technical Round 1',
          title: appSeed.interview.title || 'Technical Interview',
          date: appSeed.interview.date || new Date().toISOString().split('T')[0],
          startTime: appSeed.interview.startTime || '14:00',
          endTime: appSeed.interview.endTime || '15:00',
          mode: appSeed.interview.mode || 'ONLINE',
          meetingLink: appSeed.interview.meetingLink || '',
          location: appSeed.interview.location || '',
          interviewer: appSeed.interview.interviewer || 'TPO Recruitment Panel',
          instructions: appSeed.interview.instructions || '',
          status: appSeed.interview.status || 'SCHEDULED',
          scheduledAt: new Date(),
        };
      }

      let application = await Application.findOne({ studentId, opportunityId });
      const payload = {
        studentId,
        opportunityId,
        studentProfileSnapshot: snapshot,
        resume: resumeSnapshot,
        applicationMessage: appSeed.applicationMessage || '',
        status: appSeed.status,
        statusHistory,
        interview: interviewObj,
        appliedAt: statusHistory[0]?.changedAt || new Date(),
      };

      if (!application) {
        application = await Application.create(payload);
        stats.applications.created++;
      } else {
        Object.assign(application, payload);
        await application.save();
        stats.applications.updated++;
      }
    }
    stats.applications.total = await Application.countDocuments();
    console.log(`   ✓ Applications: ${stats.applications.created} created, ${stats.applications.updated} updated (Total in DB: ${stats.applications.total})`);

    // ─── 6. SEED MENTORSHIPS ──────────────────────────────────────────────────
    console.log('\n[6/10] Seeding Mentorship Relationships...');
    for (const m of MENTORSHIPS_SEED) {
      const studentId = userMap.get(m.studentKey);
      const alumniId = userMap.get(m.alumniKey);
      if (!studentId || !alumniId) continue;

      let mentorship = await Mentorship.findOne({ studentId, alumniId });
      const payload = {
        studentId,
        alumniId,
        requestedBy: 'STUDENT',
        status: m.status,
        requestMessage: m.requestMessage,
        responseMessage: m.responseMessage,
        mentorshipAreas: m.mentorshipAreas || [],
        startedAt: m.startedAt,
        completedAt: m.completedAt,
        rejectedAt: m.rejectedAt,
      };

      if (!mentorship) {
        mentorship = await Mentorship.create(payload);
        stats.mentorships.created++;
      } else {
        Object.assign(mentorship, payload);
        await mentorship.save();
        stats.mentorships.updated++;
      }
      mentorshipMap.set(`${m.studentKey}_${m.alumniKey}`, mentorship._id);
    }
    stats.mentorships.total = await Mentorship.countDocuments();
    console.log(`   ✓ Mentorships: ${stats.mentorships.created} created, ${stats.mentorships.updated} updated (Total in DB: ${stats.mentorships.total})`);

    // ─── 7. SEED REFERRALS ────────────────────────────────────────────────────
    console.log('\n[7/10] Seeding Referral Opportunities & Requests...');
    for (const ro of REFERRAL_OPPORTUNITIES_SEED) {
      const alumniId = userMap.get(ro.alumniKey);
      if (!alumniId) continue;

      let refOpp = await ReferralOpportunity.findOne({ alumniId, title: ro.title });
      const payload = {
        alumniId,
        title: ro.title,
        companyName: ro.companyName,
        companyLogo: ro.companyLogo,
        companyWebsite: ro.companyWebsite,
        jobUrl: ro.jobUrl,
        role: ro.role,
        department: ro.department,
        industry: ro.industry,
        workMode: ro.workMode,
        location: ro.location,
        employmentType: ro.employmentType,
        experienceRequired: ro.experienceRequired,
        salaryOrPackage: ro.salaryOrPackage,
        description: ro.description,
        requiredSkills: ro.requiredSkills,
        preferredSkills: ro.preferredSkills,
        referralInstructions: ro.referralInstructions,
        referralAvailable: ro.referralAvailable,
        maximumRequests: ro.maximumRequests,
        applicationDeadline: ro.applicationDeadline,
        status: ro.status,
      };

      if (!refOpp) {
        refOpp = await ReferralOpportunity.create(payload);
        stats.referralOpportunities.created++;
      } else {
        Object.assign(refOpp, payload);
        await refOpp.save();
        stats.referralOpportunities.updated++;
      }
      refOppMap.set(ro.key, refOpp._id);
    }
    stats.referralOpportunities.total = await ReferralOpportunity.countDocuments();

    // Requests
    for (const rr of REFERRAL_REQUESTS_SEED) {
      const studentId = userMap.get(rr.studentKey);
      const referralOpportunityId = refOppMap.get(rr.refOppKey);
      const alumniId = userMap.get(rr.alumniKey);
      if (!studentId || !referralOpportunityId || !alumniId) continue;

      let refReq = await ReferralRequest.findOne({ studentId, referralOpportunityId });
      const payload = {
        studentId,
        referralOpportunityId,
        alumniId,
        resumeUrl: 'https://res.cloudinary.com/careerbridge/raw/upload/v1728000000/resumes/referral_resume.pdf',
        requestMessage: rr.requestMessage,
        status: rr.status,
        alumniResponse: rr.alumniResponse,
        outcome: rr.outcome || 'PENDING',
        outcomeNote: rr.outcomeNote,
        requestedAt: new Date(Date.now() - 86400000 * 5),
        respondedAt: rr.alumniResponse ? new Date(Date.now() - 86400000 * 3) : undefined,
        referredAt: rr.status === 'REFERRED' ? new Date(Date.now() - 86400000 * 2) : undefined,
      };

      if (!refReq) {
        refReq = await ReferralRequest.create(payload);
        stats.referralRequests.created++;
      } else {
        Object.assign(refReq, payload);
        await refReq.save();
        stats.referralRequests.updated++;
      }
      referralRequestMap.set(`${rr.studentKey}_${rr.refOppKey}`, refReq._id);
    }
    stats.referralRequests.total = await ReferralRequest.countDocuments();
    console.log(`   ✓ Referral Opportunities: ${stats.referralOpportunities.created} created, ${stats.referralOpportunities.updated} updated (Total: ${stats.referralOpportunities.total})`);
    console.log(`   ✓ Referral Requests: ${stats.referralRequests.created} created, ${stats.referralRequests.updated} updated (Total: ${stats.referralRequests.total})`);

    // ─── 8. SEED CHAT CONVERSATIONS & MESSAGES ────────────────────────────────
    console.log('\n[8/10] Seeding Authorized Conversations & Messages...');
    for (const c of CONVERSATIONS_SEED) {
      const [keyA, keyB] = c.participantKeys;
      const idA = userMap.get(keyA);
      const idB = userMap.get(keyB);
      if (!idA || !idB) continue;

      // Find conversation matching these exact participants
      let conv = await Conversation.findOne({
        participants: { $all: [idA, idB], $size: 2 },
      });

      let contextId = null;
      if (c.contextType === 'MENTORSHIP') {
        contextId = mentorshipMap.get(`${keyA}_${keyB}`) || mentorshipMap.get(`${keyB}_${keyA}`) || null;
      } else if (c.contextType === 'REFERRAL') {
        contextId = refOppMap.get(c.contextKey) || null;
      }

      if (!conv) {
        conv = await Conversation.create({
          participants: [idA, idB],
          contextType: c.contextType,
          contextId,
          lastMessage: '',
          lastMessageAt: new Date(),
        });
        stats.conversations.created++;
      } else {
        conv.contextType = c.contextType;
        if (contextId) conv.contextId = contextId;
        await conv.save();
        stats.conversations.updated++;
      }

      // Seed messages
      let lastMsgText = '';
      let lastMsgDate = new Date();
      for (const m of c.messages) {
        const senderId = userMap.get(m.senderKey);
        if (!senderId) continue;

        const msgDate = new Date(Date.now() - (m.minutesAgo || 0) * 60000);
        const existingMsg = await Message.findOne({
          conversationId: conv._id,
          senderId,
          body: m.body,
        });

        if (!existingMsg) {
          await Message.create({
            conversationId: conv._id,
            senderId,
            body: m.body,
            createdAt: msgDate,
          });
          stats.messages.created++;
        }
        lastMsgText = m.body;
        lastMsgDate = msgDate;
      }

      // Update conversation last message snapshot
      conv.lastMessage = lastMsgText;
      conv.lastMessageAt = lastMsgDate;
      await conv.save();
    }
    stats.conversations.total = await Conversation.countDocuments();
    stats.messages.total = await Message.countDocuments();
    console.log(`   ✓ Conversations: ${stats.conversations.created} created, ${stats.conversations.updated} updated (Total: ${stats.conversations.total})`);
    console.log(`   ✓ Messages created: ${stats.messages.created} (Total in DB: ${stats.messages.total})`);

    // ─── 9. SEED NOTIFICATIONS ────────────────────────────────────────────────
    console.log('\n[9/10] Seeding Realistic In-App Notifications...');
    for (const notif of NOTIFICATIONS_SEED) {
      const recipientId = userMap.get(notif.recipientKey);
      if (!recipientId) continue;

      let existing = await Notification.findOne({
        recipientId,
        type: notif.type,
        title: notif.title,
      });

      const createdAt = new Date(Date.now() - (notif.daysAgo || 0) * 86400000);
      if (!existing) {
        await Notification.create({
          recipientId,
          type: notif.type,
          title: notif.title,
          message: notif.message,
          relatedEntityType: notif.relatedEntityType,
          actionUrl: notif.actionUrl,
          isRead: notif.isRead,
          createdAt,
        });
        stats.notifications.created++;
      } else {
        existing.message = notif.message;
        existing.isRead = notif.isRead;
        await existing.save();
        stats.notifications.updated++;
      }
    }
    stats.notifications.total = await Notification.countDocuments();
    console.log(`   ✓ Notifications: ${stats.notifications.created} created, ${stats.notifications.updated} updated (Total in DB: ${stats.notifications.total})`);

    // ─── 10. FINAL SUMMARY REPORT ─────────────────────────────────────────────
    console.log('\n======================================================');
    console.log('  🎉 SEEDING COMPLETED SUCCESSFULLY!');
    console.log('======================================================');
    console.table([
      { Entity: 'Users', Created: stats.users.created, Updated: stats.users.updated, TotalInDB: stats.users.total },
      { Entity: 'Student Profiles', Created: stats.studentProfiles.created, Updated: stats.studentProfiles.updated, TotalInDB: stats.studentProfiles.total },
      { Entity: 'Alumni Profiles', Created: stats.alumniProfiles.created, Updated: stats.alumniProfiles.updated, TotalInDB: stats.alumniProfiles.total },
      { Entity: 'Opportunities', Created: stats.opportunities.created, Updated: stats.opportunities.updated, TotalInDB: stats.opportunities.total },
      { Entity: 'Applications', Created: stats.applications.created, Updated: stats.applications.updated, TotalInDB: stats.applications.total },
      { Entity: 'Mentorships', Created: stats.mentorships.created, Updated: stats.mentorships.updated, TotalInDB: stats.mentorships.total },
      { Entity: 'Referral Opportunities', Created: stats.referralOpportunities.created, Updated: stats.referralOpportunities.updated, TotalInDB: stats.referralOpportunities.total },
      { Entity: 'Referral Requests', Created: stats.referralRequests.created, Updated: stats.referralRequests.updated, TotalInDB: stats.referralRequests.total },
      { Entity: 'Conversations', Created: stats.conversations.created, Updated: stats.conversations.updated, TotalInDB: stats.conversations.total },
      { Entity: 'Messages', Created: stats.messages.created, Updated: 0, TotalInDB: stats.messages.total },
      { Entity: 'Notifications', Created: stats.notifications.created, Updated: stats.notifications.updated, TotalInDB: stats.notifications.total },
    ]);

    return stats;
  } catch (err) {
    console.error('\n❌ Fatal Error during seeding execution:', err.message);
    throw err;
  } finally {
    if (closeOnFinish && mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
      console.log('🔒 Database connection closed properly.\n');
    }
  }
};

// Allow direct CLI invocation: `node seed/seeder.js`
if (require.main === module) {
  seedDatabase({ closeOnFinish: true })
    .then(() => process.exit(0))
    .catch((err) => {
      console.error(`\n❌ Seeding Aborted: ${err.message}`);
      if (err.message && (err.message.includes('ECONNREFUSED') || err.name === 'MongooseServerSelectionError')) {
        console.error('💡 Hint: MongoDB is currently offline or unreachable at MONGODB_URI.');
        console.error('   To seed a live database, start mongod locally or set a MongoDB Atlas connection string in server/.env:');
        console.error('   MONGODB_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/careerbridge');
        console.error('   Note: The CareerBridge in-memory store is already fully populated with all Phase 15 seed fixtures for immediate offline demonstration!\n');
      }
      process.exit(1);
    });
}

module.exports = {
  seedDatabase,
  validateEnvironment,
};
