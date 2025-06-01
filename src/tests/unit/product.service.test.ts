import * as productService from '../../services/product.service';

describe('Product Service', () => {
  it('deve lançar erro se produto não existir', async () => {
    await expect(productService.getProductById('id-invalido'))
      .rejects
      .toThrow('product.not_found');
  });
});