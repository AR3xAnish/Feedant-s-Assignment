const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'User name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
      trim: true,
      default: '+91 98765 43210',
    },
    avatarUrl: {
      type: String,
      default: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80',
    },
    referralCode: {
      type: String,
      unique: true,
      uppercase: true,
      default: () => Math.random().toString(36).substring(2, 8).toUpperCase(),
    },
    role: {
      type: String,
      enum: ['USER', 'JUDGE', 'ADMIN'],
      default: 'USER',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('User', userSchema);
