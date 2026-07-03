const prisma = require('../lib/prisma');

exports.getOverview = async (req, res, next) => {
  try {
    const [users, logs] = await Promise.all([
      prisma.user.count(),
      prisma.adminLog.count(),
    ]);

    res.json({ users, logs });
  } catch (error) {
    next(error);
  }
};

exports.getUsers = async (req, res, next) => {
  try {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        username: true,
        email: true,
        role: true,
        avatar: true,
        bio: true,
        streak: true,
        longestStreak: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    res.json(users);
  } catch (error) {
    next(error);
  }
};

exports.getUserById = async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.params.id },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        username: true,
        email: true,
        role: true,
        avatar: true,
        bio: true,
        streak: true,
        longestStreak: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    next(error);
  }
};

exports.getLogs = async (req, res, next) => {
  try {
    const logs = await prisma.adminLog.findMany({
      orderBy: { createdAt: 'desc' },
    });

    res.json(logs);
  } catch (error) {
    next(error);
  }
};