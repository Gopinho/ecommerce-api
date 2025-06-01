import request from 'supertest';
import app from '../../index'; // ajusta o caminho se necessário

describe('Auth Controller', () => {
  it('deve registar um novo utilizador', async () => {
    const res = await request(app)
      .post('/auth/register')
      .send({ email: 'test@example.com', password: '12345678', name: 'Test User' });
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('email', 'test@example.com');
  });

  it('deve recusar login com credenciais inválidas', async () => {
    const res = await request(app)
      .post('/auth/login')
      .send({ email: 'naoexiste@example.com', password: 'errado' });
    expect(res.status).toBe(400);
  });
});