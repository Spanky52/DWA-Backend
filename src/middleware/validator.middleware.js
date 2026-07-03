module.exports = (req, res, next) => {
  const body = req.body || {};
  const { email, password } = body;

  if (req.path === '/login' && (!email || !password)) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  next();
};
