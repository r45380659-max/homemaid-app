import React, { useState, useEffect } from 'react';
import { AppSettings } from '../../types';
import { storage } from '../../services/storage';
import { useAuth } from '../../context/AuthContext';
import {
  Settings,
  Save,
  CheckCircle2,
  Phone,
  QrCode,
  Clock,
  MapPin,
  Plus,
  Trash2,
  ShieldCheck,
  ExternalLink,
  Upload,
  Info,
} from 'lucide-react';

export const AdminSettings: React.FC = () => {
  const { setShowSetupModal, isSupabaseActive } = useAuth();
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [newArea, setNewArea] = useState('');

  useEffect(() => {
    storage.getAppSettings().then((res) => {
      setSettings(res);
      setLoading(false);
    });
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;

    await storage.saveAppSettings(settings);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleAddArea = () => {
    if (!newArea.trim() || !settings) return;
    if (settings.serviceAreas.includes(newArea.trim())) return;

    setSettings({
      ...settings,
      serviceAreas: [...settings.serviceAreas, newArea.trim()],
    });
    setNewArea('');
  };

  const handleRemoveArea = (areaToRemove: string) => {
    if (!settings) return;
    setSettings({
      ...settings,
      serviceAreas: settings.serviceAreas.filter((a) => a !== areaToRemove),
    });
  };

  if (loading || !settings) {
    return <div className="p-8 text-center text-xs text-slate-500">Loading settings...</div>;
  }

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            Admin System Settings
          </h2>
          <p className="text-xs text-slate-500 font-medium">
            UPI merchant info, operational hours, helpline numbers & serviceable geographic boundaries.
          </p>
        </div>

        <button
          onClick={handleSave}
          className="flex items-center gap-1.5 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-600/20 transition-all self-start sm:self-auto"
        >
          <Save className="w-4 h-4" />
          <span>Save System Settings</span>
        </button>
      </div>

      {savedSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Settings saved successfully!</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Payment Gateways & UPI QR Management */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-5">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <QrCode className="w-5 h-5 text-indigo-600" />
              <div>
                <h3 className="font-bold text-base text-slate-900">
                  Admin UPI QR & Payment Management
                </h3>
                <p className="text-xs text-slate-500">
                  Configure merchant credentials, upload your UPI QR code, and manage payment verification.
                </p>
              </div>
            </div>

            <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-800 text-xs bg-slate-100 px-3 py-1.5 rounded-xl">
              <input
                type="checkbox"
                checked={settings.payNowEnabled !== false && settings.upiEnabled !== false}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    payNowEnabled: e.target.checked,
                    upiEnabled: e.target.checked,
                  })
                }
                className="w-4 h-4 rounded text-indigo-600"
              />
              <span>UPI Payments Active</span>
            </label>
          </div>

          {/* QR Code Upload & Live Preview Section */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <QrCode className="w-4 h-4 text-indigo-600" />
                  <span>Admin UPI QR Code Image</span>
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Upload your official PhonePe, Google Pay, Paytm, or BHIM Merchant QR code. Customers will scan this exact code during checkout.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <label className="flex items-center gap-1.5 px-3 py-2 bg-white border border-indigo-200 hover:border-indigo-400 text-indigo-600 text-xs font-bold rounded-xl shadow-2xs cursor-pointer transition-all">
                  <Upload className="w-3.5 h-3.5" />
                  <span>{settings.qrCodeUrl ? 'Replace QR Code' : 'Upload QR Code Image'}</span>
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/webp,image/svg+xml"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      if (file.size > 2 * 1024 * 1024) {
                        alert('Image size exceeds 2MB limit. Please choose a smaller image.');
                        return;
                      }
                      const reader = new FileReader();
                      reader.onload = (event) => {
                        const dataUrl = event.target?.result as string;
                        setSettings({ ...settings, qrCodeUrl: dataUrl });
                      };
                      reader.readAsDataURL(file);
                    }}
                  />
                </label>

                {settings.qrCodeUrl && (
                  <button
                    type="button"
                    onClick={() => setSettings({ ...settings, qrCodeUrl: undefined })}
                    className="p-2 text-rose-600 hover:bg-rose-50 rounded-xl transition-colors text-xs font-bold"
                    title="Remove custom QR"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {/* QR Code Live Preview */}
            <div className="flex flex-col sm:flex-row items-center gap-6 p-4 bg-white rounded-xl border border-slate-200">
              <div className="w-36 h-36 rounded-xl border border-slate-200 p-2 flex items-center justify-center bg-slate-50 overflow-hidden shrink-0 shadow-2xs">
                {settings.qrCodeUrl ? (
                  <img
                    src={settings.qrCodeUrl}
                    alt="Active UPI QR Code"
                    className="w-full h-full object-contain rounded-lg"
                  />
                ) : (
                  <div className="text-center p-2">
                    <QrCode className="w-12 h-12 text-slate-300 mx-auto mb-1" />
                    <span className="text-[10px] text-slate-400 font-medium">
                      Standard Dynamic UPI QR
                    </span>
                  </div>
                )}
              </div>

              <div className="space-y-1.5 text-xs text-slate-600">
                <div className="font-bold text-slate-800 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>
                    {settings.qrCodeUrl
                      ? 'Custom Uploaded QR Code is Live'
                      : 'Default Dynamic QR Code is Live'}
                  </span>
                </div>
                <p className="text-[11px] leading-relaxed text-slate-500">
                  {settings.qrCodeUrl
                    ? 'Customers on web & mobile will view and scan your custom QR code above. Ensure your UPI ID below matches the destination of this QR.'
                    : 'Currently using standard generated UPI QR code. Upload your official Merchant QR code image for higher brand trust and payment success rates.'}
                </p>
                <div className="pt-1 flex flex-wrap gap-2 text-[10px] font-mono">
                  <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                    UPI: {settings.upiId}
                  </span>
                  <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                    Name: {settings.merchantName}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Admin / Merchant UPI ID *
              </label>
              <input
                type="text"
                required
                value={settings.upiId}
                onChange={(e) => setSettings({ ...settings, upiId: e.target.value })}
                placeholder="e.g. homemate@upi or rishi@okhdfcbank"
                className="w-full p-3 bg-slate-50 text-sm font-mono font-bold text-slate-900 rounded-xl border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
              <p className="text-[10px] text-slate-400 mt-1">
                Used in UPI intent deep-links (<code className="font-mono">upi://pay?pa=...</code>) and copy button.
              </p>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Merchant / Business Display Name *
              </label>
              <input
                type="text"
                required
                value={settings.merchantName}
                onChange={(e) => setSettings({ ...settings, merchantName: e.target.value })}
                placeholder="e.g. HomeMate Home Services"
                className="w-full p-3 bg-slate-50 text-sm font-bold text-slate-900 rounded-xl border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
              <p className="text-[10px] text-slate-400 mt-1">
                Shown to customers in GPay/PhonePe when scanning your QR code.
              </p>
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1 text-xs">
              Payment Instructions Displayed to Customers
            </label>
            <textarea
              value={settings.paymentInstructions}
              onChange={(e) => setSettings({ ...settings, paymentInstructions: e.target.value })}
              rows={2}
              placeholder="Instructions for customer after scanning QR..."
              className="w-full p-3 bg-slate-50 text-xs rounded-xl border border-slate-200 focus:bg-white focus:outline-none"
            />
          </div>

          {/* Payment Method Toggles */}
          <div className="flex flex-wrap items-center gap-6 pt-2 border-t border-slate-100">
            <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-800 text-xs">
              <input
                type="checkbox"
                checked={settings.payNowEnabled}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    payNowEnabled: e.target.checked,
                    upiEnabled: e.target.checked,
                  })
                }
                className="w-4 h-4 rounded text-indigo-600"
              />
              <span>Enable Pay by UPI Checkout</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-800 text-xs">
              <input
                type="checkbox"
                checked={settings.payAfterMaidArrivesEnabled}
                onChange={(e) =>
                  setSettings({ ...settings, payAfterMaidArrivesEnabled: e.target.checked })
                }
                className="w-4 h-4 rounded text-indigo-600"
              />
              <span>Enable Pay After Maid Arrives (Cash / Post-Service)</span>
            </label>
          </div>

          {/* Automated Gateway vs Manual Admin Verification Explanation */}
          <div className="p-4 bg-indigo-50/60 rounded-2xl border border-indigo-100 space-y-2 text-xs text-indigo-950">
            <div className="font-bold flex items-center gap-1.5 text-indigo-900">
              <Info className="w-4 h-4 text-indigo-600 shrink-0" />
              <span>Real UPI Verification Architecture & Gateway Information</span>
            </div>
            <p className="text-[11px] leading-relaxed text-indigo-900/80">
              <strong>How HomeMate verifies UPI payments:</strong> Direct peer-to-merchant UPI QR payments do not offer automatic server push webhooks through standard banks. Therefore, HomeMate uses a <strong>strict Admin Verification Workflow</strong>: customers submit their 12-digit UTR/Ref ID and optional screenshot, which appears in your <em>UPI Payments Awaiting Verification</em> queue for approval.
            </p>
            <p className="text-[11px] leading-relaxed text-indigo-900/80">
              <strong>To enable 100% Instant Automatic UPI Verification:</strong> Integrate a licensed payment gateway (e.g., Razorpay UPI QR, Cashfree Auto-Collect, or Decentro Virtual Accounts). You would configure your <code className="font-mono bg-white px-1 py-0.5 rounded">RAZORPAY_KEY_ID</code>, <code className="font-mono bg-white px-1 py-0.5 rounded">RAZORPAY_KEY_SECRET</code>, and webhook endpoint (<code className="font-mono bg-white px-1 py-0.5 rounded">/api/webhooks/razorpay</code>).
            </p>
          </div>
        </div>

        {/* Helpline & Operating Hours */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <Phone className="w-5 h-5 text-indigo-600" />
            <h3 className="font-bold text-base text-slate-900">
              Customer Helpline & Operational Hours
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Customer Care Telephone Number * (Opens phone dialer)
              </label>
              <input
                type="text"
                required
                value={settings.customerCarePhone}
                onChange={(e) => setSettings({ ...settings, customerCarePhone: e.target.value })}
                placeholder="+91 98930 12345"
                className="w-full p-3 bg-slate-50 text-sm font-mono font-bold text-slate-900 rounded-xl border border-slate-200"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                WhatsApp Support Number
              </label>
              <input
                type="text"
                value={settings.customerCareWhatsApp}
                onChange={(e) => setSettings({ ...settings, customerCareWhatsApp: e.target.value })}
                placeholder="+91 98930 12345"
                className="w-full p-3 bg-slate-50 text-sm font-mono font-bold text-slate-900 rounded-xl border border-slate-200"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Business Opening Time</label>
              <input
                type="time"
                value={settings.businessOpeningTime}
                onChange={(e) => setSettings({ ...settings, businessOpeningTime: e.target.value })}
                className="w-full p-3 bg-slate-50 text-sm font-bold rounded-xl border border-slate-200"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Business Closing Time</label>
              <input
                type="time"
                value={settings.businessClosingTime}
                onChange={(e) => setSettings({ ...settings, businessClosingTime: e.target.value })}
                className="w-full p-3 bg-slate-50 text-sm font-bold rounded-xl border border-slate-200"
              />
            </div>
          </div>
        </div>

        {/* Serviceable Geographic Areas */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <MapPin className="w-5 h-5 text-indigo-600" />
            <h3 className="font-bold text-base text-slate-900">
              Service Areas & Geofence
            </h3>
          </div>
          <p className="text-xs text-slate-500">
            Customers in these localities see: “Homemaid is available in your area.”
          </p>

          <div className="flex flex-wrap gap-2">
            {settings.serviceAreas.map((area) => (
              <span
                key={area}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 text-slate-800 text-xs font-bold border border-slate-200"
              >
                <span>{area}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveArea(area)}
                  className="text-slate-400 hover:text-rose-600 ml-1"
                >
                  ✕
                </button>
              </span>
            ))}
          </div>

          <div className="flex gap-2 max-w-sm pt-2">
            <input
              type="text"
              value={newArea}
              onChange={(e) => setNewArea(e.target.value)}
              placeholder="e.g. Arera Colony"
              className="p-2.5 bg-slate-50 text-xs rounded-xl border border-slate-200 flex-1"
            />
            <button
              type="button"
              onClick={handleAddArea}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold"
            >
              Add Area
            </button>
          </div>
        </div>

        {/* External Service Setup Trigger */}
        <div className="bg-slate-900 text-white rounded-3xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              <h4 className="font-bold text-base">External Services Integration</h4>
            </div>
            <p className="text-xs text-slate-300 mt-1">
              Configure Supabase Auth, Row-Level Security (RLS) policies, and server-side ADMIN_EMAIL settings.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowSetupModal(true)}
            className="px-5 py-2.5 bg-white text-slate-900 hover:bg-slate-100 rounded-xl text-xs font-bold shrink-0 transition-colors"
          >
            Open Setup Guide & Credentials Editor
          </button>
        </div>
      </form>
    </div>
  );
};
