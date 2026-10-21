/**
 * Operational Logger with Automatic Sensitive Redaction
 * Stage 21: Deployment, environments and operations
 */

export type LogLevel = "debug" | "info" | "warn" | "error";
export type LogCategory = "auth" | "upload" | "drafts" | "export" | "storage" | "system";

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  category: LogCategory;
  message: string;
  metadata?: Record<string, unknown>;
  error?: {
    name?: string;
    message: string;
    code?: string | number;
    stack?: string;
  };
}

const SENSITIVE_KEY_PATTERNS = [
  /password/i,
  /secret/i,
  /token/i,
  /cookie/i,
  /authorization/i,
  /database_url/i,
  /direct_url/i,
  /service_role/i,
  /api[_-]?key/i,
  /private[_-]?key/i,
  /postgres(?:ql)?:\/\//i,
  /mysql:\/\//i,
  /mongodb(?:\+srv)?:\/\//i,
];

/**
 * Recursively sanitizes metadata by replacing sensitive keys and values with '[REDACTED]'.
 */
export function sanitizeLogData(data: unknown, depth = 0): unknown {
  if (depth > 6) return "[MAX_DEPTH]";
  if (data === null || data === undefined) return data;

  if (typeof data === "string" || typeof data === "number" || typeof data === "boolean") {
    return data;
  }

  if (Buffer.isBuffer(data)) {
    return `[Binary Buffer: ${data.length} bytes]`;
  }

  if (Array.isArray(data)) {
    return data.map((item) => sanitizeLogData(item, depth + 1));
  }

  if (typeof data === "object") {
    const sanitizedObj: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(data as Record<string, unknown>)) {
      const isSensitiveKey = SENSITIVE_KEY_PATTERNS.some((pattern) => pattern.test(key));
      if (isSensitiveKey) {
        sanitizedObj[key] = "[REDACTED]";
      } else {
        sanitizedObj[key] = sanitizeLogData(value, depth + 1);
      }
    }
    return sanitizedObj;
  }

  return String(data);
}

/**
 * Format error object safely without leaking connection strings or credentials.
 */
export function formatErrorForLog(err: unknown): LogEntry["error"] {
  if (!err) return undefined;

  if (err instanceof Error) {
    const isProd = process.env.NODE_ENV === "production";
    const sanitizedMessage = SENSITIVE_KEY_PATTERNS.some((p) => p.test(err.message))
      ? "[REDACTED ERROR MESSAGE]"
      : err.message;

    return {
      name: err.name,
      message: sanitizedMessage,
      code: (err as { code?: string | number }).code,
      stack: isProd ? undefined : err.stack,
    };
  }

  return {
    message: typeof err === "string" ? err : JSON.stringify(sanitizeLogData(err)),
  };
}

const LOG_LEVEL_ORDER: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

function getMinLogLevel(): number {
  const envLevel = (process.env.LOG_LEVEL || "info").toLowerCase() as LogLevel;
  return LOG_LEVEL_ORDER[envLevel] ?? LOG_LEVEL_ORDER.info;
}

function writeLog(entry: LogEntry): void {
  const minLevel = getMinLogLevel();
  if (LOG_LEVEL_ORDER[entry.level] < minLevel) {
    return;
  }

  const jsonLine = JSON.stringify(entry);

  switch (entry.level) {
    case "error":
      console.error(jsonLine);
      break;
    case "warn":
      console.warn(jsonLine);
      break;
    case "info":
    case "debug":
    default:
      console.log(jsonLine);
      break;
  }
}

export const logger = {
  info(category: LogCategory, message: string, metadata?: Record<string, unknown>): void {
    writeLog({
      timestamp: new Date().toISOString(),
      level: "info",
      category,
      message,
      metadata: metadata ? (sanitizeLogData(metadata) as Record<string, unknown>) : undefined,
    });
  },

  warn(category: LogCategory, message: string, metadata?: Record<string, unknown>): void {
    writeLog({
      timestamp: new Date().toISOString(),
      level: "warn",
      category,
      message,
      metadata: metadata ? (sanitizeLogData(metadata) as Record<string, unknown>) : undefined,
    });
  },

  error(category: LogCategory, message: string, err?: unknown, metadata?: Record<string, unknown>): void {
    writeLog({
      timestamp: new Date().toISOString(),
      level: "error",
      category,
      message,
      error: formatErrorForLog(err),
      metadata: metadata ? (sanitizeLogData(metadata) as Record<string, unknown>) : undefined,
    });
  },

  debug(category: LogCategory, message: string, metadata?: Record<string, unknown>): void {
    writeLog({
      timestamp: new Date().toISOString(),
      level: "debug",
      category,
      message,
      metadata: metadata ? (sanitizeLogData(metadata) as Record<string, unknown>) : undefined,
    });
  },
};
