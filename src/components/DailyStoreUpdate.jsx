import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Plus, ClipboardList, Trash2, Download, Lock } from 'lucide-react';
import './DailyStoreUpdate.css';

const DailyStoreUpdate = () => {
    // State
    const [storeData, setStoreData] = useState(() => {
        const saved = localStorage.getItem('storeUpdateData');
        return saved ? JSON.parse(saved) : [];
    });

    const todayStr = new Date().toISOString().split('T')[0];
    const [viewDate, setViewDate] = useState(todayStr);

    // Form State
    const [date, setDate] = useState(todayStr);
    const [item, setItem] = useState('');
    const [totalBags, setTotalBags] = useState('');
    const [qtyPerBag, setQtyPerBag] = useState('');

    const [itemsList, setItemsList] = useState([]);

    // Load Master Items
    useEffect(() => {
        const savedItems = localStorage.getItem('productItems');
        if (savedItems) {
            setItemsList(JSON.parse(savedItems));
        }
    }, []);

    // Derived State
    const totalKg = (parseFloat(totalBags) || 0) * (parseFloat(qtyPerBag) || 0);

    // Persist Data
    useEffect(() => {
        localStorage.setItem('storeUpdateData', JSON.stringify(storeData));
    }, [storeData]);

    const handleAddEntry = () => {
        if (date !== todayStr) {
            alert(`Error: You can only add entries for the current date (${todayStr}).`);
            return;
        }

        if (!item || !totalBags || !qtyPerBag) {
            alert("Please fill all required fields.");
            return;
        }

        const entry = {
            id: Date.now(),
            sNo: storeData.length + 1,
            date,
            item,
            totalBags: parseFloat(totalBags),
            qtyPerBag: parseFloat(qtyPerBag),
            totalKg,
            timestamp: new Date().toLocaleTimeString()
        };

        setStoreData([...storeData, entry]);

        // Reset form (keep date)
        setItem('');
        setTotalBags('');
        setQtyPerBag('');
    };

    const handleDeleteEntry = (id, entryDate) => {
        if (entryDate !== todayStr) {
            alert("Restricted: You cannot delete records from previous days.");
            return;
        }
        if (window.confirm("Delete this entry?")) {
            const updatedData = storeData.filter(item => item.id !== id);
            // Re-index S.No
            const reIndexedData = updatedData.map((item, index) => ({ ...item, sNo: index + 1 }));
            setStoreData(reIndexedData);
        }
    };

    const handleClearData = () => {
        if (window.confirm("Delete ALL store update history? This cannot be undone.")) {
            setStoreData([]);
        }
    };

    const exportCSV = () => {
        const headers = ["S. No.", "Date", "Item", "No. of Bags OUT", "Qty Per Bag", "Total Kg OUT"];
        const rows = storeData.map(item => [
            item.sNo,
            item.date,
            item.item,
            item.totalBags,
            item.qtyPerBag,
            item.totalKg
        ]);

        let csvContent = "data:text/csv;charset=utf-8,"
            + headers.join(",") + "\n"
            + rows.map(e => e.join(",")).join("\n");

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "daily_store_update.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // Derived Data for View
    const filteredData = storeData.filter(item => item.date === viewDate);
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
                        background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
                        borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontWeight: 'bold', color: 'white'
                    }}>DSU</div>
                    <h1>Daily Store Update</h1>
                </div>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
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
                                <Plus size={20} /> New Output Entry
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Date</label>
                            <input type="date" value={date} readOnly style={{ backgroundColor: 'var(--bg-color)', cursor: 'not-allowed' }} />
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
                                <label>No. of Bags OUT</label>
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
                                <label>Qty Per Bag (Kg)</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    placeholder="0.00"
                                    value={qtyPerBag}
                                    onChange={(e) => setQtyPerBag(e.target.value)}
                                    readOnly={!isToday}
                                    style={!isToday ? { backgroundColor: 'var(--bg-color)', cursor: 'not-allowed' } : {}}
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Total Kg OUT (Auto)</label>
                            <input type="number" value={totalKg} readOnly style={{ backgroundColor: 'var(--bg-color)', cursor: 'not-allowed' }} />
                        </div>

                        <button
                            className="btn btn-primary"
                            onClick={handleAddEntry}
                            disabled={!isToday}
                            style={!isToday ? { opacity: 0.6, cursor: 'not-allowed' } : {}}
                        >
                            Add Usage Entry
                        </button>
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
                                <ClipboardList size={20} /> Store Usage Log
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
                                        <th>Items</th>
                                        <th>No. of Bags OUT</th>
                                        <th>Qty Per Bag</th>
                                        <th>Total Kg OUT</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredData.slice().reverse().map((entry) => (
                                        <tr key={entry.id}>
                                            <td>{entry.sNo}</td>
                                            <td>{entry.date}</td>
                                            <td>{entry.item}</td>
                                            <td>{entry.totalBags}</td>
                                            <td>{entry.qtyPerBag}</td>
                                            <td style={{ fontWeight: 'bold', color: 'var(--accent-primary)' }}>{entry.totalKg.toFixed(2)}</td>
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
                                            <td colSpan="7" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>
                                                No usage records found for {viewDate}.
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

export default DailyStoreUpdate;
