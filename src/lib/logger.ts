type LogLevel = "debug" | "info" | "warn" | "error";

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: Record<string, unknown>;
  service: string;
}

interface LoggerOptions {
  service?: string;
}

const isProduction = process.env.NODE_ENV === "production";

const levelPriority: Record<LogLevel, number> = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40,
};

const minimumLevel: LogLevel = isProduction ? "info" : "debug";

type ConsoleMethod = (message?: unknown, ...optionalParams: unknown[]) => void;

function resolveConsoleMethod(level: LogLevel): ConsoleMethod {
  switch (level) {
    case "error":
      return console.error.bind(console);
    case "warn":
      return console.warn.bind(console);
    case "debug":
      return console.debug.bind(console);
    default:
      return console.log.bind(console);
  }
}

function serializeJson(entry: LogEntry): string {
  return JSON.stringify(entry);
}

function formatDev(entry: LogEntry): string {
  const parts = [
    entry.timestamp,
    `[${entry.level.toUpperCase()}]`,
    entry.service ? `[${entry.service}]` : null,
    entry.message,
  ].filter(Boolean);
  let line = parts.join(" ");
  if (entry.context && Object.keys(entry.context).length > 0) {
    line += ` ${JSON.stringify(entry.context)}`;
  }
  return line;
}

function normalizeError(error: unknown): Record<string, unknown> | null {
  if (error === undefined || error === null) {
    return null;
  }
  if (error instanceof Error) {
    return {
      name: error.name,
      message: error.message,
      ...(error.stack ? { stack: error.stack } : {}),
    };
  }
  return { value: String(error) };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value) &&
    !(value instanceof Error)
  );
}

export class Logger {
  private readonly service: string;

  constructor(options: LoggerOptions = {}) {
    this.service = options.service ?? "eduguard";
  }

  info(message: string, context?: Record<string, unknown>): void {
    this.write("info", message, context);
  }

  warn(message: string, context?: Record<string, unknown>): void {
    this.write("warn", message, context);
  }

  debug(message: string, context?: Record<string, unknown>): void {
    this.write("debug", message, context);
  }

  error(
    message: string,
    errorOrContext?: Error | unknown,
    context?: Record<string, unknown>
  ): void {
    const normalized = normalizeError(errorOrContext);
    const extra =
      context ?? (isRecord(errorOrContext) ? errorOrContext : undefined);
    const mergedContext: Record<string, unknown> = {
      ...(extra ?? {}),
      ...(normalized ?? {}),
    };
    const hasContext = Object.keys(mergedContext).length > 0;
    this.write("error", message, hasContext ? mergedContext : undefined);
  }

  private write(
    level: LogLevel,
    message: string,
    context?: Record<string, unknown>
  ): void {
    if (levelPriority[level] < levelPriority[minimumLevel]) {
      return;
    }
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      ...(context ? { context } : {}),
      service: this.service,
    };
    const output = isProduction ? serializeJson(entry) : formatDev(entry);
    resolveConsoleMethod(level)(output);
  }
}

export const logger = new Logger();

export function createLogger(service: string): Logger {
  return new Logger({ service });
}
