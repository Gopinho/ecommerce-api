import prisma from './client';

async function seedFashionData() {
    try {
        console.log('🌱 Seeding fashion data...');

        // Create fashion categories
        const categories = await Promise.all([
            prisma.category.upsert({
                where: { name: 'T-Shirts' },
                update: {},
                create: {
                    name: 'T-Shirts',
                    description: 'Casual and comfortable t-shirts',
                    isActive: true,
                    sortOrder: 1
                }
            }),
            prisma.category.upsert({
                where: { name: 'Jeans' },
                update: {},
                create: {
                    name: 'Jeans',
                    description: 'Denim jeans for all occasions',
                    isActive: true,
                    sortOrder: 2
                }
            }),
            prisma.category.upsert({
                where: { name: 'Dresses' },
                update: {},
                create: {
                    name: 'Dresses',
                    description: 'Elegant dresses for women',
                    isActive: true,
                    sortOrder: 3
                }
            }),
            prisma.category.upsert({
                where: { name: 'Sneakers' },
                update: {},
                create: {
                    name: 'Sneakers',
                    description: 'Comfortable sneakers and sports shoes',
                    isActive: true,
                    sortOrder: 4
                }
            })
        ]);

        console.log('✅ Categories created');

        // Create size guides
        const sizeGuides = await Promise.all([
            prisma.sizeGuide.upsert({
                where: {
                    categoryId_name: {
                        categoryId: categories[0].id, // T-Shirts
                        name: 'Unisex T-Shirt Sizes'
                    }
                },
                update: {},
                create: {
                    categoryId: categories[0].id,
                    name: 'Unisex T-Shirt Sizes',
                    unit: 'cm',
                    notes: 'Measurements taken flat across the garment',
                    sizes: {
                        XS: { chest: 86, length: 66 },
                        S: { chest: 91, length: 69 },
                        M: { chest: 96, length: 72 },
                        L: { chest: 101, length: 75 },
                        XL: { chest: 106, length: 78 },
                        XXL: { chest: 111, length: 81 }
                    }
                }
            }),
            prisma.sizeGuide.upsert({
                where: {
                    categoryId_name: {
                        categoryId: categories[2].id, // Dresses
                        name: 'Women\'s Dress Sizes'
                    }
                },
                update: {},
                create: {
                    categoryId: categories[2].id,
                    name: 'Women\'s Dress Sizes',
                    unit: 'cm',
                    notes: 'European sizing guide',
                    sizes: {
                        XS: { bust: 80, waist: 60, hip: 85 },
                        S: { bust: 84, waist: 64, hip: 89 },
                        M: { bust: 88, waist: 68, hip: 93 },
                        L: { bust: 92, waist: 72, hip: 97 },
                        XL: { bust: 96, waist: 76, hip: 101 }
                    }
                }
            })
        ]);

        console.log('✅ Size guides created');

        // Create sample products
        const products = await Promise.all([
            prisma.product.create({
                data: {
                    name: 'Classic Cotton T-Shirt',
                    description: 'Comfortable 100% cotton t-shirt perfect for everyday wear',
                    price: 29.99,
                    stock: 0, // Will be managed by variants
                    categoryId: categories[0].id,
                    material: '100% Cotton',
                    care: 'Machine wash cold, tumble dry low',
                    style: 'Casual',
                    occasion: 'Everyday',
                    season: 'All Season',
                    gender: 'Unisex',
                    tags: ['comfortable', 'basic', 'essential']
                }
            }),
            prisma.product.create({
                data: {
                    name: 'Slim Fit Jeans',
                    description: 'Modern slim-fit jeans with stretch comfort',
                    price: 89.99,
                    stock: 0,
                    categoryId: categories[1].id,
                    material: 'Cotton blend with elastane',
                    care: 'Machine wash cold, hang dry',
                    style: 'Slim Fit',
                    occasion: 'Casual',
                    season: 'All Season',
                    gender: 'Unisex',
                    tags: ['stretch', 'modern', 'versatile']
                }
            }),
            prisma.product.create({
                data: {
                    name: 'Summer Floral Dress',
                    description: 'Light and airy floral dress perfect for summer occasions',
                    price: 149.99,
                    stock: 0,
                    categoryId: categories[2].id,
                    material: '100% Viscose',
                    care: 'Hand wash cold, lay flat to dry',
                    style: 'Floral',
                    occasion: 'Casual, Party',
                    season: 'Summer',
                    gender: 'Women',
                    tags: ['floral', 'summer', 'elegant', 'lightweight']
                }
            })
        ]);

        console.log('✅ Products created');

        // Create variants for T-Shirt
        const tshirtVariants = await Promise.all([
            // White variants
            ...['XS', 'S', 'M', 'L', 'XL'].map(size =>
                prisma.productVariant.create({
                    data: {
                        productId: products[0].id,
                        size,
                        color: 'White',
                        colorHex: '#FFFFFF',
                        stock: Math.floor(Math.random() * 20) + 5,
                        sku: `TSHIRT-WHITE-${size}`
                    }
                })
            ),
            // Black variants
            ...['XS', 'S', 'M', 'L', 'XL'].map(size =>
                prisma.productVariant.create({
                    data: {
                        productId: products[0].id,
                        size,
                        color: 'Black',
                        colorHex: '#000000',
                        stock: Math.floor(Math.random() * 20) + 5,
                        sku: `TSHIRT-BLACK-${size}`
                    }
                })
            ),
            // Navy variants
            ...['S', 'M', 'L', 'XL'].map(size =>
                prisma.productVariant.create({
                    data: {
                        productId: products[0].id,
                        size,
                        color: 'Navy',
                        colorHex: '#1a1a2e',
                        stock: Math.floor(Math.random() * 15) + 3,
                        sku: `TSHIRT-NAVY-${size}`
                    }
                })
            )
        ]);

        // Create variants for Jeans
        const jeansVariants = await Promise.all([
            // Blue variants
            ...['28', '30', '32', '34', '36'].map(size =>
                prisma.productVariant.create({
                    data: {
                        productId: products[1].id,
                        size,
                        color: 'Blue',
                        colorHex: '#4169E1',
                        stock: Math.floor(Math.random() * 15) + 3,
                        sku: `JEANS-BLUE-${size}`
                    }
                })
            ),
            // Black variants
            ...['30', '32', '34', '36'].map(size =>
                prisma.productVariant.create({
                    data: {
                        productId: products[1].id,
                        size,
                        color: 'Black',
                        colorHex: '#000000',
                        stock: Math.floor(Math.random() * 10) + 2,
                        sku: `JEANS-BLACK-${size}`
                    }
                })
            )
        ]);

        // Create variants for Dress
        const dressVariants = await Promise.all([
            // Floral variants
            ...['XS', 'S', 'M', 'L'].map(size =>
                prisma.productVariant.create({
                    data: {
                        productId: products[2].id,
                        size,
                        color: 'Floral Print',
                        colorHex: '#FF69B4',
                        stock: Math.floor(Math.random() * 8) + 2,
                        sku: `DRESS-FLORAL-${size}`
                    }
                })
            )
        ]);

        console.log('✅ Product variants created');

        // Create sample images
        const images = await Promise.all([
            // T-Shirt images
            prisma.productImage.create({
                data: {
                    productId: products[0].id,
                    url: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500',
                    altText: 'Classic Cotton T-Shirt - Front View',
                    sortOrder: 0,
                    isMain: true
                }
            }),
            prisma.productImage.create({
                data: {
                    productId: products[0].id,
                    url: 'https://images.unsplash.com/photo-1583743814966-8936f37f2ac3?w=500',
                    altText: 'Classic Cotton T-Shirt - Side View',
                    sortOrder: 1,
                    isMain: false
                }
            }),
            // Jeans images
            prisma.productImage.create({
                data: {
                    productId: products[1].id,
                    url: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=500',
                    altText: 'Slim Fit Jeans - Front View',
                    sortOrder: 0,
                    isMain: true
                }
            }),
            // Dress images
            prisma.productImage.create({
                data: {
                    productId: products[2].id,
                    url: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=500',
                    altText: 'Summer Floral Dress - Front View',
                    sortOrder: 0,
                    isMain: true
                }
            })
        ]);

        console.log('✅ Product images created');
        console.log('🎉 Fashion data seeding completed successfully!');

    } catch (error) {
        console.error('❌ Error seeding fashion data:', error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

export default seedFashionData;

// Run if called directly
if (require.main === module) {
    seedFashionData()
        .catch((error) => {
            console.error(error);
            process.exit(1);
        });
}