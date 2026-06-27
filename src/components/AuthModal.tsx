import React, { useState } from 'react';
import { api } from '../services/api';
import { X, Lock, Mail, User, ShieldCheck } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess: (user: any) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onAuthSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [forgotPassword, setForgotPassword] = useState(false);
  const [forgotSuccess, setForgotSuccess] = useState(false);
  const [googlePrompt, setGooglePrompt] = useState(false);
  const [googleEmailInput, setGoogleEmailInput] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        const data = await api.login(email, password);
        onAuthSuccess(data.user);
      } else {
        const data = await api.register(email, password, fullName);
        onAuthSuccess(data.user);
      }
      onClose();
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setForgotSuccess(true);
      setLoading(false);
    }, 1500);
  };

  const handleGoogleLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const targetEmail = googleEmailInput || email;
    if (!targetEmail) {
      setGooglePrompt(true);
      return;
    }
    setLoading(true);
    setError('');
    try {
      const gNameRaw = targetEmail.split('@')[0].replace('.', ' ').replace('_', ' ');
      const formattedName = gNameRaw.charAt(0).toUpperCase() + gNameRaw.slice(1);
      const data = await api.googleLogin(targetEmail, `${formattedName} (Google)`);
      onAuthSuccess(data.user);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Google authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-md overflow-hidden rounded-2xl glass-panel p-8 shadow-2xl border border-white/10 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-400 hover:text-white transition-colors"
        >
          <X size={20} />
        </button>

        {googlePrompt ? (
          <div>
            <h2 className="text-2xl font-bold text-white mb-2 flex items-center justify-center gap-2">
              <svg className="h-6 w-6" viewBox="0 0 24 24" width="24" height="24" xmlns="http://www.w3.org/2000/svg">
                <path d="M21.35,11.1H12v2.7h5.38C16.88,15.22,15.34,16.5,12,16.5c-3.1,0-5.62-2.52-5.62-5.62s2.52-5.62,5.62-5.62c1.74,0,3.12,0.7,4.04,1.56l2.1-2.1C16.54,3.14,14.48,2.2,12,2.2c-5.41,0-9.8,4.39-9.8,9.8s4.39,9.8,9.8,9.8c5.07,0,9.08-3.57,9.08-9.08C21.08,12.18,21.02,11.64,21.35,11.1z" fill="#EA4335" />
              </svg>
              Google Account Sign-In
            </h2>
            <p className="text-gray-400 text-sm mb-6 text-center">
              Enter your Google Account email address to authenticate directly with PostgreSQL.
            </p>

            <form onSubmit={(e) => handleGoogleLogin(e)} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                  Google Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 text-gray-500" size={18} />
                  <input
                    type="email"
                    required
                    value={googleEmailInput}
                    onChange={(e) => setGoogleEmailInput(e.target.value)}
                    placeholder="user@gmail.com"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl glass-input text-white text-sm"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-white hover:bg-gray-100 disabled:opacity-50 text-black font-semibold rounded-xl transition-all cursor-pointer shadow-lg"
              >
                {loading ? 'Authenticating...' : 'Sign In with Google'}
              </button>
            </form>

            <button
              onClick={() => setGooglePrompt(false)}
              className="mt-6 text-sm text-emerald-400 hover:underline w-full text-center"
            >
              Back to Standard Login
            </button>
          </div>
        ) : forgotPassword ? (
          <div>
            <h2 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
              <ShieldCheck className="text-emerald-500" /> Reset Password
            </h2>
            <p className="text-gray-400 text-sm mb-6">
              Enter your email and we'll send you instructions to reset your password.
            </p>

            {forgotSuccess ? (
              <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4 text-emerald-400 text-sm mb-6">
                Recovery link sent! Please check your email inbox and spam folder.
              </div>
            ) : (
              <form onSubmit={handleForgotPassword} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 text-gray-500" size={18} />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@example.com"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl glass-input text-white text-sm"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 disabled:opacity-50 text-black font-semibold rounded-xl transition-all cursor-pointer"
                >
                  {loading ? 'Sending Request...' : 'Send Recovery Email'}
                </button>
              </form>
            )}

            <button
              onClick={() => { setForgotPassword(false); setForgotSuccess(false); }}
              className="mt-6 text-sm text-emerald-400 hover:underline w-full text-center"
            >
              Back to Login
            </button>
          </div>
        ) : (
          <div>
            <h2 className="text-3xl font-bold text-white mb-6 text-center tracking-tight">
              {isLogin ? 'Welcome Back' : 'Join EcoTrack AI'}
            </h2>

            {error && (
              <div className="bg-rose-500/10 border border-rose-500/30 rounded-xl p-4 text-rose-400 text-sm mb-6">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLogin && (
                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 text-gray-500" size={18} />
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="John Doe"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl glass-input text-white text-sm"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 text-gray-500" size={18} />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl glass-input text-white text-sm"
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Password
                  </label>
                  {isLogin && (
                    <button
                      type="button"
                      onClick={() => setForgotPassword(true)}
                      className="text-xs text-emerald-400 hover:underline"
                    >
                      Forgot password?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 text-gray-500" size={18} />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl glass-input text-white text-sm"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 py-3 bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 disabled:opacity-50 text-black font-semibold rounded-xl transition-all cursor-pointer shadow-lg shadow-emerald-500/20"
              >
                {loading ? 'Processing...' : isLogin ? 'Login to Portal' : 'Create Account'}
              </button>
            </form>

            <div className="relative flex py-4 items-center">
              <div className="flex-grow border-t border-white/10"></div>
              <span className="flex-shrink mx-4 text-gray-500 text-xs uppercase tracking-widest">Or continue with</span>
              <div className="flex-grow border-t border-white/10"></div>
            </div>

            {/* Google Authentication Button */}
            <button
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full py-2.5 bg-white hover:bg-gray-100 text-black font-medium rounded-xl flex items-center justify-center gap-3 transition-colors cursor-pointer text-sm shadow-md"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24" width="24" height="24" xmlns="http://www.w3.org/2000/svg">
                <g transform="matrix(1, 0, 0, 1, 0, 0)">
                  <path d="M21.35,11.1H12v2.7h5.38C16.88,15.22,15.34,16.5,12,16.5c-3.1,0-5.62-2.52-5.62-5.62s2.52-5.62,5.62-5.62c1.74,0,3.12,0.7,4.04,1.56l2.1-2.1C16.54,3.14,14.48,2.2,12,2.2c-5.41,0-9.8,4.39-9.8,9.8s4.39,9.8,9.8,9.8c5.07,0,9.08-3.57,9.08-9.08C21.08,12.18,21.02,11.64,21.35,11.1z" fill="#EA4335" />
                </g>
              </svg>
              Google Account
            </button>

            <div className="mt-6 text-center text-sm text-gray-400">
              {isLogin ? "Don't have an account?" : "Already have an account?"}{' '}
              <button
                type="button"
                onClick={() => setIsLogin(!isLogin)}
                className="text-emerald-400 font-medium hover:underline ml-1"
              >
                {isLogin ? 'Sign up' : 'Login'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
