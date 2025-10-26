import { Request, Response } from 'express';
import * as collectionService from '../services/collection.service';

export async function createCollection(req: Request, res: Response) {
    try {
        const { name, description, season, year, launchDate, coverImage, slug } = req.body;

        if (!name) {
            return res.status(400).json({ error: 'Nome da coleção é obrigatório' });
        }

        const collection = await collectionService.createCollection({
            name,
            description,
            season,
            year,
            launchDate: launchDate ? new Date(launchDate) : undefined,
            coverImage,
            slug
        });

        res.status(201).json(collection);
    } catch (error: any) {
        if (error.message === 'collection.already_exists') {
            return res.status(409).json({ error: 'Já existe uma coleção com este nome' });
        }
        if (error.message === 'collection.slug_exists') {
            return res.status(409).json({ error: 'Já existe uma coleção com este slug' });
        }
        res.status(500).json({ error: error.message });
    }
}

export async function getAllCollections(req: Request, res: Response) {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const isActive = req.query.isActive === 'true' ? true :
            req.query.isActive === 'false' ? false : undefined;
        const isFeatured = req.query.isFeatured === 'true' ? true :
            req.query.isFeatured === 'false' ? false : undefined;
        const season = req.query.season as string;

        const result = await collectionService.getAllCollections(page, limit, isActive, season, isFeatured);
        res.json(result);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
}

export async function getCollectionById(req: Request, res: Response) {
    try {
        const { id } = req.params;
        const collection = await collectionService.getCollectionById(id);
        res.json(collection);
    } catch (error: any) {
        if (error.message === 'collection.not_found') {
            return res.status(404).json({ error: 'Coleção não encontrada' });
        }
        res.status(500).json({ error: error.message });
    }
}

export async function getCollectionBySlug(req: Request, res: Response) {
    try {
        const { slug } = req.params;
        const collection = await collectionService.getCollectionBySlug(slug);
        res.json(collection);
    } catch (error: any) {
        if (error.message === 'collection.not_found') {
            return res.status(404).json({ error: 'Coleção não encontrada' });
        }
        res.status(500).json({ error: error.message });
    }
}

export async function updateCollection(req: Request, res: Response) {
    try {
        const { id } = req.params;
        const updateData = { ...req.body };

        if (updateData.launchDate) {
            updateData.launchDate = new Date(updateData.launchDate);
        }

        const collection = await collectionService.updateCollection(id, updateData);
        res.json(collection);
    } catch (error: any) {
        if (error.message === 'collection.not_found') {
            return res.status(404).json({ error: 'Coleção não encontrada' });
        }
        if (error.message === 'collection.name_exists' || error.message === 'collection.slug_exists') {
            return res.status(409).json({ error: 'Nome ou slug já existe' });
        }
        res.status(500).json({ error: error.message });
    }
}

export async function deleteCollection(req: Request, res: Response) {
    try {
        const { id } = req.params;
        const result = await collectionService.deleteCollection(id);
        res.json(result);
    } catch (error: any) {
        if (error.message === 'collection.not_found') {
            return res.status(404).json({ error: 'Coleção não encontrada' });
        }
        res.status(500).json({ error: error.message });
    }
}

export async function addProductToCollection(req: Request, res: Response) {
    try {
        const { collectionId } = req.params;
        const { productId } = req.body;

        if (!productId) {
            return res.status(400).json({ error: 'ID do produto é obrigatório' });
        }

        const result = await collectionService.addProductToCollection(collectionId, productId);
        res.status(201).json(result);
    } catch (error: any) {
        if (error.message === 'collection.not_found') {
            return res.status(404).json({ error: 'Coleção não encontrada' });
        }
        if (error.message === 'product.not_found') {
            return res.status(404).json({ error: 'Produto não encontrado' });
        }
        if (error.message === 'product.already_in_collection') {
            return res.status(409).json({ error: 'Produto já está nesta coleção' });
        }
        res.status(500).json({ error: error.message });
    }
}

export async function removeProductFromCollection(req: Request, res: Response) {
    try {
        const { collectionId, productId } = req.params;
        const result = await collectionService.removeProductFromCollection(collectionId, productId);
        res.json(result);
    } catch (error: any) {
        if (error.message === 'product.not_in_collection') {
            return res.status(404).json({ error: 'Produto não está nesta coleção' });
        }
        res.status(500).json({ error: error.message });
    }
}

export async function getCollectionProducts(req: Request, res: Response) {
    try {
        const { id } = req.params;
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;

        const result = await collectionService.getCollectionProducts(id, page, limit);
        res.json(result);
    } catch (error: any) {
        if (error.message === 'collection.not_found') {
            return res.status(404).json({ error: 'Coleção não encontrada' });
        }
        res.status(500).json({ error: error.message });
    }
}

export async function toggleCollectionFeatured(req: Request, res: Response) {
    try {
        const { id } = req.params;
        const collection = await collectionService.toggleCollectionFeatured(id);
        res.json(collection);
    } catch (error: any) {
        if (error.message === 'collection.not_found') {
            return res.status(404).json({ error: 'Coleção não encontrada' });
        }
        res.status(500).json({ error: error.message });
    }
}

export async function getCollectionStats(req: Request, res: Response) {
    try {
        const stats = await collectionService.getCollectionStats();
        res.json(stats);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
}

export async function getFeaturedCollections(req: Request, res: Response) {
    try {
        const collections = await collectionService.getFeaturedCollections();
        res.json(collections);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
}