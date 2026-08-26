const request = require('supertest');
const app = require('../../app');
const { createTestUser, cleanDatabase, query } = require('../../../tests/helpers');

describe('Review Controller (Integration)', () => {
  let buyerToken, buyerId;
  let sellerToken, sellerId, storeId, productId;

  beforeAll(async () => {
    await cleanDatabase();

    // Create buyer
    const buyer = await createTestUser({ email: 'reviewbuyer@test.com', name: 'Review Buyer', role: 'buyer' });
    buyerToken = buyer.accessToken;
    buyerId = buyer.user.id;

    // Create seller + store + product
    const seller = await createTestUser({ email: 'reviewseller@test.com', name: 'Review Seller', role: 'seller' });
    sellerToken = seller.accessToken;
    sellerId = seller.user.id;

    // Register store
    const storeRes = await request(app)
      .post('/sellers/register-store')
      .set('Authorization', `Bearer ${sellerToken}`)
      .send({ name: 'Review Test Store' });
    storeId = storeRes.body.data.id;

    // Activate store
    await query(`UPDATE stores SET status = 'active' WHERE id = $1`, [storeId]);

    // Create product
    const prodRes = await request(app)
      .post('/products')
      .set('Authorization', `Bearer ${sellerToken}`)
      .send({ storeId, title: 'Review Test Product', price: 10.00, status: 'active' });
    productId = prodRes.body.data.id;
  });

  afterAll(async () => {
    await cleanDatabase();
  });

  // ─── Product Reviews ────────────────────────────────────

  describe('POST /reviews/product/:productId', () => {
    it('should create a product review', async () => {
      const res = await request(app)
        .post(`/reviews/product/${productId}`)
        .set('Authorization', `Bearer ${buyerToken}`)
        .send({ rating: 5, text: 'Excellent product!' });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.rating).toBe(5);
      expect(res.body.data.productId).toBe(productId);
    });

    it('should reject duplicate review', async () => {
      const res = await request(app)
        .post(`/reviews/product/${productId}`)
        .set('Authorization', `Bearer ${buyerToken}`)
        .send({ rating: 4, text: 'Second review' });

      expect(res.status).toBe(409);
    });

    it('should reject unauthenticated', async () => {
      const res = await request(app)
        .post(`/reviews/product/${productId}`)
        .send({ rating: 5 });

      expect(res.status).toBe(401);
    });

    it('should reject invalid rating', async () => {
      const res = await request(app)
        .post(`/reviews/product/${productId}`)
        .set('Authorization', `Bearer ${buyerToken}`)
        .send({ rating: 6 });

      expect(res.status).toBe(400);
    });

    it('should reject nonexistent product', async () => {
      const fakeId = '00000000-0000-0000-0000-000000000000';
      const res = await request(app)
        .post(`/reviews/product/${fakeId}`)
        .set('Authorization', `Bearer ${buyerToken}`)
        .send({ rating: 5 });

      expect(res.status).toBe(404);
    });
  });

  describe('GET /reviews/product/:productId', () => {
    it('should return product reviews', async () => {
      const res = await request(app)
        .get(`/reviews/product/${productId}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.items.length).toBeGreaterThan(0);
      expect(res.body.data.stats).toBeDefined();
      expect(res.body.data.pagination).toBeDefined();
    });

    it('should return 404 for nonexistent product', async () => {
      const fakeId = '00000000-0000-0000-0000-000000000000';
      const res = await request(app)
        .get(`/reviews/product/${fakeId}`);

      expect(res.status).toBe(404);
    });
  });

  describe('PUT /reviews/:id', () => {
    let reviewId;

    beforeAll(async () => {
      const res = await request(app).get(`/reviews/product/${productId}`);
      reviewId = res.body.data.items[0].id;
    });

    it('should update own review', async () => {
      const res = await request(app)
        .put(`/reviews/${reviewId}`)
        .set('Authorization', `Bearer ${buyerToken}`)
        .send({ rating: 4, text: 'Updated review' });

      expect(res.status).toBe(200);
      expect(res.body.data.rating).toBe(4);
    });

    it('should reject update from another user', async () => {
      const res = await request(app)
        .put(`/reviews/${reviewId}`)
        .set('Authorization', `Bearer ${sellerToken}`)
        .send({ rating: 1 });

      expect(res.status).toBe(403);
    });
  });

  describe('DELETE /reviews/:id', () => {
    let reviewId;

    beforeAll(async () => {
      const res = await request(app).get(`/reviews/product/${productId}`);
      reviewId = res.body.data.items[0].id;
    });

    it('should delete own review', async () => {
      const res = await request(app)
        .delete(`/reviews/${reviewId}`)
        .set('Authorization', `Bearer ${buyerToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.message).toContain('deleted');
    });

    it('should return 404 for deleted review', async () => {
      const res = await request(app)
        .delete(`/reviews/${reviewId}`)
        .set('Authorization', `Bearer ${buyerToken}`);

      expect(res.status).toBe(404);
    });
  });

  // ─── Store Reviews ──────────────────────────────────────

  describe('POST /reviews/store/:storeId', () => {
    it('should create a store review', async () => {
      const res = await request(app)
        .post(`/reviews/store/${storeId}`)
        .set('Authorization', `Bearer ${buyerToken}`)
        .send({ rating: 4, text: 'Good store' });

      expect(res.status).toBe(201);
      expect(res.body.data.rating).toBe(4);
      expect(res.body.data.storeId).toBe(storeId);
    });

    it('should reject duplicate store review', async () => {
      const res = await request(app)
        .post(`/reviews/store/${storeId}`)
        .set('Authorization', `Bearer ${buyerToken}`)
        .send({ rating: 5 });

      expect(res.status).toBe(409);
    });
  });

  describe('GET /reviews/store/:storeId', () => {
    it('should return store reviews', async () => {
      const res = await request(app)
        .get(`/reviews/store/${storeId}`);

      expect(res.status).toBe(200);
      expect(res.body.data.items.length).toBeGreaterThan(0);
      expect(res.body.data.stats).toBeDefined();
    });
  });

  // ─── Store Review Update/Delete ─────────────────────────

  describe('PUT /reviews/:id (store review)', () => {
    let storeReviewId;

    beforeAll(async () => {
      const res = await request(app).get(`/reviews/store/${storeId}`);
      storeReviewId = res.body.data.items[0].id;
    });

    it('should update own store review', async () => {
      const res = await request(app)
        .put(`/reviews/${storeReviewId}`)
        .set('Authorization', `Bearer ${buyerToken}`)
        .send({ rating: 3, text: 'Updated store review' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.rating).toBe(3);
    });

    it('should reject update from another user', async () => {
      const res = await request(app)
        .put(`/reviews/${storeReviewId}`)
        .set('Authorization', `Bearer ${sellerToken}`)
        .send({ rating: 1 });

      expect(res.status).toBe(403);
    });

    it('should return 404 for nonexistent review', async () => {
      const fakeId = '00000000-0000-0000-0000-000000000000';
      const res = await request(app)
        .put(`/reviews/${fakeId}`)
        .set('Authorization', `Bearer ${buyerToken}`)
        .send({ rating: 5 });

      expect(res.status).toBe(404);
    });
  });

  describe('DELETE /reviews/:id (store review)', () => {
    let storeReviewId;
    let adminToken;

    beforeAll(async () => {
      // Create a second buyer to make a store review
      const buyer2 = await createTestUser({ email: 'reviewbuyer2@test.com', name: 'Review Buyer 2', role: 'buyer' });

      // Create store review with buyer2
      const createRes = await request(app)
        .post(`/reviews/store/${storeId}`)
        .set('Authorization', `Bearer ${buyer2.accessToken}`)
        .send({ rating: 5, text: 'Review to delete' });
      storeReviewId = createRes.body.data.id;

      // Create admin
      const admin = await createTestUser({ email: 'reviewadmin@test.com', name: 'Review Admin', role: 'admin' });
      adminToken = admin.accessToken;
    });

    it('should reject delete from another user', async () => {
      const res = await request(app)
        .delete(`/reviews/${storeReviewId}`)
        .set('Authorization', `Bearer ${buyerToken}`);

      expect(res.status).toBe(403);
    });

    it('should allow admin to delete store review', async () => {
      const res = await request(app)
        .delete(`/reviews/${storeReviewId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.message).toContain('deleted');
    });

    it('should return 404 for already-deleted review', async () => {
      const res = await request(app)
        .delete(`/reviews/${storeReviewId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(404);
    });

    it('should return 404 for nonexistent review', async () => {
      const fakeId = '00000000-0000-0000-0000-000000000000';
      const res = await request(app)
        .delete(`/reviews/${fakeId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(404);
    });
  });
});
