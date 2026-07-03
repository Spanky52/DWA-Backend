const jwt = require('jsonwebtoken');
const prisma = require('../lib/prisma');

exports.authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const tokenFromHeader = authHeader?.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;
    const tokenFromCookie = req.cookies?.token;
    const token = tokenFromHeader || tokenFromCookie;

    if (!token) {
      return res.status(401).json({ message: 'Authorization required' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await prisma.user.findUnique({ where: { id: decoded.id } });

    if (!user) {
      return res.status(401).json({ message: 'Invalid token' });
    }

    req.user = { id: user.id, role: user.role, email: user.email };
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};

exports.authorizeAdmin = (req, res, next) => {
  if (req.user.role !== 'ADMIN') {
    return res.status(403).json({ message: 'Admin access only' });
  }
  next();
};
