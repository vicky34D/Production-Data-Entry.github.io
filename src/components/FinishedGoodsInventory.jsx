import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Plus, ClipboardList, Trash2, Download, Lock, Upload, Factory } from 'lucide-react';
import { safeGet, safeSet } from '../utils/storage';
import './FinishedGoodsInventory.css';

const FinishedGoodsInventory = () => {
    const fileInputRef = useRef(null);

    // State
    const [finishedGoodsData, setFinishedGoodsData] = useState(() => safeGet('finishedGoodsData', []));

    // Batch State
    const [batches, setBatches] = useState([]);
    const [selectedBatchId, setSelectedBatchId] = useState('');

    const todayStr = new Date().toISOString().split('T')[0];
    const [viewDate, setViewDate] = useState(todayStr);

    // Form State
    const [date, setDate] = useState(todayStr);
    const [customerName, setCustomerName] = useState('');
    const [item, setItem] = useState('');
    const [totalBags, setTotalBags] = useState('');
    const [kgPerBag, setKgPerBag] = useState('');
    const [selectedFileName, setSelectedFileName] = useState('');

    const [itemsList, setItemsList] = useState([]);

    // Load Master Items & Batches
    useEffect(() => {
        const savedItems = safeGet('productItems', []);
        if (savedItems.length > 0) {
            setItemsList(savedItems);
        }

        const savedBatches = safeGet('productionBatches', []);
        setBatches(savedBatches);
        // Default to first active batch if any
        const active = savedBatches.find(b => b.status === 'In Production');
        if (active) setSelectedBatchId(active.id);
    }, []);

    // Derived State
    const totalPackedKg = (parseFloat(totalBags) || 0) * (parseFloat(kgPerBag) || 0);

    // Persist Data
    useEffect(() => {
        safeSet('finishedGoodsData', finishedGoodsData);
    }, [finishedGoodsData]);

    const handleAddEntry = () => {
        if (date !== todayStr) {
            alert(`Error: You can only add entries for the current date (${todayStr}).`);
            return;
        }

        if (!customerName || !item || !totalBags || !kgPerBag) {
            alert("Please fill all required fields.");
            return;
        }

        if (batches.length > 0 && !selectedBatchId) {
            const confirmNoBatch = window.confirm("No Production Batch selected. Continue as General Stock?");
            if (!confirmNoBatch) return;
        }

        // --- BATCH VALIDATION LOGIC ---
        if (selectedBatchId) {
            const batch = batches.find(b => b.id === selectedBatchId);
            if (batch) {
                const plannedQty = parseFloat(batch.targetQuantity) || 0;

                // Allow a small margin of error or exact match
                if (Math.abs(totalPackedKg - plannedQty) > 0.01) {
                    const diff = totalPackedKg - plannedQty;
                    const type = diff > 0 ? "HIGHER" : "LOWER";
                    const msg = `⚠️ QUANTITY MISMATCH WARNING ⚠️\n\nPlanned Batch Output: ${plannedQty} Kg\nActual Entry: ${totalPackedKg} Kg\n\nDifference: ${Math.abs(diff).toFixed(2)} Kg (${type})\n\nDo you want to record this deviation?`;

                    if (!window.confirm(msg)) {
                        return; // Stop if user cancels
                    }
                }
            }
        }
        // ------------------------------

        const transactionId = crypto.randomUUID ? crypto.randomUUID() : String(Date.now() + Math.random());

        const entry = {
            id: Date.now(),
            sNo: finishedGoodsData.length + 1,
            date,
            customerName,
            item,
            totalBags: parseFloat(totalBags),
            kgPerBag: parseFloat(kgPerBag),
            totalPackedKg,
            batchId: selectedBatchId || 'General Stock',
            document: selectedFileName,
            transactionId: transactionId, // Link for rollback
            timestamp: new Date().toLocaleTimeString()
        };

        // --- AUTO-DEDUCT RAW MATERIALS ---
        if (selectedBatchId && selectedBatchId !== 'General Stock') {
            const batch = batches.find(b => b.id === selectedBatchId);
            if (batch && batch.requirements) {
                const dsu = safeGet('storeUpdateData', []);
                let currentSNo = dsu.length;

                // Calculate raw materials needed for THIS specific entry amount
                const ratio = totalPackedKg / (parseFloat(batch.targetQuantity) || 1);

                const newDsuEntries = batch.requirements.map((req, idx) => ({
                    id: Date.now() + idx + 100, // Offset
                    sNo: ++currentSNo,
                    date: date,
                    item: req.name,
                    totalBags: 0,
                    qtyPerBag: 0,
                    totalKg: (req.requiredQty * ratio),
                    type: 'PRODUCTION_OUT', // Explicit type
                    document: `Batch ${batch.id} - FGI Log`,
                    transactionId: transactionId, // Link for rollback
                    timestamp: new Date().toLocaleTimeString()
                }));

                safeSet('storeUpdateData', [...dsu, ...newDsuEntries]);

                // --- BATCH CLOSURE LOGIC ---
                // Check if this entry pushes us over the completion line
                const allEntries = [...finishedGoodsData, entry].filter(e => e.batchId === batch.id);
                const totalProduced = allEntries.reduce((sum, e) => sum + e.totalPackedKg, 0);
                const target = parseFloat(batch.targetQuantity) || 0;

                if (target > 0 && totalProduced >= (target * 0.98)) {
                    // 98% Completion Trigger
                    const yieldPct = ((totalProduced / target) * 100).toFixed(1);
                    const closeMsg = `✅ BATCH TARGET REACHED!\n\nTarget: ${target} Kg\nTotal Produced: ${totalProduced} Kg\nYield Efficiency: ${yieldPct}%\n\nDo you want to CLOSE this batch now? (It will be archived)`;

                    if (window.confirm(closeMsg)) {
                        const updatedBatches = batches.map(b => {
                            if (b.id === batch.id) return { ...b, status: 'Completed', actualYield: yieldPct };
                            return b;
                        });
                        safeSet('productionBatches', updatedBatches);
                        setBatches(updatedBatches);
                        setSelectedBatchId(''); // Reset selection
                        alert("Batch Closed Successfully. Great Job!");
                    }
                }
            }
        }
        // ---------------------------------

        setFinishedGoodsData([...finishedGoodsData, entry]);

        // Reset form (keep date)
        setCustomerName('');
        setItem('');
        setTotalBags('');
        setKgPerBag('');
        setSelectedFileName('');
    };

    const handleDeleteEntry = (id, entryDate) => {
        if (entryDate !== todayStr) {
            alert("Restricted: You cannot delete records from previous days.");
            return;
        }
        if (window.confirm("Delete this entry? This will also revert any automatic raw material deductions.")) {
            const entryToDelete = finishedGoodsData.find(item => item.id === id);

            // Cascading Delete if linked
            if (entryToDelete && entryToDelete.transactionId) {
                const dsu = safeGet('storeUpdateData', []);
                const updatedDsu = dsu.filter(d => d.transactionId !== entryToDelete.transactionId);

                if (dsu.length !== updatedDsu.length) {
                    safeSet('storeUpdateData', updatedDsu);
                    console.log(`Rolled back ${dsu.length - updatedDsu.length} raw material entries.`);
                }
            } else {
                console.warn("Legacy entry deleted. No automatic rollback possible.");
            }

            const updatedData = finishedGoodsData.filter(item => item.id !== id);
            // Re-index S.No
            const reIndexedData = updatedData.map((item, index) => ({ ...item, sNo: index + 1 }));
            setFinishedGoodsData(reIndexedData);
        }
    };

    const handleClearData = () => {
        if (window.confirm("Delete ALL finished goods inventory history? This cannot be undone.")) {
            setFinishedGoodsData([]);
        }
    };

    const exportCSV = () => {
        const headers = ["S. No.", "Date", "Customer Name", "Item", "Total Bags", "Kg/Bag", "Total Packed (Kg)", "Batch ID"];
        const rows = finishedGoodsData.map(item => [
            item.sNo,
            item.date,
            item.customerName,
            item.item,
            item.totalBags,
            item.kgPerBag,
            item.totalPackedKg,
            item.batchId
        ]);

        let csvContent = "data:text/csv;charset=utf-8,"
            + headers.join(",") + "\n"
            + rows.map(e => e.join(",")).join("\n");

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "finished_goods_inventory.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // Derived Data for View
    const filteredData = finishedGoodsData.filter(item => item.date === viewDate);
    const isToday = viewDate === todayStr;

    return (
        <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg-color)' }}>
            <header className="inventory-header">
                <div className="brand" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <Link to="/inventory" style={{ opacity: 0.7, transition: 'opacity 0.2s' }} title="Back to Inventory Hub">
                        <ArrowLeft size={24} />
                    </Link>
                    <div className="brand-icon" style={{
                        width: '32px', height: '32px',
                        background: 'linear-gradient(135deg, #e11d48, #be123c)',
                        borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontWeight: 'bold', color: 'white'
                    }}>FGI</div>
                    <h1>Finished Goods Inventory</h1>
                </div>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    {batches.length > 0 && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div className="batch-selector" style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.5)', padding: '4px 8px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                                <Factory size={16} color="var(--text-secondary)" />
                                <select
                                    value={selectedBatchId}
                                    onChange={e => setSelectedBatchId(e.target.value)}
                                    style={{ border: 'none', outline: 'none', background: 'transparent', fontSize: '0.9rem', fontWeight: 500, color: 'var(--text-primary)' }}
                                >
                                    <option value="">-- General Stock --</option>
                                    {batches.filter(b => b.status === "In Production").map(b => (
                                        <option key={b.id} value={b.id}>{b.id}</option>
                                    ))}
                                </select>
                            </div>

                            {selectedBatchId && selectedBatchId !== 'General Stock' && (() => {
                                const currentBatch = batches.find(b => b.id === selectedBatchId);
                                if (!currentBatch) return null;
                                const total = finishedGoodsData.filter(d => d.batchId === selectedBatchId).reduce((acc, curr) => acc + curr.totalPackedKg, 0);
                                const target = parseFloat(currentBatch.targetQuantity) || 0;
                                const pct = target > 0 ? Math.round((total / target) * 100) : 0;

                                return (
                                    <div style={{ fontSize: '0.8rem', fontWeight: 600, color: pct >= 100 ? '#10b981' : 'var(--text-secondary)', background: 'rgba(255,255,255,0.5)', padding: '4px 8px', borderRadius: '8px' }}>
                                        {total.toFixed(0)} / {target} Kg ({pct}%)
                                    </div>
                                );
                            })()}
                        </div>
                    )}

                    <div style={{ display: 'flex', alignItems: 'center', background: 'rgba(255,255,255,0.5)', padding: '4px 8px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                        <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginRight: '8px' }}>View Date:</span>
                        <input
                            type="date"
                            value={viewDate}
                            onChange={(e) => setViewDate(e.target.value)}
                            style={{ border: 'none', background: 'transparent', padding: '4px', fontSize: '0.9rem', width: 'auto' }}
                        />
                    </div>
                    <button className="btn btn-secondary" onClick={handleClearData}>Reset System</button>
                </div>
            </header>

            <div className="inventory-container">
                {/* Left Column: Input Form */}
                <aside>
                    <motion.div
                        className="card"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                    >
                        <div className="card-header">
                            <div className="card-title">
                                <Plus size={20} /> New Production Entry
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Date</label>
                            <input type="date" value={date} readOnly style={{ backgroundColor: 'var(--bg-color)', cursor: 'not-allowed' }} />
                        </div>

                        <div className="form-group">
                            <label>Customer Name</label>
                            <input
                                type="text"
                                placeholder="Enter Customer Name"
                                value={customerName}
                                onChange={(e) => setCustomerName(e.target.value)}
                                readOnly={!isToday}
                                style={!isToday ? { backgroundColor: 'var(--bg-color)', cursor: 'not-allowed' } : {}}
                            />
                        </div>

                        <div className="form-group">
                            <label>Item Selection (from Master List)</label>
                            <select
                                value={item}
                                onChange={(e) => setItem(e.target.value)}
                                disabled={!isToday}
                                style={!isToday ? { backgroundColor: 'var(--bg-color)', cursor: 'not-allowed', opacity: 0.7 } : {}}
                            >
                                <option value="">-- Select Item --</option>
                                {itemsList.map((product) => (
                                    <option key={product.id} value={product.name}>
                                        {product.name} ({product.category})
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label>Total bags</label>
                                <input
                                    type="number"
                                    placeholder="0"
                                    value={totalBags}
                                    onChange={(e) => setTotalBags(e.target.value)}
                                    readOnly={!isToday}
                                    style={!isToday ? { backgroundColor: 'var(--bg-color)', cursor: 'not-allowed' } : {}}
                                />
                            </div>
                            <div className="form-group">
                                <label>Kg/Bag</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    placeholder="0.00"
                                    value={kgPerBag}
                                    onChange={(e) => setKgPerBag(e.target.value)}
                                    readOnly={!isToday}
                                    style={!isToday ? { backgroundColor: 'var(--bg-color)', cursor: 'not-allowed' } : {}}
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Total Packed (Kg) (Auto)</label>
                            <input type="number" value={totalPackedKg} readOnly style={{ backgroundColor: 'var(--bg-color)', cursor: 'not-allowed' }} />
                        </div>

                        <div className="button-group">
                            <button
                                className="btn btn-primary"
                                onClick={handleAddEntry}
                                disabled={!isToday}
                                style={!isToday ? { opacity: 0.6, cursor: 'not-allowed' } : {}}
                            >
                                <Plus size={18} /> Add Production Entry
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
                </aside>

                {/* Right Column: Data Table */}
                <main>
                    <motion.div
                        className="card"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                    >
                        <div className="card-header">
                            <div className="card-title">
                                <ClipboardList size={20} /> Production Log
                            </div>
                            <button className="btn btn-secondary" onClick={exportCSV}>
                                <Download size={16} style={{ marginRight: '5px' }} /> Export CSV
                            </button>
                        </div>
                        <div className="table-container">
                            <table>
                                <thead>
                                    <tr>
                                        <th>S.No</th>
                                        <th>Date</th>
                                        <th>Customer</th>
                                        <th>Item</th>
                                        <th>Bags</th>
                                        <th>Kg/Bag</th>
                                        <th>Total Packed (Kg)</th>
                                        <th>Doc</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredData.slice().reverse().map((entry) => (
                                        <tr key={entry.id}>
                                            <td>{entry.sNo}</td>
                                            <td>{entry.date}</td>
                                            <td>{entry.customerName}</td>
                                            <td>{entry.item}</td>
                                            <td>{entry.totalBags}</td>
                                            <td>{entry.kgPerBag}</td>
                                            <td>
                                                <span style={{ fontWeight: 'bold', color: 'var(--accent-primary)' }}>{entry.totalPackedKg.toFixed(2)}</span>
                                                {entry.batchId && entry.batchId !== 'General Stock' && (
                                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginTop: '2px' }}>{entry.batchId}</div>
                                                )}
                                            </td>
                                            <td>
                                                {entry.document && (
                                                    <span className="file-badge" title={entry.document}>
                                                        {entry.document.length > 15 ? entry.document.substring(0, 12) + '...' : entry.document}
                                                    </span>
                                                )}
                                            </td>
                                            <td>
                                                {entry.date === todayStr ? (
                                                    <button className="btn-danger" onClick={() => handleDeleteEntry(entry.id, entry.date)}>
                                                        <Trash2 size={16} />
                                                    </button>
                                                ) : (
                                                    <span style={{ color: '#ccc', fontSize: '0.8em' }}><Lock size={14} /></span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                    {filteredData.length === 0 && (
                                        <tr>
                                            <td colSpan="9" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>
                                                No finished goods records found for {viewDate}.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </motion.div>
                </main>
            </div>
        </div>
    );
};

export default FinishedGoodsInventory;
