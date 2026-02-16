-- DropIndex
DROP INDEX `Media_storagePath_key` ON `Media`;

-- CreateIndex
CREATE INDEX `Media_storagePath_idx` ON `Media`(`storagePath`);
