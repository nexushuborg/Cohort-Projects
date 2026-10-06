const request = require('supertest');
const app = require('../src/app');
const { cleanDatabase, createTestUser } = require('./helpers');

describe('RBAC Middleware Integration Tests', () => {
  let adminToken, sellerToken, buyerToken;

  beforeEach(async () => {
    await cleanDatabase();

    const admin = await createTestUser({
      email: 'admin_rbac@test.com',
      name: 'Admin RBAC',
      role: 'admin',
    });
    adminToken = admin.accessToken;

    const seller = await createTestUser({
      email: 'seller_rbac@test.com',
      name: 'Seller RBAC',
      role: 'seller',
    });
    sellerToken = seller.accessToken;

    const buyer = await createTestUser({
      email: 'buyer_rbac@test.com',
      name: 'Buyer RBAC',
      role: 'buyer',
    });
    buyerToken = buyer.accessToken;
  });

  describe('Admin Role Guarding (e.g. GET /users)', () => {
    it('should allow admin to access GET /users', async () => {
      const res = await request(app)
        .get('/users')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.items).toBeDefined();
    });

    it('should reject seller from accessing GET /users with 403 Forbidden', async () => {
      const res = await request(app)
        .get('/users')
        .set('Authorization', `Bearer ${sellerToken}`);

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('FORBIDDEN');
    });

    it('should reject buyer from accessing GET /users with 403 Forbidden', async () => {
      const res = await request(app)
        .get('/users')
        .set('Authorization', `Bearer ${buyerToken}`);

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('FORBIDDEN');
    });
  });

  describe('Admin Category Management (e.g. POST /categories)', () => {
    it('should allow admin to create categories', async () => {
      const res = await request(app)
        .post('/categories')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Gadgets',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.name).toBe('Gadgets');
      expect(res.body.data.slug).toBe('gadgets');
    });

    it('should deny non-admin users from creating categories', async () => {
      const res = await request(app)
        .post('/categories')
        .set('Authorization', `Bearer ${buyerToken}`)
        .send({
          name: 'Unauthorized Category',
        });

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('FORBIDDEN');
    });
  });
});
