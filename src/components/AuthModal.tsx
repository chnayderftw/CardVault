import React, { useState } from 'react';
import { X, Lock, Mail, User as UserIcon, ShieldAlert, CheckCircle2, Vault } from 'lucide-react';
import { api, setStoredToken } from '../lib/api';
import { User } from '../types';

interface AuthModalProps {
  initialMode: 'login' | 'register';
  onClose: () => void;
  onSuccess: (user: User) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ initialMode, onClose, onSuccess }) => {
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (mode === 'login') {
        const res = await api.login({ email, password });
        setStoredToken(res.token);
        onSuccess(res.user);
        onClose();
      } else {
        if (password !== confirmPassword) {
          setError('Passwords do not match.');
          setLoading(false);
          return;
        }
        const res = await api.register({ fullName, email, password, confirmPassword });
        setStoredToken(res.token);
        onSuccess(res.user);
        onClose();
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs font-mono">
      <div className="w-full max-w-md bg-[#0a0a0a] border border-[#1f1f1f] text-xs text-[#e0e0e0] shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-3 bg-[#111111] border-b border-[#1f1f1f]">
          <div className="flex items-center space-x-2">
            <div className="w-5 h-5 bg-gradient-to-br from-blue-600 to-indigo-700 rounded flex items-center justify-center text-white">
              <Vault className="w-3 h-3" />
            </div>
            <span className="font-bold text-xs uppercase tracking-wider text-white">
              {mode === 'login' ? 'CARDVAULT LOGIN' : 'CREATE CLIENT ACCOUNT'}
            </span>
          </div>
          <button onClick={onClose} className="text-[#888888] hover:text-white p-1">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {error && (
            <div className="bg-red-950/40 border border-red-800/60 p-2.5 text-red-400 text-[11px] flex items-center space-x-2">
              <ShieldAlert className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {mode === 'register' && (
            <div className="space-y-1">
              <label className="text-[9px] uppercase text-[#888888]">FULL NAME / ENTITY</label>
              <div className="relative">
                <input
                  type="text"
                  required
                  placeholder="e.g. John Doe / Acme Corp"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full bg-[#151515] border border-[#2a2a2a] p-2 text-xs text-white focus:outline-none focus:border-blue-500 font-mono"
                />
              </div>
            </div>
          )}

          <div className="space-y-1">
            <label className="text-[9px] uppercase text-[#888888]">EMAIL ADDRESS</label>
            <input
              type="email"
              required
              placeholder="user@enterprise.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-[#151515] border border-[#2a2a2a] p-2 text-xs text-white focus:outline-none focus:border-blue-500 font-mono"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[9px] uppercase text-[#888888]">PASSWORD</label>
            <input
              type="password"
              required
              placeholder="••••••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-[#151515] border border-[#2a2a2a] p-2 text-xs text-white focus:outline-none focus:border-blue-500 font-mono"
            />
          </div>

          {mode === 'register' && (
            <div className="space-y-1">
              <label className="text-[9px] uppercase text-[#888888]">CONFIRM PASSWORD</label>
              <input
                type="password"
                required
                placeholder="••••••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full bg-[#151515] border border-[#2a2a2a] p-2 text-xs text-white focus:outline-none focus:border-blue-500 font-mono"
              />
            </div>
          )}

          {mode === 'login' && (
            <div className="flex items-center justify-between text-[10px]">
              <label className="flex items-center space-x-2 cursor-pointer text-[#888888]">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="bg-[#151515] border-[#2a2a2a] text-blue-600 focus:ring-0"
                />
                <span>REMEMBER SESSION</span>
              </label>
              <a
                href="#forgot"
                onClick={(e) => {
                  e.preventDefault();
                  alert('For password reset assistance, please contact Enterprise Support via TRC20 verification ticket.');
                }}
                className="text-blue-400 hover:underline"
              >
                FORGOT PASSWORD?
              </a>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-gray-800 text-white font-bold uppercase py-2 text-xs tracking-wider transition shadow-md"
          >
            {loading ? 'AUTHENTICATING...' : mode === 'login' ? 'SIGN IN TO PORTAL' : 'CREATE CLIENT ACCOUNT'}
          </button>

          <div className="pt-2 border-t border-[#1f1f1f] text-center text-[10px] text-[#888888]">
            {mode === 'login' ? (
              <span>
                NEED AN ACCOUNT?{' '}
                <button
                  type="button"
                  onClick={() => setMode('register')}
                  className="text-blue-400 hover:underline font-bold"
                >
                  SIGN UP HERE
                </button>
              </span>
            ) : (
              <span>
                ALREADY REGISTERED?{' '}
                <button
                  type="button"
                  onClick={() => setMode('login')}
                  className="text-blue-400 hover:underline font-bold"
                >
                  LOG IN HERE
                </button>
              </span>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};
