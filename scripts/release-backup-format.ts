import { createCipheriv, createDecipheriv, createHash, randomBytes } from "node:crypto";

export type BackupMetadata = {
  version: 1;
  environment: string;
  host: string;
  database: string;
  commit: string;
  journal: string;
  ledger: string;
  ledgerCount: number;
  createdAt: string;
  archiveSha256: string;
};
export const archiveHash = (archive: Buffer) => createHash("sha256").update(archive).digest("hex");

/** Single JSON envelope; metadata is authenticated as AES-GCM additional data. */
export function encryptArchive(archive: Buffer, key: Buffer, metadata: BackupMetadata) {
  if (archiveHash(archive) !== metadata.archiveSha256) throw new Error("Archive checksum mismatch");
  const nonce = randomBytes(12);
  const aad = Buffer.from(JSON.stringify(metadata));
  const cipher = createCipheriv("aes-256-gcm", key, nonce);
  cipher.setAAD(aad);
  const ciphertext = Buffer.concat([cipher.update(archive), cipher.final()]);
  return Buffer.from(JSON.stringify({ format: "mhg-backup-v1", metadata: aad.toString("base64"),
    nonce: nonce.toString("base64"), tag: cipher.getAuthTag().toString("base64"), ciphertext: ciphertext.toString("base64") }));
}

export function decryptArchive(envelope: Buffer, key: Buffer) {
  try {
    const data = JSON.parse(envelope.toString("utf8"));
    if (data.format !== "mhg-backup-v1") throw new Error();
    const aad = Buffer.from(data.metadata, "base64");
    const metadata = JSON.parse(aad.toString("utf8")) as BackupMetadata;
    const decipher = createDecipheriv("aes-256-gcm", key, Buffer.from(data.nonce, "base64"));
    decipher.setAAD(aad);
    decipher.setAuthTag(Buffer.from(data.tag, "base64"));
    const archive = Buffer.concat([decipher.update(Buffer.from(data.ciphertext, "base64")), decipher.final()]);
    if (metadata.version !== 1 || archiveHash(archive) !== metadata.archiveSha256) throw new Error();
    return { archive, metadata };
  } catch { throw new Error("Encrypted backup authentication or checksum validation failed"); }
}

export function verifyBackupMetadata(actual: BackupMetadata, expected: Omit<BackupMetadata, "version" | "createdAt" | "archiveSha256">) {
  for (const key of Object.keys(expected) as (keyof typeof expected)[]) {
    if (actual[key] !== expected[key]) throw new Error(`Backup does not match release ${key}`);
  }
  const age = Date.now() - Date.parse(actual.createdAt);
  if (!Number.isFinite(age) || age < -60_000 || age > 24 * 60 * 60 * 1000) {
    throw new Error("Backup is outside the 24-hour release window");
  }
}
