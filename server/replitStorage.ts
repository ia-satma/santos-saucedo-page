import fs from "node:fs/promises";
import path from "node:path";

type StorageClient = {
  uploadFromBytes: (objectName: string, contents: Buffer) => Promise<StorageResult<null>>;
  downloadAsBytes: (objectName: string) => Promise<StorageResult<unknown>>;
  delete: (objectName: string, options?: { ignoreNotFound?: boolean }) => Promise<StorageResult<null>>;
};

type StorageResult<T> = {
  ok: boolean;
  value?: T;
  error?: unknown;
};

const localStorageRoot = path.join(process.cwd(), "uploads");
const isReplitRuntime = Boolean(
  process.env.REPL_ID || process.env.REPLIT_DEPLOYMENT || process.env.REPLIT_DEV_DOMAIN,
);

let clientPromise: Promise<StorageClient | null> | undefined;

function objectPath(objectName: string): string {
  const normalized = objectName.replace(/^\/+/, "");
  if (!normalized || normalized.includes("..") || path.isAbsolute(normalized)) {
    throw new Error("Invalid App Storage object name");
  }
  return path.join(localStorageRoot, normalized);
}

async function getClient(): Promise<StorageClient | null> {
  if (clientPromise) return clientPromise;

  clientPromise = (async () => {
    try {
      const moduleName = "@replit/object-storage";
      const { Client } = await import(moduleName);
      const bucketId = process.env.REPLIT_APP_STORAGE_BUCKET_ID || process.env.APP_STORAGE_BUCKET_ID;
      const ClientConstructor = Client as new (options?: { bucketId?: string }) => StorageClient;
      const client = new ClientConstructor(bucketId ? { bucketId } : undefined);
      return client;
    } catch (error) {
      if (isReplitRuntime && process.env.NODE_ENV === "production") {
        throw new Error(`Replit App Storage is not available: ${String(error)}`);
      }
      console.warn("[AppStorage] SDK unavailable; using local uploads fallback.", error);
      return null;
    }
  })();

  return clientPromise;
}

export async function uploadAppStorageObject(objectName: string, contents: Buffer): Promise<void> {
  const client = await getClient();
  if (client) {
    const result = await client.uploadFromBytes(objectName, contents);
    if (!result.ok) throw new Error(`App Storage upload failed: ${String(result.error)}`);
    return;
  }

  const destination = objectPath(objectName);
  await fs.mkdir(path.dirname(destination), { recursive: true });
  await fs.writeFile(destination, contents);
}

export async function downloadAppStorageObject(objectName: string): Promise<Buffer | null> {
  const client = await getClient();
  if (client) {
    const result = await client.downloadAsBytes(objectName);
    if (!result.ok || result.value === undefined) return null;
    const value = result.value;
    if (Buffer.isBuffer(value)) return value;
    if (Array.isArray(value)) return Buffer.from(value[0] as Uint8Array);
    return Buffer.from(value as Uint8Array);
  }

  try {
    return await fs.readFile(objectPath(objectName));
  } catch (error: any) {
    if (error?.code === "ENOENT") return null;
    throw error;
  }
}

export async function deleteAppStorageObject(objectName: string): Promise<void> {
  const client = await getClient();
  if (client) {
    const result = await client.delete(objectName, { ignoreNotFound: true });
    if (!result.ok) throw new Error(`App Storage delete failed: ${String(result.error)}`);
    return;
  }

  try {
    await fs.unlink(objectPath(objectName));
  } catch (error: any) {
    if (error?.code !== "ENOENT") throw error;
  }
}

export function appStorageObjectKeyFromPath(mediaPath: string): string | null {
  const prefix = "/media/";
  if (!mediaPath.startsWith(prefix)) return null;
  const objectName = mediaPath.slice(prefix.length);
  return objectName.startsWith("public/") ? objectName : null;
}
