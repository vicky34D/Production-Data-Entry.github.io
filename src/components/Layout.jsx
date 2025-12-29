import React, { useState } from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';
import {
    LayoutDashboard,
    ClipboardList,
    Package,
    Truck,
    History,
    Settings,
    Menu,
    X,
    Factory,
    FlaskConical,
    Calculator
} from 'lucide-react';
import './Layout.css';

const SidebarItem = ({ to, icon: Icon, label, collapsed }) => (
    <NavLink
        to={to}
        className={({ isActive }) =>
            `sidebar-item ${isActive ? 'active' : ''} ${collapsed ? 'collapsed' : ''}`
        }
    >
        <Icon size={20} />
        {!collapsed && <span>{label}</span>}
    </NavLink>
);

const Layout = () => {
    const [collapsed, setCollapsed] = useState(false);
    const location = useLocation();

    const getPageTitle = () => {
        const path = location.pathname;
        if (path === '/dashboard') return 'Dashboard';
        if (path === '/todo') return 'Tasks';
        if (path === '/items') return 'Item Master';
        if (path === '/formulations') return 'Formulations';
        if (path === '/plan') return 'Production Planning';
        if (path.startsWith('/inventory')) return 'Inventory Management';
        return 'AJ Aromatics';
    };

    return (
        <div className="layout-container">
            <aside className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
                <div className="sidebar-header">
                    {!collapsed && <h2 className="brand-title">AJ Aromatics</h2>}
                    <button className="collapse-btn" onClick={() => setCollapsed(!collapsed)}>
                        {collapsed ? <Menu size={20} /> : <X size={20} />}
                    </button>
                </div>

                <nav className="sidebar-nav">
                    <div className="nav-group">
                        <p className="nav-label">{!collapsed && 'Core'}</p>
                        <SidebarItem to="/dashboard" icon={LayoutDashboard} label="Dashboard" collapsed={collapsed} />
                        <SidebarItem to="/todo" icon={ClipboardList} label="Tasks" collapsed={collapsed} />
                    </div>

                    <div className="nav-group">
                        <p className="nav-label">{!collapsed && 'Production'}</p>
                        <SidebarItem to="/formulations" icon={FlaskConical} label="Formulations" collapsed={collapsed} />
                        <SidebarItem to="/plan" icon={Calculator} label="Planning" collapsed={collapsed} />
                        <SidebarItem to="/inventory/fgi" icon={Factory} label="Finished Goods" collapsed={collapsed} />
                    </div>

                    <div className="nav-group">
                        <p className="nav-label">{!collapsed && 'Inventory'}</p>
                        <SidebarItem to="/inventory/summary" icon={Package} label="Stock Summary" collapsed={collapsed} />
                        <SidebarItem to="/inventory/grn" icon={Truck} label="Goods Received" collapsed={collapsed} />
                        <SidebarItem to="/inventory/dsu" icon={History} label="Store Updates" collapsed={collapsed} />
                    </div>

                    <div className="nav-group">
                        <p className="nav-label">{!collapsed && 'Settings'}</p>
                        <SidebarItem to="/items" icon={Settings} label="Item Master" collapsed={collapsed} />
                    </div>
                </nav>
            </aside>

            <main className="main-content">
                <header className="top-bar">
                    <h1 className="page-title">{getPageTitle()}</h1>
                    <div className="user-profile">
                        <span className="user-avatar">AD</span>
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
