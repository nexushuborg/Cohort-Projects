const service = require('./inventory.service');
const repository = require('./inventory.repository');
const ownershipService = require('../ownership/ownership.service');

jest.mock('./inventory.repository');
jest.mock('../ownership/ownership.service');

describe('Inventory Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    ownershipService.verifyProductOwnership.mockResolvedValue({ id: 'prod-1', store_id: 'store-1' });
  });

  describe('getInventory', () => {
    it('should return inventory for a valid SKU', async () => {
      repository.getInventoryBySkuId.mockResolvedValue({ id: 'sku-1', product_id: 'prod-1', stock_quantity: 50 });
      const result = await service.getInventory('prod-1', 'sku-1', 'user-1', 'seller');
      expect(result.stock_quantity).toBe(50);
    });

    it('should throw 404 if SKU not found', async () => {
      repository.getInventoryBySkuId.mockResolvedValue(null);
      await expect(service.getInventory('prod-1', 'sku-1', 'user-1', 'seller')).rejects.toThrow('SKU not found');
    });

    it('should throw 400 if SKU does not belong to product', async () => {
      repository.getInventoryBySkuId.mockResolvedValue({ id: 'sku-1', product_id: 'other-prod', stock_quantity: 50 });
      await expect(service.getInventory('prod-1', 'sku-1', 'user-1', 'seller')).rejects.toThrow('does not belong');
    });

    it('should throw 403 if seller does not own product', async () => {
      ownershipService.verifyProductOwnership.mockRejectedValue(Object.assign(new Error('Forbidden'), { status: 403, code: 'FORBIDDEN' }));
      await expect(service.getInventory('prod-1', 'sku-1', 'user-1', 'seller')).rejects.toThrow('Forbidden');
    });
  });

  describe('getInventoryByProduct', () => {
    it('should return all SKUs for a product', async () => {
      repository.getInventoryByProductId.mockResolvedValue([{ id: 'sku-1' }, { id: 'sku-2' }]);
      const result = await service.getInventoryByProduct('prod-1', 'user-1', 'seller');
      expect(result).toHaveLength(2);
    });
  });

  describe('setStock', () => {
    it('should set stock to absolute value', async () => {
      repository.getInventoryBySkuId.mockResolvedValue({ id: 'sku-1', product_id: 'prod-1' });
      repository.setStock.mockResolvedValue({ id: 'sku-1', stock_quantity: 100 });
      const result = await service.setStock('prod-1', 'sku-1', 100, 'user-1', 'seller');
      expect(result.stock_quantity).toBe(100);
      expect(repository.setStock).toHaveBeenCalledWith('sku-1', 100);
    });

    it('should throw 400 for negative quantity', async () => {
      repository.getInventoryBySkuId.mockResolvedValue({ id: 'sku-1', product_id: 'prod-1' });
      repository.setStock.mockRejectedValue(Object.assign(new Error('negative'), { status: 400 }));
      await expect(service.setStock('prod-1', 'sku-1', -5, 'user-1', 'seller')).rejects.toThrow();
    });

    it('should throw 404 if SKU not found', async () => {
      repository.getInventoryBySkuId.mockResolvedValue(null);
      await expect(service.setStock('prod-1', 'sku-1', 10, 'user-1', 'seller')).rejects.toThrow('SKU not found');
    });
  });

  describe('adjustStock', () => {
    it('should increase stock with positive delta', async () => {
      repository.getInventoryBySkuId.mockResolvedValue({ id: 'sku-1', product_id: 'prod-1' });
      repository.adjustStock.mockResolvedValue({ id: 'sku-1', stock_quantity: 60 });
      const result = await service.adjustStock('prod-1', 'sku-1', 10, 'user-1', 'seller');
      expect(result.stock_quantity).toBe(60);
      expect(repository.adjustStock).toHaveBeenCalledWith('sku-1', 10);
    });

    it('should decrease stock with negative delta', async () => {
      repository.getInventoryBySkuId.mockResolvedValue({ id: 'sku-1', product_id: 'prod-1' });
      repository.adjustStock.mockResolvedValue({ id: 'sku-1', stock_quantity: 40 });
      const result = await service.adjustStock('prod-1', 'sku-1', -10, 'user-1', 'seller');
      expect(result.stock_quantity).toBe(40);
      expect(repository.adjustStock).toHaveBeenCalledWith('sku-1', -10);
    });

    it('should throw 400 if insufficient stock', async () => {
      repository.getInventoryBySkuId.mockResolvedValue({ id: 'sku-1', product_id: 'prod-1' });
      repository.adjustStock.mockResolvedValue(null);
      await expect(service.adjustStock('prod-1', 'sku-1', -100, 'user-1', 'seller')).rejects.toThrow('Insufficient stock');
    });
  });

  describe('reduceStock (internal)', () => {
    it('should reduce stock atomically', async () => {
      repository.adjustStock.mockResolvedValue({ id: 'sku-1', stock_quantity: 40 });
      const result = await service.reduceStock('sku-1', 10);
      expect(result.stock_quantity).toBe(40);
      expect(repository.adjustStock).toHaveBeenCalledWith('sku-1', -10);
    });

    it('should throw 400 for non-positive quantity', async () => {
      await expect(service.reduceStock('sku-1', 0)).rejects.toThrow('positive');
      await expect(service.reduceStock('sku-1', -5)).rejects.toThrow('positive');
    });

    it('should throw 400 if insufficient stock', async () => {
      repository.adjustStock.mockResolvedValue(null);
      await expect(service.reduceStock('sku-1', 100)).rejects.toThrow('Insufficient stock');
    });
  });

  describe('restoreStock (internal)', () => {
    it('should restore stock atomically', async () => {
      repository.adjustStock.mockResolvedValue({ id: 'sku-1', stock_quantity: 60 });
      const result = await service.restoreStock('sku-1', 10);
      expect(result.stock_quantity).toBe(60);
      expect(repository.adjustStock).toHaveBeenCalledWith('sku-1', 10);
    });

    it('should throw 400 for non-positive quantity', async () => {
      await expect(service.restoreStock('sku-1', 0)).rejects.toThrow('positive');
    });
  });
});
