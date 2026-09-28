const Competition = require('../models/Competition');
const Registration = require('../models/Registration');
const User = require('../models/User');
const { AppError } = require('../utils/errors');
const { evaluateCompetitionLifecycle } = require('./lifecycleService');

class RegistrationService {
  /**
   * Register a user for a competition with atomic concurrency & capacity protection
   */
  async registerUser({ competitionId, userId, idempotencyKey, paymentMethod = 'demo_razorpay' }) {
    if (!competitionId || !userId) {
      throw new AppError('Competition ID and User ID are required', 400, 'INVALID_INPUT');
    }

    // 1. Verify User exists
    const user = await User.findById(userId);
    if (!user) {
      throw new AppError('User not found', 404, 'USER_NOT_FOUND');
    }

    // 2. Check Idempotency Key first if supplied
    if (idempotencyKey) {
      const existingIdempotent = await Registration.findOne({ idempotencyKey, userId });
      if (existingIdempotent) {
        return {
          registration: existingIdempotent,
          isDuplicateSubmission: true,
          message: 'Registration already processed for this request key',
        };
      }
    }

    // 3. Fast pre-check for existing registration
    const existingRegistration = await Registration.findOne({ competitionId, userId });
    if (existingRegistration) {
      throw new AppError('You are already registered for this competition', 409, 'ALREADY_REGISTERED');
    }

    // 4. Retrieve competition & validate lifecycle
    const competition = await Competition.findById(competitionId);
    if (!competition) {
      throw new AppError('Competition not found', 404, 'COMPETITION_NOT_FOUND');
    }

    const lifecycle = evaluateCompetitionLifecycle(competition);

    if (competition.status === 'CANCELLED') {
      throw new AppError('This competition has been cancelled', 400, 'COMPETITION_CANCELLED');
    }

    if (lifecycle.lifecycleStatus === 'UPCOMING') {
      throw new AppError('Registration has not opened yet', 400, 'REGISTRATION_NOT_STARTED');
    }

    if (new Date() >= new Date(competition.importantDates.registrationClosesAt)) {
      throw new AppError('Registration for this competition has already closed', 400, 'REGISTRATION_CLOSED');
    }

    if (lifecycle.isFull || competition.bookedSpots >= competition.maxParticipants) {
      throw new AppError('Competition is already full. No spots left.', 409, 'COMPETITION_FULL');
    }

    // 5. ATOMIC CAPACITY RESERVATION
    // Uses atomic conditional update in MongoDB to prevent race conditions & overbooking
    const updatedCompetition = await Competition.findOneAndUpdate(
      {
        _id: competitionId,
        bookedSpots: { $lt: competition.maxParticipants },
      },
      {
        $inc: { bookedSpots: 1 },
      },
      { new: true }
    );

    if (!updatedCompetition) {
      // Race condition caught: another concurrent request took the final spot
      throw new AppError('Competition became full while processing your request', 409, 'COMPETITION_FULL');
    }

    // 6. Create registration record
    let registration;
    try {
      registration = await Registration.create({
        competitionId,
        userId,
        amountPaid: competition.entryFee,
        status: 'CONFIRMED',
        idempotencyKey: idempotencyKey || undefined,
        paymentId: `pay_razorpay_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      });
    } catch (err) {
      // Roll back spot reservation on any insertion failure (e.g. duplicate key race condition)
      await Competition.findByIdAndUpdate(competitionId, { $inc: { bookedSpots: -1 } });

      if (err.code === 11000) {
        throw new AppError('You are already registered for this competition', 409, 'ALREADY_REGISTERED');
      }
      throw err;
    }

    return {
      registration,
      competition: updatedCompetition,
      computed: evaluateCompetitionLifecycle(updatedCompetition),
      message: 'Registration successful!',
    };
  }

  /**
   * Get registration details for a user in a competition
   */
  async getUserRegistration(competitionId, userId) {
    if (!userId) return null;
    return Registration.findOne({ competitionId, userId }).lean();
  }
}

module.exports = new RegistrationService();
