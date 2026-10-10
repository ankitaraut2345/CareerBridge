const mongoose = require('mongoose');

const ProjectSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  technologies: [{ type: String }],
  projectUrl: { type: String },
  githubUrl: { type: String },
}, { _id: false });

const CertificationSchema = new mongoose.Schema({
  name: { type: String, required: true },
  issuingOrganization: { type: String, required: true },
  issueDate: { type: Date },
  credentialUrl: { type: String },
}, { _id: false });

const ResumeSchema = new mongoose.Schema({
  url: { type: String, required: true },
  publicId: { type: String, required: true },
  originalName: { type: String, required: true },
  uploadedAt: { type: Date, default: Date.now },
}, { _id: false });

const StudentProfileSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  fullName: { type: String },
  profilePhoto: { type: String },
  phone: { type: String },
  location: { type: String },
  dateOfBirth: { type: Date },
  department: { type: String },
  college: { type: String },
  graduationYear: { type: Number },
  cgpa: { type: Number, min: 0, max: 10 },
  backlogs: { type: Number, default: 0 },
  bio: { type: String },
  skills: [{ type: String }],
  projects: [ProjectSchema],
  certifications: [CertificationSchema],
  careerInterests: [{ type: String }],
  preferredRoles: [{ type: String }],
  preferredIndustries: [{ type: String }],
  preferredLocations: [{ type: String }],
  resume: ResumeSchema,
}, { timestamps: true });

module.exports = mongoose.model('StudentProfile', StudentProfileSchema);
