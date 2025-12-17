import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Package,
    ClipboardList,
    Hammer,
    TrendingUp,
    Calculator,
    Users,
    Search,
    ArrowRight,
    LayoutGrid,
    Settings
} from 'lucide-react';
import './LandingPage.css';

const LandingPage = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const navigate = useNavigate();

    const modules = [
        { id: 'prod', title: 'Production', path: '/dashboard', icon: <Package />, color: '#3b82f6' },
        { id: 'inv', title: 'Inventory', path: '/inventory', icon: <ClipboardList />, color: '#10b981' },
        { id: 'form', title: 'Formulation', path: '#', icon: <Hammer />, color: '#8b5cf6' },
        { id: 'sales', title: 'Sales', path: '#', icon: <TrendingUp />, color: '#f59e0b' },
        { id: 'fin', title: 'Finance', path: '#', icon: <Calculator />, color: '#ef4444' },
        { id: 'team', title: 'Team', path: '#', icon: <Users />, color: '#06b6d4' },
    ];

    const filteredModules = modules.filter(m =>
        m.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        if (filteredModules.length > 0) {
            if (filteredModules[0].path !== '#') {
                navigate(filteredModules[0].path);
            }
        }
    };

    return (
        <div className="rocket-landing">
            {/* Background Elements */}
            <div className="stars"></div>
            <div className="clouds"></div>
            <div className="mountains"></div>

            {/* Navigation Header */}
            <nav className="rocket-nav">
                <div className="nav-logo">
                    <LayoutGrid size={24} color="#fff" />
                    <span>AJ Aromatics</span>
                </div>
                <div className="nav-links">
                    <span className="nav-item">Documentation</span>
                    <span className="nav-item">Support</span>
                    <span className="nav-item">System Status</span>
                </div>
                <div className="nav-auth">
                    <button className="btn-signin">Admin Access</button>
                </div>
            </nav>

            {/* Main Content */}
            <main className="rocket-hero">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="hero-text"
                >
                    <h1>Launch your <span className="highlight-blue">production</span> efficiency.</h1>
                    <p>Streamline data entry, track inventory, and manage formulations in one place.</p>
                </motion.div>

                {/* Central Input Box */}
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.2, duration: 0.6 }}
                    className="search-wrapper"
                >
                    <form onSubmit={handleSearchSubmit} className="rocket-search-box">
                        <Search className="search-icon" size={20} />
                        <input
                            type="text"
                            placeholder="What are you looking for? (e.g., Inventory, Production...)"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            autoFocus
                        />
                        <div className="search-actions">
                            <button type="button" className="action-btn text-btn">
                                <Settings size={16} /> Import
                            </button>
                            <button type="submit" className="action-btn primary-btn">
                                <ArrowRight size={18} />
                            </button>
                        </div>
                    </form>
                </motion.div>

                {/* Dock / Frameworks Bar */}
                <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4, duration: 0.8 }}
                    className="modules-dock-container"
                >
                    <div className="dock-label">System Modules</div>
                    <div className="modules-dock">
                        <AnimatePresence>
                            {filteredModules.map((mod) => (
                                <motion.div
                                    key={mod.id}
                                    layout
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.8 }}
                                    whileHover={{ y: -5, scale: 1.1 }}
                                    className="dock-item"
                                >
                                    <Link to={mod.path} className="dock-link" title={mod.title}>
                                        <div className="dock-icon" style={{ '--hover-color': mod.color }}>
                                            {mod.icon}
                                        </div>
                                    </Link>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                </motion.div>
            </main>
        </div>
    );
};

export default LandingPage;
