import React, { useState, useEffect } from 'react';
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
    Calculator,
    Sun,
    Moon
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
    // Initialize theme from localStorage or default to 'dark'
    const [theme, setTheme] = useState(() => {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('theme') || 'dark';
        }
        return 'dark';
    });
    const [installPrompt, setInstallPrompt] = useState(null);

    const location = useLocation();

    // PWA Install Prompt
    useEffect(() => {
        const handler = (e) => {
            e.preventDefault();
            console.log("Install prompt captured");
            setInstallPrompt(e);
        };
        window.addEventListener('beforeinstallprompt', handler);
        return () => window.removeEventListener('beforeinstallprompt', handler);
    }, []);

    const handleInstallClick = () => {
        if (!installPrompt) return;
        installPrompt.prompt();
        installPrompt.userChoice.then((choiceResult) => {
            if (choiceResult.outcome === 'accepted') {
                console.log('User accepted the install prompt');
            }
            setInstallPrompt(null);
        });
    };

    // Apply theme to document
    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
    }, [theme]);

    const toggleTheme = () => {
        setTheme(prev => prev === 'light' ? 'dark' : 'light');
    };

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
                        <SidebarItem to="/inventory" icon={Package} label="Inventory Hub" collapsed={collapsed} />
                        <SidebarItem to="/inventory/summary" icon={Package} label="Stock Summary" collapsed={collapsed} />
                    </div>

                    <div className="nav-group">
                        <p className="nav-label">{!collapsed && 'Settings'}</p>
                        <SidebarItem to="/items" icon={Settings} label="Item Master" collapsed={collapsed} />
                        {installPrompt && (
                            <button
                                onClick={handleInstallClick}
                                className={`sidebar-item ${collapsed ? 'collapsed' : ''}`}
                                style={{
                                    border: 'none',
                                    background: 'transparent',
                                    width: '100%',
                                    cursor: 'pointer',
                                    color: 'var(--accent-info)',
                                    marginTop: 'auto'
                                }}
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="20"
                                    height="20"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                >
                                    <circle cx="12" cy="12" r="10" />
                                    <path d="M8 12l4 4 4-4" />
                                    <path d="M12 8v8" />
                                </svg>
                                {!collapsed && <span>Install App</span>}
                            </button>
                        )}
                    </div>
                </nav>
            </aside>

            <main className="main-content">
                <header className="top-bar">
                    <h1 className="page-title">{getPageTitle()}</h1>
                    <div className="user-profile">
                        <button
                            onClick={toggleTheme}
                            style={{
                                background: 'transparent',
                                border: 'none',
                                cursor: 'pointer',
                                color: 'var(--text-primary)',
                                padding: '0.5rem',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}
                            aria-label="Toggle Theme"
                        >
                            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                        </button>
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
