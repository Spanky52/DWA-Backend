const prisma = require('../lib/prisma');

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