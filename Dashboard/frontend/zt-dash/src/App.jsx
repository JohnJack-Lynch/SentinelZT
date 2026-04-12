import { useState, useEffect, useCallback } from 'react';

import ContainerCard from '../src/components/ContainerCard.jsx';
import DetailsPanel from '../src/components/DetailsPanel.jsx';
import PolicyEditor from '../src/components/PolicyEditor.jsx';
import AuditLog from '../src/components/AuditLog.jsx';

import { INIT_POLICY } from "../src/data/initialPolicy.js";
import { ROLES, MOCK_CONTAINERS, AUDIT_SEED } from "../src/data/mockData.js";
import { threatLevel, getTimeStringFormatted } from "../src/util/util.js";

import "../src/data/policy.json";

import './App.css';

import { fetchAuditLog, fetchContainers, fetchPolicy, isolateContainer, savePolicy } from './api/client.js';

// refresh rate for polling data
const POLL_RATE = 3000;

function App() {
	const [currentUserRole, setCurrentUserRole] = useState("ADMIN");
	const [policy, setPolicy] = useState(null);
	const [containers, setContainers] = useState([]);
	const [selectedId, setSelectedId] = useState([]);
	const [activeTab, setActiveTab] = useState("containers");
	const [auditLog, setAuditLog] = useState(null);
	const [sysMsg, setSysMsg] = useState(null);

	const [error, setError] = useState(null);
	const [loading, setLoading] = useState(true);

	const selectedContainer = containers.find((c) => c.id === selectedId) ?? null;

	// initial loading
	// throws an error if the backend cannot be reached

	useEffect(() => {
		async function init() {
			try {
				const [cont, pol, logs] = await Promise.all([fetchContainers(), fetchPolicy(), fetchAuditLog()]);
				setContainers(cont);
				setPolicy(pol);
				setAuditLog(logs);
			} catch(err) {
				setError(err.message);
			} finally {
				setLoading(false);
			}
		}
		init();
	}, []);

	// polling
	// grabs container and log info at a fixed rate (see above)

	useEffect(() => {
		const interval = setInterval(async () => {
			try {
				const [cont, logs] = await Promise.all([fetchContainers(), fetchAuditLog()]);
				setContainers(cont);
				setAuditLog(logs);
				setError(null);
			} catch(err) {
				setError(err.message);
			}
		}, POLL_RATE);

		return () => clearInterval(interval);
	}, []);

	// handlers

	const handleSelectContainer = (id) => {
    	setSelectedId((prev) => (prev === id ? null : id));
	};

	const handlePolicyChange = useCallback(async (updatedPolicy) => {
		try {
			const saved = await savePolicy(updatedPolicy);
			setPolicy(saved);
			setAuditLog(await fetchAuditLog());
			setSysMsg("Policy updated, changes sent to all containers.");
			setTimeout(() => setSysMsg(null), 3000);
		} catch(err) {
			setSysMsg(`ERROR: ${err.message}`);
			setTimeout(() => setSysMsg(null), 4000);
		}
	});

	const handleIsolate = useCallback(async (id) => {
		await isolateContainer(id);
		const [cont, logs] = await Promise.all([fetchContainers(), fetchAuditLog()]);
		setContainers(cont);
		setAuditLog(logs);
	});

	const handleRestart = useCallback(async (id) => {
		await restartContainer(id);
		const [cont, log] = await Promise.all([fetchContainers(), fetchAuditLog()]);
		setContainers(cont);
		setAuditLog(log);
	});

	const handleTabChange = (tabId) => {
		setActiveTab(tabId);
		if (tabId !== "containers") setSelectedId(null);
	};

	// loading screen

	if (loading) {
		return (
			<div className="screen-center screen-center--loading">
				Connecting to Docker...
			</div>
		)
	};

	// error message

	if (error && containers.length === 0) {
		return (
			<div className="screen-center screen-center--error">
				<div>!! CONNECTION FAILURE !!</div>
				<div className="screen-center-sub">{error}</div>
			</div>
		)
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

	// output to browser

	return (
		<div className="app">
			<header>
				<div className="header-left">
					<h1 className="title-header">Sentinel<span id='zt'>ZT</span></h1>
					<h2 className="subheader">Dependable security in environements untrustworthy.</h2>
				</div>

				<div className="header-right">
					<div className="status-pills">
						<span className="pill-online">{runCount}/{containers.length} ONLINE</span>
						{critCount > 0 && (
							<span className="warning-pill">{critCount} CRITICAL</span>
						)}
						{warnCount > 0 && (
							<span className="warning-pill">{warnCount} WARNINGS</span>
						)}
						{error && (
							<span className="warning-pill">!! BACKEND UNSTABLE !!</span>
						)}
					</div>
				</div>
			</header>

			{sysMsg && <div className="sys-banner">{sysMsg}</div>}

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
