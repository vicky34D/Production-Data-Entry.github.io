import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Plus, MoreHorizontal, ArrowUpRight, ArrowDownRight, Settings } from 'lucide-react';
import { safeGet } from '../utils/storage';
import './Dashboard.css';

const Dashboard = () => {
    const navigate = useNavigate();
    const [dateRange, setDateRange] = useState('This month');

    // Real Data State
    const [stats, setStats] = useState({
        totalProduction: 0,
        efficiency: 92.5, // Mocked for now, implies machine uptime
        materialUsage: 0,
        batchCount: 0,
        activeBatches: 0
    });

    useEffect(() => {
        // Fetch Data from LocalStorage
        const fgiData = safeGet('finishedGoodsData', []);
        const dsuData = safeGet('storeUpdateData', []);
        const batches = safeGet('productionBatches', []);

        // Calculate Totals
        const totalOutput = fgiData.reduce((acc, curr) => acc + (parseFloat(curr.totalPackedKg) || 0), 0);
        const batchCount = batches.length;
        const activeBatches = batches.filter(b => b.status === "In Production").length;

        // Calculate Material Usage (Only 'Usage OUT' or 'PRODUCTION_OUT')
        // Assuming default type is OUT if not specified, or checking types
        const totalUsage = dsuData.reduce((acc, curr) => {
            const isOut = !curr.type || curr.type === 'PRODUCTION_OUT' || curr.type === 'Usage OUT';
            return isOut ? acc + (parseFloat(curr.totalKg) || 0) : acc;
        }, 0);

        setStats({
            totalProduction: totalOutput,
            efficiency: 94.2, // Could be calculated based on target vs actual if available
            materialUsage: totalUsage,
            batchCount,
            activeBatches
        });
    }, []);

    const toggleDateRange = () => {
        setDateRange(prev => prev === 'This month' ? 'This year' : 'This month');
    };

    return (
        <div className="dashboard-container">
            <div className="dashboard-layout">
                {/* Main Column */}
                <div className="main-column">
                    {/* Action Bar */}
                    <div className="action-bar">
                        <div className="date-filter" onClick={toggleDateRange}>
                            <Calendar size={16} color="var(--text-secondary)" />
                            <span>{dateRange}</span>
                        </div>
                        <div className="widget-actions">
                            <button className="btn btn-outline" onClick={() => navigate('/items')}>
                                <Settings size={16} style={{ marginRight: '8px' }} />
                                Manage items
                            </button>
                            <button className="btn btn-fill" onClick={() => navigate('/plan')}>
                                <Plus size={16} style={{ marginRight: '8px' }} />
                                Add Plan
                            </button>
                        </div>
                    </div>

                    {/* Metrics Grid */}
                    <div className="metrics-grid">
                        {/* Card 1: Total Production */}
                        <div className="metric-card">
                            <div className="metric-header">
                                <span className="metric-title">Total Production</span>
                                <MoreHorizontal size={16} color="var(--text-secondary)" />
                            </div>
                            <div className="metric-value-row">
                                <div className="metric-value">{stats.totalProduction.toLocaleString()} kg</div>
                                <div className="trend-badge trend-up">
                                    <ArrowUpRight size={12} />
                                    <span>{stats.activeBatches > 0 ? '+ Active' : 'Stable'}</span>
                                </div>
                            </div>
                            <div className="metric-footer">
                                <div className="mini-stat">
                                    <ArrowUpRight size={12} color="#6366F1" />
                                    <span>{stats.batchCount} batches</span>
                                </div>
                                <div className="mini-stat">
                                    <Settings size={12} color="#6366F1" />
                                    <span>{stats.activeBatches} active</span>
                                </div>
                            </div>
                        </div>

                        {/* Card 2: Efficiency */}
                        <div className="metric-card">
                            <div className="metric-header">
                                <span className="metric-title">Efficiency Rate</span>
                                <MoreHorizontal size={16} color="var(--text-secondary)" />
                            </div>
                            <div className="metric-value-row">
                                <div className="metric-value">{stats.efficiency}%</div>
                                <div className="trend-badge trend-up">
                                    <ArrowUpRight size={12} />
                                    <span>6.3%</span>
                                </div>
                            </div>
                            <div className="metric-footer">
                                <div className="mini-stat">
                                    <span>Optimal</span>
                                </div>
                                <span style={{ opacity: 0.6 }}>vs last month</span>
                            </div>
                        </div>

                        {/* Card 3: Material Usage */}
                        <div className="metric-card">
                            <div className="metric-header">
                                <span className="metric-title">Material Usage</span>
                                <MoreHorizontal size={16} color="var(--text-secondary)" />
                            </div>
                            <div className="metric-value-row">
                                <div className="metric-value">{stats.materialUsage.toLocaleString()} kg</div>
                                <div className="trend-badge trend-down">
                                    <ArrowDownRight size={12} />
                                    <span>Monitor</span>
                                </div>
                            </div>
                            <div className="metric-footer">
                                <div className="mini-stat">
                                    <span>Consumed</span>
                                </div>
                                <div className="mini-stat">
                                    <span style={{ color: 'orange' }}>Check Stock</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Chart 1: Overview */}
                    <div className="chart-card">
                        <div className="chart-header">
                            <div>
                                <h3 className="chart-title">Production Overview</h3>
                                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Daily output vs target</p>
                            </div>
                            <div className="chart-legend">
                                <div className="legend-item">
                                    <span className="dot" style={{ background: 'var(--primary-color)' }}></span>
                                    <span>Actual</span>
                                </div>
                                <div className="legend-item">
                                    <span className="dot" style={{ background: '#E2E8F0' }}></span>
                                    <span>Target</span>
                                </div>
                            </div>
                        </div>
                        {/* CSS Visual Mock for Area Chart */}
                        <div className="chart-visual" style={{ alignItems: 'flex-end', height: '240px', justifyContent: 'space-between', padding: '0 1rem' }}>
                            <svg viewBox="0 0 100 40" preserveAspectRatio="none" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
                                <path
                                    d="M0,35 Q10,25 20,30 T40,20 T60,25 T80,10 T100,20 V40 H0 Z"
                                    fill="url(#gradient)"
                                    opacity="0.2"
                                />
                                <path
                                    d="M0,35 Q10,25 20,30 T40,20 T60,25 T80,10 T100,20"
                                    fill="none"
                                    stroke="var(--primary-color)"
                                    strokeWidth="0.5"
                                />
                                <defs>
                                    <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                                        <stop offset="0%" stopColor="var(--primary-color)" />
                                        <stop offset="100%" stopColor="white" stopOpacity="0" />
                                    </linearGradient>
                                </defs>
                            </svg>
                        </div>
                    </div>

                    {/* Chart 2: Budget vs Expense Bar Chart */}
                    <div className="chart-card">
                        <div className="chart-header">
                            <div>
                                <h3 className="chart-title">Material vs Output</h3>
                            </div>
                            <div className="date-filter" style={{ padding: '0.25rem 0.75rem' }}>
                                <span>This year</span>
                            </div>
                        </div>
                        <div className="chart-visual">
                            {/* Simple CSS Bars */}
                            {[40, 60, 55, 70, 45, 80, 65].map((h, i) => (
                                <div key={i} className="chart-bar-visual" style={{ height: `${h}%` }}></div>
                            ))}
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem', padding: '0 2%', color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                            <span>Jan</span><span>Feb</span><span>Mar</span><span>Apr</span><span>May</span><span>Jun</span><span>Jul</span>
                        </div>
                    </div>
                </div>

                {/* Right Column Stats */}
                <div className="stats-column">
                    <div className="stats-card">
                        <div className="chart-header" style={{ width: '100%', marginBottom: '0' }}>
                            <h3 className="chart-title">Statistics</h3>
                            <button style={{ border: 'none', background: 'none' }}>
                                <MoreHorizontal size={16} color="var(--text-secondary)" />
                            </button>
                        </div>
                        <div className="donut-chart-mock">
                            <span className="donut-value">{Math.round((stats.totalProduction / (stats.materialUsage || 1)) * 100) || 0}%</span>
                            <span className="donut-sub">Yield</span>
                        </div>
                        <div className="stats-list">
                            <div className="stat-row">
                                <span className="stat-dot" style={{ background: 'var(--primary-color)' }}></span>
                                <span>Output</span>
                            </div>
                            <div className="stat-row">
                                <span className="stat-dot" style={{ background: '#94A3B8' }}></span>
                                <span>Input Waste</span>
                            </div>
                            <div className="stat-row">
                                <span className="stat-dot" style={{ background: '#CBD5E1' }}></span>
                                <span>Recycled</span>
                            </div>
                        </div>
                    </div>

                    {/* Another promo/info card if needed. Can be converted to Quick Action */}
                    <div className="stats-card" style={{ background: 'var(--primary-color)', color: 'white' }}>
                        <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>Production Access</h3>
                        <p style={{ fontSize: '0.85rem', opacity: 0.8, marginBottom: '1rem', textAlign: 'center' }}>
                            Quickly jump to planning to schedule new batches.
                        </p>
                        <button
                            style={{ background: 'white', color: 'var(--primary-color)', padding: '0.5rem 1rem', borderRadius: '2rem', fontWeight: 600 }}
                            onClick={() => navigate('/plan')}
                        >
                            Open Planner
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
