const competitionService = require('../services/competitionService');
const registrationService = require('../services/registrationService');
const mongoose = require('mongoose');
const { AppError } = require('../utils/errors');

class CompetitionController {
  async getCompetitions(req, res, next) {
    try {
      const data = await competitionService.getAllCompetitions();
      res.status(200).json({
        success: true,
        count: data.length,
        data,
      });
    } catch (err) {
      next(err);
    }
  }

  async getCompetitionById(req, res, next) {
    try {
      const { id } = req.params;
      const currentUserId = req.headers['x-user-id'] || req.query.userId || null;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new AppError('Invalid competition ID format', 400, 'INVALID_ID');
      }

      if (currentUserId && !mongoose.Types.ObjectId.isValid(currentUserId)) {
        throw new AppError('Invalid user ID format in request header', 400, 'INVALID_USER_ID');
      }

      const result = await competitionService.getCompetitionById(id, currentUserId);
      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (err) {
      next(err);
    }
  }

  async register(req, res, next) {
    try {
      const { id } = req.params;
      const userId = req.headers['x-user-id'] || req.body.userId;
      const idempotencyKey = req.headers['idempotency-key'] || req.body.idempotencyKey;
      const paymentMethod = req.body.paymentMethod || 'demo_razorpay';

      if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new AppError('Invalid competition ID format', 400, 'INVALID_ID');
      }

      if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
        throw new AppError('Valid user authentication (x-user-id) is required to register', 401, 'UNAUTHORIZED');
      }

      const result = await registrationService.registerUser({
        competitionId: id,
        userId,
        idempotencyKey,
        paymentMethod,
      });

      res.status(201).json({
        success: true,
        message: result.message,
        data: result,
      });
    } catch (err) {
      next(err);
    }
  }

  async submitEntry(req, res, next) {
    try {
      const { id } = req.params;
      const userId = req.headers['x-user-id'] || req.body.userId;
      const { title, videoUrl, description } = req.body;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new AppError('Invalid competition ID format', 400, 'INVALID_ID');
      }

      if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
        throw new AppError('Valid user authentication is required to submit', 401, 'UNAUTHORIZED');
      }

      const submission = await competitionService.createSubmission({
        competitionId: id,
        userId,
        title,
        videoUrl,
        description,
      });

      res.status(201).json({
        success: true,
        message: 'Submission successfully received!',
        data: submission,
      });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new CompetitionController();
