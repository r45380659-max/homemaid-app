import React, { useState, useEffect } from 'react';
import { AppSettings } from '../../types';
import { storage } from '../../services/storage';
import { useLanguage } from '../../i18n/LanguageContext';
import {
  Headphones,
  PhoneCall,
  MessageSquare,
  Clock,
  MapPin,
  ShieldCheck,
  ChevronDown,
  HelpCircle,
} from 'lucide-react';

export const CustomerCare: React.FC = () => {
  const { t } = useLanguage();
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  useEffect(() => {
    storage.getAppSettings().then(setSettings);
  }, []);

  const phone = settings?.customerCarePhone || '+91 98930 12345';
  const cleanPhone = phone.replace(/[\s-]/g, '');
  const opening = settings?.businessOpeningTime || '08:00';
  const closing = settings?.businessClosingTime || '22:00';

  const faqs = [
    {
      q: 'Can I select a specific maid when booking?',
      a: 'To guarantee quality, safety, and background-verification consistency, Homemaid does not allow customers to select their own maid. Our operations team assigns accredited, trained specialists based on service type and location.',
    },
    {
      q: 'How does payment work for "Pay After Maid Arrives"?',
      a: 'With Pay After Maid Arrives, there is zero advance fee. When the verified helper reaches your doorstep, you inspect the service and pay via cash or UPI directly.',
    },
    {
      q: 'What is Homemaid’s refund policy?',
      a: 'We never claim automated instant refunds. If a paid booking is cancelled by Homemaid or by you before dispatch, our billing department verifies the bank reference and initiates a manual bank refund within 1-2 business days.',
    },
    {
      q: 'What are your operational working hours?',
      a: `Homemaid operates 7 days a week from ${opening} to ${closing}. Bookings scheduled within these hours receive immediate priority routing.`,
    },
  ];

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-20">
      {/* Hero */}
      <div className="bg-gradient-to-br from-[#0B2545] via-[#0A3161] to-[#0D3B66] rounded-3xl p-6 sm:p-8 text-white space-y-4 shadow-lg shadow-cyan-900/10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-cyan-200 text-xs font-semibold">
          <Headphones className="w-3.5 h-3.5" />
          <span>Homemaid Dedicated Support</span>
        </div>

        <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
          How can we help your home today?
        </h2>
        <p className="text-xs sm:text-sm text-cyan-100 max-w-md">
          Direct telephone assistance, booking queries, rescheduling, and verified service guarantees.
        </p>

        {/* Operating hours pill */}
        <div className="flex items-center gap-2 text-xs text-amber-300 font-semibold pt-1">
          <Clock className="w-4 h-4" />
          <span>Daily Operations: {opening} to {closing}</span>
        </div>
      </div>

      {/* Primary Actions: Call dialer & WhatsApp */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Phone Dialer */}
        <a
          href={`tel:${cleanPhone}`}
          className="p-6 rounded-3xl bg-white border border-slate-200 hover:border-cyan-400 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between group"
        >
          <div className="flex items-center justify-between">
            <div className="w-12 h-12 rounded-2xl bg-cyan-50 text-cyan-700 flex items-center justify-center group-hover:scale-105 transition-transform">
              <PhoneCall className="w-6 h-6" />
            </div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
              Live Dialer
            </span>
          </div>

          <div className="mt-4">
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Customer Support Helpline
            </div>
            <div className="font-mono font-bold text-lg sm:text-xl text-slate-900 mt-0.5">
              {phone}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Tap to open your phone’s dialer and connect immediately.
            </p>
          </div>
        </a>

        {/* WhatsApp Chat */}
        <a
          href={`https://wa.me/${cleanPhone.replace('+', '')}?text=${encodeURIComponent(
            'Hello Homemaid! I have a question regarding home services in Bhopal.'
          )}`}
          target="_blank"
          rel="noreferrer"
          className="p-6 rounded-3xl bg-white border border-slate-200 hover:border-emerald-400 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between group"
        >
          <div className="flex items-center justify-between">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-105 transition-transform">
              <MessageSquare className="w-6 h-6" />
            </div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
              WhatsApp
            </span>
          </div>

          <div className="mt-4">
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Chat on WhatsApp
            </div>
            <div className="font-bold text-base text-slate-900 mt-0.5">
              Direct Service Messaging
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Quick replies for quotes, rescheduling, and status updates.
            </p>
          </div>
        </a>
      </div>

      {/* Frequently Asked Questions */}
      <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs space-y-4">
        <div className="flex items-center gap-2">
          <HelpCircle className="w-5 h-5 text-indigo-600" />
          <h3 className="text-base font-bold text-slate-900">
            Frequently Asked Questions
          </h3>
        </div>

        <div className="divide-y divide-slate-100">
          {faqs.map((faq, idx) => (
            <div key={idx} className="py-3">
              <button
                type="button"
                onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                className="w-full flex items-center justify-between gap-4 text-left font-bold text-xs sm:text-sm text-slate-800 hover:text-indigo-600 transition-colors"
              >
                <span>{faq.q}</span>
                <ChevronDown
                  className={`w-4 h-4 text-slate-400 shrink-0 transition-transform ${
                    openFaq === idx ? 'rotate-180 text-indigo-600' : ''
                  }`}
                />
              </button>

              {openFaq === idx && (
                <p className="text-xs text-slate-600 leading-relaxed mt-2 pl-1 animate-in fade-in duration-150">
                  {faq.a}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
