const mongoose = require('mongoose');
const AlumniProfile = require('../models/AlumniProfile.model');
const User = require('../models/user.model');

const isDbConnected = () => mongoose.connection.readyState === 1;

// Demo Alumni Profiles pre-seeded for offline reliability
const INITIAL_DEMO_ALUMNI_PROFILES = [
  {
    userId: 'demo_alumni',
    fullName: 'Priya Sharma',
    phone: '+91 9811122334',
    location: 'Bengaluru, Karnataka',
    graduationYear: 2021,
    department: 'Computer Science',
    college: 'CareerBridge Institute of Technology',
    currentCompany: 'Google',
    currentRole: 'Senior Software Engineer',
    industry: 'Technology',
    yearsOfExperience: 5,
    bio: 'Alumna from Batch of 2021. Currently leading backend cloud infrastructure at Google. Passionate about helping juniors crack tech interviews and understand large-scale system architecture.',
    skills: ['Java', 'Distributed Systems', 'React', 'System Design', 'Algorithms', 'Go', 'Cloud Architecture'],
    careerInterests: ['Cloud Computing', 'Distributed Systems', 'Mentorship'],
    previousCompanies: ['Flipkart', 'Goldman Sachs'],
    linkedinUrl: 'https://linkedin.com/in/priya-sharma-google',
    githubUrl: 'https://github.com/priyasharma-dev',
    mentorshipAvailable: true,
    mentorshipAreas: ['DSA', 'System Design', 'Interview Preparation', 'Resume Guidance', 'Career Planning'],
    verificationStatus: 'VERIFIED',
    createdAt: new Date(Date.now() - 86400000 * 120),
    updatedAt: new Date(),
  },
  {
    userId: 'alumni_microsoft',
    fullName: 'Rohan Verma',
    phone: '+91 9822233445',
    location: 'Hyderabad, Telangana',
    graduationYear: 2022,
    department: 'Information Technology',
    college: 'CareerBridge Institute of Technology',
    currentCompany: 'Microsoft',
    currentRole: 'Software Engineer II',
    industry: 'Technology',
    yearsOfExperience: 3,
    bio: 'Software engineer at Microsoft Azure Core team. Experienced in C++, TypeScript, microservices, and campus placement prep.',
    skills: ['C++', 'TypeScript', 'Azure', 'Data Structures', 'Microservices', 'Node.js'],
    careerInterests: ['Cloud Systems', 'Open Source'],
    previousCompanies: ['Samsung R&D'],
    linkedinUrl: 'https://linkedin.com/in/rohan-verma-msft',
    githubUrl: 'https://github.com/rohanverma',
    mentorshipAvailable: true,
    mentorshipAreas: ['DSA', 'Web Development', 'Cloud Architecture', 'Interview Preparation'],
    verificationStatus: 'VERIFIED',
    createdAt: new Date(Date.now() - 86400000 * 90),
    updatedAt: new Date(),
  },
  {
    userId: 'alumni_amazon',
    fullName: 'Ananya Patel',
    phone: '+91 9833344556',
    location: 'Bengaluru, Karnataka',
    graduationYear: 2020,
    department: 'Electronics & Communication',
    college: 'CareerBridge Institute of Technology',
    currentCompany: 'Amazon',
    currentRole: 'Full Stack Engineer',
    industry: 'E-commerce',
    yearsOfExperience: 4,
    bio: 'Full stack practitioner working on Amazon Retail platform. Love mentoring enthusiastic students on React, JavaScript, AWS, and behavioral interview leadership principles.',
    skills: ['React', 'JavaScript', 'AWS', 'Node.js', 'SQL', 'Python'],
    careerInterests: ['Frontend Architecture', 'Serverless'],
    previousCompanies: ['Swiggy'],
    linkedinUrl: 'https://linkedin.com/in/ananya-patel-amzn',
    githubUrl: 'https://github.com/ananyapatel',
    mentorshipAvailable: true,
    mentorshipAreas: ['Web Development', 'Resume Guidance', 'Higher Studies', 'Career Planning'],
    verificationStatus: 'VERIFIED',
    createdAt: new Date(Date.now() - 86400000 * 60),
    updatedAt: new Date(),
  },
  {
    userId: 'alumni_unverified_demo',
    fullName: 'Kunal Joshi (Pending)',
    phone: '+91 9844455667',
    location: 'Pune, Maharashtra',
    graduationYear: 2024,
    department: 'Mechanical Engineering',
    college: 'CareerBridge Institute of Technology',
    currentCompany: 'Tata Motors',
    currentRole: 'Design Trainee',
    industry: 'Manufacturing',
    yearsOfExperience: 1,
    bio: 'Automotive enthusiast.',
    skills: ['AutoCAD', 'SolidWorks'],
    careerInterests: ['Automotive'],
    previousCompanies: [],
    mentorshipAvailable: true,
    mentorshipAreas: ['Industry Guidance'],
    verificationStatus: 'PENDING', // MUST NEVER BE RETURNED AS MENTOR
    createdAt: new Date(Date.now() - 86400000 * 10),
    updatedAt: new Date(),
  },
];

let ALUMNI_PROFILES_SEED = [];
try {
  ALUMNI_PROFILES_SEED = require('../seed/seedData').ALUMNI_PROFILES_SEED;
} catch {}

const memoryAlumniProfiles = (ALUMNI_PROFILES_SEED && ALUMNI_PROFILES_SEED.length > 0)
  ? ALUMNI_PROFILES_SEED.map((a) => ({
      ...a,
      _id: 'alumni_prof_' + a.userKey,
      userId: a.userKey === 'demo_alumni' ? 'demo_alumni' : a.userKey,
      createdAt: new Date(),
      updatedAt: new Date(),
    }))
  : JSON.parse(JSON.stringify(INITIAL_DEMO_ALUMNI_PROFILES));

/**
 * Find alumni profile by user ID
 */
const findProfileByUserId = async (userId) => {
  if (isDbConnected()) {
    if (mongoose.Types.ObjectId.isValid(userId)) {
      const profile = await AlumniProfile.findOne({ userId }).lean();
      if (profile) return profile;
    }
  }

  const strId = String(userId);
  const mem = memoryAlumniProfiles.find((p) => String(p.userId) === strId);
  return mem ? { ...mem } : null;
};

/**
 * Save or update alumni profile
 */
const saveAlumniProfile = async (userId, data) => {
  if (isDbConnected() && mongoose.Types.ObjectId.isValid(userId)) {
    const updated = await AlumniProfile.findOneAndUpdate(
      { userId },
      { ...data, userId },
      { upsert: true, new: true, runValidators: true }
    ).lean();
    return updated;
  }

  const strId = String(userId);
  const index = memoryAlumniProfiles.findIndex((p) => String(p.userId) === strId);
  const updatedDoc = {
    ...data,
    userId: strId,
    updatedAt: new Date(),
  };

  if (index !== -1) {
    memoryAlumniProfiles[index] = { ...memoryAlumniProfiles[index], ...updatedDoc };
    return memoryAlumniProfiles[index];
  } else {
    updatedDoc.createdAt = new Date();
    updatedDoc.verificationStatus = updatedDoc.verificationStatus || 'PENDING';
    memoryAlumniProfiles.push(updatedDoc);
    return updatedDoc;
  }
};

/**
 * Query all verified alumni profiles
 * By default returns all VERIFIED alumni so directory displays availability status.
 * If onlyAvailable === true, filters to mentorshipAvailable === true.
 */
const getVerifiedMentors = async ({ onlyAvailable = false } = {}) => {
  if (isDbConnected()) {
    try {
      const query = { verificationStatus: 'VERIFIED' };
      if (onlyAvailable) {
        query.mentorshipAvailable = true;
      }
      const profiles = await AlumniProfile.find(query).lean();
      if (profiles && profiles.length > 0) {
        return profiles;
      }
    } catch (e) {
      console.warn('DB query error for verified mentors, falling back to memory store:', e.message);
    }
  }

  return memoryAlumniProfiles.filter(
    (p) => p.verificationStatus === 'VERIFIED' && (!onlyAvailable || p.mentorshipAvailable === true)
  );
};

module.exports = {
  findProfileByUserId,
  saveAlumniProfile,
  getVerifiedMentors,
  isDbConnected,
  memoryAlumniProfiles,
};
