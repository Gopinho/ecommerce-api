import prisma from '../prisma/client';

export interface CreateCollectionData {
    name: string;
    description?: string;
    season?: string;
    year?: number;
    launchDate?: Date;
    coverImage?: string;
    slug?: string;
}

export interface UpdateCollectionData {
    name?: string;
    description?: string;
    season?: string;
    year?: number;
    launchDate?: Date;
    isActive?: boolean;
    isFeatured?: boolean;
    coverImage?: string;
    slug?: string;
    sortOrder?: number;
}

export async function createCollection(data: CreateCollectionData) {
    // Verificar se já existe uma coleção com este nome
    const existingName = await prisma.collection.findUnique({
        where: { name: data.name }
    });

    if (existingName) {
        throw new Error('collection.already_exists');
    }

    // Verificar slug se fornecido
    if (data.slug) {
        const existingSlug = await prisma.collection.findUnique({
            where: { slug: data.slug }
        });

        if (existingSlug) {
            throw new Error('collection.slug_exists');
        }
    }

    const collection = await prisma.collection.create({
        data
    });

    return collection;
}

export async function getAllCollections(page = 1, limit = 10, isActive?: boolean, season?: string, isFeatured?: boolean) {
    const skip = (page - 1) * limit;

    const where: any = {};
    if (isActive !== undefined) where.isActive = isActive;
    if (season) where.season = season;
    if (isFeatured !== undefined) where.isFeatured = isFeatured;

    const [collections, total] = await Promise.all([
        prisma.collection.findMany({
            where,
            skip,
            take: limit,
            include: {
                productCollections: {
                    include: {
                        product: {
                            select: {
                                id: true,
                                name: true,
                                price: true
                            }
                        }
                    }
                }
            },
            orderBy: [
                { createdAt: 'desc' }
            ]
        }),
        prisma.collection.count({ where })
    ]);

    return {
        collections,
        pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit)
        }
    };
}

export async function getCollectionById(id: string) {
    const collection = await prisma.collection.findUnique({
        where: { id },
        include: {
            productCollections: {
                include: {
                    product: {
                        include: {
                            category: true,
                            variants: true,
                            images: true
                        }
                    }
                }
            }
        }
    });

    if (!collection) {
        throw new Error('collection.not_found');
    }

    return collection;
}

export async function updateCollection(id: string, data: UpdateCollectionData) {
    // Verificar se a coleção existe
    await getCollectionById(id);

    const collection = await prisma.collection.update({
        where: { id },
        data
    });

    return collection;
}

export async function deleteCollection(id: string) {
    // Verificar se a coleção existe
    await getCollectionById(id);

    // Deletar associações primeiro
    await prisma.productCollection.deleteMany({
        where: { collectionId: id }
    });

    // Deletar a coleção
    await prisma.collection.delete({
        where: { id }
    });

    return { message: 'Coleção deletada com sucesso' };
}

export async function addProductToCollection(collectionId: string, productId: string) {
    // Verificar se a coleção existe
    await getCollectionById(collectionId);

    // Verificar se o produto existe
    const product = await prisma.product.findUnique({
        where: { id: productId }
    });

    if (!product) {
        throw new Error('product.not_found');
    }

    // Verificar se a associação já existe
    const existing = await prisma.productCollection.findFirst({
        where: {
            collectionId,
            productId
        }
    });

    if (existing) {
        throw new Error('product.already_in_collection');
    }

    const productCollection = await prisma.productCollection.create({
        data: {
            collectionId,
            productId
        },
        include: {
            product: {
                select: {
                    id: true,
                    name: true,
                    price: true
                }
            },
            collection: {
                select: {
                    id: true,
                    name: true
                }
            }
        }
    });

    return productCollection;
}

export async function removeProductFromCollection(collectionId: string, productId: string) {
    const productCollection = await prisma.productCollection.findFirst({
        where: {
            collectionId,
            productId
        }
    });

    if (!productCollection) {
        throw new Error('product.not_in_collection');
    }

    await prisma.productCollection.delete({
        where: { id: productCollection.id }
    });

    return { message: 'Produto removido da coleção' };
}

export async function getCollectionProducts(collectionId: string, page = 1, limit = 10) {
    const skip = (page - 1) * limit;

    // Verificar se a coleção existe
    await getCollectionById(collectionId);

    const [products, total] = await Promise.all([
        prisma.product.findMany({
            where: {
                productCollections: {
                    some: {
                        collectionId
                    }
                }
            },
            skip,
            take: limit,
            include: {
                category: true,
                variants: true,
                images: {
                    where: { isMain: true },
                    take: 1
                }
            }
        }),
        prisma.product.count({
            where: {
                productCollections: {
                    some: {
                        collectionId
                    }
                }
            }
        })
    ]);

    return {
        products,
        pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit)
        }
    };
}

export async function getCollectionStats() {
    const [
        totalCollections,
        activeCollections,
        inactiveCollections,
        currentYear
    ] = await Promise.all([
        prisma.collection.count(),
        prisma.collection.count({ where: { isActive: true } }),
        prisma.collection.count({ where: { isActive: false } }),
        prisma.collection.count({ where: { year: new Date().getFullYear() } })
    ]);

    return {
        totalCollections,
        activeCollections,
        inactiveCollections,
        currentYearCollections: currentYear
    };
}

export async function getCollectionBySlug(slug: string) {
    const collection = await prisma.collection.findUnique({
        where: { slug },
        include: {
            productCollections: {
                include: {
                    product: {
                        include: {
                            category: true,
                            variants: true,
                            images: true
                        }
                    }
                }
            }
        }
    });

    if (!collection) {
        throw new Error('collection.not_found');
    }

    return collection;
}

export async function toggleCollectionFeatured(id: string) {
    const collection = await getCollectionById(id);

    const updatedCollection = await prisma.collection.update({
        where: { id },
        data: {
            isFeatured: !collection.isFeatured
        }
    });

    return updatedCollection;
}

export async function getFeaturedCollections() {
    const collections = await prisma.collection.findMany({
        where: {
            isActive: true,
            isFeatured: true
        },
        include: {
            productCollections: {
                include: {
                    product: {
                        include: {
                            images: {
                                where: { isMain: true },
                                take: 1
                            }
                        }
                    }
                },
                take: 3 // Mostrar apenas 3 produtos por coleção em destaque
            }
        },
        orderBy: [
            { sortOrder: 'asc' },
            { createdAt: 'desc' }
        ]
    });

    return collections;
}