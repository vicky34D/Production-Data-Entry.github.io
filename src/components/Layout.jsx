import React, { useState, useEffect } from 'react';
import { Outlet, NavLink, useLocation, useNavigate } from 'react-router-dom';
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
    Mail
} from 'lucide-react';
import './Layout.css';

const SidebarItem = ({ to, icon: Icon, title }) => (
    <NavLink
        to={to}
        className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`}
        title={title}
    >
        <Icon size={20} />
    </NavLink>
);

const NavPill = ({ to, label }) => (
    <NavLink
        to={to}
        className={({ isActive }) => `nav-pill ${isActive ? 'active' : ''}`}
        end
    >
        {label}
    </NavLink>
);

const Layout = () => {
    const location = useLocation();

    // Theme defaults to 'light' for this design, but we keep logic if needed
    useEffect(() => {
        document.documentElement.setAttribute('data-theme', 'light');
    }, []);

    const getPageTitle = () => {
        // Title logic moved to visual pills, but we can keep for document title
        return 'Dashboard';
    };

    return (
        <div className="layout-container">
            <aside className="sidebar">
                <div className="sidebar-header">
                    {/* Logo Icon or similar */}
                    <div style={{ width: 32, height: 32, background: 'white', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Factory size={18} color="var(--bg-sidebar)" />
                    </div>
                </div>

                <nav className="sidebar-nav">
                    <div className="nav-group">
                        <SidebarItem to="/dashboard" icon={LayoutDashboard} title="Dashboard" />
                        <SidebarItem to="/todo" icon={ClipboardList} title="Tasks" />
                        <SidebarItem to="/plan" icon={Calculator} title="Planning" />
                        <SidebarItem to="/inventory" icon={Package} title="Inventory" />
                        <SidebarItem to="/formulations" icon={FlaskConical} title="Formulations" />
                    </div>

                    <div className="nav-group" style={{ marginTop: 'auto' }}>
                        <SidebarItem to="/items" icon={Settings} title="Settings" />
                    </div>
                </nav>
            </aside>

            <main className="main-content">
                <header className="top-bar">
                    <nav className="header-nav">
                        <NavPill to="/dashboard" label="Home" />
                        <NavPill to="/plan" label="Production Planner" />
                        <NavPill to="/inventory" label="Inventory Workflow" />
                        <NavPill to="/items" label="Product Catalog" />
                    </nav>

                    <div className="user-actions">
                        <div className="action-icon">
                            <Mail size={18} />
                        </div>
                        <div className="action-icon">
                            <Bell size={18} />
                        </div>
                        <div className="action-icon">
                            <Search size={18} />
                        </div>
                        <div className="user-avatar">AD</div>
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
