const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema(
  {
    competitionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Competition',
      required: [true, 'Competition ID is required'],
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      index: true,
    },
    registrationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Registration',
      required: [true, 'Registration ID is required'],
    },
    title: {
      type: String,
      required: [true, 'Submission title is required'],
      trim: true,
    },
    videoUrl: {
      type: String,
      required: [true, 'Video URL is required'],
    },
    description: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ['SUBMITTED', 'UNDER_REVIEW', 'ACCEPTED', 'REJECTED'],
      default: 'SUBMITTED',
      index: true,
    },
    score: {
      type: Number,
      min: 0,
      max: 100,
    },
    feedback: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// One submission per user per competition
submissionSchema.index({ competitionId: 1, userId: 1 }, { unique: true });

module.exports = mongoose.model('Submission', submissionSchema);
