const bcrypt = require('bcryptjs');
const prisma = require('../src/lib/prisma');

async function main() {
  await prisma.adminLog.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.journal.deleteMany();
  await prisma.challengeProgress.deleteMany();
  await prisma.challenge.deleteMany();
  await prisma.habitLog.deleteMany();
  await prisma.habit.deleteMany();
  await prisma.task.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await bcrypt.hash('Password123!', 10);

  const admin = await prisma.user.create({
    data: {
      firstName: 'Admin',
      lastName: 'Unevenness',
      username: 'admin',
      email: 'admin@unevenness.com',
      password: passwordHash,
      role: 'ADMIN',
      bio: 'Platform administrator',
      preferences: { theme: 'dark' },
    },
  });

  const user = await prisma.user.create({
    data: {
      firstName: 'Carlos',
      lastName: 'Mendoza',
      username: 'carlos',
      email: 'carlos@unevenness.com',
      password: passwordHash,
      role: 'USER',
      bio: 'Productivity enthusiast',
      streak: 18,
      longestStreak: 48,
      preferences: { theme: 'dark', focusMode: true },
    },
  });

  const habitWorkout = await prisma.habit.create({
    data: {
      userId: user.id,
      title: 'Morning Workout',
      description: 'A 30-minute training session every morning.',
      category: 'Fitness',
      frequency: 'DAILY',
      goal: 1,
      color: '#4f46e5',
      icon: '💪',
      active: true,
    },
  });

  await prisma.habitLog.createMany({
    data: [
      { habitId: habitWorkout.id, userId: user.id, date: new Date('2026-06-30'), completed: true, notes: 'Great session' },
      { habitId: habitWorkout.id, userId: user.id, date: new Date('2026-07-01'), completed: true, notes: 'Consistency is building' },
    ],
  });

  await prisma.task.createMany({
    data: [
      { userId: user.id, title: 'Plan the week', description: 'Review priorities and focus', priority: 'HIGH', status: 'PENDING', dueDate: new Date('2026-07-02') },
      { userId: user.id, title: 'Review notes', description: 'Summarize key insights', priority: 'MEDIUM', status: 'IN_PROGRESS' },
      { userId: user.id, title: 'Prepare tomorrow', description: 'Set up the next day', priority: 'LOW', status: 'COMPLETED', completedAt: new Date() },
    ],
  });

  const challenge = await prisma.challenge.create({
    data: {
      title: '30-Day Discipline Challenge',
      description: 'A structured challenge to build strong routines and focus.',
      difficulty: 'MEDIUM',
      durationDays: 30,
      active: true,
      isTemplate: false,
      createdById: admin.id,
    },
  });

  await prisma.challengeProgress.create({
    data: {
      challengeId: challenge.id,
      userId: user.id,
      progress: 40,
      currentDay: 12,
      completed: false,
    },
  });

  await prisma.journal.create({
    data: {
      userId: user.id,
      title: 'Today’s Reflection',
      content: 'I stayed focused and finished the most important tasks.',
      mood: 'Motivated',
      date: new Date(),
    },
  });

  await prisma.notification.createMany({
    data: [
      { userId: user.id, title: 'Streak reminder', message: 'You are 18 days strong', type: 'SUCCESS' },
      { userId: user.id, title: 'Challenge update', message: 'You are on day 12 of your challenge', type: 'INFO' },
    ],
  });

  await prisma.adminLog.create({
    data: {
      adminId: admin.id,
      action: 'SEED',
      description: 'Initial Prisma seed applied',
      ip: '127.0.0.1',
    },
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
