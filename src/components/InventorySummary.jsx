import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, RefreshCw, Download, Search, Package, TrendingUp, TrendingDown, Box, Upload } from 'lucide-react';
import './InventorySummary.css';

const InventorySummary = () => {
    const fileInputRef = useRef(null);
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');
    const [itemsList, setItemsList] = useState([]);
    const [stockData, setStockData] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const loadAllData = () => {
        setIsLoading(true);
        // Load Master Items
        const products = JSON.parse(localStorage.getItem('productItems') || '[]');
        setItemsList(products);

        // Load All Transaction Logs
        const grn = JSON.parse(localStorage.getItem('inventoryData') || '[]');
        const dsu = JSON.parse(localStorage.getItem('storeUpdateData') || '[]');
        const spp = JSON.parse(localStorage.getItem('sparePartsPurchaseData') || '[]');
        const spu = JSON.parse(localStorage.getItem('sparePartsUpdateData') || '[]');
        const fgi = JSON.parse(localStorage.getItem('finishedGoodsData') || '[]');
        const gdn = JSON.parse(localStorage.getItem('goodsDispatchData') || '[]');

        const norm = (str) => (str || '').toString().toLowerCase().trim();

        const calculated = products.map(product => {
            const productName = norm(product.name);

            // Calculate IN (Received / Produced / Purchased)
            const inGRN = grn.filter(d => norm(d.item) === productName).reduce((sum, d) => sum + (parseFloat(d.totalKg) || 0), 0);
            const inFGI = fgi.filter(d => norm(d.item) === productName).reduce((sum, d) => sum + (parseFloat(d.totalPackedKg) || 0), 0);
            const inSPP = spp.filter(d => norm(d.item) === productName).reduce((sum, d) => sum + (parseFloat(d.quantity) || 0), 0);

            const totalIn = inGRN + inFGI + inSPP;

            // Calculate OUT (Used / Dispatched / Consumed)
            const outDSU = dsu.filter(d => norm(d.item) === productName).reduce((sum, d) => sum + (parseFloat(d.totalKg) || 0), 0);
            const outGDN = gdn.filter(d => norm(d.item) === productName).reduce((sum, d) => sum + (parseFloat(d.totalKg) || 0), 0);
            const outSPU = spu.filter(d => norm(d.item) === productName).reduce((sum, d) => sum + (parseFloat(d.quantity) || 0), 0);

            const totalOut = outDSU + outGDN + outSPU;

            return {
                ...product,
                totalIn,
                totalOut,
                currentStock: totalIn - totalOut,
                isDead: totalIn === 0 && totalOut === 0
            };
        });

        setStockData(calculated);
        setIsLoading(false);
    };

    useEffect(() => {
        loadAllData();
    }, []);

    const filteredItems = stockData.filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.category.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const stats = {
        totalItems: stockData.length,
        itemsIn: stockData.reduce((acc, curr) => acc + curr.totalIn, 0),
        itemsOut: stockData.reduce((acc, curr) => acc + curr.totalOut, 0),
        deadItems: stockData.filter(item => item.isDead).length
    };

    const exportCSV = () => {
        const headers = ["Item Name", "Category", "Stock IN", "Stock OUT", "Current Balance", "Status"];
        const rows = stockData.map(item => [
            item.name,
            item.category,
            item.totalIn.toFixed(2),
            item.totalOut.toFixed(2),
            item.currentStock.toFixed(2),
            item.isDead ? "Dead Stock" : "Active"
        ]);

        let csvContent = "data:text/csv;charset=utf-8,"
            + headers.join(",") + "\n"
            + rows.map(e => e.join(",")).join("\n");

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `stock_summary_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="inventory-summary-page">
            <header className="summary-header">
                <div className="header-left">
                    <button onClick={() => navigate('/inventory')} className="back-btn">
                        <ArrowLeft size={28} />
                    </button>
                    <div className="brand-title">
                        <div className="logo-badge">ST</div>
                        <h1>Stock Summary</h1>
                    </div>
                </div>
                <div className="header-actions">
                    <button className="action-btn btn-secondary" onClick={loadAllData}>
                        <RefreshCw size={18} /> Refresh
                    </button>
                    <button className="action-btn btn-primary" onClick={exportCSV}>
                        <Download size={18} /> Export CSV
                    </button>
                    <button className="btn btn-upload" style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '0.5rem 1rem',
                        borderRadius: '6px',
                        fontWeight: '600',
                        fontSize: '0.85rem',
                        gap: '8px',
                        cursor: 'pointer',
                        border: '1px solid var(--border-medium)',
                        background: 'var(--bg-surface)',
                        color: 'var(--text-secondary)'
                    }} title="Upload supportive documents" onClick={() => fileInputRef.current.click()}>
                        <Upload size={18} /> Upload Docs
                    </button>
                    <input
                        type="file"
                        ref={fileInputRef}
                        style={{ display: 'none' }}
                        onChange={(e) => {
                            if (e.target.files.length > 0) {
                                alert(`File "${e.target.files[0].name}" selected for upload.`);
                            }
                        }}
                    />
                </div>
            </header>

            <div className="summary-stats">
                <motion.div className="stat-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                    <span className="stat-label">Total Unique Items</span>
                    <span className="stat-value">{stats.totalItems}</span>
                </motion.div>
                <motion.div className="stat-card in" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <TrendingUp size={16} />
                        <span className="stat-label">Total In (Qty/Kg)</span>
                    </div>
                    <span className="stat-value">+{stats.itemsIn.toLocaleString()}</span>
                </motion.div>
                <motion.div className="stat-card out" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <TrendingDown size={16} />
                        <span className="stat-label">Total Out (Qty/Kg)</span>
                    </div>
                    <span className="stat-value">-{stats.itemsOut.toLocaleString()}</span>
                </motion.div>
                <motion.div className="stat-card dead" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Box size={16} />
                        <span className="stat-label">Dead Items</span>
                    </div>
                    <span className="stat-value">{stats.deadItems}</span>
                </motion.div>
            </div>

            <motion.div
                className="section-container"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
            >
                <div className="section-header">
                    <h2>Live Inventory Track</h2>
                    <div className="search-bar" style={{ position: 'relative' }}>
                        <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                        <input
                            type="text"
                            placeholder="Filter by name or category..."
                            className="search-input"
                            style={{ paddingLeft: '2.5rem' }}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <div className="table-wrapper">
                    <table className="stock-table">
                        <thead>
                            <tr>
                                <th>Item Name</th>
                                <th>Category</th>
                                <th>Stock In</th>
                                <th>Stock Out</th>
                                <th>Balance</th>
                                <th>Action/Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredItems.length > 0 ? filteredItems.map((item) => (
                                <tr key={item.id}>
                                    <td style={{ fontWeight: 600 }}>{item.name}</td>
                                    <td><span className="category-tag">{item.category}</span></td>
                                    <td className="stock-in">+{item.totalIn.toFixed(2)}</td>
                                    <td className="stock-out">-{item.totalOut.toFixed(2)}</td>
                                    <td>
                                        <div className="current-box" style={{
                                            color: item.currentStock > 0 ? '#10b981' :
                                                item.currentStock < 0 ? '#ef4444' : '#94a3b8'
                                        }}>
                                            {item.currentStock.toFixed(2)}
                                        </div>
                                    </td>
                                    <td>
                                        {item.isDead ?
                                            <span className="status-dead">Dead Stock</span> :
                                            <span className="status-active">Active Item</span>
                                        }
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="6" style={{ textAlign: 'center', padding: '4rem', color: '#94a3b8' }}>
                                        <Package size={48} style={{ marginBottom: '1rem', opacity: 0.2 }} />
                                        <p>No items found matching your search</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </motion.div>
        </div>
    );
};

export default InventorySummary;
