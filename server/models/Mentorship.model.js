const mongoose = require('mongoose');

const MentorshipSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.Mixed,
      ref: 'User',
      required: true,
      index: true,
    },
    alumniId: {
      type: mongoose.Schema.Types.Mixed,
      ref: 'User',
      required: true,
      index: true,
    },
    requestedBy: {
      type: String,
      enum: ['STUDENT'],
      default: 'STUDENT',
    },
    status: {
      type: String,
      enum: ['PENDING', 'ACCEPTED', 'REJECTED', 'COMPLETED', 'CANCELLED'],
      default: 'PENDING',
      index: true,
    },
    requestMessage: {
      type: String,
      trim: true,
      maxlength: [1000, 'Request message cannot exceed 1000 characters'],
    },
    responseMessage: {
      type: String,
      trim: true,
      maxlength: [1000, 'Response message cannot exceed 1000 characters'],
    },
    mentorshipAreas: [
      {
        type: String,
        trim: true,
      },
    ],
    startedAt: {
      type: Date,
    },
    completedAt: {
      type: Date,
    },
    rejectedAt: {
      type: Date,
    },
    cancelledAt: {
      type: Date,
    },
    cancelledBy: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index to help query student-alumni pairs quickly
MentorshipSchema.index({ studentId: 1, alumniId: 1, status: 1 });
MentorshipSchema.index({ alumniId: 1, status: 1 });
MentorshipSchema.index({ studentId: 1, status: 1 });

module.exports = mongoose.model('Mentorship', MentorshipSchema);
