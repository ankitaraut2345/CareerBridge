const mongoose = require('mongoose');

const NOTIFICATION_TYPES = {
  // Application & Interview
  APPLICATION_STATUS_CHANGED: 'APPLICATION_STATUS_CHANGED',
  INTERVIEW_SCHEDULED: 'INTERVIEW_SCHEDULED',
  INTERVIEW_UPDATED: 'INTERVIEW_UPDATED',
  INTERVIEW_CANCELLED: 'INTERVIEW_CANCELLED',

  // Mentorship
  MENTORSHIP_REQUEST_RECEIVED: 'MENTORSHIP_REQUEST_RECEIVED',
  MENTORSHIP_REQUEST_ACCEPTED: 'MENTORSHIP_REQUEST_ACCEPTED',
  MENTORSHIP_REQUEST_REJECTED: 'MENTORSHIP_REQUEST_REJECTED',
  MENTORSHIP_COMPLETED: 'MENTORSHIP_COMPLETED',

  // Referral
  REFERRAL_REQUEST_RECEIVED: 'REFERRAL_REQUEST_RECEIVED',
  REFERRAL_REQUEST_ACCEPTED: 'REFERRAL_REQUEST_ACCEPTED',
  REFERRAL_REQUEST_REJECTED: 'REFERRAL_REQUEST_REJECTED',
  REFERRAL_REFERRED: 'REFERRAL_REFERRED',
  REFERRAL_COMPLETED: 'REFERRAL_COMPLETED',
  REFERRAL_CLOSED: 'REFERRAL_CLOSED',

  // Chat
  NEW_CHAT_MESSAGE: 'NEW_CHAT_MESSAGE',

  // Opportunity
  OPPORTUNITY_PUBLISHED: 'OPPORTUNITY_PUBLISHED',
  OPPORTUNITY_UPDATED: 'OPPORTUNITY_UPDATED',
  OPPORTUNITY_CLOSED: 'OPPORTUNITY_CLOSED',
};

const NotificationSchema = new mongoose.Schema(
  {
    recipientId: {
      type: mongoose.Schema.Types.Mixed,
      ref: 'User',
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: Object.values(NOTIFICATION_TYPES),
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    relatedEntityType: {
      type: String,
      enum: [
        'Application',
        'Opportunity',
        'Mentorship',
        'ReferralRequest',
        'ReferralOpportunity',
        'Conversation',
        'Message',
        'User',
      ],
      default: null,
    },
    relatedEntityId: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    actionUrl: {
      type: String,
      default: null,
    },
    isRead: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

NotificationSchema.index({ recipientId: 1, isRead: 1 });
NotificationSchema.index({ recipientId: 1, createdAt: -1 });

const Notification = mongoose.model('Notification', NotificationSchema);

module.exports = {
  Notification,
  NOTIFICATION_TYPES,
};
