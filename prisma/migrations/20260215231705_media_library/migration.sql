/*
  Warnings:

  - You are about to drop the column `url` on the `Media` table. All the data in the column will be lost.
  - Added the required column `checksum` to the `Media` table without a default value. This is not possible if the table is not empty.
  - Added the required column `storagePath` to the `Media` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Media` DROP COLUMN `url`,
    ADD COLUMN `alt` TEXT NULL,
    ADD COLUMN `checksum` VARCHAR(191) NOT NULL,
    ADD COLUMN `height` INTEGER NULL,
    ADD COLUMN `storagePath` VARCHAR(191) NOT NULL,
    ADD COLUMN `width` INTEGER NULL;

-- AlterTable
ALTER TABLE `Page` ADD COLUMN `coverImageId` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `Post` ADD COLUMN `coverImageId` VARCHAR(191) NULL;

-- CreateTable
CREATE TABLE `MediaVariant` (
    `id` VARCHAR(191) NOT NULL,
    `mediaId` VARCHAR(191) NOT NULL,
    `type` ENUM('THUMBNAIL', 'MEDIUM', 'LARGE', 'WEBP', 'AVIF') NOT NULL,
    `storagePath` VARCHAR(191) NOT NULL,
    `mimeType` VARCHAR(191) NULL,
    `width` INTEGER NULL,
    `height` INTEGER NULL,
    `size` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `MediaVariant_mediaId_idx`(`mediaId`),
    UNIQUE INDEX `MediaVariant_mediaId_type_key`(`mediaId`, `type`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE INDEX `Media_deletedAt_idx` ON `Media`(`deletedAt`);

-- CreateIndex
CREATE INDEX `Media_createdAt_idx` ON `Media`(`createdAt`);

-- CreateIndex
CREATE INDEX `Page_coverImageId_idx` ON `Page`(`coverImageId`);

-- CreateIndex
CREATE INDEX `Post_coverImageId_idx` ON `Post`(`coverImageId`);

-- AddForeignKey
ALTER TABLE `MediaVariant` ADD CONSTRAINT `MediaVariant_mediaId_fkey` FOREIGN KEY (`mediaId`) REFERENCES `Media`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Page` ADD CONSTRAINT `Page_coverImageId_fkey` FOREIGN KEY (`coverImageId`) REFERENCES `Media`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Post` ADD CONSTRAINT `Post_coverImageId_fkey` FOREIGN KEY (`coverImageId`) REFERENCES `Media`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
