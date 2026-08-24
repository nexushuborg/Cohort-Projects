const request = require('supertest');
const jwt = require('jsonwebtoken');
const app = require('../../app');
const service = require('./product.service');

// Mock the service layer for controller tests
jest.mock('./product.service');

// Generate a valid test JWT
const TEST_SECRET = 'dev-secret-key-change-in-prod-12345';
const sellerToken = jwt.sign(
  { sub: '22222222-2222-2222-2222-222222222222', email: 'seller@test.com', role: 'seller', name: 'Test Seller' },
  TEST_SECRET,
  { expiresIn: '1h' }
);

describe('Product Controller (Integration)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const mockProduct = {
    id: '22222222-2222-2222-2222-222222222222',
    store_id: '11111111-1111-1111-1111-111111111111',
    title: 'Classic White Tee',
    slug: 'classic-white-tee',
    description: '100% cotton',
    brand: 'Fashion Co',
    price: 299.00,
    status: 'draft',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  // ─── POST /products ────────────────────────────────────────
  describe('POST /products', () => {
    it('should create a product and return 201', async () => {
      service.createProduct.mockResolvedValue(mockProduct);

      const res = await request(app)
        .post('/products')
        .set('Authorization', 'Bearer ' + sellerToken)
        .send({
          storeId: '11111111-1111-1111-1111-111111111111',
          title: 'Classic White Tee',
          price: 299.00,
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.title).toBe('Classic White Tee');
      expect(res.body.data.slug).toBe('classic-white-tee');
    });

    it('should return 401 without auth token', async () => {
      const res = await request(app)
        .post('/products')
        .send({
          storeId: '11111111-1111-1111-1111-111111111111',
          title: 'Classic White Tee',
          price: 299.00,
        });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('should return 403 for non-seller role', async () => {
      const buyerToken = jwt.sign(
        { sub: '44444444-4444-4444-4444-444444444444', email: 'buyer@test.com', role: 'buyer', name: 'Test Buyer' },
        TEST_SECRET,
        { expiresIn: '1h' }
      );

      const res = await request(app)
        .post('/products')
        .set('Authorization', 'Bearer ' + buyerToken)
        .send({
          storeId: '11111111-1111-1111-1111-111111111111',
          title: 'Classic White Tee',
          price: 299.00,
        });

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
    });

    it('should return 400 for missing required fields', async () => {
      const res = await request(app)
        .post('/products')
        .set('Authorization', 'Bearer ' + sellerToken)
        .send({ title: 'Test' }); // Missing storeId and price

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 for invalid price', async () => {
      const res = await request(app)
        .post('/products')
        .set('Authorization', 'Bearer ' + sellerToken)
        .send({
          storeId: '11111111-1111-1111-1111-111111111111',
          title: 'Test Product',
          price: -10,
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should return 400 for short product title', async () => {
      const res = await request(app)
        .post('/products')
        .set('Authorization', 'Bearer ' + sellerToken)
        .send({
          storeId: '11111111-1111-1111-1111-111111111111',
          title: 'AB',
          price: 100,
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  // ─── GET /products ─────────────────────────────────────────
  describe('GET /products', () => {
    it('should return paginated products', async () => {
      service.getProducts.mockResolvedValue({
        items: [mockProduct],
        pagination: { page: 1, limit: 20, total: 1, totalPages: 1 },
      });

      const res = await request(app).get('/products');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.items).toHaveLength(1);
      expect(res.body.data.pagination.total).toBe(1);
    });

    it('should pass query params to service', async () => {
      service.getProducts.mockResolvedValue({
        items: [],
        pagination: { page: 2, limit: 10, total: 0, totalPages: 0 },
      });

      const res = await request(app)
        .get('/products?page=2&limit=10&status=active');

      expect(res.status).toBe(200);
      expect(service.getProducts).toHaveBeenCalledWith(
        expect.objectContaining({ page: 2, limit: 10, status: 'active' })
      );
    });
  });

  // ─── GET /products/:id ─────────────────────────────────────
  describe('GET /products/:id', () => {
    it('should return a product by ID', async () => {
      service.getProductById.mockResolvedValue(mockProduct);

      const res = await request(app).get('/products/' + mockProduct.id);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.id).toBe(mockProduct.id);
    });

    it('should return 404 for nonexistent product', async () => {
      const notFoundError = new Error('Product not found');
      notFoundError.status = 404;
      notFoundError.code = 'NOT_FOUND';
      service.getProductById.mockRejectedValue(notFoundError);

      const res = await request(app).get('/products/nonexistent-id');

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });
  });

  // ─── GET /products/store/:storeId ──────────────────────────
  describe('GET /products/store/:storeId', () => {
    it('should return products for a valid store', async () => {
      service.getProductsByStoreId.mockResolvedValue({
        items: [mockProduct],
        pagination: { page: 1, limit: 20, total: 1, totalPages: 1 },
      });

      const res = await request(app)
        .get('/products/store/' + mockProduct.store_id);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.items).toHaveLength(1);
      expect(res.body.data.pagination.total).toBe(1);
    });

    it('should return 400 for invalid store UUID', async () => {
      const res = await request(app)
        .get('/products/store/not-a-valid-uuid');

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 200 with empty items for store with no products', async () => {
      service.getProductsByStoreId.mockResolvedValue({
        items: [],
        pagination: { page: 1, limit: 20, total: 0, totalPages: 0 },
      });

      const res = await request(app)
        .get('/products/store/' + mockProduct.store_id);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.items).toHaveLength(0);
      expect(res.body.data.pagination.total).toBe(0);
    });

    it('should pass pagination query params to service', async () => {
      service.getProductsByStoreId.mockResolvedValue({
        items: [],
        pagination: { page: 2, limit: 5, total: 0, totalPages: 0 },
      });

      const res = await request(app)
        .get('/products/store/' + mockProduct.store_id + '?page=2&limit=5');

      expect(res.status).toBe(200);
      expect(service.getProductsByStoreId).toHaveBeenCalledWith(
        mockProduct.store_id,
        { page: 2, limit: 5 }
      );
    });

    it('should return 400 for invalid query params', async () => {
      const res = await request(app)
        .get('/products/store/' + mockProduct.store_id + '?page=-1');

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });
  });

  // ─── PUT /products/:id ─────────────────────────────────────
  describe('PUT /products/:id', () => {
    it('should update a product', async () => {
      const updated = { ...mockProduct, title: 'Updated Tee' };
      service.updateProduct.mockResolvedValue(updated);

      const res = await request(app)
        .put('/products/' + mockProduct.id)
        .set('Authorization', 'Bearer ' + sellerToken)
        .send({ title: 'Updated Tee' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.title).toBe('Updated Tee');
    });

    it('should return 401 without auth token', async () => {
      const res = await request(app)
        .put('/products/' + mockProduct.id)
        .send({ title: 'Updated Tee' });

      expect(res.status).toBe(401);
    });

    it('should return 400 for empty update body', async () => {
      const res = await request(app)
        .put('/products/' + mockProduct.id)
        .set('Authorization', 'Bearer ' + sellerToken)
        .send({});

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  // ─── DELETE /products/:id ──────────────────────────────────
  describe('DELETE /products/:id', () => {
    it('should delete a product', async () => {
      service.deleteProduct.mockResolvedValue(true);

      const res = await request(app)
        .delete('/products/' + mockProduct.id)
        .set('Authorization', 'Bearer ' + sellerToken);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.message).toBe('Product deleted successfully');
    });

    it('should return 401 without auth token', async () => {
      const res = await request(app).delete('/products/' + mockProduct.id);

      expect(res.status).toBe(401);
    });

    it('should return 404 for nonexistent product', async () => {
      const notFoundError = new Error('Product not found');
      notFoundError.status = 404;
      notFoundError.code = 'NOT_FOUND';
      service.deleteProduct.mockRejectedValue(notFoundError);

      const res = await request(app)
        .delete('/products/nonexistent-id')
        .set('Authorization', 'Bearer ' + sellerToken);

      expect(res.status).toBe(404);
    });
  });

  // ─── 404 Route Handler ─────────────────────────────────────
  describe('Unknown routes', () => {
    it('should return 404 for unknown routes', async () => {
      const res = await request(app).get('/nonexistent');

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('NOT_FOUND');
    });
  });

  // ─── Health Check ──────────────────────────────────────────
  describe('GET /health', () => {
    it('should return health status', async () => {
      const res = await request(app).get('/health');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });
});
