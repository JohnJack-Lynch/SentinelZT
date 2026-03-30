import {threatLevel, permShorthand} from "../util/util.js";
import "./css/ContainerCard.css";

export default function ContainerCard({container: c, 
    policy,
    onSelect,
    selected
}){
    const threatLvl = threatLevel(c);
    const perms = policy.roles[c.role] || {};

    return (
        <div className="card" onClick={() => onSelect(c.id)}>
            <div className="card_header">
                <div className="card_name">{c.name}</div>
                <div className="card_meta">{c.ip} {c.image}</div>
            </div>

            <div className="card_metrics">
                <div className="metric">
                    <div className="metric__label">CPU</div>
                    <div className="metric__value">{c.cpu}%</div>
                </div>
                <div className="metric">
                    <div className="metric__label">MEM</div>
                    <div className="metric__value">{c.memory}%</div>
                </div>
            </div>
            
            <div className="card_footer">
                <div className="card_role">ROLE: <span>{c.role}</span></div>
                <div className="perm_chips">
                    {Object.entries(perms).map(([perm, allowed]) => (
                        <span key={perm} className={`perm_chip perm_chip--${allowed ? "allow" : "deny"}`}>{permShorthand(perm)}</span>
                    ))}
                </div>
            </div>
        </div>
    );
}