const request = require('supertest');
const app = require('../../app');
const service = require('./product-image.service');

jest.mock('./product-image.service');

describe('Product Image Controller (Integration)', () => {
  beforeEach(() => { jest.clearAllMocks(); });

  const mockImage = { id: '33333333-3333-3333-3333-333333333333', product_id: '22222222-2222-2222-2222-222222222222', url: '/uploads/products/abc123.jpg', sort_order: 0, created_at: new Date().toISOString() };
  const productId = '22222222-2222-2222-2222-222222222222';
  const imageId = '33333333-3333-3333-3333-333333333333';
  // Use valid UUIDs that will pass param validation but trigger service 404
  const nonexistentProductId = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
  const nonexistentImageId = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb';

  describe('GET /products/:productId/images', () => {
    it('should return images for a product', async () => {
      service.getImagesByProductId.mockResolvedValue([mockImage]);
      const res = await request(app).get('/products/' + productId + '/images');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveLength(1);
    });

    it('should return 404 for nonexistent product', async () => {
      const notFoundError = new Error('Product not found');
      notFoundError.status = 404;
      notFoundError.code = 'NOT_FOUND';
      service.getImagesByProductId.mockRejectedValue(notFoundError);
      const res = await request(app).get('/products/' + nonexistentProductId + '/images');
      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });

    it('should return 400 for invalid product UUID', async () => {
      const res = await request(app).get('/products/not-a-uuid/images');
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('POST /products/:productId/images', () => {
    it('should upload an image successfully', async () => {
      service.uploadImage.mockResolvedValue(mockImage);
      const res = await request(app)
        .post('/products/' + productId + '/images')
        .attach('image', Buffer.from('fake-image-data'), { filename: 'test.jpg', contentType: 'image/jpeg' });
      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.id).toBe(imageId);
    });

    it('should return 400 when no file is uploaded', async () => {
      const badRequestError = new Error('No file uploaded');
      badRequestError.status = 400;
      badRequestError.code = 'VALIDATION_ERROR';
      service.uploadImage.mockRejectedValue(badRequestError);
      const res = await request(app)
        .post('/products/' + productId + '/images');
      expect(res.status).toBe(400);
    });

    it('should return 404 for nonexistent product', async () => {
      const notFoundError = new Error('Product not found');
      notFoundError.status = 404;
      notFoundError.code = 'NOT_FOUND';
      service.uploadImage.mockRejectedValue(notFoundError);
      const res = await request(app)
        .post('/products/' + nonexistentProductId + '/images')
        .attach('image', Buffer.from('fake-image-data'), { filename: 'test.jpg', contentType: 'image/jpeg' });
      expect(res.status).toBe(404);
    });

    it('should return 400 for invalid product UUID', async () => {
      const res = await request(app)
        .post('/products/not-a-uuid/images')
        .attach('image', Buffer.from('fake-image-data'), { filename: 'test.jpg', contentType: 'image/jpeg' });
      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('PUT /products/:productId/images/:imageId/primary', () => {
    it('should set an image as primary', async () => {
      service.setPrimaryImage.mockResolvedValue({ ...mockImage, sort_order: 0 });
      const res = await request(app)
        .put('/products/' + productId + '/images/' + imageId + '/primary');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('should return 404 for nonexistent image', async () => {
      const notFoundError = new Error('Image not found');
      notFoundError.status = 404;
      notFoundError.code = 'NOT_FOUND';
      service.setPrimaryImage.mockRejectedValue(notFoundError);
      const res = await request(app)
        .put('/products/' + productId + '/images/' + nonexistentImageId + '/primary');
      expect(res.status).toBe(404);
    });

    it('should return 400 for invalid UUIDs', async () => {
      const res = await request(app)
        .put('/products/not-a-uuid/images/not-a-uuid/primary');
      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('DELETE /products/:productId/images/:imageId', () => {
    it('should delete an image', async () => {
      service.deleteImage.mockResolvedValue(true);
      const res = await request(app)
        .delete('/products/' + productId + '/images/' + imageId);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.message).toBe('Image deleted successfully');
    });

    it('should return 404 for nonexistent image', async () => {
      const notFoundError = new Error('Image not found');
      notFoundError.status = 404;
      notFoundError.code = 'NOT_FOUND';
      service.deleteImage.mockRejectedValue(notFoundError);
      const res = await request(app)
        .delete('/products/' + productId + '/images/' + nonexistentImageId);
      expect(res.status).toBe(404);
    });

    it('should return 400 for invalid UUIDs', async () => {
      const res = await request(app)
        .delete('/products/not-a-uuid/images/not-a-uuid');
      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });
  });
});
