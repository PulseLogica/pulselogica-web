// Blueprint email automation: locked Blueprint lookup and download in Drive (spec 10.5).
// Drive search is not recursive by ancestor, so the folder tree is walked first.
// Create one instance per pipeline run: the folder-walk cache lives on the instance.

import {
  DRIVE_ARCHIVE_FOLDER_NAME,
  DRIVE_BLUEPRINT_SUFFIX,
  PDF_MIME_TYPE,
  getBlueprintConfig,
} from "./config";
import crypto from "crypto";
import { classifyDriveError } from "./drive-errors";
import type { DriveApi, DriveFile, RawDriveFile } from "./drive-types";
import { PipelineError } from "./errors";
import { bpWarn } from "./log";

export type { DriveApi, DriveFile, DriveListParams, RawDriveFile } from "./drive-types";

export const FOLDER_MIME_TYPE = "application/vnd.google-apps.folder";
/** Folder ids per `'id' in parents` query. Keeps queries well under Drive's length limit. */
export const PARENTS_BATCH_SIZE = 20;
const PAGE_SIZE = 1000;
/** Per-query page cap. Hitting it truncates results (fails safe as no match) and logs a warning. */
export const MAX_LIST_PAGES = 50;
const FILE_FIELDS = "id,name,mimeType,size,md5Checksum,modifiedTime";
const ARCHIVE_NAME = DRIVE_ARCHIVE_FOLDER_NAME.toLowerCase();

/** `_Archive` match is trimmed and case-insensitive. */
const isArchive = (name: string | null | undefined) => name?.trim().toLowerCase() === ARCHIVE_NAME;

/** Escapes a value for a single-quoted Drive query string: backslash first, then quote. */
export function escapeDriveQuery(value: string): string {
  return value.replace(/\\/g, "\\\\").replace(/'/g, "\\'");
}

export function expectedBlueprintName(companyName: string): string {
  return `${companyName.trim()}${DRIVE_BLUEPRINT_SUFFIX}`;
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
    for (let pages = 0; pages < MAX_LIST_PAGES; pages++) {
      try {
        const page = await api.list({
          q,
          fields: `nextPageToken, files(${fileFields})`,
          pageSize: PAGE_SIZE,
          pageToken,
          corpora: "allDrives",
          supportsAllDrives: true,
          includeItemsFromAllDrives: true,
        });
        out.push(...(page.files ?? []));
        pageToken = page.nextPageToken ?? undefined;
      } catch (err) {
        throw classifyDriveError(err, "drive_lookup");
      }
      if (!pageToken) return out;
    }
    bpWarn("drive.list_page_cap", { pages: MAX_LIST_PAGES, results: out.length });
    return out;
  }

  /** BFS over the folder tree. `_Archive` folders (any case, trimmed) and their subtrees are skipped. */
  async function walk(root: string): Promise<string[]> {
    const seen = new Set([root]);
    let frontier = [root];
    while (frontier.length > 0) {
      const next: string[] = [];
      for (const batch of chunks(frontier, PARENTS_BATCH_SIZE)) {
        const q = `mimeType = '${FOLDER_MIME_TYPE}' and trashed = false and (${parentsClause(batch)})`;
        for (const folder of await listAll(q, "id,name")) {
          if (!folder.id || seen.has(folder.id) || isArchive(folder.name)) continue;
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

    /**
     * Downloads the file. `md5` is computed over the downloaded bytes, so it always describes
     * exactly what would be attached. A trashed file counts as changed after approval.
     */
    async download(fileId: string): Promise<{ buffer: Buffer; md5: string }> {
      let meta: RawDriveFile;
      let data: ArrayBuffer | Uint8Array;
      try {
        meta = await api.getMetadata(fileId, `${FILE_FIELDS},trashed`);
        if (meta.trashed) {
          throw new PipelineError("permanent", "FILE_CHANGED_AFTER_APPROVAL", "drive_download", "Drive file is in the trash");
        }
        data = await api.getMedia(fileId);
      } catch (err) {
        throw classifyDriveError(err, "drive_download");
      }
      const buffer = data instanceof ArrayBuffer ? Buffer.from(data) : Buffer.from(data.buffer, data.byteOffset, data.byteLength);
      return { buffer, md5: crypto.createHash("md5").update(buffer).digest("hex") };
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
