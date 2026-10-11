import React, { useState, useEffect } from 'react';
import { PaymentMethod, AppSettings } from '../../types';
import { storage } from '../../services/storage';
import { useLanguage } from '../../i18n/LanguageContext';
import {
  ArrowLeft,
  QrCode,
  Banknote,
  Copy,
  Check,
  ExternalLink,
  ShieldCheck,
  AlertCircle,
  Clock,
  Sparkles,
  Info,
  Upload,
  Image as ImageIcon,
  Trash2,
  Lock,
} from 'lucide-react';

interface PaymentConfirmationStepProps {
  amount: number;
  bookingRef: string;
  onBack: () => void;
  onSubmitBooking: (paymentData: {
    paymentMethod: PaymentMethod;
    paymentStatus: any;
    bookingStatus: any;
    paymentUpiRef?: string;
    paymentProofUrl?: string;
    paymentSubmittedAt?: string;
  }) => void;
}

export const PaymentConfirmationStep: React.FC<PaymentConfirmationStepProps> = ({
  amount,
  bookingRef,
  onBack,
  onSubmitBooking,
}) => {
  const { t } = useLanguage();
  const [appSettings, setAppSettings] = useState<AppSettings | null>(null);
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>('UPI');
  const [upiRefNumber, setUpiRefNumber] = useState<string>('');
  const [paymentProofUrl, setPaymentProofUrl] = useState<string>('');
  const [copiedUpi, setCopiedUpi] = useState<boolean>(false);
  const [hasClickedUpiIntent, setHasClickedUpiIntent] = useState<boolean>(false);
  const [validationError, setValidationError] = useState<string>('');

  useEffect(() => {
    storage.getAppSettings().then((s) => {
      setAppSettings(s);
      if (s.payNowEnabled === false || s.upiEnabled === false) {
        setSelectedMethod('PAY_AFTER_SERVICE');
      }
    });
  }, []);

  const upiId = appSettings?.upiId || 'homemaid@upi';
  const merchantName = appSettings?.merchantName || 'HomeMate Services Pvt Ltd';

  // Standard NPCI UPI URI
  // upi://pay?pa=<address>&pn=<name>&am=<amount>&cu=INR&tn=<note>
  const upiUrl = `upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(
    merchantName
  )}&am=${amount}&cu=INR&tn=${encodeURIComponent(`HomeMate Booking ${bookingRef}`)}`;

  const handleCopyUpi = () => {
    navigator.clipboard.writeText(upiId);
    setCopiedUpi(true);
    setTimeout(() => setCopiedUpi(false), 2000);
  };

  const handleLaunchUpi = () => {
    setHasClickedUpiIntent(true);
    window.location.href = upiUrl;
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 3 * 1024 * 1024) {
      alert('File size exceeds 3MB. Please choose a smaller image.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setPaymentProofUrl(dataUrl);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = () => {
    setValidationError('');

    if (selectedMethod === 'UPI') {
      const cleanRef = upiRefNumber.trim();
      if (!cleanRef) {
        setValidationError(
          'Please enter your 12-digit UPI Transaction / Reference ID (UTR) from your UPI payment app so our admin can verify your payment.'
        );
        return;
      }

      onSubmitBooking({
        paymentMethod: 'UPI',
        paymentStatus: 'AWAITING_VERIFICATION',
        bookingStatus: 'PAYMENT_PENDING_VERIFICATION',
        paymentUpiRef: cleanRef,
        paymentProofUrl: paymentProofUrl || undefined,
        paymentSubmittedAt: new Date().toISOString(),
      });
    } else {
      onSubmitBooking({
        paymentMethod: 'PAY_AFTER_SERVICE',
        paymentStatus: 'PAY_AFTER_SERVICE_PENDING',
        bookingStatus: 'CONFIRMED',
      });
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-28">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white border border-slate-200 px-3 py-1.5 rounded-xl shadow-2xs transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>

        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
          Step 4 of 4: Payment Confirmation
        </span>
      </div>

      {/* Bill Summary Card */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-base font-bold text-slate-900">Total Payable Amount</h3>
            <p className="text-xs text-slate-500">Booking Reference: <span className="font-mono font-bold text-slate-800">{bookingRef}</span></p>
          </div>
          <div className="text-3xl font-black text-indigo-600">
            ₹{amount}
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-500">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Transparent pricing • Zero surge charges • Direct Admin verification</span>
        </div>
      </div>

      {/* Payment Method Selector */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-5">
        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
          Choose Payment Method
        </h3>

        <div className="space-y-4">
          {/* Option 1: Pay by UPI */}
          {appSettings?.payNowEnabled !== false && appSettings?.upiEnabled !== false && (
            <div
              className={`p-5 rounded-3xl border transition-all ${
                selectedMethod === 'UPI'
                  ? 'border-indigo-600 bg-indigo-50/30 ring-2 ring-indigo-500/20'
                  : 'border-slate-200 hover:bg-slate-50 cursor-pointer'
              }`}
            >
              <div
                onClick={() => setSelectedMethod('UPI')}
                className="flex items-start justify-between gap-3 cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                    <QrCode className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-bold text-base text-slate-900">
                      Pay by UPI (GPay, PhonePe, Paytm, BHIM)
                    </div>
                    <div className="text-xs text-slate-500 mt-0.5">
                      Scan merchant QR or launch your UPI app, then submit transaction reference.
                    </div>
                  </div>
                </div>

                <div
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 mt-1 ${
                    selectedMethod === 'UPI' ? 'border-indigo-600 bg-indigo-600' : 'border-slate-300'
                  }`}
                >
                  {selectedMethod === 'UPI' && <div className="w-2 h-2 rounded-full bg-white" />}
                </div>
              </div>

              {/* Expanded UPI Details */}
              {selectedMethod === 'UPI' && (
                <div className="mt-5 pt-5 border-t border-indigo-100 space-y-5">
                  {/* Step 1: Payment Methods */}
                  <div className="space-y-3">
                    <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5 uppercase tracking-wide">
                      <span className="w-5 h-5 rounded-full bg-indigo-600 text-white text-[10px] flex items-center justify-center">1</span>
                      <span>Scan QR Code or Open UPI App</span>
                    </div>

                    {/* QR Code Card */}
                    <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-center gap-5">
                      <div className="w-44 h-44 rounded-2xl border border-slate-200 p-2.5 bg-slate-50 flex items-center justify-center shrink-0 overflow-hidden shadow-xs">
                        {appSettings?.qrCodeUrl ? (
                          <img
                            src={appSettings.qrCodeUrl}
                            alt="Admin UPI QR Code"
                            className="w-full h-full object-contain rounded-xl"
                          />
                        ) : (
                          /* Standard dynamic high-res SVG fallback QR */
                          <div className="w-full h-full bg-slate-900 text-white rounded-xl p-3 flex flex-col justify-between">
                            <div className="flex justify-between">
                              <div className="w-9 h-9 bg-white p-1 rounded-sm flex items-center justify-center">
                                <div className="w-5 h-5 bg-slate-900" />
                              </div>
                              <div className="w-9 h-9 bg-white p-1 rounded-sm flex items-center justify-center">
                                <div className="w-5 h-5 bg-slate-900" />
                              </div>
                            </div>
                            <div className="text-[10px] font-mono text-center text-slate-200 font-bold">
                              PAY ₹{amount}
                            </div>
                            <div className="flex justify-between items-end">
                              <div className="w-9 h-9 bg-white p-1 rounded-sm flex items-center justify-center">
                                <div className="w-5 h-5 bg-slate-900" />
                              </div>
                              <div className="text-[9px] font-mono text-cyan-300">
                                {bookingRef}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="space-y-3 text-xs w-full">
                        <div>
                          <div className="text-[11px] text-slate-500 font-medium">Merchant Name:</div>
                          <div className="text-sm font-bold text-slate-900">{merchantName}</div>
                        </div>

                        <div>
                          <div className="text-[11px] text-slate-500 font-medium">Admin UPI ID:</div>
                          <div className="flex items-center gap-2 mt-1">
                            <code className="font-mono font-bold text-indigo-700 bg-indigo-50 px-2.5 py-1.5 rounded-xl text-xs sm:text-sm border border-indigo-100 flex-1 truncate">
                              {upiId}
                            </code>
                            <button
                              type="button"
                              onClick={handleCopyUpi}
                              className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center gap-1 shrink-0 transition-colors"
                            >
                              {copiedUpi ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                              <span>{copiedUpi ? 'Copied' : 'Copy'}</span>
                            </button>
                          </div>
                        </div>

                        <div>
                          <div className="text-[11px] text-slate-500 font-medium">Amount to Pay:</div>
                          <div className="text-base font-black text-emerald-700">₹{amount} (Exact Amount)</div>
                        </div>

                        {/* Open in installed UPI app button */}
                        <button
                          type="button"
                          onClick={handleLaunchUpi}
                          className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-all"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          <span>Pay in GPay / PhonePe / Paytm</span>
                        </button>
                      </div>
                    </div>

                    {appSettings?.paymentInstructions && (
                      <div className="p-3 bg-slate-100/70 rounded-xl text-[11px] text-slate-600">
                        {appSettings.paymentInstructions}
                      </div>
                    )}
                  </div>

                  {/* Step 2: Submit Payment Details */}
                  <div className="space-y-3 pt-2">
                    <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5 uppercase tracking-wide">
                      <span className="w-5 h-5 rounded-full bg-indigo-600 text-white text-[10px] flex items-center justify-center">2</span>
                      <span>Enter Transaction Details for Admin Verification</span>
                    </div>

                    {/* Strict Verification Note */}
                    <div className="p-3.5 rounded-2xl bg-amber-50/80 border border-amber-200 text-amber-900 text-xs space-y-1">
                      <div className="font-bold flex items-center gap-1.5">
                        <Lock className="w-4 h-4 text-amber-600 shrink-0" />
                        <span>Genuine Payment Verification Required</span>
                      </div>
                      <p className="text-[11px] leading-relaxed text-amber-800">
                        Launching a UPI app or clicking submit does <strong>not</strong> automatically confirm your booking. Our admin operations team verifies every transaction against our official bank statement before helper dispatch.
                      </p>
                    </div>

                    {/* UTR Input */}
                    <div>
                      <label className="block text-xs font-bold text-slate-800 mb-1">
                        UPI Transaction ID / 12-Digit UTR Number *
                      </label>
                      <input
                        type="text"
                        required
                        value={upiRefNumber}
                        onChange={(e) => {
                          setUpiRefNumber(e.target.value);
                          setValidationError('');
                        }}
                        placeholder="e.g. 429381029482 (From payment receipt / SMS)"
                        className="w-full p-3 bg-white text-sm font-mono font-bold text-slate-900 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
                      />
                      <p className="text-[11px] text-slate-400 mt-1">
                        Find the 12-digit UTR or UPI Reference No. in your GPay, PhonePe, or Paytm receipt.
                      </p>
                    </div>

                    {/* Proof Upload (Optional) */}
                    <div>
                      <label className="block text-xs font-bold text-slate-800 mb-1">
                        Payment Screenshot / Receipt (Optional)
                      </label>

                      {paymentProofUrl ? (
                        <div className="p-3 bg-white rounded-xl border border-slate-200 flex items-center justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <img
                              src={paymentProofUrl}
                              alt="Payment Proof"
                              className="w-12 h-12 object-cover rounded-lg border border-slate-200"
                            />
                            <div>
                              <div className="text-xs font-bold text-slate-800">Screenshot Attached</div>
                              <div className="text-[10px] text-emerald-600 font-semibold">Ready for admin inspection</div>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => setPaymentProofUrl('')}
                            className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors text-xs font-bold"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <label className="flex items-center justify-center gap-2 p-3 bg-white border border-dashed border-slate-300 hover:border-indigo-400 rounded-xl text-xs font-semibold text-slate-600 hover:text-indigo-600 cursor-pointer transition-colors">
                          <Upload className="w-4 h-4" />
                          <span>Attach Payment Screenshot / Receipt</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleFileUpload}
                            className="hidden"
                          />
                        </label>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Option 2: Pay After Maid Arrives */}
          {appSettings?.payAfterMaidArrivesEnabled !== false && (
            <div
              onClick={() => setSelectedMethod('PAY_AFTER_SERVICE')}
              className={`p-5 rounded-3xl border cursor-pointer transition-all ${
                selectedMethod === 'PAY_AFTER_SERVICE'
                  ? 'border-emerald-600 bg-emerald-50/30 ring-2 ring-emerald-500/20'
                  : 'border-slate-200 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                    <Banknote className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-bold text-base text-slate-900">
                      Pay After Maid Arrives
                    </div>
                    <div className="text-xs text-slate-500 mt-0.5">
                      No advance payment needed. Pay in Cash or UPI once the helper arrives at your doorstep.
                    </div>
                  </div>
                </div>

                <div
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 mt-1 ${
                    selectedMethod === 'PAY_AFTER_SERVICE'
                      ? 'border-emerald-600 bg-emerald-600'
                      : 'border-slate-300'
                  }`}
                >
                  {selectedMethod === 'PAY_AFTER_SERVICE' && (
                    <div className="w-2 h-2 rounded-full bg-white" />
                  )}
                </div>
              </div>

              {selectedMethod === 'PAY_AFTER_SERVICE' && (
                <div className="mt-4 pt-3 border-t border-emerald-100 text-xs text-emerald-950 font-medium flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>
                    Your booking will be placed directly with status: <strong>PAY AFTER SERVICE / PAYMENT PENDING</strong>.
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Validation Error Message */}
      {validationError && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{validationError}</span>
        </div>
      )}

      {/* Floating Bottom Submit Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 p-4 shadow-xl">
        <div className="max-w-2xl mx-auto flex items-center justify-between gap-4">
          <div>
            <div className="text-[11px] font-semibold text-slate-500">Total Amount:</div>
            <div className="text-2xl font-black text-slate-900">₹{amount}</div>
          </div>

          <button
            type="button"
            onClick={handleSubmit}
            className="px-6 sm:px-8 py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm sm:text-base flex items-center gap-2 shadow-lg shadow-indigo-600/30 transition-all active:scale-98"
          >
            <span>
              {selectedMethod === 'UPI'
                ? 'Submit Payment Details'
                : 'Confirm & Pay After Service'}
            </span>
            <span>✓</span>
          </button>
        </div>
      </div>
    </div>
  );
};
