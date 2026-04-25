// ─── API Client (Loki implementation) ────────────────────────────────────────
//
// fetchContainers and fetchAuditLog query Loki directly.
// fetchPolicy / savePolicy use local state (Loki is read-only).
// isolateContainer / restartContainer are stubs — need the small backend API.
// ─────────────────────────────────────────────────────────────────────────────

import { LOKI_CONFIG } from "./lokiConfig";
import { queryZeekLog } from "./lokiQuery";
import { parseConnLogs, parseNoticeLogs, zeekTsToTime, formatBytes, noticeToLevel } from "./zeekParsers";
import { INIT_POLICY } from "../data/initialPolicy";
import { getTimeStringFormatted } from "../util/util";

// ─── Local policy state ───────────────────────────────────────────────────────
// Policy lives on the frontend until the backend API is in place.
// savePolicy updates this in memory; changes are lost on page refresh.
let _policy   = { ...INIT_POLICY };
let _auditLog = [];

function _logAudit(actor, action, target, msg) {
  _auditLog = [{ time: getTimeStringFormatted(), actor, action, target, msg }, ..._auditLog];
}

// ─────────────────────────────────────────────────────────────────────────────


/**
 * fetchContainers
 *
 * Queries Loki for recent Zeek conn.log entries, groups them by source IP,
 * and maps each IP to a container using LOKI_CONFIG.containerMap.
 *
 * Containers in containerMap that had no recent traffic are included as
 * "running" with zero stats — Zeek only sees active connections.
 */
export async function fetchContainers() {
  // Fetch conn.log and notice.log in parallel
  const [connLines, noticeLines] = await Promise.all([
    queryZeekLog("conn"),
    queryZeekLog("notice"),
  ]);

  const connLogs   = parseConnLogs(connLines);
  const noticeLogs = parseNoticeLogs(noticeLines);

  // Group connections by source IP
  const byIp = {};
  for (const conn of connLogs) {
    const ip = conn.orig_h;
    if (!byIp[ip]) byIp[ip] = [];
    byIp[ip].push(conn);
  }

  // Group notices by source IP
  const noticesByIp = {};
  for (const notice of noticeLogs) {
    const ip = notice.src;
    if (!noticesByIp[ip]) noticesByIp[ip] = [];
    noticesByIp[ip].push(notice);
  }

  // Build a container object for each entry in containerMap
  return Object.entries(LOKI_CONFIG.containerMap).map(([ip, meta]) => {
    const conns   = byIp[ip]       ?? [];
    const notices = noticesByIp[ip] ?? [];

    // Derive rx/tx from bytes across all connections in the window
    const rxBytes = conns.reduce((n, c) => n + c.resp_bytes, 0);
    const txBytes = conns.reduce((n, c) => n + c.orig_bytes, 0);

    // Recent commands aren't available from network logs alone —
    // this would need a separate Zeek script or syslog source.
    // Leaving as empty array; fill in once you have that data.
    const recentCmds = [];

    // Shape notices into the alert format the dashboard expects
    const alerts = notices.map((n) => ({
      level: noticeToLevel(n.note),
      msg:   n.msg,
      time:  zeekTsToTime(n.ts),
    }));

    // Estimate memory/cpu — Zeek doesn't provide these.
    // High connection volume or large byte counts are used as a proxy.
    // Replace with real metrics once you have a metrics source.
    const connCount = conns.length;
    const cpu    = Math.min(Math.round(connCount * 2), 100);
    const memory = Math.min(Math.round((rxBytes + txBytes) / 10_000), 100);

    return {
      id:      meta.id,
      name:    meta.name,
      role:    meta.role,
      image:   meta.image,
      ip,
      status:  conns.length > 0 ? "running" : "running", // Zeek can't tell us if a container is stopped
      uptime:  "—",                                       // not available from Zeek
      cpu,
      memory,
      network: {
        rx: formatBytes(rxBytes),
        tx: formatBytes(txBytes),
      },
      recentCmds,
      alerts,
    };
  });
}


/**
 * fetchPolicy
 *
 * Returns the in-memory policy. Loki is read-only so policy state
 * lives on the frontend until the backend API is available.
 */
export async function fetchPolicy() {
  return structuredClone(_policy);
}


/**
 * savePolicy
 *
 * Updates in-memory policy. Changes are lost on page refresh.
 * When the backend API is ready, replace this with a PUT request.
 *
 * TODO:
 *   const res = await fetch("/api/policy", {
 *     method:  "PUT",
 *     headers: { "Content-Type": "application/json" },
 *     body:    JSON.stringify(updatedPolicy),
 *   });
 *   return res.json();
 */
export async function savePolicy(updatedPolicy) {
  _policy = { ...updatedPolicy, updated: new Date().toISOString() };
  _logAudit("CYBER_OFFICER", "POLICY", "ROLE_MATRIX", "Policy updated via dashboard");
  return structuredClone(_policy);
}


/**
 * isolateContainer
 *
 * Not possible via Loki — needs the backend API to disconnect the container
 * from Docker networks. Logs a warning for now.
 *
 * TODO:
 *   const res = await fetch(`/api/containers/${id}/isolate`, { method: "POST" });
 *   return res.json();
 */
export async function isolateContainer(id) {
  console.warn(
    `isolateContainer("${id}") called — backend API required to action this. ` +
    `Loki is read-only and cannot control Docker.`
  );
  _logAudit("SYSTEM", "ISOLATE", id, "⚠ Isolation requested — backend API not yet connected");
  return { ok: false, reason: "Backend API required" };
}


/**
 * restartContainer
 *
 * Not possible via Loki — needs the backend API.
 *
 * TODO:
 *   const res = await fetch(`/api/containers/${id}/restart`, { method: "POST" });
 *   return res.json();
 */
export async function restartContainer(id) {
  console.warn(
    `restartContainer("${id}") called — backend API required to action this.`
  );
  _logAudit("SYSTEM", "RESTART", id, "⚠ Restart requested — backend API not yet connected");
  return { ok: false, reason: "Backend API required" };
}


/**
 * fetchAuditLog
 *
 * Merges two sources:
 *   1. Zeek notice.log entries from Loki (real threat detections)
 *   2. In-memory entries from user actions in this session (policy changes etc.)
 *
 * Sorted newest first.
 */
export async function fetchAuditLog() {
  const noticeLines = await queryZeekLog("notice");
  const noticeLogs  = parseNoticeLogs(noticeLines);

  const lokiEntries = noticeLogs.map((n) => ({
    time:   zeekTsToTime(n.ts),
    actor:  "ZEEK",
    action: "ALERT",
    target: n.src,
    msg:    n.msg,
  }));

  // Merge Loki entries with local session entries, newest first
  return [..._auditLog, ...lokiEntries].sort((a, b) =>
    b.time.localeCompare(a.time)
  );
}
