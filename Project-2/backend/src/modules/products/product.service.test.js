const service = require('./product.service');
const repository = require('./product.repository');

// Mock the repository
jest.mock('./product.repository');

describe('Product Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ─── generateSlug ───────────────────────────────────────────
  describe('generateSlug', () => {
    it('should generate a slug from a product name', () => {
      expect(service.generateSlug('Classic White T-Shirt')).toBe('classic-white-t-shirt');
    });

    it('should handle special characters', () => {
      expect(service.generateSlug('iPhone 14 Pro Max!')).toBe('iphone-14-pro-max');
    });

    it('should handle multiple dashes', () => {
      expect(service.generateSlug('Hello   World!!!')).toBe('hello-world');
    });

    it('should trim leading and trailing dashes', () => {
      expect(service.generateSlug('  Test Product  ')).toBe('test-product');
    });
  });

  // ─── createProduct ──────────────────────────────────────────
  describe('createProduct', () => {
    it('should create a product with generated slug', async () => {
      const input = {
        storeId: '11111111-1111-1111-1111-111111111111',
        name: 'Classic White Tee',
        price: 299.00,
      };

      repository.slugExists.mockResolvedValue(false);
      repository.create.mockResolvedValue({
        id: '22222222-2222-2222-2222-222222222222',
        store_id: input.storeId,
        name: input.name,
        slug: 'classic-white-tee',
        price: 299.00,
        status: 'draft',
        created_at: new Date(),
      });

      const product = await service.createProduct(input);

      expect(repository.slugExists).toHaveBeenCalledWith('classic-white-tee', null);
      expect(repository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          store_id: input.storeId,
          name: input.name,
          slug: 'classic-white-tee',
          price: 299.00,
          status: 'draft',
        })
      );
      expect(product.name).toBe('Classic White Tee');
    });

    it('should use provided slug if given', async () => {
      const input = {
        storeId: '11111111-1111-1111-1111-111111111111',
        name: 'Product',
        slug: 'custom-slug',
        price: 100,
      };

      repository.slugExists.mockResolvedValue(false);
      repository.create.mockResolvedValue({ id: '1', slug: 'custom-slug' });

      await service.createProduct(input);

      expect(repository.slugExists).toHaveBeenCalledWith('custom-slug', null);
      expect(repository.create).toHaveBeenCalledWith(
        expect.objectContaining({ slug: 'custom-slug' })
      );
    });

    it('should append counter if slug already exists', async () => {
      const input = {
        storeId: '11111111-1111-1111-1111-111111111111',
        name: 'Existing Product',
        price: 50,
      };

      repository.slugExists
        .mockResolvedValueOnce(true)  // 'existing-product' exists
        .mockResolvedValueOnce(false); // 'existing-product-1' is free
      repository.create.mockResolvedValue({ id: '1', slug: 'existing-product-1' });

      await service.createProduct(input);

      expect(repository.slugExists).toHaveBeenCalledWith('existing-product', null);
      expect(repository.slugExists).toHaveBeenCalledWith('existing-product-1', null);
      expect(repository.create).toHaveBeenCalledWith(
        expect.objectContaining({ slug: 'existing-product-1' })
      );
    });

    it('should default status to draft', async () => {
      const input = {
        storeId: '11111111-1111-1111-1111-111111111111',
        name: 'Test Product',
        price: 10,
      };

      repository.slugExists.mockResolvedValue(false);
      repository.create.mockResolvedValue({ id: '1', status: 'draft' });

      const product = await service.createProduct(input);

      expect(repository.create).toHaveBeenCalledWith(
        expect.objectContaining({ status: 'draft' })
      );
    });
  });

  // ─── getProductById ─────────────────────────────────────────
  describe('getProductById', () => {
    it('should return product if found', async () => {
      const mockProduct = { id: '1', name: 'Test Product' };
      repository.findById.mockResolvedValue(mockProduct);

      const product = await service.getProductById('1');

      expect(product).toEqual(mockProduct);
    });

    it('should throw 404 if product not found', async () => {
      repository.findById.mockResolvedValue(null);

      await expect(service.getProductById('nonexistent'))
        .rejects
        .toThrow('Product not found');
    });
  });

  // ─── getProductBySlug ───────────────────────────────────────
  describe('getProductBySlug', () => {
    it('should return product if found by slug', async () => {
      const mockProduct = { id: '1', slug: 'test-product' };
      repository.findBySlug.mockResolvedValue(mockProduct);

      const product = await service.getProductBySlug('test-product');

      expect(product).toEqual(mockProduct);
    });

    it('should throw 404 if slug not found', async () => {
      repository.findBySlug.mockResolvedValue(null);

      await expect(service.getProductBySlug('nonexistent'))
        .rejects
        .toThrow('Product not found');
    });
  });

  // ─── getProducts ────────────────────────────────────────────
  describe('getProducts', () => {
    it('should return paginated products', async () => {
      const mockResult = {
        items: [{ id: '1', name: 'Product 1' }],
        pagination: { page: 1, limit: 20, total: 1, totalPages: 1 },
      };
      repository.findAll.mockResolvedValue(mockResult);

      const result = await service.getProducts({ page: 1, limit: 20 });

      expect(result).toEqual(mockResult);
      expect(repository.findAll).toHaveBeenCalledWith({ page: 1, limit: 20 });
    });
  });

  // ─── updateProduct ──────────────────────────────────────────
  describe('updateProduct', () => {
    it('should update an existing product', async () => {
      const existing = { id: '1', name: 'Old Name', slug: 'old-name' };
      const updated = { id: '1', name: 'New Name', slug: 'new-name' };

      repository.findById.mockResolvedValue(existing);
      repository.slugExists.mockResolvedValue(false);
      repository.update.mockResolvedValue(updated);

      const result = await service.updateProduct('1', { name: 'New Name' });

      expect(result.name).toBe('New Name');
    });

    it('should throw 404 if product not found', async () => {
      repository.findById.mockResolvedValue(null);

      await expect(service.updateProduct('nonexistent', { name: 'Test' }))
        .rejects
        .toThrow('Product not found');
    });

    it('should throw 409 if new slug conflicts', async () => {
      repository.findById.mockResolvedValue({ id: '1', name: 'Test' });
      repository.slugExists.mockResolvedValue(true);

      await expect(service.updateProduct('1', { slug: 'taken-slug' }))
        .rejects
        .toThrow('A product with this slug already exists');
    });
  });

  // ─── deleteProduct ──────────────────────────────────────────
  describe('deleteProduct', () => {
    it('should delete an existing product', async () => {
      repository.findById.mockResolvedValue({ id: '1' });
      repository.remove.mockResolvedValue(true);

      const result = await service.deleteProduct('1');

      expect(result).toBe(true);
      expect(repository.remove).toHaveBeenCalledWith('1');
    });

    it('should throw 404 if product not found', async () => {
      repository.findById.mockResolvedValue(null);

      await expect(service.deleteProduct('nonexistent'))
        .rejects
        .toThrow('Product not found');
    });
  });
});
