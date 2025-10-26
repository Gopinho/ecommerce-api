import request from 'supertest';
import app from '../app'; // Usar app de teste mais leve

describe('Auth Controller', () => {
    it('deve registar um novo utilizador', async () => {
        const uniqueEmail = `test-${Date.now()}@example.com`;
        const res = await request(app)
            .post('/auth/register')
            .send({ email: uniqueEmail, password: '12345678', name: 'Test User' });
        expect(res.status).toBe(201); // Registro retorna 201, não 200
        expect(res.body).toHaveProperty('email', uniqueEmail);
    });

    it('deve recusar login com credenciais inválidas', async () => {
        const res = await request(app)
            .post('/auth/login')
            .send({ email: 'naoexiste@example.com', password: 'errado' });
        expect(res.status).toBe(401); // Credenciais inválidas retornam 401, não 400
    });
});