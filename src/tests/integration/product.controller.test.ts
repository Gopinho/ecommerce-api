import request from 'supertest';
import app from '../../index';

describe('Product Controller', () => {
  it('GET /api/products deve retornar 200', async () => {
    const res = await request(app).get('/api/products');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
});