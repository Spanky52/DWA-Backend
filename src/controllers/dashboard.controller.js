const prisma = require('../lib/prisma');

exports.getDashboardSummary = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const [user, habits, tasks, challenge, journal] = await Promise.all([
      prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          username: true,
          role: true,
          streak: true,
          longestStreak: true,
        },
      }),

      prisma.habit.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 5,
      }),

      prisma.task.findMany({
        where: { userId },
        orderBy: [
          { dueDate: 'asc' },
          { createdAt: 'desc' },
        ],
        take: 5,
      }),

      prisma.challenge.findFirst({
        where: { active: true },
        orderBy: { createdAt: 'desc' },
      }),

      prisma.journal.findFirst({
        where: { userId },
        orderBy: { date: 'desc' },
      }),
    ]);

    const today = {
      message: 'A calm and focused day ahead.',
      completed: 3,
      total: 5,
    };

    const stats = {
      weeklyCompletion: 78,
      focusHours: 132,
      longestStreak: user?.longestStreak || 0,
    };

    res.json({
      user,
      today,
      habits,
      tasks,
      challenge,
      journal,
      stats,
    });
  } catch (error) {
    next(error);
  }
};