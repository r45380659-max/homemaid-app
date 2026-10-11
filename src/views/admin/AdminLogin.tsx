import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  Lock,
  Mail,
  ArrowRight,
  ArrowLeft,
  AlertCircle,
  CheckCircle2,
  ShieldCheck,
  Settings2,
  KeyRound,
  UserPlus,
  HelpCircle,
  ExternalLink,
  ShieldAlert,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { HomemaidLogo } from '../../components/HomemaidLogo';

interface AdminLoginProps {
  onSuccess: () => void;
  onBackToCustomer: () => void;
}

type AdminAuthMode = 'SIGN_IN' | 'FORGOT_PASSWORD' | 'REGISTER';

export const AdminLogin: React.FC<AdminLoginProps> = ({ onSuccess, onBackToCustomer }) => {
  const {
    signInWithEmail,
    signUpWithEmail,
    resetPassword,
    verifyBackendAdminRole,
    isSupabaseActive,
    setShowSetupModal,
  } = useAuth();

  const [mode, setMode] = useState<AdminAuthMode>('SIGN_IN');
  const [configuredAdminEmail, setConfiguredAdminEmail] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [adminName, setAdminName] = useState<string>('HomeMate Administrator');
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [showDashboardGuide, setShowDashboardGuide] = useState<boolean>(false);

  // Fetch authorized admin email from server on load
  useEffect(() => {
    fetch('/api/auth/admin-info')
      .then((res) => res.json())
      .then((data) => {
        if (data.configured && data.adminEmail) {
          setConfiguredAdminEmail(data.adminEmail);
          setEmail(data.adminEmail);
        }
      })
      .catch((err) => console.warn('Could not load server admin info:', err));
  }, []);

  const switchMode = (newMode: AdminAuthMode) => {
    setMode(newMode);
    setErrorMessage('');
    setSuccessMessage('');
    setPassword('');
    setConfirmPassword('');
    if (configuredAdminEmail) {
      setEmail(configuredAdminEmail);
    }
  };

  // 1. Sign In as Administrator
  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!email.trim() || !password) {
      setErrorMessage('Please provide both email and password.');
      return;
    }

    setLoading(true);

    // Step A: Authenticate against Supabase Auth (User must exist with correct password)
    const authRes = await signInWithEmail(email, password);
    if (!authRes.success) {
      setLoading(false);
      const msg = authRes.message || 'Authentication failed. Please verify credentials.';
      if (
        msg.toLowerCase().includes('invalid login credentials') ||
        msg.toLowerCase().includes('user not found')
      ) {
        setErrorMessage(
          `Invalid credentials in Supabase Auth. If the admin user for "${email}" has not been created yet, use the "Create Admin User" tab below or add the user in your Supabase Auth Dashboard.`
        );
        setShowDashboardGuide(true);
      } else {
        setErrorMessage(msg);
      }
      return;
    }

    // Step B: Strict server-side verification against process.env.ADMIN_EMAIL
    const backendCheck = await verifyBackendAdminRole(email);
    setLoading(false);

    if (backendCheck.authorized) {
      onSuccess();
    } else {
      setErrorMessage(
        backendCheck.message ||
          'Access Denied: This account is authenticated in Supabase but not authorized as the system administrator in ADMIN_EMAIL.'
      );
    }
  };

  // 2. Register/Create Admin Account in Supabase Auth
  const handleAdminRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    const cleanEmail = email.trim();
    if (!cleanEmail) {
      setErrorMessage('Admin email is required.');
      return;
    }

    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match. Please verify.');
      return;
    }

    // Server-side safety verification: only authorized ADMIN_EMAIL can register via Admin Gate
    if (configuredAdminEmail && cleanEmail.toLowerCase() !== configuredAdminEmail.toLowerCase()) {
      setErrorMessage(
        `Registration restricted: Only the authorized ADMIN_EMAIL (${configuredAdminEmail}) can be created through the Admin gate.`
      );
      return;
    }

    setLoading(true);

    const res = await signUpWithEmail(cleanEmail, password, adminName.trim());
    setLoading(false);

    if (!res.success) {
      setErrorMessage(res.message || 'Failed to create admin user in Supabase Auth.');
      return;
    }

    if (res.needsConfirmation) {
      setSuccessMessage(
        `Admin account created in Supabase Auth! A confirmation link has been sent to ${cleanEmail}. Once confirmed (or if Auto Confirm is enabled in your Supabase dashboard), return here to sign in.`
      );
      setMode('SIGN_IN');
      setPassword('');
      setConfirmPassword('');
    } else {
      // Auto-authenticated upon registration
      const backendCheck = await verifyBackendAdminRole(cleanEmail);
      if (backendCheck.authorized) {
        onSuccess();
      } else {
        setSuccessMessage('Account registered in Supabase. Please sign in to verify admin access.');
        setMode('SIGN_IN');
      }
    }
  };

  // 3. Password Reset
  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!email.trim()) {
      setErrorMessage('Please provide your admin email to receive the password reset link.');
      return;
    }

    setLoading(true);
    const res = await resetPassword(email.trim());
    setLoading(false);

    if (res.success) {
      setSuccessMessage(
        `A secure password reset link has been dispatched to ${email.trim()} from Supabase Auth. Follow the instructions in the email to set a new password, then return here to log in.`
      );
    } else {
      setErrorMessage(res.message || 'Could not send password reset email.');
    }
  };

  return (
    <div className="max-w-md mx-auto space-y-6 pb-20 pt-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBackToCustomer}
          className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white border border-slate-200 px-3 py-1.5 rounded-xl shadow-2xs transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Customer Portal</span>
        </button>

        <span className="text-xs font-bold text-amber-800 bg-amber-100 px-3 py-1 rounded-full uppercase tracking-wider">
          Admin Portal Gate
        </span>
      </div>

      {/* Main Authentication Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xl space-y-6">
        <div className="flex justify-center pb-1">
          <HomemaidLogo size="lg" showTagline={true} />
        </div>

        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-slate-900 text-amber-400 flex items-center justify-center shadow-md shrink-0">
            {mode === 'FORGOT_PASSWORD' ? (
              <KeyRound className="w-5 h-5" />
            ) : mode === 'REGISTER' ? (
              <UserPlus className="w-5 h-5" />
            ) : (
              <Lock className="w-5 h-5" />
            )}
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              {mode === 'FORGOT_PASSWORD'
                ? 'Reset Admin Password'
                : mode === 'REGISTER'
                ? 'Create Admin Account'
                : 'Admin Authentication'}
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              Supabase Auth + Server-Side ADMIN_EMAIL Role Check
            </p>
          </div>
        </div>

        {/* Tab switch between Sign In and Create User */}
        <div className="flex p-1 bg-slate-100 rounded-2xl text-xs font-bold">
          <button
            type="button"
            onClick={() => switchMode('SIGN_IN')}
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
            onClick={() => switchMode('REGISTER')}
            className={`flex-1 py-2 rounded-xl transition-all ${
              mode === 'REGISTER'
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Create Admin User
          </button>
          <button
            type="button"
            onClick={() => switchMode('FORGOT_PASSWORD')}
            className={`flex-1 py-2 rounded-xl transition-all ${
              mode === 'FORGOT_PASSWORD'
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Reset Password
          </button>
        </div>

        {/* Server Security Context Banner */}
        <div className="p-3.5 bg-slate-50 rounded-2xl text-xs text-slate-700 leading-normal space-y-1.5 border border-slate-200">
          <div className="font-bold text-slate-900 flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Authorized Admin Email</span>
            </div>
            {configuredAdminEmail && (
              <span className="text-[11px] font-mono bg-amber-100 text-amber-900 px-2 py-0.5 rounded-full font-bold">
                {configuredAdminEmail}
              </span>
            )}
          </div>
          <p className="text-[11px] text-slate-500">
            Enforced server-side against <code className="font-mono text-slate-800 bg-slate-200/80 px-1 py-0.2 rounded font-bold">ADMIN_EMAIL</code>. Credentials are authenticated directly via Supabase Auth without hardcoded bypasses.
          </p>
        </div>

        {/* Password Safety Notice */}
        <div className="p-3 rounded-2xl bg-amber-50/70 border border-amber-200 text-amber-900 text-xs flex items-start gap-2.5">
          <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <p className="text-[11px] leading-relaxed">
            <strong>Password Safety:</strong> Choose a dedicated password for this HomeMate account. <strong>Never</strong> enter your actual Google account password.
          </p>
        </div>

        {/* Missing Supabase Configuration Callout */}
        {!isSupabaseActive && (
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-950 text-xs space-y-2">
            <div className="flex items-center gap-2 font-bold text-amber-900">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>Supabase Credentials Required</span>
            </div>
            <p className="leading-normal text-amber-800 text-[11px]">
              Supabase Project URL is set to <code className="bg-white px-1.5 py-0.5 rounded font-mono text-[11px] text-amber-900">cfhqwgftgbxfdavwxsup.supabase.co</code>. Please provide your <strong>Publishable / Anon Key</strong> (<code className="bg-white px-1.5 py-0.5 rounded font-mono text-[11px]">VITE_SUPABASE_PUBLISHABLE_KEY</code>) to authenticate.
            </p>
            <button
              type="button"
              onClick={() => setShowSetupModal(true)}
              className="text-xs font-bold text-[#0072B2] hover:underline flex items-center gap-1 pt-1"
            >
              <Settings2 className="w-3.5 h-3.5" />
              <span>Configure Credentials</span>
            </button>
          </div>
        )}

        {/* Error Callout */}
        {errorMessage && (
          <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span>{errorMessage}</span>
            </div>
          </div>
        )}

        {/* Success Callout */}
        {successMessage && (
          <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* MODE 1: SIGN IN */}
        {mode === 'SIGN_IN' && (
          <form onSubmit={handleAdminLogin} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Admin Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@example.com"
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 focus:bg-white text-sm font-semibold rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block font-bold text-slate-700">Password</label>
                <button
                  type="button"
                  onClick={() => switchMode('FORGOT_PASSWORD')}
                  className="text-[11px] font-bold text-amber-700 hover:text-amber-900 underline"
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
                  placeholder="Enter your HomeMate password"
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 focus:bg-white text-sm font-semibold rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-6 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 active:scale-98 disabled:opacity-50"
            >
              <span>{loading ? 'Verifying Credentials...' : 'Sign In as Administrator'}</span>
              <ArrowRight className="w-4 h-4 text-amber-400" />
            </button>
          </form>
        )}

        {/* MODE 2: REGISTER / CREATE ADMIN USER */}
        {mode === 'REGISTER' && (
          <form onSubmit={handleAdminRegister} className="space-y-4 text-xs">
            <div className="p-3 bg-amber-50/60 border border-amber-200/80 rounded-2xl text-[11px] text-amber-900 leading-normal">
              Creates the admin user securely in your Supabase Auth project. This user will immediately pass the server-side <code className="font-bold font-mono">ADMIN_EMAIL</code> role verification.
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Authorized Admin Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@example.com"
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 focus:bg-white text-sm font-semibold rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
                />
              </div>
              {configuredAdminEmail && email.toLowerCase() !== configuredAdminEmail.toLowerCase() && (
                <p className="text-[11px] text-rose-600 mt-1">
                  Note: Email must match configured admin ({configuredAdminEmail}).
                </p>
              )}
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Display Name</label>
              <input
                type="text"
                required
                value={adminName}
                onChange={(e) => setAdminName(e.target.value)}
                placeholder="Administrator"
                className="w-full px-4 py-3 bg-slate-50 focus:bg-white text-sm font-semibold rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                New Dedicated Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                <input
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimum 6 characters"
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 focus:bg-white text-sm font-semibold rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Confirm Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                <input
                  type="password"
                  required
                  minLength={6}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-type your password"
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 focus:bg-white text-sm font-semibold rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-6 rounded-2xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 active:scale-98 disabled:opacity-50"
            >
              <span>{loading ? 'Creating User in Supabase...' : 'Register Admin User in Supabase'}</span>
              <UserPlus className="w-4 h-4 text-white" />
            </button>
          </form>
        )}

        {/* MODE 3: RESET PASSWORD */}
        {mode === 'FORGOT_PASSWORD' && (
          <form onSubmit={handlePasswordReset} className="space-y-4 text-xs">
            <p className="text-slate-600 text-xs leading-normal">
              Enter your authorized admin email address below. Supabase Auth will send a secure password reset link to your inbox.
            </p>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Admin Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@example.com"
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 focus:bg-white text-sm font-semibold rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-6 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 active:scale-98 disabled:opacity-50"
            >
              <span>{loading ? 'Dispatching Reset Link...' : 'Send Password Reset Link'}</span>
              <KeyRound className="w-4 h-4 text-amber-400" />
            </button>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => switchMode('SIGN_IN')}
                className="text-xs font-bold text-slate-600 hover:text-slate-900 underline"
              >
                Back to Admin Sign In
              </button>
            </div>
          </form>
        )}

        {/* Collapsible Supabase Dashboard Creation Guide */}
        <div className="border border-slate-200 rounded-2xl overflow-hidden bg-slate-50/50">
          <button
            type="button"
            onClick={() => setShowDashboardGuide(!showDashboardGuide)}
            className="w-full p-3.5 flex items-center justify-between text-left text-xs font-bold text-slate-800 hover:bg-slate-100 transition-colors"
          >
            <div className="flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>How to create the admin user via Supabase Dashboard</span>
            </div>
            {showDashboardGuide ? (
              <ChevronUp className="w-4 h-4 text-slate-400" />
            ) : (
              <ChevronDown className="w-4 h-4 text-slate-400" />
            )}
          </button>

          {showDashboardGuide && (
            <div className="p-4 pt-1 border-t border-slate-200 space-y-3 text-xs text-slate-600 bg-white">
              <p className="text-[11px] leading-relaxed">
                If you prefer creating or managing the admin user directly in your Supabase project without sending an email confirmation:
              </p>
              <ol className="list-decimal list-inside space-y-2 text-[11px] text-slate-700 pl-1 font-medium">
                <li>
                  Open your{' '}
                  <a
                    href="https://supabase.com/dashboard/project/cfhqwgftgbxfdavwxsup/auth/users"
                    target="_blank"
                    rel="noreferrer"
                    className="text-[#0072B2] font-bold underline inline-flex items-center gap-0.5"
                  >
                    Supabase Dashboard Users
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </li>
                <li>
                  Click the <strong>Add user</strong> button and select <strong>Create user</strong>.
                </li>
                <li>
                  Enter your admin email:{' '}
                  <code className="bg-amber-100 text-amber-900 px-1 py-0.5 rounded font-mono font-bold">
                    {configuredAdminEmail || 'Rishikumaa777@gmail.com'}
                  </code>
                </li>
                <li>
                  Enter a secure, unique password (do not use your Gmail password).
                </li>
                <li>
                  Check the <strong>Auto Confirm User?</strong> toggle so it activates immediately.
                </li>
                <li>
                  Click <strong>Create user</strong>, then return here and sign in!
                </li>
              </ol>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
