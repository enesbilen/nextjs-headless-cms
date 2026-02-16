-- AlterTable
ALTER TABLE `Media` ADD COLUMN `fileSize` BIGINT NULL,
    ADD COLUMN `processingAt` DATETIME(3) NULL,
    ADD COLUMN `status` ENUM('processing', 'ready', 'failed', 'deleted') NOT NULL DEFAULT 'processing',
    ADD COLUMN `version` INTEGER NOT NULL DEFAULT 1;

-- CreateIndex
CREATE INDEX `Media_status_idx` ON `Media`(`status`);

-- CreateIndex
CREATE INDEX `Media_processingAt_idx` ON `Media`(`processingAt`);

-- Data: existing media were already usable, mark as ready
UPDATE `Media` SET `status` = 'ready' WHERE `status` = 'processing';
