import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    ArrowLeft, Plus, Play, Download, Save, Trash2, Eye,
    Filter, Calendar, BarChart3, PieChart, LineChart as LineChartIcon,
    Table, FileText, Settings
} from 'lucide-react';
import { format } from 'date-fns';
import * as XLSX from 'xlsx';
import './CustomReportBuilder.css';
import './DarkMode.css';

const CustomReportBuilder = () => {
    const navigate = useNavigate();
    const [savedReports, setSavedReports] = useState([]);
    const [showBuilder, setShowBuilder] = useState(false);
    const [reportConfig, setReportConfig] = useState({
        name: '',
        dataSource: 'finishedGoods',
        dateRange: 'last30days',
        startDate: '',
        endDate: '',
        columns: [],
        filters: [],
        groupBy: '',
        sortBy: '',
        chartType: 'table'
    });
    const [reportData, setReportData] = useState([]);
    const [showPreview, setShowPreview] = useState(false);

    const dataSourceOptions = [
        { value: 'finishedGoods', label: 'Finished Goods Inventory', fields: ['date', 'customerName', 'item', 'totalBags', 'kgPerBag', 'totalPackedKg', 'batchId'] },
        { value: 'grn', label: 'Goods Received Note', fields: ['date', 'poNumber', 'supplierInvoice', 'supplierName', 'item', 'totalBags', 'qtyPerBag', 'totalKg', 'unloadingCost'] },
        { value: 'dailyStore', label: 'Daily Store Update', fields: ['date', 'item', 'totalBags', 'qtyPerBag', 'totalKg', 'type'] },
        { value: 'goodsDispatch', label: 'Goods Dispatch Note', fields: ['date', 'customerName', 'item', 'totalBags', 'qtyPerBag', 'totalKg'] },
        { value: 'productionBatches', label: 'Production Batches', fields: ['batchId', 'targetProduct', 'targetQuantity', 'status', 'createdAt'] }
    ];

    useEffect(() => {
        loadSavedReports();
    }, []);

    const loadSavedReports = () => {
        const saved = JSON.parse(localStorage.getItem('customReports') || '[]');
        setSavedReports(saved);
    };

    const saveReport = () => {
        if (!reportConfig.name) {
            alert('Please enter a report name');
            return;
        }

        const report = {
            id: Date.now().toString(),
            ...reportConfig,
            createdAt: new Date().toISOString()
        };

        const updated = [...savedReports, report];
        localStorage.setItem('customReports', JSON.stringify(updated));
        setSavedReports(updated);
        alert('Report saved successfully!');
    };

    const deleteReport = (id) => {
        if (window.confirm('Delete this report?')) {
            const updated = savedReports.filter(r => r.id !== id);
            localStorage.setItem('customReports', JSON.stringify(updated));
            setSavedReports(updated);
        }
    };

    const loadReport = (report) => {
        setReportConfig(report);
        setShowBuilder(true);
    };

    const getDataSourceFields = () => {
        const source = dataSourceOptions.find(ds => ds.value === reportConfig.dataSource);
        return source ? source.fields : [];
    };

    const generateReport = () => {
        // Load data based on source
        let data = [];
        const storageKey = {
            'finishedGoods': 'finishedGoodsData',
            'grn': 'inventoryData',
            'dailyStore': 'storeUpdateData',
            'goodsDispatch': 'goodsDispatchData',
            'productionBatches': 'productionBatches'
        }[reportConfig.dataSource];

        data = JSON.parse(localStorage.getItem(storageKey) || '[]');

        // Apply date filters
        if (reportConfig.dateRange === 'custom' && reportConfig.startDate && reportConfig.endDate) {
            data = data.filter(item => {
                const itemDate = new Date(item.date || item.createdAt);
                return itemDate >= new Date(reportConfig.startDate) && itemDate <= new Date(reportConfig.endDate);
            });
        } else if (reportConfig.dateRange === 'last7days') {
            const sevenDaysAgo = new Date();
            sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
            data = data.filter(item => new Date(item.date || item.createdAt) >= sevenDaysAgo);
        } else if (reportConfig.dateRange === 'last30days') {
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
            data = data.filter(item => new Date(item.date || item.createdAt) >= thirtyDaysAgo);
        }

        // Apply custom filters
        reportConfig.filters.forEach(filter => {
            if (filter.field && filter.value) {
                data = data.filter(item => {
                    const itemValue = String(item[filter.field] || '').toLowerCase();
                    const filterValue = String(filter.value).toLowerCase();
                    return itemValue.includes(filterValue);
                });
            }
        });

        // Select columns
        if (reportConfig.columns.length > 0) {
            data = data.map(item => {
                const filtered = {};
                reportConfig.columns.forEach(col => {
                    filtered[col] = item[col];
                });
                return filtered;
            });
        }

        // Sort
        if (reportConfig.sortBy) {
            data.sort((a, b) => {
                const aVal = a[reportConfig.sortBy];
                const bVal = b[reportConfig.sortBy];
                if (typeof aVal === 'number') return bVal - aVal;
                return String(bVal).localeCompare(String(aVal));
            });
        }

        setReportData(data);
        setShowPreview(true);
    };

    const exportReport = (format) => {
        if (reportData.length === 0) {
            alert('No data to export. Please generate the report first.');
            return;
        }

        if (format === 'excel') {
            const ws = XLSX.utils.json_to_sheet(reportData);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, 'Report');
            XLSX.writeFile(wb, `${reportConfig.name || 'Custom_Report'}_${format(new Date(), 'yyyy-MM-dd')}.xlsx`);
        } else if (format === 'csv') {
            const headers = Object.keys(reportData[0] || {});
            const csvContent = [
                headers.join(','),
                ...reportData.map(row => headers.map(h => row[h]).join(','))
            ].join('\n');

            const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', `${reportConfig.name || 'Custom_Report'}_${format(new Date(), 'yyyy-MM-dd')}.csv`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        }
    };

    const toggleColumn = (field) => {
        if (reportConfig.columns.includes(field)) {
            setReportConfig({
                ...reportConfig,
                columns: reportConfig.columns.filter(c => c !== field)
            });
        } else {
            setReportConfig({
                ...reportConfig,
                columns: [...reportConfig.columns, field]
            });
        }
    };

    const addFilter = () => {
        setReportConfig({
            ...reportConfig,
            filters: [...reportConfig.filters, { field: '', value: '' }]
        });
    };

    const updateFilter = (index, key, value) => {
        const updated = [...reportConfig.filters];
        updated[index][key] = value;
        setReportConfig({ ...reportConfig, filters: updated });
    };

    const removeFilter = (index) => {
        setReportConfig({
            ...reportConfig,
            filters: reportConfig.filters.filter((_, i) => i !== index)
        });
    };

    return (
        <div className="custom-report-builder-page">
            <header className="report-header">
                <div className="header-left">
                    <button onClick={() => navigate('/analytics')} className="back-btn">
                        <ArrowLeft size={24} />
                    </button>
                    <div>
                        <h1>Custom Report Builder</h1>
                        <p>Create and save custom reports</p>
                    </div>
                </div>
                <div className="header-actions">
                    <button className="action-btn" onClick={() => setShowBuilder(!showBuilder)}>
                        <Plus size={18} /> {showBuilder ? 'View Saved Reports' : 'New Report'}
                    </button>
                </div>
            </header>

            {!showBuilder ? (
                /* Saved Reports List */
                <div className="saved-reports-section">
                    <h2>Saved Reports ({savedReports.length})</h2>
                    {savedReports.length === 0 ? (
                        <div className="empty-state">
                            <FileText size={64} />
                            <p>No saved reports yet</p>
                            <button className="action-btn" onClick={() => setShowBuilder(true)}>
                                <Plus size={18} /> Create Your First Report
                            </button>
                        </div>
                    ) : (
                        <div className="reports-grid">
                            {savedReports.map(report => (
                                <motion.div
                                    key={report.id}
                                    className="report-card"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                >
                                    <div className="report-card-header">
                                        <h3>{report.name}</h3>
                                        <div className="report-actions">
                                            <button onClick={() => loadReport(report)} title="Edit">
                                                <Eye size={16} />
                                            </button>
                                            <button onClick={() => deleteReport(report.id)} title="Delete">
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>
                                    <div className="report-card-meta">
                                        <span>Source: {dataSourceOptions.find(ds => ds.value === report.dataSource)?.label}</span>
                                        <span>Created: {format(new Date(report.createdAt), 'MMM dd, yyyy')}</span>
                                    </div>
                                    <div className="report-card-footer">
                                        <span className="report-columns">{report.columns.length} columns</span>
                                        <span className="report-filters">{report.filters.length} filters</span>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </div>
            ) : (
                /* Report Builder */
                <div className="report-builder-section">
                    <div className="builder-sidebar">
                        <div className="builder-section">
                            <h3><Settings size={18} /> Basic Settings</h3>
                            <div className="form-group">
                                <label>Report Name</label>
                                <input
                                    type="text"
                                    placeholder="My Custom Report"
                                    value={reportConfig.name}
                                    onChange={(e) => setReportConfig({ ...reportConfig, name: e.target.value })}
                                />
                            </div>

                            <div className="form-group">
                                <label>Data Source</label>
                                <select
                                    value={reportConfig.dataSource}
                                    onChange={(e) => setReportConfig({ ...reportConfig, dataSource: e.target.value, columns: [] })}
                                >
                                    {dataSourceOptions.map(ds => (
                                        <option key={ds.value} value={ds.value}>{ds.label}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-group">
                                <label>Date Range</label>
                                <select
                                    value={reportConfig.dateRange}
                                    onChange={(e) => setReportConfig({ ...reportConfig, dateRange: e.target.value })}
                                >
                                    <option value="all">All Time</option>
                                    <option value="last7days">Last 7 Days</option>
                                    <option value="last30days">Last 30 Days</option>
                                    <option value="custom">Custom Range</option>
                                </select>
                            </div>

                            {reportConfig.dateRange === 'custom' && (
                                <>
                                    <div className="form-group">
                                        <label>Start Date</label>
                                        <input
                                            type="date"
                                            value={reportConfig.startDate}
                                            onChange={(e) => setReportConfig({ ...reportConfig, startDate: e.target.value })}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>End Date</label>
                                        <input
                                            type="date"
                                            value={reportConfig.endDate}
                                            onChange={(e) => setReportConfig({ ...reportConfig, endDate: e.target.value })}
                                        />
                                    </div>
                                </>
                            )}
                        </div>

                        <div className="builder-section">
                            <h3><Table size={18} /> Columns</h3>
                            <div className="columns-list">
                                {getDataSourceFields().map(field => (
                                    <label key={field} className="checkbox-label">
                                        <input
                                            type="checkbox"
                                            checked={reportConfig.columns.includes(field)}
                                            onChange={() => toggleColumn(field)}
                                        />
                                        <span>{field}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        <div className="builder-section">
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <h3><Filter size={18} /> Filters</h3>
                                <button className="icon-btn" onClick={addFilter}>
                                    <Plus size={16} />
                                </button>
                            </div>
                            {reportConfig.filters.map((filter, idx) => (
                                <div key={idx} className="filter-row">
                                    <select
                                        value={filter.field}
                                        onChange={(e) => updateFilter(idx, 'field', e.target.value)}
                                    >
                                        <option value="">Select field</option>
                                        {getDataSourceFields().map(field => (
                                            <option key={field} value={field}>{field}</option>
                                        ))}
                                    </select>
                                    <input
                                        type="text"
                                        placeholder="Value"
                                        value={filter.value}
                                        onChange={(e) => updateFilter(idx, 'value', e.target.value)}
                                    />
                                    <button className="icon-btn danger" onClick={() => removeFilter(idx)}>
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            ))}
                        </div>

                        <div className="builder-actions">
                            <button className="btn-secondary" onClick={saveReport}>
                                <Save size={18} /> Save Report
                            </button>
                            <button className="btn-primary" onClick={generateReport}>
                                <Play size={18} /> Generate
                            </button>
                        </div>
                    </div>

                    {showPreview && (
                        <div className="builder-preview">
                            <div className="preview-header">
                                <h3>Preview ({reportData.length} rows)</h3>
                                <div className="preview-actions">
                                    <button className="btn-secondary" onClick={() => exportReport('csv')}>
                                        <Download size={16} /> CSV
                                    </button>
                                    <button className="btn-primary" onClick={() => exportReport('excel')}>
                                        <Download size={16} /> Excel
                                    </button>
                                </div>
                            </div>
                            <div className="preview-table-wrapper">
                                <table className="preview-table">
                                    <thead>
                                        <tr>
                                            {Object.keys(reportData[0] || {}).map(key => (
                                                <th key={key}>{key}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {reportData.slice(0, 100).map((row, idx) => (
                                            <tr key={idx}>
                                                {Object.values(row).map((val, i) => (
                                                    <td key={i}>{String(val)}</td>
                                                ))}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default CustomReportBuilder;
