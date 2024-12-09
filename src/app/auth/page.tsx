'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AuthPage() {
    const [activeTab, setActiveTab] = useState<'login' | 'register'>('login'); 
    const router = useRouter();

    const handleTabChange = (tab: 'login' | 'register') => {
        setActiveTab(tab);
    };

    return (
        <div className="auth-container">
            <h1>Authorization</h1>
            <div className="tabs">
                <button
                    className={activeTab === 'login' ? 'active' : ''}
                    onClick={() => handleTabChange('login')}
                >
                    Login
                </button>
                <button
                    className={activeTab === 'register' ? 'active' : ''}
                    onClick={() => handleTabChange('register')}
                >
                    Register
                </button>
            </div>

            <div className="form-container">
                {activeTab === 'login' ? (
                    <LoginForm router={router} />
                ) : (
                    <RegisterForm router={router} setActiveTab={setActiveTab} />
                )}
            </div>
        </div>
    );
}

function LoginForm({ router }: { router: any }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const res = await fetch('http://localhost:4000/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            if (res.ok) {
                const data = await res.json();
                localStorage.setItem('token', data.token);
                alert('Login successful!');
                router.push('/cabinet'); 
            } else {
                alert('Login failed. Please check your credentials.');
            }
        } catch (error) {
            console.error('Error logging in:', error);
            alert('An error occurred. Please try again.');
        }
    };

    return (
        <form onSubmit={handleLogin} className="auth-form">
            <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
            />
            <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
            />
            <button type="submit">Login</button>
        </form>
    );
}

function RegisterForm({ router, setActiveTab }: { router: any; setActiveTab: any }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            alert('Passwords do not match');
            return;
        }

        try {
            const res = await fetch('http://localhost:4000/api/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            if (res.ok) {
                alert('Registration successful!');
                setEmail('');
                setPassword('');
                setConfirmPassword('');
                router.push('/cabinet'); 
            } else {
                const error = await res.json();
                alert(`Registration failed: ${error.error}`);
            }
        } catch (error) {
            console.error('Error registering:', error);
            alert('An error occurred. Please try again.');
        }
    };

    return (
        <form onSubmit={handleRegister} className="auth-form">
            <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
            />
            <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
            />
            <input
                type="password"
                placeholder="Confirm Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
            />
            <button type="submit">Register</button>
        </form>
    );
}
