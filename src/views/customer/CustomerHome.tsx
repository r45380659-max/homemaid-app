import React, { useEffect, useState } from 'react';
import {
  Shirt,
  Sparkles,
  HeartHandshake,
  UserCheck,
  Droplets,
  ArrowRight,
  ShieldCheck,
  Clock,
  PhoneCall,
  CheckCircle2,
  ChevronRight,
  Star,
  MapPin,
} from 'lucide-react';
import { ServiceDefinition } from '../../types';
import { storage } from '../../services/storage';
import { useLanguage } from '../../i18n/LanguageContext';

interface CustomerHomeProps {
  onSelectService: (service: ServiceDefinition) => void;
  onNavigateTab: (tab: string) => void;
  onOpenApplyMaid: () => void;
}

export const CustomerHome: React.FC<CustomerHomeProps> = ({
  onSelectService,
  onNavigateTab,
  onOpenApplyMaid,
}) => {
  const { t } = useLanguage();
  const [services, setServices] = useState<ServiceDefinition[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    storage.getServices().then((res) => {
      setServices(res.filter((s) => s.isActive));
      setLoading(false);
    });
  }, []);

  const getServiceIcon = (id: string) => {
    switch (id) {
      case 'laundry':
        return <Shirt className="w-7 h-7 sm:w-8 sm:h-8" />;
      case 'house_cleaning':
        return <Sparkles className="w-7 h-7 sm:w-8 sm:h-8" />;
      case 'baby_sitting':
        return <HeartHandshake className="w-7 h-7 sm:w-8 sm:h-8" />;
      case 'elderly_care':
        return <UserCheck className="w-7 h-7 sm:w-8 sm:h-8" />;
      case 'water_tank':
        return <Droplets className="w-8 h-8 sm:w-9 sm:h-9" />;
      default:
        return <Sparkles className="w-7 h-7" />;
    }
  };

  // Group services as requested:
  // Row 1: Laundry Pickup & Delivery | House Cleaning
  // Row 2: Baby Sitting | Elderly Care
  // Row 3: Water Tank Cleaning (wider full-width card)
  const laundryService = services.find((s) => s.id === 'laundry');
  const cleaningService = services.find((s) => s.id === 'house_cleaning');
  const babysittingService = services.find((s) => s.id === 'baby_sitting');
  const elderlyService = services.find((s) => s.id === 'elderly_care');
  const waterTankService = services.find((s) => s.id === 'water_tank');
  const otherServices = services.filter(
    (s) =>
      !['laundry', 'house_cleaning', 'baby_sitting', 'elderly_care', 'water_tank'].includes(
        s.id
      )
  );

  return (
    <div className="space-y-6 sm:space-y-8 pb-12">
      {/* Top Welcome & Trust Hero Card */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white p-6 sm:p-8 shadow-xl shadow-indigo-950/10">
        <div className="relative z-10 max-w-xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-indigo-200 text-xs font-semibold mb-3 border border-white/10">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>100% Police Verified & Trained Staff</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight mb-2 leading-tight">
            Your Home. <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-sky-200 to-indigo-200">Our Care.</span>
          </h1>
          <p className="text-sm sm:text-base text-slate-300 font-normal leading-relaxed mb-6">
            Reliable, on-demand doorstep home care services in Bhopal. Transparent pricing, verified helpers assigned directly by Homemaid.
          </p>

          <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-slate-300">
            <div className="flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-amber-400" />
              <span>8:00 AM – 10:00 PM</span>
            </div>
            <div className="flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-rose-400" />
              <span>Bhopal & Surrounding Areas</span>
            </div>
          </div>
        </div>

        {/* Ambient shapes */}
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-indigo-500/20 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 -mb-16 w-48 h-48 rounded-full bg-rose-500/10 blur-2xl pointer-events-none" />
      </div>

      {/* Services Grid Section */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              {t('ourServices')}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 font-medium">
              Choose your service for instant pricing & slot reservation
            </p>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-pulse">
            <div className="h-44 bg-slate-200 rounded-3xl" />
            <div className="h-44 bg-slate-200 rounded-3xl" />
            <div className="h-44 bg-slate-200 rounded-3xl" />
            <div className="h-44 bg-slate-200 rounded-3xl" />
            <div className="h-48 sm:col-span-2 bg-slate-200 rounded-3xl" />
          </div>
        ) : (
          <div className="space-y-4">
            {/* Row 1: Laundry Pickup & Delivery | House Cleaning */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* 1. Laundry - lavender/purple */}
              {laundryService && (
                <div
                  onClick={() => onSelectService(laundryService)}
                  className="group cursor-pointer rounded-3xl p-5 sm:p-6 bg-[#F3E8FF] border border-[#E9D5FF] hover:border-purple-300 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between min-h-[180px]"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="w-14 h-14 rounded-2xl bg-purple-600/10 text-purple-700 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                      {getServiceIcon('laundry')}
                    </div>
                    <span className="text-xs font-bold px-3 py-1 rounded-full bg-white/80 text-purple-900 shadow-2xs">
                      {laundryService.basePriceDescription}
                    </span>
                  </div>

                  <div className="mt-4">
                    <h3 className="text-lg sm:text-xl font-bold text-slate-900 group-hover:text-purple-900 transition-colors">
                      {t('laundryTitle')}
                    </h3>
                    <p className="text-xs text-slate-600 mt-1 line-clamp-2 leading-relaxed">
                      {t('laundryFlow')}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-purple-200/60 flex items-center justify-between text-xs font-bold text-purple-700">
                    <span>{t('bookNow')}</span>
                    <div className="w-7 h-7 rounded-full bg-white flex items-center justify-center text-purple-700 group-hover:translate-x-1 transition-transform shadow-2xs">
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              )}

              {/* 2. House Cleaning - mint/green */}
              {cleaningService && (
                <div
                  onClick={() => onSelectService(cleaningService)}
                  className="group cursor-pointer rounded-3xl p-5 sm:p-6 bg-[#ECFDF5] border border-[#A7F3D0] hover:border-emerald-300 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between min-h-[180px]"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="w-14 h-14 rounded-2xl bg-emerald-600/10 text-emerald-700 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                      {getServiceIcon('house_cleaning')}
                    </div>
                    <span className="text-xs font-bold px-3 py-1 rounded-full bg-white/80 text-emerald-900 shadow-2xs">
                      {cleaningService.basePriceDescription}
                    </span>
                  </div>

                  <div className="mt-4">
                    <h3 className="text-lg sm:text-xl font-bold text-slate-900 group-hover:text-emerald-900 transition-colors">
                      {t('houseCleaningTitle')}
                    </h3>
                    <p className="text-xs text-slate-600 mt-1 line-clamp-2 leading-relaxed">
                      Simple cleaning, deep scrubbing, and sparkling bathroom sanitization.
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-emerald-200/60 flex items-center justify-between text-xs font-bold text-emerald-700">
                    <span>{t('bookNow')}</span>
                    <div className="w-7 h-7 rounded-full bg-white flex items-center justify-center text-emerald-700 group-hover:translate-x-1 transition-transform shadow-2xs">
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Row 2: Baby Sitting | Elderly Care */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* 3. Baby Sitting - peach/pink */}
              {babysittingService && (
                <div
                  onClick={() => onSelectService(babysittingService)}
                  className="group cursor-pointer rounded-3xl p-5 sm:p-6 bg-[#FFF1F2] border border-[#FECDD3] hover:border-rose-300 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between min-h-[180px]"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="w-14 h-14 rounded-2xl bg-rose-600/10 text-rose-700 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                      {getServiceIcon('baby_sitting')}
                    </div>
                    <span className="text-xs font-bold px-3 py-1 rounded-full bg-white/80 text-rose-900 shadow-2xs">
                      {babysittingService.basePriceDescription}
                    </span>
                  </div>

                  <div className="mt-4">
                    <h3 className="text-lg sm:text-xl font-bold text-slate-900 group-hover:text-rose-900 transition-colors">
                      {t('babySittingTitle')}
                    </h3>
                    <p className="text-xs text-slate-600 mt-1 line-clamp-2 leading-relaxed">
                      Nurturing, attentive childcare for infants and toddlers with hourly rates.
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-rose-200/60 flex items-center justify-between text-xs font-bold text-rose-700">
                    <span>{t('bookNow')}</span>
                    <div className="w-7 h-7 rounded-full bg-white flex items-center justify-center text-rose-700 group-hover:translate-x-1 transition-transform shadow-2xs">
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              )}

              {/* 4. Elderly Care - blue */}
              {elderlyService && (
                <div
                  onClick={() => onSelectService(elderlyService)}
                  className="group cursor-pointer rounded-3xl p-5 sm:p-6 bg-[#EFF6FF] border border-[#BFDBFE] hover:border-blue-300 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between min-h-[180px]"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="w-14 h-14 rounded-2xl bg-blue-600/10 text-blue-700 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                      {getServiceIcon('elderly_care')}
                    </div>
                    <span className="text-xs font-bold px-3 py-1 rounded-full bg-white/80 text-blue-900 shadow-2xs">
                      {elderlyService.basePriceDescription}
                    </span>
                  </div>

                  <div className="mt-4">
                    <h3 className="text-lg sm:text-xl font-bold text-slate-900 group-hover:text-blue-900 transition-colors">
                      {t('elderlyCareTitle')}
                    </h3>
                    <p className="text-xs text-slate-600 mt-1 line-clamp-2 leading-relaxed">
                      Respectful companionship, physical support, and daily care assistance.
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-blue-200/60 flex items-center justify-between text-xs font-bold text-blue-700">
                    <span>{t('bookNow')}</span>
                    <div className="w-7 h-7 rounded-full bg-white flex items-center justify-center text-blue-700 group-hover:translate-x-1 transition-transform shadow-2xs">
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Row 3: Water Tank Cleaning in a wider full-width card - cyan/turquoise */}
            {waterTankService && (
              <div
                onClick={() => onSelectService(waterTankService)}
                className="group cursor-pointer rounded-3xl p-6 sm:p-7 bg-[#ECFEFF] border border-[#A5F3FC] hover:border-cyan-300 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col sm:flex-row sm:items-center justify-between gap-6"
              >
                <div className="flex items-start sm:items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-cyan-600/10 text-cyan-700 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                    {getServiceIcon('water_tank')}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-white text-cyan-900 shadow-2xs">
                        Full-Width Specialty Service
                      </span>
                      <span className="text-xs font-semibold text-cyan-800">
                        {waterTankService.basePriceDescription}
                      </span>
                    </div>
                    <h3 className="text-xl sm:text-2xl font-bold text-slate-900 group-hover:text-cyan-900 transition-colors">
                      {t('waterTankTitle')}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-600 mt-0.5 max-w-xl leading-relaxed">
                      6-stage antibacterial cleaning: sludge pumping, high-pressure rotary descaling, vacuuming & UV disinfection. Minimum 1,000L to 10,000L capacity.
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-3 sm:pt-0 border-t sm:border-t-0 border-cyan-200">
                  <span className="text-xs sm:text-sm font-bold text-cyan-800 sm:hidden">
                    {t('bookNow')}
                  </span>
                  <div className="px-5 py-3 rounded-2xl bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-md shadow-cyan-600/20 group-hover:scale-102 transition-transform">
                    <span>{t('bookNow')}</span>
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </div>
            )}

            {/* Custom Admin Added Services (if any) */}
            {otherServices.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                {otherServices.map((s) => (
                  <div
                    key={s.id}
                    onClick={() => onSelectService(s)}
                    className="p-5 rounded-3xl border border-slate-200 bg-white hover:border-indigo-300 shadow-2xs cursor-pointer flex justify-between items-center"
                  >
                    <div>
                      <h4 className="font-bold text-slate-900">{s.name}</h4>
                      <p className="text-xs text-slate-500 mt-0.5">{s.tagline}</p>
                    </div>
                    <ArrowRight className="w-5 h-5 text-indigo-600" />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </section>

      {/* How Homemaid Works Banner */}
      <section className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs space-y-4">
        <h3 className="text-lg font-bold text-slate-900 tracking-tight">
          How Homemaid Works
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="flex items-start gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-100">
            <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
              1
            </div>
            <div>
              <h4 className="font-bold text-sm text-slate-900">Customized Selection</h4>
              <p className="text-xs text-slate-500 mt-0.5">
                Pick items, rooms, or hours with transparent upfront rates.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-100">
            <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
              2
            </div>
            <div>
              <h4 className="font-bold text-sm text-slate-900">Direct Admin Assignment</h4>
              <p className="text-xs text-slate-500 mt-0.5">
                Our operations team matches verified specialists for safety.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-100">
            <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
              3
            </div>
            <div>
              <h4 className="font-bold text-sm text-slate-900">Flexible Payment</h4>
              <p className="text-xs text-slate-500 mt-0.5">
                Pay online via UPI or choose Pay After Maid Arrives.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Public Apply as a Maid Card */}
      <section className="rounded-3xl p-6 bg-gradient-to-r from-[#00A3C4] via-[#0072B2] to-slate-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-lg shadow-cyan-900/10">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider bg-white/20 text-cyan-100 px-2.5 py-0.5 rounded-md">
            Career & Partner Opportunities
          </span>
          <h3 className="text-xl font-bold mt-2">
            Looking for Work? Apply as a Homemaid Specialist
          </h3>
          <p className="text-xs text-cyan-100 mt-1 max-w-md">
            Verified households, flexible work hours, competitive weekly payments, and respectful treatment guaranteed.
          </p>
        </div>

        <button
          onClick={onOpenApplyMaid}
          className="px-5 py-3 rounded-2xl bg-white text-[#0D3B66] font-bold text-xs sm:text-sm hover:bg-cyan-50 transition-colors shrink-0 shadow-md flex items-center justify-center gap-2"
        >
          <span>Fill Application Form</span>
          <ArrowRight className="w-4 h-4 text-[#0072B2]" />
        </button>
      </section>
    </div>
  );
};
