import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Package, Hammer, ClipboardList, TrendingUp, Calculator, Users, PenTool, RefreshCw, ArrowRight } from 'lucide-react';
import './LandingPage.css';

const LandingPage = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="landing-page">
      {/* Navigation */}
      <nav>
        <a href="#" className="nav-logo">
          <span style={{ fontWeight: 900, fontSize: '1.8rem' }}>AJ</span> Enterprise
        </a>
        <ul className="nav-links">
          <li><a href="#">Apps</a></li>
          <li><a href="#">Industries</a></li>
          <li><a href="#">Community</a></li>
          <li><a href="#">Pricing</a></li>
          <li><a href="#">Help</a></li>
        </ul>
        <div className="nav-auth">
          <a href="#" className="btn-signin">Sign in</a>
          <a href="#" className="btn-try">Try it free</a>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="hero">
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          All your business logic on<br />
          one streamlined platform
        </motion.h1>

        <motion.div
          className="subtitle"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.8 }}
        >
          Manage production, inventory, and workflows with precision.
          <br />The industrial standard for modern enterprises.
        </motion.div>

        <motion.div
          className="cta-group"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
        >
          <Link to="/dashboard" className="btn-hero-primary">Launch Production</Link>
          <Link to="/inventory" className="btn-hero-secondary">View Inventory</Link>
        </motion.div>
      </header>

      {/* Main Content Area */}
      <div className="main-content">

        {/* Banner */}
        <div className="banner-container">
          <motion.div
            className="banner"
            initial={{ y: 20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
          >
            <span className="flag-icon">⚡</span>
            <span><strong>New Module:</strong> Advanced Inventory Tracking is now live.</span>
          </motion.div>
        </div>

        {/* App Grid */}
        <motion.div
          className="app-grid"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          <AppItem to="/dashboard" icon={<Package size={48} strokeWidth={1.5} />} label="Production Hub" color="icon-production" />
          <AppItem to="/inventory" icon={<ClipboardList size={48} strokeWidth={1.5} />} label="Inventory" color="icon-inventory" />
          <AppItem onClick={() => { }} icon={<Hammer size={48} strokeWidth={1.5} />} label="Manufacturing" color="icon-manufacturing" />
          <AppItem onClick={() => { }} icon={<TrendingUp size={48} strokeWidth={1.5} />} label="Sales" color="icon-sales" />
          <AppItem onClick={() => { }} icon={<Calculator size={48} strokeWidth={1.5} />} label="Accounting" color="icon-accounting" />
          <AppItem onClick={() => { }} icon={<Users size={48} strokeWidth={1.5} />} label="HR" color="icon-hr" />
        </motion.div>

        {/* Unleash Section */}
        <section className="unleash-section">
          <div className="unleash-container">
            <motion.div
              initial={{ y: 30, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <h2 className="unleash-title">
                Optimize your potential.
              </h2>
              <p style={{ marginBottom: '2rem', color: 'var(--text-secondary)', fontSize: '1.2rem' }}>
                Seamless integration for maximum efficiency.
              </p>
              <Link to="/dashboard" className="btn-unleash">Open Dashboard</Link>
            </motion.div>
          </div>
        </section>
      </div>
    </div>
  );
};

const AppItem = ({ to, onClick, icon, label, color }) => {
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  const content = (
    <>
      <div className={`app-icon ${color || ''}`}>
        {icon}
      </div>
      <span className="app-label">{label}</span>
    </>
  );

  if (to) {
    return (
      <motion.div variants={itemVariants} whileHover={{ y: -5 }}>
        <Link to={to} className="app-item">
          {content}
        </Link>
      </motion.div>
    );
  }

  return (
    <motion.div variants={itemVariants} whileHover={{ y: -5 }}>
      <div className="app-item" onClick={onClick}>
        {content}
      </div>
    </motion.div>
  );
};

export default LandingPage;
