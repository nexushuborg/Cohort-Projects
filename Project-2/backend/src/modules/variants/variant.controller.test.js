const request = require('supertest');
const app = require('../../app');
const service = require('./variant.service');

jest.mock('./variant.service');

describe('Variant Controller (Integration)', () => {
  beforeEach(() => { jest.clearAllMocks(); });
  const pid = '22222222-2222-2222-2222-222222222222';
  const tid = '44444444-4444-4444-4444-444444444444';
  const oid = '55555555-5555-5555-5555-555555555555';
  const bad = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
  const mt = { id: tid, product_id: pid, name: 'Color', created_at: new Date().toISOString() };
  const mo = { id: oid, variant_type_id: tid, value: 'Red', created_at: new Date().toISOString() };

  it('POST type creates', async () => { service.createVariantType.mockResolvedValue(mt); const r = await request(app).post('/products/' + pid + '/variants').send({ name: 'Color' }); expect(r.status).toBe(201); });
  it('POST type 400 missing', async () => { const r = await request(app).post('/products/' + pid + '/variants').send({}); expect(r.status).toBe(400); });
  it('POST type 400 bad uuid', async () => { const r = await request(app).post('/products/x/variants').send({ name: 'C' }); expect(r.status).toBe(400); });
  it('POST type 404', async () => { service.createVariantType.mockRejectedValue(Object.assign(new Error('Product not found'), { status: 404, code: 'NOT_FOUND' })); const r = await request(app).post('/products/' + bad + '/variants').send({ name: 'C' }); expect(r.status).toBe(404); });
  it('GET types', async () => { service.getVariantTypesByProductId.mockResolvedValue([mt]); const r = await request(app).get('/products/' + pid + '/variants'); expect(r.status).toBe(200); expect(r.body.data).toHaveLength(1); });
  it('GET types 400 bad uuid', async () => { const r = await request(app).get('/products/not-a-uuid/variants'); expect(r.status).toBe(400); });
  it('GET type with options', async () => { service.getVariantTypeById.mockResolvedValue({ ...mt, options: [mo] }); const r = await request(app).get('/products/' + pid + '/variants/' + tid); expect(r.status).toBe(200); expect(r.body.data.options).toHaveLength(1); });
  it('GET type 400 bad uuid', async () => { const r = await request(app).get('/products/' + pid + '/variants/not-a-uuid'); expect(r.status).toBe(400); });
  it('PUT type', async () => { service.updateVariantType.mockResolvedValue({ ...mt, name: 'Size' }); const r = await request(app).put('/products/' + pid + '/variants/' + tid).send({ name: 'Size' }); expect(r.status).toBe(200); expect(r.body.data.name).toBe('Size'); });
  it('PUT type 400', async () => { const r = await request(app).put('/products/' + pid + '/variants/' + tid).send({}); expect(r.status).toBe(400); });
  it('DELETE type', async () => { service.deleteVariantType.mockResolvedValue(true); const r = await request(app).delete('/products/' + pid + '/variants/' + tid); expect(r.status).toBe(200); });
  it('POST option', async () => { service.createVariantOption.mockResolvedValue(mo); const r = await request(app).post('/products/' + pid + '/variants/' + tid + '/options').send({ value: 'Red' }); expect(r.status).toBe(201); });
  it('POST option 400', async () => { const r = await request(app).post('/products/' + pid + '/variants/' + tid + '/options').send({}); expect(r.status).toBe(400); });
  it('PUT option', async () => { service.updateVariantOption.mockResolvedValue({ ...mo, value: 'Blue' }); const r = await request(app).put('/products/' + pid + '/variants/' + tid + '/options/' + oid).send({ value: 'Blue' }); expect(r.status).toBe(200); });
  it('DELETE option', async () => { service.deleteVariantOption.mockResolvedValue(true); const r = await request(app).delete('/products/' + pid + '/variants/' + tid + '/options/' + oid); expect(r.status).toBe(200); });
});