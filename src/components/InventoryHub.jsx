import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Package, ClipboardCheck, ShoppingCart, Truck, Factory, FileText, BarChart3 } from 'lucide-react';
import { motion } from 'framer-motion';
import './InventoryHub.css';

const InventoryHub = () => {
    const navigate = useNavigate();

    const steps = [
        { id: '1', label: 'Goods Received Note', path: '/inventory/grn', icon: <Package size={24} />, color: 'var(--accent-info)' },
        { id: '2', label: 'Daily Store Update', path: '/inventory/dsu', icon: <ClipboardCheck size={24} />, color: 'var(--primary-color)' },
        { id: '3', label: 'Spare Parts Purchase', path: '/inventory/spp', icon: <ShoppingCart size={24} />, color: 'var(--accent-success)' },
        { id: '4', label: 'Spare Parts Update', path: '/inventory/spu', icon: <Factory size={24} />, color: '#8b5cf6' },
        { id: '5', label: 'Finished Goods Inv', path: '/inventory/fgi', icon: <Package size={24} />, color: '#ec4899' },
        { id: '6', label: 'Goods Dispatch Note', path: '/inventory/gdn', icon: <Truck size={24} />, color: 'var(--accent-info)' },
        { id: '7', label: 'Stock Summary', path: '/inventory/summary', icon: <BarChart3 size={24} />, color: 'var(--accent-warning)', isFinal: true }
    ];

    const handleItemClick = (path) => {
        if (path) navigate(path);
    };

    return (
        <div className="inventory-hub-container">
            <header className="hub-header">
                <Link to="/" style={{ opacity: 0.7, transition: 'opacity 0.2s' }} title="Back to Apps">
                    <ArrowLeft size={24} />
                </Link>
                <div className="brand-icon" style={{
                    width: '32px', height: '32px',
                    background: 'linear-gradient(135deg, var(--primary-color), var(--primary-hover))',
                    borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontWeight: 'bold', color: 'white'
                }}>INV</div>
                <h1 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Inventory Workflow</h1>
            </header>

            <div className="hub-content">
                <div className="process-flow-container">
                    {steps.map((step, index) => (
                        <div key={step.id} className="process-step-wrapper">
                            <motion.div
                                className="process-card"
                                whileHover={{ y: -5, boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)' }}
                                onClick={() => handleItemClick(step.path)}
                                style={{ borderTop: `4px solid ${step.color}` }}
                            >
                                <div className="step-number" style={{ background: step.color }}>{step.id}</div>
                                <div className="step-icon" style={{ color: step.color }}>
                                    {step.icon}
                                </div>
                                <div className="step-label">{step.label}</div>
                            </motion.div>
                            {/* Connector Line (Managed by CSS for wrapping) */}
                            <div className="step-connector"></div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default InventoryHub;
