const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.Mixed,
      required: [true, 'Student ID is required'],
      ref: 'User',
    },
    opportunityId: {
      type: mongoose.Schema.Types.Mixed,
      required: [true, 'Opportunity ID is required'],
      ref: 'Opportunity',
    },
    // Snapshot of student credentials at the time of application
    studentProfileSnapshot: {
      fullName: { type: String },
      email: { type: String },
      department: { type: String },
      graduationYear: { type: Number },
      cgpa: { type: Number },
      backlogs: { type: Number },
      skills: [{ type: String }],
      college: { type: String },
      phone: { type: String },
    },
    // Snapshot of resume submitted with the application
    resume: {
      url: { type: String, required: [true, 'Resume URL is required'] },
      publicId: { type: String, default: '' },
      originalName: { type: String, required: [true, 'Resume filename is required'] },
      uploadedAt: { type: Date, default: Date.now },
    },
    // Optional applicant cover note or message to TPO
    applicationMessage: {
      type: String,
      trim: true,
      maxlength: [1500, 'Application message cannot exceed 1500 characters'],
      default: '',
    },
    // Application Lifecycle Status (foundational for Phase 7)
    status: {
      type: String,
      enum: {
        values: [
          'APPLIED',
          'SHORTLISTED',
          'INTERVIEW',
          'SELECTED',
          'REJECTED',
          'WAITLISTED',
          'WITHDRAWN',
        ],
        message: '{VALUE} is not a valid application status',
      },
      default: 'APPLIED',
      required: true,
    },
    // Application Status History (Phase 7 audit trail)
    statusHistory: [
      {
        status: {
          type: String,
          required: true,
          enum: [
            'APPLIED',
            'SHORTLISTED',
            'INTERVIEW',
            'SELECTED',
            'REJECTED',
            'WAITLISTED',
            'WITHDRAWN',
          ],
        },
        changedAt: { type: Date, default: Date.now },
        changedBy: { type: mongoose.Schema.Types.Mixed },
        changedByName: { type: String, default: '' },
        note: { type: String, trim: true, maxlength: 1000, default: '' },
      },
    ],
    // Scheduled Interview Details (Phase 7)
    interview: {
      round: { type: String, default: 'Technical Round' },
      title: { type: String, default: '' },
      date: { type: String, default: '' }, // YYYY-MM-DD
      startTime: { type: String, default: '' }, // HH:mm
      endTime: { type: String, default: '' }, // HH:mm
      mode: {
        type: String,
        enum: ['ONLINE', 'OFFLINE', 'PHONE'],
        default: 'ONLINE',
      },
      meetingLink: { type: String, trim: true, default: '' },
      location: { type: String, trim: true, default: '' },
      interviewer: { type: String, trim: true, default: '' },
      instructions: { type: String, trim: true, maxlength: 2000, default: '' },
      status: {
        type: String,
        enum: ['SCHEDULED', 'RESCHEDULED', 'COMPLETED', 'CANCELLED'],
        default: 'SCHEDULED',
      },
      scheduledAt: { type: Date, default: Date.now },
      updatedAt: { type: Date },
    },
    // Record of dynamic eligibility check evaluated at submission
    eligibilitySnapshot: {
      type: Object,
      default: {},
    },
    appliedAt: {
      type: Date,
      default: Date.now,
    },
    withdrawnAt: {
      type: Date,
    },
    withdrawalReason: {
      type: String,
      trim: true,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// CRITICAL: Unique compound index preventing duplicate applications for the same opportunity
applicationSchema.index({ studentId: 1, opportunityId: 1 }, { unique: true });

// Additional indexing for fast query lookup
applicationSchema.index({ studentId: 1 });
applicationSchema.index({ opportunityId: 1 });
applicationSchema.index({ status: 1 });
applicationSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Application', applicationSchema);
