const service = require('./variant.service');
const repository = require('./variant.repository');
const productRepository = require('../products/product.repository');

jest.mock('./variant.repository');
jest.mock('../products/product.repository');

describe('Variant Service', () => {
  beforeEach(() => { jest.clearAllMocks(); });
  const mockProduct = { id: '22222222-2222-2222-2222-222222222222', name: 'T-Shirt' };
  const mockType = { id: '44444444-4444-4444-4444-444444444444', product_id: mockProduct.id, name: 'Color', created_at: new Date().toISOString() };
  const mockOption = { id: '55555555-5555-5555-5555-555555555555', variant_type_id: mockType.id, value: 'Red', created_at: new Date().toISOString() };

  describe('createVariantType', () => {
    it('should create', async () => { productRepository.findById.mockResolvedValue(mockProduct); repository.typeNameExists.mockResolvedValue(false); repository.createType.mockResolvedValue(mockType); const r = await service.createVariantType(mockProduct.id, { name: 'Color' }); expect(r.name).toBe('Color'); });
    it('should throw 404', async () => { productRepository.findById.mockResolvedValue(null); await expect(service.createVariantType('n', { name: 'C' })).rejects.toThrow('Product not found'); });
    it('should throw 409', async () => { productRepository.findById.mockResolvedValue(mockProduct); repository.typeNameExists.mockResolvedValue(true); await expect(service.createVariantType(mockProduct.id, { name: 'C' })).rejects.toThrow('already exists'); });
  });
  describe('getVariantTypesByProductId', () => {
    it('should return types', async () => { productRepository.findById.mockResolvedValue(mockProduct); repository.findTypesByProductId.mockResolvedValue([mockType]); const r = await service.getVariantTypesByProductId(mockProduct.id); expect(r).toHaveLength(1); });
    it('should throw 404', async () => { productRepository.findById.mockResolvedValue(null); await expect(service.getVariantTypesByProductId('n')).rejects.toThrow('Product not found'); });
  });
  describe('getVariantTypeById', () => {
    it('should return with options', async () => { productRepository.findById.mockResolvedValue(mockProduct); repository.findTypeById.mockResolvedValue(mockType); repository.findOptionsByTypeId.mockResolvedValue([mockOption]); const r = await service.getVariantTypeById(mockProduct.id, mockType.id); expect(r.options).toHaveLength(1); });
    it('should throw 404', async () => { productRepository.findById.mockResolvedValue(mockProduct); repository.findTypeById.mockResolvedValue(null); await expect(service.getVariantTypeById(mockProduct.id, 'n')).rejects.toThrow('not found'); });
    it('should throw wrong product', async () => { productRepository.findById.mockResolvedValue(mockProduct); repository.findTypeById.mockResolvedValue({ ...mockType, product_id: 'w' }); await expect(service.getVariantTypeById(mockProduct.id, mockType.id)).rejects.toThrow('does not belong'); });
  });
  describe('updateVariantType', () => {
    it('should update', async () => { productRepository.findById.mockResolvedValue(mockProduct); repository.findTypeById.mockResolvedValue(mockType); repository.typeNameExists.mockResolvedValue(false); repository.updateType.mockResolvedValue({ ...mockType, name: 'Size' }); const r = await service.updateVariantType(mockProduct.id, mockType.id, { name: 'Size' }); expect(r.name).toBe('Size'); });
    it('should throw 404', async () => { productRepository.findById.mockResolvedValue(mockProduct); repository.findTypeById.mockResolvedValue(null); await expect(service.updateVariantType(mockProduct.id, 'n', { name: 'X' })).rejects.toThrow('not found'); });
    it('should throw 409', async () => { productRepository.findById.mockResolvedValue(mockProduct); repository.findTypeById.mockResolvedValue(mockType); repository.typeNameExists.mockResolvedValue(true); await expect(service.updateVariantType(mockProduct.id, mockType.id, { name: 'X' })).rejects.toThrow('already exists'); });
  });
  describe('deleteVariantType', () => {
    it('should delete', async () => { productRepository.findById.mockResolvedValue(mockProduct); repository.findTypeById.mockResolvedValue(mockType); repository.removeType.mockResolvedValue(true); const r = await service.deleteVariantType(mockProduct.id, mockType.id); expect(r).toBe(true); });
    it('should throw 404', async () => { productRepository.findById.mockResolvedValue(mockProduct); repository.findTypeById.mockResolvedValue(null); await expect(service.deleteVariantType(mockProduct.id, 'n')).rejects.toThrow('not found'); });
    it('should throw wrong product', async () => { productRepository.findById.mockResolvedValue(mockProduct); repository.findTypeById.mockResolvedValue({ ...mockType, product_id: 'w' }); await expect(service.deleteVariantType(mockProduct.id, mockType.id)).rejects.toThrow('does not belong'); });
  });
  describe('createVariantOption', () => {
    it('should create', async () => { productRepository.findById.mockResolvedValue(mockProduct); repository.findTypeById.mockResolvedValue(mockType); repository.optionValueExists.mockResolvedValue(false); repository.createOption.mockResolvedValue(mockOption); const r = await service.createVariantOption(mockProduct.id, mockType.id, { value: 'Red' }); expect(r.value).toBe('Red'); });
    it('should throw 409', async () => { productRepository.findById.mockResolvedValue(mockProduct); repository.findTypeById.mockResolvedValue(mockType); repository.optionValueExists.mockResolvedValue(true); await expect(service.createVariantOption(mockProduct.id, mockType.id, { value: 'R' })).rejects.toThrow('already exists'); });
    it('should throw wrong product', async () => { productRepository.findById.mockResolvedValue(mockProduct); repository.findTypeById.mockResolvedValue({ ...mockType, product_id: 'w' }); await expect(service.createVariantOption(mockProduct.id, mockType.id, { value: 'R' })).rejects.toThrow('does not belong'); });
    it('should throw 404 product', async () => { productRepository.findById.mockResolvedValue(null); await expect(service.createVariantOption('n', mockType.id, { value: 'R' })).rejects.toThrow('Product not found'); });
    it('should throw 404 type', async () => { productRepository.findById.mockResolvedValue(mockProduct); repository.findTypeById.mockResolvedValue(null); await expect(service.createVariantOption(mockProduct.id, 'n', { value: 'R' })).rejects.toThrow('not found'); });
  });
  describe('updateVariantOption', () => {
    it('should update', async () => { productRepository.findById.mockResolvedValue(mockProduct); repository.findTypeById.mockResolvedValue(mockType); repository.findOptionById.mockResolvedValue(mockOption); repository.optionValueExists.mockResolvedValue(false); repository.updateOption.mockResolvedValue({ ...mockOption, value: 'Blue' }); const r = await service.updateVariantOption(mockProduct.id, mockType.id, mockOption.id, { value: 'Blue' }); expect(r.value).toBe('Blue'); });
    it('should throw 404', async () => { productRepository.findById.mockResolvedValue(mockProduct); repository.findTypeById.mockResolvedValue(mockType); repository.findOptionById.mockResolvedValue(null); await expect(service.updateVariantOption(mockProduct.id, mockType.id, 'n', { value: 'X' })).rejects.toThrow('not found'); });
    it('should throw wrong type', async () => { productRepository.findById.mockResolvedValue(mockProduct); repository.findTypeById.mockResolvedValue(mockType); repository.findOptionById.mockResolvedValue({ ...mockOption, variant_type_id: 'w' }); await expect(service.updateVariantOption(mockProduct.id, mockType.id, mockOption.id, { value: 'X' })).rejects.toThrow('does not belong'); });
    it('should throw 409', async () => { productRepository.findById.mockResolvedValue(mockProduct); repository.findTypeById.mockResolvedValue(mockType); repository.findOptionById.mockResolvedValue(mockOption); repository.optionValueExists.mockResolvedValue(true); await expect(service.updateVariantOption(mockProduct.id, mockType.id, mockOption.id, { value: 'B' })).rejects.toThrow('already exists'); });
  });
  describe('deleteVariantOption', () => {
    it('should delete', async () => { productRepository.findById.mockResolvedValue(mockProduct); repository.findTypeById.mockResolvedValue(mockType); repository.findOptionById.mockResolvedValue(mockOption); repository.removeOption.mockResolvedValue(true); const r = await service.deleteVariantOption(mockProduct.id, mockType.id, mockOption.id); expect(r).toBe(true); });
    it('should throw 404', async () => { productRepository.findById.mockResolvedValue(mockProduct); repository.findTypeById.mockResolvedValue(mockType); repository.findOptionById.mockResolvedValue(null); await expect(service.deleteVariantOption(mockProduct.id, mockType.id, 'n')).rejects.toThrow('not found'); });
    it('should throw wrong type', async () => { productRepository.findById.mockResolvedValue(mockProduct); repository.findTypeById.mockResolvedValue(mockType); repository.findOptionById.mockResolvedValue({ ...mockOption, variant_type_id: 'w' }); await expect(service.deleteVariantOption(mockProduct.id, mockType.id, mockOption.id)).rejects.toThrow('does not belong'); });
  });
});
