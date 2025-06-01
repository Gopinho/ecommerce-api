import * as authService from '../auth.service';

describe('authService', () => {
  it('deve lançar erro se email for inválido', async () => {
    await expect(authService.requestPasswordReset('invalido')).rejects.toThrow();
  });
});