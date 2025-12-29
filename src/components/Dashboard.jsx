import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Plus, Activity, TrendingUp, Lock, Upload, Factory } from 'lucide-react';
import './Dashboard.css';

const Dashboard = () => {
    const fileInputRef = useRef(null);

    // State
    const [productionData, setProductionData] = useState(() => {
        const saved = localStorage.getItem('agarbattiDataWet');
        return saved ? JSON.parse(saved) : [];
    });

    // Batch State
    const [batches, setBatches] = useState([]);
    const [selectedBatchId, setSelectedBatchId] = useState('');

    const todayStr = new Date().toISOString().split('T')[0];
    const [viewDate, setViewDate] = useState(todayStr);

    // Form State
    const [entryDate, setEntryDate] = useState(todayStr);
    const [operatorName, setOperatorName] = useState('');
    const [machineId, setMachineId] = useState('M1');
    const [trayId, setTrayId] = useState('');
    const [wetWeight, setWetWeight] = useState('');
    const [selectedFileName, setSelectedFileName] = useState('');

    // Load Batches
    useEffect(() => {
        const savedBatches = JSON.parse(localStorage.getItem('productionBatches') || '[]');
        setBatches(savedBatches);
        // Default to first active batch if any
        const active = savedBatches.find(b => b.status === 'In Production');
        if (active) setSelectedBatchId(active.id);
    }, []);

    // Persist Data
    useEffect(() => {
        localStorage.setItem('agarbattiDataWet', JSON.stringify(productionData));
    }, [productionData]);

    // Auto-calculate Tray ID
    useEffect(() => {
        const existingEntries = productionData.filter(item => item.date === entryDate && item.machine === machineId);
        let maxTray = 0;
        existingEntries.forEach(item => {
            const match = item.tray.match(/T(\d+)/);
            if (match && match[1]) {
                const num = parseInt(match[1]);
                if (num > maxTray) maxTray = num;
            }
        });
        setTrayId("T" + (maxTray + 1));
    }, [productionData, entryDate, machineId]);

    const handleAddEntry = () => {
        if (entryDate !== todayStr) {
            alert(`Error: You can only add entries for the current date (${todayStr}).`);
            return;
        }
        if (!operatorName || !trayId || !wetWeight) {
            alert("Please fill all fields.");
            return;
        }
        if (batches.length > 0 && !selectedBatchId) {
            alert("Please select a Production Batch to link this entry to.");
            return;
        }

        const entry = {
            id: Date.now(),
            date: entryDate,
            operator: operatorName.trim(),
            machine: machineId,
            tray: trayId,
            weight: parseFloat(wetWeight),
            batchId: selectedBatchId || 'Unassigned',
            document: selectedFileName,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };

        setProductionData([...productionData, entry]);
        setWetWeight('');
        setSelectedFileName('');
    };

    const handleDeleteEntry = (id, date) => {
        if (date !== todayStr) {
            alert("Restricted: You cannot delete records from previous days.");
            return;
        }
        if (window.confirm("Delete this entry?")) {
            setProductionData(productionData.filter(item => item.id !== id));
        }
    };

    const handleClearData = () => {
        if (window.confirm("Delete ALL history? This cannot be undone.")) {
            setProductionData([]);
        }
    };

    const exportCSV = (tableId, filename) => {
        alert("Export feature coming soon in React version!");
    };

    // Derived Data for View
    const filteredData = productionData.filter(item => item.date === viewDate);
    const isToday = viewDate === todayStr;

    // Stats
    const totalWeight = filteredData.reduce((sum, item) => sum + item.weight, 0);
    const totalTrays = filteredData.length;
    const activeOperators = new Set(filteredData.map(e => e.operator)).size;

    // Machine Grouping
    const machineGroups = {};
    filteredData.forEach(item => {
        if (!machineGroups[item.machine]) {
            machineGroups[item.machine] = { weight: 0, trays: [] };
        }
        machineGroups[item.machine].weight += item.weight;
        machineGroups[item.machine].trays.push(item);
    });

    return (
        <div className="dashboard-content">
            <div className="dashboard-controls">
                <div className="date-filter">
                    <span className="label">View Date:</span>
                    <input
                        type="date"
                        value={viewDate}
                        onChange={(e) => setViewDate(e.target.value)}
                        className="date-input"
                    />
                </div>

                {/* Batch Selector if active batches exist */}
                {batches.length > 0 && (
                    <div className="batch-selector" style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'white', padding: '4px 8px', borderRadius: '8px', border: '1px solid var(--border-medium)' }}>
                        <Factory size={16} color="var(--primary-color)" />
                        <select
                            value={selectedBatchId}
                            onChange={e => setSelectedBatchId(e.target.value)}
                            style={{ border: 'none', outline: 'none', background: 'transparent', fontSize: '0.9rem', fontWeight: 500, color: 'var(--text-primary)' }}
                        >
                            <option value="">-- No Active Batch --</option>
                            {batches.filter(b => b.status === "In Production").map(b => (
                                <option key={b.id} value={b.id}>{b.id} - {b.formulationName}</option>
                            ))}
                        </select>
                    </div>
                )}

                <button className="btn-reset" onClick={handleClearData}>
                    <Lock size={14} style={{ marginRight: '6px' }} /> Reset System
                </button>
            </div>

            <div className="dashboard-grid">
                {/* Left Column - Data Entry */}
                <div className="grid-column-left">
                    <motion.div
                        className="card"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                    >
                        <div className="card-header">
                            <div className="card-title">
                                <Plus size={20} /> New Entry {selectedBatchId && <span style={{ fontSize: '0.8em', color: 'var(--text-tertiary)', marginLeft: '8px' }}>to {selectedBatchId}</span>}
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Date</label>
                            <input type="date" value={entryDate} readOnly style={{ backgroundColor: 'var(--bg-color)', cursor: 'not-allowed' }} />
                        </div>

                        <div className="form-group">
                            <label>Operator Name</label>
                            <input
                                type="text"
                                placeholder="e.g. Ramesh"
                                value={operatorName}
                                onChange={(e) => setOperatorName(e.target.value)}
                                readOnly={!isToday}
                                style={!isToday ? { backgroundColor: 'var(--bg-color)', cursor: 'not-allowed' } : {}}
                            />
                        </div>

                        <div className="form-group">
                            <label>Machine ID</label>
                            <select
                                value={machineId}
                                onChange={(e) => setMachineId(e.target.value)}
                                disabled={!isToday}
                                style={!isToday ? { opacity: 0.6, cursor: 'not-allowed' } : {}}
                            >
                                {['M1', 'M2', 'M3', 'M4', 'M5', 'M6'].map(m => <option key={m} value={m}>Machine {m.replace('M', '')}</option>)}
                            </select>
                        </div>

                        <div className="form-group">
                            <label>Tray ID (Auto)</label>
                            <input
                                type="text"
                                value={trayId}
                                readOnly
                                style={{ backgroundColor: 'var(--bg-color)', cursor: 'not-allowed', color: 'var(--text-secondary)' }}
                            />
                        </div>

                        <div className="form-group">
                            <label>Wet Weight (KG)</label>
                            <input
                                type="number"
                                step="0.01"
                                placeholder="0.00"
                                value={wetWeight}
                                onChange={(e) => setWetWeight(e.target.value)}
                                readOnly={!isToday}
                                style={!isToday ? { backgroundColor: 'var(--bg-color)', cursor: 'not-allowed' } : {}}
                            />
                        </div>

                        <div className="button-group">
                            <button
                                className="btn btn-primary"
                                onClick={handleAddEntry}
                                disabled={!isToday}
                            >
                                <Plus size={18} /> Save Entry
                            </button>
                            <button
                                className={`btn btn-upload ${selectedFileName ? 'has-file' : ''}`}
                                title={selectedFileName ? `Selected: ${selectedFileName}` : "Upload supportive documents"}
                                onClick={() => fileInputRef.current.click()}
                            >
                                <Upload size={18} /> {selectedFileName ? 'File Selected' : 'Upload Docs'}
                            </button>
                            <input
                                type="file"
                                ref={fileInputRef}
                                style={{ display: 'none' }}
                                onChange={(e) => {
                                    if (e.target.files.length > 0) {
                                        setSelectedFileName(e.target.files[0].name);
                                    }
                                }}
                            />
                        </div>
                    </motion.div>

                    <motion.div
                        className="card"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                    >
                        <div className="card-header">
                            <div className="card-title">Recent Activity</div>
                        </div>
                        <div className="table-container">
                            <table>
                                <thead>
                                    <tr>
                                        <th>Time</th>
                                        <th>Details</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredData.slice().reverse().slice(0, 8).map(item => (
                                        <tr key={item.id}>
                                            <td style={{ fontSize: '0.8em', color: 'var(--text-secondary)' }}>{item.timestamp}</td>
                                            <td>
                                                <div style={{ fontWeight: 500 }}>{item.operator}</div>
                                                <div style={{ fontSize: '0.8em', color: 'var(--text-secondary)' }}>
                                                    {item.machine} • {item.tray} • {item.weight}kg <br />
                                                    {item.batchId && <span style={{ fontSize: '0.9em', color: 'var(--primary-color)' }}>{item.batchId}</span>}
                                                </div>
                                                {item.document && (
                                                    <span className="file-badge" style={{ marginTop: '4px' }} title={item.document}>
                                                        {item.document.length > 15 ? item.document.substring(0, 12) + '...' : item.document}
                                                    </span>
                                                )}
                                            </td>
                                            <td>
                                                {item.date === todayStr ? (
                                                    <button className="btn-danger" onClick={() => handleDeleteEntry(item.id, item.date)}>✕</button>
                                                ) : (
                                                    <span style={{ color: '#ccc', fontSize: '0.8em' }}><Lock size={14} /></span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                    {filteredData.length === 0 && (
                                        <tr><td colSpan="3" style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>No entries yet</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </motion.div>
                </div>

                {/* Right Column */}
                <div className="grid-column-right">
                    <motion.div
                        className="stats-grid"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                    >
                        <div className="stat-card">
                            <div className="stat-label">Total Weight ({isToday ? 'Today' : viewDate})</div>
                            <div className="stat-value">{totalWeight.toFixed(2)} <span style={{ fontSize: '1rem', color: 'var(--text-secondary)' }}>kg</span></div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-label">Trays Produced</div>
                            <div className="stat-value">{totalTrays}</div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-label">Active Operators</div>
                            <div className="stat-value">{activeOperators}</div>
                        </div>
                    </motion.div>

                    <motion.div
                        className="card"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                    >
                        <div className="card-header">
                            <div className="card-title">
                                <Activity size={20} /> Machine Insights
                            </div>
                            <button className="btn btn-secondary" onClick={() => exportCSV('machineTable', 'machine_details.csv')}>Export CSV</button>
                        </div>
                        <div className="table-container">
                            <table>
                                <thead>
                                    <tr>
                                        <th>Date</th>
                                        <th>Machine</th>
                                        <th>Tray Breakdown</th>
                                        <th>Total Weight</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {Object.keys(machineGroups).sort().map(mach => {
                                        const data = machineGroups[mach];
                                        return (
                                            <tr key={mach}>
                                                <td style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{viewDate}</td>
                                                <td><span className="badge badge-machine">{mach}</span></td>
                                                <td>
                                                    <div style={{ display: 'flex', flexWrap: 'wrap' }}>
                                                        {data.trays.map((t, idx) => (
                                                            <span key={idx} className="tray-tag">
                                                                <span className="tray-id">{t.tray}</span>
                                                                <span className="tray-val">{t.weight}kg</span>
                                                                <span className="tray-op">{t.operator}</span>
                                                            </span>
                                                        ))}
                                                    </div>
                                                </td>
                                                <td style={{ fontWeight: 'bold', color: 'var(--accent-success)' }}>{data.weight.toFixed(2)}</td>
                                            </tr>
                                        );
                                    })}
                                    {Object.keys(machineGroups).length === 0 && (
                                        <tr><td colSpan="4" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>No production data found for {viewDate}</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </motion.div>

                    <motion.div
                        className="card"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                    >
                        <div className="card-header">
                            <div className="card-title">
                                <TrendingUp size={20} /> Daily Performance
                            </div>
                            <button className="btn btn-secondary" onClick={() => exportCSV('summaryTable', 'daily_summary.csv')}>Export CSV</button>
                        </div>
                        <div className="table-container">
                            <table>
                                <thead>
                                    <tr>
                                        <th>Date</th>
                                        <th>Total Wet (KG)</th>
                                        <th>Trays</th>
                                        <th>Active Machines</th>
                                        <th>Avg/Mach</th>
                                        <th>Top Operator</th>
                                        <th>Op. Weight</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredData.length > 0 ? (() => {
                                        const totalMachines = Object.keys(machineGroups).length;
                                        const avgWet = totalMachines > 0 ? (totalWeight / totalMachines).toFixed(2) : 0;

                                        const opStats = {};
                                        filteredData.forEach(item => {
                                            opStats[item.operator] = (opStats[item.operator] || 0) + item.weight;
                                        });
                                        let bestOp = "-", bestWt = 0;
                                        for (let [op, wt] of Object.entries(opStats)) {
                                            if (wt > bestWt) { bestWt = wt; bestOp = op; }
                                        }

                                        return (
                                            <tr>
                                                <td style={{ fontWeight: 500 }}>{viewDate}</td>
                                                <td style={{ color: 'var(--accent-primary)', fontWeight: 700 }}>{totalWeight.toFixed(2)}</td>
                                                <td>{totalTrays}</td>
                                                <td>{totalMachines}</td>
                                                <td>{avgWet}</td>
                                                <td><span className="badge" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24' }}>{bestOp}</span></td>
                                                <td>{bestWt.toFixed(2)}</td>
                                            </tr>
                                        );
                                    })() : (
                                        <tr><td colSpan="7" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>No summary available</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
