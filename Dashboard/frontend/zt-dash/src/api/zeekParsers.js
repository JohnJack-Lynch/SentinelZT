// ─── Zeek Log Parsers ─────────────────────────────────────────────────────────
// Zeek writes logs in TSV format with a header block at the top of each file.
// When Promtail ships them to Loki, each line arrives individually.
// Lines starting with "#" are header/comment lines — we skip those.
//
// Example conn.log line:
// 1700000000.000000  Cxyz123  10.0.1.13  54321  203.0.113.5  4444  tcp  -  -  1  100  1  80  SF  -  -  ...
//
// Field order matches Zeek's default conn.log schema.

// ─── conn.log ─────────────────────────────────────────────────────────────────

/**
 * Parse a single conn.log line into a structured object.
 * Returns null for header/comment lines.
 *
 * Key fields:
 *   ts        - unix timestamp
 *   orig_h    - source IP (the container)
 *   resp_h    - destination IP
 *   resp_p    - destination port
 *   proto     - tcp / udp / icmp
 *   orig_bytes - bytes sent
 *   resp_bytes - bytes received
 *   conn_state - connection state (SF=normal, S0=no reply, REJ=rejected etc.)
 */
export function parseConnLog(line) {
  if (line.startsWith("#")) return null;
  const f = line.split("\t");
  if (f.length < 10) return null;

  return {
    ts:         parseFloat(f[0]),
    uid:        f[1],
    orig_h:     f[2],   // source IP
    orig_p:     f[3],   // source port
    resp_h:     f[4],   // destination IP
    resp_p:     f[5],   // destination port
    proto:      f[6],
    orig_bytes: f[9]  === "-" ? 0 : parseInt(f[9],  10),
    resp_bytes: f[10] === "-" ? 0 : parseInt(f[10], 10),
    conn_state: f[11] ?? "-",
  };
}

/**
 * Parse an array of raw conn.log lines, dropping nulls.
 */
export function parseConnLogs(lines) {
  return lines.map(parseConnLog).filter(Boolean);
}

// ─── notice.log ───────────────────────────────────────────────────────────────

/**
 * Parse a single notice.log line.
 * Zeek writes to notice.log when a detection script fires an alert.
 *
 * Key fields:
 *   ts      - unix timestamp
 *   note    - the notice type, e.g. "Scan::Port_Scan"
 *   msg     - human-readable description
 *   src     - source IP
 *   dst     - destination IP
 *   actions - what Zeek did, e.g. "Notice::ACTION_LOG"
 */
export function parseNoticeLog(line) {
  if (line.startsWith("#")) return null;
  const f = line.split("\t");
  if (f.length < 11) return null;

  return {
    ts:      parseFloat(f[0]),
    note:    f[10] ?? "-",          // notice type
    msg:     f[12] ?? "-",          // human-readable message
    src:     f[3]  ?? "-",          // source IP
    dst:     f[5]  ?? "-",          // destination IP
    actions: f[20] ?? "-",
  };
}

export function parseNoticeLogs(lines) {
  return lines.map(parseNoticeLog).filter(Boolean);
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Convert a Zeek unix timestamp to a HH:MM:SS UTC string.
 */
export function zeekTsToTime(ts) {
  const d   = new Date(ts * 1000);
  const pad = (n) => String(n).padStart(2, "0");
  return `${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}:${pad(d.getUTCSeconds())}`;
}

/**
 * Format bytes into a human-readable rate string.
 * Used to populate the network rx/tx fields on container cards.
 */
export function formatBytes(bytes) {
  if (bytes >= 1_000_000) return `${(bytes / 1_000_000).toFixed(1)} MB/s`;
  if (bytes >= 1_000)     return `${(bytes / 1_000).toFixed(1)} KB/s`;
  return `${bytes} B/s`;
}

/**
 * Determine alert level from a Zeek notice type string.
 * Extend this map as you add more Zeek detection scripts.
 */
export function noticeToLevel(note) {
  const critical = [
    "Scan::Port_Scan",
    "Scan::Address_Scan",
    "ExternalC2",
    "PrivilegedMount",
    "UnknownOutbound",
    "Weird::Activity",
  ];
  return critical.some((c) => note.includes(c)) ? "critical" : "warning";
}
