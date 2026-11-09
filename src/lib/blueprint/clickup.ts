// Blueprint email automation: ClickUp API client (spec 10.4).
// Separate from src/lib/clickup.ts (pulse-check leads), which stays untouched.
// Every failure is a PipelineError; callers never see raw fetch or HTTP errors.

import { CLICKUP_API_BASE, CLICKUP_FIELDS, CLICKUP_STATUS, getBlueprintConfig } from "./config";
import { PipelineError, httpError, networkError, type FailedStep } from "./errors";

export type FetchLike = (url: string, init: RequestInit) => Promise<Response>;

/** A ClickUp task with the blueprint custom fields parsed. Missing or empty fields are absent. */
export interface BlueprintTask {
  id: string;
  url: string;
  status: string;
  /** Unix epoch milliseconds as ClickUp sends it (a string). */
  dateUpdated: string;
  clientName?: string;
  clientEmail?: string;
  companyName?: string;
  blueprintScore?: string;
  /** Dropdown option name, mapped from the stored value. */
  track?: string;
  criticalDimensions?: number;
}

export interface RawOption { id?: string; name?: string; orderindex?: number | string }
export interface RawField {
  name?: string;
  type?: string;
  type_config?: { options?: RawOption[] };
  value?: unknown;
}
export interface RawTask {
  id?: string;
  url?: string;
  status?: { status?: string };
  date_updated?: string;
  custom_fields?: RawField[];
}

const STEP: FailedStep = "clickup_fetch";
const TIMEOUT_MS = 15_000;
/** ClickUp returns at most 100 tasks per page. */
const PAGE_SIZE = 100;
/** Safety cap on list paging. */
const MAX_PAGES = 50;

const isNumeric = (s: string) => s.trim() !== "" && Number.isFinite(Number(s));

/**
 * Maps a drop_down value to its option name. The value may be the option's
 * orderindex (number or numeric string), its id, or, failing those, an array index.
 */
function dropdownName(field: RawField): string | undefined {
  const options = field.type_config?.options ?? [];
  const value = field.value;
  if (typeof value === "string") {
    const byId = options.find((o) => o.id === value);
    if (byId) return byId.name;
    if (!isNumeric(value)) return undefined;
  }
  if (typeof value !== "number" && typeof value !== "string") return undefined;
  const n = Number(value);
  const byOrder = options.find((o) => o.orderindex !== undefined && Number(o.orderindex) === n);
  return byOrder?.name ?? (Number.isInteger(n) ? options[n]?.name : undefined);
}

/** A custom field's value as trimmed text, or undefined when missing or empty. */
function fieldText(fields: RawField[], name: string): string | undefined {
  const field = fields.find((f) => f.name?.trim() === name);
  if (!field || field.value === null || field.value === undefined) return undefined;
  const raw = field.type === "drop_down" ? dropdownName(field) : field.value;
  if (typeof raw === "number") return Number.isFinite(raw) ? String(raw) : undefined;
  if (typeof raw !== "string") return undefined;
  return raw.trim() || undefined;
}

/** Number fields can arrive as strings. Unparseable values count as missing. */
function fieldNumber(fields: RawField[], name: string): number | undefined {
  const text = fieldText(fields, name);
  return text !== undefined && isNumeric(text) ? Number(text) : undefined;
}

export function parseTask(raw: RawTask): BlueprintTask {
  if (!raw.id) throw new PipelineError("permanent", "CLICKUP_BAD_RESPONSE", STEP, "Task response has no id");
  const fields = raw.custom_fields ?? [];
  return {
    id: raw.id,
    url: raw.url ?? "",
    status: raw.status?.status ?? "",
    dateUpdated: raw.date_updated ?? "",
    clientName: fieldText(fields, CLICKUP_FIELDS.clientName),
    clientEmail: fieldText(fields, CLICKUP_FIELDS.clientEmail),
    companyName: fieldText(fields, CLICKUP_FIELDS.companyName),
    blueprintScore: fieldText(fields, CLICKUP_FIELDS.blueprintScore),
    track: fieldText(fields, CLICKUP_FIELDS.track),
    criticalDimensions: fieldNumber(fields, CLICKUP_FIELDS.criticalDimensions),
  };
}

export interface ClickUpOptions {
  apiToken: string;
  listId: string;
  fetch?: FetchLike;
  baseUrl?: string;
}

export function createClickUp(opts: ClickUpOptions) {
  const doFetch: FetchLike = opts.fetch ?? ((url, init) => fetch(url, init));
  const base = opts.baseUrl ?? CLICKUP_API_BASE;

  async function request<T>(method: string, path: string, body?: unknown): Promise<T> {
    let res: Response;
    try {
      res = await doFetch(`${base}${path}`, {
        method,
        headers: { Authorization: opts.apiToken, "Content-Type": "application/json" },
        body: body === undefined ? undefined : JSON.stringify(body),
        signal: AbortSignal.timeout(TIMEOUT_MS),
      });
    } catch (err) {
      throw networkError(err, STEP);
    }
    if (!res.ok) throw httpError(res.status, STEP, undefined, `ClickUp ${method} failed with HTTP ${res.status}`);
    try {
      return (await res.json()) as T;
    } catch {
      throw new PipelineError("transient", "CLICKUP_BAD_RESPONSE", STEP, `ClickUp ${method} returned invalid JSON`);
    }
  }

  const taskPath = (taskId: string) => `/task/${encodeURIComponent(taskId)}`;

  return {
    /** GET /task/{id}, custom fields parsed by name. */
    async getTask(taskId: string): Promise<BlueprintTask> {
      return parseTask(await request<RawTask>("GET", taskPath(taskId)));
    },

    /** POST /task/{id}/comment. */
    async comment(taskId: string, text: string): Promise<void> {
      await request("POST", `${taskPath(taskId)}/comment`, { comment_text: text, notify_all: false });
    },

    /** PUT /task/{id} with the new status name. */
    async setStatus(taskId: string, statusName: string): Promise<void> {
      await request("PUT", taskPath(taskId), { status: statusName });
    },

    /** All tasks in the blueprint list with status `Ready to Send`, across every page. */
    async listReadyToSend(): Promise<BlueprintTask[]> {
      const wanted = CLICKUP_STATUS.readyToSend.toLowerCase();
      const status = encodeURIComponent(CLICKUP_STATUS.readyToSend);
      const tasks: BlueprintTask[] = [];
      for (let page = 0; page < MAX_PAGES; page++) {
        const path = `/list/${encodeURIComponent(opts.listId)}/task?statuses[]=${status}&page=${page}`;
        const data = await request<{ tasks?: RawTask[]; last_page?: boolean }>("GET", path);
        const batch = data.tasks ?? [];
        for (const raw of batch) {
          const task = parseTask(raw);
          if (task.status.toLowerCase() === wanted) tasks.push(task);
        }
        // ClickUp sends `last_page`; if it is ever missing, a short page means the end.
        const lastPage = data.last_page ?? batch.length < PAGE_SIZE;
        if (lastPage || batch.length === 0) break;
      }
      return tasks;
    },
  };
}

export type ClickUpClient = ReturnType<typeof createClickUp>;

let defaultClient: ClickUpClient | null = null;

/** Default client from config. Holds no task data, so reuse across runs is safe. */
export function getClickUp(): ClickUpClient {
  if (!defaultClient) {
    const { apiToken, blueprintListId } = getBlueprintConfig().clickup;
    defaultClient = createClickUp({ apiToken, listId: blueprintListId });
  }
  return defaultClient;
}
