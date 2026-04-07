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