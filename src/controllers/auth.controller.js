const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { Pool } = require('pg');
const { createId } = require('@paralleldrive/cuid2');
require('dotenv').config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const normalizeUser = (user) => ({
  id: user.id,
  firstName: user.firstName,
  lastName: user.lastName,
  username: user.username,
  email: user.email,
  role: user.role,
  avatar: user.avatar,
  bio: user.bio,
  streak: user.streak,
  longestStreak: user.longestStreak,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
});

const createToken = (user) =>
  jwt.sign(
    { id: user.id, role: user.role, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES || '7d' }
  );

const setAuthCookie = (res, token) => {
  res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
};

exports.register = async (req, res, next) => {
  try {
    const requiredFields = ['firstName', 'lastName', 'username', 'email', 'password'];

    const missingFields = requiredFields.filter((field) => {
      const value = req.body[field];
      return value === undefined || value === null || String(value).trim() === '';
    });

    if (missingFields.length) {
      return res.status(400).json({
        message: `Missing required fields: ${missingFields.join(', ')}`,
      });
    }

    const existingUser = await pool.query(
      'SELECT id FROM users WHERE email = $1',
      [req.body.email]
    );

    if (existingUser.rows.length > 0) {
      return res.status(409).json({
        message: 'Email already registered',
      });
    }

    const usernameTaken = await pool.query(
      'SELECT id FROM users WHERE username = $1',
      [req.body.username]
    );

    if (usernameTaken.rows.length > 0) {
      return res.status(409).json({
        message: 'Username already taken',
      });
    }

    const passwordHash = await bcrypt.hash(req.body.password, 12);
    const id = createId();

    const createdUser = await pool.query(
      `
      INSERT INTO users
      (
        id,
        "firstName",
        "lastName",
        username,
        email,
        password,
        role,
        "createdAt",
        "updatedAt"
      )
      VALUES
      (
        $1, $2, $3, $4, $5, $6, $7, NOW(), NOW()
      )
      RETURNING
        id,
        "firstName",
        "lastName",
        username,
        email,
        role,
        avatar,
        bio,
        streak,
        "longestStreak",
        "createdAt",
        "updatedAt"
      `,
      [
        id,
        req.body.firstName,
        req.body.lastName,
        req.body.username,
        req.body.email,
        passwordHash,
        'USER',
      ]
    );

    const user = createdUser.rows[0];

    const token = createToken(user);
    setAuthCookie(res, token);

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: normalizeUser(user),
    });
  } catch (error) {
    console.error('Auth register error:', error);

    if (
      error?.message?.includes('SASL') ||
      error?.message?.includes('password') ||
      error?.message?.includes('authentication')
    ) {
      return res.status(503).json({
        message: 'Database authentication failed. Verify your PostgreSQL credentials.',
      });
    }

    next(error);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: 'Email and password are required',
      });
    }

    const userResult = await pool.query(
      `
      SELECT
        id,
        "firstName",
        "lastName",
        username,
        email,
        role,
        avatar,
        bio,
        streak,
        "longestStreak",
        password,
        "createdAt",
        "updatedAt"
      FROM users
      WHERE email = $1
      `,
      [email]
    );

    const user = userResult.rows[0];

    if (!user) {
      return res.status(401).json({
        message: 'Invalid credentials',
      });
    }

    const validPassword = await bcrypt.compare(password, user.password);

    if (!validPassword) {
      return res.status(401).json({
        message: 'Invalid credentials',
      });
    }

    const token = createToken(user);
    setAuthCookie(res, token);

    res.json({
      message: 'Login successful',
      token,
      user: normalizeUser(user),
    });
  } catch (error) {
    console.error('Auth login error:', error);

    if (
      error?.message?.includes('SASL') ||
      error?.message?.includes('password') ||
      error?.message?.includes('authentication')
    ) {
      return res.status(503).json({
        message: 'Database authentication failed. Verify your PostgreSQL credentials.',
      });
    }

    next(error);
  }
};

exports.getMe = async (req, res, next) => {
  try {
    const userResult = await pool.query(
      `
      SELECT
        id,
        "firstName",
        "lastName",
        username,
        email,
        role,
        avatar,
        bio,
        streak,
        "longestStreak",
        "createdAt",
        "updatedAt"
      FROM users
      WHERE id = $1
      `,
      [req.user.id]
    );

    const user = userResult.rows[0];

    if (!user) {
      return res.status(404).json({
        message: 'User not found',
      });
    }

    res.json({
      user: normalizeUser(user),
    });
  } catch (error) {
    next(error);
  }
};

exports.logout = (req, res) => {
  res.clearCookie('token', {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
  });

  res.json({
    message: 'Logged out successfully',
  });
};