const mongoose = require('mongoose');

const technicalQuestionSchema = new mongoose.Schema(
  {
    question: { type: String, required: true },
    category: { type: String, default: 'Core Technical' },
    difficulty: {
      type: String,
      enum: ['EASY', 'MEDIUM', 'HARD'],
      default: 'MEDIUM',
    },
    whatItTests: { type: String, default: '' },
    answerGuidance: { type: String, required: true },
    keyPoints: [{ type: String }],
  },
  { _id: false }
);

const projectQuestionSchema = new mongoose.Schema(
  {
    question: { type: String, required: true },
    projectName: { type: String, default: '' },
    answerGuidance: { type: String, required: true },
    keyPoints: [{ type: String }],
  },
  { _id: false }
);

const hrQuestionSchema = new mongoose.Schema(
  {
    question: { type: String, required: true },
    category: { type: String, default: 'Behavioral & Fit' },
    answerGuidance: { type: String, required: true },
    keyPoints: [{ type: String }],
  },
  { _id: false }
);

const interviewPreparationSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
      index: true,
      ref: 'User',
    },
    opportunityId: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
      index: true,
      ref: 'Opportunity',
    },
    companyName: {
      type: String,
      default: '',
    },
    roleTitle: {
      type: String,
      default: '',
    },
    overview: {
      type: String,
      required: true,
      maxlength: 3000,
    },
    focusAreas: [{ type: String }],
    technicalQuestions: [technicalQuestionSchema],
    projectQuestions: [projectQuestionSchema],
    hrQuestions: [hrQuestionSchema],
    preparationTips: [{ type: String }],
    hasScheduledInterview: {
      type: Boolean,
      default: false,
    },
    scheduledInterviewRound: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for fast student + opportunity queries
interviewPreparationSchema.index({ studentId: 1, opportunityId: 1, createdAt: -1 });

module.exports = mongoose.model('InterviewPreparation', interviewPreparationSchema);
