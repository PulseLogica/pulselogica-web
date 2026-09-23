type LogLevel = "info" | "warn" | "error";
type LogContext = Record<string, unknown>;

function serializeError(err: unknown) {
  if (err instanceof Error) {
    return { message: err.message, stack: err.stack };
  }
  return { message: String(err) };
}

export function log(level: LogLevel, event: string, context: LogContext = {}) {
  const entry = {
    level,
    event,
    ...context,
    timestamp: new Date().toISOString(),
  };

  const line = JSON.stringify(entry);

  if (level === "error") {
    console.error(line);
  } else if (level === "warn") {
    console.warn(line);
  } else {
    console.log(line);
  }
}

export function logInfo(event: string, context?: LogContext) {
  log("info", event, context);
}

export function logWarn(event: string, context?: LogContext) {
  log("warn", event, context);
}

export function logError(event: string, context?: LogContext, err?: unknown) {
  log("error", event, err !== undefined ? { ...context, error: serializeError(err) } : context);
}
