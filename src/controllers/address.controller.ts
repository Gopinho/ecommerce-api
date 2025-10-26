import { Request, Response, NextFunction } from 'express';
import prisma from '../prisma/client';
import { AuthenticatedRequest } from '../middlewares/authenticate';
import { z } from 'zod';

// Schema de validação para endereços
const addressSchema = z.object({
    addressLine1: z.string().min(1, 'Endereço é obrigatório'),
    addressLine2: z.string().optional(),
    city: z.string().min(1, 'Cidade é obrigatória'),
    district: z.string().min(1, 'Distrito é obrigatório'),
    postalCode: z.string().min(1, 'Código postal é obrigatório'),
    country: z.string().min(1, 'País é obrigatório'),
    label: z.string().optional()
});

export class AddressController {
    // Listar endereços do utilizador
    static async getAddresses(req: AuthenticatedRequest, res: Response, next: NextFunction) {
        try {
            const addresses = await prisma.userAddress.findMany({
                where: { userId: req.user!.id },
                orderBy: [
                    { isDefault: 'desc' },
                    { createdAt: 'desc' }
                ]
            });

            res.json({
                success: true,
                data: addresses
            });
        } catch (error) {
            next(error);
        }
    }

    // Criar novo endereço
    static async createAddress(req: AuthenticatedRequest, res: Response, next: NextFunction) {
        try {
            const validatedData = addressSchema.parse(req.body);
            const { isDefault } = req.body;

            // Se for para definir como padrão, remover padrão dos outros
            if (isDefault) {
                await prisma.userAddress.updateMany({
                    where: { userId: req.user!.id },
                    data: { isDefault: false }
                });
            }

            // Se for o primeiro endereço, definir como padrão automaticamente
            const existingCount = await prisma.userAddress.count({
                where: { userId: req.user!.id }
            });

            const address = await prisma.userAddress.create({
                data: {
                    ...validatedData,
                    userId: req.user!.id,
                    isDefault: isDefault || existingCount === 0
                }
            });

            res.status(201).json({
                success: true,
                message: 'Endereço criado com sucesso',
                data: address
            });
        } catch (error) {
            if (error instanceof z.ZodError) {
                return res.status(400).json({
                    success: false,
                    message: 'Dados inválidos',
                    errors: error.errors
                });
            }
            next(error);
        }
    }

    // Atualizar endereço
    static async updateAddress(req: AuthenticatedRequest, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            const validatedData = addressSchema.parse(req.body);
            const { isDefault } = req.body;

            // Verificar se o endereço pertence ao utilizador
            const existingAddress = await prisma.userAddress.findFirst({
                where: {
                    id,
                    userId: req.user!.id
                }
            });

            if (!existingAddress) {
                return res.status(404).json({
                    success: false,
                    message: 'Endereço não encontrado'
                });
            }

            // Se for para definir como padrão, remover padrão dos outros
            if (isDefault) {
                await prisma.userAddress.updateMany({
                    where: {
                        userId: req.user!.id,
                        id: { not: id }
                    },
                    data: { isDefault: false }
                });
            }

            const address = await prisma.userAddress.update({
                where: { id },
                data: {
                    ...validatedData,
                    isDefault: isDefault ?? existingAddress.isDefault
                }
            });

            res.json({
                success: true,
                message: 'Endereço atualizado com sucesso',
                data: address
            });
        } catch (error) {
            if (error instanceof z.ZodError) {
                return res.status(400).json({
                    success: false,
                    message: 'Dados inválidos',
                    errors: error.errors
                });
            }
            next(error);
        }
    }

    // Definir endereço como padrão
    static async setDefaultAddress(req: AuthenticatedRequest, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;

            // Verificar se o endereço pertence ao utilizador
            const address = await prisma.userAddress.findFirst({
                where: {
                    id,
                    userId: req.user!.id
                }
            });

            if (!address) {
                return res.status(404).json({
                    success: false,
                    message: 'Endereço não encontrado'
                });
            }

            // Remover padrão de todos os outros endereços
            await prisma.userAddress.updateMany({
                where: {
                    userId: req.user!.id,
                    id: { not: id }
                },
                data: { isDefault: false }
            });

            // Definir este como padrão
            const updatedAddress = await prisma.userAddress.update({
                where: { id },
                data: { isDefault: true }
            });

            res.json({
                success: true,
                message: 'Endereço padrão definido com sucesso',
                data: updatedAddress
            });
        } catch (error) {
            next(error);
        }
    }

    // Eliminar endereço
    static async deleteAddress(req: AuthenticatedRequest, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;

            // Verificar se o endereço pertence ao utilizador
            const address = await prisma.userAddress.findFirst({
                where: {
                    id,
                    userId: req.user!.id
                }
            });

            if (!address) {
                return res.status(404).json({
                    success: false,
                    message: 'Endereço não encontrado'
                });
            }

            // Verificar se há encomendas que usam este endereço
            const ordersCount = await prisma.order.count({
                where: { shippingAddressId: id }
            });

            if (ordersCount > 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Não é possível eliminar endereço que foi usado em encomendas'
                });
            }

            await prisma.userAddress.delete({
                where: { id }
            });

            // Se era o endereço padrão, definir outro como padrão
            if (address.isDefault) {
                const firstAddress = await prisma.userAddress.findFirst({
                    where: { userId: req.user!.id },
                    orderBy: { createdAt: 'asc' }
                });

                if (firstAddress) {
                    await prisma.userAddress.update({
                        where: { id: firstAddress.id },
                        data: { isDefault: true }
                    });
                }
            }

            res.json({
                success: true,
                message: 'Endereço eliminado com sucesso'
            });
        } catch (error) {
            next(error);
        }
    }

    // Obter endereço padrão
    static async getDefaultAddress(req: AuthenticatedRequest, res: Response, next: NextFunction) {
        try {
            const defaultAddress = await prisma.userAddress.findFirst({
                where: {
                    userId: req.user!.id,
                    isDefault: true
                }
            });

            if (!defaultAddress) {
                return res.status(404).json({
                    success: false,
                    message: 'Nenhum endereço padrão encontrado'
                });
            }

            res.json({
                success: true,
                data: defaultAddress
            });
        } catch (error) {
            next(error);
        }
    }
}