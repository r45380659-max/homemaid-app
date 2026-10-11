import React from 'react';
import { Globe, Shield, Sparkles, Settings2, Home } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { HomemaidLogo } from './HomemaidLogo';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  portalMode: 'customer' | 'admin';
  setPortalMode: (mode: 'customer' | 'admin') => void;
  onOpenApplyMaid: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  portalMode,
  setPortalMode,
  onOpenApplyMaid,
}) => {
  const { languageInfo, setShowLanguageModal, t } = useLanguage();
  const { currentUser, isAdmin, setShowSetupModal, isSupabaseActive } = useAuth();

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-100 shadow-xs">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 sm:h-20 flex items-center justify-between gap-2">
        {/* Brand Logo & Tagline (Official Artwork) */}
        <div
          onClick={() => {
            if (portalMode === 'admin') {
              setActiveTab('admin_dashboard');
            } else {
              setActiveTab('home');
            }
          }}
          className="cursor-pointer group select-none flex items-center gap-2"
        >
          <HomemaidLogo size="md" showTagline={true} />
          {portalMode === 'admin' && (
            <span className="ml-1 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-800 rounded-md border border-amber-300">
              Admin
            </span>
          )}
        </div>

        {/* Right side controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* External Setup Status Indicator */}
          {!isSupabaseActive && (
            <button
              onClick={() => setShowSetupModal(true)}
              className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold bg-cyan-50 text-cyan-800 border border-cyan-200 rounded-full hover:bg-cyan-100 transition-colors"
              title="Click to view Supabase setup instructions"
            >
              <Settings2 className="w-3.5 h-3.5 text-cyan-600" />
              <span>Supabase Setup</span>
            </button>
          )}

          {/* Apply as a Maid link (Customer mode only) */}
          {portalMode === 'customer' && (
            <button
              onClick={onOpenApplyMaid}
              className="hidden md:flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#0072B2] bg-cyan-50 hover:bg-cyan-100/80 rounded-xl transition-colors border border-cyan-100"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Apply as a Maid</span>
            </button>
          )}

          {/* Language Selector Trigger (22 scheduled Indian languages) */}
          <button
            onClick={() => setShowLanguageModal(true)}
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 text-xs sm:text-sm font-medium text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl transition-all shadow-2xs"
            title="Change language (22 Indian languages)"
          >
            <Globe className="w-4 h-4 text-cyan-600" />
            <span className="font-semibold">{languageInfo.nativeName}</span>
          </button>

          {/* Customer / Admin Portal Switcher */}
          {portalMode === 'customer' ? (
            <button
              onClick={() => {
                setPortalMode('admin');
                setActiveTab(currentUser?.role === 'admin' ? 'admin_dashboard' : 'admin_login');
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all"
              title="Switch to Admin Portal"
            >
              <Shield className="w-4 h-4 text-slate-600" />
              <span className="hidden sm:inline">Admin Portal</span>
            </button>
          ) : (
            <button
              onClick={() => {
                setPortalMode('customer');
                setActiveTab('home');
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-semibold text-[#0072B2] bg-cyan-50 hover:bg-cyan-100 rounded-xl transition-all border border-cyan-200"
              title="Return to Customer Portal"
            >
              <Home className="w-4 h-4 text-[#0072B2]" />
              <span>Customer Portal</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
