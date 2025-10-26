/*
  Warnings:

  - You are about to drop the column `name` on the `user` table. All the data in the column will be lost.
  - You are about to drop the `license` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[nif]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `shippingAddressId` to the `Order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `firstName` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `lastName` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `license` DROP FOREIGN KEY `License_orderId_fkey`;

-- DropForeignKey
ALTER TABLE `license` DROP FOREIGN KEY `License_productId_fkey`;

-- DropForeignKey
ALTER TABLE `license` DROP FOREIGN KEY `License_userId_fkey`;

-- DropTable
DROP TABLE `license`;

-- CreateTable
CREATE TABLE `UserAddress` (
    `id` VARCHAR(25) NOT NULL,
    `userId` VARCHAR(25) NOT NULL,
    `addressLine1` VARCHAR(255) NOT NULL,
    `addressLine2` VARCHAR(255) NULL,
    `city` VARCHAR(100) NOT NULL,
    `district` VARCHAR(100) NOT NULL,
    `postalCode` VARCHAR(20) NOT NULL,
    `country` VARCHAR(100) NOT NULL,
    `isDefault` BOOLEAN NOT NULL DEFAULT false,
    `label` VARCHAR(50) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Criar endereço padrão para utilizadores existentes (temporário)
INSERT INTO `UserAddress` (`id`, `userId`, `addressLine1`, `city`, `district`, `postalCode`, `country`, `isDefault`)
SELECT 
    CONCAT('addr_', `id`) as id,
    `id` as userId,
    'Morada a definir' as addressLine1,
    'Lisboa' as city,
    'Lisboa' as district,
    '1000-000' as postalCode,
    'Portugal' as country,
    true as isDefault
FROM `User`;

-- Adicionar campos ao User, convertendo name existente
ALTER TABLE `user` 
    ADD COLUMN `firstName` VARCHAR(191) NOT NULL DEFAULT '',
    ADD COLUMN `lastName` VARCHAR(191) NOT NULL DEFAULT '',
    ADD COLUMN `nif` VARCHAR(20) NULL,
    ADD COLUMN `phone` VARCHAR(20) NULL,
    ADD COLUMN `position` VARCHAR(191) NOT NULL DEFAULT 'Cliente';

-- Migrar dados existentes do campo name
UPDATE `user` SET 
    `firstName` = CASE 
        WHEN LOCATE(' ', `name`) > 0 THEN SUBSTRING(`name`, 1, LOCATE(' ', `name`) - 1)
        ELSE `name`
    END,
    `lastName` = CASE 
        WHEN LOCATE(' ', `name`) > 0 THEN SUBSTRING(`name`, LOCATE(' ', `name`) + 1)
        ELSE 'Cliente'
    END;

-- Remover campo name antigo
ALTER TABLE `user` DROP COLUMN `name`;

-- Adicionar campo shippingAddressId temporariamente como nullable
ALTER TABLE `order` ADD COLUMN `shippingAddressId` VARCHAR(25) NULL;

-- Atualizar encomendas existentes com endereço padrão do utilizador
UPDATE `order` o
SET `shippingAddressId` = (
    SELECT `id` FROM `UserAddress` ua 
    WHERE ua.`userId` = o.`userId` AND ua.`isDefault` = true 
    LIMIT 1
);

-- Agora tornar o campo obrigatório
ALTER TABLE `order` MODIFY COLUMN `shippingAddressId` VARCHAR(25) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `User_nif_key` ON `User`(`nif`);

-- AddForeignKey
ALTER TABLE `Order` ADD CONSTRAINT `Order_shippingAddressId_fkey` FOREIGN KEY (`shippingAddressId`) REFERENCES `UserAddress`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `UserAddress` ADD CONSTRAINT `UserAddress_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
