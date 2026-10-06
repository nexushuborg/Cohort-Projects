const ownershipService = require("../ownership/ownership.service");
jest.mock("../ownership/ownership.service");
const service = require("./sku.service");
const repository = require("./sku.repository");
const productRepository = require("../products/product.repository");

jest.mock("./sku.repository");
jest.mock("../products/product.repository");

describe("SKU Service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    ownershipService.verifyStoreOwnership.mockResolvedValue({ id: "store-1" });
    ownershipService.verifyProductOwnership.mockResolvedValue({ id: "1", store_id: "store-1" });
  });
  const mockProduct = { id: "22222222-2222-2222-2222-222222222222", name: "T-Shirt" };
  const mockOption = { id: "55555555-5555-5555-5555-555555555555", variant_type_id: "44444444-4444-4444-4444-444444444444", value: "Red" };
  const mockType = { id: "44444444-4444-4444-4444-444444444444", product_id: mockProduct.id, name: "Color" };
  const mockSku = { id: "66666666-6666-6666-6666-666666666666", product_id: mockProduct.id, sku_code: "TSHIRT-RED", price_override: 299.00, stock_quantity: 10, status: "active", created_at: new Date().toISOString() };

  describe("createSku", () => {
    it("should create", async () => { productRepository.findById.mockResolvedValue(mockProduct); repository.skuCodeExists.mockResolvedValue(false); repository.findVariantOptionById.mockResolvedValue(mockOption); repository.findVariantTypeById.mockResolvedValue(mockType); repository.findSkusByProductId.mockResolvedValue([]); repository.createSku.mockResolvedValue(mockSku); const r = await service.createSku(mockProduct.id, { skuCode: "TSHIRT-RED", priceOverride: 299.00, variantOptionIds: [mockOption.id] }); expect(r.sku_code).toBe("TSHIRT-RED"); });
    it("should throw 404", async () => { ownershipService.verifyProductOwnership.mockRejectedValue(Object.assign(new Error("Product not found"), { status: 404, code: "NOT_FOUND" })); productRepository.findById.mockResolvedValue(null); await expect(service.createSku("n", { skuCode: "X", variantOptionIds: [] })).rejects.toThrow("Product not found"); });
    it("should throw 409 duplicate code", async () => { productRepository.findById.mockResolvedValue(mockProduct); repository.skuCodeExists.mockResolvedValue(true); await expect(service.createSku(mockProduct.id, { skuCode: "DUP", variantOptionIds: [] })).rejects.toThrow("already exists"); });
    it("should throw wrong product option", async () => { productRepository.findById.mockResolvedValue(mockProduct); repository.skuCodeExists.mockResolvedValue(false); repository.findVariantOptionById.mockResolvedValue({ ...mockOption, variant_type_id: "wrong" }); repository.findVariantTypeById.mockResolvedValue({ ...mockType, product_id: "wrong" }); await expect(service.createSku(mockProduct.id, { skuCode: "X", variantOptionIds: ["opt1"] })).rejects.toThrow("does not belong"); });
  });

  describe("getSkusByProductId", () => {
    it("should return SKUs", async () => { productRepository.findById.mockResolvedValue(mockProduct); repository.findSkusByProductId.mockResolvedValue([mockSku]); const r = await service.getSkusByProductId(mockProduct.id); expect(r).toHaveLength(1); });
    it("should throw 404", async () => { ownershipService.verifyProductOwnership.mockRejectedValue(Object.assign(new Error("Product not found"), { status: 404, code: "NOT_FOUND" })); productRepository.findById.mockResolvedValue(null); await expect(service.getSkusByProductId("n")).rejects.toThrow("Product not found"); });
  });

  describe("getSkuById", () => {
    it("should return SKU with variants", async () => { productRepository.findById.mockResolvedValue(mockProduct); repository.findSkuWithVariants.mockResolvedValue({ ...mockSku, variants: [] }); const r = await service.getSkuById(mockProduct.id, mockSku.id); expect(r.sku_code).toBe("TSHIRT-RED"); });
    it("should throw 404", async () => { productRepository.findById.mockResolvedValue(mockProduct); repository.findSkuWithVariants.mockResolvedValue(null); await expect(service.getSkuById(mockProduct.id, "n")).rejects.toThrow("SKU not found"); });
    it("should throw wrong product", async () => { productRepository.findById.mockResolvedValue(mockProduct); repository.findSkuWithVariants.mockResolvedValue({ ...mockSku, product_id: "wrong" }); await expect(service.getSkuById(mockProduct.id, mockSku.id)).rejects.toThrow("does not belong"); });
  });

  describe("updateSku", () => {
    it("should update", async () => { productRepository.findById.mockResolvedValue(mockProduct); repository.findSkuById.mockResolvedValue(mockSku); repository.skuCodeExists.mockResolvedValue(false); repository.findSkuWithVariants.mockResolvedValue({ ...mockSku, sku_code: "NEW" }); repository.updateSku.mockResolvedValue({}); const r = await service.updateSku(mockProduct.id, mockSku.id, { skuCode: "NEW" }); expect(r.sku_code).toBe("NEW"); });
    it("should throw 404", async () => { productRepository.findById.mockResolvedValue(mockProduct); repository.findSkuById.mockResolvedValue(null); await expect(service.updateSku(mockProduct.id, "n", { skuCode: "X" })).rejects.toThrow("SKU not found"); });
    it("should throw 409 duplicate code", async () => { productRepository.findById.mockResolvedValue(mockProduct); repository.findSkuById.mockResolvedValue(mockSku); repository.skuCodeExists.mockResolvedValue(true); await expect(service.updateSku(mockProduct.id, mockSku.id, { skuCode: "DUP" })).rejects.toThrow("already exists"); });
  });

  describe("deleteSku", () => {
    it("should delete", async () => { productRepository.findById.mockResolvedValue(mockProduct); repository.findSkuById.mockResolvedValue(mockSku); repository.removeSku.mockResolvedValue(true); const r = await service.deleteSku(mockProduct.id, mockSku.id); expect(r).toBe(true); });
    it("should throw 404", async () => { productRepository.findById.mockResolvedValue(mockProduct); repository.findSkuById.mockResolvedValue(null); await expect(service.deleteSku(mockProduct.id, "n")).rejects.toThrow("SKU not found"); });
    it("should throw wrong product", async () => { productRepository.findById.mockResolvedValue(mockProduct); repository.findSkuById.mockResolvedValue({ ...mockSku, product_id: "wrong" }); await expect(service.deleteSku(mockProduct.id, mockSku.id)).rejects.toThrow("does not belong"); });
  });
});