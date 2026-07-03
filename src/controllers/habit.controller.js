const prisma = require('../lib/prisma'); // ajusta la ruta si tu archivo está en otro lado

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