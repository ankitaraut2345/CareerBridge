/**
 * CareerBridge Demo Accounts Configuration
 * Used for development seeding and Quick Access testing.
 * Strictly disabled in production when VITE_ENABLE_DEMO_ACCESS is false.
 */

const DEMO_PASSWORD = process.env.DEMO_ACCOUNTS_PASSWORD || 'demo123';

const DEMO_USERS = [
  // ─── Core 4 Demo Accounts (Quick Access) ──────────────────────────────────
  {
    name: 'Demo Student',
    email: 'student@demo.com',
    password: 'demo123',
    role: 'STUDENT',
    verificationStatus: 'VERIFIED',
    isActive: true,
  },
  {
    name: 'Priya Sharma (Demo Alumni)',
    email: 'alumni@demo.com',
    password: 'demo123',
    role: 'ALUMNI',
    verificationStatus: 'VERIFIED',
    isActive: true,
  },
  {
    name: 'Dr. Rajesh Khanna (Demo TPO)',
    email: 'tpo@demo.com',
    password: 'demo123',
    role: 'TPO',
    verificationStatus: 'VERIFIED',
    isActive: true,
  },
  {
    name: 'Demo Admin',
    email: 'admin@demo.com',
    password: 'demo123',
    role: 'ADMIN',
    verificationStatus: 'VERIFIED',
    isActive: true,
  },

  // ─── Additional Students (Diverse Skills, CGPAs, Branches) ────────────────
  {
    name: 'Rahul Sharma',
    email: 'student.rahul@demo.com',
    password: 'demo123',
    role: 'STUDENT',
    verificationStatus: 'VERIFIED',
    isActive: true,
  },
  {
    name: 'Sneha Patel',
    email: 'student.sneha@demo.com',
    password: 'demo123',
    role: 'STUDENT',
    verificationStatus: 'VERIFIED',
    isActive: true,
  },
  {
    name: 'Vikram Rao',
    email: 'student.vikram@demo.com',
    password: 'demo123',
    role: 'STUDENT',
    verificationStatus: 'VERIFIED',
    isActive: true,
  },
  {
    name: 'Ananya Iyer',
    email: 'student.ananya@demo.com',
    password: 'demo123',
    role: 'STUDENT',
    verificationStatus: 'VERIFIED',
    isActive: true,
  },
  {
    name: 'Amit Kumar',
    email: 'student.amit@demo.com',
    password: 'demo123',
    role: 'STUDENT',
    verificationStatus: 'VERIFIED',
    isActive: true,
  },
  {
    name: 'Priya Deshmukh',
    email: 'student.priya@demo.com',
    password: 'demo123',
    role: 'STUDENT',
    verificationStatus: 'VERIFIED',
    isActive: true,
  },
  {
    name: 'Rohan Mehta',
    email: 'student.rohan@demo.com',
    password: 'demo123',
    role: 'STUDENT',
    verificationStatus: 'VERIFIED',
    isActive: true,
  },
  {
    name: 'Tanvi Verma',
    email: 'student.tanvi@demo.com',
    password: 'demo123',
    role: 'STUDENT',
    verificationStatus: 'VERIFIED',
    isActive: true,
  },
  {
    name: 'Karan Joshi',
    email: 'student.karan@demo.com',
    password: 'demo123',
    role: 'STUDENT',
    verificationStatus: 'VERIFIED',
    isActive: true,
  },
  {
    name: 'Neha Gupta',
    email: 'student.neha@demo.com',
    password: 'demo123',
    role: 'STUDENT',
    verificationStatus: 'VERIFIED',
    isActive: true,
  },
  {
    name: 'Aditya Nair',
    email: 'student.aditya@demo.com',
    password: 'demo123',
    role: 'STUDENT',
    verificationStatus: 'VERIFIED',
    isActive: true,
  },

  // ─── Additional Alumni (Verified, Pending, Rejected) ──────────────────────
  {
    name: 'Rohan Verma',
    email: 'alumni.rohan@demo.com',
    password: 'demo123',
    role: 'ALUMNI',
    verificationStatus: 'VERIFIED',
    isActive: true,
  },
  {
    name: 'Ananya Patel',
    email: 'alumni.ananya@demo.com',
    password: 'demo123',
    role: 'ALUMNI',
    verificationStatus: 'VERIFIED',
    isActive: true,
  },
  {
    name: 'Kunal Sen',
    email: 'alumni.kunal@demo.com',
    password: 'demo123',
    role: 'ALUMNI',
    verificationStatus: 'VERIFIED',
    isActive: true,
  },
  {
    name: 'Divya Nair',
    email: 'alumni.divya@demo.com',
    password: 'demo123',
    role: 'ALUMNI',
    verificationStatus: 'VERIFIED',
    isActive: true,
  },
  {
    name: 'Siddharth Roy',
    email: 'alumni.siddharth@demo.com',
    password: 'demo123',
    role: 'ALUMNI',
    verificationStatus: 'PENDING',
    isActive: true,
  },
  {
    name: 'Pooja Kulkarni',
    email: 'alumni.pooja@demo.com',
    password: 'demo123',
    role: 'ALUMNI',
    verificationStatus: 'REJECTED',
    isActive: true,
  },

  // ─── Additional TPO ───────────────────────────────────────────────────────
  {
    name: 'Prof. Meenakshi Sundaram',
    email: 'tpo.deputy@demo.com',
    password: 'demo123',
    role: 'TPO',
    verificationStatus: 'VERIFIED',
    isActive: true,
  },
];

module.exports = {
  DEMO_PASSWORD,
  DEMO_USERS,
};
