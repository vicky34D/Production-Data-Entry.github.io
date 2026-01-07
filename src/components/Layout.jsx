import React, { useState, useEffect } from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';
import {
    LayoutDashboard,
    ClipboardList,
    Package,
    Settings,
    Factory,
    FlaskConical,
    Calculator,
    Bell,
    Search,
    HelpCircle,
    LogOut,
    Moon,
    ChevronDown
} from 'lucide-react';
import './Layout.css';

const SidebarItem = ({ to, icon: Icon, label }) => (
    <NavLink
        to={to}
        className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`}
    >
        <Icon size={20} />
        <span className="item-label">{label}</span>
    </NavLink>
);

const Layout = () => {
    const location = useLocation();

    const getPageHeader = () => {
        const path = location.pathname;
        if (path.includes('/dashboard')) return { title: 'Analytics', subtitle: 'Detailed overview of your production performance' };
        if (path.includes('/plan')) return { title: 'Production Planner', subtitle: 'Manage batches and calculate requirements' };
        if (path.includes('/inventory')) return { title: 'Inventory Workflow', subtitle: 'Track raw materials and finished goods' };
        if (path.includes('/formulations')) return { title: 'Formulations', subtitle: 'Manage recipes and compositions' };
        if (path.includes('/items')) return { title: 'Product Catalog', subtitle: 'Manage raw materials and items' };
        if (path.includes('/todo')) return { title: 'Tasks', subtitle: 'Daily to-do list and reminders' };
        return { title: 'Dashboard', subtitle: 'Welcome back' };
    };

    const headerInfo = getPageHeader();

    return (
        <div className="layout-container">
            <aside className="sidebar">
                <div className="sidebar-header">
                    <div className="logo-circle">
                        <Factory size={18} color="white" />
                    </div>
                    <span className="brand-name">DHARS</span>
                </div>

                <nav className="sidebar-nav">
                    <div className="nav-group">
                        <SidebarItem to="/dashboard" icon={LayoutDashboard} label="Dashboard" />
                        <SidebarItem to="/plan" icon={Calculator} label="Planner" />
                        <SidebarItem to="/inventory" icon={Package} label="Inventory" />
                        <SidebarItem to="/formulations" icon={FlaskConical} label="Formulations" />
                        <SidebarItem to="/todo" icon={ClipboardList} label="Tasks" />
                        <SidebarItem to="/items" icon={Settings} label="Settings" />
                    </div>
                </nav>

                <div className="sidebar-footer">
                    <div className="sidebar-item" onClick={() => alert("Help Center specific to DHARS coming soon!")} style={{ cursor: 'pointer' }}>
                        <HelpCircle size={20} />
                        <span className="item-label">Help</span>
                    </div>
                    <div className="sidebar-item" onClick={() => {
                        if (window.confirm("Are you sure you want to log out?")) {
                            alert("Logged out successfully.");
                            // In a real app, clear token and navigate to login
                        }
                    }} style={{ cursor: 'pointer' }}>
                        <LogOut size={20} />
                        <span className="item-label">Log out</span>
                    </div>
                    <div className="sidebar-item" onClick={() => {
                        const current = document.documentElement.getAttribute('data-theme');
                        const next = current === 'dark' ? 'light' : 'dark';
                        document.documentElement.setAttribute('data-theme', next);
                    }} style={{ marginTop: '0.5rem', justifyContent: 'space-between', cursor: 'pointer' }}>
                        <Moon size={20} />
                        <span className="item-label" style={{ marginRight: 'auto', marginLeft: '1rem' }}>Dark Mode</span>
                        <div style={{ width: 32, height: 18, background: '#E2E8F0', borderRadius: 9, position: 'relative' }}>
                            <div style={{ width: 14, height: 14, background: 'white', borderRadius: '50%', position: 'absolute', top: 2, left: 2, boxShadow: '0 1px 2px rgba(0,0,0,0.1)' }}></div>
                        </div>
                    </div>
                </div>
            </aside>

            <main className="main-content">
                <header className="top-bar">
                    <div className="page-title">
                        <h1>{headerInfo.title}</h1>
                        <p className="page-subtitle">{headerInfo.subtitle}</p>
                    </div>

                    <div className="header-actions">
                        <button className="action-icon-btn">
                            <Search size={20} />
                        </button>
                        <button className="action-icon-btn">
                            <Bell size={20} />
                            <span className="notif-dot"></span>
                        </button>
                        <div className="user-profile-pill">
                            <img src="https://ui-avatars.com/api/?name=Adaline+Lively&background=random" alt="Profile" className="u-avatar" />
                            <div className="user-info">
                                <div className="u-name">Adaline Lively</div>
                                <div className="u-role">adalively@gmail.com</div>
                            </div>
                            <ChevronDown size={14} color="var(--text-secondary)" />
                        </div>
                    </div>
                </header>

                <div className="content-area">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default Layout;
