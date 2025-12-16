
import React from 'react';
import { Link } from 'react-router-dom';
import { motion, useSpring, useTransform, useMotionValue } from 'framer-motion';
import { Package, ClipboardList, Hammer, TrendingUp, Calculator, Users, ArrowRight } from 'lucide-react';
import './LandingPage.css';

const LandingPage = () => {
    // Mouse tracking for parallax
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    const handleMouseMove = (e) => {
        const { clientX, clientY } = e;
        const { innerWidth, innerHeight } = window;
        mouseX.set(clientX / innerWidth - 0.5);
        mouseY.set(clientY / innerHeight - 0.5);
    };

    return (
        <div className="spline-container" onMouseMove={handleMouseMove}>

            {/* --- 3D Background Scene (Incense Theme) --- */}
            <div className="spline-backdrop">
                {/* Main 3D Incense Stick */}
                <IncenseStick
                    mouseX={mouseX}
                    mouseY={mouseY}
                />

                {/* Ambient Smoke Particles */}
                <SmokeParticle size={300} top="20%" left="20%" duration={15} delay={0} />
                <SmokeParticle size={400} top="50%" left="60%" duration={18} delay={2} />
                <SmokeParticle size={250} top="70%" left="30%" duration={12} delay={5} />

                {/* Grid Overlay for texture */}
                <div className="grid-texture" style={{ opacity: 0.2 }}></div>
            </div>

            {/* --- Content Layer --- */}
            <main className="content-layer">
                <header className="spline-header">
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                    >
                        <h1 className="spline-title">
                            AJ <span className="gradient-text">Aromatics</span>
                        </h1>
                        <p className="spline-desc">
                            Crafting the Atmosphere of Tomorrow. <br />
                            Premium Incense Production System.
                        </p>
                    </motion.div>
                </header>

                <div className="glass-deck">
                    <GlassCard to="/dashboard" title="Production" icon={<Package />} />
                    <GlassCard to="/inventory" title="Inventory" icon={<ClipboardList />} />
                    <GlassCard title="Formulation" icon={<Hammer />} />
                    <GlassCard title="Global Sales" icon={<TrendingUp />} />
                    <GlassCard title="Finance" icon={<Calculator />} />
                    <GlassCard title="Team" icon={<Users />} />
                </div>
            </main>
        </div>
    );
};

// 3D Incense Stick Component
const IncenseStick = ({ mouseX, mouseY }) => {
    const rotateX = useTransform(mouseY, [-0.5, 0.5], [10, -10]);
    const rotateY = useTransform(mouseX, [-0.5, 0.5], [-10, 10]);

    return (
        <motion.div
            style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                x: '-50%',
                y: '-50%',
                rotateX,
                rotateY,
                perspective: 1000
            }}
        >
            <div className="incense-stick-3d">
                <div className="incense-glow-tip"></div>
                {/* Emitting Smoke from Tip */}
                <RisingSmoke />
            </div>
        </motion.div>
    );
};

// Procedural Smoke Component
const RisingSmoke = () => {
    return (
        <div style={{ position: 'absolute', top: -10, left: '50%', transform: 'translateX(-50%)' }}>
            {[...Array(5)].map((_, i) => (
                <motion.div
                    key={i}
                    style={{
                        position: 'absolute',
                        width: 20,
                        height: 20,
                        background: 'rgba(200, 200, 200, 0.2)',
                        borderRadius: '50%',
                        filter: 'blur(8px)',
                    }}
                    animate={{
                        y: [-10, -150 - (i * 30)],
                        x: [0, Math.sin(i) * 30, Math.cos(i) * -30],
                        opacity: [0.6, 0],
                        scale: [1, 2 + i],
                    }}
                    transition={{
                        duration: 3 + i,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: i * 0.5
                    }}
                />
            ))}
        </div>
    )
}

// Background Ambient Smoke
const SmokeParticle = ({ size, top, left, duration, delay }) => {
    return (
        <motion.div
            className="smoke-particle"
            style={{ width: size, height: size, top, left }}
            animate={{
                y: [0, -50, 0],
                x: [0, 30, 0],
                opacity: [0.3, 0.5, 0.3],
                scale: [1, 1.1, 1],
            }}
            transition={{
                duration: duration,
                repeat: Infinity,
                repeatType: "reverse",
                ease: "easeInOut",
                delay: delay
            }}
        />
    );
};

const GlassCard = ({ to, title, icon }) => {
    const CardContent = () => (
        <div className="glass-content">
            <div className="icon-bubble">
                {icon}
            </div>
            <span className="card-label">{title}</span>
            <div className="card-shine"></div>
        </div>
    );

    return (
        <motion.div
            className="glass-card-wrapper"
            whileHover={{ y: -5 }}
            transition={{ type: "spring", stiffness: 300 }}
        >
            {to ? <Link to={to} className="glass-link"><CardContent /></Link> : <CardContent />}
        </motion.div>
    );
};

export default LandingPage;

