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
          hi! AJ your businesses are on<br />
          <span className="highlight-container">
            one platform
            <div className="highlight-bg"></div>
          </span>
        </motion.h1>

        <motion.div 
          className="subtitle"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.8 }}
        >
          just, scroll down, a
          <span style={{ position: 'relative', display: 'inline-block', marginLeft: '8px' }}>
            littlebit!
            <div className="underline-blue"></div>
          </span>
        </motion.div>

        <motion.div 
          className="cta-group"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.8, duration: 0.5 }}
        >
          <Link to="/dashboard" className="btn-hero-primary">Start now - Production</Link>
          <Link to="/todo" className="btn-hero-secondary">Schedule your day! ▼</Link>

          <div className="handwritten-note">
            <svg className="arrow-svg" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
            </svg>
            Scroll down <br /> for ALL apps
          </div>
        </motion.div>
      </header>

      {/* Curved Transition & Main Content */}
      <div className="content-wrapper">
        <div className="curve-bg">
          <svg data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none">
            <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z" className="shape-fill"></path>
          </svg>
        </div>

        <main className="main-content">
          {/* Banner */}
          <div className="banner-container">
            <motion.div 
              className="banner"
              initial={{ y: 20, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true }}
            >
              <span className="flag-icon">🇮🇳</span>
              <span><strong>Business Show:</strong> RAIPUR (India) • Dec 17, 2025</span>
              <a href="#" className="banner-link" style={{ marginLeft: '10px', display: 'flex', alignItems: 'center' }}>
                Register <ArrowRight size={16} style={{ marginLeft: '4px' }} />
              </a>
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
            <AppItem to="/dashboard" icon={<Package size={40} />} label="Production" color="icon-production" />
            <AppItem onClick={() => alert('Coming soon!')} icon={<Hammer size={40} />} label="Manufacturing" color="icon-manufacturing" />
            <AppItem onClick={() => alert('Coming soon!')} icon={<ClipboardList size={40} />} label="Inventory" color="icon-inventory" />
            <AppItem onClick={() => alert('Coming soon!')} icon={<TrendingUp size={40} />} label="Sales" color="icon-sales" />
            <AppItem onClick={() => alert('Coming soon!')} icon={<Calculator size={40} />} label="Accounting" color="icon-accounting" />
            <AppItem onClick={() => alert('Coming soon!')} icon={<Users size={40} />} label="HR" color="icon-hr" />
            <AppItem onClick={() => alert('Coming soon!')} icon={<PenTool size={40} style={{ color: '#0ea5e9' }} />} label="Studio" />
            <AppItem onClick={() => alert('Coming soon!')} icon={<RefreshCw size={40} style={{ color: '#14b8a6' }} />} label="Subscriptions" />
          </motion.div>

          {/* Unleash Section */}
          <section className="unleash-section">
            <div className="unleash-container">
               <motion.div 
                 initial={{ scale: 0.8, opacity: 0 }}
                 whileInView={{ scale: 1, opacity: 1 }}
                 transition={{ duration: 0.5 }}
                 viewport={{ once: true }}
                 style={{ position: 'relative', display: 'inline-block' }}
               >
                  {/* Decorative Bursts */}
                  <svg style={{ position: 'absolute', top: '-60px', left: '50%', transform: 'translateX(-50%)', width: '300px', height: '100px', overflow: 'visible' }} viewBox="0 0 300 100">
                      <path d="M150,80 Q160,40 170,10" stroke="#FDBA74" strokeWidth="4" fill="none" strokeLinecap="round" />
                      <path d="M150,80 Q155,90 165,10" stroke="none" fill="#FDBA74" />
                      <path d="M100,90 Q80,50 60,30" stroke="#FDBA74" strokeWidth="4" fill="none" strokeLinecap="round" />
                      <path d="M120,80 Q100,40 90,20" stroke="#FDBA74" strokeWidth="4" fill="none" strokeLinecap="round" />
                      <path d="M200,90 Q220,50 240,30" stroke="#FDBA74" strokeWidth="4" fill="none" strokeLinecap="round" />
                      <path d="M180,80 Q200,40 210,20" stroke="#FDBA74" strokeWidth="4" fill="none" strokeLinecap="round" />
                  </svg>

                  <h2 className="unleash-title">
                      <span style={{ color: '#1F2937' }}>Unleash</span><br />
                      <span style={{ color: '#1F2937' }}>your</span> <span className="text-teal">growth potential</span>
                  </h2>
               </motion.div>

               <div style={{ marginTop: '2rem' }}>
                  <Link to="/dashboard" className="btn-unleash">Click here! - For Dashboard</Link>
                  
                  <div className="unleash-footer">
                      <svg className="arrow-up" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ width: '24px', height: '24px' }}>
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 10l7-7m0 0l7 7m-7-7v18" />
                      </svg>
                      <span>I hope you will like it</span>
                      <span>Demo Page - Subhankar dhar</span>
                  </div>
               </div>
            </div>
          </section>
        </main>
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
