import { useState } from "react";
import { threatLevel, togglePerm } from "../util/util";
import "./css/DetailsPanel.css";

export default function DetailsPanel({container: c, policy, onPolicyChange, onClose}) {
    const threat = threatLevel(c);

    const [isolating, setIsolating] = useState(false);
    const [isolated, setIsolated] = useState(false);

    const handleTogglePerm = (perm) => {
        onPolicyChange(togglePerm(policy, c.role, perm));
    };

    const handleContIsolate = () => {
        setIsolating(true);
        setTimeout(() => {setIsolating(false); setIsolated(true);}, 1800);
    };

    return (
        <div className="detail">
            <div className="detail-head">
                <div>
                    <div className="detail-n">{c.name}</div>
                    <div className="detail-id">{c.id} ... Uptime: {c.uptime}</div>
                </div>
                <button className="detail-close-butt" onClick={onClose}>CLOSE</button>
            </div>
            
            <div className="detail-body">
                <div className="stats">
                    <div className="metric-label">CPU ... {c.cpu}%</div>
                    <div className="metric-label">MEM ... {c.memory}%</div>

                    <div className="detail-net">
                        <div className="detail-net-label">Network</div>
                        <div className="detail-net-rx">{c.network.rx}</div>
                        <div className="detail-net-tx">{c.network.tx}</div>
                    </div>
                </div>
                
                {c.alerts.length > 0 && (
                    <section>
                        <div className="section-label">Threat Events</div>
                        {c.alerts.map((alert, i) => (
                            <div key={i} className={`alert-item alert-item--${alert.level}`}>
                                <span className={`alert-item__time alert-item__time--${alert.level}`}>{alert.time}</span>
                                <span className={`alert-item__msg alert-item__msg--${alert.level}`}>{alert.msg}</span>
                            </div>
                        ))}
                    </section>
                )}

                <section>
                    <div className="section-label">Recent Commands</div>
                        {c.recentCmds.length === 0 ? (<div className="cmd-empty">No activity.</div>) : (
                            c.recentCmds.map((cmd, i) => (
                                <div key={i} className="cmd-line"><span className="cmd-line__prompt">$ </span>{cmd}</div>
                        ))
                    )}
                </section>

                <section>
                    <div className="section-label">Role Permissions ... [{c.role}]</div>

                    {/* 
                    {!canEdit && (
                        <div className="readonly-warning">! READ-ONLY — CYBER OFFICER ROLE REQUIRED TO MODIFY !</div>
                    )}
                    */}
                    <div className="perm-grid">
                        {Object.entries(policy.roles[c.role] || {}).map(([perm, allowed]) => (
                            <button key={perm} onClick={() => handleTogglePerm(perm)} className={`perm-toggle-btn perm-toggle-btn--${allowed ? "allow" : "deny"}`}>
                                <span className="perm-toggle-btn__name">{perm.toUpperCase()}</span>
                                <span className={`perm-toggle-btn__value--${allowed ? "allow" : "deny"}`}>{allowed ? "ALLOW" : "DENY"}</span>
                            </button>
                        ))}
                    </div>
                </section>

                <div className="actions">
                    <div className="section-label">Actions</div>
                    <div className="actions__row">
                        <button className={`action-btn action-btn--isolate${isolated ? "-done" : ""}`} onClick={handleContIsolate} disabled={isolating || isolated}>{isolating ? "ISOLATING..." : isolated ? "ISOLATED" : "ISOLATE CONTAINER"}</button>
                        <button className="action-btn action-btn--restart">FORCE RESTART</button>
                        <button className="action-btn action-btn--export">EXPORT AUDIT LOG</button>
                    </div>
                </div>
            </div>

            
        </div>
    )
}