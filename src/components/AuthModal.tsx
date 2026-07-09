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

  // OTP Flow States
  const [loginMethod, setLoginMethod] = useState<'password' | 'email_otp'>('password');
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [devOtpCode, setDevOtpCode] = useState<string | null>(null);
  const [showGoogleMock, setShowGoogleMock] = useState(false);

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

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    setDevOtpCode(null);
    try {
      const destination = email;
      if (!destination) {
        throw new Error('Email is required');
      }
      const data = await api.sendOtp(destination);
      setOtpSent(true);
      if (data.dev_otp) {
        setDevOtpCode(data.dev_otp);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to send verification code.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const destination = email;
      const data = await api.verifyOtp(destination, otpCode, fullName || undefined);
      onAuthSuccess(data.user);
      onClose();
    } catch (err: any) {
      setError(err.message || 'OTP verification failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLoginSubmit = async (gEmail: string, gName: string, gAvatarUrl: string) => {
    setError('');
    setLoading(true);
    try {
      const data = await api.googleLogin(gEmail, gName, gAvatarUrl);
      onAuthSuccess(data.user);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Google Sign-In failed.');
    } finally {
      setLoading(false);
      setShowGoogleMock(false);
    }
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
          <div className="relative">
            {/* Google Mock Sign-In Selector Popup Overlay (inline in the tab content card) */}
            {showGoogleMock && (
              <div className="absolute inset-0 z-50 flex flex-col justify-center items-center bg-[#38523A] dark:bg-[#111e11] rounded-xl p-4 text-white animate-fade-in">
                <button 
                  type="button"
                  onClick={() => setShowGoogleMock(false)}
                  className="absolute right-3 top-3 text-gray-300 hover:text-white transition-colors cursor-pointer"
                >
                  <X size={20} />
                </button>
                <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-lg mb-3">
                  <svg className="w-5 h-5" viewBox="0 0 24 24" width="24" height="24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M21.35,11.1H12v2.7h5.38C16.88,16.29,14.67,17.9,12,17.9c-3.26,0-6-2.22-6.98-5.22c-0.26-0.78-0.4-1.6-0.4-2.48 s0.15-1.7,0.4-2.48C6,4.72,8.74,2.5,12,2.5c1.78,0,3.38,0.62,4.64,1.82l2.02-2.02C17.3,1.04,14.83,0,12,0 C7.33,0,3.31,2.69,1.38,6.61C1.04,7.31,0.76,8.06,0.55,8.85C0.19,10.05,0,11.32,0,12.63c0,1.31,0.19,2.58,0.55,3.78 c0.21,0.78,0.49,1.54,0.83,2.23c1.94,3.92,5.96,6.61,10.62,6.61c5.96,0,10.96-3.95,12.06-9.61c0.16-0.81,0.24-1.65,0.24-2.52 C24,12.41,23.83,11.73,21.35,11.1z" fill="#4285F4" />
                    <path d="M12,24c3.24,0,5.97-1.07,7.96-2.91l-3.08-2.39C15.82,19.37,14.07,19.9,12,19.9c-3.26,0-6-2.22-6.98-5.22 c-0.26-0.78-0.4-1.6-0.4-2.48s0.15-1.7,0.4-2.48C6,4.72,8.74,2.5,12,2.5c1.78,0,3.38,0.62,4.64,1.82L18.66,2.3 C17.3,1.04,14.83,0,12,0C7.33,0,3.31,2.69,1.38,6.61L5.02,9.44C6,6.44,8.74,4.2,12,4.2c1.78,0,3.38,0.62,4.64,1.82l2.02-2.02 c-2.36-2.18-5.38-2.9-7.96-2.9z" fill="#EA4335" />
                    <path d="M12,24c4.67,0,8.69-2.69,10.62-6.61l-3.64-2.83C18,17.56,15.26,19.8,12,19.8c-3.26,0-6-2.22-6.98-5.22 L1.38,17.39C3.31,21.31,7.33,24,12,24z" fill="#34A853" />
                    <path d="M24,12c0-0.85-0.08-1.67-0.24-2.46H12v4.69h6.73c-0.29,1.53-1.15,2.83-2.45,3.7l3.08,2.39 C21.16,18.42,24,15.54,24,12z" fill="#4285F4" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold mb-1 text-center text-white" style={{fontFamily:"'Amatic SC', cursive", fontSize:'26px'}}>
                  Select Google Account
                </h3>
                <p className="text-[10px] text-gray-300 mb-4 text-center max-w-[260px]">
                  Choose a Google account to verify and sign in automatically.
                </p>
                <div className="w-full space-y-2 max-w-[260px]">
                  {[
                    { name: "Eco Warrior", email: "eco.warrior.google@gmail.com", avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=ecowarrior" },
                    { name: "Green Earth", email: "green.earth.google@gmail.com", avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=greenearth" },
                    { name: "Admin Google", email: "admin@ecotrack.ai", avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=admin" }
                  ].map((acc) => (
                    <button
                      key={acc.email}
                      type="button"
                      onClick={() => handleGoogleLoginSubmit(acc.email, acc.name, acc.avatar)}
                      className="w-full p-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 hover:border-white/20 transition-all flex items-center gap-2 cursor-pointer text-left"
                    >
                      <img src={acc.avatar} alt={acc.name} className="w-6 h-6 rounded-full bg-white/20" />
                      <div className="overflow-hidden">
                        <p className="font-semibold text-xs truncate text-white">{acc.name}</p>
                        <p className="text-[9px] text-gray-300 truncate">{acc.email}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-center mb-4">
              <div className="w-12 h-12 rounded-xl bg-[#38523A] dark:bg-[#84B056] flex items-center justify-center shadow-lg">
                <span className="text-2xl">🌱</span>
              </div>
            </div>
            <h2 className="text-center font-bold text-[#38523A] dark:text-[#84B056] mb-1" style={{fontFamily:"'Amatic SC', cursive", fontSize:'36px'}}>
              {isLogin ? 'Welcome Back' : 'Join EcoTrack AI'}
            </h2>
            <p className="text-center text-gray-400 dark:text-[#9ab89a] text-xs mb-5">
              {isLogin ? 'Sign in to your account' : 'Create a free account today'}
            </p>

            {/* Login Method Tabs */}
            {isLogin && (
              <div className="flex bg-gray-100 dark:bg-[#122012] p-1 rounded-xl mb-5 border border-gray-200 dark:border-[#2d4a2d]">
                <button
                  type="button"
                  onClick={() => { setLoginMethod('password'); setOtpSent(false); setError(''); }}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1 transition-all cursor-pointer ${
                    loginMethod === 'password'
                      ? 'bg-white dark:bg-[#203620] text-[#38523A] dark:text-[#dceadc] shadow-sm'
                      : 'text-gray-400 dark:text-[#9ab89a] hover:text-[#38523A] dark:hover:text-[#84B056]'
                  }`}
                >
                  <Lock size={12} /> Password
                </button>
                <button
                  type="button"
                  onClick={() => { setLoginMethod('email_otp'); setOtpSent(false); setError(''); }}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1 transition-all cursor-pointer ${
                    loginMethod === 'email_otp'
                      ? 'bg-white dark:bg-[#203620] text-[#38523A] dark:text-[#dceadc] shadow-sm'
                      : 'text-gray-400 dark:text-[#9ab89a] hover:text-[#38523A] dark:hover:text-[#84B056]'
                  }`}
                >
                  <Mail size={12} /> Email OTP
                </button>
              </div>
            )}

            {error && (
              <div className="bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900 rounded-xl p-4 text-rose-600 dark:text-rose-400 text-sm mb-5">
                {error}
              </div>
            )}

            {/* PASSWORD LOGIN & SIGNUP FORMS */}
            {(!isLogin || loginMethod === 'password') ? (
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
            ) : (
              /* OTP VERIFICATION FLOWS (EMAIL & PHONE) */
              <div className="space-y-4">
                {!otpSent ? (
                  <form onSubmit={handleSendOtp} className="space-y-4">
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
                        Your Full Name (For quick signup)
                      </label>
                      <div className="relative">
                        <User className="absolute left-3 top-3 text-gray-400" size={18} />
                        <input
                          type="text"
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          placeholder="Optional"
                          className="w-full pl-10 pr-4 py-2.5 rounded-xl eco-input text-[#333333] dark:text-[#dceadc] text-sm"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-3 bg-[#D9E335] hover:bg-[#FFDE59] dark:bg-[#84B056] dark:hover:bg-[#a5c87a] disabled:opacity-50 text-[#38523A] dark:text-[#0f1a0f] font-bold rounded-xl transition-all cursor-pointer shadow-md"
                    >
                      {loading ? 'Sending Code...' : 'Request Verification Code'}
                    </button>
                  </form>
                ) : (
                  <form onSubmit={handleVerifyOtp} className="space-y-4">
                    <div className="text-center p-3 bg-gray-50 dark:bg-[#122012] rounded-xl border border-gray-100 dark:border-[#2d4a2d]">
                      <p className="text-xs text-gray-500 dark:text-[#9ab89a]">
                        Verification code sent to:
                      </p>
                      <p className="text-sm font-bold text-[#38523A] dark:text-[#84B056]">
                        {email}
                      </p>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-500 dark:text-[#9ab89a] uppercase tracking-wider mb-2">
                        6-Digit OTP Code
                      </label>
                      <div className="relative">
                        <ShieldCheck className="absolute left-3 top-3 text-gray-400" size={18} />
                        <input
                          type="text"
                          required
                          maxLength={6}
                          value={otpCode}
                          onChange={(e) => setOtpCode(e.target.value)}
                          placeholder="123456"
                          className="w-full pl-10 pr-4 py-2.5 rounded-xl eco-input text-[#333333] dark:text-[#dceadc] text-sm font-mono tracking-widest text-center text-lg animate-pulse"
                        />
                      </div>
                    </div>

                    {devOtpCode && (
                      <div className="p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900 rounded-xl text-center">
                        <p className="text-xs text-amber-800 dark:text-amber-400">
                          Dev Mock OTP: <span className="font-extrabold select-all">{devOtpCode}</span>
                        </p>
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-3 bg-[#84B056] hover:bg-[#a5c87a] disabled:opacity-50 text-white dark:text-[#0f1a0f] font-bold rounded-xl transition-all cursor-pointer shadow-md"
                    >
                      {loading ? 'Verifying...' : 'Verify & Sign In'}
                    </button>

                    <button
                      type="button"
                      onClick={() => { setOtpSent(false); setOtpCode(''); setDevOtpCode(null); }}
                      className="w-full text-center text-xs text-[#84B056] hover:underline cursor-pointer"
                    >
                      Change destination or resend
                    </button>
                  </form>
                )}
              </div>
            )}

            {/* Divider and Google Sign-in */}
            {(!otpSent || loginMethod === 'password' || !isLogin) && (
              <>
                <div className="relative my-5">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-200 dark:border-[#2d4a2d]"></div>
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white dark:bg-[#1a2e1a] px-3 text-gray-400 dark:text-[#9ab89a]">
                      Or continue with
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setShowGoogleMock(true)}
                  className="w-full py-2.5 px-4 bg-white dark:bg-[#122012] border border-gray-200 dark:border-[#2d4a2d] hover:bg-gray-50 dark:hover:bg-[#1f371f] text-gray-700 dark:text-[#dceadc] font-semibold text-sm rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 shadow-sm"
                >
                  <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" width="24" height="24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M21.35,11.1H12v2.7h5.38C16.88,16.29,14.67,17.9,12,17.9c-3.26,0-6-2.22-6.98-5.22c-0.26-0.78-0.4-1.6-0.4-2.48 s0.15-1.7,0.4-2.48C6,4.72,8.74,2.5,12,2.5c1.78,0,3.38,0.62,4.64,1.82l2.02-2.02C17.3,1.04,14.83,0,12,0 C7.33,0,3.31,2.69,1.38,6.61C1.04,7.31,0.76,8.06,0.55,8.85C0.19,10.05,0,11.32,0,12.63c0,1.31,0.19,2.58,0.55,3.78 c0.21,0.78,0.49,1.54,0.83,2.23c1.94,3.92,5.96,6.61,10.62,6.61c5.96,0,10.96-3.95,12.06-9.61c0.16-0.81,0.24-1.65,0.24-2.52 C24,12.41,23.83,11.73,21.35,11.1z" fill="#4285F4" />
                    <path d="M12,24c3.24,0,5.97-1.07,7.96-2.91l-3.08-2.39C15.82,19.37,14.07,19.9,12,19.9c-3.26,0-6-2.22-6.98-5.22 c-0.26-0.78-0.4-1.6-0.4-2.48s0.15-1.7,0.4-2.48C6,4.72,8.74,2.5,12,2.5c1.78,0,3.38,0.62,4.64,1.82L18.66,2.3 C17.3,1.04,14.83,0,12,0C7.33,0,3.31,2.69,1.38,6.61L5.02,9.44C6,6.44,8.74,4.2,12,4.2c1.78,0,3.38,0.62,4.64,1.82l2.02-2.02 c-2.36-2.18-5.38-2.9-7.96-2.9z" fill="#EA4335" />
                    <path d="M12,24c4.67,0,8.69-2.69,10.62-6.61l-3.64-2.83C18,17.56,15.26,19.8,12,19.8c-3.26,0-6-2.22-6.98-5.22 L1.38,17.39C3.31,21.31,7.33,24,12,24z" fill="#34A853" />
                    <path d="M24,12c0-0.85-0.08-1.67-0.24-2.46H12v4.69h6.73c-0.29,1.53-1.15,2.83-2.45,3.7l3.08,2.39 C21.16,18.42,24,15.54,24,12z" fill="#4285F4" />
                  </svg>
                  Sign in with Google
                </button>
              </>
            )}

            <div className="mt-6 text-center text-sm text-gray-400 dark:text-[#9ab89a]">
              {isLogin ? "Don't have an account?" : "Already have an account?"}{' '}
              <button
                type="button"
                onClick={() => {
                  setIsLogin(!isLogin);
                  setError('');
                  setPassword('');
                  setOtpSent(false);
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
