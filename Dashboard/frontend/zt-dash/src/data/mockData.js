export const ROLES = [
    "CYBER_OFFICER",
    "TEST"
];

export const MOCK_CONTAINERS = [
    {
    id: "ctr-tac-01",
    name: "tactical-proxy-alpha",
    role: "TEST",
    status: "running",
    image: "nav-tactical:2.4.1",
    uptime: "14h 22m",
    cpu: 23,
    memory: 61,
    network: { rx: "1.2 MB/s", tx: "0.4 MB/s" },
    recentCmds: ["curl internal-tac-api/status", "cat /etc/hosts"],
    alerts: [],
    ip: "10.0.1.11",
    },
    
    {
    id: "ctr-tac-02",
    name: "tactical-proxy-alpha",
    role: "TEST",
    status: "running",
    image: "nav-tactical:2.4.1",
    uptime: "14h 22m",
    cpu: 23,
    memory: 61,
    network: { rx: "1.2 MB/s", tx: "0.4 MB/s" },
    recentCmds: ["curl internal-tac-api/status", "cat /etc/hosts"],
    alerts: [],
    ip: "10.0.1.11",
    }
]

export const AUDIT_SEED = [
    { time: "02:14:07", actor: "SYSTEM",         action: "ALERT",   target: "ctr-eng-01",    msg: "Privileged mount attempt detected" },
    { time: "02:13:55", actor: "SYSTEM",         action: "ALERT",   target: "ctr-eng-01",    msg: "Memory threshold exceeded (88%)" },
    { time: "02:12:33", actor: "SYSTEM",         action: "ALERT",   target: "ctr-eng-01",    msg: "Outbound connection: 203.0.113.5:4444" },
    { time: "02:10:01", actor: "cyber-ops-echo", action: "INSPECT", target: "ctr-eng-01",    msg: "Container inspection initiated" },
    { time: "02:08:44", actor: "SYSTEM",         action: "POLICY",  target: "ENGINEER",      msg: "Policy applied to role" },
    { time: "01:55:22", actor: "cyber-ops-echo", action: "AUTH",    target: "CYBER_OFFICER", msg: "Session authenticated" },
    { time: "01:50:00", actor: "SYSTEM",         action: "START",   target: "ctr-tac-01",    msg: "Container started" },
    { time: "01:50:00", actor: "SYSTEM",         action: "START",   target: "ctr-nav-01",    msg: "Container started" },
    { time: "01:50:00", actor: "SYSTEM",         action: "START",   target: "ctr-eng-01",    msg: "Container started" },
    { time: "01:50:00", actor: "SYSTEM",         action: "START",   target: "ctr-cyber-01",  msg: "Container started" },
];
