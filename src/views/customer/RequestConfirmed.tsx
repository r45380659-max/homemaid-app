import React, { useEffect } from 'react';
import { Booking } from '../../types';
import {
  CheckCircle2,
  Calendar,
  Clock,
  MapPin,
  ShieldCheck,
  CreditCard,
  ArrowRight,
  PhoneCall,
  Home,
  FileText,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface RequestConfirmedProps {
  booking: Booking;
  onViewMyBookings: () => void;
  onGoHome: () => void;
}

export const RequestConfirmed: React.FC<RequestConfirmedProps> = ({
  booking,
  onViewMyBookings,
  onGoHome,
}) => {
  useEffect(() => {
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#6366F1', '#EC4899', '#10B981', '#06B6D4'],
      });
    } catch {
      // ignore
    }
  }, []);

  return (
    <div className="max-w-xl mx-auto space-y-6 pb-20 pt-4">
      {/* Success Card with exact text */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-md text-center space-y-4">
        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner animate-pulse">
          <CheckCircle2 className="w-10 h-10 sm:w-12 sm:h-12" />
        </div>

        <div>
          {/* Headline depending on payment flow */}
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            {booking.bookingStatus === 'PAYMENT_PENDING_VERIFICATION'
              ? 'UPI Payment Details Submitted!'
              : 'Your booking has been received!'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
            {booking.bookingStatus === 'PAYMENT_PENDING_VERIFICATION'
              ? 'Thank you! We received your UPI reference. Our operations team is verifying the transaction.'
              : 'Thank you for choosing HomeMate. Our operations team is scheduling your verified helper.'}
          </p>
        </div>

        {/* Status Badge */}
        {booking.bookingStatus === 'PAYMENT_PENDING_VERIFICATION' ? (
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-950 font-bold text-xs sm:text-sm tracking-wide inline-flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-600 animate-spin" />
            <span>PAYMENT SUBMITTED – AWAITING ADMIN VERIFICATION</span>
          </div>
        ) : booking.paymentMethod === 'PAY_AFTER_SERVICE' ? (
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-950 font-bold text-xs sm:text-sm tracking-wide inline-flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>CONFIRMED – PAY AFTER SERVICE / PAYMENT PENDING</span>
          </div>
        ) : (
          <div className="p-4 rounded-2xl bg-indigo-50 border border-indigo-200 text-indigo-950 font-bold text-xs sm:text-sm tracking-wide inline-flex items-center gap-2">
            <Clock className="w-4 h-4 text-indigo-600 animate-spin" />
            <span>CONFIRMED – WAITING FOR MAID ASSIGNMENT</span>
          </div>
        )}

        {booking.bookingStatus === 'PAYMENT_PENDING_VERIFICATION' && booking.paymentUpiRef && (
          <div className="p-3 bg-slate-50 rounded-xl text-xs text-slate-600 flex items-center justify-center gap-2 border border-slate-200 font-mono">
            <span>Submitted UPI UTR:</span>
            <strong className="text-slate-900">{booking.paymentUpiRef}</strong>
          </div>
        )}

        <p className="text-[11px] text-slate-500">
          {booking.bookingStatus === 'PAYMENT_PENDING_VERIFICATION'
            ? 'Once admin cross-references your 12-digit UTR with our bank records, your booking will become active and helper details will be provided.'
            : 'Customers never select their own maid. HomeMate guarantees a verified, police-cleared professional will be assigned and notified prior to arrival.'}
        </p>
      </div>

      {/* Booking Details Card */}
      <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs space-y-4 text-xs">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <div className="text-[11px] font-semibold text-slate-500">Booking Reference</div>
            <div className="font-mono font-bold text-base text-slate-900">{booking.bookingId}</div>
          </div>
          <div className="text-right">
            <div className="text-[11px] font-semibold text-slate-500">Service</div>
            <div className="font-bold text-sm text-indigo-700">{booking.serviceName}</div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 py-1">
          <div className="flex items-start gap-2.5">
            <Calendar className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
            <div>
              <div className="font-bold text-slate-700">Service Date</div>
              <div className="text-slate-900 font-semibold">{booking.bookingDate}</div>
            </div>
          </div>

          <div className="flex items-start gap-2.5">
            <Clock className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
            <div>
              <div className="font-bold text-slate-700">Preferred Slot</div>
              <div className="text-slate-900 font-semibold">{booking.bookingTime}</div>
            </div>
          </div>
        </div>

        <div className="flex items-start gap-2.5 py-1">
          <MapPin className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          <div>
            <div className="font-bold text-slate-700">Service Address</div>
            <div className="text-slate-800 leading-normal">{booking.location.fullAddress}</div>
          </div>
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-slate-100">
          <div>
            <div className="font-bold text-slate-700">Payment Method</div>
            <div className="text-slate-600">
              {booking.paymentMethod === 'UPI' ? 'UPI Transfer' : 'Pay After Maid Arrives'}
            </div>
          </div>
          <div className="text-right">
            <div className="font-bold text-slate-700">Amount</div>
            <div className="font-mono font-black text-lg text-slate-900">₹{booking.amount}</div>
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <button
          onClick={onViewMyBookings}
          className="py-3.5 px-6 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md shadow-indigo-600/20 flex items-center justify-center gap-2 transition-all"
        >
          <FileText className="w-4 h-4" />
          <span>Track in My Bookings</span>
        </button>

        <button
          onClick={onGoHome}
          className="py-3.5 px-6 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-sm flex items-center justify-center gap-2 transition-all"
        >
          <Home className="w-4 h-4" />
          <span>Back to Home</span>
        </button>
      </div>
    </div>
  );
};
