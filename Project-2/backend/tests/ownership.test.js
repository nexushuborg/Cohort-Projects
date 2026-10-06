const request = require('supertest');
const app = require('../src/app');
const { cleanDatabase, createTestUser } = require('./helpers');

describe('Seller Ownership Enforcement', () => {
  let seller1, seller2, admin;
  let store1Id, store2Id;

  beforeEach(async () => {
    await cleanDatabase();

    admin = await createTestUser({ email: 'admin_own@test.com', name: 'Admin Own', role: 'admin' });
    seller1 = await createTestUser({ email: 'seller1_own@test.com', name: 'Seller One', role: 'seller' });
    seller2 = await createTestUser({ email: 'seller2_own@test.com', name: 'Seller Two', role: 'seller' });

    const store1Res = await request(app).post('/sellers/register-store').set('Authorization', `Bearer ${seller1.accessToken}`).send({ name: 'Store One' });
    store1Id = store1Res.body.data.id;

    const store2Res = await request(app).post('/sellers/register-store').set('Authorization', `Bearer ${seller2.accessToken}`).send({ name: 'Store Two' });
    store2Id = store2Res.body.data.id;

    await request(app).patch(`/sellers/stores/${store1Id}/status`).set('Authorization', `Bearer ${admin.accessToken}`).send({ status: 'active' });
    await request(app).patch(`/sellers/stores/${store2Id}/status`).set('Authorization', `Bearer ${admin.accessToken}`).send({ status: 'active' });
  });

  describe('Product Ownership', () => {
    let product1Id, product2Id;

    beforeEach(async () => {
      const res1 = await request(app).post('/products').set('Authorization', `Bearer ${seller1.accessToken}`).send({ storeId: store1Id, title: 'Seller1 Product', price: 99.99 });
      product1Id = res1.body.data.id;
      const res2 = await request(app).post('/products').set('Authorization', `Bearer ${seller2.accessToken}`).send({ storeId: store2Id, title: 'Seller2 Product', price: 149.99 });
      product2Id = res2.body.data.id;
    });

    it('seller cannot create product for another store', async () => {
      const res = await request(app).post('/products').set('Authorization', `Bearer ${seller1.accessToken}`).send({ storeId: store2Id, title: 'Unauthorized', price: 50.00 });
      expect(res.status).toBe(403);
      expect(res.body.error.code).toBe('FORBIDDEN');
    });

    it('seller can update their own product', async () => {
      const res = await request(app).put(`/products/${product1Id}`).set('Authorization', `Bearer ${seller1.accessToken}`).send({ title: 'Updated Title' });
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('seller cannot update another seller product', async () => {
      const res = await request(app).put(`/products/${product2Id}`).set('Authorization', `Bearer ${seller1.accessToken}`).send({ title: 'Hacked' });
      expect(res.status).toBe(403);
      expect(res.body.error.code).toBe('FORBIDDEN');
    });

    it('seller can delete their own product', async () => {
      const res = await request(app).delete(`/products/${product1Id}`).set('Authorization', `Bearer ${seller1.accessToken}`);
      expect(res.status).toBe(200);
    });

    it('seller cannot delete another seller product', async () => {
      const res = await request(app).delete(`/products/${product2Id}`).set('Authorization', `Bearer ${seller1.accessToken}`);
      expect(res.status).toBe(403);
      expect(res.body.error.code).toBe('FORBIDDEN');
    });

    it('admin can update any product', async () => {
      const res = await request(app).put(`/products/${product1Id}`).set('Authorization', `Bearer ${admin.accessToken}`).send({ title: 'Admin Updated' });
      expect(res.status).toBe(200);
    });

    it('admin can delete any product', async () => {
      const res = await request(app).delete(`/products/${product1Id}`).set('Authorization', `Bearer ${admin.accessToken}`);
      expect(res.status).toBe(200);
    });
  });

  describe('Variant Ownership', () => {
    let product1Id, product2Id;

    beforeEach(async () => {
      const res1 = await request(app).post('/products').set('Authorization', `Bearer ${seller1.accessToken}`).send({ storeId: store1Id, title: 'S1 Product', price: 99.99 });
      product1Id = res1.body.data.id;
      const res2 = await request(app).post('/products').set('Authorization', `Bearer ${seller2.accessToken}`).send({ storeId: store2Id, title: 'S2 Product', price: 149.99 });
      product2Id = res2.body.data.id;
    });

    it('seller can create variant on own product', async () => {
      const res = await request(app).post(`/products/${product1Id}/variants`).set('Authorization', `Bearer ${seller1.accessToken}`).send({ name: 'Color' });
      expect(res.status).toBe(201);
    });

    it('seller cannot create variant on another product', async () => {
      const res = await request(app).post(`/products/${product2Id}/variants`).set('Authorization', `Bearer ${seller1.accessToken}`).send({ name: 'Color' });
      expect(res.status).toBe(403);
    });

    it('seller cannot update variant on another product', async () => {
      const typeRes = await request(app).post(`/products/${product2Id}/variants`).set('Authorization', `Bearer ${seller2.accessToken}`).send({ name: 'Material' });
      const type2Id = typeRes.body.data.id;
      const res = await request(app).put(`/products/${product2Id}/variants/${type2Id}`).set('Authorization', `Bearer ${seller1.accessToken}`).send({ name: 'Hacked' });
      expect(res.status).toBe(403);
    });

    it('seller cannot delete variant on another product', async () => {
      const typeRes = await request(app).post(`/products/${product2Id}/variants`).set('Authorization', `Bearer ${seller2.accessToken}`).send({ name: 'Material' });
      const type2Id = typeRes.body.data.id;
      const res = await request(app).delete(`/products/${product2Id}/variants/${type2Id}`).set('Authorization', `Bearer ${seller1.accessToken}`);
      expect(res.status).toBe(403);
    });
  });

  describe('SKU Ownership', () => {
    let product1Id, product2Id, option1Id;

    beforeEach(async () => {
      const res1 = await request(app).post('/products').set('Authorization', `Bearer ${seller1.accessToken}`).send({ storeId: store1Id, title: 'S1 Product', price: 99.99 });
      product1Id = res1.body.data.id;
      const res2 = await request(app).post('/products').set('Authorization', `Bearer ${seller2.accessToken}`).send({ storeId: store2Id, title: 'S2 Product', price: 149.99 });
      product2Id = res2.body.data.id;

      const typeRes = await request(app).post(`/products/${product1Id}/variants`).set('Authorization', `Bearer ${seller1.accessToken}`).send({ name: 'Color' });
      const type1Id = typeRes.body.data.id;
      const optRes = await request(app).post(`/products/${product1Id}/variants/${type1Id}/options`).set('Authorization', `Bearer ${seller1.accessToken}`).send({ value: 'Red' });
      option1Id = optRes.body.data.id;
    });

    it('seller can create SKU on own product', async () => {
      const res = await request(app).post(`/products/${product1Id}/skus`).set('Authorization', `Bearer ${seller1.accessToken}`).send({ skuCode: 'SKU-001', stockQuantity: 10, variantOptionIds: [option1Id] });
      expect(res.status).toBe(201);
    });

    it('seller cannot create SKU on another product', async () => {
      // Create a variant type and option on product2 via seller2
      const typeRes = await request(app).post(`/products/${product2Id}/variants`).set('Authorization', `Bearer ${seller2.accessToken}`).send({ name: 'Size' });
      const type2Id = typeRes.body.data.id;
      const optRes = await request(app).post(`/products/${product2Id}/variants/${type2Id}/options`).set('Authorization', `Bearer ${seller2.accessToken}`).send({ value: 'Large' });
      const option2Id = optRes.body.data.id;
      // Seller1 tries to create SKU on product2
      const res = await request(app).post(`/products/${product2Id}/skus`).set('Authorization', `Bearer ${seller1.accessToken}`).send({ skuCode: 'SKU-002', stockQuantity: 5, variantOptionIds: [option2Id] });
      expect(res.status).toBe(403);
    });
  });

  describe('Image Ownership', () => {
    let product1Id, product2Id, image2Id;

    // Minimal valid JPEG buffer for upload
    const fakeJpeg = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46, 0x00, 0x01, 0x01, 0x00, 0x00, 0x01, 0x00, 0x01, 0x00, 0x00, 0xff, 0xd9]);

    beforeEach(async () => {
      const res1 = await request(app).post('/products').set('Authorization', `Bearer ${seller1.accessToken}`).send({ storeId: store1Id, title: 'S1 Product', price: 99.99 });
      product1Id = res1.body.data.id;
      const res2 = await request(app).post('/products').set('Authorization', `Bearer ${seller2.accessToken}`).send({ storeId: store2Id, title: 'S2 Product', price: 149.99 });
      product2Id = res2.body.data.id;

      // Seller2 uploads an image to their own product
      const imgRes = await request(app)
        .post(`/products/${product2Id}/images`)
        .set('Authorization', `Bearer ${seller2.accessToken}`)
        .attach('image', fakeJpeg, { filename: 'test.jpg', contentType: 'image/jpeg' });
      image2Id = imgRes.body.data.id;
    });

    it('seller cannot upload image to another product', async () => {
      const res = await request(app)
        .post(`/products/${product2Id}/images`)
        .set('Authorization', `Bearer ${seller1.accessToken}`)
        .attach('image', fakeJpeg, { filename: 'hack.jpg', contentType: 'image/jpeg' });
      expect(res.status).toBe(403);
      expect(res.body.error.code).toBe('FORBIDDEN');
    });

    it('seller cannot set primary on another product image', async () => {
      const res = await request(app)
        .put(`/products/${product2Id}/images/${image2Id}/primary`)
        .set('Authorization', `Bearer ${seller1.accessToken}`);
      expect(res.status).toBe(403);
      expect(res.body.error.code).toBe('FORBIDDEN');
    });

    it('seller cannot delete another product image', async () => {
      const res = await request(app)
        .delete(`/products/${product2Id}/images/${image2Id}`)
        .set('Authorization', `Bearer ${seller1.accessToken}`);
      expect(res.status).toBe(403);
      expect(res.body.error.code).toBe('FORBIDDEN');
    });

    it('seller can upload image to own product', async () => {
      const res = await request(app)
        .post(`/products/${product1Id}/images`)
        .set('Authorization', `Bearer ${seller1.accessToken}`)
        .attach('image', fakeJpeg, { filename: 'own.jpg', contentType: 'image/jpeg' });
      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
    });
  });

  describe('Variant Option Ownership', () => {
    let product1Id, product2Id;
    let type2Id, option2Id;

    beforeEach(async () => {
      const res1 = await request(app).post('/products').set('Authorization', `Bearer ${seller1.accessToken}`).send({ storeId: store1Id, title: 'S1 Product', price: 99.99 });
      product1Id = res1.body.data.id;
      const res2 = await request(app).post('/products').set('Authorization', `Bearer ${seller2.accessToken}`).send({ storeId: store2Id, title: 'S2 Product', price: 149.99 });
      product2Id = res2.body.data.id;

      // Seller2 creates a variant type and option on their own product
      const typeRes = await request(app).post(`/products/${product2Id}/variants`).set('Authorization', `Bearer ${seller2.accessToken}`).send({ name: 'Color' });
      type2Id = typeRes.body.data.id;
      const optRes = await request(app).post(`/products/${product2Id}/variants/${type2Id}/options`).set('Authorization', `Bearer ${seller2.accessToken}`).send({ value: 'Red' });
      option2Id = optRes.body.data.id;
    });

    it('seller cannot create option on another product variant', async () => {
      const res = await request(app)
        .post(`/products/${product2Id}/variants/${type2Id}/options`)
        .set('Authorization', `Bearer ${seller1.accessToken}`)
        .send({ value: 'Blue' });
      expect(res.status).toBe(403);
      expect(res.body.error.code).toBe('FORBIDDEN');
    });

    it('seller cannot update option on another product variant', async () => {
      const res = await request(app)
        .put(`/products/${product2Id}/variants/${type2Id}/options/${option2Id}`)
        .set('Authorization', `Bearer ${seller1.accessToken}`)
        .send({ value: 'Hacked' });
      expect(res.status).toBe(403);
      expect(res.body.error.code).toBe('FORBIDDEN');
    });

    it('seller cannot delete option on another product variant', async () => {
      const res = await request(app)
        .delete(`/products/${product2Id}/variants/${type2Id}/options/${option2Id}`)
        .set('Authorization', `Bearer ${seller1.accessToken}`);
      expect(res.status).toBe(403);
      expect(res.body.error.code).toBe('FORBIDDEN');
    });

    it('seller can create option on own product variant', async () => {
      // Create a type on product1 first
      const typeRes = await request(app).post(`/products/${product1Id}/variants`).set('Authorization', `Bearer ${seller1.accessToken}`).send({ name: 'Size' });
      const type1Id = typeRes.body.data.id;
      const res = await request(app)
        .post(`/products/${product1Id}/variants/${type1Id}/options`)
        .set('Authorization', `Bearer ${seller1.accessToken}`)
        .send({ value: 'Large' });
      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
    });
  });
});
