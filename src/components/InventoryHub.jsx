import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Package,
    ClipboardCheck,
    ShoppingCart,
    Factory,
    Truck,
    BarChart3,
    ArrowRight,
    TrendingUp,
    AlertCircle
} from 'lucide-react';
import { motion } from 'framer-motion';
import { initializeERP, getInventoryBalance } from '../utils/erpController';
import './InventoryHub.css';

const InventoryHub = () => {
    const navigate = useNavigate();
    const [balance, setBalance] = useState({ rawMaterials: [], finishedGoods: [] });

    useEffect(() => {
        initializeERP();
        setBalance(getInventoryBalance());
    }, []);

    const rawValue = balance.rawMaterials.reduce((acc, i) => acc + (i.currentStock * i.costPerUnit), 0);
    const fgValue = balance.finishedGoods.reduce((acc, i) => acc + (i.currentStock * i.sellingPrice), 0);
    const lowStockCount = balance.rawMaterials.filter(i => i.currentStock <= i.reorderLevel).length;

    const modules = [
        {
            id: '1',
            label: 'Goods Received Note',
            sub: 'Inward Raw Materials',
            path: '/inventory/grn',
            icon: <Package size={24} />,
            color: '#0EA5E9', // Sky
            stat: 'Purchase Entry'
        },
        {
            id: '2',
            label: 'Daily Store Update',
            sub: 'Track Material Usage',
            path: '/inventory/dsu',
            icon: <ClipboardCheck size={24} />,
            color: '#F97316', // Orange
            stat: 'Consumption Log'
        },
        {
            id: '3',
            label: 'Spare Parts Purchase',
            sub: 'Machinery & Maintenance',
            path: '/inventory/spp',
            icon: <ShoppingCart size={24} />,
            color: '#10B981', // Emerald
            stat: 'Maintenance In'
        },
        {
            id: '4',
            label: 'Spare Parts Update',
            sub: 'Parts Usage & Repairs',
            path: '/inventory/spu',
            icon: <Factory size={24} />,
            color: '#8B5CF6', // Violet
            stat: 'Maintenance Out'
        },
        {
            id: '5',
            label: 'Finished Goods Inv',
            sub: 'Record Production',
            path: '/inventory/fgi',
            icon: <Package size={24} />,
            color: '#EC4899', // Pink
            stat: 'Output Entry'
        },
        {
            id: '6',
            label: 'Goods Dispatch Note',
            sub: 'Sales & Shipping',
            path: '/inventory/gdn',
            icon: <Truck size={24} />,
            color: '#6366F1', // Indigo
            stat: 'Sales Entry'
        },
        {
            id: '7',
            label: 'Stock Summary',
            sub: 'Live Reports',
            path: '/inventory/summary',
            icon: <BarChart3 size={24} />,
            color: '#F59E0B', // Amber
            stat: 'Analytics'
        }
    ];

    return (
        <div className="erp-container">
            {/* Header Section */}
            <div className="erp-header">
                <div className="header-left">
                    <div className="erp-brand-icon">ERP</div>
                    <div>
                        <h1>Intense Sticks Inventory</h1>
                        <p>End-to-End Production Management</p>
                    </div>
                </div>
                {/* Live Stats Ticker */}
                <div className="header-stats-group">
                    <div className="stat-pill">
                        <TrendingUp size={16} color="#16A34A" />
                        <div className="stat-content">
                            <span className="label">RM Value</span>
                            <span className="value">₹{rawValue.toLocaleString()}</span>
                        </div>
                    </div>
                    <div className="stat-pill">
                        <Package size={16} color="#6366F1" />
                        <div className="stat-content">
                            <span className="label">FG Value</span>
                            <span className="value">₹{fgValue.toLocaleString()}</span>
                        </div>
                    </div>
                    {lowStockCount > 0 && (
                        <div className="stat-pill warning">
                            <AlertCircle size={16} color="#DC2626" />
                            <div className="stat-content">
                                <span className="label">Alerts</span>
                                <span className="value">{lowStockCount} Low Items</span>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Workflow Modules Grid */}
            <h3 className="section-heading">Operational Workflow</h3>
            <div className="modules-grid">
                {modules.map((mod) => (
                    <motion.div
                        key={mod.id}
                        className="module-card"
                        whileHover={{ y: -5, transition: { duration: 0.2 } }}
                        onClick={() => navigate(mod.path)}
                    >
                        <div className="module-top">
                            <div className="icon-box" style={{ background: `${mod.color}15`, color: mod.color }}>
                                {mod.icon}
                            </div>
                            <span className="step-badge" style={{ borderColor: mod.color, color: mod.color }}>
                                Step {mod.id}
                            </span>
                        </div>
                        <div className="module-info">
                            <h3>{mod.label}</h3>
                            <p>{mod.sub}</p>
                        </div>
                        <div className="module-footer">
                            <span>{mod.stat}</span>
                            <ArrowRight size={16} color={mod.color} />
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
};

export default InventoryHub;
