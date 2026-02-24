-- AlterTable
ALTER TABLE `Page` ADD COLUMN `blocks` JSON NULL,
    ADD COLUMN `builderMode` BOOLEAN NOT NULL DEFAULT false;
