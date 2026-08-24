const request = require('supertest');
const app = require('../../app');
const { cleanDatabase, createTestUser } = require('../../../tests/helpers');

describe('Cart Controller (Integration)', () => {
  let buyer, seller1, seller2, admin;
  let store1Id, store2Id;
  let product1Id, product2Id;
  let sku1Id, sku2Id;

  beforeEach(async () => {
    await cleanDatabase();

    admin = await createTestUser({ email: 'admin_cart@test.com', name: 'Admin Cart', role: 'admin' });
    buyer = await createTestUser({ email: 'buyer_cart@test.com', name: 'Buyer Cart', role: 'buyer' });
    seller1 = await createTestUser({ email: 'seller1_cart@test.com', name: 'Seller1', role: 'seller' });
    seller2 = await createTestUser({ email: 'seller2_cart@test.com', name: 'Seller2', role: 'seller' });

    const s1 = await request(app).post('/sellers/register-store').set('Authorization', 'Bearer ' + seller1.accessToken).send({ name: 'Cart Store 1' });
    store1Id = s1.body.data.id;
    const s2 = await request(app).post('/sellers/register-store').set('Authorization', 'Bearer ' + seller2.accessToken).send({ name: 'Cart Store 2' });
    store2Id = s2.body.data.id;

    await request(app).patch('/sellers/stores/' + store1Id + '/status').set('Authorization', 'Bearer ' + admin.accessToken).send({ status: 'active' });
    await request(app).patch('/sellers/stores/' + store2Id + '/status').set('Authorization', 'Bearer ' + admin.accessToken).send({ status: 'active' });

    const p1 = await request(app).post('/products').set('Authorization', 'Bearer ' + seller1.accessToken).send({ storeId: store1Id, title: 'Test Product Alpha', price: 25.00, status: 'active' });
    product1Id = p1.body.data.id;
    const p2 = await request(app).post('/products').set('Authorization', 'Bearer ' + seller2.accessToken).send({ storeId: store2Id, title: 'Test Product Beta', price: 40.00, status: 'active' });
    product2Id = p2.body.data.id;

    const t1 = await request(app).post('/products/' + product1Id + '/variants').set('Authorization', 'Bearer ' + seller1.accessToken).send({ name: 'Color' });
    const o1 = await request(app).post('/products/' + product1Id + '/variants/' + t1.body.data.id + '/options').set('Authorization', 'Bearer ' + seller1.accessToken).send({ value: 'Red' });
    const t2 = await request(app).post('/products/' + product2Id + '/variants').set('Authorization', 'Bearer ' + seller2.accessToken).send({ name: 'Size' });
    const o2 = await request(app).post('/products/' + product2Id + '/variants/' + t2.body.data.id + '/options').set('Authorization', 'Bearer ' + seller2.accessToken).send({ value: 'Large' });

    const sku1 = await request(app).post('/products/' + product1Id + '/skus').set('Authorization', 'Bearer ' + seller1.accessToken).send({ skuCode: 'ALPHA-RED', variantOptionIds: [o1.body.data.id] });
    sku1Id = sku1.body.data.id;
    const sku2 = await request(app).post('/products/' + product2Id + '/skus').set('Authorization', 'Bearer ' + seller2.accessToken).send({ skuCode: 'BETA-LARGE', variantOptionIds: [o2.body.data.id] });
    sku2Id = sku2.body.data.id;

    await request(app).put('/products/' + product1Id + '/inventory/' + sku1Id).set('Authorization', 'Bearer ' + seller1.accessToken).send({ quantity: 50 });
    await request(app).put('/products/' + product2Id + '/inventory/' + sku2Id).set('Authorization', 'Bearer ' + seller2.accessToken).send({ quantity: 30 });

    // Activate SKUs (they default to 'draft')
    await request(app).put('/products/' + product1Id + '/skus/' + sku1Id).set('Authorization', 'Bearer ' + seller1.accessToken).send({ status: 'active' });
    await request(app).put('/products/' + product2Id + '/skus/' + sku2Id).set('Authorization', 'Bearer ' + seller2.accessToken).send({ status: 'active' });
  });

  describe('Authentication', () => {
    it('should reject unauthenticated requests', async () => {
      const res = await request(app).get('/cart');
      expect(res.status).toBe(401);
    });

    it('should reject seller requests', async () => {
      const res = await request(app).get('/cart').set('Authorization', 'Bearer ' + seller1.accessToken);
      expect(res.status).toBe(403);
    });

    it('should reject admin requests', async () => {
      const res = await request(app).get('/cart').set('Authorization', 'Bearer ' + admin.accessToken);
      expect(res.status).toBe(403);
    });
  });

  describe('POST /cart/items - Add item', () => {
    it('should add item to cart', async () => {
      const res = await request(app).post('/cart/items').set('Authorization', 'Bearer ' + buyer.accessToken).send({ skuId: sku1Id, quantity: 2 });
      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.skuId).toBe(sku1Id);
      expect(res.body.data.quantity).toBe(2);
    });

    it('should update quantity for duplicate SKU', async () => {
      await request(app).post('/cart/items').set('Authorization', 'Bearer ' + buyer.accessToken).send({ skuId: sku1Id, quantity: 2 });
      const res = await request(app).post('/cart/items').set('Authorization', 'Bearer ' + buyer.accessToken).send({ skuId: sku1Id, quantity: 5 });
      expect(res.status).toBe(200);
      expect(res.body.data.quantity).toBe(5);
    });

    it('should reject invalid SKU UUID', async () => {
      const res = await request(app).post('/cart/items').set('Authorization', 'Bearer ' + buyer.accessToken).send({ skuId: 'not-a-uuid', quantity: 1 });
      expect(res.status).toBe(400);
    });

    it('should reject missing quantity', async () => {
      const res = await request(app).post('/cart/items').set('Authorization', 'Bearer ' + buyer.accessToken).send({ skuId: sku1Id });
      expect(res.status).toBe(400);
    });

    it('should reject quantity < 1', async () => {
      const res = await request(app).post('/cart/items').set('Authorization', 'Bearer ' + buyer.accessToken).send({ skuId: sku1Id, quantity: 0 });
      expect(res.status).toBe(400);
    });

    it('should reject nonexistent SKU', async () => {
      const fakeId = '00000000-0000-0000-0000-000000000000';
      const res = await request(app).post('/cart/items').set('Authorization', 'Bearer ' + buyer.accessToken).send({ skuId: fakeId, quantity: 1 });
      expect(res.status).toBe(404);
    });

    it('should reject insufficient stock', async () => {
      const res = await request(app).post('/cart/items').set('Authorization', 'Bearer ' + buyer.accessToken).send({ skuId: sku1Id, quantity: 100 });
      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('GET /cart - View cart', () => {
    it('should return empty cart', async () => {
      const res = await request(app).get('/cart').set('Authorization', 'Bearer ' + buyer.accessToken);
      expect(res.status).toBe(200);
      expect(res.body.data.items).toHaveLength(0);
      expect(res.body.data.summary.totalItems).toBe(0);
      expect(res.body.data.summary.totalAmount).toBe(0);
    });

    it('should return populated cart with correct data', async () => {
      await request(app).post('/cart/items').set('Authorization', 'Bearer ' + buyer.accessToken).send({ skuId: sku1Id, quantity: 2 });
      const res = await request(app).get('/cart').set('Authorization', 'Bearer ' + buyer.accessToken);
      expect(res.status).toBe(200);
      expect(res.body.data.items).toHaveLength(1);
      expect(res.body.data.items[0].quantity).toBe(2);
      expect(res.body.data.items[0].effectivePrice).toBe(25.00);
      expect(res.body.data.items[0].subtotal).toBe(50.00);
      expect(res.body.data.summary.totalItems).toBe(2);
      expect(res.body.data.summary.totalAmount).toBe(50.00);
    });

    it('should group items by seller/store', async () => {
      await request(app).post('/cart/items').set('Authorization', 'Bearer ' + buyer.accessToken).send({ skuId: sku1Id, quantity: 1 });
      await request(app).post('/cart/items').set('Authorization', 'Bearer ' + buyer.accessToken).send({ skuId: sku2Id, quantity: 2 });
      const res = await request(app).get('/cart').set('Authorization', 'Bearer ' + buyer.accessToken);
      expect(res.status).toBe(200);
      expect(res.body.data.groups).toHaveLength(2);
      expect(res.body.data.summary.totalItems).toBe(3);
      expect(res.body.data.summary.totalAmount).toBe(105.00);
    });

    it('should not show other buyer cart items', async () => {
      const otherBuyer = await createTestUser({ email: 'other_buyer_cart@test.com', name: 'Other', role: 'buyer' });
      await request(app).post('/cart/items').set('Authorization', 'Bearer ' + buyer.accessToken).send({ skuId: sku1Id, quantity: 3 });
      const res = await request(app).get('/cart').set('Authorization', 'Bearer ' + otherBuyer.accessToken);
      expect(res.body.data.items).toHaveLength(0);
    });
  });

  describe('PUT /cart/items/:id - Update quantity', () => {
    let cartItemId;

    beforeEach(async () => {
      const addRes = await request(app).post('/cart/items').set('Authorization', 'Bearer ' + buyer.accessToken).send({ skuId: sku1Id, quantity: 2 });
      cartItemId = addRes.body.data.id;
    });

    it('should update quantity', async () => {
      const res = await request(app).put('/cart/items/' + cartItemId).set('Authorization', 'Bearer ' + buyer.accessToken).send({ quantity: 5 });
      expect(res.status).toBe(200);
      expect(res.body.data.quantity).toBe(5);
    });

    it('should reject quantity < 1', async () => {
      const res = await request(app).put('/cart/items/' + cartItemId).set('Authorization', 'Bearer ' + buyer.accessToken).send({ quantity: 0 });
      expect(res.status).toBe(400);
    });

    it('should reject update for nonexistent item', async () => {
      const fakeId = '00000000-0000-0000-0000-000000000000';
      const res = await request(app).put('/cart/items/' + fakeId).set('Authorization', 'Bearer ' + buyer.accessToken).send({ quantity: 5 });
      expect(res.status).toBe(404);
    });

    it('should reject update for another buyer item', async () => {
      const otherBuyer = await createTestUser({ email: 'other_buyer2_cart@test.com', name: 'Other2', role: 'buyer' });
      const res = await request(app).put('/cart/items/' + cartItemId).set('Authorization', 'Bearer ' + otherBuyer.accessToken).send({ quantity: 5 });
      expect(res.status).toBe(404);
    });

    it('should reject update exceeding stock', async () => {
      const res = await request(app).put('/cart/items/' + cartItemId).set('Authorization', 'Bearer ' + buyer.accessToken).send({ quantity: 100 });
      expect(res.status).toBe(400);
    });
  });

  describe('DELETE /cart/items/:id - Remove item', () => {
    let cartItemId;

    beforeEach(async () => {
      const addRes = await request(app).post('/cart/items').set('Authorization', 'Bearer ' + buyer.accessToken).send({ skuId: sku1Id, quantity: 2 });
      cartItemId = addRes.body.data.id;
    });

    it('should remove item', async () => {
      const res = await request(app).delete('/cart/items/' + cartItemId).set('Authorization', 'Bearer ' + buyer.accessToken);
      expect(res.status).toBe(200);
      const cartRes = await request(app).get('/cart').set('Authorization', 'Bearer ' + buyer.accessToken);
      expect(cartRes.body.data.items).toHaveLength(0);
    });

    it('should reject removal for nonexistent item', async () => {
      const fakeId = '00000000-0000-0000-0000-000000000000';
      const res = await request(app).delete('/cart/items/' + fakeId).set('Authorization', 'Bearer ' + buyer.accessToken);
      expect(res.status).toBe(404);
    });

    it('should reject removal for another buyer item', async () => {
      const otherBuyer = await createTestUser({ email: 'other_buyer3_cart@test.com', name: 'Other3', role: 'buyer' });
      const res = await request(app).delete('/cart/items/' + cartItemId).set('Authorization', 'Bearer ' + otherBuyer.accessToken);
      expect(res.status).toBe(404);
    });
  });

  describe('DELETE /cart - Clear cart', () => {
    it('should clear populated cart', async () => {
      await request(app).post('/cart/items').set('Authorization', 'Bearer ' + buyer.accessToken).send({ skuId: sku1Id, quantity: 2 });
      await request(app).post('/cart/items').set('Authorization', 'Bearer ' + buyer.accessToken).send({ skuId: sku2Id, quantity: 1 });
      const res = await request(app).delete('/cart').set('Authorization', 'Bearer ' + buyer.accessToken);
      expect(res.status).toBe(200);
      const cartRes = await request(app).get('/cart').set('Authorization', 'Bearer ' + buyer.accessToken);
      expect(cartRes.body.data.items).toHaveLength(0);
    });

    it('should clear empty cart without error', async () => {
      const res = await request(app).delete('/cart').set('Authorization', 'Bearer ' + buyer.accessToken);
      expect(res.status).toBe(200);
    });

    it('should not clear other buyer cart', async () => {
      const otherBuyer = await createTestUser({ email: 'other_buyer4_cart@test.com', name: 'Other4', role: 'buyer' });
      await request(app).post('/cart/items').set('Authorization', 'Bearer ' + buyer.accessToken).send({ skuId: sku1Id, quantity: 2 });
      await request(app).delete('/cart').set('Authorization', 'Bearer ' + otherBuyer.accessToken);
      const cartRes = await request(app).get('/cart').set('Authorization', 'Bearer ' + buyer.accessToken);
      expect(cartRes.body.data.items).toHaveLength(1);
    });
  });
});
