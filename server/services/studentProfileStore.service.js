const mongoose = require('mongoose');
const StudentProfile = require('../models/StudentProfile.model');

const isDbConnected = () => mongoose.connection.readyState === 1;

// Seed demo student profile for seamless offline testing
const DEMO_STUDENT_PROFILE = {
  userId: 'demo_student',
  fullName: 'Demo Student',
  phone: '+91 9876543210',
  location: 'Bengaluru, Karnataka',
  department: 'Computer Science',
  college: 'CareerBridge Institute of Technology',
  graduationYear: 2026,
  cgpa: 8.4,
  backlogs: 0,
  bio: 'Final year Computer Science student enthusiastic about cloud systems, backend architecture, and full-stack development.',
  skills: [
    'Java',
    'C++',
    'Data Structures',
    'Algorithms',
    'System Design',
    'Python',
    'React',
    'JavaScript',
    'TypeScript',
    'SQL',
    'Git',
  ],
  careerInterests: ['Software Engineering', 'Cloud Engineering', 'Full Stack Development'],
  resume: {
    url: 'https://res.cloudinary.com/careerbridge/raw/upload/v1728000000/resumes/demo_student_resume.pdf',
    publicId: 'resumes/demo_student_resume',
    originalName: 'Demo_Student_Resume_2026.pdf',
    uploadedAt: new Date(),
  },
  createdAt: new Date(),
  updatedAt: new Date(),
};

let STUDENT_PROFILES_SEED = [];
try {
  STUDENT_PROFILES_SEED = require('../seed/seedData').STUDENT_PROFILES_SEED;
} catch {}

const memoryStudentProfiles = (STUDENT_PROFILES_SEED && STUDENT_PROFILES_SEED.length > 0)
  ? STUDENT_PROFILES_SEED.map((p) => ({
      ...p,
      _id: 'prof_' + p.userKey,
      userId: p.userKey === 'demo_student' ? 'demo_student' : p.userKey,
      createdAt: new Date(),
      updatedAt: new Date(),
    }))
  : [JSON.parse(JSON.stringify(DEMO_STUDENT_PROFILE))];

/**
 * Retrieve student profile by user ID
 */
const findProfileByUserId = async (userId) => {
  if (isDbConnected()) {
    if (mongoose.Types.ObjectId.isValid(userId)) {
      const profile = await StudentProfile.findOne({ userId }).lean();
      if (profile) return profile;
    }
  }

  const strId = String(userId);
  const mem = memoryStudentProfiles.find((p) => String(p.userId) === strId);
  return mem ? { ...mem } : null;
};

/**
 * Create or save student profile
 */
const saveStudentProfile = async (userId, data) => {
  if (isDbConnected() && mongoose.Types.ObjectId.isValid(userId)) {
    const updated = await StudentProfile.findOneAndUpdate(
      { userId },
      { ...data, userId },
      { upsert: true, new: true, runValidators: true }
    ).lean();
    return updated;
  }

  const strId = String(userId);
  const index = memoryStudentProfiles.findIndex((p) => String(p.userId) === strId);
  const updatedDoc = {
    ...data,
    userId: strId,
    updatedAt: new Date(),
  };

  if (index !== -1) {
    memoryStudentProfiles[index] = { ...memoryStudentProfiles[index], ...updatedDoc };
    return memoryStudentProfiles[index];
  } else {
    updatedDoc.createdAt = new Date();
    memoryStudentProfiles.push(updatedDoc);
    return updatedDoc;
  }
};

module.exports = {
  findProfileByUserId,
  saveStudentProfile,
  isDbConnected,
};
