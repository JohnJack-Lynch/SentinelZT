import {THREAT_COLOR, THREAT_LABEL, threatLevel, permShorthand} from "../util/util.js";
import "./css/ContainerCard.css";

export default function ContainerCard({container: c, policy, onSelect, selected}){
    const threatLvl = threatLevel(c);
    const threatCol = THREAT_COLOR[threatLvl]
    const perms = policy.roles[c.role] || {};

    return (
        <div className="card" onClick={() => onSelect(c.id)} style={{border: `1px solid ${selected ? threatCol : threatLvl === "normal" ? "#ffffff" : threatCol}`}}>
            <div className="card-header">
                <div className="card-name">{c.name}</div>
                <div className="card-meta">{c.ip} ... {c.image}</div>

                <div className="card-badge" style={{color: threatCol}}>
                    {THREAT_LABEL[threatLvl]}
                </div>
            </div>

            <div className="card-metrics">
                <div className="metric">
                    <div className="metric-label">CPU ... {c.cpu}%</div>
                </div>
                <div className="metric">
                    <div className="metric-label">MEM ... {c.memory}%</div>
                </div>
            </div>
            
            <div className="card-footer">
                <div className="card-role">ROLE: <span>{c.role}</span></div>
                <div className="perm-chips">
                    {Object.entries(perms).map(([perm, allowed]) => (
                        <span key={perm} className={`perm-chip perm-chip--${allowed ? "allow" : "deny"}`}>{permShorthand(perm)}</span>
                    ))}
                </div>
            </div>
        </div>
    );
}