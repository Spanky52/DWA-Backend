const prisma = require('../lib/prisma');

exports.createTask = async (req, res, next) => {
  try {
    const task = await prisma.task.create({
      data: {
        ...req.body,
        userId: req.user.id,
      },
    });

    res.status(201).json(task);
  } catch (error) {
    next(error);
  }
};

exports.getTasks = async (req, res, next) => {
  try {
    const tasks = await prisma.task.findMany({
      where: { userId: req.user.id },
      orderBy: [
        { dueDate: 'asc' },
        { createdAt: 'desc' },
      ],
    });

    res.json(tasks);
  } catch (error) {
    next(error);
  }
};

exports.updateTask = async (req, res, next) => {
  try {
    const existing = await prisma.task.findFirst({
      where: {
        id: req.params.id,
        userId: req.user.id,
      },
    });

    if (!existing) {
      return res.status(404).json({ message: 'Task not found' });
    }

    const task = await prisma.task.update({
      where: { id: req.params.id },
      data: req.body,
    });

    res.json(task);
  } catch (error) {
    next(error);
  }
};

exports.deleteTask = async (req, res, next) => {
  try {
    const existing = await prisma.task.findFirst({
      where: {
        id: req.params.id,
        userId: req.user.id,
      },
    });

    if (!existing) {
      return res.status(404).json({ message: 'Task not found' });
    }

    await prisma.task.delete({
      where: { id: req.params.id },
    });

    res.json({ message: 'Task deleted' });
  } catch (error) {
    next(error);
  }
};