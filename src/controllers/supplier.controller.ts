import { Request, Response } from 'express';
import { z } from 'zod';
import {
    createSupplier,
    getAllSuppliers,
    getSupplierById,
    updateSupplier,
    deleteSupplier,
    getSupplierStats,
    toggleSupplierStatus
} from '../services/supplier.service';

// Schema de validação para criação de fornecedor
const CreateSupplierSchema = z.object({
    name: z.string().min(1, 'Nome é obrigatório'),
    contactName: z.string().optional(),
    email: z.string().email('Email inválido').optional(),
    phone: z.string().optional(),
    address: z.string().optional(),
    city: z.string().optional(),
    country: z.string().optional(),
    postalCode: z.string().optional(),
    taxNumber: z.string().optional(),
    website: z.string().url('URL inválida').optional(),
    notes: z.string().optional(),
    paymentTerms: z.string().optional(),
    currency: z.string().length(3, 'Moeda deve ter 3 caracteres').default('EUR')
});

// Schema de validação para atualização de fornecedor
const UpdateSupplierSchema = z.object({
    name: z.string().min(1, 'Nome é obrigatório').optional(),
    contactName: z.string().optional(),
    email: z.string().email('Email inválido').optional(),
    phone: z.string().optional(),
    address: z.string().optional(),
    city: z.string().optional(),
    country: z.string().optional(),
    postalCode: z.string().optional(),
    taxNumber: z.string().optional(),
    website: z.string().url('URL inválida').optional(),
    notes: z.string().optional(),
    isActive: z.boolean().optional(),
    paymentTerms: z.string().optional(),
    currency: z.string().length(3, 'Moeda deve ter 3 caracteres').default('EUR')
});

export async function createSupplierController(req: Request, res: Response) {
    try {
        const parsedBody = CreateSupplierSchema.safeParse(req.body);
        if (!parsedBody.success) {
            return res.status(400).json({
                success: false,
                message: 'Dados inválidos',
                errors: parsedBody.error.errors
            });
        }

        const supplier = await createSupplier(parsedBody.data);

        res.status(201).json({
            success: true,
            message: 'Fornecedor criado com sucesso',
            data: supplier
        });
    } catch (error: any) {
        console.error('Erro ao criar fornecedor:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor'
        });
    }
}

export async function getAllSuppliersController(req: Request, res: Response) {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const isActive = req.query.isActive ? req.query.isActive === 'true' : undefined;
        const search = req.query.search as string;

        const result = await getAllSuppliers(page, limit, isActive, search);

        res.json({
            success: true,
            data: result
        });
    } catch (error: any) {
        console.error('Erro ao listar fornecedores:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor'
        });
    }
}

export async function getSupplierByIdController(req: Request, res: Response) {
    try {
        const { id } = req.params;
        const supplier = await getSupplierById(id);

        res.json({
            success: true,
            data: supplier
        });
    } catch (error: any) {
        console.error('Erro ao obter fornecedor:', error);
        if (error.message === 'supplier.not_found') {
            return res.status(404).json({
                success: false,
                message: 'Fornecedor não encontrado'
            });
        }
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor'
        });
    }
}

export async function updateSupplierController(req: Request, res: Response) {
    try {
        const { id } = req.params;
        const parsedBody = UpdateSupplierSchema.safeParse(req.body);

        if (!parsedBody.success) {
            return res.status(400).json({
                success: false,
                message: 'Dados inválidos',
                errors: parsedBody.error.errors
            });
        }

        const supplier = await updateSupplier(id, parsedBody.data);

        res.json({
            success: true,
            message: 'Fornecedor atualizado com sucesso',
            data: supplier
        });
    } catch (error: any) {
        console.error('Erro ao atualizar fornecedor:', error);
        if (error.message === 'supplier.not_found') {
            return res.status(404).json({
                success: false,
                message: 'Fornecedor não encontrado'
            });
        }
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor'
        });
    }
}

export async function deleteSupplierController(req: Request, res: Response) {
    try {
        const { id } = req.params;
        const result = await deleteSupplier(id);

        res.json({
            success: true,
            message: result.message
        });
    } catch (error: any) {
        console.error('Erro ao deletar fornecedor:', error);
        if (error.message === 'supplier.not_found') {
            return res.status(404).json({
                success: false,
                message: 'Fornecedor não encontrado'
            });
        }
        if (error.message === 'supplier.has_active_orders') {
            return res.status(400).json({
                success: false,
                message: 'Não é possível deletar fornecedor com encomendas ativas'
            });
        }
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor'
        });
    }
}

export async function getSupplierStatsController(req: Request, res: Response) {
    try {
        const stats = await getSupplierStats();

        res.json({
            success: true,
            data: stats
        });
    } catch (error: any) {
        console.error('Erro ao obter estatísticas de fornecedores:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor'
        });
    }
}

export async function toggleSupplierStatusController(req: Request, res: Response) {
    try {
        const { id } = req.params;
        const supplier = await toggleSupplierStatus(id);

        res.json({
            success: true,
            message: `Fornecedor ${supplier.isActive ? 'ativado' : 'desativado'} com sucesso`,
            data: supplier
        });
    } catch (error: any) {
        console.error('Erro ao alterar status do fornecedor:', error);
        if (error.message === 'supplier.not_found') {
            return res.status(404).json({
                success: false,
                message: 'Fornecedor não encontrado'
            });
        }
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor'
        });
    }
}