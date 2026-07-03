const Challenge = require('../lib/prisma');

exports.createChallenge = async (req, res, next) => {
  try {
    const challenge = await Challenge.create({ ...req.body, createdBy: req.user.id });
    res.status(201).json(challenge);
  } catch (error) {
    next(error);
  }
};

exports.getChallenges = async (req, res, next) => {
  try {
    const challenges = await Challenge.find({ active: true }).sort({ createdAt: -1 });
    res.json(challenges);
  } catch (error) {
    next(error);
  }
};

exports.updateChallenge = async (req, res, next) => {
  try {
    const challenge = await Challenge.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!challenge) {
      return res.status(404).json({ message: 'Challenge not found' });
    }

    res.json(challenge);
  } catch (error) {
    next(error);
  }
};

exports.deleteChallenge = async (req, res, next) => {
  try {
    const challenge = await Challenge.findByIdAndDelete(req.params.id);
    if (!challenge) {
      return res.status(404).json({ message: 'Challenge not found' });
    }

    res.json({ message: 'Challenge deleted' });
  } catch (error) {
    next(error);
  }
};
