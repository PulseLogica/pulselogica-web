import { describe, expect, test } from "bun:test";
import { createClickUp, parseTask, type FetchLike, type RawField } from "@/lib/blueprint/clickup";
import { PipelineError } from "@/lib/blueprint/errors";

interface Call { url: string; init: RequestInit }

function fakeFetch(responder: (url: string, init: RequestInit) => Response | Promise<Response>) {
  const calls: Call[] = [];
  const fetch: FetchLike = async (url, init) => {
    calls.push({ url, init });
    return responder(url, init);
  };
  return { fetch, calls };
}

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });

const trackField = (value: unknown) => ({
  name: "Track",
  type: "drop_down",
  type_config: {
    options: [
      { id: "opt-a", name: "Foundation", orderindex: 0 },
      { id: "opt-b", name: "Growth", orderindex: 1 },
      { id: "opt-c", name: "Scale", orderindex: "2" },
    ],
  },
  value,
});

function rawTask(fields: RawField[] = [], extra: Record<string, unknown> = {}) {
  return {
    id: "task-1",
    url: "https://app.clickup.com/t/task-1",
    status: { status: "Ready to Send" },
    date_updated: "1762646400000",
    custom_fields: fields,
    ...extra,
  };
}

const fullFields: RawField[] = [
  { name: "Client Name", type: "short_text", value: "  Ana Cruz " },
  { name: "Client Email", type: "email", value: "ana@example.com" },
  { name: "Company Name", type: "short_text", value: "Acme Corp" },
  { name: "Blueprint Score", type: "number", value: 72 },
  trackField(1),
  { name: "Critical Dimensions", type: "number", value: "3" },
];

function client(responder: Parameters<typeof fakeFetch>[0]) {
  const fake = fakeFetch(responder);
  return { api: createClickUp({ apiToken: "pk_test", listId: "list-1", fetch: fake.fetch }), calls: fake.calls };
}

async function caught(promise: Promise<unknown>): Promise<PipelineError> {
  try {
    await promise;
  } catch (err) {
    if (err instanceof PipelineError) return err;
    throw err;
  }
  throw new Error("expected a PipelineError");
}

describe("parseTask", () => {
  test("parses every blueprint field by name", () => {
    expect(parseTask(rawTask(fullFields))).toEqual({
      id: "task-1",
      url: "https://app.clickup.com/t/task-1",
      status: "Ready to Send",
      dateUpdated: "1762646400000",
      clientName: "Ana Cruz",
      clientEmail: "ana@example.com",
      companyName: "Acme Corp",
      blueprintScore: "72",
      track: "Growth",
      criticalDimensions: 3,
    });
  });

  test.each([
    ["orderindex number", 0, "Foundation"],
    ["orderindex as string", "1", "Growth"],
    ["orderindex stored as string in options", 2, "Scale"],
    ["option id", "opt-c", "Scale"],
  ])("dropdown value as %s maps to option name", (_label, value, expected) => {
    expect(parseTask(rawTask([trackField(value)])).track).toBe(expected);
  });

  test("dropdown falls back to array index when options have no orderindex", () => {
    const field = { name: "Track", type: "drop_down", type_config: { options: [{ name: "A" }, { name: "B" }] }, value: 1 };
    expect(parseTask(rawTask([field])).track).toBe("B");
  });

  test("dropdown value with no matching option is absent", () => {
    expect(parseTask(rawTask([trackField(9)])).track).toBeUndefined();
    expect(parseTask(rawTask([trackField("unknown-id")])).track).toBeUndefined();
  });

  test.each([
    ["number", 4, 4],
    ["numeric string", "4", 4],
    ["decimal string", " 2.5 ", 2.5],
    ["non-numeric string", "four", undefined],
    ["empty string", "", undefined],
    ["null", null, undefined],
  ])("Critical Dimensions as %s", (_label, value, expected) => {
    const task = parseTask(rawTask([{ name: "Critical Dimensions", type: "number", value }]));
    expect(task.criticalDimensions).toBe(expected);
  });

  test("missing, null and blank fields are absent", () => {
    const task = parseTask(rawTask([
      { name: "Client Name", type: "short_text", value: "   " },
      { name: "Client Email", type: "email" },
      { name: "Company Name", type: "short_text", value: null },
    ]));
    expect(task.clientName).toBeUndefined();
    expect(task.clientEmail).toBeUndefined();
    expect(task.companyName).toBeUndefined();
    expect(task.blueprintScore).toBeUndefined();
  });

  test("a response without an id is a permanent bad response", () => {
    expect(() => parseTask({})).toThrow(PipelineError);
  });
});

describe("ClickUp HTTP client", () => {
  test("getTask sends the token header and parses the task", async () => {
    const { api, calls } = client(() => json(rawTask(fullFields)));
    const task = await api.getTask("task-1");
    expect(task.companyName).toBe("Acme Corp");
    expect(calls[0].url).toBe("https://api.clickup.com/api/v2/task/task-1");
    expect(calls[0].init.method).toBe("GET");
    expect(new Headers(calls[0].init.headers).get("Authorization")).toBe("pk_test");
  });

  test.each([429, 503])("HTTP %d is transient", async (status) => {
    const { api } = client(() => json({ err: "nope" }, status));
    expect(await caught(api.getTask("task-1"))).toMatchObject({ kind: "transient", code: `HTTP_${status}`, step: "clickup_fetch" });
  });

  test("HTTP 404 is permanent", async () => {
    const { api } = client(() => json({ err: "Task not found" }, 404));
    expect(await caught(api.getTask("missing"))).toMatchObject({ kind: "permanent", code: "HTTP_404" });
  });

  test("HTTP 401 is auth", async () => {
    const { api } = client(() => json({ err: "Token invalid" }, 401));
    expect(await caught(api.getTask("task-1"))).toMatchObject({ kind: "auth" });
  });

  test("network failure is transient and the error never carries the token", async () => {
    const { api } = client(() => {
      throw new TypeError("fetch failed");
    });
    const err = await caught(api.comment("task-1", "hello"));
    expect(err).toMatchObject({ kind: "transient", code: "NETWORK_ERROR", step: "clickup_fetch" });
    expect(err.message).not.toContain("pk_test");
  });

  test("comment and setStatus send the documented bodies", async () => {
    const { api, calls } = client(() => json({}));
    await api.comment("task-1", "Blueprint sent. Resend ID: re_1");
    await api.setStatus("task-1", "Blueprint Sent");
    expect(calls[0]).toMatchObject({ url: "https://api.clickup.com/api/v2/task/task-1/comment", init: { method: "POST" } });
    expect(JSON.parse(String(calls[0].init.body))).toEqual({ comment_text: "Blueprint sent. Resend ID: re_1", notify_all: false });
    expect(calls[1]).toMatchObject({ url: "https://api.clickup.com/api/v2/task/task-1", init: { method: "PUT" } });
    expect(JSON.parse(String(calls[1].init.body))).toEqual({ status: "Blueprint Sent" });
  });

  test("listReadyToSend follows pages until last_page and filters by status", async () => {
    const pages = [
      { tasks: [rawTask([], { id: "a" }), rawTask([], { id: "b", status: { status: "In Review" } })], last_page: false },
      { tasks: [rawTask([], { id: "c" })], last_page: false },
      { tasks: [rawTask([], { id: "d", status: { status: "ready to send" } })], last_page: true },
    ];
    const { api, calls } = client((url) => json(pages[Number(new URL(url).searchParams.get("page"))]));
    const tasks = await api.listReadyToSend();
    expect(tasks.map((t) => t.id)).toEqual(["a", "c", "d"]);
    expect(calls).toHaveLength(3);
    const first = new URL(calls[0].url);
    expect(first.pathname).toBe("/api/v2/list/list-1/task");
    expect(first.searchParams.getAll("statuses[]")).toEqual(["Ready to Send"]);
    expect(first.searchParams.get("page")).toBe("0");
  });

  test("listReadyToSend stops on an empty page", async () => {
    const { api, calls } = client(() => json({ tasks: [], last_page: false }));
    expect(await api.listReadyToSend()).toEqual([]);
    expect(calls).toHaveLength(1);
  });

  test("listReadyToSend error on a later page is classified", async () => {
    const { api } = client((url) =>
      new URL(url).searchParams.get("page") === "0" ? json({ tasks: [rawTask()], last_page: false }) : json({}, 503),
    );
    expect(await caught(api.listReadyToSend())).toMatchObject({ kind: "transient", code: "HTTP_503" });
  });
});
