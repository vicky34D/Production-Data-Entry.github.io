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
    ChevronDown
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

                {/* Brand Scrolling Section */}
                <div className="brand-marquee-section">
                    <p className="marquee-title">Twisted by 653K+ users in 180+ countries</p>
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
                        <h2>Happiness speaks</h2>
                        <p>What some of our 400K+ creators and developers in 180+ countries<br />building everything from side projects to enterprise apps have to say.</p>
                    </div>

                    <div className="reviews-marquee-container">
                        {/* Row 1 - Scroll Left */}
                        <div className="marquee-track slow-scroll">
                            {[...Array(2)].map((_, i) => (
                                <div key={`r1-${i}`} className="review-group">
                                    <ReviewCard name="CaptainDev" handle="Discord" text="Rocket saved me more time in 10 minutes than my last 3 frameworks combined. Big respect for what you built!" icon="discord" color="#5865F2" />
                                    <ReviewCard name="Mia Williams" handle="@miatravls" text="I just one shotted a prompt using @rocketdotnew and I can't put into words how astronomically better it is." icon="twitter" color="#1DA1F2" />
                                    <ReviewCard name="T-Bot 🙌" handle="Discord" text="Simply magical, beautiful and definitely the best experience I had so far compared to the competitors!!!" icon="discord" color="#5865F2" />
                                    <ReviewCard name="Alex Chen" handle="@alexc" text="The inventory tracking module is a lifesaver. Reduced our waste by 40% in just two weeks. Incredible." icon="linkedin" color="#0A66C2" />
                                </div>
                            ))}
                        </div>

                        {/* Row 2 - Scroll Right (Reverse) */}
                        <div className="marquee-track reverse-scroll">
                            {[...Array(2)].map((_, i) => (
                                <div key={`r2-${i}`} className="review-group">
                                    <ReviewCard name="Dan Western" handle="@westerns1978" text="@rocketdotnew is one of the best vibe coding apps I've used. Pure elegant efficiency." icon="twitter" color="#1DA1F2" />
                                    <ReviewCard name="Lisandro VB" handle="Email" text="It's exciting to use Rocket, because for the first time a startup has understood how to really apply logic from a prompt." icon="mail" color="#EA4335" />
                                    <ReviewCard name="Eban Emmanuel" handle="@Eebann" text="I've built apps with Rocket.new, and let me tell you it's a game-changer. Its leagues ahead for turning ideas into reality." icon="linkedin" color="#0A66C2" />
                                    <ReviewCard name="Sarah J." handle="@sara_dev" text="Finally a dashboard that doesn't look like a spreadsheet from 1999. Beautiful work on the UX!" icon="twitter" color="#1DA1F2" />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* FAQ Section */}
                <div className="faq-section">
                    <div className="faq-header">
                        <h2>FAQs</h2>
                        <p>Rocket is super easy to navigate for anyone.<br />Here are some of our most common questions and answers.</p>
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
                            <span className="footer-brand-text">rocket</span>
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
                                © 2025 Rocket USA Inc.
                            </div>
                        </div>
                    </div>
                </footer>
            </div>
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
    { question: "What is Rocket?", answer: "Rocket is an advanced production and formulation management system designed for modern manufacturing enterprises." },
    { question: "How's Rocket different from other vibe coding platforms?", answer: "Rocket combines inventory, production, and sales into a single, seamless 'vibe coding' experience that puts user experience first." },
    { question: "What can I do with Rocket?", answer: "You can track raw materials, manage formulations, generate production reports, and monitor global sales in real-time." },
    { question: "What tech stacks does Rocket know?", answer: "Rocket is built on a modern React stack with Node.js, capable of integrating with various ERPs and SQL databases." },
    { question: "Who owns the IP and the code?", answer: "You own 100% of the data and customizations you build within your Rocket instance." },
    { question: "Do you offer free plans?", answer: "Yes, we offer a generous tracking-only free tier for small startups." }
];

export default LandingPage;
