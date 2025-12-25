import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const RegisterPage = () => {
    const navigate = useNavigate();

    const handleRegister = () => {
        alert("Registration successful! (Mock)");
        navigate('/login');
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <h1>Create Account</h1>
                
                <div className="field">
                    <label>Name</label>
                    <input type="text" placeholder="John Doe" />
                </div>

                <div className="field">
                    <label>Email</label>
                    <input type="email" placeholder="user@example.com" />
                </div>

                <div className="field">
                    <label>Password</label>
                    <input type="password" placeholder="••••••••" />
                </div>

                <div className="field">
                    <label>Repeat Password</label>
                    <input type="password" placeholder="••••••••" />
                </div>

                <button 
                    className="primary" 
                    style={{ width: '100%', marginTop: '10px', background: '#22c55e' }}
                    onClick={handleRegister}
                >
                    Register
                </button>

                <div style={{ textAlign: 'center', marginTop: '16px', fontSize: '14px', opacity: 0.7 }}>
                    Already have an account? <Link to="/login" style={{ color: '#3b82f6' }}>Login</Link>
                </div>
            </div>
        </div>
    );
};

export default RegisterPage;
