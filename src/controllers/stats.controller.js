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

exports.getDetailedStats = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const tasksByStatus = await prisma.task.groupBy({
      by: ['status'],
      where: { userId },
      _count: { status: true },
    });

    const habitsByCategory = await prisma.habit.groupBy({
      by: ['category'],
      where: { userId, active: true },
      _count: { category: true },
    });

    const habitsWithCompletion = await prisma.habit.findMany({
      where: { userId, active: true },
      include: {
        logs: {
          where: {
            date: {
              gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
            },
          },
          orderBy: { date: 'desc' },
        },
      },
    });

    const habitStats = habitsWithCompletion.map((habit) => {
      const completedLogs = habit.logs.filter((log) => log.completed).length;
      const totalLogs = habit.logs.length;
      const completionRate = totalLogs > 0 ? Math.round((completedLogs / totalLogs) * 100) : 0;

      return {
        id: habit.id,
        title: habit.title,
        category: habit.category,
        completionRate,
        completedLogs,
        totalLogs,
      };
    });

    const activeChallenges = await prisma.challengeProgress.findMany({
      where: { userId, completed: false },
      include: { challenge: true },
      take: 5,
    });

    const completedChallenges = await prisma.challengeProgress.count({
      where: { userId, completed: true },
    });

    const journalMoodStats = await prisma.journal.groupBy({
      by: ['mood'],
      where: { userId },
      _count: { mood: true },
    });

    const weeklyProgress = await prisma.habitLog.findMany({
      where: {
        userId,
        date: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        },
      },
      orderBy: { date: 'desc' },
    });

    const userStats = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        streak: true,
        longestStreak: true,
      },
    });

    res.json({
      userId,
      summary: {
        totalHabits: habitsWithCompletion.length,
        totalTasks: tasksByStatus.reduce((acc, curr) => acc + curr._count.status, 0),
        activeChallenges: activeChallenges.length,
        completedChallenges,
        currentStreak: userStats?.streak || 0,
        longestStreak: userStats?.longestStreak || 0,
      },
      tasks: {
        byStatus: tasksByStatus,
      },
      habits: {
        byCategory: habitsByCategory,
        details: habitStats,
      },
      challenges: {
        active: activeChallenges,
        completedCount: completedChallenges,
      },
      journal: {
        moodDistribution: journalMoodStats,
      },
      weeklyProgress: weeklyProgress.reduce((acc, log) => {
        const dateStr = new Date(log.date).toISOString().split('T')[0];
        if (!acc[dateStr]) {
          acc[dateStr] = { total: 0, completed: 0 };
        }
        acc[dateStr].total++;
        if (log.completed) {
          acc[dateStr].completed++;
        }
        return acc;
      }, {}),
    });
  } catch (error) {
    next(error);
  }
};

exports.getWeeklyReport = async (req, res, next) => {
  try {
    const userId = req.user.id;

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

    const tasksCreated = await prisma.task.count({
      where: {
        userId,
        createdAt: {
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
    const habitCompletionRate = habitTotal > 0 ? Math.round((habitCompletions / habitTotal) * 100) : 0;

    const journalEntries = await prisma.journal.count({
      where: {
        userId,
        date: {
          gte: startOfWeek,
          lt: endOfWeek,
        },
      },
    });

    const challengesCompleted = await prisma.challengeProgress.count({
      where: {
        userId,
        completed: true,
        finishedAt: {
          gte: startOfWeek,
          lt: endOfWeek,
        },
      },
    });

    res.json({
      weekStart: startOfWeek,
      weekEnd: endOfWeek,
      tasks: {
        completed: tasksCompleted,
        created: tasksCreated,
      },
      habits: {
        completions: habitCompletions,
        total: habitTotal,
        completionRate: habitCompletionRate,
      },
      journal: {
        entries: journalEntries,
      },
      challenges: {
        completed: challengesCompleted,
      },
      overallScore: Math.round(
        (habitCompletionRate + (tasksCreated > 0 ? (tasksCompleted / tasksCreated) * 100 : 0)) / 2
      ),
    });
  } catch (error) {
    next(error);
  }
};