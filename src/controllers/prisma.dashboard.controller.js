const { getDashboardSummary } = require('../services/dashboard.service');

exports.getDashboard = async (req, res, next) => {
  try {
    const summary = await getDashboardSummary(req.user.id);
    res.json(summary);
  } catch (error) {
    next(error);
  }
};
