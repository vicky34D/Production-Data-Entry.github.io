import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Plus, ClipboardList, Trash2, Download, Lock, Upload } from 'lucide-react';
import './GoodsReceivedNote.css';

const GoodsReceivedNote = () => {
    const fileInputRef = useRef(null);

    // State
    const [inventoryData, setInventoryData] = useState(() => {
        const saved = localStorage.getItem('inventoryData');
        return saved ? JSON.parse(saved) : [];
    });

    const todayStr = new Date().toISOString().split('T')[0];
    const [viewDate, setViewDate] = useState(todayStr);

    // Form State
    const [date, setDate] = useState(todayStr);
    const [poNumber, setPoNumber] = useState('');
    const [supplierInvoice, setSupplierInvoice] = useState('');
    const [supplierName, setSupplierName] = useState('');
    const [item, setItem] = useState('');
    const [totalBags, setTotalBags] = useState('');
    const [qtyPerBag, setQtyPerBag] = useState('');
    const [unloadingCost, setUnloadingCost] = useState('');
    const [selectedFileName, setSelectedFileName] = useState('');

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
        localStorage.setItem('inventoryData', JSON.stringify(inventoryData));
    }, [inventoryData]);

    const handleAddEntry = () => {
        if (date !== todayStr) {
            alert(`Error: You can only add entries for the current date (${todayStr}).`);
            return;
        }

        if (!poNumber || !supplierName || !item || !totalBags || !qtyPerBag) {
            alert("Please fill all required fields.");
            return;
        }

        const entry = {
            id: Date.now(),
            sNo: inventoryData.length + 1,
            date,
            poNumber,
            supplierInvoice,
            supplierName,
            item,
            totalBags: parseFloat(totalBags),
            qtyPerBag: parseFloat(qtyPerBag),
            totalKg,
            unloadingCost: parseFloat(unloadingCost) || 0,
            document: selectedFileName,
            transactionId: crypto.randomUUID ? crypto.randomUUID() : String(Date.now()), // For linking
            timestamp: new Date().toLocaleTimeString()
        };

        // --- UPDATE DAILY STORE (Stock IN) ---
        const dsuData = JSON.parse(localStorage.getItem('storeUpdateData') || '[]');
        const dsuEntry = {
            id: Date.now() + 1, // Slight offset to avoid key collision if fast
            sNo: dsuData.length + 1,
            date,
            item,
            totalBags: parseFloat(totalBags),
            qtyPerBag: parseFloat(qtyPerBag),
            totalKg,
            type: 'GRN_IN', // New Type
            document: `GRN - ${supplierName}`,
            transactionId: entry.transactionId, // Linked ID
            timestamp: new Date().toLocaleTimeString()
        };
        localStorage.setItem('storeUpdateData', JSON.stringify([...dsuData, dsuEntry]));
        // -------------------------------------

        setInventoryData([...inventoryData, entry]);

        // Reset form (keep date)
        setPoNumber('');
        setSupplierInvoice('');
        setSupplierName('');
        setItem('');
        setTotalBags('');
        setQtyPerBag('');
        setUnloadingCost('');
        setSelectedFileName('');
    };

    const handleDeleteEntry = (id, entryDate) => {
        if (entryDate !== todayStr) {
            alert("Restricted: You cannot delete records from previous days.");
            return;
        }
        if (window.confirm("Delete this entry? This will also revert the Stock update.")) {
            const entryToDelete = inventoryData.find(item => item.id === id);

            // Cascading Delete if linked
            if (entryToDelete && entryToDelete.transactionId) {
                const dsu = JSON.parse(localStorage.getItem('storeUpdateData') || '[]');
                const updatedDsu = dsu.filter(d => d.transactionId !== entryToDelete.transactionId);

                if (dsu.length !== updatedDsu.length) {
                    localStorage.setItem('storeUpdateData', JSON.stringify(updatedDsu));
                    console.log(`Rolled back ${dsu.length - updatedDsu.length} daily store entries.`);
                }
            }

            const updatedData = inventoryData.filter(item => item.id !== id);
            // Re-index S.No
            const reIndexedData = updatedData.map((item, index) => ({ ...item, sNo: index + 1 }));
            setInventoryData(reIndexedData);
        }
    };

    const handleClearData = () => {
        if (window.confirm("Delete ALL inventory history? This cannot be undone.")) {
            setInventoryData([]);
        }
    };

    const exportCSV = () => {
        const headers = ["S. No.", "Date", "JJW PO Number", "Supplier Invoice Number", "Supplier Name", "Item", "Total Bags/Boxes", "Qty/Bag", "Total Kg", "Unloading Cost"];
        const rows = inventoryData.map(item => [
            item.sNo,
            item.date,
            item.poNumber,
            item.supplierInvoice,
            item.supplierName,
            item.item,
            item.totalBags,
            item.qtyPerBag,
            item.totalKg,
            item.unloadingCost
        ]);

        let csvContent = "data:text/csv;charset=utf-8,"
            + headers.join(",") + "\n"
            + rows.map(e => e.join(",")).join("\n");

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "inventory_grn.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // Derived Data for View
    const filteredData = inventoryData.filter(item => item.date === viewDate);
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
                        background: 'linear-gradient(135deg, var(--accent-warning), #f97316)',
                        borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontWeight: 'bold', color: 'white'
                    }}>GRN</div>
                    <h1>Goods Received Note</h1>
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
                                <Plus size={20} /> New Entry
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Date</label>
                            <input type="date" value={date} readOnly style={{ backgroundColor: 'var(--bg-color)', cursor: 'not-allowed' }} />
                        </div>

                        <div className="form-group">
                            <label>JJW PO Number</label>
                            <input
                                type="text"
                                placeholder="Enter PO Number"
                                value={poNumber}
                                onChange={(e) => setPoNumber(e.target.value)}
                                readOnly={!isToday}
                                style={!isToday ? { backgroundColor: 'var(--bg-color)', cursor: 'not-allowed' } : {}}
                            />
                        </div>

                        <div className="form-group">
                            <label>Supplier Invoice Number</label>
                            <input
                                type="text"
                                placeholder="Enter Invoice No"
                                value={supplierInvoice}
                                onChange={(e) => setSupplierInvoice(e.target.value)}
                                readOnly={!isToday}
                                style={!isToday ? { backgroundColor: 'var(--bg-color)', cursor: 'not-allowed' } : {}}
                            />
                        </div>

                        <div className="form-group">
                            <label>Supplier Name</label>
                            <input
                                type="text"
                                placeholder="Enter Supplier Name"
                                value={supplierName}
                                onChange={(e) => setSupplierName(e.target.value)}
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
                                <label>Total Bags/Boxes</label>
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
                                <label>Qty/Bag (Kg)</label>
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
                            <label>Total Kg (Auto)</label>
                            <input type="number" value={totalKg} readOnly style={{ backgroundColor: 'var(--bg-color)', cursor: 'not-allowed' }} />
                        </div>

                        <div className="form-group">
                            <label>Unloading Cost</label>
                            <input
                                type="number"
                                placeholder="0.00"
                                value={unloadingCost}
                                onChange={(e) => setUnloadingCost(e.target.value)}
                                readOnly={!isToday}
                                style={!isToday ? { backgroundColor: 'var(--bg-color)', cursor: 'not-allowed' } : {}}
                            />
                        </div>

                        <div className="button-group">
                            <button
                                className="btn btn-primary"
                                onClick={handleAddEntry}
                                disabled={!isToday}
                                style={!isToday ? { opacity: 0.6, cursor: 'not-allowed' } : {}}
                            >
                                <Plus size={18} /> Add to Inventory
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
                                <ClipboardList size={20} /> Received Goods Log
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
                                        <th>PO #</th>
                                        <th>Supplier</th>
                                        <th>Item</th>
                                        <th>Bags</th>
                                        <th>Qty/Bag</th>
                                        <th>Total Kg</th>
                                        <th>Unloading</th>
                                        <th>Doc</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredData.slice().reverse().map((entry) => (
                                        <tr key={entry.id}>
                                            <td>{entry.sNo}</td>
                                            <td>{entry.date}</td>
                                            <td>{entry.poNumber}</td>
                                            <td>
                                                <div style={{ fontWeight: 500 }}>{entry.supplierName}</div>
                                                <div style={{ fontSize: '0.8em', color: 'var(--text-secondary)' }}>{entry.supplierInvoice}</div>
                                            </td>
                                            <td>{entry.item}</td>
                                            <td>{entry.totalBags}</td>
                                            <td>{entry.qtyPerBag}</td>
                                            <td style={{ fontWeight: 'bold', color: 'var(--accent-primary)' }}>{entry.totalKg.toFixed(2)}</td>
                                            <td>{entry.unloadingCost.toFixed(2)}</td>
                                            <td>
                                                {entry.document && (
                                                    <span className="file-badge" title={entry.document}>
                                                        {entry.document.length > 15 ? entry.document.substring(0, 12) + '...' : entry.document}
                                                    </span>
                                                )}
                                            </td>
                                            <td>
                                                {entry.date === todayStr ? (
                                                    <button className="btn-danger" onClick={() => handleDeleteEntry(entry.id)}>
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
                                            <td colSpan="10" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>
                                                No inventory records found for {viewDate}.
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

export default GoodsReceivedNote;
