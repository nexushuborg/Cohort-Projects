const request = require('supertest');
const app = require('../src/app');
const { cleanDatabase, createTestUser } = require('./helpers');

describe('Category Module Integration Tests', () => {
  let admin, buyer;

  beforeEach(async () => {
    await cleanDatabase();

    admin = await createTestUser({
      email: 'admin_cat@test.com',
      name: 'Admin Cat',
      role: 'admin',
    });

    buyer = await createTestUser({
      email: 'buyer_cat@test.com',
      name: 'Buyer Cat',
      role: 'buyer',
    });
  });

  describe('Category Hierarchy & Management', () => {
    it('should allow admin to create parent category and subcategories and list them as a tree', async () => {
      // 1. Create Parent Category
      const parentRes = await request(app)
        .post('/categories')
        .set('Authorization', `Bearer ${admin.accessToken}`)
        .send({
          name: 'Computers & Tech',
        });

      expect(parentRes.status).toBe(201);
      expect(parentRes.body.data.slug).toBe('computers-tech');
      const parentId = parentRes.body.data.id;

      // 2. Create Subcategory
      const subRes = await request(app)
        .post('/categories')
        .set('Authorization', `Bearer ${admin.accessToken}`)
        .send({
          name: 'Laptops',
          parentId: parentId,
        });

      expect(subRes.status).toBe(201);
      expect(subRes.body.data.parentId).toBe(parentId);

      // 3. Get Category Tree
      const treeRes = await request(app).get('/categories');
      expect(treeRes.status).toBe(200);
      expect(treeRes.body.success).toBe(true);

      const parentInTree = treeRes.body.data.items.find((c) => c.id === parentId);
      expect(parentInTree).toBeDefined();
      expect(parentInTree.subcategories.length).toBe(1);
      expect(parentInTree.subcategories[0].name).toBe('Laptops');
    });

    it('should prevent deleting a parent category that still has subcategories', async () => {
      const parentRes = await request(app)
        .post('/categories')
        .set('Authorization', `Bearer ${admin.accessToken}`)
        .send({ name: 'Home Appliances' });

      const parentId = parentRes.body.data.id;

      await request(app)
        .post('/categories')
        .set('Authorization', `Bearer ${admin.accessToken}`)
        .send({ name: 'Refrigerators', parentId });

      const deleteRes = await request(app)
        .delete(`/categories/${parentId}`)
        .set('Authorization', `Bearer ${admin.accessToken}`);

      expect(deleteRes.status).toBe(400);
      expect(deleteRes.body.success).toBe(false);
      expect(deleteRes.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should delete a category without children successfully', async () => {
      const catRes = await request(app)
        .post('/categories')
        .set('Authorization', `Bearer ${admin.accessToken}`)
        .send({ name: 'Stationery' });

      const catId = catRes.body.data.id;

      const deleteRes = await request(app)
        .delete(`/categories/${catId}`)
        .set('Authorization', `Bearer ${admin.accessToken}`);

      expect(deleteRes.status).toBe(200);
      expect(deleteRes.body.success).toBe(true);
    });
  });
});
