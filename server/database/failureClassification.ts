export type DatabaseFailureCode =
  | "CONNECTION_TIMEOUT"
  | "CONNECTION_REFUSED"
  | "CONNECTION_RESET"
  | "DNS_TEMPORARY"
  | "DATABASE_STARTING"
  | "TOO_MANY_CONNECTIONS"
  | "QUERY_TIMEOUT"
  | "LOCK_TIMEOUT"
  | "AUTH_FAILED"
  | "PERMISSION_DENIED"
  | "INVALID_DATABASE"
  | "TLS_ERROR"
  | "UNKNOWN";

export type DatabaseFailureDiagnostic = {
  code: DatabaseFailureCode;
  retryable: boolean;
};

const transientCodes: Readonly<Record<string, DatabaseFailureCode>> = {
  ETIMEDOUT: "CONNECTION_TIMEOUT",
  ECONNREFUSED: "CONNECTION_REFUSED",
  ECONNRESET: "CONNECTION_RESET",
  EPIPE: "CONNECTION_RESET",
  EAI_AGAIN: "DNS_TEMPORARY",
  "08006": "CONNECTION_RESET",
  "57P01": "DATABASE_STARTING",
  "57P02": "DATABASE_STARTING",
  "57P03": "DATABASE_STARTING",
  "53300": "TOO_MANY_CONNECTIONS",
  "55P03": "LOCK_TIMEOUT",
};

const permanentCodes: Readonly<Record<string, DatabaseFailureCode>> = {
  "28P01": "AUTH_FAILED",
  "28000": "AUTH_FAILED",
  "42501": "PERMISSION_DENIED",
  "3D000": "INVALID_DATABASE",
  CERT_HAS_EXPIRED: "TLS_ERROR",
  CERT_NOT_YET_VALID: "TLS_ERROR",
  DEPTH_ZERO_SELF_SIGNED_CERT: "TLS_ERROR",
  SELF_SIGNED_CERT_IN_CHAIN: "TLS_ERROR",
  UNABLE_TO_VERIFY_LEAF_SIGNATURE: "TLS_ERROR",
  UNABLE_TO_GET_ISSUER_CERT: "TLS_ERROR",
  UNABLE_TO_GET_ISSUER_CERT_LOCALLY: "TLS_ERROR",
  ERR_TLS_CERT_ALTNAME_INVALID: "TLS_ERROR",
  ERR_SSL_WRONG_VERSION_NUMBER: "TLS_ERROR",
};

function errorChain(error: unknown): object[] {
  const chain: object[] = [];
  const visited = new Set<object>();
  let current = error;

  while (current && typeof current === "object" && chain.length < 6 && !visited.has(current)) {
    visited.add(current);
    chain.push(current);
    current = "cause" in current ? current.cause : undefined;
  }

  return chain;
}

/**
 * Classifies pg errors, including errors wrapped by Drizzle, without returning
 * driver messages, SQL, connection strings or other provider details.
 */
export function classifyDatabaseFailure(
  error: unknown,
  operation: "connect" | "query" = "query",
): DatabaseFailureDiagnostic {
  const chain = errorChain(error);
  let hasUnknownStructuredCode = false;

  for (const candidate of chain) {
    const code = "code" in candidate && typeof candidate.code === "string"
      ? candidate.code
      : undefined;
    if (!code) continue;
    if (Object.hasOwn(permanentCodes, code)) {
      return { code: permanentCodes[code], retryable: false };
    }
    if (Object.hasOwn(transientCodes, code)) {
      return { code: transientCodes[code], retryable: true };
    }
    if (code === "57014") {
      const message = candidate instanceof Error ? candidate.message : undefined;
      return message === "canceling statement due to statement timeout"
        ? { code: "QUERY_TIMEOUT", retryable: true }
        : { code: "UNKNOWN", retryable: false };
    }
    hasUnknownStructuredCode = true;
  }

  // Structured but unknown driver codes must not be reclassified from text.
  if (hasUnknownStructuredCode) return { code: "UNKNOWN", retryable: false };

  for (const candidate of chain) {
    const message = candidate instanceof Error ? candidate.message : undefined;
    if (message === "Connection terminated unexpectedly") {
      return { code: "CONNECTION_RESET", retryable: true };
    }
    if (message === "Connection terminated due to connection timeout"
      || message === "timeout exceeded when trying to connect"
      || (operation === "connect" && message === "timeout expired")) {
      return { code: "CONNECTION_TIMEOUT", retryable: true };
    }
    if (message === "Query read timeout") {
      return { code: "QUERY_TIMEOUT", retryable: true };
    }
  }

  return { code: "UNKNOWN", retryable: false };
}
