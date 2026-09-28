const mongoose = require('mongoose');
const Competition = require('../models/Competition');
const Registration = require('../models/Registration');
const User = require('../models/User');
const { AppError } = require('../utils/errors');
const { evaluateCompetitionLifecycle } = require('./lifecycleService');

class RegistrationService {
  /**
   * Register a user for a competition.
   *
   * PRIMARY PRODUCTION PATH:
   * Multi-document ACID MongoDB Transaction with session.withTransaction()
   * (which automatically retries on TransientTransactionError / WriteConflict).
   *
   * DEVELOPMENT FALLBACK:
   * Explicit limited non-transactional atomic conditional counter update with compensating rollback,
   * used solely when running against single-node standalone MongoDB where transactions are unsupported.
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

    // 2. Retrieve competition
    const competition = await Competition.findById(competitionId);
    if (!competition) {
      throw new AppError('Competition not found', 404, 'COMPETITION_NOT_FOUND');
    }

    // 3. Check Idempotency Key - correctly scoped to (competitionId + userId + idempotencyKey)
    if (idempotencyKey) {
      const existingIdempotent = await Registration.findOne({
        competitionId,
        userId,
        idempotencyKey,
        status: 'CONFIRMED',
      });
      if (existingIdempotent) {
        // Return identical logical response on idempotency replay (operation replay guarantee)
        return {
          registration: existingIdempotent,
          competition,
          computed: evaluateCompetitionLifecycle(competition),
          idempotentReplay: true,
          message: 'Registration already processed for this request key',
        };
      }
    }

    // 4. Pre-check for active participation
    const existingActiveRegistration = await Registration.findOne({
      competitionId,
      userId,
      status: 'CONFIRMED',
    });
    if (existingActiveRegistration) {
      throw new AppError('You are already registered for this competition', 409, 'ALREADY_REGISTERED');
    }

    // 5. Authoritative Lifecycle Validations
    const lifecycle = evaluateCompetitionLifecycle(competition);

    if (competition.status === 'DRAFT') {
      throw new AppError('This competition is in draft mode and not open for registration', 400, 'COMPETITION_DRAFT');
    }

    if (competition.status === 'CANCELLED') {
      throw new AppError('This competition has been cancelled', 400, 'COMPETITION_CANCELLED');
    }

    if (competition.status === 'COMPLETED' || lifecycle.lifecycleStatus === 'COMPLETED') {
      throw new AppError('This competition has already completed', 400, 'COMPETITION_COMPLETED');
    }

    if (!lifecycle.canRegister) {
      if (lifecycle.lifecycleStatus === 'UPCOMING') {
        throw new AppError('Registration has not opened yet', 400, 'REGISTRATION_NOT_STARTED');
      }
      if (lifecycle.isFull) {
        throw new AppError('Competition is already full. No spots left.', 409, 'COMPETITION_FULL');
      }
      throw new AppError('Registration for this competition has already closed', 400, 'REGISTRATION_CLOSED');
    }

    // 6. Check if MongoDB deployment supports multi-document transactions (ReplicaSet or Sharded)
    const topology = mongoose.connection?.client?.topology?.description;
    const transactionSupported = Boolean(
      topology?.setName ||
      topology?.type === 'ReplicaSetWithPrimary' ||
      topology?.type === 'Sharded'
    );

    let session = null;
    if (transactionSupported) {
      try {
        session = await mongoose.startSession();
      } catch (err) {
        session = null;
      }
    }

    // PRIMARY PATH: Multi-Document ACID Transaction
    if (transactionSupported && session) {
      let finalRegistration = null;
      let finalUpdatedComp = null;

      try {
        await session.withTransaction(async () => {
          // 1. Atomic capacity guard & reservation inside transaction
          const updatedComp = await Competition.findOneAndUpdate(
            {
              _id: competitionId,
              bookedSpots: { $lt: competition.maxParticipants },
            },
            {
              $inc: { bookedSpots: 1 },
            },
            { session, new: true }
          );

          if (!updatedComp) {
            throw new AppError('Competition became full while processing your request', 409, 'COMPETITION_FULL');
          }

          finalUpdatedComp = updatedComp;

          // 2. Active registration check inside transaction
          const activeInsideTxn = await Registration.findOne({
            competitionId,
            userId,
            status: 'CONFIRMED',
          }).session(session);

          if (activeInsideTxn) {
            throw new AppError('You are already registered for this competition', 409, 'ALREADY_REGISTERED');
          }

          // 3. Atomically reactivate an existing CANCELLED registration if present
          const reactivated = await Registration.findOneAndUpdate(
            { competitionId, userId, status: 'CANCELLED' },
            {
              $set: {
                status: 'CONFIRMED',
                amountPaid: competition.entryFee,
                idempotencyKey: idempotencyKey || undefined,
                paymentId: `pay_razorpay_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
                registeredAt: new Date(),
              },
            },
            { session, new: true }
          );

          if (reactivated) {
            finalRegistration = reactivated;
          } else {
            // Create fresh registration record
            const created = await Registration.create(
              [
                {
                  competitionId,
                  userId,
                  amountPaid: competition.entryFee,
                  status: 'CONFIRMED',
                  idempotencyKey: idempotencyKey || undefined,
                  paymentId: `pay_razorpay_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
                  registeredAt: new Date(),
                },
              ],
              { session }
            );
            finalRegistration = created[0];
          }
        });

        return {
          registration: finalRegistration,
          competition: finalUpdatedComp,
          computed: evaluateCompetitionLifecycle(finalUpdatedComp),
          message: 'Registration successful!',
        };
      } catch (txnError) {
        if (txnError.code === 11000) {
          throw new AppError('You are already registered for this competition', 409, 'ALREADY_REGISTERED');
        }
        throw txnError;
      } finally {
        await session.endSession();
      }
    }

    // 7. Limited Non-Transactional Development Fallback (Standalone Mongo only)
    // NOTE: This fallback is NOT equivalent to an ACID transaction; it is provided solely
    // for single-node development where replica sets are unavailable.
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
      throw new AppError('Competition became full while processing your request', 409, 'COMPETITION_FULL');
    }

    let registration;
    try {
      // Concurrency-safe reactivation of cancelled registration
      const reactivated = await Registration.findOneAndUpdate(
        { competitionId, userId, status: 'CANCELLED' },
        {
          $set: {
            status: 'CONFIRMED',
            amountPaid: competition.entryFee,
            idempotencyKey: idempotencyKey || undefined,
            paymentId: `pay_razorpay_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
            registeredAt: new Date(),
          },
        },
        { new: true }
      );

      if (reactivated) {
        registration = reactivated;
      } else {
        registration = await Registration.create({
          competitionId,
          userId,
          amountPaid: competition.entryFee,
          status: 'CONFIRMED',
          idempotencyKey: idempotencyKey || undefined,
          paymentId: `pay_razorpay_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          registeredAt: new Date(),
        });
      }
    } catch (fallbackErr) {
      // Compensating rollback for standalone development mode only
      await Competition.findByIdAndUpdate(competitionId, { $inc: { bookedSpots: -1 } });
      if (fallbackErr.code === 11000) {
        throw new AppError('You are already registered for this competition', 409, 'ALREADY_REGISTERED');
      }
      throw fallbackErr;
    }

    return {
      registration,
      competition: updatedCompetition,
      computed: evaluateCompetitionLifecycle(updatedCompetition),
      message: 'Registration successful!',
    };
  }

  async getUserRegistration(competitionId, userId) {
    if (!userId) return null;
    return Registration.findOne({ competitionId, userId, status: 'CONFIRMED' }).lean();
  }
}

module.exports = new RegistrationService();
