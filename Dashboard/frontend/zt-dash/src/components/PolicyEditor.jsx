import { togglePerm, policyToYAML } from "../util/util";
import "./css/PolicyEditor.css";

const PERM_COLUMNS = ["network", "exec", "read", "write", "privileged"];

export default function PolicyEditor({policy, onPolicyChange, currentUserRole}) {
    const canEdit = currentUserRole === "CYBER_OFFICER";

    const handleToggle = (role, perm) => {
        if (!canEdit) {
            return;
        }

        onPolicyChange(togglePerm(policy, role, perm));
    }

    return (
        <div className="pol-edit">
            <div>
                <h3 className="section-label">Policy Editor</h3>

                {!canEdit && (
                    <div className="readonly-warning">! READ-ONLY — CYBER OFFICER ROLE REQUIRED TO MODIFY !</div>
                )}

                <div style={{ overflowX: "auto" }}>
                    <table className="policy-table">
                        <thead>
                            <tr>
                                <th>Role</th>
                                {PERM_COLUMNS.map((p) => (
                                    <th key={p}>{p.toUpperCase().slice(0, 4)}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {Object.entries(policy.roles).map(([role, perms]) => (
                                <tr key={role}>
                                    <td className="policy-table__role">{role}</td>
                                    {PERM_COLUMNS.map((perm) => (
                                        <td key={perm} className="policy-table__cell">
                                            <button className={`perm-matrix-btn perm-matrix-btn--${perms[perm] ? "allow" : "deny"}`} onClick={() => handleToggle(role, perm)} disabled={!canEdit} title={`${role} / ${perm}: ${perms[perm] ? "ALLOW" : "DENY"}`}>
                                                {perms[perm] ? "Y" : "N"}
                                            </button>
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="yaml-container">
                <h3 className="section-label">.yaml Preview</h3>
                <pre className="yaml-preview">{policyToYAML(policy)}</pre>
            </div>
        </div>
    );

}