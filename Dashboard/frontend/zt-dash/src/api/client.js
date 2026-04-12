// ─── API Client ───────────────────────────────────────────────────────────────
//
// This is the ONLY file that talks to the backend.
// When you know what your backend looks like, fill in each function below.
//
// Each function must:
//   - return a Promise
//   - resolve with the data shape described in its comment
//   - throw an Error if the request fails (the UI handles it)
//
// Currently each function runs against mock data so the dashboard works
// while the backend is being built. Replace the mock body with your real
// fetch/axios/etc. call when you're ready.
// ─────────────────────────────────────────────────────────────────────────────

import { MOCK_CONTAINERS, AUDIT_SEED } from "../data/mockData.js";
import { INIT_POLICY } from "../data/initialPolicy.js";
import { getTimeStringFormatted } from "../util/util.js";

// ─── Local mock state (delete once backend is wired) ─────────────────────────
let _containers = MOCK_CONTAINERS.map((c) => ({ ...c }));
let _policy     = { ...INIT_POLICY };
let _auditLog   = [...AUDIT_SEED];

function _logAudit(actor, action, target, msg) {
  _auditLog = [{ time: getTimeStringFormatted(), actor, action, target, msg }, ..._auditLog];
}

function _tickStats() {
  _containers = _containers.map((c) =>
    c.status !== "running" ? c : {
      ...c,
      cpu:    Math.max(0, Math.min(100, c.cpu    + ((Math.random() * 6  - 3)   | 0))),
      memory: Math.max(0, Math.min(100, c.memory + ((Math.random() * 4  - 1.5) | 0))),
    }
  );
}
// ─────────────────────────────────────────────────────────────────────────────


/**
 * fetchContainers
 *
 * Returns a list of all containers (running and stopped).
 *
 * Expected return shape — array of objects:
 * [
 *   {
 *     id:         string,   // short container ID, e.g. "ctr-eng-01"
 *     name:       string,   // container name, e.g. "engine-monitor-charlie"
 *     status:     string,   // "running" | "stopped" | "exited"
 *     image:      string,   // image name + tag, e.g. "eng-mon:3.1.0"
 *     ip:         string,   // container IP, e.g. "10.0.1.13"
 *     role:       string,   // one of the roles defined in policy.yaml
 *     uptime:     string,   // human-readable, e.g. "6h 10m"
 *     cpu:        number,   // 0–100 (percentage)
 *     memory:     number,   // 0–100 (percentage)
 *     network: {
 *       rx:       string,   // e.g. "1.2 MB/s"
 *       tx:       string,   // e.g. "0.4 MB/s"
 *     },
 *     recentCmds: string[], // last N commands run inside the container
 *     alerts: [             // active threat events for this container
 *       {
 *         level:  string,   // "critical" | "warning"
 *         msg:    string,   // human-readable description
 *         time:   string,   // "HH:MM:SS"
 *       }
 *     ],
 *   }
 * ]
 *
 * TODO: replace mock body with your backend call, e.g.:
 *   const res = await fetch("/api/containers");
 *   if (!res.ok) throw new Error(await res.text());
 *   return res.json();
 */
export async function fetchContainers() {
  //_tickStats();
  return structuredClone(_containers);
}


/**
 * fetchPolicy
 *
 * Returns the current role-based permission policy.
 *
 * Expected return shape:
 * {
 *   version: string,       // e.g. "1.0.0"
 *   updated: string,       // ISO 8601 timestamp
 *   roles: {
 *     [roleName]: {
 *       network:    boolean,
 *       exec:       boolean,
 *       read:       boolean,
 *       write:      boolean,
 *       privileged: boolean,
 *     }
 *   }
 * }
 *
 * TODO: replace mock body with your backend call, e.g.:
 *   const res = await fetch("/api/policy");
 *   if (!res.ok) throw new Error(await res.text());
 *   return res.json();
 */
export async function fetchPolicy() {
  return structuredClone(_policy);
}


/**
 * savePolicy
 *
 * Sends an updated policy object to the backend to be persisted.
 * Receives the full updated policy object and returns the saved version.
 *
 * @param {object} updatedPolicy — same shape as fetchPolicy return value
 * @returns {object} — the saved policy (may include server-updated `updated` timestamp)
 *
 * TODO: replace mock body with your backend call, e.g.:
 *   const res = await fetch("/api/policy", {
 *     method:  "PUT",
 *     headers: { "Content-Type": "application/json" },
 *     body:    JSON.stringify(updatedPolicy),
 *   });
 *   if (!res.ok) throw new Error(await res.text());
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
 * Tells the backend to cut off all network access for a container.
 * The backend should disconnect the container from every Docker network.
 *
 * @param {string} id — container ID
 * @returns {{ ok: boolean }}
 *
 * TODO: replace mock body with your backend call, e.g.:
 *   const res = await fetch(`/api/containers/${id}/isolate`, { method: "POST" });
 *   if (!res.ok) throw new Error(await res.text());
 *   return res.json();
 */
export async function isolateContainer(id) {
  _containers = _containers.map((c) =>
    c.id === id ? { ...c, status: "exited", cpu: 0, memory: 0 } : c
  );
  _logAudit("CYBER_OFFICER", "ISOLATE", id, "Container disconnected from all networks");
  return { ok: true };
}


/**
 * restartContainer
 *
 * Tells the backend to force-restart a container.
 *
 * @param {string} id — container ID
 * @returns {{ ok: boolean }}
 *
 * TODO: replace mock body with your backend call, e.g.:
 *   const res = await fetch(`/api/containers/${id}/restart`, { method: "POST" });
 *   if (!res.ok) throw new Error(await res.text());
 *   return res.json();
 */
export async function restartContainer(id) {
  _containers = _containers.map((c) =>
    c.id === id ? { ...c, status: "running", cpu: 2, memory: 10 } : c
  );
  _logAudit("CYBER_OFFICER", "RESTART", id, "Container force-restarted");
  return { ok: true };
}


/**
 * fetchAuditLog
 *
 * Returns the full audit log, newest entry first.
 *
 * Expected return shape — array of objects:
 * [
 *   {
 *     time:   string,  // "HH:MM:SS"
 *     actor:  string,  // who triggered the event, e.g. "CYBER_OFFICER" or "SYSTEM"
 *     action: string,  // event type: "ALERT" | "POLICY" | "ISOLATE" | "RESTART" | "START" | "STOP" | "AUTH" | "INSPECT"
 *     target: string,  // what was acted on, e.g. a container ID or role name
 *     msg:    string,  // human-readable description
 *   }
 * ]
 *
 * TODO: replace mock body with your backend call, e.g.:
 *   const res = await fetch("/api/audit");
 *   if (!res.ok) throw new Error(await res.text());
 *   return res.json();
 */
export async function fetchAuditLog() {
  return structuredClone(_auditLog);
}
