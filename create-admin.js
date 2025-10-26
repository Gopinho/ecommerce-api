const { PrismaClient } = require('./src/generated/prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function createAdmin() {
    try {
        const hashedPassword = await bcrypt.hash('admin123', 10);
        const admin = await prisma.user.create({
            data: {
                email: 'admin@test.com',
                password: hashedPassword,
                firstName: 'Admin',
                lastName: 'User',
                role: 'ADMIN',
                isActive: true
            }
        });
        console.log('Admin criado:', admin.email);
    } catch (error) {
        if (error.code === 'P2002') {
            console.log('Admin já existe, fazendo login...');
        } else {
            console.error('Erro:', error.message);
        }
    } finally {
        await prisma.$disconnect();
    }
}

createAdmin();