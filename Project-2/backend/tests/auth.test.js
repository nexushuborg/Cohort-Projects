const request = require('supertest');
const app = require('../src/app');
const { cleanDatabase } = require('./helpers');

describe('Auth Module Integration Tests', () => {
  beforeEach(async () => {
    await cleanDatabase();
  });

  describe('POST /auth/register', () => {
    it('should register a new user successfully and return access & refresh tokens', async () => {
      const res = await request(app)
        .post('/auth/register')
        .send({
          email: 'newuser@test.com',
          password: 'Password123!',
          name: 'New User',
          role: 'buyer',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user).toBeDefined();
      expect(res.body.data.user.email).toBe('newuser@test.com');
      expect(res.body.data.user.role).toBe('buyer');
      expect(res.body.data.user.password_hash).toBeUndefined();
      expect(res.body.data.accessToken).toBeDefined();
      expect(res.body.data.refreshToken).toBeDefined();
    });

    it('should reject registration if email is already registered', async () => {
      await request(app)
        .post('/auth/register')
        .send({
          email: 'duplicate@test.com',
          password: 'Password123!',
          name: 'First User',
        });

      const res = await request(app)
        .post('/auth/register')
        .send({
          email: 'duplicate@test.com',
          password: 'Password123!',
          name: 'Second User',
        });

      expect(res.status).toBe(409);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('CONFLICT');
    });

    it('should reject registration with invalid password format', async () => {
      const res = await request(app)
        .post('/auth/register')
        .send({
          email: 'weakpass@test.com',
          password: 'weak',
          name: 'Weak Pass',
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('POST /auth/login', () => {
    beforeEach(async () => {
      await request(app)
        .post('/auth/register')
        .send({
          email: 'loginuser@test.com',
          password: 'Password123!',
          name: 'Login User',
        });
    });

    it('should successfully log in with valid credentials', async () => {
      const res = await request(app)
        .post('/auth/login')
        .send({
          email: 'loginuser@test.com',
          password: 'Password123!',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.accessToken).toBeDefined();
      expect(res.body.data.refreshToken).toBeDefined();
      expect(res.body.data.user.email).toBe('loginuser@test.com');
    });

    it('should reject login with incorrect password', async () => {
      const res = await request(app)
        .post('/auth/login')
        .send({
          email: 'loginuser@test.com',
          password: 'WrongPassword123!',
        });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('UNAUTHORIZED');
    });

    it('should reject login with non-existent email', async () => {
      const res = await request(app)
        .post('/auth/login')
        .send({
          email: 'nonexistent@test.com',
          password: 'Password123!',
        });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });

  describe('POST /auth/refresh-token', () => {
    it('should issue new access and refresh tokens and rotate old token', async () => {
      const registerRes = await request(app)
        .post('/auth/register')
        .send({
          email: 'refreshtest@test.com',
          password: 'Password123!',
          name: 'Refresh Test',
        });

      const initialRefreshToken = registerRes.body.data.refreshToken;

      const refreshRes = await request(app)
        .post('/auth/refresh-token')
        .send({ refreshToken: initialRefreshToken });

      expect(refreshRes.status).toBe(200);
      expect(refreshRes.body.success).toBe(true);
      expect(refreshRes.body.data.accessToken).toBeDefined();
      expect(refreshRes.body.data.refreshToken).toBeDefined();

      const newRefreshToken = refreshRes.body.data.refreshToken;

      // Old refresh token must now be invalid due to rotation
      const reuseRes = await request(app)
        .post('/auth/refresh-token')
        .send({ refreshToken: initialRefreshToken });

      expect(reuseRes.status).toBe(401);
      expect(reuseRes.body.success).toBe(false);
    });
  });

  describe('GET /auth/me', () => {
    it('should retrieve current user profile with valid Bearer token', async () => {
      const regRes = await request(app)
        .post('/auth/register')
        .send({
          email: 'metest@test.com',
          password: 'Password123!',
          name: 'Me Test',
        });

      const token = regRes.body.data.accessToken;

      const meRes = await request(app)
        .get('/auth/me')
        .set('Authorization', `Bearer ${token}`);

      expect(meRes.status).toBe(200);
      expect(meRes.body.success).toBe(true);
      expect(meRes.body.data.email).toBe('metest@test.com');
      expect(meRes.body.data.name).toBe('Me Test');
    });

    it('should reject request when token is missing', async () => {
      const meRes = await request(app).get('/auth/me');
      expect(meRes.status).toBe(401);
      expect(meRes.body.success).toBe(false);
    });
  });
});
