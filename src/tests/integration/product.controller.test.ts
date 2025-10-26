import request from 'supertest';
import app from '../app'; // Usar app de teste mais leve

describe('Product Controller', () => {
    it('GET /products deve retornar 200', async () => {
        const res = await request(app).get('/products');
        expect(res.status).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
    });
});