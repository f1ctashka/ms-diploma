import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();

    const handleLogin = async () => {
        setError('');
        setLoading(true);

        try {
            const response = await fetch(
                'http://localhost:8000/api/uav-service/auth/login/',
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        email,
                        password,
                    }),
                }
            );

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || 'Invalid credentials');
            }

            const data = await response.json();

            // ожидаем { access_token: "..." }
            localStorage.setItem('access_token', data.access_token);
            localStorage.setItem('uav_user', email);

            navigate('/');
        } catch (err) {
            setError(err.message || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <h1>UAV Swarm Login</h1>

                {error && <div className="error-box">{error}</div>}

                <div className="field">
                    <label>Email</label>
                    <input
                        type="email"
                        placeholder="admin@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                </div>

                <div className="field">
                    <label>Password</label>
                    <input
                        type="password"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                </div>

                <button
                    className="primary"
                    style={{ width: '100%', marginTop: '10px' }}
                    onClick={handleLogin}
                    disabled={loading}
                >
                    {loading ? 'Signing in...' : 'Sign In'}
                </button>

                <div
                    style={{
                        textAlign: 'center',
                        marginTop: '16px',
                        fontSize: '14px',
                        opacity: 0.7,
                    }}
                >
                    No account?{' '}
                    <Link to="/register" style={{ color: '#3b82f6' }}>
                        Register
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
