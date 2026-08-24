const request = require('supertest');
const app = require('../../app');
const { cleanDatabase, createTestUser } = require('../../../tests/helpers');

describe('Inventory Controller (Integration)', () => {
  let seller1, seller2, admin, buyer;
  let store1Id, store2Id;
  let product1Id, product2Id;
  let sku1Id, sku2Id;

  beforeEach(async () => {
    await cleanDatabase();

    admin = await createTestUser({ email: 'admin_inv@test.com', name: 'Admin Inv', role: 'admin' });
    seller1 = await createTestUser({ email: 'seller1_inv@test.com', name: 'Seller1', role: 'seller' });
    seller2 = await createTestUser({ email: 'seller2_inv@test.com', name: 'Seller2', role: 'seller' });
    buyer = await createTestUser({ email: 'buyer_inv@test.com', name: 'Buyer', role: 'buyer' });

    const s1 = await request(app).post('/sellers/register-store').set('Authorization', `Bearer ${seller1.accessToken}`).send({ name: 'Store1' });
    store1Id = s1.body.data.id;
    const s2 = await request(app).post('/sellers/register-store').set('Authorization', `Bearer ${seller2.accessToken}`).send({ name: 'Store2' });
    store2Id = s2.body.data.id;

    await request(app).patch(`/sellers/stores/${store1Id}/status`).set('Authorization', `Bearer ${admin.accessToken}`).send({ status: 'active' });
    await request(app).patch(`/sellers/stores/${store2Id}/status`).set('Authorization', `Bearer ${admin.accessToken}`).send({ status: 'active' });

    // Create products
    const p1 = await request(app).post('/products').set('Authorization', `Bearer ${seller1.accessToken}`).send({ storeId: store1Id, title: 'Test Product 1', price: 10 });
    product1Id = p1.body.data.id;
    const p2 = await request(app).post('/products').set('Authorization', `Bearer ${seller2.accessToken}`).send({ storeId: store2Id, title: 'Test Product 2', price: 20 });
    product2Id = p2.body.data.id;

    // Create variant type + option for product1
    const t1 = await request(app).post(`/products/${product1Id}/variants`).set('Authorization', `Bearer ${seller1.accessToken}`).send({ name: 'Color' });
    const o1 = await request(app).post(`/products/${product1Id}/variants/${t1.body.data.id}/options`).set('Authorization', `Bearer ${seller1.accessToken}`).send({ value: 'Red' });

    // Create variant type + option for product2
    const t2 = await request(app).post(`/products/${product2Id}/variants`).set('Authorization', `Bearer ${seller2.accessToken}`).send({ name: 'Size' });
    const o2 = await request(app).post(`/products/${product2Id}/variants/${t2.body.data.id}/options`).set('Authorization', `Bearer ${seller2.accessToken}`).send({ value: 'Large' });

    // Create SKUs
    const sku1 = await request(app).post(`/products/${product1Id}/skus`).set('Authorization', `Bearer ${seller1.accessToken}`).send({ skuCode: 'SKU-001', stockQuantity: 50, variantOptionIds: [o1.body.data.id] });
    sku1Id = sku1.body.data.id;
    const sku2 = await request(app).post(`/products/${product2Id}/skus`).set('Authorization', `Bearer ${seller2.accessToken}`).send({ skuCode: 'SKU-002', stockQuantity: 30, variantOptionIds: [o2.body.data.id] });
    sku2Id = sku2.body.data.id;

    // Set stock via inventory PUT (stockQuantity is not part of SKU creation validation)
    await request(app).put(`/products/${product1Id}/inventory/${sku1Id}`).set('Authorization', `Bearer ${seller1.accessToken}`).send({ quantity: 50 });
    await request(app).put(`/products/${product2Id}/inventory/${sku2Id}`).set('Authorization', `Bearer ${seller2.accessToken}`).send({ quantity: 30 });
  });

  describe('Authentication', () => {
    it('should reject unauthenticated requests', async () => {
      const res = await request(app).get(`/products/${product1Id}/inventory`);
      expect(res.status).toBe(401);
    });

    it('should reject buyer requests', async () => {
      const res = await request(app).get(`/products/${product1Id}/inventory`).set('Authorization', `Bearer ${buyer.accessToken}`);
      expect(res.status).toBe(403);
    });
  });

  describe('GET /products/:productId/inventory', () => {
    it('should list inventory for seller own product', async () => {
      const res = await request(app).get(`/products/${product1Id}/inventory`).set('Authorization', `Bearer ${seller1.accessToken}`);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveLength(1);
      expect(res.body.data[0].stockQuantity).toBe(50);
    });

    it('should allow admin to list inventory', async () => {
      const res = await request(app).get(`/products/${product1Id}/inventory`).set('Authorization', `Bearer ${admin.accessToken}`);
      expect(res.status).toBe(200);
    });

    it('should reject seller listing other seller inventory', async () => {
      const res = await request(app).get(`/products/${product2Id}/inventory`).set('Authorization', `Bearer ${seller1.accessToken}`);
      expect(res.status).toBe(403);
    });
  });

  describe('GET /products/:productId/inventory/:skuId', () => {
    it('should get inventory for specific SKU', async () => {
      const res = await request(app).get(`/products/${product1Id}/inventory/${sku1Id}`).set('Authorization', `Bearer ${seller1.accessToken}`);
      expect(res.status).toBe(200);
      expect(res.body.data.stockQuantity).toBe(50);
      expect(res.body.data.skuCode).toBe('SKU-001');
    });

    it('should return 404 for nonexistent SKU', async () => {
      const fakeId = '00000000-0000-0000-0000-000000000000';
      const res = await request(app).get(`/products/${product1Id}/inventory/${fakeId}`).set('Authorization', `Bearer ${seller1.accessToken}`);
      expect(res.status).toBe(404);
    });
  });

  describe('PUT /products/:productId/inventory/:skuId (set stock)', () => {
    it('should set stock to absolute value', async () => {
      const res = await request(app).put(`/products/${product1Id}/inventory/${sku1Id}`).set('Authorization', `Bearer ${seller1.accessToken}`).send({ quantity: 100 });
      expect(res.status).toBe(200);
      expect(res.body.data.stockQuantity).toBe(100);
    });

    it('should set stock to zero', async () => {
      const res = await request(app).put(`/products/${product1Id}/inventory/${sku1Id}`).set('Authorization', `Bearer ${seller1.accessToken}`).send({ quantity: 0 });
      expect(res.status).toBe(200);
      expect(res.body.data.stockQuantity).toBe(0);
    });

    it('should reject negative quantity', async () => {
      const res = await request(app).put(`/products/${product1Id}/inventory/${sku1Id}`).set('Authorization', `Bearer ${seller1.accessToken}`).send({ quantity: -5 });
      expect(res.status).toBe(400);
    });

    it('should reject non-integer quantity', async () => {
      const res = await request(app).put(`/products/${product1Id}/inventory/${sku1Id}`).set('Authorization', `Bearer ${seller1.accessToken}`).send({ quantity: 5.5 });
      expect(res.status).toBe(400);
    });

    it('should reject missing quantity', async () => {
      const res = await request(app).put(`/products/${product1Id}/inventory/${sku1Id}`).set('Authorization', `Bearer ${seller1.accessToken}`).send({});
      expect(res.status).toBe(400);
    });
  });

  describe('PATCH /products/:productId/inventory/:skuId (adjust stock)', () => {
    it('should increase stock', async () => {
      const res = await request(app).patch(`/products/${product1Id}/inventory/${sku1Id}`).set('Authorization', `Bearer ${seller1.accessToken}`).send({ quantity: 20 });
      expect(res.status).toBe(200);
      expect(res.body.data.stockQuantity).toBe(70);
    });

    it('should decrease stock', async () => {
      const res = await request(app).patch(`/products/${product1Id}/inventory/${sku1Id}`).set('Authorization', `Bearer ${seller1.accessToken}`).send({ quantity: -10 });
      expect(res.status).toBe(200);
      expect(res.body.data.stockQuantity).toBe(40);
    });

    it('should reject decrease exceeding available stock', async () => {
      const res = await request(app).patch(`/products/${product1Id}/inventory/${sku1Id}`).set('Authorization', `Bearer ${seller1.accessToken}`).send({ quantity: -100 });
      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('Cross-seller ownership', () => {
    it('seller cannot set stock on another seller SKU', async () => {
      const res = await request(app).put(`/products/${product2Id}/inventory/${sku2Id}`).set('Authorization', `Bearer ${seller1.accessToken}`).send({ quantity: 100 });
      expect(res.status).toBe(403);
    });

    it('seller cannot adjust stock on another seller SKU', async () => {
      const res = await request(app).patch(`/products/${product2Id}/inventory/${sku2Id}`).set('Authorization', `Bearer ${seller1.accessToken}`).send({ quantity: 10 });
      expect(res.status).toBe(403);
    });

    it('seller cannot list inventory for another seller product', async () => {
      const res = await request(app).get(`/products/${product2Id}/inventory`).set('Authorization', `Bearer ${seller1.accessToken}`);
      expect(res.status).toBe(403);
    });

    it('seller cannot get inventory for another seller SKU', async () => {
      const res = await request(app).get(`/products/${product2Id}/inventory/${sku2Id}`).set('Authorization', `Bearer ${seller1.accessToken}`);
      expect(res.status).toBe(403);
    });

    it('admin can set stock on any seller SKU', async () => {
      const res = await request(app).put(`/products/${product1Id}/inventory/${sku1Id}`).set('Authorization', `Bearer ${admin.accessToken}`).send({ quantity: 999 });
      expect(res.status).toBe(200);
      expect(res.body.data.stockQuantity).toBe(999);
    });
  });
});
