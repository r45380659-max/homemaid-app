import React, { useEffect, useState } from 'react';
import { Sparkles, Shirt, Droplets, HeartHandshake, UserCheck, ArrowRight } from 'lucide-react';
import { HomemaidLogo } from './HomemaidLogo';

interface SplashScreenProps {
  onComplete: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onComplete }) => {
  const [canSkip, setCanSkip] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setCanSkip(true);
    }, 1200);

    const autoClose = setTimeout(() => {
      onComplete();
    }, 2800);

    return () => {
      clearTimeout(timer);
      clearTimeout(autoClose);
    };
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-50 bg-gradient-to-b from-[#F0F9FF] via-[#E0F2FE] to-[#F8FAFC] flex flex-col items-center justify-between p-6 text-slate-800 select-none overflow-hidden">
      {/* Background ambient glow */}
      <div className="absolute top-1/4 -left-20 w-80 h-80 bg-cyan-300/30 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-sky-300/30 rounded-full blur-3xl pointer-events-none" />

      {/* Top tag */}
      <div className="w-full flex justify-end">
        <button
          onClick={onComplete}
          className="text-xs text-slate-500 hover:text-slate-800 px-3 py-1 rounded-full border border-slate-300 bg-white/70 backdrop-blur-xs transition-colors shadow-2xs"
        >
          Skip Intro →
        </button>
      </div>

      {/* Main Center Branding & Illustration */}
      <div className="flex flex-col items-center text-center max-w-sm mx-auto">
        {/* Official Homemaid House & Heart Icon */}
        <div className="relative mb-4 bg-white/90 p-5 rounded-3xl shadow-xl shadow-cyan-900/10 border border-cyan-100/80 animate-bounce duration-1000">
          <HomemaidLogo size="xl" showText={false} />
        </div>

        {/* Brand Name & Tagline */}
        <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-[#0D3B66] mb-1">
          HOMEMAID
        </h1>
        <p className="text-base sm:text-lg font-bold text-[#0F568C] tracking-tight mb-2">
          Home Services Made Easy
        </p>
        <p className="text-xs sm:text-sm font-medium text-slate-500 italic mb-8">
          “Your Home. Our Care.”
        </p>

        {/* 5 Service Icons Orb Illustration */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="flex flex-col items-center">
            <div className="w-11 h-11 rounded-2xl bg-purple-500/10 border border-purple-300/60 flex items-center justify-center text-purple-700 shadow-2xs">
              <Shirt className="w-5 h-5" />
            </div>
            <span className="text-[10px] text-purple-800 font-semibold mt-1">Laundry</span>
          </div>

          <div className="flex flex-col items-center">
            <div className="w-11 h-11 rounded-2xl bg-emerald-500/10 border border-emerald-300/60 flex items-center justify-center text-emerald-700 shadow-2xs">
              <Sparkles className="w-5 h-5" />
            </div>
            <span className="text-[10px] text-emerald-800 font-semibold mt-1">Cleaning</span>
          </div>

          <div className="flex flex-col items-center">
            <div className="w-11 h-11 rounded-2xl bg-rose-500/10 border border-rose-300/60 flex items-center justify-center text-rose-700 shadow-2xs">
              <HeartHandshake className="w-5 h-5" />
            </div>
            <span className="text-[10px] text-rose-800 font-semibold mt-1">Babysitting</span>
          </div>

          <div className="flex flex-col items-center">
            <div className="w-11 h-11 rounded-2xl bg-blue-500/10 border border-blue-300/60 flex items-center justify-center text-blue-700 shadow-2xs">
              <UserCheck className="w-5 h-5" />
            </div>
            <span className="text-[10px] text-blue-800 font-semibold mt-1">Elderly</span>
          </div>

          <div className="flex flex-col items-center">
            <div className="w-11 h-11 rounded-2xl bg-cyan-500/10 border border-cyan-300/60 flex items-center justify-center text-cyan-700 shadow-2xs">
              <Droplets className="w-5 h-5" />
            </div>
            <span className="text-[10px] text-cyan-800 font-semibold mt-1">Water Tank</span>
          </div>
        </div>

        <p className="text-xs text-slate-500 max-w-xs leading-relaxed">
          Professional, verified, on-demand home care tailored for your family.
        </p>
      </div>

      {/* Bottom CTA / Loading */}
      <div className="w-full max-w-sm pb-4">
        {canSkip ? (
          <button
            onClick={onComplete}
            className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-[#00A3C4] to-[#0072B2] hover:from-[#0092B0] hover:to-[#006299] text-white font-bold text-sm sm:text-base shadow-lg shadow-cyan-700/25 flex items-center justify-center gap-2 transition-all active:scale-98"
          >
            <span>Get Started</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        ) : (
          <div className="flex items-center justify-center gap-2 text-xs text-cyan-700 font-semibold">
            <div className="w-2 h-2 rounded-full bg-cyan-500 animate-ping" />
            <span>Preparing Homemaid Care...</span>
          </div>
        )}
      </div>
    </div>
  );
};
