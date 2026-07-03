const prisma = require('../lib/prisma');

exports.getStats = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const [habits, tasks, challenges, journals, user] = await Promise.all([
      prisma.habit.count({
        where: { userId },
      }),
      prisma.task.count({
        where: { userId },
      }),
      prisma.challenge.count({
        where: { active: true },
      }),
      prisma.journal.count({
        where: { userId },
      }),
      prisma.user.findUnique({
        where: { id: userId },
        select: {
          streak: true,
        },
      }),
    ]);

    res.json({
      userId,
      summary: {
        habits,
        tasks,
        challenges,
        journals,
        streak: user?.streak || 0,
      },
    });
  } catch (error) {
    next(error);
  }
};