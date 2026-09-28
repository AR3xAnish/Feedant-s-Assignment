const mongoose = require('mongoose');

const judgeSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, default: 'Manju Dubey' },
    title: { type: String, required: true, default: 'Professional Kathak Dancer' },
    experience: { type: String, required: true, default: '12+ Years of Experience' },
    avatarUrl: {
      type: String,
      default: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=300&q=80',
    },
    introVideoUrl: {
      type: String,
      default: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    },
  },
  { _id: false }
);

const importantDatesSchema = new mongoose.Schema(
  {
    registrationStartsAt: { type: Date, required: true },
    registrationClosesAt: { type: Date, required: true },
    submissionStartsAt: { type: Date, required: true },
    submissionEndsAt: { type: Date, required: true },
    resultDate: { type: Date, required: true },
  },
  { _id: false }
);

const previousWinnerSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    rank: { type: String, required: true }, // e.g. "1st Winner", "2nd Winner"
    videoThumbnail: { type: String, required: true },
    videoUrl: { type: String, default: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4' },
  },
  { _id: false }
);

const rewardSchema = new mongoose.Schema(
  {
    position: { type: String, required: true },
    amount: { type: Number, required: true },
    iconType: { type: String, enum: ['gold', 'silver', 'bronze', 'star'], default: 'star' },
  },
  { _id: false }
);

const reviewSchema = new mongoose.Schema(
  {
    userName: { type: String, required: true },
    userAvatar: { type: String },
    comment: { type: String, required: true },
    rating: { type: Number, min: 1, max: 5, default: 5 },
  },
  { _id: false }
);

const competitionSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Competition title is required'],
      trim: true,
      index: true,
    },
    slug: {
      type: String,
      unique: true,
      index: true,
    },
    category: {
      type: String,
      required: true,
      default: 'Dance',
    },
    tags: {
      type: [String],
      default: ['Dance', 'Multi-Win'],
    },
    perks: {
      type: [String],
      default: ['Winners get certificate'],
    },
    prizePool: {
      type: Number,
      required: true,
      min: [0, 'Prize pool cannot be negative'],
    },
    entryFee: {
      type: Number,
      required: true,
      min: [0, 'Entry fee cannot be negative'],
    },
    currency: {
      type: String,
      default: 'INR',
    },
    maxParticipants: {
      type: Number,
      required: true,
      min: [1, 'Maximum participants must be at least 1'],
    },
    bookedSpots: {
      type: Number,
      default: 0,
      min: [0, 'Booked spots cannot be negative'],
      index: true,
    },
    status: {
      type: String,
      enum: ['DRAFT', 'UPCOMING', 'ACTIVE', 'JUDGING', 'COMPLETED', 'CANCELLED'],
      default: 'ACTIVE',
      index: true,
    },
    judge: {
      type: judgeSchema,
      required: true,
    },
    importantDates: {
      type: importantDatesSchema,
      required: true,
    },
    previousWinners: [previousWinnerSchema],
    about: {
      type: String,
      default: 'This is an online classical dance competition open for all age groups. Participate from anywhere and showcase your talent. Express your passion through traditional dance.',
    },
    judgingCriteria: {
      type: [String],
      default: [
        'Rhythm, Timing & Footwork (Taal & Laya)',
        'Facial Expressions & Storytelling (Abhinaya & Bhava)',
        'Costume, Posture & Overall Stage Presence',
        'Creativity & Technique authenticity',
      ],
    },
    rulesAndEligibility: {
      type: [String],
      default: [
        'Open to all age groups and skill levels.',
        'Video submission must be between 2 to 5 minutes duration.',
        'Continuous single-take recording without video cuts or heavy filters.',
        'Submissions must be original solo/group performances.',
        'Only contributions from paid participants will be considered for judging.',
      ],
    },
    rewards: [rewardSchema],
    disclaimer: {
      type: String,
      default: 'Only contributions from paid participants will be considered for judging.',
    },
    paymentGateway: {
      type: String,
      default: 'Razorpay',
    },
    reviews: [reviewSchema],
  },
  {
    timestamps: true,
  }
);

// Virtual property for remaining spots
competitionSchema.virtual('remainingSpots').get(function () {
  return Math.max(0, this.maxParticipants - this.bookedSpots);
});

// Virtual property for isFull
competitionSchema.virtual('isFull').get(function () {
  return this.bookedSpots >= this.maxParticipants;
});

competitionSchema.set('toJSON', { virtuals: true });
competitionSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Competition', competitionSchema);
