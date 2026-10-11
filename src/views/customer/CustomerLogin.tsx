import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../i18n/LanguageContext';
import {
  Mail,
  Lock,
  User,
  Phone,
  ArrowRight,
  ArrowLeft,
  AlertCircle,
  Settings2,
  CheckCircle2,
  KeyRound,
} from 'lucide-react';
import { HomemaidLogo } from '../../components/HomemaidLogo';

interface CustomerLoginProps {
  onBack: () => void;
  onSuccess: () => void;
}

export const CustomerLogin: React.FC<CustomerLoginProps> = ({ onBack, onSuccess }) => {
  const { t } = useLanguage();
  const { signInWithEmail, signUpWithEmail, resetPassword, isSupabaseActive, setShowSetupModal } =
    useAuth();

  const [mode, setMode] = useState<'SIGN_IN' | 'SIGN_UP' | 'FORGOT'>('SIGN_IN');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!email.trim() || !password) {
      setErrorMessage('Please provide both email and password.');
      return;
    }

    setLoading(true);
    const res = await signInWithEmail(email, password);
    setLoading(false);

    if (res.success) {
      onSuccess();
    } else {
      setErrorMessage(res.message || 'Login failed. Please verify your credentials.');
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!email.trim() || !password) {
      setErrorMessage('Please provide both email and password.');
      return;
    }

    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);
    const res = await signUpWithEmail(email, password, fullName, phone);
    setLoading(false);

    if (res.success) {
      if (res.needsConfirmation) {
        setSuccessMessage(res.message || 'Account created! Please check your email to confirm your account.');
      } else {
        onSuccess();
      }
    } else {
      setErrorMessage(res.message || 'Sign up failed. Please check your details.');
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!email.trim()) {
      setErrorMessage('Please enter your email address to receive password reset instructions.');
      return;
    }

    setLoading(true);
    const res = await resetPassword(email);
    setLoading(false);

    if (res.success) {
      setSuccessMessage(res.message || 'Password reset link sent to your email.');
    } else {
      setErrorMessage(res.message || 'Could not send password reset email.');
    }
  };

  return (
    <div className="max-w-md mx-auto space-y-6 pb-20 pt-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white border border-slate-200 px-3 py-1.5 rounded-xl shadow-2xs transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>

        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
          Free Supabase Auth
        </span>
      </div>

      {/* Login Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-md space-y-6">
        {/* Official Logo on Login Screen */}
        <div className="flex justify-center pb-2">
          <HomemaidLogo size="lg" showTagline={true} />
        </div>

        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            {mode === 'SIGN_IN'
              ? 'Customer Sign In'
              : mode === 'SIGN_UP'
              ? 'Create Customer Account'
              : 'Reset Your Password'}
          </h2>
          <p className="text-xs text-slate-500 font-medium mt-1">
            {mode === 'SIGN_IN'
              ? 'Sign in using your email and password to access your bookings.'
              : mode === 'SIGN_UP'
              ? 'Free account creation powered by Supabase Auth — no SMS required.'
              : 'Enter your registered email address and we will dispatch a reset link.'}
          </p>
        </div>

        {/* Missing Supabase Configuration Callout */}
        {!isSupabaseActive && (
          <div className="p-4 rounded-2xl bg-cyan-50 border border-cyan-200 text-cyan-950 text-xs space-y-2">
            <div className="flex items-center gap-2 font-bold text-cyan-900">
              <AlertCircle className="w-4 h-4 text-cyan-600 shrink-0" />
              <span>Supabase Auth Credentials Required</span>
            </div>
            <p className="leading-normal text-cyan-800">
              Supabase Project URL is configured (<code className="bg-white px-1.5 py-0.5 rounded font-mono text-[11px] text-cyan-900">cfhqwgftgbxfdavwxsup.supabase.co</code>). Please provide your <strong>Publishable / Anon Key</strong> (<code className="bg-white px-1.5 py-0.5 rounded font-mono text-[11px]">VITE_SUPABASE_PUBLISHABLE_KEY</code>) to activate live authentication.
            </p>
            <button
              type="button"
              onClick={() => setShowSetupModal(true)}
              className="text-xs font-bold text-[#0072B2] hover:text-[#0052CC] flex items-center gap-1 underline pt-1"
            >
              <Settings2 className="w-3.5 h-3.5" />
              <span>Configure Supabase Credentials</span>
            </button>
          </div>
        )}

        {errorMessage && (
          <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Tab switch between Sign In and Sign Up */}
        {mode !== 'FORGOT' && (
          <div className="flex p-1 bg-slate-100 rounded-2xl text-xs font-bold">
            <button
              type="button"
              onClick={() => {
                setMode('SIGN_IN');
                setErrorMessage('');
                setSuccessMessage('');
              }}
              className={`flex-1 py-2 rounded-xl transition-all ${
                mode === 'SIGN_IN'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('SIGN_UP');
                setErrorMessage('');
                setSuccessMessage('');
              }}
              className={`flex-1 py-2 rounded-xl transition-all ${
                mode === 'SIGN_UP'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Create Account
            </button>
          </div>
        )}

        {/* Form */}
        {mode === 'SIGN_IN' && (
          <form onSubmit={handleSignIn} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                <input
                  type="email"
                  required
                  autoFocus
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 focus:bg-white text-sm font-semibold rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block font-bold text-slate-700">Password</label>
                <button
                  type="button"
                  onClick={() => {
                    setMode('FORGOT');
                    setErrorMessage('');
                    setSuccessMessage('');
                  }}
                  className="text-cyan-700 hover:underline text-[11px]"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 focus:bg-white text-sm font-semibold rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-6 rounded-2xl bg-[#0072B2] hover:bg-[#005B8E] text-white font-bold text-sm shadow-md shadow-cyan-800/20 transition-all flex items-center justify-center gap-2 active:scale-98 disabled:opacity-50"
            >
              <span>{loading ? 'Signing In...' : 'Sign In'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        {mode === 'SIGN_UP' && (
          <form onSubmit={handleSignUp} className="space-y-3.5 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Full Name</label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Rahul Sharma"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 text-sm rounded-xl border border-slate-200"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 text-sm rounded-xl border border-slate-200"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Contact Phone (Optional)</label>
              <div className="relative">
                <Phone className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 text-sm rounded-xl border border-slate-200 font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Password (min 6 characters)</label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                <input
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 text-sm rounded-xl border border-slate-200"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 active:scale-98 disabled:opacity-50"
            >
              <span>{loading ? 'Creating Account...' : 'Create Free Account'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        {mode === 'FORGOT' && (
          <form onSubmit={handleResetPassword} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Registered Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                <input
                  type="email"
                  required
                  autoFocus
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 text-sm rounded-xl border border-slate-200"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-6 rounded-2xl bg-[#0072B2] hover:bg-[#005B8E] text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2"
            >
              <span>{loading ? 'Dispatching Reset Link...' : 'Send Password Reset Link'}</span>
              <KeyRound className="w-4 h-4" />
            </button>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => {
                  setMode('SIGN_IN');
                  setErrorMessage('');
                  setSuccessMessage('');
                }}
                className="text-slate-600 hover:text-slate-900 underline text-xs font-semibold"
              >
                Return to Sign In
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
