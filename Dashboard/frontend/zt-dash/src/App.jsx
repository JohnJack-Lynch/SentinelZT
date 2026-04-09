import { useState } from 'react';

import ContainerCard from '../src/components/ContainerCard.jsx';
import DetailsPanel from '../src/components/DetailsPanel.jsx';
import PolicyEditor from '../src/components/PolicyEditor.jsx';
import AuditLog from '../src/components/AuditLog.jsx';

import { INIT_POLICY } from "../src/data/initialPolicy.js";
import { ROLES, MOCK_CONTAINERS, AUDIT_SEED } from "../src/data/mockData.js";
import { threatLevel, getTimeStringFormatted } from "../src/util/util.js";

import './App.css';

function App() {
	const [currentUserRole, setCurrentUserRole] = useState("ADMIN");
	const [policy, setPolicy] = useState(INIT_POLICY);
	const [containers, setContainers] = useState(MOCK_CONTAINERS);
	const [selectedId, setSelectedId] = useState(null);
	const [activeTab, setActiveTab] = useState("containers");
	const [auditLog, setAuditLog] = useState(AUDIT_SEED);
	const [sysMsg, setSysMsg] = useState(null);

	const selectedContainer = containers.find((c) => c.id === selectedId) ?? null;

	const handleSelectContainer = (id) => {
    	setSelectedId((prev) => (prev === id ? null : id));
	};

	const handlePolicyChange = (updatedPolicy) => {
    	setPolicy(updatedPolicy);
		setAuditLog((prev) => [
			{
				time:   getTimeStringFormatted(),
				actor:  currentUserRole,
				action: "POLICY",
				target: "ROLE_MATRIX",
				msg:    "Policy updated via dashboard",
			},
			...prev,
			]);
			setSysMsg("POLICY UPDATED — CHANGES PROPAGATED TO ALL CONTAINERS");
			setTimeout(() => setSysMsg(null), 3000);
	};

	const handleTabChange = (tabId) => {
		setActiveTab(tabId);
		if (tabId !== "containers") setSelectedId(null);
	};

	const totalAlerts = containers.reduce((n, c) => n + c.alerts.length, 0);
	const critCount = containers.filter((c) => threatLevel(c) === "critical").length;
	const warnCount = containers.filter((c) => threatLevel(c) === "warning").length;
	const runCount = containers.filter((c) => c.status === "running").length;

	const TABS = [
		{id: "containers", label: "CONTAINERS"},
		{id: "policy", label: "POLICY"},
		{id: "logs", label: "LOGS"}
	];

	return (
		<div className="app">
			<header>
				<h1 className="title-header">Sentinel<span id='zt'>ZT</span></h1>
				<h2 className="subheader">Dependable security in environements untrustworthy.</h2>
			</header>

			<nav className="tabs">
				{TABS.map((tab) => (
					<button key={tab.id} className={`tab-btn${activeTab === tab.id ? " tab-btn--active" : ""}`} onClick={() => handleTabChange(tab.id)}>
						{tab.label}
						{tab.id === "containers" && totalAlerts > 0 && (<span className="tab-btn__badge">{totalAlerts}</span>)}
					</button>
				))}
			</nav>

			<div className="content">
				{activeTab === "containers" && (
					<>
						<div className={`container-grid container-grid--${selectedId ? "collapsed" : "full"}`}>
							{containers.map((c) => (
								<ContainerCard key={c.id} container={c} policy={policy} onSelect={handleSelectContainer} selected={selectedId === c.id} /*currentUserRole={currentUserRole}*//>
							))}
						</div>
						
						{selectedContainer && (
							<div className="detail-panel">
								<DetailsPanel container={selectedContainer} policy={policy} onPolicyChange={handlePolicyChange} onClose={() => setSelectedId(null)}/>
							</div>
						)}
					</>
				)}

				{activeTab === "policy" && (
					<div className="tab-view">
						<PolicyEditor policy={policy} onPolicyChange={handlePolicyChange}/>
					</div>
				)}

				{activeTab === "logs" && (
					<div className="tab-view">
						<AuditLog entries={auditLog}/>
					</div>
				)}
			</div>
			
			<footer>
				<h2 className="policy-updated-last">Policy v. {policy.version} ... Updated {new Date(policy.updated).toUTCString()}</h2>
			</footer>
		</div>
	)
}

export default App
