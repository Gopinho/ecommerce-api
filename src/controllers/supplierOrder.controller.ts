import { Request, Response } from 'express';
import { z } from 'zod';
import {
    createSupplierOrder,
    getAllSupplierOrders,
    getSupplierOrderById,
    updateSupplierOrder,
    updateSupplierOrderItem,
    deleteSupplierOrder,
    getSupplierOrderStats,
    markOrderAsSent,
    markOrderAsReceived
} from '../services/supplierOrder.service';

// Schema de validação para item da encomenda
const SupplierOrderItemSchema = z.object({
    productId: z.string().optional(),
    productName: z.string().min(1, 'Nome do produto é obrigatório'),
    description: z.string().optional(),
    quantity: z.number().int().positive('Quantidade deve ser positiva'),
    unitPrice: z.number().positive('Preço unitário deve ser positivo'),
    sku: z.string().optional()
});

// Schema de validação para criação de encomenda
const CreateSupplierOrderSchema = z.object({
    supplierId: z.string().min(1, 'ID do fornecedor é obrigatório'),
    orderNumber: z.string().optional(),
    expectedDate: z.string().datetime().optional(),
    notes: z.string().optional(),
    currency: z.string().length(3, 'Moeda deve ter 3 caracteres').optional(),
    items: z.array(SupplierOrderItemSchema).min(1, 'Pelo menos um item é obrigatório')
});

// Schema de validação para atualização de encomenda
const UpdateSupplierOrderSchema = z.object({
    status: z.enum(['PENDENTE', 'ENVIADA', 'RECEBIDA', 'CANCELADA']).optional(),
    expectedDate: z.string().datetime().optional(),
    receivedDate: z.string().datetime().optional(),
    notes: z.string().optional(),
    invoiceNumber: z.string().optional()
});

// Schema de validação para atualização de item
const UpdateSupplierOrderItemSchema = z.object({
    receivedQuantity: z.number().int().min(0, 'Quantidade recebida deve ser não negativa').optional()
});

export async function createSupplierOrderController(req: Request, res: Response) {
    try {
        const userId = (req as any).user?.id;
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: 'Não autenticado'
            });
        }

        const parsedBody = CreateSupplierOrderSchema.safeParse(req.body);
        if (!parsedBody.success) {
            return res.status(400).json({
                success: false,
                message: 'Dados inválidos',
                errors: parsedBody.error.errors
            });
        }

        const data = parsedBody.data;

        // Converter expectedDate string para Date se fornecido
        const orderData: any = { ...data };
        if (data.expectedDate) {
            orderData.expectedDate = new Date(data.expectedDate);
        }

        const order = await createSupplierOrder(orderData, userId);

        res.status(201).json({
            success: true,
            message: 'Encomenda criada com sucesso',
            data: order
        });
    } catch (error: any) {
        console.error('Erro ao criar encomenda:', error);
        if (error.message === 'supplier.not_found') {
            return res.status(404).json({
                success: false,
                message: 'Fornecedor não encontrado'
            });
        }
        if (error.message === 'supplier_order.number_exists') {
            return res.status(409).json({
                success: false,
                message: 'Número da encomenda já existe'
            });
        }
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor'
        });
    }
}

export async function getAllSupplierOrdersController(req: Request, res: Response) {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const status = req.query.status as any;
        const supplierId = req.query.supplierId as string;
        const search = req.query.search as string;

        const result = await getAllSupplierOrders(page, limit, status, supplierId, search);

        res.json({
            success: true,
            data: result
        });
    } catch (error: any) {
        console.error('Erro ao listar encomendas:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor'
        });
    }
}

export async function getSupplierOrderByIdController(req: Request, res: Response) {
    try {
        const { id } = req.params;
        const order = await getSupplierOrderById(id);

        res.json({
            success: true,
            data: order
        });
    } catch (error: any) {
        console.error('Erro ao obter encomenda:', error);
        if (error.message === 'supplier_order.not_found') {
            return res.status(404).json({
                success: false,
                message: 'Encomenda não encontrada'
            });
        }
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor'
        });
    }
}

export async function updateSupplierOrderController(req: Request, res: Response) {
    try {
        const { id } = req.params;
        const parsedBody = UpdateSupplierOrderSchema.safeParse(req.body);

        if (!parsedBody.success) {
            return res.status(400).json({
                success: false,
                message: 'Dados inválidos',
                errors: parsedBody.error.errors
            });
        }

        const data = parsedBody.data;

        // Converter datas string para Date se fornecidas
        const updateData: any = { ...data };
        if (data.expectedDate) {
            updateData.expectedDate = new Date(data.expectedDate);
        }
        if (data.receivedDate) {
            updateData.receivedDate = new Date(data.receivedDate);
        }

        const order = await updateSupplierOrder(id, updateData); res.json({
            success: true,
            message: 'Encomenda atualizada com sucesso',
            data: order
        });
    } catch (error: any) {
        console.error('Erro ao atualizar encomenda:', error);
        if (error.message === 'supplier_order.not_found') {
            return res.status(404).json({
                success: false,
                message: 'Encomenda não encontrada'
            });
        }
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor'
        });
    }
}

export async function updateSupplierOrderItemController(req: Request, res: Response) {
    try {
        const { id, itemId } = req.params;
        const parsedBody = UpdateSupplierOrderItemSchema.safeParse(req.body);

        if (!parsedBody.success) {
            return res.status(400).json({
                success: false,
                message: 'Dados inválidos',
                errors: parsedBody.error.errors
            });
        }

        const item = await updateSupplierOrderItem(id, itemId, parsedBody.data);

        res.json({
            success: true,
            message: 'Item atualizado com sucesso',
            data: item
        });
    } catch (error: any) {
        console.error('Erro ao atualizar item:', error);
        if (error.message === 'supplier_order.not_found') {
            return res.status(404).json({
                success: false,
                message: 'Encomenda não encontrada'
            });
        }
        if (error.message === 'supplier_order_item.not_found') {
            return res.status(404).json({
                success: false,
                message: 'Item não encontrado'
            });
        }
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor'
        });
    }
}

export async function deleteSupplierOrderController(req: Request, res: Response) {
    try {
        const { id } = req.params;
        const result = await deleteSupplierOrder(id);

        res.json({
            success: true,
            message: result.message
        });
    } catch (error: any) {
        console.error('Erro ao deletar encomenda:', error);
        if (error.message === 'supplier_order.not_found') {
            return res.status(404).json({
                success: false,
                message: 'Encomenda não encontrada'
            });
        }
        if (error.message === 'supplier_order.cannot_delete') {
            return res.status(400).json({
                success: false,
                message: 'Não é possível deletar encomenda que não está pendente'
            });
        }
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor'
        });
    }
}

export async function getSupplierOrderStatsController(req: Request, res: Response) {
    try {
        const stats = await getSupplierOrderStats();

        res.json({
            success: true,
            data: stats
        });
    } catch (error: any) {
        console.error('Erro ao obter estatísticas de encomendas:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor'
        });
    }
}

export async function markOrderAsSentController(req: Request, res: Response) {
    try {
        const { id } = req.params;
        const order = await markOrderAsSent(id);

        res.json({
            success: true,
            message: 'Encomenda marcada como enviada',
            data: order
        });
    } catch (error: any) {
        console.error('Erro ao marcar encomenda como enviada:', error);
        if (error.message === 'supplier_order.not_found') {
            return res.status(404).json({
                success: false,
                message: 'Encomenda não encontrada'
            });
        }
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor'
        });
    }
}

export async function markOrderAsReceivedController(req: Request, res: Response) {
    try {
        const { id } = req.params;
        const order = await markOrderAsReceived(id);

        res.json({
            success: true,
            message: 'Encomenda marcada como recebida',
            data: order
        });
    } catch (error: any) {
        console.error('Erro ao marcar encomenda como recebida:', error);
        if (error.message === 'supplier_order.not_found') {
            return res.status(404).json({
                success: false,
                message: 'Encomenda não encontrada'
            });
        }
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor'
        });
    }
}