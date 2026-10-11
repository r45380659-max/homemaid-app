import React, { useState } from 'react';
import {
  X,
  ShieldCheck,
  Database,
  Lock,
  Copy,
  Check,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Save,
  Trash2,
  KeyRound,
  FileCode2,
} from 'lucide-react';
import {
  isSupabaseConfigured,
  saveCustomSupabaseConfig,
  clearCustomSupabaseConfig,
  testSupabaseConnection,
  getSupabaseConfig,
  DEFAULT_SUPABASE_URL,
  DEFAULT_SUPABASE_ANON_KEY,
  sanitizeSupabaseUrl,
} from '../supabase/client';

interface ExternalSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ExternalSetupModal: React.FC<ExternalSetupModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'supabase_setup' | 'rls_sql' | 'admin_email' | 'testing' | 'connect'>('overview');
  
  const savedCfg = getSupabaseConfig();
  const [urlInput, setUrlInput] = useState<string>(sanitizeSupabaseUrl(savedCfg?.url || DEFAULT_SUPABASE_URL));
  const [keyInput, setKeyInput] = useState<string>(savedCfg?.anonKey || DEFAULT_SUPABASE_ANON_KEY);
  const [saveStatus, setSaveStatus] = useState<string>('');
  const [isTesting, setIsTesting] = useState<boolean>(false);
  const [testResult, setTestResult] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  if (!isOpen) return null;

  const isConfigured = isSupabaseConfigured();

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleSaveConfig = () => {
    const cleanUrl = sanitizeSupabaseUrl(urlInput);
    const cleanKey = keyInput.trim();

    if (!cleanUrl || !cleanKey) {
      setSaveStatus('Error: Please provide both Project URL and Anon/Publishable Key.');
      return;
    }

    saveCustomSupabaseConfig({
      url: cleanUrl,
      anonKey: cleanKey,
    });
  };

  const handleRunConnectionTest = async () => {
    setIsTesting(true);
    setTestResult(null);
    const cleanUrl = sanitizeSupabaseUrl(urlInput);
    const cleanKey = keyInput.trim();
    const res = await testSupabaseConnection(cleanUrl, cleanKey);
    setIsTesting(false);
    setTestResult(res.message);
  };

  const rlsSqlScript = `-- Homemaid Supabase Schema & Row-Level Security (RLS)
-- Run this in your Supabase SQL Editor (SQL Editor -> New Query)

-- 1. Enable UUID Extension
create extension if not exists "uuid-ossp";

-- 2. Bookings Table
create table if not exists public.bookings (
  id text primary key,
  booking_id text not null,
  customer_id text not null,
  customer_email text,
  customer_phone text,
  customer_name text,
  service_id text not null,
  service_name text not null,
  location jsonb,
  booking_date text,
  booking_time text,
  captured_price numeric not null,
  amount numeric not null,
  payment_method text not null,
  payment_status text not null,
  booking_status text not null,
  assigned_maid_id text,
  assigned_maid_name text,
  assigned_maid_phone text,
  cancellation_reason text,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- 3. Enable Row-Level Security (RLS)
alter table public.bookings enable row level security;

-- 4. Policy: Customers can only select their own bookings
create policy "Customers access own bookings"
  on public.bookings for select
  using (
    auth.uid()::text = customer_id 
    or auth.email() = customer_email
    or auth.jwt() ->> 'email' = (select current_setting('request.jwt.claim.email', true))
  );

-- 5. Policy: Customers can insert their own bookings
create policy "Customers create own bookings"
  on public.bookings for insert
  with check (auth.uid()::text = customer_id);

-- 6. Policy: Customers can only cancel their own pending booking
create policy "Customers update own pending bookings"
  on public.bookings for update
  using (auth.uid()::text = customer_id);
`;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-3xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-slate-100 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-cyan-500/20 border border-cyan-400/30 flex items-center justify-center text-cyan-300">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold tracking-tight text-white flex items-center gap-2">
                <span>Homemaid Setup & Credentials Guide</span>
                <span
                  className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${
                    isConfigured
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/40'
                      : 'bg-amber-500/20 text-amber-300 border-amber-400/40'
                  }`}
                >
                  {isConfigured ? 'Supabase Connected' : 'Config Pending'}
                </span>
              </h2>
              <p className="text-xs text-slate-300">
                Free Supabase Auth, Row-Level Security, & Server-Side ADMIN_EMAIL
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab navigation */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-4 sm:px-6 overflow-x-auto gap-2 py-2">
          {[
            { id: 'overview', label: '1. Overview' },
            { id: 'supabase_setup', label: '2. Supabase Setup' },
            { id: 'rls_sql', label: '3. Database RLS SQL' },
            { id: 'admin_email', label: '4. ADMIN_EMAIL (Gmail 2)' },
            { id: 'testing', label: '5. Testing Checklist' },
            { id: 'connect', label: '⚙️ Connect Supabase' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3 py-1.5 text-xs sm:text-sm font-semibold rounded-xl whitespace-nowrap transition-all ${
                activeTab === tab.id
                  ? 'bg-[#0072B2] text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content body */}
        <div className="p-5 sm:p-7 overflow-y-auto flex-1 space-y-6 text-sm text-slate-700 leading-relaxed">
          {activeTab === 'overview' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-cyan-50 border border-cyan-200 flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-cyan-700 shrink-0 mt-0.5" />
                <div className="text-xs text-cyan-950 leading-normal">
                  <p className="font-bold mb-1">Update 1.0.1: Free Supabase Authentication</p>
                  Homemaid now uses Supabase Auth's Free plan with real email/password authentication (no SMS costs). The app includes customer sign up, login, sign out, password reset, and backend server-side role validation for your Gmail 2 account.
                </div>
              </div>

              <h3 className="font-bold text-base text-slate-900">Architecture Summary</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-4 rounded-2xl border border-slate-200 bg-white shadow-2xs space-y-2">
                  <div className="flex items-center gap-2 text-[#0072B2] font-bold">
                    <Database className="w-4 h-4" />
                    <span>Free Supabase Auth</span>
                  </div>
                  <p className="text-xs text-slate-600">
                    Carrier SMS has been removed. Users register and log in with email and password, with password recovery links.
                  </p>
                </div>

                <div className="p-4 rounded-2xl border border-slate-200 bg-white shadow-2xs space-y-2">
                  <div className="flex items-center gap-2 text-[#0072B2] font-bold">
                    <Lock className="w-4 h-4" />
                    <span>Server-Side ADMIN_EMAIL</span>
                  </div>
                  <p className="text-xs text-slate-600">
                    Administrator authorization is checked on the backend Express server against your Gmail 2 address. AI Studio owner is not automatically admin.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'supabase_setup' && (
            <div className="space-y-4">
              <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                <Database className="w-5 h-5 text-cyan-600" />
                <span>What to Create in Supabase</span>
              </h3>

              <ol className="list-decimal pl-5 space-y-3 text-xs text-slate-700">
                <li>
                  <strong>Create a Free Project:</strong> Go to <a href="https://supabase.com" target="_blank" rel="noreferrer" className="text-[#0072B2] underline font-bold">supabase.com</a>, sign in, and click <strong>New Project</strong>. Choose the Free tier and any cloud region close to your users (e.g. Mumbai, India).
                </li>
                <li>
                  <strong>Enable Email Authentication:</strong>
                  <ul className="list-disc pl-5 mt-1 space-y-1 text-slate-600">
                    <li>In the left sidebar, click <strong>Authentication</strong> → <strong>Providers</strong>.</li>
                    <li>Ensure <strong>Email</strong> is toggled <strong>Enabled</strong>.</li>
                    <li>(Optional) For immediate local testing without email confirmation delays, you can disable <em>"Confirm email"</em> under Authentication → Email Templates / Settings.</li>
                  </ul>
                </li>
                <li>
                  <strong>Where to Find Project URL and Anon/Publishable Key:</strong>
                  <ul className="list-disc pl-5 mt-1 space-y-1 text-slate-600">
                    <li>Click <strong>Project Settings</strong> (gear icon at the bottom of the left sidebar).</li>
                    <li>Click <strong>API</strong> in the sub-menu.</li>
                    <li>Copy <strong>Project URL</strong> (looks like: <code className="bg-slate-100 px-1 py-0.5 rounded text-indigo-700">https://xyzcompany.supabase.co</code>).</li>
                    <li>Copy <strong>Project API Keys → anon public</strong> key.</li>
                  </ul>
                </li>
              </ol>
            </div>
          )}

          {activeTab === 'rls_sql' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                  <FileCode2 className="w-5 h-5 text-cyan-600" />
                  <span>Row-Level Security (RLS) SQL Script</span>
                </h3>
                <button
                  onClick={() => handleCopy(rlsSqlScript, 'rls')}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors"
                >
                  {copiedKey === 'rls' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedKey === 'rls' ? 'Copied SQL!' : 'Copy SQL'}</span>
                </button>
              </div>

              <p className="text-xs text-slate-600">
                Paste and execute this in your <strong>Supabase SQL Editor</strong> to create the bookings table and enforce that customers only read their own bookings:
              </p>

              <div className="p-4 bg-slate-950 text-cyan-400 rounded-2xl text-xs font-mono max-h-56 overflow-y-auto">
                <pre>{rlsSqlScript}</pre>
              </div>
            </div>
          )}

          {activeTab === 'admin_email' && (
            <div className="space-y-4">
              <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                <KeyRound className="w-5 h-5 text-amber-600" />
                <span>How to Configure ADMIN_EMAIL (Gmail 2)</span>
              </h3>

              <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl text-xs text-amber-950 space-y-2">
                <p className="font-bold">Strict Backend Role Gate:</p>
                <p>
                  To prevent unauthorized privilege escalation, the app checks the backend Express endpoint <code className="bg-amber-100 px-1 py-0.5 rounded font-mono font-bold">/api/auth/verify-admin</code>.
                </p>
              </div>

              <ol className="list-decimal pl-5 space-y-2 text-xs text-slate-700">
                <li>
                  In Google AI Studio or your hosting environment, go to the <strong>Environment Variables / Secrets</strong> settings.
                </li>
                <li>
                  Add an environment variable named:
                  <div className="mt-1 p-2 bg-slate-100 rounded-xl font-mono font-bold text-slate-900">
                    ADMIN_EMAIL = "your-second-account@gmail.com"
                  </div>
                </li>
                <li>
                  Add your Supabase client variables:
                  <div className="mt-1 p-2 bg-slate-100 rounded-xl font-mono text-[11px] text-slate-900 space-y-1">
                    <div>VITE_SUPABASE_URL = "https://your-project.supabase.co"</div>
                    <div>VITE_SUPABASE_ANON_KEY = "your-anon-publishable-key"</div>
                  </div>
                </li>
                <li>
                  In Supabase Authentication, create a user with that exact Gmail 2 address and a strong password.
                </li>
                <li>
                  When you sign in through the <strong>Admin Portal</strong>, the server verifies the email matches <code className="font-mono">ADMIN_EMAIL</code> before granting access.
                </li>
              </ol>
            </div>
          )}

          {activeTab === 'testing' && (
            <div className="space-y-4">
              <h3 className="font-bold text-base text-slate-900">
                Pre-Publish Testing Checklist
              </h3>

              <div className="space-y-2 text-xs">
                {[
                  '1. Customer Sign Up: Create a new customer account with email and password.',
                  '2. Customer Booking Privacy: Log in as Customer A, book a service, log in as Customer B, and verify Customer A’s booking is not visible.',
                  '3. Password Reset: Click "Forgot Password?" and verify a reset link is dispatched to your email.',
                  '4. Admin Gate with Gmail 2: Sign in to Admin Portal with your configured Gmail 2 account and verify Dashboard access.',
                  '5. Unauthorized Email Block: Attempt Admin Portal login with any non-admin email; verify "Access Denied" message is returned by the backend.',
                  '6. Existing Data: Verify past bookings and services are preserved cleanly.',
                ].map((item, i) => (
                  <div key={i} className="p-3 bg-slate-50 border border-slate-100 rounded-xl flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'connect' && (
            <div className="space-y-4">
              <h3 className="font-bold text-base text-slate-900">
                Connect Supabase Credentials
              </h3>
              <p className="text-xs text-slate-600">
                You can save your Project URL and Anon Key directly here for browser testing:
              </p>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Supabase Project URL
                  </label>
                  <input
                    type="url"
                    value={urlInput}
                    onChange={(e) => {
                      setUrlInput(e.target.value);
                      setSaveStatus('');
                    }}
                    onBlur={() => {
                      if (urlInput.trim()) {
                        setUrlInput(sanitizeSupabaseUrl(urlInput));
                      }
                    }}
                    placeholder="https://cfhqwgftgbxfdavwxsup.supabase.co"
                    className="w-full p-2.5 bg-slate-50 font-mono text-xs rounded-xl border border-slate-200"
                  />
                  <p className="text-[11px] text-slate-500 mt-1">
                    Base project URL only (e.g. <code className="bg-slate-200/70 px-1 py-0.5 rounded font-mono text-[10px]">https://cfhqwgftgbxfdavwxsup.supabase.co</code>). Do not append <code className="font-mono text-[10px]">/rest/v1</code> or <code className="font-mono text-[10px]">/auth/v1</code>.
                  </p>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Supabase Anon / Publishable Key
                  </label>
                  <input
                    type="text"
                    value={keyInput}
                    onChange={(e) => {
                      setKeyInput(e.target.value);
                      setSaveStatus('');
                    }}
                    placeholder="sb_publishable_... or JWT anon key"
                    className="w-full p-2.5 bg-slate-50 font-mono text-xs rounded-xl border border-slate-200"
                  />
                </div>

                {saveStatus && (
                  <div
                    className={`p-3 rounded-xl text-xs font-semibold ${
                      saveStatus.startsWith('Error')
                        ? 'bg-rose-50 text-rose-800 border border-rose-200'
                        : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    }`}
                  >
                    {saveStatus}
                  </div>
                )}

                <div className="flex flex-wrap items-center justify-between gap-2 pt-2">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleSaveConfig}
                      className="px-4 py-2 bg-[#0072B2] hover:bg-[#005B8E] text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-xs"
                    >
                      <Save className="w-4 h-4" />
                      <span>Save & Reload</span>
                    </button>

                    <button
                      onClick={handleRunConnectionTest}
                      disabled={isTesting}
                      className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-xl flex items-center gap-1.5"
                    >
                      <span>{isTesting ? 'Testing...' : 'Test Connection'}</span>
                    </button>
                  </div>

                  {localStorage.getItem('homemaid_custom_supabase_config') && (
                    <button
                      onClick={clearCustomSupabaseConfig}
                      className="px-3 py-2 text-rose-600 hover:bg-rose-50 text-xs font-semibold rounded-xl flex items-center gap-1.5"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Clear Saved Config</span>
                    </button>
                  )}
                </div>

                {testResult && (
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800">
                    {testResult}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
          <span className="text-xs text-slate-500">
            Homemaid v1.0.1 — Free Supabase Auth & Secure Admin Role Check
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs rounded-xl transition-colors"
          >
            Close Guide
          </button>
        </div>
      </div>
    </div>
  );
};
