const prisma = require('../lib/prisma');
const bcrypt = require('bcryptjs');

const normalizeUser = (user) => ({
  id: user.id,
  firstName: user.firstName,
  lastName: user.lastName,
  username: user.username,
  email: user.email,
  role: user.role,
  avatar: user.avatar,
  bio: user.bio,
  streak: user.streak,
  longestStreak: user.longestStreak,
  preferences: user.preferences,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
});

exports.getProfile = async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: {
        id: req.user.id,
      },
    });

    if (!user) {
      return res.status(404).json({
        message: 'User not found',
      });
    }

    res.json(normalizeUser(user));
  } catch (error) {
    next(error);
  }
};

exports.updateProfile = async (req, res, next) => {
  try {
    const {
      role,
      email,
      id,
      password,
      createdAt,
      updatedAt,
      ...updates
    } = req.body;

    const user = await prisma.user.update({
      where: {
        id: req.user.id,
      },
      data: updates,
    });

    res.json(normalizeUser(user));
  } catch (error) {
    next(error);
  }
};

exports.changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        message: 'Current password and new password are required',
      });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({
        message: 'New password must be at least 8 characters',
      });
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { password: true },
    });

    const isValid = await bcrypt.compare(currentPassword, user.password);

    if (!isValid) {
      return res.status(401).json({
        message: 'Current password is incorrect',
      });
    }

    const passwordHash = await bcrypt.hash(newPassword, 12);

    await prisma.user.update({
      where: { id: req.user.id },
      data: { password: passwordHash },
    });

    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    next(error);
  }
};

exports.updatePreferences = async (req, res, next) => {
  try {
    const { preferences } = req.body;

    const user = await prisma.user.update({
      where: { id: req.user.id },
      data: { preferences },
    });

    res.json(normalizeUser(user));
  } catch (error) {
    next(error);
  }
};