import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, AlertCircle, CheckCircle, Factory, User, Mail, Lock } from 'lucide-react';
import { motion } from 'framer-motion';
import './Login.css'; // Reuse the Login CSS for consistent theme
import loginIllustration from './login_illustration_1768196804821.png'; // Reuse illustration or use a new one

const Signup = ({ onLogin }) => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const handleSignup = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (password.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }

        setIsLoading(true);

        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 1500));

        // --- MOCK DATABASE LOGIC ---
        // 1. Get existing users
        const existingUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');

        // 2. Check if user exists
        if (existingUsers.find(u => u.email === email)) {
            setError('User already exists with this email');
            setIsLoading(false);
            return;
        }

        // 3. Add new user
        const newUser = { name, email, password }; // Note: In real app, never store passwords locally!
        existingUsers.push(newUser);
        localStorage.setItem('registeredUsers', JSON.stringify(existingUsers));

        // --- SESSION LOGIC ---
        // Auto-login logic
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('userEmail', email);
        localStorage.setItem('userName', name);

        if (onLogin) onLogin();

        setSuccess('Account created! Logging in...');

        setTimeout(() => {
            navigate('/');
        }, 1000);
    };

    return (
        <div className="login-wrapper">
            <div className="login-container-split">
                {/* Left Side - Illustration */}
                <motion.div
                    className="login-left"
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6 }}
                >
                    <div className="illustration-container">
                        <img src={loginIllustration} alt="Production Management" className="login-illustration" />
                    </div>
                </motion.div>

                {/* Right Side - Form */}
                <motion.div
                    className="login-right"
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6 }}
                >
                    <div className="login-form-container">
                        <div className="login-brand">
                            <div className="brand-logo-circle">
                                <Factory size={20} strokeWidth={2.5} />
                            </div>
                            <span className="brand-name">DHARS</span>
                        </div>

                        <h2 className="form-title">Create an account</h2>

                        <form onSubmit={handleSignup} className="login-form-new">
                            {error && (
                                <motion.div
                                    className="alert-new alert-error-new"
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                >
                                    <AlertCircle size={16} />
                                    <span>{error}</span>
                                </motion.div>
                            )}

                            {success && (
                                <motion.div
                                    className="alert-new alert-success-new"
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                >
                                    <CheckCircle size={16} />
                                    <span>{success}</span>
                                </motion.div>
                            )}

                            <div className="input-group">
                                <div className="password-wrapper">
                                    <input
                                        type="text"
                                        id="name"
                                        className="form-input-new"
                                        placeholder="Full Name"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        required
                                        style={{ paddingLeft: '1rem' }}
                                    />
                                    {/* Optional Icon */}
                                </div>
                            </div>

                            <div className="input-group">
                                <input
                                    type="email"
                                    id="email"
                                    className="form-input-new"
                                    placeholder="Email address"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    autoComplete="email"
                                />
                            </div>

                            <div className="input-group">
                                <div className="password-wrapper">
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        id="password"
                                        className="form-input-new"
                                        placeholder="Password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                        autoComplete="new-password"
                                    />
                                    <button
                                        type="button"
                                        className="password-toggle-new"
                                        onClick={() => setShowPassword(!showPassword)}
                                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                                    >
                                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                            </div>

                            <div className="input-group">
                                <div className="password-wrapper">
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        id="confirmPassword"
                                        className="form-input-new"
                                        placeholder="Confirm Password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        required
                                        autoComplete="new-password"
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                className="submit-button"
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <>
                                        <span className="spinner-new"></span>
                                        Creating account...
                                    </>
                                ) : (
                                    'Create account'
                                )}
                            </button>

                            <div className="form-footer">
                                <p className="signup-link">
                                    Already have an account? <Link to="/login">Log in</Link>
                                </p>
                            </div>
                        </form>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default Signup;
