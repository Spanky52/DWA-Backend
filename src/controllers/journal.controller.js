const prisma = require('../lib/prisma');

exports.createEntry = async (req, res, next) => {
  try {
    const entry = await prisma.journal.create({
      data: {
        ...req.body,
        userId: req.user.id,
      },
    });

    res.status(201).json(entry);
  } catch (error) {
    next(error);
  }
};

exports.getEntries = async (req, res, next) => {
  try {
    const entries = await prisma.journal.findMany({
      where: { userId: req.user.id },
      orderBy: [
        { date: 'desc' },
        { createdAt: 'desc' },
      ],
    });

    res.json(entries);
  } catch (error) {
    next(error);
  }
};

exports.updateEntry = async (req, res, next) => {
  try {
    const existing = await prisma.journal.findFirst({
      where: {
        id: req.params.id,
        userId: req.user.id,
      },
    });

    if (!existing) {
      return res.status(404).json({ message: 'Journal entry not found' });
    }

    const entry = await prisma.journal.update({
      where: { id: req.params.id },
      data: req.body,
    });

    res.json(entry);
  } catch (error) {
    next(error);
  }
};

exports.deleteEntry = async (req, res, next) => {
  try {
    const existing = await prisma.journal.findFirst({
      where: {
        id: req.params.id,
        userId: req.user.id,
      },
    });

    if (!existing) {
      return res.status(404).json({ message: 'Journal entry not found' });
    }

    await prisma.journal.delete({
      where: { id: req.params.id },
    });

    res.json({ message: 'Journal entry deleted' });
  } catch (error) {
    next(error);
  }
};