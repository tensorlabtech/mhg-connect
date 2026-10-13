import "server-only";

import {
  DeleteObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { del, put } from "@vercel/blob";

import { runtimeEnv } from "@/lib/runtime-env";

export type ProfileMediaKind =
  "article" | "avatar" | "background" | "card-background" | "cover";

let b2Client: S3Client | null = null;

function getB2Config() {
  const values = {
    applicationKey: runtimeEnv.b2ApplicationKey,
    bucket: runtimeEnv.b2BucketName,
    endpoint: runtimeEnv.b2S3Endpoint,
    keyId: runtimeEnv.b2KeyId,
    region: runtimeEnv.b2Region,
  };
  return Object.values(values).every(Boolean) ? values : null;
}

function getB2Client() {
  const config = getB2Config();
  if (!config) return null;
  b2Client ??= new S3Client({
    credentials: {
      accessKeyId: config.keyId!,
      secretAccessKey: config.applicationKey!,
    },
    endpoint: config.endpoint,
    forcePathStyle: false,
    region: config.region,
  });
  return { client: b2Client, config };
}

function extensionFor(contentType: string) {
  return contentType === "image/png"
    ? "png"
    : contentType === "image/webp"
      ? "webp"
      : "jpg";
}

function publicB2BaseUrl(bucket: string, endpoint: string) {
  if (runtimeEnv.b2PublicUrlBase)
    return runtimeEnv.b2PublicUrlBase.replace(/\/$/, "");
  const endpointUrl = new URL(endpoint);
  endpointUrl.hostname = `${bucket}.${endpointUrl.hostname}`;
  return endpointUrl.toString().replace(/\/$/, "");
}

export function isManagedProfileMediaUrl(value: string) {
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    return false;
  }

  if (url.protocol !== "https:") return false;

  const b2 = getB2Config();
  if (b2) {
    const base = publicB2BaseUrl(b2.bucket!, b2.endpoint!);
    if (value.startsWith(`${base}/`)) return true;
  }

  return url.hostname.endsWith(".public.blob.vercel-storage.com");
}

export async function uploadProfileMedia(file: File, kind: ProfileMediaKind) {
  const b2 = getB2Client();
  const key = `${kind}s/${crypto.randomUUID()}.${extensionFor(file.type)}`;
  if (b2) {
    await b2.client.send(
      new PutObjectCommand({
        Body: Buffer.from(await file.arrayBuffer()),
        Bucket: b2.config.bucket,
        CacheControl: "public, max-age=31536000, immutable",
        ContentType: file.type,
        Key: key,
      }),
    );
    return {
      url: `${publicB2BaseUrl(b2.config.bucket!, b2.config.endpoint!)}/${key}`,
    };
  }
  if (runtimeEnv.blobToken) {
    return put(key, file, {
      access: "public",
      addRandomSuffix: true,
      token: runtimeEnv.blobToken,
    });
  }
  throw new Error("Chưa cấu hình kho ảnh cho môi trường này.");
}

export async function deleteProfileMedia(url: string) {
  const b2 = getB2Client();
  if (b2) {
    const base = publicB2BaseUrl(b2.config.bucket!, b2.config.endpoint!);
    if (url.startsWith(`${base}/`)) {
      await b2.client.send(
        new DeleteObjectCommand({
          Bucket: b2.config.bucket,
          Key: decodeURIComponent(url.slice(base.length + 1)),
        }),
      );
      return;
    }
  }
  if (runtimeEnv.blobToken && url.startsWith("https://")) {
    await del(url, { token: runtimeEnv.blobToken });
  }
}
