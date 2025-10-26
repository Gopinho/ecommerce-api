import { Router } from 'express';
import { authenticate } from '../middlewares/authenticate';
import { AddressController } from '../controllers/address.controller';

const router = Router();

// Todas as rotas requerem autenticação
router.use(authenticate);

// Listar endereços do utilizador
router.get('/', AddressController.getAddresses);

// Obter endereço padrão
router.get('/default', AddressController.getDefaultAddress);

// Criar novo endereço
router.post('/', AddressController.createAddress);

// Atualizar endereço
router.put('/:id', AddressController.updateAddress);

// Definir endereço como padrão
router.put('/:id/default', AddressController.setDefaultAddress);

// Eliminar endereço
router.delete('/:id', AddressController.deleteAddress);

export default router;