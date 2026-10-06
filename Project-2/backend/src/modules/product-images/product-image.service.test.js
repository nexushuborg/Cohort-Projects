const ownershipService = require("../ownership/ownership.service");
jest.mock("../ownership/ownership.service");
const service = require('./product-image.service');
const repository = require('./product-image.repository');
const productRepository = require('../products/product.repository');

jest.mock('./product-image.repository');
jest.mock('../products/product.repository');

describe('Product Image Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    ownershipService.verifyStoreOwnership.mockResolvedValue({ id: "store-1" });
    ownershipService.verifyProductOwnership.mockResolvedValue({ id: "1", store_id: "store-1" });
  });

  const mockImage = { id: '33333333-3333-3333-3333-333333333333', product_id: '22222222-2222-2222-2222-222222222222', url: '/uploads/products/abc123.jpg', sort_order: 0, created_at: new Date().toISOString() };
  const mockProduct = { id: '22222222-2222-2222-2222-222222222222', name: 'Classic White Tee', slug: 'classic-white-tee' };
  const mockFile = { path: '/tmp/abc123.jpg', mimetype: 'image/jpeg', size: 1024 * 100, originalname: 'test.jpg' };

  describe('validateFile', () => {
    it('should pass for valid jpg', () => { expect(() => service.validateFile(mockFile)).not.toThrow(); });
    it('should pass for valid png', () => { expect(() => service.validateFile({ ...mockFile, mimetype: 'image/png' })).not.toThrow(); });
    it('should pass for valid webp', () => { expect(() => service.validateFile({ ...mockFile, mimetype: 'image/webp' })).not.toThrow(); });
    it('should throw for no file', () => { expect(() => service.validateFile(null)).toThrow('No file uploaded'); });
    it('should throw for invalid type', () => { expect(() => service.validateFile({ ...mockFile, mimetype: 'image/gif' })).toThrow('Invalid file type'); });
    it('should throw for file too large', () => { expect(() => service.validateFile({ ...mockFile, size: 6*1024*1024 })).toThrow('File too large'); });
    it('should throw for pdf', () => { expect(() => service.validateFile({ ...mockFile, mimetype: 'application/pdf' })).toThrow('Invalid file type'); });
  });

  describe('uploadImage', () => {
    it('should upload successfully', async () => { productRepository.findById.mockResolvedValue(mockProduct); repository.getMaxSortOrder.mockResolvedValue(1); repository.create.mockResolvedValue({ ...mockImage, sort_order: 2 }); const r = await service.uploadImage(mockProduct.id, mockFile); expect(r.sort_order).toBe(2); });
    it('should set sort_order 0 for first image', async () => { productRepository.findById.mockResolvedValue(mockProduct); repository.getMaxSortOrder.mockResolvedValue(-1); repository.create.mockResolvedValue({ ...mockImage, sort_order: 0 }); const r = await service.uploadImage(mockProduct.id, mockFile); expect(r.sort_order).toBe(0); });
    it('should throw 404 for nonexistent product', async () => { ownershipService.verifyProductOwnership.mockRejectedValue(Object.assign(new Error('Product not found'), { status: 404, code: 'NOT_FOUND' })); productRepository.findById.mockResolvedValue(null); await expect(service.uploadImage('nonexistent', mockFile)).rejects.toThrow('Product not found'); });
    it('should throw for invalid type', async () => { await expect(service.uploadImage(mockProduct.id, { ...mockFile, mimetype: 'image/gif' })).rejects.toThrow('Invalid file type'); });
    it('should throw for no file', async () => { await expect(service.uploadImage(mockProduct.id, null)).rejects.toThrow('No file uploaded'); });
    it('should throw for file too large', async () => { await expect(service.uploadImage(mockProduct.id, { ...mockFile, size: 6*1024*1024 })).rejects.toThrow('File too large'); });
  });

  describe('getImagesByProductId', () => {
    it('should return images', async () => { productRepository.findById.mockResolvedValue(mockProduct); repository.findByProductId.mockResolvedValue([mockImage]); const r = await service.getImagesByProductId(mockProduct.id); expect(r).toHaveLength(1); });
    it('should return empty array', async () => { productRepository.findById.mockResolvedValue(mockProduct); repository.findByProductId.mockResolvedValue([]); const r = await service.getImagesByProductId(mockProduct.id); expect(r).toHaveLength(0); });
    it('should throw 404 for nonexistent product', async () => { ownershipService.verifyProductOwnership.mockRejectedValue(Object.assign(new Error('Product not found'), { status: 404, code: 'NOT_FOUND' })); productRepository.findById.mockResolvedValue(null); await expect(service.getImagesByProductId('nonexistent')).rejects.toThrow('Product not found'); });
  });

  describe('getImageById', () => {
    it('should return image', async () => { repository.findById.mockResolvedValue(mockImage); const r = await service.getImageById(mockImage.id); expect(r).toEqual(mockImage); });
    it('should throw 404', async () => { repository.findById.mockResolvedValue(null); await expect(service.getImageById('nonexistent')).rejects.toThrow('Image not found'); });
  });

  describe('setPrimaryImage', () => {
    it('should set non-primary as primary', async () => { const pri = { ...mockImage, sort_order: 0 }; const nonPri = { ...mockImage, id: '44444444-4444-4444-4444-444444444444', sort_order: 1 }; productRepository.findById.mockResolvedValue(mockProduct); repository.findById.mockResolvedValueOnce(nonPri).mockResolvedValueOnce({ ...nonPri, sort_order: 0 }); repository.findByProductId.mockResolvedValue([pri, nonPri]); repository.bulkUpdateSortOrder.mockResolvedValue(); const r = await service.setPrimaryImage(mockProduct.id, nonPri.id); expect(r.sort_order).toBe(0); });
    it('should return if already primary', async () => { const pri = { ...mockImage, sort_order: 0 }; productRepository.findById.mockResolvedValue(mockProduct); repository.findById.mockResolvedValue(pri); repository.findByProductId.mockResolvedValue([pri]); const r = await service.setPrimaryImage(mockProduct.id, pri.id); expect(r.sort_order).toBe(0); expect(repository.bulkUpdateSortOrder).not.toHaveBeenCalled(); });
    it('should throw 404 for nonexistent product', async () => { ownershipService.verifyProductOwnership.mockRejectedValue(Object.assign(new Error('Product not found'), { status: 404, code: 'NOT_FOUND' })); productRepository.findById.mockResolvedValue(null); await expect(service.setPrimaryImage('nonexistent', mockImage.id)).rejects.toThrow('Product not found'); });
    it('should throw 404 for nonexistent image', async () => { productRepository.findById.mockResolvedValue(mockProduct); repository.findById.mockResolvedValue(null); await expect(service.setPrimaryImage(mockProduct.id, 'nonexistent')).rejects.toThrow('Image not found'); });
    it('should throw if wrong product', async () => { productRepository.findById.mockResolvedValue(mockProduct); repository.findById.mockResolvedValue({ ...mockImage, product_id: 'wrong' }); await expect(service.setPrimaryImage(mockProduct.id, mockImage.id)).rejects.toThrow('Image does not belong to this product'); });
  });

  describe('deleteImage', () => {
    it('should delete successfully', async () => { productRepository.findById.mockResolvedValue(mockProduct); repository.findById.mockResolvedValue(mockImage); repository.remove.mockResolvedValue(true); const r = await service.deleteImage(mockProduct.id, mockImage.id); expect(r).toBe(true); });
    it('should throw 404 for nonexistent product', async () => { ownershipService.verifyProductOwnership.mockRejectedValue(Object.assign(new Error('Product not found'), { status: 404, code: 'NOT_FOUND' })); productRepository.findById.mockResolvedValue(null); await expect(service.deleteImage('nonexistent', mockImage.id)).rejects.toThrow('Product not found'); });
    it('should throw 404 for nonexistent image', async () => { productRepository.findById.mockResolvedValue(mockProduct); repository.findById.mockResolvedValue(null); await expect(service.deleteImage(mockProduct.id, 'nonexistent')).rejects.toThrow('Image not found'); });
    it('should throw if wrong product', async () => { productRepository.findById.mockResolvedValue(mockProduct); repository.findById.mockResolvedValue({ ...mockImage, product_id: 'wrong' }); await expect(service.deleteImage(mockProduct.id, mockImage.id)).rejects.toThrow('Image does not belong to this product'); });
  });
});
