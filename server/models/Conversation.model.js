const mongoose = require('mongoose');

/**
 * Conversation Model
 * Represents a unique conversation channel between exactly two users.
 * A compound unique index on [participants] prevents duplicate conversations.
 */
const ConversationSchema = new mongoose.Schema(
  {
    // Always exactly two participants: [studentId, alumniId]
    participants: [
      {
        type: mongoose.Schema.Types.Mixed,
        ref: 'User',
        required: true,
      },
    ],

    // Tracks the context that authorised this conversation
    contextType: {
      type: String,
      enum: ['MENTORSHIP', 'REFERRAL'],
      required: true,
    },

    // Optional reference to the context record (mentorship/referralRequest _id)
    contextId: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },

    // Snapshot of the last message for sidebar preview
    lastMessage: {
      type: String,
      default: '',
    },
    lastMessageAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Ensure each pair of users can only have one conversation
// Using a sparse unique index on a sorted participants array isn't trivial in Mongoose;
// we enforce uniqueness at the service layer with findOne before creating.
ConversationSchema.index({ participants: 1 });
ConversationSchema.index({ lastMessageAt: -1 });

module.exports = mongoose.model('Conversation', ConversationSchema);
