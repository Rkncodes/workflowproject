import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, Shield, UserCheck, KeyRound, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

export default function Login() {
  const [username, setUsername] = useState('ar_vikram');
  const [password, setPassword] = useState('password123');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await api.post('/auth/login', { username, password });
      login(res.data, res.data.token);

      if (res.data.role === 'APPLICANT') {
        navigate('/applicant/dashboard');
      } else if (res.data.role === 'OFFICER') {
        navigate('/officer/dashboard');
      } else if (res.data.role === 'ADMIN') {
        navigate('/admin/dashboard');
      }
    } catch (err) {
      setError(err.response?.data || 'Login failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  const setPresetUser = (u, p) => {
    setUsername(u);
    setPassword(p);
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center items-center px-4 py-8">
      {/* Brand Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-teal-500/10 border border-teal-500/30 text-teal-400 mb-4 shadow-inner">
          <Building2 className="w-8 h-8" />
        </div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">CivicFlow</h1>
        <p className="text-sm text-slate-400 mt-1 max-w-sm">
          Municipal Building Permit Management & Camunda 8 Workflow Orchestration System
        </p>
      </div>

      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
        {/* Form Header */}
        <div className="p-6 bg-slate-50 border-b border-slate-200">
          <h2 className="text-lg font-bold text-slate-800">Sign in to E-Governance Portal</h2>
          <p className="text-xs text-slate-500 mt-0.5">Enter your credentials or choose a demonstration role</p>
        </div>

        <form onSubmit={handleLogin} className="p-6 space-y-4">
          {error && (
            <div className="p-3 text-xs font-medium text-rose-700 bg-rose-50 border border-rose-200 rounded-lg">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-semibold text-sm transition shadow-sm disabled:opacity-50"
          >
            {loading ? 'Authenticating...' : 'Sign In'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Demo Credentials Switcher */}
        <div className="p-6 bg-slate-50 border-t border-slate-200">
          <p className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-3">
            Quick Demonstration Profiles:
          </p>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              type="button"
              onClick={() => setPresetUser('ar_vikram', 'password123')}
              className="p-2.5 text-left border rounded-lg bg-white hover:bg-slate-100 transition border-slate-200"
            >
              <div className="font-semibold text-slate-800">Ar. Vikram (Applicant)</div>
              <div className="text-[10px] text-slate-500">Architect role</div>
            </button>
            <button
              type="button"
              onClick={() => setPresetUser('fire_officer', 'password123')}
              className="p-2.5 text-left border rounded-lg bg-white hover:bg-slate-100 transition border-slate-200"
            >
              <div className="font-semibold text-slate-800">Fire Officer (Dept)</div>
              <div className="text-[10px] text-slate-500">Fire Safety officer</div>
            </button>
            <button
              type="button"
              onClick={() => setPresetUser('water_officer', 'password123')}
              className="p-2.5 text-left border rounded-lg bg-white hover:bg-slate-100 transition border-slate-200"
            >
              <div className="font-semibold text-slate-800">Water Officer (Dept)</div>
              <div className="text-[10px] text-slate-500">Water supply officer</div>
            </button>
            <button
              type="button"
              onClick={() => setPresetUser('admin', 'admin123')}
              className="p-2.5 text-left border rounded-lg bg-white hover:bg-slate-100 transition border-slate-200"
            >
              <div className="font-semibold text-slate-800">Admin Sharma</div>
              <div className="text-[10px] text-slate-500">Municipal Administrator</div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

