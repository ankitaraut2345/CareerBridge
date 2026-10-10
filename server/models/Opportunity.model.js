const mongoose = require('mongoose');

const opportunitySchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Opportunity title is required'],
      trim: true,
      maxlength: [150, 'Title cannot exceed 150 characters'],
    },
    type: {
      type: String,
      enum: {
        values: ['PLACEMENT', 'INTERNSHIP'],
        message: '{VALUE} is not a valid opportunity type. Must be PLACEMENT or INTERNSHIP',
      },
      required: [true, 'Opportunity type is required'],
    },
    companyName: {
      type: String,
      required: [true, 'Company name is required'],
      trim: true,
      maxlength: [120, 'Company name cannot exceed 120 characters'],
    },
    companyLogo: {
      type: String,
      trim: true,
      default: '',
    },
    companyWebsite: {
      type: String,
      trim: true,
      default: '',
    },
    description: {
      type: String,
      required: [true, 'Job description is required'],
      trim: true,
      maxlength: [10000, 'Description cannot exceed 10000 characters'],
    },
    responsibilities: {
      type: String,
      trim: true,
      default: '',
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
    role: {
      type: String,
      required: [true, 'Job role is required'],
      trim: true,
      maxlength: [120, 'Role cannot exceed 120 characters'],
    },
    department: {
      type: String,
      trim: true,
      default: '',
    },
    workMode: {
      type: String,
      enum: {
        values: ['ONSITE', 'HYBRID', 'REMOTE'],
        message: '{VALUE} is not a valid work mode',
      },
      default: 'ONSITE',
      required: [true, 'Work mode is required'],
    },
    location: {
      type: String,
      required: [true, 'Location is required'],
      trim: true,
      maxlength: [120, 'Location cannot exceed 120 characters'],
    },
    employmentType: {
      type: String,
      trim: true,
      default: 'Full-time',
    },
    experienceRequired: {
      type: String,
      trim: true,
      default: 'Fresher',
    },

    // Compensation
    salary: {
      type: String,
      trim: true,
      default: '',
    },
    salaryPeriod: {
      type: String,
      trim: true,
      default: 'Per Annum',
    },
    stipend: {
      type: String,
      trim: true,
      default: '',
    },
    otherBenefits: {
      type: String,
      trim: true,
      default: '',
    },

    // Eligibility Criteria (for dynamic verification in Phase 6)
    eligibleDepartments: [
      {
        type: String,
        trim: true,
      },
    ],
    eligibleGraduationYears: [
      {
        type: Number,
      },
    ],
    minimumCGPA: {
      type: Number,
      min: [0, 'Minimum CGPA cannot be negative'],
      max: [10, 'Maximum CGPA cannot exceed 10.0'],
      default: 0,
    },
    maximumBacklogs: {
      type: Number,
      min: [0, 'Maximum backlogs cannot be negative'],
      default: 0,
    },
    additionalEligibilityCriteria: {
      type: String,
      trim: true,
      default: '',
    },

    // Application details
    applicationDeadline: {
      type: Date,
      required: [true, 'Application deadline is required'],
    },
    applicationStartDate: {
      type: Date,
      default: Date.now,
    },
    externalApplicationUrl: {
      type: String,
      trim: true,
      default: '',
    },
    applicationInstructions: {
      type: String,
      trim: true,
      default: '',
    },

    // Opportunity Lifecycle State
    status: {
      type: String,
      enum: {
        values: ['DRAFT', 'PUBLISHED', 'CLOSED', 'ARCHIVED'],
        message: '{VALUE} is not a valid opportunity status',
      },
      default: 'DRAFT',
      required: true,
    },

    // Ownership & Audit metadata
    createdBy: {
      type: mongoose.Schema.Types.Mixed,
      required: [true, 'Creator identifier is required'],
    },
    updatedBy: {
      type: mongoose.Schema.Types.Mixed,
    },
    publishedAt: {
      type: Date,
    },
    closedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// MongoDB Query Indexes
opportunitySchema.index({ type: 1 });
opportunitySchema.index({ status: 1 });
opportunitySchema.index({ companyName: 1 });
opportunitySchema.index({ applicationDeadline: 1 });
opportunitySchema.index({ createdBy: 1 });
opportunitySchema.index({ createdAt: -1 });

// Text search index across key textual fields
opportunitySchema.index({
  title: 'text',
  companyName: 'text',
  role: 'text',
  requiredSkills: 'text',
  description: 'text',
});

module.exports = mongoose.model('Opportunity', opportunitySchema);
