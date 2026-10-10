import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../components/Card';
import Button from '../components/Button';
import BrandLogo from '../components/BrandLogo';
import { Lock, ArrowLeft } from 'lucide-react';
import { useAuth } from '../context';

const demoAccounts = [
  { role: 'STUDENT', email: 'student@demo.com', password: 'demo123' },
  { role: 'ALUMNI', email: 'alumni@demo.com', password: 'demo123' },
  { role: 'TPO', email: 'tpo@demo.com', password: 'demo123' },
  { role: 'ADMIN', email: 'admin@demo.com', password: 'demo123' },
];

export const LoginPage = () => {
  const navigate = useNavigate();
  const { login, loading } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await login(form.email, form.password);
    } catch (err) {
      setError(err.message || 'Login failed');
    }
  };

  const handleDemo = async (account) => {
    setError('');
    try {
      await login(account.email, account.password);
    } catch (err) {
      setError(err.message || 'Demo login failed');
    }
  };

  const demoEnabled = import.meta.env.VITE_ENABLE_DEMO_ACCESS === 'true';

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <Card className="max-w-md w-full text-center" padding="lg">
        <div className="flex justify-center mb-6">
          <BrandLogo size="lg" />
        </div>

        <div className="w-12 h-12 bg-indigo-50 text-[#4F46E5] rounded-full flex items-center justify-center mx-auto mb-4 border border-indigo-100">
          <Lock className="w-6 h-6" />
        </div>

        <h1 className="text-2xl font-bold text-[#172033] mb-2">Sign In to CareerBridge</h1>

        {error && <p className="text-red-600 mb-3">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            name="email"
            required
            placeholder="Email"
            className="w-full rounded border p-2"
            value={form.email}
            onChange={handleChange}
          />
          <input
            type="password"
            name="password"
            required
            placeholder="Password"
            className="w-full rounded border p-2"
            value={form.password}
            onChange={handleChange}
          />
          <Button type="submit" fullWidth variant="primary" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </Button>
        </form>

        {demoEnabled && (
          <div className="mt-6 space-y-2">
            <p className="text-sm text-slate-500 text-center">Demo Accounts</p>
            {demoAccounts.map((acc) => (
              <Button
                key={acc.role}
                type="button"
                fullWidth
                variant="outline"
                onClick={() => handleDemo(acc)}
              >
                Log in as {acc.role}
              </Button>
            ))}
          </div>
        )}

        <div className="space-y-3 mt-4">
          <Button to="/register" variant="outline" fullWidth>
            Need an account? Register here
          </Button>
          <Button to="/" variant="ghost" fullWidth icon={ArrowLeft}>
            Back to Home
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default LoginPage;
