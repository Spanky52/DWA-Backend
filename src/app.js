const dotenv = require('dotenv');
dotenv.config();

const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');

const errorMiddleware = require('./middleware/error.middleware');
const validatorMiddleware = require('./middleware/validator.middleware');

const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/users.routes');
const habitRoutes = require('./routes/habits.routes');
const taskRoutes = require('./routes/tasks.routes');
const challengeRoutes = require('./routes/challenges.routes');
const journalRoutes = require('./routes/journals.routes');
const statsRoutes = require('./routes/stats.routes');
const adminRoutes = require('./routes/admin.routes');
const dashboardRoutes = require('./routes/dashboard.routes');
const prismaDashboardRoutes = require('./routes/prisma.dashboard.routes');

const app = express();

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(cookieParser());
app.use(validatorMiddleware);

app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'unevenness-backend',
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/habits', habitRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/challenges', challengeRoutes);
app.use('/api/journals', journalRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/prisma/dashboard', prismaDashboardRoutes);

app.use(errorMiddleware);

module.exports = app;