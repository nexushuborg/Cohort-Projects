const request = require("supertest");
const jwt = require("jsonwebtoken");
const app = require("../../app");
const service = require("./sku.service");

jest.mock("./sku.service");

const TEST_SECRET = "dev-secret-key-change-in-prod-12345";
const sellerToken = jwt.sign(
  { sub: "22222222-2222-2222-2222-222222222222", email: "seller@test.com", role: "seller", name: "Test Seller" },
  TEST_SECRET,
  { expiresIn: "1h" }
);

describe("SKU Controller", () => {
  beforeEach(() => { jest.clearAllMocks(); });
  const pid = "22222222-2222-2222-2222-222222222222";
  const sid = "66666666-6666-6666-6666-666666666666";
  const bad = "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa";
  const mockSku = { id: sid, product_id: pid, sku_code: "TSHIRT-RED", price_override: 299.00, stock_quantity: 10, status: "active", created_at: new Date().toISOString() };

  it("POST creates", async () => { service.createSku.mockResolvedValue(mockSku); const r = await request(app).post("/products/" + pid + "/skus").set("Authorization", "Bearer " + sellerToken).send({ skuCode: "TSHIRT-RED", priceOverride: 299.00, variantOptionIds: ["55555555-5555-5555-5555-555555555555"] }); expect(r.status).toBe(201); });
  it("POST 401 without auth", async () => { const r = await request(app).post("/products/" + pid + "/skus").send({ skuCode: "TSHIRT-RED", variantOptionIds: ["55555555-5555-5555-5555-555555555555"] }); expect(r.status).toBe(401); });
  it("POST 400 missing skuCode", async () => { const r = await request(app).post("/products/" + pid + "/skus").set("Authorization", "Bearer " + sellerToken).send({ variantOptionIds: ["55555555-5555-5555-5555-555555555555"] }); expect(r.status).toBe(400); });
  it("POST 400 missing variantOptionIds", async () => { const r = await request(app).post("/products/" + pid + "/skus").set("Authorization", "Bearer " + sellerToken).send({ skuCode: "X" }); expect(r.status).toBe(400); });
  it("POST 400 bad UUID", async () => { const r = await request(app).post("/products/x/skus").set("Authorization", "Bearer " + sellerToken).send({ skuCode: "X", variantOptionIds: [] }); expect(r.status).toBe(400); });
  it("POST 404 product", async () => { service.createSku.mockRejectedValue(Object.assign(new Error("Product not found"), { status: 404, code: "NOT_FOUND" })); const r = await request(app).post("/products/" + bad + "/skus").set("Authorization", "Bearer " + sellerToken).send({ skuCode: "X", variantOptionIds: ["55555555-5555-5555-5555-555555555555"] }); expect(r.status).toBe(404); });
  it("GET list", async () => { service.getSkusByProductId.mockResolvedValue([mockSku]); const r = await request(app).get("/products/" + pid + "/skus"); expect(r.status).toBe(200); expect(r.body.data).toHaveLength(1); });
  it("GET list 400", async () => { const r = await request(app).get("/products/x/skus"); expect(r.status).toBe(400); });
  it("GET by id", async () => { service.getSkuById.mockResolvedValue({ ...mockSku, variants: [] }); const r = await request(app).get("/products/" + pid + "/skus/" + sid); expect(r.status).toBe(200); });
  it("GET by id 400", async () => { const r = await request(app).get("/products/" + pid + "/skus/x"); expect(r.status).toBe(400); });
  it("PUT update", async () => { service.updateSku.mockResolvedValue({ ...mockSku, sku_code: "NEW" }); const r = await request(app).put("/products/" + pid + "/skus/" + sid).set("Authorization", "Bearer " + sellerToken).send({ skuCode: "NEW" }); expect(r.status).toBe(200); });
  it("PUT 401 without auth", async () => { const r = await request(app).put("/products/" + pid + "/skus/" + sid).send({ skuCode: "NEW" }); expect(r.status).toBe(401); });
  it("PUT 400 empty", async () => { const r = await request(app).put("/products/" + pid + "/skus/" + sid).set("Authorization", "Bearer " + sellerToken).send({}); expect(r.status).toBe(400); });
  it("DELETE", async () => { service.deleteSku.mockResolvedValue(true); const r = await request(app).delete("/products/" + pid + "/skus/" + sid).set("Authorization", "Bearer " + sellerToken); expect(r.status).toBe(200); });
  it("DELETE 401 without auth", async () => { const r = await request(app).delete("/products/" + pid + "/skus/" + sid); expect(r.status).toBe(401); });
});
