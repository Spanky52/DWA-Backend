const prisma = require('../lib/prisma');

exports.createHabit = async (req, res, next) => {
  try {
    const habit = await prisma.habit.create({
      data: {
        ...req.body,
        userId: req.user.id,
      },
    });

    res.status(201).json(habit);
  } catch (error) {
    next(error);
  }
};

exports.getHabits = async (req, res, next) => {
  try {
    const habits = await prisma.habit.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' },
    });

    res.json(habits);
  } catch (error) {
    next(error);
  }
};

exports.getHabitById = async (req, res, next) => {
  try {
    const habit = await prisma.habit.findFirst({
      where: {
        id: req.params.id,
        userId: req.user.id,
      },
      include: {
        logs: {
          orderBy: { date: 'desc' },
          take: 30,
        },
      },
    });

    if (!habit) {
      return res.status(404).json({ message: 'Habit not found' });
    }

    res.json(habit);
  } catch (error) {
    next(error);
  }
};

exports.updateHabit = async (req, res, next) => {
  try {
    const existing = await prisma.habit.findFirst({
      where: {
        id: req.params.id,
        userId: req.user.id,
      },
    });

    if (!existing) {
      return res.status(404).json({ message: 'Habit not found' });
    }

    const updated = await prisma.habit.update({
      where: { id: req.params.id },
      data: req.body,
    });

    res.json(updated);
  } catch (error) {
    next(error);
  }
};

exports.deleteHabit = async (req, res, next) => {
  try {
    const existing = await prisma.habit.findFirst({
      where: {
        id: req.params.id,
        userId: req.user.id,
      },
    });

    if (!existing) {
      return res.status(404).json({ message: 'Habit not found' });
    }

    await prisma.habit.delete({
      where: { id: req.params.id },
    });

    res.json({ message: 'Habit deleted' });
  } catch (error) {
    next(error);
  }
};

exports.toggleHabitCompletion = async (req, res, next) => {
  try {
    const habitId = req.params.id;
    const userId = req.user.id;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const habit = await prisma.habit.findFirst({
      where: { id: habitId, userId },
    });

    if (!habit) {
      return res.status(404).json({ message: 'Habit not found' });
    }

    const existingLog = await prisma.habitLog.findFirst({
      where: {
        habitId,
        userId,
        date: {
          gte: today,
          lt: new Date(today.getTime() + 24 * 60 * 60 * 1000),
        },
      },
    });

    let log;
    if (existingLog) {
      log = await prisma.habitLog.update({
        where: { id: existingLog.id },
        data: {
          completed: !existingLog.completed,
          notes: req.body.notes,
        },
      });
    } else {
      log = await prisma.habitLog.create({
        data: {
          habitId,
          userId,
          date: today,
          completed: true,
          notes: req.body.notes,
        },
      });
    }

    const totalLogs = await prisma.habitLog.count({
      where: {
        habitId,
        userId,
        completed: true,
      },
    });

    const completedDays = await prisma.habitLog.findMany({
      where: {
        habitId,
        userId,
        completed: true,
      },
      orderBy: { date: 'desc' },
      select: { date: true },
    });

    let streak = 0;
    let currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);

    for (const logEntry of completedDays) {
      const logDate = new Date(logEntry.date);
      logDate.setHours(0, 0, 0, 0);

      const diffDays = Math.floor((currentDate - logDate) / (1000 * 60 * 60 * 24));

      if (streak === 0 && diffDays <= 1) {
        streak = 1;
        currentDate = logDate;
      } else if (diffDays === 1) {
        streak++;
        currentDate = logDate;
      } else {
        break;
      }
    }

    await prisma.habit.update({
      where: { id: habitId },
      data: { streak },
    });

    res.json({
      log,
      streak,
      totalCompletions: totalLogs,
    });
  } catch (error) {
    next(error);
  }
};

exports.getHabitStats = async (req, res, next) => {
  try {
    const habitId = req.params.id;
    const userId = req.user.id;

    const habit = await prisma.habit.findFirst({
      where: { id: habitId, userId },
    });

    if (!habit) {
      return res.status(404).json({ message: 'Habit not found' });
    }

    const totalLogs = await prisma.habitLog.count({
      where: { habitId, userId },
    });

    const completedLogs = await prisma.habitLog.count({
      where: {
        habitId,
        userId,
        completed: true,
      },
    });

    const completionRate = totalLogs > 0 ? Math.round((completedLogs / totalLogs) * 100) : 0;

    const weeklyLogs = await prisma.habitLog.findMany({
      where: {
        habitId,
        userId,
        date: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        },
      },
      orderBy: { date: 'desc' },
    });

    res.json({
      habitId,
      totalLogs,
      completedLogs,
      completionRate,
      weeklyLogs,
    });
  } catch (error) {
    next(error);
  }
};