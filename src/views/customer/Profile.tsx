import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../i18n/LanguageContext';
import {
  User,
  Phone,
  Mail,
  Globe,
  LogOut,
  Sparkles,
  Shield,
  Settings2,
  ChevronRight,
  Save,
  CheckCircle2,
} from 'lucide-react';

interface ProfileProps {
  onOpenLogin: () => void;
  onOpenApplyMaid: () => void;
}

export const Profile: React.FC<ProfileProps> = ({ onOpenLogin, onOpenApplyMaid }) => {
  const { currentUser, logout, updateProfile, setShowSetupModal, isSupabaseActive } = useAuth();
  const { languageInfo, setShowLanguageModal, t } = useLanguage();

  const [name, setName] = useState(currentUser?.name || '');
  const [email, setEmail] = useState(currentUser?.email || '');
  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    await updateProfile(name, email);
    setIsSaving(false);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-20">
      {/* Profile Card Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-100 shadow-xs flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-black text-2xl shadow-md shadow-indigo-600/20">
            {currentUser?.name ? currentUser.name.charAt(0).toUpperCase() : <User className="w-8 h-8" />}
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              {currentUser?.name || 'Homemaid Customer'}
            </h2>
            <div className="flex items-center gap-1.5 text-xs text-slate-500 font-mono mt-0.5">
              <Phone className="w-3.5 h-3.5 text-slate-400" />
              <span>{currentUser?.phone || 'Mobile not registered'}</span>
            </div>
            {currentUser?.role === 'admin' && (
              <span className="inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 uppercase">
                Authorized Admin
              </span>
            )}
          </div>
        </div>

        {currentUser ? (
          <button
            onClick={logout}
            className="p-2.5 rounded-xl border border-slate-200 text-slate-600 hover:text-rose-600 hover:bg-rose-50 transition-colors"
            title="Log Out"
          >
            <LogOut className="w-5 h-5" />
          </button>
        ) : (
          <button
            onClick={onOpenLogin}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/20"
          >
            Login / Sign In
          </button>
        )}
      </div>

      {/* Profile Details Edit */}
      {currentUser && (
        <form onSubmit={handleSaveProfile} className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
            Personal Information
          </h3>

          <div className="space-y-3 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
                className="w-full p-3 bg-slate-50 focus:bg-white text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="w-full p-3 bg-slate-50 focus:bg-white text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>

            <div className="flex items-center justify-between pt-2">
              {savedSuccess ? (
                <div className="flex items-center gap-1.5 text-emerald-600 font-bold text-xs">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Profile updated!</span>
                </div>
              ) : <div />}

              <button
                type="submit"
                disabled={isSaving}
                className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm"
              >
                <Save className="w-4 h-4" />
                <span>{isSaving ? 'Saving...' : 'Save Changes'}</span>
              </button>
            </div>
          </div>
        </form>
      )}

      {/* App Preferences & Language (22 scheduled languages) */}
      <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs space-y-3">
        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-2">
          Language & System
        </h3>

        {/* Language button */}
        <button
          type="button"
          onClick={() => setShowLanguageModal(true)}
          className="w-full p-4 rounded-2xl border border-slate-100 bg-slate-50 hover:bg-slate-100/80 transition-colors flex items-center justify-between text-left"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-sm text-slate-900">
                Language / भाषा
              </div>
              <div className="text-xs text-slate-500">
                Currently: <strong className="text-indigo-700">{languageInfo.nativeName} ({languageInfo.name})</strong>
              </div>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400" />
        </button>

        {/* Public Apply as a Maid */}
        <button
          type="button"
          onClick={onOpenApplyMaid}
          className="w-full p-4 rounded-2xl border border-slate-100 bg-slate-50 hover:bg-slate-100/80 transition-colors flex items-center justify-between text-left"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-sm text-slate-900">
                Apply as a Maid (Public Job Form)
              </div>
              <div className="text-xs text-slate-500">
                Looking for work? Submit your details to join our roster.
              </div>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400" />
        </button>

        {/* External Setup Guide */}
        <button
          type="button"
          onClick={() => setShowSetupModal(true)}
          className="w-full p-4 rounded-2xl border border-slate-100 bg-slate-50 hover:bg-slate-100/80 transition-colors flex items-center justify-between text-left"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Settings2 className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <span>Supabase & System Setup Guide</span>
                <span className={`text-[10px] font-bold px-2 py-0.2 rounded-full ${isSupabaseActive ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                  {isSupabaseActive ? 'Supabase Active' : 'Setup Info'}
                </span>
              </div>
              <div className="text-xs text-slate-500">
                Firebase Phone Auth, Firestore rules, Google Maps & UPI
              </div>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400" />
        </button>
      </div>
    </div>
  );
};
