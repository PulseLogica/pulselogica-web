// In-memory Drive for tests. Interprets the queries drive.ts builds:
// folder listing, `name = '...'` (case-insensitive, like Drive may be), `'id' in parents`,
// and pages results by pageSize with nextPageToken.

import type { DriveApi, DriveListParams, RawDriveFile } from "@/lib/blueprint/drive";

export interface FakeItem {
  id: string;
  name: string;
  parent: string;
  mimeType?: string;
  size?: number;
  md5?: string;
  content?: string;
  trashed?: boolean;
}

const FOLDER = "application/vnd.google-apps.folder";

/** Reverses escapeDriveQuery for one single-quoted literal. */
function unescape(literal: string): string {
  return literal.replace(/\\(.)/g, "$1");
}

export function fakeDrive(items: FakeItem[], opts: { pageSize?: number; fail?: (params: DriveListParams) => unknown } = {}) {
  const calls: DriveListParams[] = [];
  const all = items.map((i) => ({ mimeType: "application/pdf", size: 1000, md5: `md5-${i.id}`, ...i }));

  const api: DriveApi = {
    async list(params) {
      calls.push(params);
      const failure = opts.fail?.(params);
      if (failure) throw failure;
      const parents = [...params.q.matchAll(/'((?:[^'\\]|\\.)*)' in parents/g)].map((m) => unescape(m[1]));
      const nameMatch = /name = '((?:[^'\\]|\\.)*)'/.exec(params.q);
      const wantFolders = params.q.includes(`mimeType = '${FOLDER}'`);
      const wantPdf = params.q.includes("mimeType = 'application/pdf'");
      const name = nameMatch ? unescape(nameMatch[1]).toLowerCase() : null;
      const hits = all.filter(
        (i) =>
          parents.includes(i.parent) &&
          (wantFolders ? i.mimeType === FOLDER : i.mimeType !== FOLDER) &&
          (!wantPdf || i.mimeType === "application/pdf") &&
          (name === null || i.name.toLowerCase() === name),
      );
      const size = Math.min(params.pageSize, opts.pageSize ?? params.pageSize);
      const start = Number(params.pageToken ?? 0);
      const page = hits.slice(start, start + size);
      const next = start + size < hits.length ? String(start + size) : undefined;
      const files: RawDriveFile[] = page.map((i) => ({
        id: i.id,
        name: i.name,
        mimeType: i.mimeType,
        size: String(i.size),
        md5Checksum: i.md5,
        modifiedTime: "2026-11-09T00:00:00.000Z",
      }));
      return { files, nextPageToken: next };
    },
    async getMetadata(fileId) {
      const item = all.find((i) => i.id === fileId);
      if (!item) throw Object.assign(new Error("File not found"), { status: 404 });
      return { id: item.id, name: item.name, mimeType: item.mimeType, size: String(item.size), md5Checksum: item.md5, trashed: item.trashed ?? false };
    },
    async getMedia(fileId) {
      const item = all.find((i) => i.id === fileId);
      if (!item) throw Object.assign(new Error("File not found"), { status: 404 });
      return new TextEncoder().encode(item.content ?? "%PDF-1.7");
    },
  };
  return { api, calls };
}

export const folder = (id: string, name: string, parent: string): FakeItem => ({ id, name, parent, mimeType: FOLDER });
