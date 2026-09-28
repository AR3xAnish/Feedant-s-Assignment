const mongoose = require('mongoose');

const registrationSchema = new mongoose.Schema(
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
    status: {
      type: String,
      enum: ['PENDING', 'CONFIRMED', 'CANCELLED'],
      default: 'CONFIRMED',
      index: true,
    },
    amountPaid: {
      type: Number,
      required: true,
      min: 0,
    },
    paymentId: {
      type: String,
      default: () => `pay_demo_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    },
    idempotencyKey: {
      type: String,
      trim: true,
      sparse: true,
      index: true,
    },
    registeredAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// CRITICAL CONSTRAINTS:
// 1. Prevent duplicate registrations for the same user in the same competition
registrationSchema.index({ competitionId: 1, userId: 1 }, { unique: true });

module.exports = mongoose.model('Registration', registrationSchema);
