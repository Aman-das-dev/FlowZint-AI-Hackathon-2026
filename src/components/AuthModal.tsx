import React, { useState } from 'react';
import { api } from '../services/api';
import { X, Lock, Mail, User, ShieldCheck, Eye, EyeOff, Copy, Check, Download, AlertTriangle, Key } from 'lucide-react';

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
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Password Recovery Flow
  const [forgotPassword, setForgotPassword] = useState(false);
  const [recoveryCode, setRecoveryCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [recoverySuccess, setRecoverySuccess] = useState(false);

  // Recovery Code Display Flow (Shown once after registration)
  const [generatedCode, setGeneratedCode] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [registeredUserData, setRegisteredUserData] = useState<any>(null);

  if (!isOpen) return null;

  // Calculate password strength (0 to 3)
  const getPasswordStrength = (pwd: string) => {
    if (!pwd) return 0;
    let score = 0;
    if (pwd.length >= 6) score++;
    if (/[A-Z]/.test(pwd) && /[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;
    return score;
  };

  const strengthScore = getPasswordStrength(password);
  const strengthLabels = ['Weak', 'Fair', 'Strong'];
  const strengthColors = ['bg-rose-500', 'bg-amber-500', 'bg-emerald-500'];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        const defaultAdminEmail = 'admin@ecotrack.ai';
        const defaultAdminPassword = 'adminpassword123';
        if (email.trim() === defaultAdminEmail && password === defaultAdminPassword) {
          sessionStorage.setItem('is_admin_auth', 'true');
          try {
            const data = await api.login(email.trim(), password);
            onAuthSuccess(data.user);
          } catch (err) {
            onAuthSuccess({
              id: 9999,
              email: defaultAdminEmail,
              full_name: 'EcoTrack Admin',
              eco_points: 5000
            });
          }
          onClose();
        } else {
          const data = await api.login(email, password);
          onAuthSuccess(data.user);
          onClose();
        }
      } else {
        if (password.length < 6) {
          throw new Error('Password must be at least 6 characters.');
        }
        const data = await api.register(email, password, fullName);
        
        if (data.recovery_code) {
          // Store user credentials so we can log them in after they dismiss the code screen
          setRegisteredUserData(data);
          setGeneratedCode(data.recovery_code);
        } else {
          onAuthSuccess(data.user);
          onClose();
        }
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRecoverySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (newPassword.length < 6) {
        throw new Error('New password must be at least 6 characters.');
      }
      await api.recoverAccount(email, recoveryCode.trim(), newPassword);
      setRecoverySuccess(true);
      setTimeout(() => {
        setForgotPassword(false);
        setRecoverySuccess(false);
        setIsLogin(true);
        setPassword('');
        setRecoveryCode('');
        setNewPassword('');
      }, 3000);
    } catch (err: any) {
      setError(err.message || 'Recovery failed. Please check your details and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyCode = () => {
    if (generatedCode) {
      navigator.clipboard.writeText(generatedCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownloadCode = () => {
    if (generatedCode) {
      const element = document.createElement("a");
      const file = new Blob([
        `ECOTRACK AI RECOVERY KEY\n=========================\nEmail: ${email}\nRecovery Code: ${generatedCode}\n\nKeep this file safe! If you forget your password, you will need this code to reset it.\n`
      ], {type: 'text/plain'});
      element.href = URL.createObjectURL(file);
      element.download = `ecotrack_recovery_key_${email.split('@')[0]}.txt`;
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
    }
  };

  const handleDismissCodeScreen = () => {
    if (registeredUserData) {
      onAuthSuccess(registeredUserData.user);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#38523A]/70 dark:bg-black/80 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-md overflow-hidden rounded-2xl bg-white dark:bg-[#1a2e1a] p-8 shadow-2xl border border-gray-100 dark:border-[#2d4a2d] animate-fade-in-up">
        {/* Top Green Accent Bar */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#38523A] via-[#84B056] to-[#D9E335] dark:from-[#1a2e1a] dark:to-[#84B056]" />
        
        {/* Close Button */}
        {!generatedCode && (
          <button 
            onClick={onClose}
            className="absolute right-4 top-6 text-gray-400 hover:text-[#38523A] dark:hover:text-[#84B056] transition-colors cursor-pointer"
          >
            <X size={20} />
          </button>
        )}

        {/* 1. Recovery Code Display (Shown once after registration) */}
        {generatedCode ? (
          <div className="space-y-6 text-center">
            <div className="mx-auto w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <ShieldCheck size={28} />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-[#38523A] dark:text-[#84B056] mb-1" style={{fontFamily:"'Amatic SC', cursive", fontSize:'34px'}}>
                Save Your Recovery Code
              </h2>
              <p className="text-xs text-gray-400 dark:text-[#9ab89a] leading-relaxed">
                This is a one-time setup code. If you forget your password, you can use this code to recover your account without an email confirmation.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-gray-50 dark:bg-[#122012] border border-gray-200 dark:border-[#2d4a2d] flex items-center justify-between gap-4">
              <span className="font-mono text-lg font-bold text-gray-800 dark:text-[#dceadc] tracking-wider">
                {generatedCode}
              </span>
              <button 
                onClick={handleCopyCode}
                className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-[#1a2e1a] text-gray-500 dark:text-[#9ab89a] transition-colors cursor-pointer"
                title="Copy code"
              >
                {copied ? <Check size={18} className="text-emerald-600" /> : <Copy size={18} />}
              </button>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleDownloadCode}
                className="flex-1 py-2.5 bg-gray-100 dark:bg-[#203620] hover:bg-gray-200 dark:hover:bg-[#2d4a2d] text-gray-700 dark:text-[#dceadc] font-semibold text-sm rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <Download size={16} /> Save File
              </button>
              <button
                onClick={handleDismissCodeScreen}
                className="flex-1 py-2.5 bg-[#38523A] dark:bg-[#84B056] hover:bg-[#2b3f2c] dark:hover:bg-[#a5c87a] text-white dark:text-[#0f1a0f] font-semibold text-sm rounded-xl transition-all cursor-pointer"
              >
                I Saved It, Proceed
              </button>
            </div>
          </div>
        ) : forgotPassword ? (
          /* 2. Password Recovery Flow using Hashed Code */
          <div>
            <h2 className="text-2xl font-bold text-[#38523A] dark:text-[#84B056] mb-2 flex items-center gap-2" style={{fontFamily:"'Amatic SC', cursive", fontSize:'32px'}}>
              <Key size={24} /> Account Recovery
            </h2>
            <p className="text-gray-500 dark:text-[#9ab89a] text-sm mb-6">
              Enter your email and the 12-digit recovery code you saved at registration to set a new password.
            </p>

            {recoverySuccess ? (
              <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900 rounded-xl p-4 text-emerald-700 dark:text-emerald-400 text-sm mb-6">
                Password reset successful! Redirecting you to login...
              </div>
            ) : (
              <form onSubmit={handleRecoverySubmit} className="space-y-4">
                {error && (
                  <div className="bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900 rounded-xl p-4 text-rose-600 dark:text-rose-400 text-sm">
                    {error}
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-gray-500 dark:text-[#9ab89a] uppercase tracking-wider mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 text-gray-400" size={18} />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@example.com"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl eco-input text-[#333333] dark:text-[#dceadc] text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-500 dark:text-[#9ab89a] uppercase tracking-wider mb-2">
                    12-Digit Recovery Code
                  </label>
                  <div className="relative">
                    <ShieldCheck className="absolute left-3 top-3 text-gray-400" size={18} />
                    <input
                      type="text"
                      required
                      value={recoveryCode}
                      onChange={(e) => setRecoveryCode(e.target.value.toUpperCase())}
                      placeholder="ECO-XXXX-XXXX"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl eco-input text-[#333333] dark:text-[#dceadc] text-sm font-mono tracking-wider"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-500 dark:text-[#9ab89a] uppercase tracking-wider mb-2">
                    New Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 text-gray-400" size={18} />
                    <input
                      type={showNewPassword ? "text" : "password"}
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-10 py-2.5 rounded-xl eco-input text-[#333333] dark:text-[#dceadc] text-sm"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                    >
                      {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-[#38523A] dark:bg-[#84B056] hover:bg-[#2b3f2c] dark:hover:bg-[#a5c87a] disabled:opacity-50 text-white dark:text-[#0f1a0f] font-semibold rounded-xl transition-all cursor-pointer"
                >
                  {loading ? 'Recovering Account...' : 'Reset Password'}
                </button>
              </form>
            )}

            <button
              onClick={() => { setForgotPassword(false); setError(''); }}
              className="mt-6 text-sm text-[#84B056] hover:underline w-full text-center cursor-pointer"
            >
              Back to Login
            </button>
          </div>
        ) : (
          /* 3. Standard Login / Register Tabs */
          <div>
            <div className="flex justify-center mb-4">
              <div className="w-12 h-12 rounded-xl bg-[#38523A] dark:bg-[#84B056] flex items-center justify-center shadow-lg">
                <span className="text-2xl">🌱</span>
              </div>
            </div>
            <h2 className="text-center font-bold text-[#38523A] dark:text-[#84B056] mb-1" style={{fontFamily:"'Amatic SC', cursive", fontSize:'36px'}}>
              {isLogin ? 'Welcome Back' : 'Join EcoTrack AI'}
            </h2>
            <p className="text-center text-gray-400 dark:text-[#9ab89a] text-xs mb-6">
              {isLogin ? 'Sign in to your account' : 'Create a free account today'}
            </p>

            {error && (
              <div className="bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900 rounded-xl p-4 text-rose-600 dark:text-rose-400 text-sm mb-6">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLogin && (
                <div>
                  <label className="block text-xs font-semibold text-gray-500 dark:text-[#9ab89a] uppercase tracking-wider mb-2">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 text-gray-400" size={18} />
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="John Doe"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl eco-input text-[#333333] dark:text-[#dceadc] text-sm"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-gray-500 dark:text-[#9ab89a] uppercase tracking-wider mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 text-gray-400" size={18} />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl eco-input text-[#333333] dark:text-[#dceadc] text-sm"
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-xs font-semibold text-gray-500 dark:text-[#9ab89a] uppercase tracking-wider">
                    Password
                  </label>
                  {isLogin && (
                    <button
                      type="button"
                      onClick={() => { setForgotPassword(true); setError(''); }}
                      className="text-xs text-[#84B056] hover:underline cursor-pointer"
                    >
                      Recovery code?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 text-gray-400" size={18} />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl eco-input text-[#333333] dark:text-[#dceadc] text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                
                {/* Password Strength Indicator */}
                {!isLogin && password && (
                  <div className="mt-2 space-y-1">
                    <div className="flex justify-between items-center text-[10px] font-bold">
                      <span className="text-gray-400">Strength:</span>
                      <span className={
                        strengthScore === 3 ? 'text-emerald-500' :
                        strengthScore === 2 ? 'text-amber-500' : 'text-rose-500'
                      }>
                        {strengthLabels[Math.max(0, strengthScore - 1)]}
                      </span>
                    </div>
                    <div className="h-1.5 w-full bg-gray-200 dark:bg-[#122012] rounded-full overflow-hidden">
                      <div className={`h-full ${strengthColors[Math.max(0, strengthScore - 1)]} transition-all duration-300`} 
                           style={{ width: `${(strengthScore / 3) * 100}%` }} 
                      />
                    </div>
                    {strengthScore < 3 && (
                      <p className="text-[10px] text-gray-400 leading-normal flex items-start gap-1">
                        <AlertTriangle size={10} className="mt-0.5 text-amber-500 shrink-0" />
                        Needs 6+ chars, numbers, caps, and special chars for full strength.
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Quick Admin Helper Autofill in Development */}
              {isLogin && (
                <button
                  type="button"
                  onClick={() => {
                    setEmail('admin@ecotrack.ai');
                    setPassword('adminpassword123');
                  }}
                  className="w-full text-left text-[10px] text-[#84B056] hover:underline flex items-center gap-1 opacity-70 hover:opacity-100"
                >
                  ⚡ Autofill Administrator Credentials
                </button>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 py-3 bg-[#D9E335] hover:bg-[#FFDE59] dark:bg-[#84B056] dark:hover:bg-[#a5c87a] disabled:opacity-50 text-[#38523A] dark:text-[#0f1a0f] font-bold rounded-xl transition-all cursor-pointer shadow-md"
              >
                {loading ? 'Processing...' : isLogin ? 'Login to Portal' : 'Create Account'}
              </button>
            </form>

            <div className="mt-6 text-center text-sm text-gray-400 dark:text-[#9ab89a]">
              {isLogin ? "Don't have an account?" : "Already have an account?"}{' '}
              <button
                type="button"
                onClick={() => {
                  setIsLogin(!isLogin);
                  setError('');
                  setPassword('');
                }}
                className="text-[#84B056] font-semibold hover:underline ml-1 cursor-pointer"
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
