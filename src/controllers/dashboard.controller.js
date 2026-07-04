const prisma = require('../lib/prisma');

exports.getDashboardSummary = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const [user, habits, tasks, activeChallenge, journal, todayHabitLogs, notifications] = await Promise.all([
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
          avatar: true,
        },
      }),

      prisma.habit.findMany({
        where: { userId, active: true },
        orderBy: { createdAt: 'desc' },
        take: 5,
      }),

      prisma.task.findMany({
        where: { userId },
        orderBy: [
          { status: 'asc' },
          { dueDate: 'asc' },
          { createdAt: 'desc' },
        ],
        take: 5,
      }),

      prisma.challengeProgress.findFirst({
        where: { userId, completed: false },
        orderBy: { startedAt: 'desc' },
        include: { challenge: true },
      }),

      prisma.journal.findFirst({
        where: { userId },
        orderBy: { date: 'desc' },
      }),

      prisma.habitLog.findMany({
        where: {
          userId,
          date: {
            gte: today,
            lt: tomorrow,
          },
        },
      }),

      prisma.notification.findMany({
        where: { userId, read: false },
        orderBy: { createdAt: 'desc' },
        take: 5,
      }),
    ]);

    const todayCompleted = todayHabitLogs.filter((log) => log.completed).length;
    const todayTotal = habits.length;

    const weeklyStats = await getWeeklyStats(userId);

    res.json({
      user,
      today: {
        message: getDailyMessage(),
        completed: todayCompleted,
        total: todayTotal,
      },
      habits,
      tasks,
      challenge: activeChallenge,
      journal,
      notifications,
      stats: {
        weeklyCompletion: weeklyStats.completionRate,
        tasksCompleted: weeklyStats.tasksCompleted,
        currentStreak: user?.streak || 0,
        longestStreak: user?.longestStreak || 0,
        activeHabits: habits.length,
        pendingTasks: tasks.filter((t) => t.status !== 'COMPLETED').length,
      },
    });
  } catch (error) {
    next(error);
  }
};

async function getWeeklyStats(userId) {
  const startOfWeek = new Date();
  startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
  startOfWeek.setHours(0, 0, 0, 0);

  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(endOfWeek.getDate() + 7);

  const tasksCompleted = await prisma.task.count({
    where: {
      userId,
      status: 'COMPLETED',
      completedAt: {
        gte: startOfWeek,
        lt: endOfWeek,
      },
    },
  });

  const habitLogs = await prisma.habitLog.findMany({
    where: {
      userId,
      date: {
        gte: startOfWeek,
        lt: endOfWeek,
      },
    },
  });

  const habitCompletions = habitLogs.filter((log) => log.completed).length;
  const habitTotal = habitLogs.length;
  const completionRate = habitTotal > 0 ? Math.round((habitCompletions / habitTotal) * 100) : 0;

  return {
    completionRate,
    tasksCompleted,
  };
}

function getDailyMessage() {
  const hour = new Date().getHours();

  if (hour < 12) {
    return 'Good morning! A fresh day to build consistency.';
  } else if (hour < 17) {
    return 'Good afternoon! Stay focused on your goals.';
  } else {
    return 'Good evening! Reflect on your progress today.';
  }
}