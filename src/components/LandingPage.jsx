import React, { useState, useRef } from 'react';
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
    Settings,
    Hexagon,
    Boxes,
    Layers,
    Database,
    Globe,
    MessageSquare,
    Twitter,
    Linkedin,
    Mail,
    ChevronDown,
    X,
    Upload
} from 'lucide-react';
import './LandingPage.css';

const LandingPage = () => {
    const fileInputRef = useRef(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [isConnected, setIsConnected] = useState(false);
    const [showAuthModal, setShowAuthModal] = useState(false);
    const navigate = useNavigate();

    // Use environment variable for API URL or default to localhost
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

    // Check Backend Connection
    React.useEffect(() => {
        const checkConnection = async () => {
            try {
                const response = await fetch(`${API_URL}/api/health`);
                if (response.ok) {
                    setIsConnected(true);
                }
            } catch (error) {
                console.log('Backend not connected yet');
                setIsConnected(false);
            }
        };
        checkConnection();
    }, [API_URL]);

    const modules = [
        { id: 'items', title: 'Items', path: '/items', icon: <LayoutGrid />, color: '#ec4899' },
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

            <div className="landing-scroll-container">
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
                        <button className="btn-signin" onClick={() => setShowAuthModal(true)}>Admin Access</button>
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
                        <h1>Elevate your <span className="highlight-blue">Incense</span> Production.</h1>
                        <p>Streamline formulation, track raw materials, and optimize manufacturing flow from mixing to packaging.</p>
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
                                placeholder="Search formulations, raw materials, or batch numbers..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                autoFocus
                            />
                            <div className="search-actions">
                                <button type="button" className="action-btn text-btn">
                                    <Settings size={16} /> Import
                                </button>
                                <button type="button" className="action-btn text-btn" title="Upload supportive documents" onClick={() => fileInputRef.current.click()}>
                                    <Upload size={16} /> Upload Docs
                                </button>
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    style={{ display: 'none' }}
                                    onChange={(e) => {
                                        if (e.target.files.length > 0) {
                                            alert(`File "${e.target.files[0].name}" selected for upload.`);
                                        }
                                    }}
                                />
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

                {/* Brand Scrolling Section */}
                <div className="brand-marquee-section">
                    <p className="marquee-title">Trusted by 50+ Global Distributors & Retail Partners</p>
                    <div className="marquee-container">
                        <div className="marquee-track">
                            {/* First Set */}
                            <div className="marquee-group">
                                <span className="brand-item"><Hexagon size={24} /> PolyTech</span>
                                <span className="brand-item"><Boxes size={24} /> CubeGlobal</span>
                                <span className="brand-item"><Layers size={24} /> StackFlow</span>
                                <span className="brand-item"><Database size={24} /> DataVibe</span>
                                <span className="brand-item"><Globe size={24} /> EarthNet</span>
                                <span className="brand-item"><LayoutGrid size={24} /> GridSys</span>
                            </div>
                            {/* Duplicate Set for Loop */}
                            <div className="marquee-group">
                                <span className="brand-item"><Hexagon size={24} /> PolyTech</span>
                                <span className="brand-item"><Boxes size={24} /> CubeGlobal</span>
                                <span className="brand-item"><Layers size={24} /> StackFlow</span>
                                <span className="brand-item"><Database size={24} /> DataVibe</span>
                                <span className="brand-item"><Globe size={24} /> EarthNet</span>
                                <span className="brand-item"><LayoutGrid size={24} /> GridSys</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Reviews Section */}
                <div className="reviews-section">
                    <div className="reviews-header">
                        <h2>The Scent of Success</h2>
                        <p>Hear from production managers, distributors, and supply chain partners <br />who trust AJ Aromatics for quality and consistency.</p>
                    </div>

                    <div className="reviews-marquee-container">
                        {/* Row 1 - Scroll Left */}
                        <div className="marquee-track slow-scroll">
                            {[...Array(2)].map((_, i) => (
                                <div key={`r1-${i}`} className="review-group">
                                    <ReviewCard name="Rajesh Kumar" handle="Distributor" text="The consistency in fragrance notes for every batch is remarkable. AJ Aromatics never disappoints." icon="linkedin" color="#0A66C2" />
                                    <ReviewCard name="Elena S." handle="@FragranceHub" text="Their new automated inventory system ensures we never run out of stock during festival seasons." icon="twitter" color="#1DA1F2" />
                                    <ReviewCard name="Global Exports" handle="Partner" text="Premium packaging and on-time delivery. Best incense stick manufacturer we have worked with." icon="mail" color="#EA4335" />
                                    <ReviewCard name="Amit Patel" handle="@Organics" text="The raw material tracking is precise. We know exactly what goes into our premium Flora sticks." icon="linkedin" color="#0A66C2" />
                                </div>
                            ))}
                        </div>

                        {/* Row 2 - Scroll Right (Reverse) */}
                        <div className="marquee-track reverse-scroll">
                            {[...Array(2)].map((_, i) => (
                                <div key={`r2-${i}`} className="review-group">
                                    <ReviewCard name="Sarah Jenkins" handle="@ZenLiving" text="The Sandalwood Supreme is a best-seller in our stores. Customers love the long-lasting scent." icon="twitter" color="#1DA1F2" />
                                    <ReviewCard name="Production Team" handle="Internal" text="The new dashboard makes tracking daily dipping and packing targets so much easier." icon="discord" color="#5865F2" />
                                    <ReviewCard name="Aarav Singh" handle="@VedaScents" text="Custom formulations are handled with great secrecy and precision. Truly professional service." icon="linkedin" color="#0A66C2" />
                                    <ReviewCard name="Quality Control" handle="Report" text="Zero defects in the last 10,000 packets. The automated checks are working perfectly." icon="mail" color="#EA4335" />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* FAQ Section */}
                <div className="faq-section">
                    <div className="faq-header">
                        <h2>Frequently Asked Questions</h2>
                        <p>Understanding our manufacturing process and platform.<br />Here are answers to common queries.</p>
                    </div>
                    <div className="faq-list">
                        {faqData.map((item, index) => (
                            <FAQItem key={index} question={item.question} answer={item.answer} />
                        ))}
                    </div>
                </div>

                {/* Footer / Last Page */}
                <footer className="rocket-footer">
                    <div className="footer-overlay"></div>
                    <div className="footer-content">
                        <div className="footer-logo-large">
                            <motion.div
                                initial={{ y: 20, opacity: 0 }}
                                whileInView={{ y: 0, opacity: 1 }}
                                transition={{ duration: 1 }}
                            >
                                <LayoutGrid size={80} color="#fff" strokeWidth={1.5} />
                            </motion.div>
                            <span className="footer-brand-text">AJ Aromatics</span>
                        </div>

                        <div className="footer-bottom">
                            <div className="social-icons">
                                <a href="#"><Twitter size={20} /></a>
                                <a href="#"><Linkedin size={20} /></a>
                                <a href="#"><MessageSquare size={20} /></a>
                                <a href="#"><Globe size={20} /></a>
                            </div>
                            <div className="legal-links">
                                <a href="#">Terms</a>
                                <a href="#">Privacy</a>
                            </div>
                            <div className="copyright">
                                © 2025 AJ Aromatics IND Inc.
                            </div>

                            {/* DB Status Indicator */}
                            <div style={{ marginTop: '1rem', fontSize: '0.8rem', opacity: 0.6, display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <div style={{
                                    width: '8px',
                                    height: '8px',
                                    borderRadius: '50%',
                                    background: isConnected ? '#10b981' : '#ef4444'
                                }}></div>
                                System: {isConnected ? 'Online (PostgreSQL)' : 'Offline'}
                            </div>
                        </div>
                    </div>
                </footer>
            </div>

            {/* Auth Modal */}
            <AnimatePresence>
                {showAuthModal && (
                    <AuthModal onClose={() => setShowAuthModal(false)} />
                )}
            </AnimatePresence>
        </div>
    );
};

const ReviewCard = ({ name, handle, text, icon, color }) => (
    <div className="review-card">
        <div className="review-header">
            <div className="review-user">
                <div className="review-avatar" style={{ backgroundColor: color }}>
                    {name.charAt(0)}
                </div>
                <div className="review-meta">
                    <span className="review-name">{name}</span>
                    <span className="review-handle">{handle}</span>
                </div>
            </div>
            <div className="review-icon" style={{ color: color }}>
                {icon === 'discord' && <MessageSquare size={18} fill="currentColor" />}
                {icon === 'twitter' && <Twitter size={18} fill="currentColor" />}
                {icon === 'linkedin' && <Linkedin size={18} fill="currentColor" />}
                {icon === 'mail' && <Mail size={18} />}
            </div>
        </div>
        <p className="review-text">"{text}"</p>
    </div>
);

const FAQItem = ({ question, answer }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="faq-item" onClick={() => setIsOpen(!isOpen)}>
            <div className="faq-question">
                <span>{question}</span>
                <ChevronDown className={`faq-icon ${isOpen ? 'rotate' : ''}`} size={20} />
            </div>
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="faq-answer-container"
                    >
                        <p className="faq-answer">{answer}</p>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

const faqData = [
    { question: "What is the AJ Aromatics Production System?", answer: "It is an end-to-end management platform for tracking incense stick manufacturing, from raw material procurement to final finished goods packaging." },
    { question: "Can we handle custom formulations?", answer: "Yes, the system allows for detailed 'Formulation' entries, securing unique recipes for different incense varieties like Flora, Masala, and Dipped sticks." },
    { question: "How is inventory tracked?", answer: "We track inventory in real-time across multiple stages: Raw Materials (Bamboo, Charcoal, Jigat), Work-in-Progress (Raw Sticks), and Finished Goods." },
    { question: "Does it support export documentation?", answer: "The system generates essential data for Goods Dispatch Notes (GDN), facilitating smooth creation of export and shipping documents." },
    { question: "Can I monitor daily worker output?", answer: "Absolutely. The 'Daily Store Update' and production modules allow for tracking daily quotas and efficiency per team or machine." },
    { question: "Is the system secure?", answer: "Yes, all formulation secrets and production data are stored securely with role-based access control for administrators and staff." }
];

const AuthModal = ({ onClose }) => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    // Use environment variable
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await fetch(`${API_URL}/api/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });
            const data = await res.json();

            if (data.success) {
                setSuccess(true);
                // Optional: Close modal after delay
                setTimeout(() => {
                    onClose();
                }, 1500);
            }
        } catch (err) {
            console.error('Login failed', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="auth-overlay"
            onClick={onClose}
        >
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="auth-modal"
                onClick={e => e.stopPropagation()}
            >
                <div className="auth-left">
                    {/* Background image is handled by CSS */}
                </div>

                <button className="close-modal-btn" onClick={onClose}><X size={24} /></button>

                <div className="auth-right">
                    <div className="auth-header">
                        <h2>Sign in / Sign up</h2>
                        <p>We'll sign you in or create an account if you don't have one yet</p>
                    </div>

                    {!success ? (
                        <>
                            <div className="auth-form">
                                <button className="btn-google">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M23.52 12.2727C23.52 11.4264 23.4473 10.6691 23.3164 9.94092H12V14.4964H18.4727C18.1882 15.9873 17.3155 17.2609 16.0364 18.1118V21.1036H19.9055C22.1727 19.0327 23.52 15.9527 23.52 12.2727Z" fill="#4285F4" />
                                        <path d="M12 24C15.24 24 17.9564 22.9364 19.9127 21.1036L16.0436 18.1118C14.9673 18.8327 13.5927 19.2618 12 19.2618C8.87273 19.2618 6.22364 17.1527 5.27636 14.3073H1.27637V17.3873C3.25091 21.2873 7.34545 24 12 24Z" fill="#34A853" />
                                        <path d="M5.27636 14.3073C5.02909 13.5655 4.89818 12.7818 4.89818 11.9727C4.89818 11.1636 5.02909 10.38 5.27636 9.63818V6.55817H1.27637C0.467273 8.15817 0.0109091 9.99092 0.0109091 11.9727C0.0109091 13.9545 0.467273 15.7873 1.27637 17.3873L5.27636 14.3073Z" fill="#FBBC05" />
                                        <path d="M12 4.73818C13.76 4.73818 15.3382 5.34182 16.5818 6.52182L20.0145 3.08909C17.9509 1.17091 15.2327 0 12 0C7.34545 0 3.25091 2.71273 1.27637 6.61273L5.27636 9.69273C6.22364 6.84727 8.87273 4.73818 12 4.73818Z" fill="#EA4335" />
                                    </svg>
                                    Continue with Google
                                </button>

                                <div className="auth-divider">
                                    <span>OR</span>
                                </div>

                                <form onSubmit={handleSubmit} className="input-group">
                                    <input
                                        type="email"
                                        className="auth-input"
                                        placeholder="Enter your work or personal email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                    />
                                    <button
                                        type="submit"
                                        className="btn-continue"
                                        disabled={loading}
                                    >
                                        {loading ? 'Continuing...' : 'Continue'}
                                    </button>
                                </form>
                            </div>

                            <div className="auth-footer">
                                By signing up or signing in, you agree to our <a href="#">Terms</a> and <a href="#">Privacy Policy</a>.
                            </div>
                        </>
                    ) : (
                        <div className="auth-success" style={{ textAlign: 'center' }}>
                            <div style={{ background: '#dcfce7', width: '60px', height: '60px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem auto' }}>
                                <ClipboardList size={30} color="#166534" />
                            </div>
                            <h3 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '0.5rem', color: '#0f172a' }}>Welcome to AJ Aromatics</h3>
                            <p style={{ color: '#64748b' }}>Logging you into the dashboard...</p>
                        </div>
                    )}
                </div>
            </motion.div>
        </motion.div>
    );
};

export default LandingPage;
