import { Request, Response } from 'express';
import { z } from 'zod';
import * as stockService from '../services/stock.service';

// Schemas de validação
const updateStockSchema = z.object({
    realStock: z.number().int().min(0).optional(),
    fictionalStock: z.number().int().min(0).optional()
}).refine(data => data.realStock !== undefined || data.fictionalStock !== undefined, {
    message: "Pelo menos um campo (realStock ou fictionalStock) deve ser fornecido"
});

const productIdSchema = z.object({
    id: z.string().cuid()
});

const lowStockQuerySchema = z.object({
    threshold: z.string().optional().transform(val => val ? parseInt(val) : 10)
});

/**
 * Atualizar stock de um produto
 */
export async function updateStock(req: Request, res: Response) {
    try {
        const { id } = productIdSchema.parse(req.params);
        const stockData = updateStockSchema.parse(req.body);

        const updatedProduct = await stockService.updateProductStock(id, stockData);

        res.status(200).json({
            success: true,
            message: 'Stock atualizado com sucesso',
            data: {
                id: updatedProduct.id,
                name: updatedProduct.name,
                realStock: updatedProduct.stock,
                fictionalStock: (updatedProduct as any).fictionalStock || 0
            }
        });

    } catch (error: any) {
        if (error.message === 'product.not_found') {
            return res.status(404).json({
                success: false,
                message: 'Produto não encontrado'
            });
        }

        if (error instanceof z.ZodError) {
            return res.status(400).json({
                success: false,
                message: 'Dados inválidos',
                errors: error.errors
            });
        }

        console.error('Erro ao atualizar stock:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor'
        });
    }
}

/**
 * Obter informações de stock de um produto
 */
export async function getStock(req: Request, res: Response) {
    try {
        const { id } = productIdSchema.parse(req.params);

        const product = await stockService.getProductStock(id);

        res.status(200).json({
            success: true,
            data: {
                id: product.id,
                name: product.name,
                realStock: product.stock,
                fictionalStock: (product as any).fictionalStock || 0,
                stockDifference: ((product as any).fictionalStock || 0) - product.stock,
                sold: product.sold
            }
        });

    } catch (error: any) {
        if (error.message === 'product.not_found') {
            return res.status(404).json({
                success: false,
                message: 'Produto não encontrado'
            });
        }

        if (error instanceof z.ZodError) {
            return res.status(400).json({
                success: false,
                message: 'ID do produto inválido'
            });
        }

        console.error('Erro ao obter stock:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor'
        });
    }
}

/**
 * Obter produtos com stock baixo
 */
export async function getLowStock(req: Request, res: Response) {
    try {
        const { threshold } = lowStockQuerySchema.parse(req.query);

        const products = await stockService.getProductsWithLowStock(threshold);

        const productsWithStock = products.map(product => ({
            id: product.id,
            name: product.name,
            realStock: product.stock,
            fictionalStock: (product as any).fictionalStock || 0,
            category: product.category.name
        }));

        res.status(200).json({
            success: true,
            message: `Produtos com stock baixo (≤ ${threshold})`,
            data: {
                threshold,
                count: productsWithStock.length,
                products: productsWithStock
            }
        });

    } catch (error: any) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({
                success: false,
                message: 'Parâmetros inválidos',
                errors: error.errors
            });
        }

        console.error('Erro ao obter produtos com stock baixo:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor'
        });
    }
}

/**
 * Obter estatísticas gerais de stock
 */
export async function getStockStatistics(req: Request, res: Response) {
    try {
        // Implementação básica das estatísticas
        const totalProducts = await stockService.getProductStock.length || 0;

        res.status(200).json({
            success: true,
            data: {
                message: 'Estatísticas de stock',
                note: 'Funcionalidade em desenvolvimento'
            }
        });

    } catch (error: any) {
        console.error('Erro ao obter estatísticas de stock:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor'
        });
    }
}