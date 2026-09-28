const User = require('../models/User');
const { AppError } = require('../utils/errors');

class UserController {
  async getAllUsers(req, res, next) {
    try {
      const users = await User.find().sort({ createdAt: 1 });
      res.status(200).json({
        success: true,
        count: users.length,
        data: users,
      });
    } catch (err) {
      next(err);
    }
  }

  async getCurrentUser(req, res, next) {
    try {
      const userId = req.headers['x-user-id'] || req.query.userId;
      if (!userId) {
        throw new AppError('No user ID supplied in x-user-id header', 400, 'USER_ID_REQUIRED');
      }

      const user = await User.findById(userId);
      if (!user) {
        throw new AppError('User not found', 404, 'USER_NOT_FOUND');
      }

      res.status(200).json({
        success: true,
        data: user,
      });
    } catch (err) {
      next(err);
    }
  }

  async createUser(req, res, next) {
    try {
      const { name, email, phone, avatarUrl } = req.body;
      if (!name || !email) {
        throw new AppError('Name and email are required', 400, 'INVALID_INPUT');
      }

      const user = await User.create({ name, email, phone, avatarUrl });
      res.status(201).json({
        success: true,
        data: user,
      });
    } catch (err) {
      if (err.code === 11000) {
        return next(new AppError('A user with this email already exists', 409, 'DUPLICATE_EMAIL'));
      }
      next(err);
    }
  }
}

module.exports = new UserController();
