const mongoose = require('mongoose');

const AlumniProfileSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  fullName: { type: String, required: true, trim: true },
  profilePhoto: { type: String }, // optional URL
  phone: { type: String },
  location: { type: String },
  graduationYear: { type: Number, required: true },
  department: { type: String, required: true },
  college: { type: String, required: true },
  currentCompany: { type: String },
  currentRole: { type: String },
  industry: { type: String },
  yearsOfExperience: { type: Number },
  bio: { type: String },
  skills: [{ type: String }],
  careerInterests: [{ type: String }],
  previousCompanies: [{ type: String }],
  linkedinUrl: { type: String },
  githubUrl: { type: String },
  mentorshipAvailable: { type: Boolean, default: false },
  mentorshipAreas: [{ type: String }],
  verificationStatus: { type: String, enum: ['PENDING', 'VERIFIED', 'REJECTED'], default: 'PENDING' },
}, { timestamps: true });

module.exports = mongoose.model('AlumniProfile', AlumniProfileSchema);
