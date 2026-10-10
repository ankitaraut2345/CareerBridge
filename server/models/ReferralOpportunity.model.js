const mongoose = require('mongoose');

const ReferralOpportunitySchema = new mongoose.Schema(
  {
    alumniId: {
      type: mongoose.Schema.Types.Mixed,
      ref: 'User',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Referral opportunity title is required'],
      trim: true,
      maxlength: [150, 'Title cannot exceed 150 characters'],
    },
    companyName: {
      type: String,
      required: [true, 'Company name is required'],
      trim: true,
      index: true,
    },
    companyLogo: {
      type: String,
      trim: true,
    },
    companyWebsite: {
      type: String,
      trim: true,
    },
    jobUrl: {
      type: String,
      trim: true,
    },
    role: {
      type: String,
      required: [true, 'Role or designation is required'],
      trim: true,
      index: true,
    },
    department: {
      type: String,
      trim: true,
    },
    industry: {
      type: String,
      trim: true,
      index: true,
    },
    workMode: {
      type: String,
      enum: ['Onsite', 'Remote', 'Hybrid'],
      default: 'Hybrid',
    },
    location: {
      type: String,
      required: [true, 'Job location is required'],
      trim: true,
    },
    employmentType: {
      type: String,
      enum: ['Full-time', 'Internship', 'Part-time', 'Contract'],
      default: 'Full-time',
    },
    experienceRequired: {
      type: Number,
      default: 0,
      min: 0,
    },
    salaryOrPackage: {
      type: String,
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Job/Referral description is required'],
      trim: true,
    },
    requiredSkills: [
      {
        type: String,
        trim: true,
      },
    ],
    preferredSkills: [
      {
        type: String,
        trim: true,
      },
    ],
    referralInstructions: {
      type: String,
      trim: true,
      maxlength: [1000, 'Instructions cannot exceed 1000 characters'],
    },
    referralAvailable: {
      type: Boolean,
      default: true,
      index: true,
    },
    maximumRequests: {
      type: Number,
      default: null,
      min: 1,
    },
    applicationDeadline: {
      type: Date,
      required: [true, 'Application deadline is required'],
      index: true,
    },
    status: {
      type: String,
      enum: ['DRAFT', 'OPEN', 'CLOSED', 'ARCHIVED'],
      default: 'OPEN',
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

ReferralOpportunitySchema.index({ status: 1, referralAvailable: 1, applicationDeadline: 1 });
ReferralOpportunitySchema.index({ alumniId: 1, status: 1 });
ReferralOpportunitySchema.index({ companyName: 1, role: 1 });

module.exports = mongoose.model('ReferralOpportunity', ReferralOpportunitySchema);
