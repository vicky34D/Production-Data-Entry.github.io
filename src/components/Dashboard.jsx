import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    MoreVertical,
    Mail,
    Phone,
    Video,
    Calendar as CalendarIcon,
    Clock,
    User,
    MapPin,
    ChevronDown,
    Plus,
    ArrowRight,
    Search
} from 'lucide-react';
import { safeGet } from '../utils/storage';
import './Dashboard.css';

const Dashboard = () => {
    // Data Logic
    const [productionData, setProductionData] = useState(() => safeGet('agarbattiDataWet', []));
    const todayStr = new Date().toISOString().split('T')[0];

    // Derived Stats
    const filteredData = productionData.filter(item => item.date === todayStr);
    const totalWeight = filteredData.reduce((sum, item) => sum + item.weight, 0);
    const activeOperators = new Set(filteredData.map(e => e.operator)).size;

    // Machine Grouping for "Projects"
    const machineGroups = {};
    filteredData.forEach(item => {
        if (!machineGroups[item.machine]) {
            machineGroups[item.machine] = { weight: 0, trays: 0 };
        }
        machineGroups[item.machine].weight += item.weight;
        machineGroups[item.machine].trays += 1;
    });

    const machines = Object.keys(machineGroups).length > 0
        ? Object.keys(machineGroups).map(k => ({ id: k, ...machineGroups[k] }))
        : [
            { id: 'M1', weight: 0, trays: 0, status: 'Idle' },
            { id: 'M2', weight: 0, trays: 0, status: 'Idle' },
            { id: 'M3', weight: 0, trays: 0, status: 'Idle' }
        ];

    return (
        <div className="dashboard-container">
            <div className="dashboard-layout">
                {/* Left Column */}
                <div className="left-column">
                    {/* Profile Card */}
                    <div className="card profile-card">
                        <div className="profile-header">
                            <ArrowRight size={20} />
                            <div style={{ fontWeight: 600 }}>My Profile</div>
                            <div className="icon-btn"><MoreVertical size={16} /></div>
                        </div>

                        <div className="profile-pic-container">
                            <div className="profile-pic" style={{ background: '#ddd', overflow: 'hidden' }}>
                                <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Robert" alt="Profile" style={{ width: '100%', height: '100%' }} />
                            </div>
                        </div>

                        <div className="profile-name">Robert Smith</div>
                        <div className="profile-role">Production Manager</div>

                        <div className="profile-actions">
                            <button className="action-circle"><Mail size={18} /></button>
                            <button className="action-circle" style={{ background: 'white', border: '1px solid #eee', color: '#333' }}><Phone size={18} /></button>
                            <button className="action-circle" style={{ background: 'white', border: '1px solid #eee', color: '#333' }}><Video size={18} /></button>
                        </div>

                        <div className="time-slot" style={{ marginTop: '1.5rem' }}>
                            <div style={{ textAlign: 'left' }}>
                                <div style={{ fontSize: '0.8rem', color: '#888' }}>Today's Date</div>
                                <div style={{ fontWeight: 600 }}>{new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</div>
                            </div>
                            <CalendarIcon size={20} color="#666" />
                        </div>
                    </div>

                    {/* Detailed Info */}
                    <div className="card">
                        <div className="card-header">
                            <div className="card-title">Detailed Information</div>
                        </div>
                        <div className="info-list">
                            <div className="info-item">
                                <div className="info-icon"><User size={18} /></div>
                                <div className="info-content">
                                    <div className="info-label">Active Operators</div>
                                    <div className="info-value">{activeOperators} Online</div>
                                </div>
                                <div style={{ color: '#10B981', fontSize: '0.8rem' }}>Online</div>
                            </div>
                            <div className="info-item">
                                <div className="info-icon"><Clock size={18} /></div>
                                <div className="info-content">
                                    <div className="info-label">Total Production</div>
                                    <div className="info-value">{totalWeight.toFixed(2)} KG</div>
                                </div>
                            </div>
                            <div className="info-item">
                                <div className="info-icon"><MapPin size={18} /></div>
                                <div className="info-content">
                                    <div className="info-label">Location</div>
                                    <div className="info-value">Factory Unit 1</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column */}
                <div className="right-column">
                    {/* Projects Section */}
                    <div className="projects-section">
                        <div className="section-header">
                            <div className="header-title">Ongoing Production</div>
                            <div className="icon-btn"><ChevronDown size={20} /></div>
                        </div>

                        <div className="projects-grid">
                            {machines.map((m, idx) => (
                                <div key={m.id} className={`project-card ${idx % 3 === 0 ? 'card-pastel-yellow' : idx % 3 === 1 ? 'card-pastel-blue' : 'card-pastel-pink'}`}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <span className="project-date">{todayStr}</span>
                                        <MoreVertical size={16} />
                                    </div>
                                    <div>
                                        <div className="project-name">Machine {m.id}</div>
                                        <div className="project-sub">{m.weight ? `${m.weight.toFixed(1)}kg produced` : 'Idle'}</div>
                                    </div>
                                    <div className="project-sub" style={{ marginTop: '0.5rem' }}>
                                        {m.trays ? `${m.trays} Trays` : 'No Activity'}
                                    </div>

                                    <div className="progress-section">
                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                                            <span>Progress</span>
                                            <span>{m.weight ? Math.min(100, (m.weight / 100) * 100).toFixed(0) : 0}%</span>
                                        </div>
                                        <div className="progress-bar">
                                            <div className="progress-fill" style={{ width: `${m.weight ? Math.min(100, m.weight) : 0}%` }}></div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Bottom Row: Calendar & Inbox */}
                    <div className="bottom-row">
                        {/* Calendar Widget (Visual) */}
                        <div className="card">
                            <div className="card-header">
                                <div className="card-title">Calendar</div>
                                <div className="icon-btn"><MoreVertical size={16} /></div>
                            </div>
                            <div style={{ textAlign: 'center' }}>
                                <h3 style={{ marginBottom: '1rem' }}>March</h3>
                                {/* Simple Grid Representation */}
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '0.5rem', fontSize: '0.8rem', color: '#888' }}>
                                    <span>Mo</span><span>Tu</span><span>We</span><span>Th</span><span>Fr</span><span>Sa</span><span>Su</span>
                                    {Array.from({ length: 30 }).map((_, i) => (
                                        <span key={i} style={{
                                            padding: '0.5rem',
                                            background: i === 11 ? '#FFB7B2' : i === 19 ? '#333' : 'transparent',
                                            color: i === 19 ? 'white' : 'inherit',
                                            borderRadius: '8px'
                                        }}>
                                            {i + 1}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Inbox Widget */}
                        <div className="card">
                            <div className="card-header">
                                <div className="card-title">Recent Activity</div>
                                <div className="icon-btn"><Search size={16} /></div>
                            </div>
                            <div className="inbox-list">
                                {productionData.slice().reverse().slice(0, 3).length > 0 ? (
                                    productionData.slice().reverse().slice(0, 3).map((item) => (
                                        <div className="msg-item" key={item.id}>
                                            <div className="msg-avatar" style={{ background: '#eee', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                {item.operator.charAt(0)}
                                            </div>
                                            <div className="msg-content">
                                                <h4>{item.operator}</h4>
                                                <p>Produced {item.weight}kg on {item.machine}</p>
                                            </div>
                                            <div style={{ marginLeft: 'auto', fontSize: '0.8rem', color: '#aaa' }}>
                                                {item.timestamp || 'Now'}
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div style={{ color: '#999', textAlign: 'center' }}>No recent activity</div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
