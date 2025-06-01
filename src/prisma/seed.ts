import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  await prisma.permission.createMany({
    data: [
      { name: 'product:create' },
      { name: 'product:update' },
      { name: 'product:delete' },
      { name: 'order:view' },
      { name: 'user:manage' },
      // ...outras permissões
    ],
    skipDuplicates: true
  });
}

main().finally(() => prisma.$disconnect());