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
    const { status, priority } = req.query;
    const where = { userId: req.user.id };

    if (status) {
      where.status = status.toUpperCase();
    }

    if (priority) {
      where.priority = priority.toUpperCase();
    }

    const tasks = await prisma.task.findMany({
      where,
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

exports.getTaskById = async (req, res, next) => {
  try {
    const task = await prisma.task.findFirst({
      where: {
        id: req.params.id,
        userId: req.user.id,
      },
    });

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    res.json(task);
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

exports.updateTaskStatus = async (req, res, next) => {
  try {
    const { status } = req.body;

    if (!['PENDING', 'IN_PROGRESS', 'COMPLETED'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const existing = await prisma.task.findFirst({
      where: {
        id: req.params.id,
        userId: req.user.id,
      },
    });

    if (!existing) {
      return res.status(404).json({ message: 'Task not found' });
    }

    const updateData = {
      status,
      updatedAt: new Date(),
    };

    if (status === 'COMPLETED') {
      updateData.completedAt = new Date();
    }

    const task = await prisma.task.update({
      where: { id: req.params.id },
      data: updateData,
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