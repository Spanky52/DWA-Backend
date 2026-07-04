const prisma = require('../lib/prisma');

async function getDashboardSummary(userId) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const [user, habits, tasks, challengeProgress, journal, notifications, todayHabitLogs] = await Promise.all([
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
        avatar: true,
        preferences: true,
      },
    }),
    prisma.habit.findMany({
      where: { userId, active: true },
      orderBy: { createdAt: 'desc' },
      take: 10,
      include: {
        logs: {
          where: { userId },
          orderBy: { date: 'desc' },
          take: 7,
        },
      },
    }),
    prisma.task.findMany({
      where: { userId },
      orderBy: [{ status: 'asc' }, { dueDate: 'asc' }],
      take: 10,
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
      take: 10,
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
  ]);

  const todayCompleted = todayHabitLogs.filter((log) => log.completed).length;
  const todayTotal = habits.length;

  const startOfWeek = new Date();
  startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
  startOfWeek.setHours(0, 0, 0, 0);
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(endOfWeek.getDate() + 7);

  const tasksCompletedThisWeek = await prisma.task.count({
    where: {
      userId,
      status: 'COMPLETED',
      completedAt: {
        gte: startOfWeek,
        lt: endOfWeek,
      },
    },
  });

  const habitLogsThisWeek = await prisma.habitLog.findMany({
    where: {
      userId,
      date: {
        gte: startOfWeek,
        lt: endOfWeek,
      },
    },
  });

  const habitCompletionsThisWeek = habitLogsThisWeek.filter((log) => log.completed).length;
  const habitTotalThisWeek = habitLogsThisWeek.length;
  const weeklyCompletion = habitTotalThisWeek > 0 ? Math.round((habitCompletionsThisWeek / habitTotalThisWeek) * 100) : 0;

  const completedChallenges = await prisma.challengeProgress.count({
    where: { userId, completed: true },
  });

  const activeChallenges = await prisma.challengeProgress.count({
    where: { userId, completed: false },
  });

  const stats = {
    weeklyCompletion,
    tasksCompletedThisWeek,
    currentStreak: user?.streak || 0,
    longestStreak: user?.longestStreak || 0,
    habitsCount: habits.length,
    tasksCount: tasks.length,
    notificationsCount: notifications.length,
    completedChallenges,
    activeChallenges,
    todayCompleted,
    todayTotal,
  };

  return {
    user,
    stats,
    habits,
    tasks,
    challenge: challengeProgress,
    journal,
    notifications,
    todayProgress: {
      completed: todayCompleted,
      total: todayTotal,
    },
  };
}

module.exports = { getDashboardSummary };