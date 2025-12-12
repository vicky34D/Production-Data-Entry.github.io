import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import './InventoryHub.css';

const InventoryHub = () => {
    const navigate = useNavigate();

    const handleItemClick = (path) => {
        if (path) {
            navigate(path);
        } else {
            alert("This module will be created later!");
        }
    };

    return (
        <div className="inventory-hub-container">
            <header className="hub-header">
                <Link to="/" style={{ opacity: 0.7, transition: 'opacity 0.2s' }} title="Back to Apps">
                    <ArrowLeft size={24} />
                </Link>
                <div className="brand-icon" style={{
                    width: '32px', height: '32px',
                    background: 'linear-gradient(135deg, var(--accent-warning), #f97316)',
                    borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontWeight: 'bold', color: 'white'
                }}>INV</div>
                <h1 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Inventory Management</h1>
            </header>

            <div className="hub-content">
                <div className="cycle-container">
                    <svg className="cycle-svg" viewBox="0 0 900 600">
                        <defs>
                            <marker id="arrowhead" markerWidth="6" markerHeight="4" refX="5" refY="2" orient="auto">
                                <polygon points="0 0, 6 2, 0 4" fill="var(--primary-orange)" />
                            </marker>
                        </defs>
                        {/* GRN -> DSU */}
                        <path d="M 260 120 Q 300 60 350 60" markerEnd="url(#arrowhead)" />

                        {/* DSU -> SPP */}
                        <path d="M 600 70 Q 630 70 640 120" markerEnd="url(#arrowhead)" />

                        {/* SPP -> SPU */}
                        <path d="M 750 220 Q 750 280 720 290" markerEnd="url(#arrowhead)" />

                        {/* SPU -> FGI */}
                        <path d="M 480 320 Q 420 320 390 290" markerEnd="url(#arrowhead)" />

                        {/* FGI -> GDN */}
                        <path d="M 240 280 Q 200 400 300 500" markerEnd="url(#arrowhead)" />
                    </svg>

                    {/* 1. Goods Received Note */}
                    <motion.div
                        className="cycle-item item-grn"
                        whileHover={{ scale: 1.1 }}
                        onClick={() => handleItemClick('/inventory/grn')}
                    >
                        Goods Received Note
                    </motion.div>

                    {/* 2. Daily Store Update */}
                    <motion.div
                        className="cycle-item item-dsu"
                        onClick={() => handleItemClick()}
                    >
                        Daily Store Update
                    </motion.div>

                    {/* 3. Spare Parts Purchase */}
                    <motion.div
                        className="cycle-item item-spp"
                        onClick={() => handleItemClick()}
                    >
                        Spare Parts Purchase
                    </motion.div>

                    {/* 4. Spare Parts Update */}
                    <motion.div
                        className="cycle-item item-spu"
                        onClick={() => handleItemClick()}
                    >
                        Spare Parts Update
                    </motion.div>

                    {/* 5. Finished Goods Inventory */}
                    <motion.div
                        className="cycle-item item-fgi"
                        onClick={() => handleItemClick()}
                    >
                        Finished Goods Inventory
                    </motion.div>

                    {/* 6. Goods Dispatched Note */}
                    <motion.div
                        className="cycle-item item-gdn"
                        onClick={() => handleItemClick()}
                    >
                        Goods Dispatched Note
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default InventoryHub;
