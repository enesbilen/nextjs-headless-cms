-- DropIndex
DROP INDEX `Media_deletedAt_idx` ON `Media`;

-- DropIndex (single-column indexes replaced by composite for GC: we keep status and processingAt for other queries, add composite)
-- Prisma schema has both @@index([status]), @@index([processingAt]) and @@index([status, processingAt])

-- AlterTable: remove deletedAt (state machine uses status=deleted only)
ALTER TABLE `Media` DROP COLUMN `deletedAt`;

-- AlterTable: storagePath unique (one disk path = one Media record; prevents GC/dual-record bugs)
ALTER TABLE `Media` ADD UNIQUE INDEX `Media_storagePath_key`(`storagePath`);

-- CreateIndex: checksum for duplicate detection, CDN invalidation, forensic debug
CREATE INDEX `Media_checksum_idx` ON `Media`(`checksum`);

-- CreateIndex: composite for GC (stuck processing: status=processing AND processingAt < cutoff)
CREATE INDEX `Media_status_processingAt_idx` ON `Media`(`status`, `processingAt`);
