import { describe, expect, test } from "bun:test";
import {
  PARENTS_BATCH_SIZE,
  classifyDriveError,
  createDrive,
  escapeDriveQuery,
} from "@/lib/blueprint/drive";
import { PipelineError, type ErrorKind } from "@/lib/blueprint/errors";
import { fakeDrive, folder, type FakeItem } from "./fake-drive";

const ROOT = "root";
const NAME = "Acme Corp_Operational_Blueprint_Locked.pdf";

const tree: FakeItem[] = [
  folder("clients", "Clients", ROOT),
  folder("acme", "Acme Corp", "clients"),
  folder("archive", "_Archive", ROOT),
  folder("old", "Old Clients", "archive"),
  folder("archive-lower", "_archive", ROOT),
];

async function caught(promise: Promise<unknown>): Promise<PipelineError> {
  try {
    await promise;
  } catch (err) {
    if (err instanceof PipelineError) return err;
    throw err;
  }
  throw new Error("expected a PipelineError");
}

function drive(items: FakeItem[], opts?: Parameters<typeof fakeDrive>[1]) {
  const fake = fakeDrive(items, opts);
  return { drive: createDrive(fake.api, ROOT), calls: fake.calls };
}

describe("escapeDriveQuery", () => {
  test("escapes backslashes before single quotes", () => {
    expect(escapeDriveQuery("O'Brien\\Co")).toBe("O\\'Brien\\\\Co");
  });
});

describe("walkFolders", () => {
  test("BFS skips folders named exactly _Archive and their subtrees", async () => {
    const { drive: d } = drive(tree);
    const ids = await d.walkFolders(ROOT);
    expect(ids.sort()).toEqual(["acme", "archive-lower", "clients", "root"]);
  });

  test("is cached per instance, so a second lookup does not re-walk", async () => {
    const { drive: d, calls } = drive(tree);
    await d.walkFolders();
    const afterFirst = calls.length;
    await d.walkFolders();
    expect(calls.length).toBe(afterFirst);
    const { drive: fresh, calls: freshCalls } = drive(tree);
    await fresh.walkFolders();
    expect(freshCalls.length).toBe(afterFirst);
  });

  test("follows nextPageToken on folder listings", async () => {
    const many = Array.from({ length: 7 }, (_, i) => folder(`f${i}`, `Folder ${i}`, ROOT));
    const { drive: d, calls } = drive(many, { pageSize: 3 });
    expect((await d.walkFolders()).length).toBe(8);
    expect(calls.filter((c) => c.q.includes("'root' in parents")).map((c) => c.pageToken)).toEqual([undefined, "3", "6"]);
  });

  test("batches parents about 20 per query", async () => {
    const many = Array.from({ length: 45 }, (_, i) => folder(`f${i}`, `Folder ${i}`, ROOT));
    const { drive: d, calls } = drive(many);
    await d.walkFolders();
    const secondLevel = calls.filter((c) => !c.q.includes("'root' in parents"));
    expect(secondLevel).toHaveLength(Math.ceil(45 / PARENTS_BATCH_SIZE));
    for (const c of secondLevel) {
      expect(c.q.match(/in parents/g)!.length).toBeLessThanOrEqual(PARENTS_BATCH_SIZE);
    }
  });
});

describe("findLockedBlueprint", () => {
  test("exactly one match returns the file with metadata", async () => {
    const { drive: d, calls } = drive([...tree, { id: "pdf-1", name: NAME, parent: "acme", size: 2048, md5: "abc" }]);
    expect(await d.findLockedBlueprint(" Acme Corp ")).toEqual({
      id: "pdf-1",
      name: NAME,
      mimeType: "application/pdf",
      size: 2048,
      md5Checksum: "abc",
      modifiedTime: "2026-11-09T00:00:00.000Z",
    });
    const search = calls.find((c) => c.q.startsWith("name ="))!;
    expect(search).toMatchObject({ supportsAllDrives: true, includeItemsFromAllDrives: true });
    expect(search.q).toContain("trashed = false");
    expect(search.q).toContain("mimeType = 'application/pdf'");
  });

  test("zero matches is DRIVE_NO_MATCH (permanent)", async () => {
    const { drive: d } = drive(tree);
    expect(await caught(d.findLockedBlueprint("Acme Corp"))).toMatchObject({
      kind: "permanent", code: "DRIVE_NO_MATCH", step: "drive_lookup",
    });
  });

  test("two matches is DRIVE_MULTI_MATCH (permanent)", async () => {
    const { drive: d } = drive([
      ...tree,
      { id: "pdf-1", name: NAME, parent: "acme" },
      { id: "pdf-2", name: NAME, parent: "clients" },
    ]);
    expect(await caught(d.findLockedBlueprint("Acme Corp"))).toMatchObject({ kind: "permanent", code: "DRIVE_MULTI_MATCH" });
  });

  test("company name differing by punctuation matches nothing", async () => {
    const { drive: d } = drive([...tree, { id: "pdf-1", name: "Acme Corp._Operational_Blueprint_Locked.pdf", parent: "acme" }]);
    expect((await caught(d.findLockedBlueprint("Acme Corp"))).code).toBe("DRIVE_NO_MATCH");
  });

  test("a match only inside _Archive is ignored", async () => {
    const { drive: d } = drive([
      ...tree,
      { id: "pdf-a", name: NAME, parent: "archive" },
      { id: "pdf-b", name: NAME, parent: "old" },
    ]);
    expect((await caught(d.findLockedBlueprint("Acme Corp"))).code).toBe("DRIVE_NO_MATCH");
  });

  test("case difference is returned by Drive but rejected by the in-code exact match", async () => {
    const { drive: d, calls } = drive([...tree, { id: "pdf-1", name: "ACME CORP_Operational_Blueprint_Locked.pdf", parent: "acme" }]);
    expect((await caught(d.findLockedBlueprint("Acme Corp"))).code).toBe("DRIVE_NO_MATCH");
    expect(calls.some((c) => c.q.startsWith("name ="))).toBe(true);
  });

  test("case-different twin does not turn an exact match into a multi-match", async () => {
    const { drive: d } = drive([
      ...tree,
      { id: "pdf-1", name: NAME, parent: "acme" },
      { id: "pdf-2", name: NAME.toLowerCase(), parent: "clients" },
    ]);
    expect((await d.findLockedBlueprint("Acme Corp")).id).toBe("pdf-1");
  });

  test("quotes and backslashes in the company name are escaped in the query", async () => {
    const company = "O'Brien \\ Sons";
    const { drive: d, calls } = drive([...tree, { id: "pdf-1", name: `${company}_Operational_Blueprint_Locked.pdf`, parent: "acme" }]);
    expect((await d.findLockedBlueprint(company)).id).toBe("pdf-1");
    const search = calls.find((c) => c.q.startsWith("name ="))!;
    expect(search.q).toContain("name = 'O\\'Brien \\\\ Sons_Operational_Blueprint_Locked.pdf'");
  });

  test("follows nextPageToken on the file search", async () => {
    const files = Array.from({ length: 5 }, (_, i) => ({ id: `pdf-${i}`, name: NAME, parent: "acme" }));
    const { drive: d, calls } = drive([...tree, ...files], { pageSize: 2 });
    const err = await caught(d.findLockedBlueprint("Acme Corp"));
    expect(err.code).toBe("DRIVE_MULTI_MATCH");
    expect(err.message).toContain("5 Drive files");
    expect(calls.filter((c) => c.q.startsWith("name =")).map((c) => c.pageToken)).toEqual([undefined, "2", "4"]);
  });

  test("Drive 401 during lookup is kind auth", async () => {
    const { drive: d } = drive(tree, { fail: () => Object.assign(new Error("Login Required"), { status: 401 }) });
    expect(await caught(d.findLockedBlueprint("Acme Corp"))).toMatchObject({ kind: "auth", code: "HTTP_401", step: "drive_lookup" });
  });
});

describe("download", () => {
  test("returns the buffer and md5 from metadata", async () => {
    const { drive: d } = drive([{ id: "pdf-1", name: NAME, parent: "acme", md5: "abc", content: "%PDF-data" }]);
    const { buffer, md5 } = await d.download("pdf-1");
    expect(buffer.toString()).toBe("%PDF-data");
    expect(md5).toBe("abc");
  });

  test("errors are classified under drive_download", async () => {
    const { drive: d } = drive([]);
    expect(await caught(d.download("missing"))).toMatchObject({ kind: "permanent", code: "HTTP_404", step: "drive_download" });
  });
});

describe("classifyDriveError", () => {
  test.each<[object, ErrorKind]>([
    [{ status: 401 }, "auth"],
    [{ status: 403 }, "auth"],
    [{ response: { status: 429 } }, "transient"],
    [{ code: 503 }, "transient"],
    [{ status: 408 }, "transient"],
    [{ status: 400 }, "permanent"],
    [{ status: 404 }, "permanent"],
  ])("%o -> %s", (shape, kind) => {
    expect(classifyDriveError(Object.assign(new Error("x"), shape), "drive_lookup").kind).toBe(kind);
  });

  test("network errors are transient and drop the raw message", () => {
    const err = Object.assign(new Error("request to https://www.googleapis.com/drive/v3/files?q=Acme failed"), { code: "ECONNRESET" });
    const out = classifyDriveError(err, "drive_download");
    expect(out).toMatchObject({ kind: "transient", code: "NETWORK_ERROR", step: "drive_download" });
    expect(out.message).not.toContain("googleapis");
  });
});
