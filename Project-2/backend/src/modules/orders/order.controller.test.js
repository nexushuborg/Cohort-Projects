const request = require('supertest');
const app = require('../../app');
const { createTestUser, cleanDatabase, query } = require('../../../tests/helpers');

describe('Order Controller (Integration)', () => {
  let buyerToken, buyerId;
  let sellerToken, sellerId, storeId;
  let product1, product2, sku1Id, sku2Id;
  let secondStoreId, secondSellerToken, product3, sku3Id;

  beforeAll(async () => {
    await cleanDatabase();

    // Create buyer
    const buyer = await createTestUser({ email: 'orderbuyer@test.com', name: 'Order Buyer', role: 'buyer' });
    buyerToken = buyer.accessToken;
    buyerId = buyer.user.id;

    // Create seller 1
    const seller1 = await createTestUser({ email: 'orderseller1@test.com', name: 'Order Seller 1', role: 'seller' });
    sellerToken = seller1.accessToken;
    sellerId = seller1.user.id;

    // Create admin (for store activation)
    const admin = await createTestUser({ email: 'orderadmin@test.com', name: 'Order Admin', role: 'admin' });

    // Register store 1
    const storeRes = await request(app)
      .post('/sellers/register-store')
      .set('Authorization', `Bearer ${sellerToken}`)
      .send({ name: 'Order Test Store 1' });
    storeId = storeRes.body.data.id;
    // Activate store via admin
    await request(app)
      .patch(`/sellers/stores/${storeId}/status`)
      .set('Authorization', `Bearer ${admin.accessToken}`)
      .send({ status: 'active' });

    // Create product 1
    const prod1Res = await request(app)
      .post('/products')
      .set('Authorization', `Bearer ${sellerToken}`)
      .send({ storeId, title: 'Order Test Product 1', price: 25.00, status: 'active' });
    product1 = prod1Res.body.data;

    // Create variant type + option for product 1
    const vt1 = await request(app)
      .post(`/products/${product1.id}/variants`)
      .set('Authorization', `Bearer ${sellerToken}`)
      .send({ name: 'Color' });
    const vo1 = await request(app)
      .post(`/products/${product1.id}/variants/${vt1.body.data.id}/options`)
      .set('Authorization', `Bearer ${sellerToken}`)
      .send({ value: 'Red' });

    // Create SKU 1
    const sku1Res = await request(app)
      .post(`/products/${product1.id}/skus`)
      .set('Authorization', `Bearer ${sellerToken}`)
      .send({ skuCode: 'ORD-SKU-001', variantOptionIds: [vo1.body.data.id] });
    sku1Id = sku1Res.body.data.id;

    // Set inventory for SKU 1
    await request(app)
      .put(`/products/${product1.id}/inventory/${sku1Id}`)
      .set('Authorization', `Bearer ${sellerToken}`)
      .send({ quantity: 100 });

    // Activate SKU 1
    await request(app)
      .put(`/products/${product1.id}/skus/${sku1Id}`)
      .set('Authorization', `Bearer ${sellerToken}`)
      .send({ status: 'active' });

    // Create product 2
    const prod2Res = await request(app)
      .post('/products')
      .set('Authorization', `Bearer ${sellerToken}`)
      .send({ storeId, title: 'Order Test Product 2', price: 50.00, status: 'active' });
    product2 = prod2Res.body.data;

    // Create variant type + option for product 2
    const vt2 = await request(app)
      .post(`/products/${product2.id}/variants`)
      .set('Authorization', `Bearer ${sellerToken}`)
      .send({ name: 'Size' });
    const vo2 = await request(app)
      .post(`/products/${product2.id}/variants/${vt2.body.data.id}/options`)
      .set('Authorization', `Bearer ${sellerToken}`)
      .send({ value: 'Large' });

    // Create SKU 2
    const sku2Res = await request(app)
      .post(`/products/${product2.id}/skus`)
      .set('Authorization', `Bearer ${sellerToken}`)
      .send({ skuCode: 'ORD-SKU-002', variantOptionIds: [vo2.body.data.id] });
    sku2Id = sku2Res.body.data.id;

    // Set inventory for SKU 2
    await request(app)
      .put(`/products/${product2.id}/inventory/${sku2Id}`)
      .set('Authorization', `Bearer ${sellerToken}`)
      .send({ quantity: 50 });

    // Activate SKU 2
    await request(app)
      .put(`/products/${product2.id}/skus/${sku2Id}`)
      .set('Authorization', `Bearer ${sellerToken}`)
      .send({ status: 'active' });

    // Create seller 2 (for multi-seller test)
    const seller2 = await createTestUser({ email: 'orderseller2@test.com', name: 'Order Seller 2', role: 'seller' });
    secondSellerToken = seller2.accessToken;

    // Register store 2
    const store2Res = await request(app)
      .post('/sellers/register-store')
      .set('Authorization', `Bearer ${secondSellerToken}`)
      .send({ name: 'Order Test Store 2' });
    secondStoreId = store2Res.body.data.id;
    // Activate store 2
    await request(app)
      .patch(`/sellers/stores/${secondStoreId}/status`)
      .set('Authorization', `Bearer ${admin.accessToken}`)
      .send({ status: 'active' });

    // Create product 3 (from store 2)
    const prod3Res = await request(app)
      .post('/products')
      .set('Authorization', `Bearer ${secondSellerToken}`)
      .send({ storeId: secondStoreId, title: 'Order Test Product 3', price: 15.00, status: 'active' });
    product3 = prod3Res.body.data;

    // Create variant type + option for product 3
    const vt3 = await request(app)
      .post(`/products/${product3.id}/variants`)
      .set('Authorization', `Bearer ${secondSellerToken}`)
      .send({ name: 'Color' });
    const vo3 = await request(app)
      .post(`/products/${product3.id}/variants/${vt3.body.data.id}/options`)
      .set('Authorization', `Bearer ${secondSellerToken}`)
      .send({ value: 'Blue' });

    // Create SKU 3
    const sku3Res = await request(app)
      .post(`/products/${product3.id}/skus`)
      .set('Authorization', `Bearer ${secondSellerToken}`)
      .send({ skuCode: 'ORD-SKU-003', variantOptionIds: [vo3.body.data.id] });
    sku3Id = sku3Res.body.data.id;

    // Set inventory for SKU 3
    await request(app)
      .put(`/products/${product3.id}/inventory/${sku3Id}`)
      .set('Authorization', `Bearer ${secondSellerToken}`)
      .send({ quantity: 30 });

    // Activate SKU 3
    await request(app)
      .put(`/products/${product3.id}/skus/${sku3Id}`)
      .set('Authorization', `Bearer ${secondSellerToken}`)
      .send({ status: 'active' });
  });

  afterAll(async () => {
    await cleanDatabase();
  });

  const addToCart = async (token, skuId, quantity) => {
    return request(app)
      .post('/cart/items')
      .set('Authorization', `Bearer ${token}`)
      .send({ skuId, quantity });
  };

  const clearCart = async (token) => {
    return request(app)
      .delete('/cart')
      .set('Authorization', `Bearer ${token}`);
  };

  // ─── Checkout Tests ────────────────────────────────────────

  describe('POST /orders/checkout', () => {
    it('should reject empty cart', async () => {
      await clearCart(buyerToken);
      const res = await request(app)
        .post('/orders/checkout')
        .set('Authorization', `Bearer ${buyerToken}`)
        .send({ shippingAddress: '123 Test Street, Test City, Test Country 12345' });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should reject unauthenticated', async () => {
      const res = await request(app)
        .post('/orders/checkout')
        .send({ shippingAddress: '123 Test Street, Test City, Test Country 12345' });

      expect(res.status).toBe(401);
    });

    it('should reject missing shipping address', async () => {
      await addToCart(buyerToken, sku1Id, 2);
      const res = await request(app)
        .post('/orders/checkout')
        .set('Authorization', `Bearer ${buyerToken}`)
        .send({});

      expect(res.status).toBe(400);
    });

    it('should reject short shipping address', async () => {
      const res = await request(app)
        .post('/orders/checkout')
        .set('Authorization', `Bearer ${buyerToken}`)
        .send({ shippingAddress: 'Short' });

      expect(res.status).toBe(400);
    });

    it('should create order with single product from single seller', async () => {
      await clearCart(buyerToken);
      await addToCart(buyerToken, sku1Id, 2);

      const res = await request(app)
        .post('/orders/checkout')
        .set('Authorization', `Bearer ${buyerToken}`)
        .send({ shippingAddress: '123 Test Street, Test City, Test Country 12345' });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('id');
      expect(res.body.data.totalAmount).toBe(50.00);
      expect(res.body.data.status).toBe('placed');
      expect(res.body.data.shippingAddress).toBe('123 Test Street, Test City, Test Country 12345');
      expect(res.body.data.sellerOrders).toHaveLength(1);
      expect(res.body.data.sellerOrders[0].subtotal).toBe(50.00);
      expect(res.body.data.sellerOrders[0].items).toHaveLength(1);
      expect(res.body.data.sellerOrders[0].items[0].quantity).toBe(2);
      expect(res.body.data.sellerOrders[0].items[0].priceAtPurchase).toBe(25.00);
    });

    it('should calculate correct total for multiple products from same seller', async () => {
      await clearCart(buyerToken);
      await addToCart(buyerToken, sku1Id, 3); // 25 * 3 = 75
      await addToCart(buyerToken, sku2Id, 2); // 50 * 2 = 100

      const res = await request(app)
        .post('/orders/checkout')
        .set('Authorization', `Bearer ${buyerToken}`)
        .send({ shippingAddress: '456 Another Street, Another City, Another Country 67890' });

      expect(res.status).toBe(201);
      expect(res.body.data.totalAmount).toBe(175.00);
      expect(res.body.data.sellerOrders).toHaveLength(1);
      expect(res.body.data.sellerOrders[0].subtotal).toBe(175.00);
      expect(res.body.data.sellerOrders[0].items).toHaveLength(2);
    });

    it('should create multiple seller orders for products from different sellers', async () => {
      await clearCart(buyerToken);
      await addToCart(buyerToken, sku1Id, 1); // store 1: 25
      await addToCart(buyerToken, sku3Id, 2); // store 2: 15 * 2 = 30

      const res = await request(app)
        .post('/orders/checkout')
        .set('Authorization', `Bearer ${buyerToken}`)
        .send({ shippingAddress: '789 Multi Seller Street, Multi City, Multi Country 11111' });

      expect(res.status).toBe(201);
      expect(res.body.data.totalAmount).toBe(55.00);
      expect(res.body.data.sellerOrders).toHaveLength(2);
    });

    it('should use server-side prices, not frontend prices', async () => {
      await clearCart(buyerToken);
      await addToCart(buyerToken, sku1Id, 2);

      const res = await request(app)
        .post('/orders/checkout')
        .set('Authorization', `Bearer ${buyerToken}`)
        .send({
          shippingAddress: '123 Server Price Street, Price City, Price Country 22222',
          items: [{ skuId: sku1Id, quantity: 2, price: 0.01 }],
        });

      expect(res.status).toBe(201);
      expect(res.body.data.totalAmount).toBe(50.00);
    });

    it('should clear cart after successful checkout', async () => {
      await clearCart(buyerToken);
      await addToCart(buyerToken, sku1Id, 1);

      await request(app)
        .post('/orders/checkout')
        .set('Authorization', `Bearer ${buyerToken}`)
        .send({ shippingAddress: 'Cart Clear Test Street, Clear City, Clear Country 33333' });

      const cartRes = await request(app)
        .get('/cart')
        .set('Authorization', `Bearer ${buyerToken}`);

      expect(cartRes.status).toBe(200);
      expect(cartRes.body.data.items).toHaveLength(0);
    });

    it('should decrease inventory correctly', async () => {
      const beforeRes = await request(app)
        .get(`/products/${product1.id}/inventory/${sku1Id}`)
        .set('Authorization', `Bearer ${sellerToken}`);
      const stockBefore = beforeRes.body.data.stockQuantity;

      await clearCart(buyerToken);
      await addToCart(buyerToken, sku1Id, 3);

      await request(app)
        .post('/orders/checkout')
        .set('Authorization', `Bearer ${buyerToken}`)
        .send({ shippingAddress: 'Inventory Test Street, Inventory City, Inventory Country 44444' });

      const afterRes = await request(app)
        .get(`/products/${product1.id}/inventory/${sku1Id}`)
        .set('Authorization', `Bearer ${sellerToken}`);

      expect(afterRes.body.data.stockQuantity).toBe(stockBefore - 3);
    });

    it('should reject when stock is insufficient', async () => {
      await clearCart(buyerToken);
      await addToCart(buyerToken, sku2Id, 100);

      const res = await request(app)
        .post('/orders/checkout')
        .set('Authorization', `Bearer ${buyerToken}`)
        .send({ shippingAddress: 'Insufficient Stock Street, Stock City, Stock Country 55555' });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  // ─── GET /orders/me Tests ──────────────────────────────────

  describe('GET /orders/me', () => {
    it('should return buyer orders', async () => {
      const res = await request(app)
        .get('/orders/me')
        .set('Authorization', `Bearer ${buyerToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.items.length).toBeGreaterThan(0);
      expect(res.body.data.pagination).toBeDefined();
    });

    it('should reject unauthenticated', async () => {
      const res = await request(app).get('/orders/me');
      expect(res.status).toBe(401);
    });

    it('should not return orders from another user', async () => {
      const buyer2 = await createTestUser({ email: 'orderbuyer2@test.com', name: 'Order Buyer 2', role: 'buyer' });

      const res = await request(app)
        .get('/orders/me')
        .set('Authorization', `Bearer ${buyer2.accessToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.items).toHaveLength(0);
    });
  });

  // ─── GET /orders/:id Tests ─────────────────────────────────

  describe('GET /orders/:id', () => {
    let orderId;

    beforeAll(async () => {
      const listRes = await request(app)
        .get('/orders/me')
        .set('Authorization', `Bearer ${buyerToken}`);
      orderId = listRes.body.data.items[0].id;
    });

    it('should return order with seller orders and items', async () => {
      const res = await request(app)
        .get(`/orders/${orderId}`)
        .set('Authorization', `Bearer ${buyerToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.id).toBe(orderId);
      expect(res.body.data.sellerOrders).toBeDefined();
      expect(Array.isArray(res.body.data.sellerOrders)).toBe(true);
    });

    it('should reject unauthenticated', async () => {
      const res = await request(app).get(`/orders/${orderId}`);
      expect(res.status).toBe(401);
    });

    it('should not return another user order', async () => {
      const buyer2 = await createTestUser({ email: 'orderbuyer3@test.com', name: 'Order Buyer 3', role: 'buyer' });

      const res = await request(app)
        .get(`/orders/${orderId}`)
        .set('Authorization', `Bearer ${buyer2.accessToken}`);

      expect(res.status).toBe(404);
    });

    it('should return 404 for nonexistent order', async () => {
      const fakeId = '00000000-0000-0000-0000-000000000000';
      const res = await request(app)
        .get(`/orders/${fakeId}`)
        .set('Authorization', `Bearer ${buyerToken}`);

      expect(res.status).toBe(404);
    });
  });

  // ─── POST /orders/:id/cancel Tests ─────────────────────────

  describe('POST /orders/:id/cancel', () => {
    let placeableOrderId;

    beforeAll(async () => {
      await clearCart(buyerToken);
      await addToCart(buyerToken, sku1Id, 1);
      const checkoutRes = await request(app)
        .post('/orders/checkout')
        .set('Authorization', `Bearer ${buyerToken}`)
        .send({ shippingAddress: 'Cancel Test Street, Cancel City, Cancel Country 66666' });
      placeableOrderId = checkoutRes.body.data.id;
    });

    it('should cancel a placed order', async () => {
      const res = await request(app)
        .post(`/orders/${placeableOrderId}/cancel`)
        .set('Authorization', `Bearer ${buyerToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe('cancelled');
    });

    it('should reject cancelling an already cancelled order', async () => {
      const res = await request(app)
        .post(`/orders/${placeableOrderId}/cancel`)
        .set('Authorization', `Bearer ${buyerToken}`);

      expect(res.status).toBe(400);
    });

    it('should reject unauthenticated', async () => {
      const res = await request(app)
        .post(`/orders/${placeableOrderId}/cancel`);
      expect(res.status).toBe(401);
    });

    it('should return 404 for nonexistent order', async () => {
      const fakeId = '00000000-0000-0000-0000-000000000000';
      const res = await request(app)
        .post(`/orders/${fakeId}/cancel`)
        .set('Authorization', `Bearer ${buyerToken}`);

      expect(res.status).toBe(404);
    });
  });

  // ─── Role Protection Tests ─────────────────────────────────

  describe('Role protection', () => {
    it('should reject seller from checkout', async () => {
      const res = await request(app)
        .post('/orders/checkout')
        .set('Authorization', `Bearer ${sellerToken}`)
        .send({ shippingAddress: 'Seller should not checkout 1234567890' });

      expect(res.status).toBe(403);
    });

    it('should reject seller from viewing orders', async () => {
      const res = await request(app)
        .get('/orders/me')
        .set('Authorization', `Bearer ${sellerToken}`);

      expect(res.status).toBe(403);
    });
  });
});
