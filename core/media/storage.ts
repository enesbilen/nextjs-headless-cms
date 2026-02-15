import { Readable } from "stream";
import { createReadStream, createWriteStream, mkdir, access, stat } from "fs";
import { dirname, join } from "path";
import { pipeline } from "stream/promises";
import { promisify } from "util";

const statAsync = promisify(stat);

export interface MediaStorage {
  write(storagePath: string, stream: Readable): Promise<void>;
  readStream(storagePath: string): Promise<Readable>;
  exists(storagePath: string): Promise<boolean>;
  delete(storagePath: string): Promise<void>;
  size(storagePath: string): Promise<number>;
}

function getStorageRoot(): string {
  const root =
    process.env.MEDIA_STORAGE_PATH ||
    join(process.cwd(), "data", "uploads");
  return root;
}

function resolvePath(storagePath: string): string {
  const root = getStorageRoot();
  return join(root, storagePath);
}

export const localStorage: MediaStorage = {
  async write(storagePath: string, stream: Readable): Promise<void> {
    const fullPath = resolvePath(storagePath);
    const dir = dirname(fullPath);
    await new Promise<void>((resolve, reject) => {
      mkdir(dir, { recursive: true }, (err) => (err ? reject(err) : resolve()));
    });
    const writeStream = createWriteStream(fullPath);
    await pipeline(stream, writeStream);
  },

  async readStream(storagePath: string): Promise<Readable> {
    const fullPath = resolvePath(storagePath);
    const exists = await new Promise<boolean>((resolve) => {
      access(fullPath, (err) => resolve(!err));
    });
    if (!exists) {
      throw new Error(`File not found: ${storagePath}`);
    }
    return createReadStream(fullPath);
  },

  async exists(storagePath: string): Promise<boolean> {
    const fullPath = resolvePath(storagePath);
    return new Promise((resolve) => {
      access(fullPath, (err) => resolve(!err));
    });
  },

  async delete(storagePath: string): Promise<void> {
    const { unlink } = await import("fs/promises");
    const fullPath = resolvePath(storagePath);
    await unlink(fullPath);
  },

  async size(storagePath: string): Promise<number> {
    const fullPath = resolvePath(storagePath);
    const s = await statAsync(fullPath);
    return s.size;
  },
};
