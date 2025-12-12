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

                    {/* 1. Goods Received Note */}
                    <motion.div
                        className="cycle-item item-grn"
                        whileHover={{ scale: 1.1 }}
                        onClick={() => handleItemClick('/inventory/grn')}
                    >
                        Goods Received Note
                    </motion.div>

                    {/* Arrow 1: GRN -> DSU */}
                    <svg className="arrow-path" style={{ top: '8%', left: '25%', width: '150px', height: '80px' }} viewBox="0 0 150 80">
                        <path d="M10,60 Q60,10 130,30" />
                        <polygon points="130,30 120,25 125,38" transform="rotate(-15 130 30)" />
                    </svg>

                    {/* 2. Daily Store Update */}
                    <motion.div
                        className="cycle-item item-dsu"
                        onClick={() => handleItemClick()}
                    >
                        Daily Store Update
                    </motion.div>

                    {/* Arrow 2: DSU -> SPP */}
                    <svg className="arrow-path" style={{ top: '8%', right: '28%', width: '150px', height: '80px' }} viewBox="0 0 150 80">
                        <path d="M10,30 Q80,10 130,50" />
                        <polygon points="130,50 120,40 132,40" transform="rotate(35 130 50)" />
                    </svg>

                    {/* 3. Spare Parts Purchase */}
                    <motion.div
                        className="cycle-item item-spp"
                        onClick={() => handleItemClick()}
                    >
                        Spare Parts Purchase
                    </motion.div>

                    {/* Arrow 3: SPP -> SPU */}
                    <svg className="arrow-path" style={{ top: '32%', right: '12%', width: '120px', height: '120px' }} viewBox="0 0 120 120">
                        <path d="M100,10 Q110,60 40,100" />
                        <polygon points="40,100 50,95 45,90" transform="rotate(145 40 100)" />
                    </svg>

                    {/* 4. Spare Parts Update */}
                    <motion.div
                        className="cycle-item item-spu"
                        onClick={() => handleItemClick()}
                    >
                        Spare Parts Update
                    </motion.div>

                    {/* Arrow 4: SPU -> FGI */}
                    <svg className="arrow-path" style={{ top: '55%', left: '42%', width: '220px', height: '80px' }} viewBox="0 0 220 80">
                        <path d="M210,10 Q110,90 20,50" />
                        <polygon points="20,50 30,55 32,45" transform="rotate(25 20 50)" />
                    </svg>

                    {/* 5. Finished Goods Inventory */}
                    <motion.div
                        className="cycle-item item-fgi"
                        onClick={() => handleItemClick()}
                    >
                        Finished Goods Inventory
                    </motion.div>

                    {/* Arrow 5: FGI -> GDN */}
                    <svg className="arrow-path" style={{ top: '58%', left: '18%', width: '120px', height: '160px' }} viewBox="0 0 120 160">
                        <path d="M40,10 Q10,80 90,140" />
                        <polygon points="90,140 80,135 85,130" transform="rotate(40 90 140)" />
                    </svg>

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
