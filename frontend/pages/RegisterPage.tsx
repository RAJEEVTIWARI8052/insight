import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
interface RegisterPageProps {
    onLogin: (user: any) => void;
    theme: 'light' | 'dark';
}

const RegisterPage: React.FC<RegisterPageProps> = ({ onLogin, theme }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [otp, setOtp] = useState('');
    const [step, setStep] = useState<'email' | 'otp' | 'register'>('email');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const navigate = useNavigate();

    // Handle Send OTP
    const handleSendOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setMessage('');

        try {
            await axios.post(`${API_URL}/api/auth/send-otp`, { email });
            setMessage('OTP sent to your email');
            setStep('otp');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to send OTP');
        } finally {
            setLoading(false);
        }
    };

    // Handle Verify OTP
    const handleVerifyOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setMessage('');

        try {
            await axios.post(`${API_URL}/api/auth/verify-otp`, { email, otp });
            setMessage('OTP verified successfully');
            setStep('register');
        } catch (err: any) {
            setError(err.response?.data?.message || 'OTP verification failed');
        } finally {
            setLoading(false);
        }
    };

    // Handle Complete Registration
    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const response = await axios.post(`${API_URL}/api/auth/register`, {
                name,
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
            setError(err.response?.data?.message || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    const bgClass = theme === 'dark' ? 'bg-slate-950' : 'bg-slate-50';
    const cardClass = theme === 'dark'
        ? 'bg-slate-900 text-slate-200'
        : 'bg-white text-slate-900';
    const inputClass = theme === 'dark'
        ? 'bg-slate-800 border-slate-700 text-white'
        : 'bg-white border-slate-300';

    return (
        <div className={`min-h-screen flex items-center justify-center transition-colors duration-300 ${bgClass}`}>
            <div className={`max-w-md w-full p-8 rounded-lg shadow-lg ${cardClass}`}>
                <h2 className="text-2xl font-bold mb-6 text-center">
                    {step === 'email' && 'Create Account'}
                    {step === 'otp' && 'Verify OTP'}
                    {step === 'register' && 'Complete Registration'}
                </h2>

                {error && (
                    <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
                        {error}
                    </div>
                )}

                {message && (
                    <div className="mb-4 p-3 bg-green-100 text-green-700 rounded">
                        {message}
                    </div>
                )}

                {/* Step 1: Send OTP */}
                {step === 'email' && (
                    <form onSubmit={handleSendOtp}>
                        <div className="mb-4">
                            <label className="block text-sm font-medium mb-1">Email</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className={`w-full p-3 rounded border ${inputClass}`}
                                placeholder="Enter your email"
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition disabled:opacity-50 font-medium"
                        >
                            {loading ? 'Sending...' : 'Send OTP'}
                        </button>
                    </form>
                )}

                {/* Step 2: Verify OTP */}
                {step === 'otp' && (
                    <form onSubmit={handleVerifyOtp}>
                        <div className="mb-4">
                            <label className="block text-sm font-medium mb-1">
                                Enter OTP sent to {email}
                            </label>
                            <input
                                type="text"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value)}
                                className={`w-full p-3 rounded border ${inputClass}`}
                                placeholder="6-digit code"
                                maxLength={6}
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition disabled:opacity-50 font-medium"
                        >
                            {loading ? 'Verifying...' : 'Verify OTP'}
                        </button>

                        <button
                            type="button"
                            onClick={() => setStep('email')}
                            className="w-full mt-3 text-blue-600 hover:underline"
                        >
                            Back
                        </button>
                    </form>
                )}

                {/* Step 3: Complete Registration */}
                {step === 'register' && (
                    <form onSubmit={handleRegister}>
                        <div className="mb-4">
                            <label className="block text-sm font-medium mb-1">Full Name</label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className={`w-full p-3 rounded border ${inputClass}`}
                                placeholder="Enter your name"
                                required
                            />
                        </div>

                        <div className="mb-4">
                            <label className="block text-sm font-medium mb-1">Email</label>
                            <input
                                type="email"
                                value={email}
                                className={`w-full p-3 rounded border ${inputClass} opacity-75`}
                                disabled
                            />
                        </div>

                        <div className="mb-6">
                            <label className="block text-sm font-medium mb-1">Password</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className={`w-full p-3 rounded border ${inputClass}`}
                                placeholder="Create a password"
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition disabled:opacity-50 font-medium"
                        >
                            {loading ? 'Creating Account...' : 'Create Account'}
                        </button>
                    </form>
                )}

                <div className="mt-6 text-center">
                    <p className="text-sm">
                        Already have an account?{' '}
                        <Link to="/login" className="text-blue-600 hover:underline">
                            Login here
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default RegisterPage;