const test = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');
const app = require('../src/app');

const uniqueSuffix = Date.now();
const email = `auth-${uniqueSuffix}@unevenness.test`;
const credentials = {
  firstName: 'Auth',
  lastName: 'Tester',
  username: `authuser${uniqueSuffix}`,
  email,
  password: 'StrongPass123!',
};

test('registers a user and logs them in with a valid session cookie', async () => {
  const registerRes = await request(app)
    .post('/api/auth/register')
    .send(credentials)
    .expect(201);

  assert.equal(registerRes.body.user.email, credentials.email);
  assert.equal(registerRes.body.user.role, 'USER');

  const loginRes = await request(app)
    .post('/api/auth/login')
    .send({ email: credentials.email, password: credentials.password })
    .expect(200);

  assert.equal(loginRes.body.user.email, credentials.email);
  assert.match(loginRes.headers['set-cookie'][0], /token=/);

  const meRes = await request(app)
    .get('/api/auth/me')
    .set('Cookie', loginRes.headers['set-cookie'][0])
    .expect(200);

  assert.equal(meRes.body.user.email, credentials.email);
});
