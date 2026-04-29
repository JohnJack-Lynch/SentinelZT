import { LOKI_CONFIG } from './lokiConfig.js';

const LOKI_BASE = "/loki";

// ─── Loki HTTP API ────────────────────────────────────────────────────────────
// Loki exposes two relevant endpoints:
//
//   GET /loki/api/v1/query_range   — query logs over a time range (what we use)
//   GET /loki/api/v1/query        — instant query (single point in time)
//
// Docs: https://grafana.com/docs/loki/latest/reference/api/

/**
 * Run a LogQL query against Loki and return raw log lines.
 *
 * @param {string} logql     - LogQL query string, e.g. '{job="zeek"} |= "conn"'
 * @param {number} [limit]   - max number of log lines to return (default 500)
 * @returns {string[]}       - array of raw log line strings, newest first
 */
export async function queryLoki(logql, limit = 500) {
  const now = Date.now() * 1_000_000; // nanoseconds
  const start = now - LOKI_CONFIG.lookbackNs;

  const params = new URLSearchParams({
    query:     logql,
    start:     String(start),
    end:       String(now),
    limit:     String(limit),
    direction: "backward", // newest first
  });

  const res = await fetch(
    `${LOKI_BASE}/loki/api/v1/query_range?${params}`,
    {
      headers: {
        "Content-Type": "application/json",
        // If your Loki instance requires authentication, add it here:
        // "Authorization": `Bearer ${import.meta.env.VITE_LOKI_TOKEN}`,
      },
    }
  );

  if (!res.ok) {
    throw new Error(`Loki query failed (${res.status}): ${await res.text()}`);
  }

  const body = await res.json();

  // Loki response shape:
  // {
  //   data: {
  //     result: [
  //       {
  //         stream: { job: "zeek", ... },   // labels
  //         values: [
  //           ["<nanosecond timestamp>", "<log line>"],
  //           ...
  //         ]
  //       }
  //     ]
  //   }
  // }

  return body.data.result.flatMap((stream) =>
    stream.values.map(([, line]) => line)
  );
}

/**
 * Convenience wrapper — query for a specific Zeek log type.
 *
 * Zeek writes one log type per file (conn.log, dns.log, notice.log etc.).
 * Promtail labels each file with a `log_type` label when shipping to Loki.
 *
 * @param {string} logType  - e.g. "conn", "notice", "dns", "http"
 * @param {string} [filter] - optional extra filter string, e.g. '|= "10.0.1.13"'
 * @param {number} [limit]
 */
export async function queryZeekLog(logType, filter = "", limit = 500) {
  const logql = `{job="${LOKI_CONFIG.zeekJob}",log_type="${logType}"} ${filter}`.trim();
  return queryLoki(logql, limit);
}
