import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

interface LoginPageProps {
    onLogin: (user: any) => void;
    theme: 'light' | 'dark';
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin, theme }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {

            const response = await axios.post(`${API_URL}/api/auth/login`, {
                email,
                password
            });

            if (response.data.token) {
                localStorage.setItem('token', response.data.token);
                localStorage.setItem('user', JSON.stringify(response.data.user));
                onLogin(response.data.user);
                navigate('/');
            }
        } catch (err: any) {
            setError(err.response?.data?.message || 'Login failed');
        } finally {
            setLoading(false);
        }
    };


    return (
        <div className={`min-h-screen flex items-center justify-center transition-colors duration-300 ${theme === 'dark' ? 'bg-slate-950' : 'bg-slate-50'
            }`}>
            <div className={`max-w-md w-full p-8 rounded-lg shadow-lg ${theme === 'dark' ? 'bg-slate-900 text-slate-200' : 'bg-white text-slate-900'
                }`}>
                <h2 className="text-2xl font-bold mb-6 text-center">Welcome Back</h2>

                {error && (
                    <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block text-sm font-medium mb-1">Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className={`w-full p-3 rounded border ${theme === 'dark'
                                ? 'bg-slate-800 border-slate-700 text-white'
                                : 'bg-white border-slate-300'
                                }`}
                            placeholder="Enter your email"
                            required
                        />
                    </div>

                    <div className="mb-6">
                        <label className="block text-sm font-medium mb-1">Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className={`w-full p-3 rounded border ${theme === 'dark'
                                ? 'bg-slate-800 border-slate-700 text-white'
                                : 'bg-white border-slate-300'
                                }`}
                            placeholder="Enter your password"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition disabled:opacity-50 font-medium"
                    >
                        {loading ? 'Logging in...' : 'Login'}
                    </button>
                </form>

                <div className="mt-6 text-center">
                    <p className="text-sm">
                        Don't have an account?{' '}
                        <Link to="/register" className="text-blue-600 hover:underline">
                            Register here
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;