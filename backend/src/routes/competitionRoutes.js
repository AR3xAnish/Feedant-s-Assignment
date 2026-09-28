const express = require('express');
const router = express.Router();
const competitionController = require('../controllers/competitionController');

router.get('/', competitionController.getCompetitions);
router.get('/:id', competitionController.getCompetitionById);
router.post('/:id/register', competitionController.register);
router.post('/:id/submissions', competitionController.submitEntry);

module.exports = router;
