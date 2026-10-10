const mongoose = require('mongoose');

const resumeAnalysisSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    opportunityId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Opportunity',
      required: true,
      index: true,
    },
    matchScore: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    summary: {
      type: String,
      required: true,
      maxlength: 2000,
    },
    matchingSkills: [
      {
        type: String,
        trim: true,
      },
    ],
    missingSkills: [
      {
        type: String,
        trim: true,
      },
    ],
    strengths: [
      {
        type: String,
        trim: true,
      },
    ],
    improvementSuggestions: [
      {
        type: String,
        trim: true,
      },
    ],
    keywordSuggestions: [
      {
        type: String,
        trim: true,
      },
    ],
    projectSuggestions: [
      {
        type: String,
        trim: true,
      },
    ],
    resumeOriginalName: {
      type: String,
      default: '',
    },
    resumeUpdatedAt: {
      type: Date,
      default: Date.now,
    },
    opportunityUpdatedAt: {
      type: Date,
      default: Date.now,
    },
    isStale: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for fast student + opportunity queries
resumeAnalysisSchema.index({ studentId: 1, opportunityId: 1, createdAt: -1 });

module.exports = mongoose.model('ResumeAnalysis', resumeAnalysisSchema);
