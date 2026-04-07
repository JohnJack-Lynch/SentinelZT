import "./css/AuditLog.css";

export default function AuditLog({entries}) {
    return (
        <div className="log-body">
            <h3 className="section-label">Zeek Logs</h3>

            <div>
                {entries.map((entry, i) => (
                    <div key={i} className={`audit-row${i % 2 === 0 ? " audit-row--even" : ""}`}>
                        <span className="audit-row__time">{entry.time}</span>
                        <span className="audit-row__actor">{entry.actor}</span>

                        <span className="audit-action-badge">{entry.action}</span>

                        <span className="audit-row__target">{entry.target}</span>
                        <span className="audit-row__msg">{entry.msg}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}