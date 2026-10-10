const mongoose = require('mongoose');

const ReferralRequestSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.Mixed,
      ref: 'User',
      required: true,
      index: true,
    },
    referralOpportunityId: {
      type: mongoose.Schema.Types.Mixed,
      ref: 'ReferralOpportunity',
      required: true,
      index: true,
    },
    alumniId: {
      type: mongoose.Schema.Types.Mixed,
      ref: 'User',
      required: true,
      index: true,
    },
    resumeUrl: {
      type: String,
      required: [true, 'Student resume URL snapshot is required'],
      trim: true,
    },
    requestMessage: {
      type: String,
      trim: true,
      maxlength: [1000, 'Request message cannot exceed 1000 characters'],
    },
    status: {
      type: String,
      enum: [
        'PENDING',
        'ACCEPTED',
        'REJECTED',
        'WITHDRAWN',
        'REFERRED',
        'COMPLETED',
        'CLOSED',
      ],
      default: 'PENDING',
      index: true,
    },
    alumniResponse: {
      type: String,
      trim: true,
      maxlength: [1000, 'Alumni response note cannot exceed 1000 characters'],
    },
    requestedAt: {
      type: Date,
      default: Date.now,
    },
    respondedAt: {
      type: Date,
    },
    referredAt: {
      type: Date,
    },
    outcome: {
      type: String,
      enum: [
        'PENDING',
        'INTERVIEW',
        'SELECTED',
        'NOT_SELECTED',
        'NO_RESPONSE',
        'WITHDRAWN',
        'OTHER',
      ],
      default: 'PENDING',
      index: true,
    },
    outcomeNote: {
      type: String,
      trim: true,
      maxlength: [1000, 'Outcome note cannot exceed 1000 characters'],
    },
  },
  {
    timestamps: true,
  }
);

ReferralRequestSchema.index({
  studentId: 1,
  referralOpportunityId: 1,
  status: 1,
});
ReferralRequestSchema.index({ referralOpportunityId: 1, status: 1 });
ReferralRequestSchema.index({ alumniId: 1, status: 1 });
ReferralRequestSchema.index({ studentId: 1, status: 1 });

module.exports = mongoose.model('ReferralRequest', ReferralRequestSchema);
