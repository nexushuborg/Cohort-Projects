const request = require('supertest');
const app = require('../src/app');
const { cleanDatabase, createTestUser } = require('./helpers');

describe('Seller & Store Module Integration Tests', () => {
  let admin, seller1, seller2, buyer;

  beforeEach(async () => {
    await cleanDatabase();

    admin = await createTestUser({
      email: 'admin_store@test.com',
      name: 'Admin Store',
      role: 'admin',
    });

    seller1 = await createTestUser({
      email: 'seller1_store@test.com',
      name: 'Seller One',
      role: 'seller',
    });

    seller2 = await createTestUser({
      email: 'seller2_store@test.com',
      name: 'Seller Two',
      role: 'seller',
    });

    buyer = await createTestUser({
      email: 'buyer_store@test.com',
      name: 'Buyer Store',
      role: 'buyer',
    });
  });

  describe('POST /sellers/register-store', () => {
    it('should allow a buyer to register a store and set status to pending', async () => {
      const res = await request(app)
        .post('/sellers/register-store')
        .set('Authorization', `Bearer ${buyer.accessToken}`)
        .send({
          name: 'Electro Mart',
          description: 'Best electronics online',
          contactEmail: 'contact@electromart.com',
          contactPhone: '+1-555-9999',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.name).toBe('Electro Mart');
      expect(res.body.data.slug).toBe('electro-mart');
      expect(res.body.data.status).toBe('pending');

      // Verify that buyer profile was promoted to seller role
      const meRes = await request(app)
        .get('/auth/me')
        .set('Authorization', `Bearer ${buyer.accessToken}`);

      expect(meRes.body.data.role).toBe('seller');
    });

    it('should reject registering a second store for the same user', async () => {
      await request(app)
        .post('/sellers/register-store')
        .set('Authorization', `Bearer ${seller1.accessToken}`)
        .send({
          name: 'First Store',
        });

      const secondRes = await request(app)
        .post('/sellers/register-store')
        .set('Authorization', `Bearer ${seller1.accessToken}`)
        .send({
          name: 'Second Store',
        });

      expect(secondRes.status).toBe(409);
      expect(secondRes.body.success).toBe(false);
      expect(secondRes.body.error.code).toBe('CONFLICT');
    });
  });

  describe('Store Ownership & Updates', () => {
    let store1Id;

    beforeEach(async () => {
      const res = await request(app)
        .post('/sellers/register-store')
        .set('Authorization', `Bearer ${seller1.accessToken}`)
        .send({
          name: 'Seller One Store',
          description: 'Initial Description',
        });
      store1Id = res.body.data.id;
    });

    it('should allow store owner to update their own store', async () => {
      const res = await request(app)
        .put(`/sellers/stores/${store1Id}`)
        .set('Authorization', `Bearer ${seller1.accessToken}`)
        .send({
          description: 'Updated Description',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.description).toBe('Updated Description');
    });

    it('should forbid other sellers from updating a store they do not own', async () => {
      const res = await request(app)
        .put(`/sellers/stores/${store1Id}`)
        .set('Authorization', `Bearer ${seller2.accessToken}`)
        .send({
          description: 'Malicious Update',
        });

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('FORBIDDEN');
    });

    it('should allow admin to approve store status to active', async () => {
      const res = await request(app)
        .patch(`/sellers/stores/${store1Id}/status`)
        .set('Authorization', `Bearer ${admin.accessToken}`)
        .send({
          status: 'active',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('active');
    });

    it('should forbid non-admin users from changing store status', async () => {
      const res = await request(app)
        .patch(`/sellers/stores/${store1Id}/status`)
        .set('Authorization', `Bearer ${seller1.accessToken}`)
        .send({
          status: 'active',
        });

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
    });
  });

  describe('GET /sellers/stores', () => {
    it('should return list of active stores', async () => {
      // Create store and activate via admin
      const storeRes = await request(app)
        .post('/sellers/register-store')
        .set('Authorization', `Bearer ${seller1.accessToken}`)
        .send({
          name: 'Active Super Store',
        });

      await request(app)
        .patch(`/sellers/stores/${storeRes.body.data.id}/status`)
        .set('Authorization', `Bearer ${admin.accessToken}`)
        .send({ status: 'active' });

      const listRes = await request(app).get('/sellers/stores');

      expect(listRes.status).toBe(200);
      expect(listRes.body.success).toBe(true);
      expect(listRes.body.data.items.length).toBeGreaterThanOrEqual(1);
    });
  });
});
