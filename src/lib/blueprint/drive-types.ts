// Blueprint email automation: Drive types shared by drive.ts, drive-client.ts and tests.

/** Shape of a Drive v3 file resource as returned by the API (all fields optional). */
export interface RawDriveFile {
  id?: string | null;
  name?: string | null;
  mimeType?: string | null;
  size?: string | null;
  md5Checksum?: string | null;
  modifiedTime?: string | null;
  trashed?: boolean | null;
}

export interface DriveListParams {
  q: string;
  fields: string;
  pageSize: number;
  pageToken?: string;
  corpora: "allDrives";
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
