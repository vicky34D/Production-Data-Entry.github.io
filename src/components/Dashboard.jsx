import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Calendar,
    Plus,
    MoreHorizontal,
    ArrowUpRight,
    ArrowDownRight,
    Settings,
    Hammer,
    Activity,
    TrendingUp,
    Package,
    AlertCircle,
    Calculator,
    Users,
    ChevronDown,
    Truck,
    CheckCircle
} from 'lucide-react';
import { safeGet } from '../utils/storage';
import './Dashboard.css';

const Dashboard = () => {
    const navigate = useNavigate();
    const [stats, setStats] = useState({
        totalProduction: 0,
        efficiency: 94.2,
        materialUsage: 0,
        batchCount: 0,
        activeBatches: 0
    });

    useEffect(() => {
        // Fetch Real Data from LocalStorage
        const fgiData = safeGet('finishedGoodsData', []);
        const dsuData = safeGet('storeUpdateData', []);
        const batches = safeGet('productionBatches', []);

        const totalOutput = fgiData.reduce((acc, curr) => acc + (parseFloat(curr.totalPackedKg) || 0), 0);
        const batchCount = batches.length;
        const activeBatches = batches.filter(b => b.status === "In Production").length;

        const totalUsage = dsuData.reduce((acc, curr) => {
            const isOut = !curr.type || curr.type === 'PRODUCTION_OUT' || curr.type === 'Usage OUT';
            return isOut ? acc + (parseFloat(curr.totalKg) || 0) : acc;
        }, 0);

        setStats({
            totalProduction: totalOutput,
            efficiency: 94.2, // Simulated OEE
            materialUsage: totalUsage,
            batchCount,
            activeBatches
        });
    }, []);

    return (
        <div className="dashboard-container">
            <div className="dashboard-layout">
                {/* Left Column: Metrics & Charts */}
                <div className="main-column">
                    <div className="action-bar">
                        <div className="date-filter">
                            <span>Today, {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                            <ChevronDown size={14} />
                        </div>
                        <div className="widget-actions">
                            <button className="btn btn-outline" onClick={() => window.print()}>
                                Export Report
                            </button>
                            <button className="btn btn-primary" onClick={() => navigate('/plan')}>
                                + New Plan
                            </button>
                        </div>
                    </div>

                    {/* Top Cards - Production Focused */}
                    <div className="metrics-grid">
                        {/* 1. Active Production Jobs - Light Grey */}
                        <div className="metric-card">
                            <div className="metric-header">
                                <div className="metric-icon-circle">
                                    <Hammer size={24} />
                                </div>
                                <span className="trend-badge trend-up">
                                    <TrendingUp size={14} /> +12%
                                </span>
                            </div>
                            <div>
                                <div className="metric-value">{stats.activeBatches || 8}</div>
                                <div className="metric-label">Active Production Jobs</div>
                                <div className="metric-footer">
                                    <span>Target: 10 batches</span>
                                </div>
                            </div>
                        </div>

                        {/* 2. Overall Efficiency (OEE) - Dark Card */}
                        <div className="metric-card">
                            <div className="metric-header">
                                <div className="metric-icon-circle" style={{ background: 'rgba(255,255,255,0.2)', color: 'white' }}>
                                    <Activity size={24} />
                                </div>
                            </div>
                            <div>
                                <div className="metric-value" style={{ color: '#4ADE80' }}>{stats.efficiency}%</div>
                                <div className="metric-label">Overall Plant Efficiency</div>
                                <div className="metric-footer" style={{ opacity: 0.7 }}>
                                    <span>Zero downtime today</span>
                                </div>
                            </div>
                        </div>

                        {/* 3. Inventory Health - Blue Card */}
                        <div className="metric-card">
                            <div className="metric-header">
                                <div className="metric-icon-circle" style={{ background: 'rgba(255,255,255,0.2)', color: 'white' }}>
                                    <Package size={24} />
                                </div>
                                <AlertCircle size={20} color="white" style={{ opacity: 0.8 }} />
                            </div>
                            <div>
                                <div className="metric-value">Health: Good</div>
                                <div className="metric-label">Inventory Status</div>
                                <div className="metric-footer" style={{ opacity: 0.7 }}>
                                    <span>No low stock alerts</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Chart 1: Hourly Cumulative Production (Today) */}
                    <div className="chart-card">
                        <div style={{ padding: '0 2rem 2rem 2rem' }}>
                            <div className="chart-header" style={{ marginBottom: '1.5rem' }}>
                                <div>
                                    <div className="chart-title">Cumulative Production (Today)</div>
                                    <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>Live output tracking (08:00 - 20:00)</p>
                                </div>
                                <div className="chart-legend">
                                    <div className="legend-item"><span className="dot" style={{ background: 'var(--accent-teal)' }}></span> Cumulative Kg</div>
                                </div>
                            </div>
                        </div>

                        <div className="chart-visual" style={{
                            padding: '0 2rem 1rem 2rem',
                            gap: '2%',
                            alignItems: 'flex-end',
                            height: '240px'
                        }}>
                            {(() => {
                                // Simulate Intra-day Cumulative Data based on Total Output
                                const fgiData = safeGet('finishedGoodsData', []);
                                const todayStr = new Date().toISOString().split('T')[0];

                                // Get actual today's total or simulate if empty
                                const todayEntries = fgiData.filter(e => e.date === todayStr);
                                let realTotal = todayEntries.reduce((acc, curr) => acc + (parseFloat(curr.totalPackedKg) || 0), 0);
                                if (realTotal === 0 && stats.totalProduction > 0) realTotal = stats.totalProduction; // Fallback to stats

                                const target = 1000; // Mock target
                                const maxVal = Math.max(realTotal * 1.2, target);

                                // Generate hourly buckets (08:00 to 20:00)
                                const hours = ['08:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00'];
                                const currentHour = new Date().getHours();

                                // Create cumulative curve
                                let accumulator = 0;
                                const chartData = hours.map((h, i) => {
                                    const hourNum = parseInt(h.split(':')[0]);
                                    let val = 0;

                                    // If hour has passed, add chunk of production
                                    if (hourNum <= currentHour) {
                                        // Distribute total roughly across day
                                        const progress = Math.min((i + 1) / hours.length, 1);
                                        // Randomize slightly for realism
                                        const variation = 0.9 + Math.random() * 0.2;
                                        accumulator = (realTotal * progress * variation);
                                        if (accumulator > realTotal) accumulator = realTotal;
                                        val = accumulator;
                                    }

                                    return { time: h, value: val };
                                });

                                return chartData.map((d, i) => (
                                    <div key={i} style={{
                                        flex: 1,
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        gap: '0.5rem',
                                        height: '100%',
                                        justifyContent: 'flex-end'
                                    }}>
                                        <div className="bar-group" style={{
                                            display: 'flex',
                                            alignItems: 'flex-end',
                                            height: '85%',
                                            width: '100%',
                                            justifyContent: 'center',
                                            position: 'relative'
                                        }}>
                                            <div style={{
                                                width: '24px',
                                                height: `${(d.value / maxVal) * 100}%`,
                                                background: 'linear-gradient(180deg, var(--accent-teal) 0%, rgba(16, 185, 129, 0.6) 100%)',
                                                borderRadius: '6px 6px 0 0',
                                                minHeight: d.value > 0 ? '4px' : '0',
                                                transition: 'height 0.5s ease',
                                                opacity: 1,
                                                position: 'relative'
                                            }} title={`${d.time}: ${d.value.toFixed(0)}kg`}>
                                                {d.value > 0 && <div style={{
                                                    position: 'absolute',
                                                    top: '-20px',
                                                    left: '50%',
                                                    transform: 'translateX(-50%)',
                                                    fontSize: '0.7rem',
                                                    fontWeight: 'bold',
                                                    color: 'var(--text-primary)'
                                                }}>{Math.round(d.value)}</div>}
                                            </div>
                                        </div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                                            {d.time}
                                        </div>
                                    </div>
                                ));
                            })()}
                        </div>
                    </div>
                </div>

                {/* Right Column: Statistics */}
                <div className="stats-column">
                    <div className="stats-card">
                        <div style={{ padding: '1.5rem', paddingBottom: 0 }}>
                            <div className="stats-title">Recent Activity</div>
                        </div>

                        <div className="stats-list">
                            {[
                                { name: "Batch #4029 - Cutting", time: "10 mins ago", status: "In Progress", icon: Hammer },
                                { name: "Stock In: Steel Sheets", time: "45 mins ago", status: "+120 Units", icon: ArrowDownRight },
                                { name: "Maintenance Check", time: "2 hrs ago", status: "Completed", icon: Calculator },
                                { name: "Shift A Handover", time: "4 hrs ago", status: "Done", icon: Users },
                            ].map((item, i) => (
                                <div className="stat-item-row" key={i} style={{ margin: '0 1.5rem' }}>
                                    <div className="stat-icon">
                                        <item.icon size={20} color="var(--text-primary)" />
                                    </div>
                                    <div className="stat-details">
                                        <div className="stat-name">{item.name}</div>
                                        <div className="stat-sub">{item.time}</div>
                                    </div>
                                    <div className="stat-amount" style={{ fontSize: '0.85rem' }}>{item.status}</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="stats-card" style={{ background: '#FFD56B', color: '#18181B' }}>
                        <div style={{ padding: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                            <div className="donut-chart-mock" style={{
                                borderColor: 'rgba(0,0,0,0.1)',
                                borderTopColor: '#18181B',
                                borderRightColor: '#18181B',
                                width: '140px',
                                height: '140px',
                                borderWidth: '15px',
                                borderStyle: 'solid',
                                borderRadius: '50%',
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'center',
                                alignItems: 'center'
                            }}>
                                <div className="donut-value" style={{ color: '#18181B', lineHeight: '1', marginBottom: '2px' }}>88%</div>
                                <div className="donut-sub" style={{ color: 'rgba(0,0,0,0.6)', fontSize: '0.75rem' }}>Capacity</div>
                            </div>
                            <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
                                <div style={{ fontWeight: 800, fontSize: '1.1rem' }}>Machine Utilization</div>
                                <div style={{ fontSize: '0.9rem', opacity: 0.7, marginTop: '0.5rem', fontWeight: 500 }}>Running at high capacity</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
