const service = require('./cart.service');
const repository = require('./cart.repository');
const skuRepository = require('../skus/sku.repository');
const productRepository = require('../products/product.repository');
const inventoryRepository = require('../inventory/inventory.repository');

jest.mock('./cart.repository');
jest.mock('../skus/sku.repository');
jest.mock('../products/product.repository');
jest.mock('../inventory/inventory.repository');

describe('Cart Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getEffectivePrice', () => {
    it('should use price_override when set', () => {
      expect(service.getEffectivePrice(99.99, 50.00)).toBe(99.99);
    });

    it('should fall back to product price when override is null', () => {
      expect(service.getEffectivePrice(null, 50.00)).toBe(50.00);
    });

    it('should fall back to product price when override is undefined', () => {
      expect(service.getEffectivePrice(undefined, 50.00)).toBe(50.00);
    });
  });

  describe('addItem', () => {
    const mockSku = { id: 'sku-1', product_id: 'prod-1', status: 'active' };
    const mockProduct = { id: 'prod-1', status: 'active', price: 25.00 };
    const mockInventory = { id: 'sku-1', stock_quantity: 50 };

    beforeEach(() => {
      skuRepository.findSkuById.mockResolvedValue(mockSku);
      productRepository.findById.mockResolvedValue(mockProduct);
      inventoryRepository.getInventoryBySkuId.mockResolvedValue(mockInventory);
      repository.upsert.mockResolvedValue({ item: { id: 'cart-1', sku_id: 'sku-1', quantity: 2 }, isUpdate: false });
    });

    it('should add item to cart successfully', async () => {
      const result = await service.addItem('user-1', 'sku-1', 2);
      expect(result.item.id).toBe('cart-1');
      expect(result.isUpdate).toBe(false);
      expect(repository.upsert).toHaveBeenCalledWith('user-1', 'sku-1', 2);
    });

    it('should throw 404 if SKU not found', async () => {
      skuRepository.findSkuById.mockResolvedValue(null);
      await expect(service.addItem('user-1', 'bad-sku', 1)).rejects.toThrow('SKU not found');
    });

    it('should throw 400 if SKU is not active', async () => {
      skuRepository.findSkuById.mockResolvedValue({ ...mockSku, status: 'draft' });
      await expect(service.addItem('user-1', 'sku-1', 1)).rejects.toThrow('not available');
    });

    it('should throw 404 if product not found', async () => {
      productRepository.findById.mockResolvedValue(null);
      await expect(service.addItem('user-1', 'sku-1', 1)).rejects.toThrow('Product not found');
    });

    it('should throw 400 if product is not active', async () => {
      productRepository.findById.mockResolvedValue({ ...mockProduct, status: 'archived' });
      await expect(service.addItem('user-1', 'sku-1', 1)).rejects.toThrow('not available');
    });

    it('should throw 400 if insufficient stock', async () => {
      inventoryRepository.getInventoryBySkuId.mockResolvedValue({ stock_quantity: 1 });
      await expect(service.addItem('user-1', 'sku-1', 5)).rejects.toThrow('Insufficient stock');
    });

    it('should throw 400 if inventory not found', async () => {
      inventoryRepository.getInventoryBySkuId.mockResolvedValue(null);
      await expect(service.addItem('user-1', 'sku-1', 1)).rejects.toThrow('Insufficient stock');
    });
  });

  describe('getCart', () => {
    it('should return empty cart', async () => {
      repository.findByUserId.mockResolvedValue([]);
      const result = await service.getCart('user-1');
      expect(result.items).toHaveLength(0);
      expect(result.groups).toHaveLength(0);
      expect(result.summary.totalItems).toBe(0);
      expect(result.summary.totalAmount).toBe(0);
    });

    it('should return cart with items and correct totals', async () => {
      repository.findByUserId.mockResolvedValue([
        {
          id: 'cart-1', sku_id: 'sku-1', quantity: 2,
          sku_code: 'SKU-001', price_override: null,
          product_id: 'prod-1', product_title: 'Shirt', product_price: 25.00,
          store_id: 'store-1', store_name: 'Shop A', store_slug: 'shop-a',
        },
      ]);
      const result = await service.getCart('user-1');
      expect(result.items).toHaveLength(1);
      expect(result.items[0].effectivePrice).toBe(25.00);
      expect(result.items[0].subtotal).toBe(50.00);
      expect(result.summary.totalItems).toBe(2);
      expect(result.summary.totalAmount).toBe(50.00);
    });

    it('should use price_override for effective price', async () => {
      repository.findByUserId.mockResolvedValue([
        {
          id: 'cart-1', sku_id: 'sku-1', quantity: 1,
          sku_code: 'SKU-001', price_override: 99.99,
          product_id: 'prod-1', product_title: 'Shirt', product_price: 25.00,
          store_id: 'store-1', store_name: 'Shop A', store_slug: 'shop-a',
        },
      ]);
      const result = await service.getCart('user-1');
      expect(result.items[0].effectivePrice).toBe(99.99);
      expect(result.items[0].subtotal).toBe(99.99);
    });

    it('should group items by store', async () => {
      repository.findByUserId.mockResolvedValue([
        {
          id: 'cart-1', sku_id: 'sku-1', quantity: 1,
          sku_code: 'SKU-001', price_override: null,
          product_id: 'prod-1', product_title: 'Shirt', product_price: 25.00,
          store_id: 'store-1', store_name: 'Shop A', store_slug: 'shop-a',
        },
        {
          id: 'cart-2', sku_id: 'sku-2', quantity: 2,
          sku_code: 'SKU-002', price_override: null,
          product_id: 'prod-2', product_title: 'Pants', product_price: 30.00,
          store_id: 'store-2', store_name: 'Shop B', store_slug: 'shop-b',
        },
      ]);
      const result = await service.getCart('user-1');
      expect(result.groups).toHaveLength(2);
      expect(result.summary.totalItems).toBe(3);
      expect(result.summary.totalAmount).toBe(85.00);
    });
  });

  describe('updateQuantity', () => {
    it('should update quantity successfully', async () => {
      repository.findById.mockResolvedValue({ id: 'cart-1', sku_id: 'sku-1', user_id: 'user-1' });
      inventoryRepository.getInventoryBySkuId.mockResolvedValue({ stock_quantity: 50 });
      repository.updateQuantity.mockResolvedValue({ id: 'cart-1', sku_id: 'sku-1', quantity: 5 });
      const result = await service.updateQuantity('user-1', 'cart-1', 5);
      expect(result.quantity).toBe(5);
    });

    it('should throw 404 if cart item not found', async () => {
      repository.findById.mockResolvedValue(null);
      await expect(service.updateQuantity('user-1', 'bad-id', 5)).rejects.toThrow('Cart item not found');
    });

    it('should throw 400 if insufficient stock', async () => {
      repository.findById.mockResolvedValue({ id: 'cart-1', sku_id: 'sku-1', user_id: 'user-1' });
      inventoryRepository.getInventoryBySkuId.mockResolvedValue({ stock_quantity: 2 });
      await expect(service.updateQuantity('user-1', 'cart-1', 10)).rejects.toThrow('Insufficient stock');
    });
  });

  describe('removeItem', () => {
    it('should remove item successfully', async () => {
      repository.findById.mockResolvedValue({ id: 'cart-1', user_id: 'user-1' });
      repository.removeItem.mockResolvedValue(true);
      const result = await service.removeItem('user-1', 'cart-1');
      expect(result).toBe(true);
    });

    it('should throw 404 if cart item not found', async () => {
      repository.findById.mockResolvedValue(null);
      await expect(service.removeItem('user-1', 'bad-id')).rejects.toThrow('Cart item not found');
    });
  });

  describe('clearCart', () => {
    it('should clear cart and return count', async () => {
      repository.clearCart.mockResolvedValue(3);
      const result = await service.clearCart('user-1');
      expect(result).toBe(3);
    });

    it('should handle empty cart', async () => {
      repository.clearCart.mockResolvedValue(0);
      const result = await service.clearCart('user-1');
      expect(result).toBe(0);
    });
  });
});
