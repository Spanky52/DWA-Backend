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
    const { startDate, endDate, mood } = req.query;
    const where = { userId: req.user.id };

    if (startDate || endDate) {
      where.date = {};
      if (startDate) {
        where.date.gte = new Date(startDate);
      }
      if (endDate) {
        where.date.lte = new Date(endDate);
      }
    }

    if (mood) {
      where.mood = mood;
    }

    const entries = await prisma.journal.findMany({
      where,
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

exports.getEntryById = async (req, res, next) => {
  try {
    const entry = await prisma.journal.findFirst({
      where: {
        id: req.params.id,
        userId: req.user.id,
      },
    });

    if (!entry) {
      return res.status(404).json({ message: 'Journal entry not found' });
    }

    res.json(entry);
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