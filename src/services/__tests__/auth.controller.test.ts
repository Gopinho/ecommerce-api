import request from 'supertest';
import app from '../../index';

describe('POST /auth/login', () => {
  it('deve falhar com credenciais inválidas', async () => {
    const res = await request(app)
      .post('/auth/login')
      .send({ email: 'fake@email.com', password: '123456' });
    expect(res.status).toBe(401);
  });
});