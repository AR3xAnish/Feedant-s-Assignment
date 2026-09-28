const Competition = require('../models/Competition');
const Registration = require('../models/Registration');
const Submission = require('../models/Submission');
const { AppError } = require('../utils/errors');
const { evaluateCompetitionLifecycle } = require('./lifecycleService');

class CompetitionService {
  async getCompetitionById(competitionId, currentUserId = null) {
    const competition = await Competition.findById(competitionId);
    if (!competition) {
      throw new AppError('Competition not found', 404, 'COMPETITION_NOT_FOUND');
    }

    const computed = evaluateCompetitionLifecycle(competition);

    let userParticipation = {
      isRegistered: false,
      registrationId: null,
      registeredAt: null,
      hasSubmitted: false,
      submission: null,
    };

    if (currentUserId) {
      const registration = await Registration.findOne({
        competitionId: competition._id,
        userId: currentUserId,
      }).lean();

      if (registration) {
        userParticipation.isRegistered = true;
        userParticipation.registrationId = registration._id;
        userParticipation.registeredAt = registration.registeredAt;

        const submission = await Submission.findOne({
          competitionId: competition._id,
          userId: currentUserId,
        }).lean();

        if (submission) {
          userParticipation.hasSubmitted = true;
          userParticipation.submission = submission;
        }
      }
    }

    return {
      competition,
      computed,
      userParticipation,
    };
  }

  async getAllCompetitions() {
    const competitions = await Competition.find().sort({ createdAt: -1 });
    return competitions.map((comp) => ({
      competition: comp,
      computed: evaluateCompetitionLifecycle(comp),
    }));
  }

  async createSubmission({ competitionId, userId, title, videoUrl, description }) {
    if (!title || !videoUrl) {
      throw new AppError('Title and Video URL are required for submission', 400, 'INVALID_INPUT');
    }

    // 1. Verify competition exists & is in submission window
    const competition = await Competition.findById(competitionId);
    if (!competition) {
      throw new AppError('Competition not found', 404, 'COMPETITION_NOT_FOUND');
    }

    const lifecycle = evaluateCompetitionLifecycle(competition);
    if (!lifecycle.isSubmissionOpen) {
      throw new AppError(
        'Submission window is not currently active for this competition',
        400,
        'SUBMISSION_CLOSED'
      );
    }

    // 2. Verify user is registered
    const registration = await Registration.findOne({ competitionId, userId });
    if (!registration) {
      throw new AppError(
        'Only registered participants can submit entries',
        403,
        'REGISTRATION_REQUIRED'
      );
    }

    // 3. Check for existing submission
    const existingSubmission = await Submission.findOne({ competitionId, userId });
    if (existingSubmission) {
      throw new AppError('You have already submitted an entry for this competition', 409, 'ALREADY_SUBMITTED');
    }

    const submission = await Submission.create({
      competitionId,
      userId,
      registrationId: registration._id,
      title,
      videoUrl,
      description,
      status: 'SUBMITTED',
    });

    return submission;
  }
}

module.exports = new CompetitionService();
