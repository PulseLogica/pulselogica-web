// Blueprint email automation: locked Blueprint lookup and download in Drive (spec 10.5).
// Drive search is not recursive by ancestor, so the folder tree is walked first.
// Create one instance per pipeline run: the folder-walk cache lives on the instance.

import {
  DRIVE_ARCHIVE_FOLDER_NAME,
  DRIVE_BLUEPRINT_SUFFIX,
  PDF_MIME_TYPE,
  getBlueprintConfig,
} from "./config";
import { PipelineError, httpError, networkError, type FailedStep } from "./errors";

/** Shape of a Drive v3 file resource as returned by the API (all fields optional). */
export interface RawDriveFile {
  id?: string | null;
  name?: string | null;
  mimeType?: string | null;
  size?: string | null;
  md5Checksum?: string | null;
  modifiedTime?: string | null;
}

export interface DriveListParams {
  q: string;
  fields: string;
  pageSize: number;
  pageToken?: string;
  supportsAllDrives: true;
  includeItemsFromAllDrives: true;
}

/** The three Drive calls this module needs. Real adapter in drive-client.ts; fakes in tests. */
export interface DriveApi {
  list(params: DriveListParams): Promise<{ files?: RawDriveFile[] | null; nextPageToken?: string | null }>;
  getMetadata(fileId: string, fields: string): Promise<RawDriveFile>;
  getMedia(fileId: string): Promise<ArrayBuffer | Uint8Array>;
}

export interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
  size: number;
  md5Checksum: string | null;
  modifiedTime: string | null;
}

export const FOLDER_MIME_TYPE = "application/vnd.google-apps.folder";
/** Folder ids per `'id' in parents` query. Keeps queries well under Drive's length limit. */
export const PARENTS_BATCH_SIZE = 20;
const PAGE_SIZE = 1000;
const FILE_FIELDS = "id,name,mimeType,size,md5Checksum,modifiedTime";

/** Escapes a value for a single-quoted Drive query string: backslash first, then quote. */
export function escapeDriveQuery(value: string): string {
  return value.replace(/\\/g, "\\\\").replace(/'/g, "\\'");
}

export function expectedBlueprintName(companyName: string): string {
  return `${companyName.trim()}${DRIVE_BLUEPRINT_SUFFIX}`;
}

function statusOf(err: unknown): number | undefined {
  if (typeof err !== "object" || err === null) return undefined;
  const e = err as { status?: unknown; code?: unknown; response?: { status?: unknown } };
  for (const candidate of [e.status, e.response?.status, e.code]) {
    if (typeof candidate === "number" && candidate >= 400 && candidate <= 599) return candidate;
  }
  return undefined;
}

/**
 * Classifies a googleapis (gaxios) error by HTTP status: 401/403 auth, 408/429/5xx
 * transient, other 4xx permanent; no status means a network failure, transient.
 * Raw messages are dropped because they can carry request URLs and query text.
 */
export function classifyDriveError(err: unknown, step: FailedStep): PipelineError {
  if (err instanceof PipelineError) return err;
  const status = statusOf(err);
  if (status !== undefined) return httpError(status, step, undefined, `Drive request failed with HTTP ${status}`);
  const net = networkError(err, step);
  return new PipelineError(net.kind, net.code, step, `Drive request failed (${net.code})`);
}

function toDriveFile(raw: RawDriveFile): DriveFile {
  const size = Number(raw.size ?? 0);
  return {
    id: raw.id ?? "",
    name: raw.name ?? "",
    mimeType: raw.mimeType ?? "",
    size: Number.isFinite(size) ? size : 0,
    md5Checksum: raw.md5Checksum ?? null,
    modifiedTime: raw.modifiedTime ?? null,
  };
}

function chunks<T>(items: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < items.length; i += size) out.push(items.slice(i, i + size));
  return out;
}

const parentsClause = (ids: string[]) => ids.map((id) => `'${escapeDriveQuery(id)}' in parents`).join(" or ");

export function createDrive(api: DriveApi, rootFolderId: string) {
  const walkCache = new Map<string, Promise<string[]>>();

  /** Lists every result of a query, following nextPageToken. Errors fail as drive_lookup. */
  async function listAll(q: string, fileFields: string): Promise<RawDriveFile[]> {
    const out: RawDriveFile[] = [];
    let pageToken: string | undefined;
    do {
      try {
        const page = await api.list({
          q,
          fields: `nextPageToken, files(${fileFields})`,
          pageSize: PAGE_SIZE,
          pageToken,
          supportsAllDrives: true,
          includeItemsFromAllDrives: true,
        });
        out.push(...(page.files ?? []));
        pageToken = page.nextPageToken ?? undefined;
      } catch (err) {
        throw classifyDriveError(err, "drive_lookup");
      }
    } while (pageToken);
    return out;
  }

  /** BFS over the folder tree. Folders named exactly `_Archive` and their subtrees are skipped. */
  async function walk(root: string): Promise<string[]> {
    const seen = new Set([root]);
    let frontier = [root];
    while (frontier.length > 0) {
      const next: string[] = [];
      for (const batch of chunks(frontier, PARENTS_BATCH_SIZE)) {
        const q = `mimeType = '${FOLDER_MIME_TYPE}' and trashed = false and (${parentsClause(batch)})`;
        for (const folder of await listAll(q, "id,name")) {
          if (!folder.id || seen.has(folder.id) || folder.name === DRIVE_ARCHIVE_FOLDER_NAME) continue;
          seen.add(folder.id);
          next.push(folder.id);
        }
      }
      frontier = next;
    }
    return [...seen];
  }

  /** Folder ids under `root` (root included). Cached on this instance only. */
  function walkFolders(root: string = rootFolderId): Promise<string[]> {
    let cached = walkCache.get(root);
    if (!cached) {
      cached = walk(root);
      cached.catch(() => walkCache.delete(root));
      walkCache.set(root, cached);
    }
    return cached;
  }

  return {
    walkFolders,

    /** Preflight check 4: exactly one `{Company}_Operational_Blueprint_Locked.pdf` outside `_Archive`. */
    async findLockedBlueprint(companyName: string): Promise<DriveFile> {
      if (!companyName.trim()) {
        throw new PipelineError("permanent", "MISSING_FIELD:Company Name", "drive_lookup");
      }
      const expected = expectedBlueprintName(companyName);
      const folderIds = await walkFolders();
      const byId = new Map<string, DriveFile>();
      for (const batch of chunks(folderIds, PARENTS_BATCH_SIZE)) {
        const q =
          `name = '${escapeDriveQuery(expected)}' and trashed = false` +
          ` and mimeType = '${PDF_MIME_TYPE}' and (${parentsClause(batch)})`;
        for (const raw of await listAll(q, FILE_FIELDS)) {
          const file = toDriveFile(raw);
          // Mandatory exact, case-sensitive match: Drive's `name =` may ignore case.
          if (file.id && file.name === expected) byId.set(file.id, file);
        }
      }
      const hits = [...byId.values()];
      if (hits.length === 0) {
        throw new PipelineError("permanent", "DRIVE_NO_MATCH", "drive_lookup", `No Drive file named ${expected}`);
      }
      if (hits.length > 1) {
        throw new PipelineError("permanent", "DRIVE_MULTI_MATCH", "drive_lookup", `${hits.length} Drive files named ${expected}`);
      }
      return hits[0];
    },

    /** Metadata (for md5) and media fetched in the same step, so the caller can compare md5. */
    async download(fileId: string): Promise<{ buffer: Buffer; md5: string | null }> {
      try {
        const meta = await api.getMetadata(fileId, FILE_FIELDS);
        const data = await api.getMedia(fileId);
        const buffer = data instanceof ArrayBuffer ? Buffer.from(data) : Buffer.from(data.buffer, data.byteOffset, data.byteLength);
        return { buffer, md5: meta.md5Checksum ?? null };
      } catch (err) {
        throw classifyDriveError(err, "drive_download");
      }
    },
  };
}

export type BlueprintDrive = ReturnType<typeof createDrive>;

/** A fresh Drive instance (fresh folder-walk cache) for one pipeline run. */
export async function newDriveRun(): Promise<BlueprintDrive> {
  const { createGoogleDriveApi } = await import("./drive-client");
  const { serviceAccountJson, blueprintsRootFolderId } = getBlueprintConfig().google;
  return createDrive(createGoogleDriveApi(serviceAccountJson), blueprintsRootFolderId);
}
