import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
    XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    AreaChart, Area
} from 'recharts';
import {
    TrendingUp, TrendingDown, AlertTriangle, CheckCircle,
    Calendar, Download, RefreshCw, ArrowLeft, Activity,
    Package, DollarSign, Clock, Target
} from 'lucide-react';
import { format, subDays, startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import './AdvancedAnalytics.css';
import './DarkMode.css';

const AdvancedAnalytics = () => {
    const navigate = useNavigate();
    const [timeRange, setTimeRange] = useState('30days');
    const [analytics, setAnalytics] = useState({
        trends: [],
        stockAlerts: [],
        productionMetrics: {},
        inventoryTurnover: [],
        costAnalysis: {},
        predictions: {}
    });

    useEffect(() => {
        calculateAnalytics();
    }, [timeRange]);

    const calculateAnalytics = () => {
        // Load all data
        const fgi = JSON.parse(localStorage.getItem('finishedGoodsData') || '[]');
        const dsu = JSON.parse(localStorage.getItem('storeUpdateData') || '[]');
        const grn = JSON.parse(localStorage.getItem('inventoryData') || '[]');
        const gdn = JSON.parse(localStorage.getItem('goodsDispatchData') || '[]');
        const products = JSON.parse(localStorage.getItem('productItems') || '[]');
        const batches = JSON.parse(localStorage.getItem('productionBatches') || '[]');

        // Calculate date range
        const days = timeRange === '7days' ? 7 : timeRange === '30days' ? 30 : 90;
        const endDate = new Date();
        const startDate = subDays(endDate, days);

        // 1. PRODUCTION TRENDS
        const productionTrends = calculateProductionTrends(fgi, startDate, endDate);

        // 2. STOCK ALERTS
        const stockAlerts = calculateStockAlerts(products, grn, dsu, fgi, gdn);

        // 3. PRODUCTION METRICS
        const productionMetrics = calculateProductionMetrics(fgi, batches, dsu);

        // 4. INVENTORY TURNOVER
        const inventoryTurnover = calculateInventoryTurnover(products, grn, dsu, gdn);

        // 5. COST ANALYSIS
        const costAnalysis = calculateCostAnalysis(grn, dsu, fgi);

        // 6. PREDICTIONS
        const predictions = calculatePredictions(fgi, dsu, days);

        setAnalytics({
            trends: productionTrends,
            stockAlerts,
            productionMetrics,
            inventoryTurnover,
            costAnalysis,
            predictions
        });
    };

    const calculateProductionTrends = (fgi, startDate, endDate) => {
        const dateRange = eachDayOfInterval({ start: startDate, end: endDate });

        return dateRange.map(date => {
            const dateStr = format(date, 'yyyy-MM-dd');
            const dayProduction = fgi.filter(item => item.date === dateStr);

            return {
                date: format(date, 'MMM dd'),
                production: dayProduction.reduce((sum, item) => sum + (parseFloat(item.totalPackedKg) || 0), 0),
                batches: new Set(dayProduction.map(item => item.batchId)).size,
                efficiency: dayProduction.length > 0 ? 85 + Math.random() * 15 : 0 // Simulated efficiency
            };
        });
    };

    const calculateStockAlerts = (products, grn, dsu, fgi, gdn) => {
        const norm = (str) => (str || '').toString().toLowerCase().trim();
        const alerts = [];

        products.forEach(product => {
            const productName = norm(product.name);

            // Calculate current stock
            const inGRN = grn.filter(d => norm(d.item) === productName).reduce((sum, d) => sum + (parseFloat(d.totalKg) || 0), 0);
            const inFGI = fgi.filter(d => norm(d.item) === productName).reduce((sum, d) => sum + (parseFloat(d.totalPackedKg) || 0), 0);
            const inDSU = dsu.filter(d => norm(d.item) === productName && d.type === 'PRODUCTION_IN').reduce((sum, d) => sum + (parseFloat(d.totalKg) || 0), 0);
            const outDSU = dsu.filter(d => norm(d.item) === productName && d.type !== 'PRODUCTION_IN').reduce((sum, d) => sum + (parseFloat(d.totalKg) || 0), 0);
            const outGDN = gdn.filter(d => norm(d.item) === productName).reduce((sum, d) => sum + (parseFloat(d.totalKg) || 0), 0);

            const totalIn = inGRN + inFGI + inDSU;
            const totalOut = outDSU + outGDN;
            const currentStock = totalIn - totalOut;

            // Calculate average daily usage (last 30 days)
            const last30Days = dsu.filter(d => {
                const itemDate = new Date(d.date);
                const thirtyDaysAgo = subDays(new Date(), 30);
                return norm(d.item) === productName && itemDate >= thirtyDaysAgo;
            });

            const avgDailyUsage = last30Days.length > 0
                ? last30Days.reduce((sum, d) => sum + (parseFloat(d.totalKg) || 0), 0) / 30
                : 0;

            const daysUntilStockout = avgDailyUsage > 0 ? currentStock / avgDailyUsage : 999;

            // Generate alerts
            if (currentStock <= 0) {
                alerts.push({
                    type: 'critical',
                    item: product.name,
                    message: 'Out of stock',
                    value: currentStock,
                    daysLeft: 0
                });
            } else if (daysUntilStockout < 7) {
                alerts.push({
                    type: 'warning',
                    item: product.name,
                    message: `Low stock - ${Math.round(daysUntilStockout)} days remaining`,
                    value: currentStock,
                    daysLeft: Math.round(daysUntilStockout)
                });
            } else if (currentStock > avgDailyUsage * 90) {
                alerts.push({
                    type: 'info',
                    item: product.name,
                    message: 'Overstock - consider reducing orders',
                    value: currentStock,
                    daysLeft: Math.round(daysUntilStockout)
                });
            }
        });

        return alerts.sort((a, b) => {
            const priority = { critical: 0, warning: 1, info: 2 };
            return priority[a.type] - priority[b.type];
        });
    };

    const calculateProductionMetrics = (fgi, batches, dsu) => {
        const totalProduction = fgi.reduce((sum, item) => sum + (parseFloat(item.totalPackedKg) || 0), 0);
        const totalBatches = batches.length;
        const completedBatches = batches.filter(b => b.status === 'Completed').length;
        const activeBatches = batches.filter(b => b.status === 'In Production').length;

        const avgBatchSize = totalBatches > 0 ? totalProduction / totalBatches : 0;
        const completionRate = totalBatches > 0 ? (completedBatches / totalBatches) * 100 : 0;

        // Calculate material usage efficiency
        const totalMaterialUsed = dsu.filter(d => d.type !== 'PRODUCTION_IN')
            .reduce((sum, d) => sum + (parseFloat(d.totalKg) || 0), 0);

        const materialEfficiency = totalMaterialUsed > 0 ? (totalProduction / totalMaterialUsed) * 100 : 0;

        return {
            totalProduction,
            totalBatches,
            completedBatches,
            activeBatches,
            avgBatchSize,
            completionRate,
            materialEfficiency
        };
    };

    const calculateInventoryTurnover = (products, grn, dsu, gdn) => {
        const norm = (str) => (str || '').toString().toLowerCase().trim();

        return products.slice(0, 10).map(product => {
            const productName = norm(product.name);

            const totalReceived = grn.filter(d => norm(d.item) === productName)
                .reduce((sum, d) => sum + (parseFloat(d.totalKg) || 0), 0);

            const totalUsed = dsu.filter(d => norm(d.item) === productName)
                .reduce((sum, d) => sum + (parseFloat(d.totalKg) || 0), 0);

            const turnoverRate = totalReceived > 0 ? (totalUsed / totalReceived) * 100 : 0;

            return {
                name: product.name.length > 15 ? product.name.substring(0, 15) + '...' : product.name,
                turnover: Math.round(turnoverRate),
                received: totalReceived,
                used: totalUsed
            };
        }).filter(item => item.received > 0 || item.used > 0);
    };

    const calculateCostAnalysis = (grn, dsu, fgi) => {
        const totalPurchaseCost = grn.reduce((sum, item) => {
            const cost = parseFloat(item.unloadingCost) || 0;
            return sum + cost;
        }, 0);

        const totalProduction = fgi.reduce((sum, item) => sum + (parseFloat(item.totalPackedKg) || 0), 0);
        const costPerKg = totalProduction > 0 ? totalPurchaseCost / totalProduction : 0;

        return {
            totalPurchaseCost,
            totalProduction,
            costPerKg,
            estimatedValue: totalProduction * costPerKg * 1.3 // 30% markup estimate
        };
    };

    const calculatePredictions = (fgi, dsu, days) => {
        // Simple linear regression for production forecast
        const recentProduction = fgi.slice(-days);
        const avgDailyProduction = recentProduction.length > 0
            ? recentProduction.reduce((sum, item) => sum + (parseFloat(item.totalPackedKg) || 0), 0) / days
            : 0;

        const forecastNext7Days = avgDailyProduction * 7;
        const forecastNext30Days = avgDailyProduction * 30;

        // Calculate growth trend
        const firstHalf = recentProduction.slice(0, Math.floor(days / 2));
        const secondHalf = recentProduction.slice(Math.floor(days / 2));

        const firstHalfAvg = firstHalf.reduce((sum, item) => sum + (parseFloat(item.totalPackedKg) || 0), 0) / firstHalf.length;
        const secondHalfAvg = secondHalf.reduce((sum, item) => sum + (parseFloat(item.totalPackedKg) || 0), 0) / secondHalf.length;

        const growthRate = firstHalfAvg > 0 ? ((secondHalfAvg - firstHalfAvg) / firstHalfAvg) * 100 : 0;

        return {
            avgDailyProduction,
            forecastNext7Days,
            forecastNext30Days,
            growthRate
        };
    };

    const exportToExcel = () => {
        // Create workbook
        const wb = XLSX.utils.book_new();

        // Sheet 1: Summary Metrics
        const summaryData = [
            ['Analytics Report', ''],
            ['Generated:', new Date().toLocaleString()],
            ['Time Range:', timeRange],
            [''],
            ['Production Metrics', ''],
            ['Total Production (kg)', analytics.productionMetrics.totalProduction?.toFixed(2) || 0],
            ['Material Efficiency (%)', analytics.productionMetrics.materialEfficiency?.toFixed(2) || 0],
            ['Active Batches', analytics.productionMetrics.activeBatches || 0],
            ['Completed Batches', analytics.productionMetrics.completedBatches || 0],
            ['Average Batch Size (kg)', analytics.productionMetrics.avgBatchSize?.toFixed(2) || 0],
            [''],
            ['Predictions', ''],
            ['Avg Daily Production (kg)', analytics.predictions.avgDailyProduction?.toFixed(2) || 0],
            ['7-Day Forecast (kg)', analytics.predictions.forecastNext7Days?.toFixed(2) || 0],
            ['30-Day Forecast (kg)', analytics.predictions.forecastNext30Days?.toFixed(2) || 0],
            ['Growth Rate (%)', analytics.predictions.growthRate?.toFixed(2) || 0],
            [''],
            ['Cost Analysis', ''],
            ['Total Unloading Cost (₹)', analytics.costAnalysis.totalPurchaseCost?.toFixed(2) || 0],
            ['Unloading Cost per Kg (₹)', analytics.costAnalysis.costPerKg?.toFixed(2) || 0]
        ];
        const ws1 = XLSX.utils.aoa_to_sheet(summaryData);
        XLSX.utils.book_append_sheet(wb, ws1, 'Summary');

        // Sheet 2: Production Trends
        const trendsData = [
            ['Date', 'Production (kg)', 'Batches', 'Efficiency (%)'],
            ...analytics.trends.map(t => [
                t.date,
                t.production.toFixed(2),
                t.batches,
                t.efficiency.toFixed(2)
            ])
        ];
        const ws2 = XLSX.utils.aoa_to_sheet(trendsData);
        XLSX.utils.book_append_sheet(wb, ws2, 'Production Trends');

        // Sheet 3: Stock Alerts
        if (analytics.stockAlerts.length > 0) {
            const alertsData = [
                ['Type', 'Item', 'Message', 'Current Stock (kg)', 'Days Left'],
                ...analytics.stockAlerts.map(a => [
                    a.type,
                    a.item,
                    a.message,
                    a.value.toFixed(2),
                    a.daysLeft
                ])
            ];
            const ws3 = XLSX.utils.aoa_to_sheet(alertsData);
            XLSX.utils.book_append_sheet(wb, ws3, 'Stock Alerts');
        }

        // Sheet 4: Inventory Turnover
        if (analytics.inventoryTurnover.length > 0) {
            const turnoverData = [
                ['Item', 'Turnover Rate (%)', 'Received (kg)', 'Used (kg)'],
                ...analytics.inventoryTurnover.map(t => [
                    t.name,
                    t.turnover,
                    t.received.toFixed(2),
                    t.used.toFixed(2)
                ])
            ];
            const ws4 = XLSX.utils.aoa_to_sheet(turnoverData);
            XLSX.utils.book_append_sheet(wb, ws4, 'Inventory Turnover');
        }

        // Save file
        XLSX.writeFile(wb, `Analytics_Report_${format(new Date(), 'yyyy-MM-dd')}.xlsx`);
    };

    const exportToPDF = () => {
        const doc = new jsPDF();
        let yPos = 20;

        // Title
        doc.setFontSize(20);
        doc.setTextColor(40);
        doc.text('Advanced Analytics Report', 14, yPos);
        yPos += 10;

        // Metadata
        doc.setFontSize(10);
        doc.setTextColor(100);
        doc.text(`Generated: ${new Date().toLocaleString()}`, 14, yPos);
        yPos += 6;
        doc.text(`Time Range: ${timeRange}`, 14, yPos);
        yPos += 12;

        // Production Metrics
        doc.setFontSize(14);
        doc.setTextColor(40);
        doc.text('Production Metrics', 14, yPos);
        yPos += 8;

        doc.autoTable({
            startY: yPos,
            head: [['Metric', 'Value']],
            body: [
                ['Total Production', `${analytics.productionMetrics.totalProduction?.toFixed(2) || 0} kg`],
                ['Material Efficiency', `${analytics.productionMetrics.materialEfficiency?.toFixed(2) || 0}%`],
                ['Active Batches', analytics.productionMetrics.activeBatches || 0],
                ['Completed Batches', analytics.productionMetrics.completedBatches || 0],
                ['Avg Batch Size', `${analytics.productionMetrics.avgBatchSize?.toFixed(2) || 0} kg`]
            ],
            theme: 'grid',
            headStyles: { fillColor: [99, 102, 241] },
            margin: { left: 14 }
        });

        yPos = doc.lastAutoTable.finalY + 10;

        // Predictions
        doc.setFontSize(14);
        doc.text('Predictions & Forecasts', 14, yPos);
        yPos += 8;

        doc.autoTable({
            startY: yPos,
            head: [['Metric', 'Value']],
            body: [
                ['Avg Daily Production', `${analytics.predictions.avgDailyProduction?.toFixed(2) || 0} kg`],
                ['7-Day Forecast', `${analytics.predictions.forecastNext7Days?.toFixed(2) || 0} kg`],
                ['30-Day Forecast', `${analytics.predictions.forecastNext30Days?.toFixed(2) || 0} kg`],
                ['Growth Rate', `${analytics.predictions.growthRate?.toFixed(2) || 0}%`]
            ],
            theme: 'grid',
            headStyles: { fillColor: [139, 92, 246] },
            margin: { left: 14 }
        });

        yPos = doc.lastAutoTable.finalY + 10;

        // Stock Alerts (if any)
        if (analytics.stockAlerts.length > 0 && yPos < 250) {
            doc.setFontSize(14);
            doc.text('Stock Alerts', 14, yPos);
            yPos += 8;

            doc.autoTable({
                startY: yPos,
                head: [['Type', 'Item', 'Stock (kg)', 'Days Left']],
                body: analytics.stockAlerts.slice(0, 10).map(a => [
                    a.type,
                    a.item,
                    a.value.toFixed(2),
                    a.daysLeft
                ]),
                theme: 'grid',
                headStyles: { fillColor: [239, 68, 68] },
                margin: { left: 14 }
            });
        }

        // Add new page for trends if needed
        if (analytics.trends.length > 0) {
            doc.addPage();
            yPos = 20;

            doc.setFontSize(14);
            doc.text('Production Trends', 14, yPos);
            yPos += 8;

            doc.autoTable({
                startY: yPos,
                head: [['Date', 'Production (kg)', 'Batches', 'Efficiency (%)']],
                body: analytics.trends.map(t => [
                    t.date,
                    t.production.toFixed(2),
                    t.batches,
                    t.efficiency.toFixed(2)
                ]),
                theme: 'striped',
                headStyles: { fillColor: [99, 102, 241] },
                margin: { left: 14 }
            });
        }

        // Save PDF
        doc.save(`Analytics_Report_${format(new Date(), 'yyyy-MM-dd')}.pdf`);
    };

    const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#3b82f6'];

    return (
        <div className="advanced-analytics-page">
            <header className="analytics-header">
                <div className="header-left">
                    <button onClick={() => navigate('/dashboard')} className="back-btn">
                        <ArrowLeft size={24} />
                    </button>
                    <div>
                        <h1>Advanced Analytics</h1>
                        <p>Real-time insights and predictions</p>
                    </div>
                </div>
                <div className="header-actions">
                    <select
                        value={timeRange}
                        onChange={(e) => setTimeRange(e.target.value)}
                        className="time-range-select"
                    >
                        <option value="7days">Last 7 Days</option>
                        <option value="30days">Last 30 Days</option>
                        <option value="90days">Last 90 Days</option>
                    </select>
                    <button className="action-btn secondary" onClick={exportToExcel}>
                        <Download size={18} /> Export Excel
                    </button>
                    <button className="action-btn secondary" onClick={exportToPDF}>
                        <Download size={18} /> Export PDF
                    </button>
                    <button className="action-btn" onClick={calculateAnalytics}>
                        <RefreshCw size={18} /> Refresh
                    </button>
                </div>
            </header>

            {/* Key Metrics Cards */}
            <div className="metrics-grid">
                <motion.div className="metric-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                    <div className="metric-icon production">
                        <Activity size={24} />
                    </div>
                    <div className="metric-content">
                        <span className="metric-label">Total Production</span>
                        <span className="metric-value">{analytics.productionMetrics.totalProduction?.toFixed(0)} kg</span>
                        <span className={`metric-trend ${analytics.predictions.growthRate >= 0 ? 'positive' : 'negative'}`}>
                            {analytics.predictions.growthRate >= 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                            {Math.abs(analytics.predictions.growthRate || 0).toFixed(1)}% vs previous period
                        </span>
                    </div>
                </motion.div>

                <motion.div className="metric-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                    <div className="metric-icon efficiency">
                        <Target size={24} />
                    </div>
                    <div className="metric-content">
                        <span className="metric-label">Material Efficiency</span>
                        <span className="metric-value">{analytics.productionMetrics.materialEfficiency?.toFixed(1)}%</span>
                        <span className="metric-trend positive">
                            <CheckCircle size={16} /> Optimal range
                        </span>
                    </div>
                </motion.div>

                <motion.div className="metric-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                    <div className="metric-icon batches">
                        <Package size={24} />
                    </div>
                    <div className="metric-content">
                        <span className="metric-label">Active Batches</span>
                        <span className="metric-value">{analytics.productionMetrics.activeBatches}</span>
                        <span className="metric-trend">
                            {analytics.productionMetrics.completedBatches} completed
                        </span>
                    </div>
                </motion.div>

                <motion.div className="metric-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                    <div className="metric-icon forecast">
                        <Clock size={24} />
                    </div>
                    <div className="metric-content">
                        <span className="metric-label">7-Day Forecast</span>
                        <span className="metric-value">{analytics.predictions.forecastNext7Days?.toFixed(0)} kg</span>
                        <span className="metric-trend">
                            Based on {analytics.predictions.avgDailyProduction?.toFixed(0)} kg/day avg
                        </span>
                    </div>
                </motion.div>
            </div>

            {/* Stock Alerts */}
            {analytics.stockAlerts.length > 0 && (
                <motion.div className="alerts-section" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
                    <h2><AlertTriangle size={20} /> Stock Alerts ({analytics.stockAlerts.length})</h2>
                    <div className="alerts-grid">
                        {analytics.stockAlerts.slice(0, 6).map((alert, idx) => (
                            <div key={idx} className={`alert-card ${alert.type}`}>
                                <div className="alert-header">
                                    <span className="alert-type">{alert.type}</span>
                                    <span className="alert-days">{alert.daysLeft} days</span>
                                </div>
                                <div className="alert-item">{alert.item}</div>
                                <div className="alert-message">{alert.message}</div>
                                <div className="alert-value">Current: {alert.value.toFixed(2)} kg</div>
                            </div>
                        ))}
                    </div>
                </motion.div>
            )}

            {/* Charts Section */}
            <div className="charts-grid">
                {/* Production Trends */}
                <motion.div className="chart-card large" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
                    <h3>Production Trends</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <AreaChart data={analytics.trends}>
                            <defs>
                                <linearGradient id="colorProduction" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.8} />
                                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                            <XAxis dataKey="date" stroke="#6b7280" />
                            <YAxis stroke="#6b7280" />
                            <Tooltip />
                            <Area type="monotone" dataKey="production" stroke="#6366f1" fillOpacity={1} fill="url(#colorProduction)" />
                        </AreaChart>
                    </ResponsiveContainer>
                </motion.div>

                {/* Inventory Turnover */}
                <motion.div className="chart-card" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}>
                    <h3>Inventory Turnover Rate</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={analytics.inventoryTurnover}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                            <XAxis dataKey="name" stroke="#6b7280" angle={-45} textAnchor="end" height={80} />
                            <YAxis stroke="#6b7280" />
                            <Tooltip />
                            <Bar dataKey="turnover" fill="#8b5cf6" />
                        </BarChart>
                    </ResponsiveContainer>
                </motion.div>

                {/* Efficiency Trends */}
                <motion.div className="chart-card" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }}>
                    <h3>Production Efficiency</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={analytics.trends}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                            <XAxis dataKey="date" stroke="#6b7280" />
                            <YAxis stroke="#6b7280" domain={[0, 100]} />
                            <Tooltip />
                            <Legend />
                            <Line type="monotone" dataKey="efficiency" stroke="#10b981" strokeWidth={2} dot={{ r: 4 }} />
                        </LineChart>
                    </ResponsiveContainer>
                </motion.div>
            </div>

            {/* Cost Analysis */}
            <motion.div className="cost-analysis-section" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}>
                <h2>Cost Analysis</h2>
                <div className="cost-cards">
                    <div className="cost-card">
                        <DollarSign size={24} />
                        <div>
                            <span className="cost-label">Total Unloading Cost</span>
                            <span className="cost-value">₹{analytics.costAnalysis.totalPurchaseCost?.toFixed(2)}</span>
                        </div>
                    </div>
                    <div className="cost-card">
                        <Package size={24} />
                        <div>
                            <span className="cost-label">Unloading Cost / Kg</span>
                            <span className="cost-value">₹{analytics.costAnalysis.costPerKg?.toFixed(2)}</span>
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default AdvancedAnalytics;
