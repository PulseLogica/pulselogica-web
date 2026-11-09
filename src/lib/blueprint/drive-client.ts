// Blueprint email automation: googleapis adapter for drive.ts, service-account auth.
// Read-only scope. Separate from src/lib/google-drive.ts (OAuth, PayMongo unlock flow).

import { google } from "googleapis";
import { DRIVE_READONLY_SCOPE } from "./config";
import type { DriveApi } from "./drive";
import { PipelineError } from "./errors";

const REQUEST_TIMEOUT_MS = 30_000;

interface ServiceAccountKey {
  client_email: string;
  private_key: string;
}

/** Parses the key without ever echoing its content into an error. */
function parseKey(json: string): ServiceAccountKey {
  let parsed: unknown;
  try {
    parsed = JSON.parse(json);
  } catch {
    throw new PipelineError("auth", "DRIVE_CREDENTIALS_INVALID", "drive_lookup", "GOOGLE_SERVICE_ACCOUNT_JSON is not valid JSON");
  }
  const key = parsed as Partial<ServiceAccountKey> | null;
  if (!key || typeof key.client_email !== "string" || typeof key.private_key !== "string") {
    throw new PipelineError("auth", "DRIVE_CREDENTIALS_INVALID", "drive_lookup", "Service account key lacks client_email or private_key");
  }
  return { client_email: key.client_email, private_key: key.private_key };
}

let cached: { json: string; api: DriveApi } | null = null;

/** Drive API bound to the service account. Holds auth only, no file data. */
export function createGoogleDriveApi(serviceAccountJson: string): DriveApi {
  if (cached?.json === serviceAccountJson) return cached.api;
  const auth = new google.auth.GoogleAuth({ credentials: parseKey(serviceAccountJson), scopes: [DRIVE_READONLY_SCOPE] });
  const drive = google.drive({ version: "v3", auth, timeout: REQUEST_TIMEOUT_MS });

  const api: DriveApi = {
    async list(params) {
      const res = await drive.files.list(params);
      return { files: res.data.files, nextPageToken: res.data.nextPageToken };
    },
    async getMetadata(fileId, fields) {
      const res = await drive.files.get({ fileId, fields, supportsAllDrives: true });
      return res.data;
    },
    async getMedia(fileId) {
      const res = await drive.files.get(
        { fileId, alt: "media", supportsAllDrives: true },
        { responseType: "arraybuffer" },
      );
      return res.data as unknown as ArrayBuffer;
    },
  };
  cached = { json: serviceAccountJson, api };
  return api;
}
