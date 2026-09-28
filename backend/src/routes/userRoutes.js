const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

router.get('/', userController.getAllUsers);
router.get('/me', userController.getCurrentUser);
router.post('/', userController.createUser);

module.exports = router;
