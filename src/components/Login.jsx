import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock } from 'lucide-react';
import './Login.css';

const Login = () => {
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch('http://localhost:3001/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: email })
            });
            const data = await res.json();

            if (data.success) {
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(data.user));
                navigate('/dashboard');
            } else {
                setError(data.error || 'Login failed');
            }
        } catch (err) {
            setError('Connection error');
        }
    };

    return (
        <div className="login-container">
            <div className="login-card">
                <div className="icon-wrapper">
                    <Lock size={32} />
                </div>
                <h2>Welcome Back</h2>
                <p>Enter your email to access the system</p>

                <form onSubmit={handleLogin}>
                    <input
                        type="email"
                        placeholder="admin@ajaromatics.com"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        required
                    />
                    {error && <div className="error-msg">{error}</div>}
                    <button type="submit">Sign In</button>
                </form>
            </div>
        </div>
    );
};

export default Login;
