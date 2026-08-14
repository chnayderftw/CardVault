import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { X, Lock, Mail, User, ArrowRight, Shield, CheckCircle2 } from 'lucide-react';

interface AuthModalProps {
  mode: 'login' | 'signup';
  isOpen: boolean;
  onClose: () => void;
  onSwitchMode: (mode: 'login' | 'signup') => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  mode,
  isOpen,
  onClose,
  onSwitchMode,
}) => {
  const { login, signup } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      if (mode === 'signup') {
        if (password !== confirmPassword) {
          setError('Passwords do not match');
          setLoading(false);
          return;
        }
        await signup({ fullName, email, password, confirmPassword });
        setSuccess('Account created successfully!');
        setTimeout(() => onClose(), 600);
      } else {
        await login({ email, password });
        setSuccess('Logged in successfully!');
        setTimeout(() => onClose(), 600);
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      id="auth-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm select-none"
      onClick={onClose}
    >
      <div
        id="auth-modal-panel"
        className="relative w-full max-w-md bg-[#141414] border border-[#262626] rounded-md shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-[#222222] bg-[#101010]">
          <div className="flex items-center space-x-2">
            <Lock className="w-3.5 h-3.5 text-blue-400" />
            <h3 className="text-xs font-bold text-white tracking-wide uppercase">
              {mode === 'login' ? 'Account Login' : 'Create CardVault Account'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-[#8e8e8e] hover:text-white hover:bg-[#181818]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-3.5">
          {error && (
            <div className="p-2.5 bg-rose-950/60 border border-rose-800 text-rose-300 rounded text-xs">
              {error}
            </div>
          )}

          {success && (
            <div className="p-2.5 bg-emerald-950/60 border border-emerald-800 text-emerald-300 rounded text-xs flex items-center space-x-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>{success}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3">
            {mode === 'signup' && (
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-[#8e8e8e] block">
                  Full Name
                </label>
                <div className="relative">
                  <User className="w-3.5 h-3.5 text-[#737373] absolute left-3 top-2.5" />
                  <input
                    type="text"
                    required
                    placeholder="Alex Reynolds"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full bg-[#101010] border border-[#262626] rounded px-3 py-1.5 pl-8.5 text-xs text-white placeholder-[#737373] focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>
            )}

            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-[#8e8e8e] block">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-3.5 h-3.5 text-[#737373] absolute left-3 top-2.5" />
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[#101010] border border-[#262626] rounded px-3 py-1.5 pl-8.5 text-xs text-white placeholder-[#737373] focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-[#8e8e8e] block">
                Password
              </label>
              <div className="relative">
                <Lock className="w-3.5 h-3.5 text-[#737373] absolute left-3 top-2.5" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[#101010] border border-[#262626] rounded px-3 py-1.5 pl-8.5 text-xs text-white placeholder-[#737373] focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            {mode === 'signup' && (
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-[#8e8e8e] block">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="w-3.5 h-3.5 text-[#737373] absolute left-3 top-2.5" />
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full bg-[#101010] border border-[#262626] rounded px-3 py-1.5 pl-8.5 text-xs text-white placeholder-[#737373] focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>
            )}

            {mode === 'login' && (
              <div className="flex items-center justify-between text-[11px] text-[#8e8e8e]">
                <label className="flex items-center space-x-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded bg-[#101010] border-[#262626] text-blue-600 focus:ring-0"
                  />
                  <span>Remember Me</span>
                </label>

                <button
                  type="button"
                  onClick={() => alert('Password reset is unavailable. Please create a new account or check your login credentials.')}
                  className="text-blue-400 hover:underline"
                >
                  Forgot Password?
                </button>
              </div>
            )}

            <button
              id="auth-submit-btn"
              type="submit"
              disabled={loading}
              className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded text-xs font-semibold tracking-wide transition-colors shadow flex items-center justify-center space-x-1.5"
            >
              <span>{loading ? 'Processing...' : mode === 'login' ? 'Login' : 'Create Account'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>

          {/* Switch Mode */}
          <div className="pt-1.5 text-center text-xs text-[#8e8e8e]">
            {mode === 'login' ? (
              <p>
                Don't have an account?{' '}
                <button
                  onClick={() => onSwitchMode('signup')}
                  className="text-blue-400 font-semibold hover:underline"
                >
                  Create Account
                </button>
              </p>
            ) : (
              <p>
                Already have an account?{' '}
                <button
                  onClick={() => onSwitchMode('login')}
                  className="text-blue-400 font-semibold hover:underline"
                >
                  Login
                </button>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
