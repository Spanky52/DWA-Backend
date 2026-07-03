# Prisma migration guide for Unevenness

## 1. Install dependencies

```bash
npm install prisma @prisma/client
npx prisma init --datasource-provider postgresql
```

## 2. Configure DATABASE_URL

Set the connection string in your environment:

```env
DATABASE_URL=postgresql://postgres:5252@localhost:5432/unevenness
```

## 3. Define the schema

Use the Prisma schema in `prisma/schema.prisma` with all relational models for users, habits, tasks, challenges, journals, notifications and admin logs.

## 4. Generate Prisma Client

```bash
npx prisma generate
```

## 5. Create the database and apply migrations

```bash
npx prisma migrate dev --name init
```

## 6. Seed the database

```bash
node prisma/seed.js
```

## 7. Replace Mongoose usage

- Remove the old Mongoose models and controllers from the app flow.
- Import the Prisma singleton from `src/lib/prisma.js`.
- Use Prisma queries instead of `mongoose.model(...)` and `findById`, `create`, etc.

## 8. Recommended folder structure

```text
src/
  lib/
    prisma.js
  services/
    dashboard.service.js
  controllers/
    prisma.dashboard.controller.js
  routes/
    prisma.dashboard.routes.js
prisma/
  schema.prisma
  seed.js
```

## 9. Production recommendations

- Run migrations in CI/CD.
- Use connection pooling with Prisma Accelerate or PgBouncer for production.
- Avoid N+1 queries by using `include` and selective selects.
- Keep transaction boundaries small and use indexes for dashboard-heavy queries.
