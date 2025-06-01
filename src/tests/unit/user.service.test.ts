import * as userService from '../../services/user.service';
import 'dotenv/config';

describe('User Service', () => {
  it('deve lançar erro se utilizador não existir', async () => {
    await expect(userService.getUserById('id-invalido'))
      .rejects
      .toThrow('user.not_found');
  });
});