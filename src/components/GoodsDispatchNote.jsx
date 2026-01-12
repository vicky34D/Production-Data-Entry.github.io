import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Plus, ClipboardList, Trash2, Download, Lock, Upload } from 'lucide-react';
import { uploadDocument } from '../utils/fileUpload';
import './GoodsDispatchNote.css';

const GoodsDispatchNote = () => {
    const fileInputRef = useRef(null);

    // State
    const [dispatchData, setDispatchData] = useState(() => {
        const saved = localStorage.getItem('goodsDispatchData');
        return saved ? JSON.parse(saved) : [];
    });

    const todayStr = new Date().toISOString().split('T')[0];
    const [viewDate, setViewDate] = useState(todayStr);

    // Form State
    const [date, setDate] = useState(todayStr);
    const [invoiceNumber, setInvoiceNumber] = useState('');
    const [customerName, setCustomerName] = useState('');
    const [item, setItem] = useState('');
    const [totalBags, setTotalBags] = useState('');
    const [kgPerBag, setKgPerBag] = useState('');
    const [loadingCost, setLoadingCost] = useState('');
    const [selectedFileName, setSelectedFileName] = useState('');
    const [selectedFile, setSelectedFile] = useState(null);

    const [itemsList, setItemsList] = useState([]);

    // Load Master Items
    useEffect(() => {
        const savedItems = localStorage.getItem('productItems');
        if (savedItems) {
            setItemsList(JSON.parse(savedItems));
        }
    }, []);

    // Derived State
    const totalKg = (parseFloat(totalBags) || 0) * (parseFloat(kgPerBag) || 0);

    // Persist Data
    useEffect(() => {
        localStorage.setItem('goodsDispatchData', JSON.stringify(dispatchData));
    }, [dispatchData]);

    const handleAddEntry = async () => {
        if (date !== todayStr) {
            alert(`Error: You can only add entries for the current date (${todayStr}).`);
            return;
        }

        if (!invoiceNumber || !customerName || !item || !totalBags || !kgPerBag) {
            alert("Please fill all required fields.");
            return;
        }

        let documentUrl = null;
        if (selectedFile) {
            documentUrl = await uploadDocument(selectedFile, 'goods_dispatch');
        }

        const entry = {
            id: Date.now(),
            sNo: dispatchData.length + 1,
            date,
            invoiceNumber,
            customerName,
            item,
            totalBags: parseFloat(totalBags),
            kgPerBag: parseFloat(kgPerBag),
            totalKg,
            loadingCost: parseFloat(loadingCost) || 0,
            document: selectedFileName,
            documentUrl: documentUrl,
            timestamp: new Date().toLocaleTimeString()
        };

        setDispatchData([...dispatchData, entry]);

        // Reset form (keep date)
        setInvoiceNumber('');
        setCustomerName('');
        setItem('');
        setTotalBags('');
        setKgPerBag('');
        setLoadingCost('');
        setSelectedFileName('');
        setSelectedFile(null);
    };

    const handleDeleteEntry = (id, entryDate) => {
        if (entryDate !== todayStr) {
            alert("Restricted: You cannot delete records from previous days.");
            return;
        }
        if (window.confirm("Delete this entry?")) {
            const updatedData = dispatchData.filter(item => item.id !== id);
            // Re-index S.No
            const reIndexedData = updatedData.map((item, index) => ({ ...item, sNo: index + 1 }));
            setDispatchData(reIndexedData);
        }
    };

    const handleClearData = () => {
        if (window.confirm("Delete ALL dispatch history? This cannot be undone.")) {
            setDispatchData([]);
        }
    };

    const exportCSV = () => {
        const headers = ["S. No.", "Date", "JJW Invoice Number", "Customer Name", "Item", "Total Bags/Boxes", "Qty/Bag", "Total Kg", "Loading Cost"];
        const rows = dispatchData.map(item => [
            item.sNo,
            item.date,
            item.invoiceNumber,
            item.customerName,
            item.item,
            item.totalBags,
            item.kgPerBag,
            item.totalKg,
            item.loadingCost
        ]);

        let csvContent = "data:text/csv;charset=utf-8,"
            + headers.join(",") + "\n"
            + rows.map(e => e.join(",")).join("\n");

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "goods_dispatch_note.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // Derived Data for View
    const filteredData = dispatchData.filter(item => item.date === viewDate);
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
                        background: 'linear-gradient(135deg, #0ea5e9, #0284c7)',
                        borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontWeight: 'bold', color: 'white'
                    }}>GDN</div>
                    <h1>Goods Dispatch Note</h1>
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
                                <Plus size={20} /> New Dispatch Entry
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Date</label>
                            <input type="date" value={date} readOnly style={{ backgroundColor: 'var(--bg-color)', cursor: 'not-allowed' }} />
                        </div>

                        <div className="form-group">
                            <label>JJW Invoice Number</label>
                            <input
                                type="text"
                                placeholder="Enter Invoice No"
                                value={invoiceNumber}
                                onChange={(e) => setInvoiceNumber(e.target.value)}
                                readOnly={!isToday}
                                style={!isToday ? { backgroundColor: 'var(--bg-color)', cursor: 'not-allowed' } : {}}
                            />
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
                                <label>Qty per Bag</label>
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
                            <label>Total Kg (Auto)</label>
                            <input type="number" value={totalKg} readOnly style={{ backgroundColor: 'var(--bg-color)', cursor: 'not-allowed' }} />
                        </div>

                        <div className="form-group">
                            <label>Loading Cost</label>
                            <input
                                type="number"
                                placeholder="0.00"
                                value={loadingCost}
                                onChange={(e) => setLoadingCost(e.target.value)}
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
                                <Plus size={18} /> Add Dispatch Entry
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
                                        setSelectedFile(e.target.files[0]);
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
                                <ClipboardList size={20} /> Dispatch Log
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
                                        <th>Invoice #</th>
                                        <th>Customer</th>
                                        <th>Item</th>
                                        <th>Bags</th>
                                        <th>Kg/Bag</th>
                                        <th>Total Kg</th>
                                        <th>Loading</th>
                                        <th>Doc</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredData.slice().reverse().map((entry) => (
                                        <tr key={entry.id}>
                                            <td>{entry.sNo}</td>
                                            <td>{entry.date}</td>
                                            <td>{entry.invoiceNumber}</td>
                                            <td>{entry.customerName}</td>
                                            <td>{entry.item}</td>
                                            <td>{entry.totalBags}</td>
                                            <td>{entry.kgPerBag}</td>
                                            <td style={{ fontWeight: 'bold', color: 'var(--accent-primary)' }}>{entry.totalKg.toFixed(2)}</td>
                                            <td>{entry.loadingCost.toFixed(2)}</td>
                                            <td>
                                                {entry.document && (
                                                    <span className="file-badge" title={entry.document}>
                                                        {entry.document.length > 15 ? entry.document.substring(0, 12) + '...' : entry.document}
                                                    </span>
                                                )}
                                            </td>
                                            <td>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}>
                                                    {entry.document && (
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                if (entry.documentUrl) {
                                                                    window.open(entry.documentUrl, '_blank');
                                                                } else {
                                                                    alert(`Document "${entry.document}" is not available on server (legacy record).`);
                                                                }
                                                            }}
                                                            style={{
                                                                background: 'none', border: 'none', cursor: 'pointer', color: 'var(--accent-primary)', display: 'flex'
                                                            }}
                                                            title="Download"
                                                        >
                                                            <Download size={16} />
                                                        </button>
                                                    )}
                                                    {entry.date === todayStr ? (
                                                        <button className="btn-danger" onClick={() => handleDeleteEntry(entry.id, entry.date)}>
                                                            <Trash2 size={16} />
                                                        </button>
                                                    ) : (
                                                        <span style={{ color: '#ccc', fontSize: '0.8em' }}><Lock size={14} /></span>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    {filteredData.length === 0 && (
                                        <tr>
                                            <td colSpan="10" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>
                                                No dispatch records found for {viewDate}.
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

export default GoodsDispatchNote;
