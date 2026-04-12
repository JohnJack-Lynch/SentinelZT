// for permission labels, creates shorthands of the permissions
export const permShorthand = (perm) => perm.toUpperCase().slice(0, 3);

/**
    *returns the threat level of a given container
    *@param {object} container 
    *@returns {"critical"|"warning"|"normal"}
*/
export function threatLevel(container) {
    if (container.alerts.some((a) => a.level === "critical")) {
        return "critical";
    } else if (container.alerts.some((a) => a.level === "warning") || container.memory > 80 || container.cpu > 75) {
        return "warning";
    } else {
        return "normal";
    }
}

export const THREAT_LABEL = {
    critical: "CRITICAL",
    warning:  "WARNING",
    normal:  "NORMAL"
};

export const THREAT_COLOR = {
    critical: "#ff2d2d",
    warning:  "#ffaa00",
    normal:  "#00ff9f"
};

/**
 * toggles the permissions of a single role and returns a new policy object
 * @param {object} policy 
 * @param {string} role 
 * @param {string} perm 
 * @returns {object} updated policy
 */
export function togglePerm(policy, role, perm) {
    return {
        ...policy, // copies all top level fields from the policy
        updated: new Date().toISOString(), // timestamp updated
        roles: { // creates a copy of all existing roles
            ...policy.roles,
            [role]: {
                ...policy.roles[role],
                [perm]: !policy.roles[role][perm] // flips the given permission
            }
        }
    };
}

/**
 * serialize a new policy object
 * @param {object} policy 
 * @returns {string} returns the updated policy formatted for yaml
 */
export function policyToYAML(policy) {
    const rolesIterable = Object.entries(policy.roles).map(
            ([role, perms]) =>
                `  ${role}:\n` +
                Object.entries(perms).map(
                    ([k, v]) =>
                        `    ${k}: ${v}`
                ).join("\n")
        ).join("\n");
    
    return (
        `# SentinelZT\n` +
        `# Updated: ${policy.updated}\n` +
        `version: "${policy.version}"\n\n` +
        `roles:\n${rolesIterable}`
    );
}


// these give you the time formatted as hh:mm:ss
// converts the given number to pad2
export const pad2 = (n) => String(n).padStart(2, "0");

// returns time formatted
export const getTimeStringFormatted = () => {
    const d = new Date();
    return `${pad2(d.getUTCHours())}:${pad2(d.getUTCMinutes())}:${pad2(d.getUTCSeconds())}`;
};
