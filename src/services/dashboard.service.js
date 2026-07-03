const prisma = require('../lib/prisma');

async function getDashboardSummary(userId) {
  const [user, habits, tasks, challengeProgress, journal, notifications] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        streak: true,
        longestStreak: true,
        role: true,
      },
    }),
    prisma.habit.findMany({
      where: { userId, active: true },
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: {
        logs: {
          where: { userId },
          orderBy: { date: 'desc' },
          take: 5,
        },
      },
    }),
    prisma.task.findMany({
      where: { userId },
      orderBy: [{ status: 'asc' }, { dueDate: 'asc' }],
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
    prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 5,
    }),
  ]);

  const stats = {
    weeklyCompletion: 78,
    focusHours: 132,
    currentStreak: user?.streak || 0,
    longestStreak: user?.longestStreak || 0,
    habitsCount: habits.length,
    tasksCount: tasks.length,
    notificationsCount: notifications.length,
  };

  return {
    user,
    stats,
    habits,
    tasks,
    challenge: challengeProgress,
    journal,
    notifications,
  };
}

module.exports = { getDashboardSummary };
