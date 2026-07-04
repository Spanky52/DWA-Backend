const prisma = require('../lib/prisma');

exports.createChallenge = async (req, res, next) => {
  try {
    const challenge = await prisma.challenge.create({
      data: {
        title: req.body.title,
        description: req.body.description,
        difficulty: req.body.difficulty,
        durationDays: req.body.durationDays,
        active: req.body.active,
        isTemplate: req.body.isTemplate,
        createdById: req.user.id,
      },
    });

    res.status(201).json(challenge);
  } catch (error) {
    next(error);
  }
};

exports.getChallenges = async (req, res, next) => {
  try {
    const challenges = await prisma.challenge.findMany({
      where: { active: true },
      orderBy: { createdAt: 'desc' },
    });

    res.json(challenges);
  } catch (error) {
    next(error);
  }
};

exports.getChallengeById = async (req, res, next) => {
  try {
    const challenge = await prisma.challenge.findUnique({
      where: { id: req.params.id },
    });

    if (!challenge) {
      return res.status(404).json({ message: 'Challenge not found' });
    }

    res.json(challenge);
  } catch (error) {
    next(error);
  }
};

exports.updateChallenge = async (req, res, next) => {
  try {
    const challenge = await prisma.challenge.update({
      where: { id: req.params.id },
      data: req.body,
    });

    res.json(challenge);
  } catch (error) {
    next(error);
  }
};

exports.deleteChallenge = async (req, res, next) => {
  try {
    await prisma.challenge.delete({
      where: { id: req.params.id },
    });

    res.json({ message: 'Challenge deleted' });
  } catch (error) {
    next(error);
  }
};

exports.joinChallenge = async (req, res, next) => {
  try {
    const existing = await prisma.challengeProgress.findFirst({
      where: {
        challengeId: req.params.id,
        userId: req.user.id,
      },
    });

    if (existing) {
      return res.status(400).json({ message: 'Already enrolled in this challenge' });
    }

    const progress = await prisma.challengeProgress.create({
      data: {
        challengeId: req.params.id,
        userId: req.user.id,
        progress: 0,
        currentDay: 1,
        completed: false,
        startedAt: new Date(),
      },
      include: { challenge: true },
    });

    res.status(201).json(progress);
  } catch (error) {
    next(error);
  }
};

exports.updateProgress = async (req, res, next) => {
  try {
    const progress = await prisma.challengeProgress.findFirst({
      where: {
        challengeId: req.params.id,
        userId: req.user.id,
      },
      include: { challenge: true },
    });

    if (!progress) {
      return res.status(404).json({ message: 'Progress not found' });
    }

    const challenge = progress.challenge;
    const newDay = Math.min(progress.currentDay + 1, challenge.durationDays);
    const newProgress = Math.round((newDay / challenge.durationDays) * 100);
    const completed = newDay >= challenge.durationDays;

    const updated = await prisma.challengeProgress.update({
      where: { id: progress.id },
      data: {
        currentDay: newDay,
        progress: newProgress,
        completed,
        finishedAt: completed ? new Date() : null,
      },
    });

    res.json(updated);
  } catch (error) {
    next(error);
  }
};

exports.getUserChallenges = async (req, res, next) => {
  try {
    const challenges = await prisma.challengeProgress.findMany({
      where: { userId: req.user.id },
      orderBy: { startedAt: 'desc' },
      include: { challenge: true },
    });

    res.json(challenges);
  } catch (error) {
    next(error);
  }
};