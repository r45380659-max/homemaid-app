import React, { useState } from 'react';
import { Booking } from '../../types';
import { storage } from '../../services/storage';
import {
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  UserCheck,
  CreditCard,
  AlertTriangle,
  PhoneCall,
  CheckCircle2,
  XCircle,
  ShieldAlert,
} from 'lucide-react';

interface BookingDetailsProps {
  booking: Booking;
  onBack: () => void;
  onUpdate: (updated: Booking) => void;
}

export const BookingDetails: React.FC<BookingDetailsProps> = ({
  booking,
  onBack,
  onUpdate,
}) => {
  const [isCancelling, setIsCancelling] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const canCustomerCancel =
    ['CONFIRMED', 'WAITING_FOR_MAID_ASSIGNMENT'].includes(booking.bookingStatus);

  const handleCancelBooking = async () => {
    if (!cancelReason.trim()) {
      setErrorMsg('Please specify a reason for cancellation.');
      return;
    }

    const updated = await storage.updateBooking(booking.id, {
      bookingStatus: 'CANCELLED_BY_CUSTOMER',
      cancellationReason: cancelReason.trim(),
      cancelledBy: 'CUSTOMER',
      paymentStatus:
        booking.paymentStatus === 'PAID' || booking.paymentStatus === 'VERIFIED'
          ? 'REFUND_REQUIRED'
          : booking.paymentStatus,
    });

    if (updated) {
      onUpdate(updated);
      setIsCancelling(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-20">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white border border-slate-200 px-3 py-1.5 rounded-xl shadow-2xs transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Bookings</span>
        </button>

        <span className="font-mono text-xs font-bold text-slate-500">
          Ref: {booking.bookingId}
        </span>
      </div>

      {/* Main Status Hero */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-100 shadow-xs space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">
              {booking.serviceName}
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-0.5">
              Service Request Details
            </h2>
          </div>

          <div className="text-right">
            <div className="text-xl sm:text-2xl font-black text-slate-900">
              ₹{booking.amount}
            </div>
            <span className="text-[11px] text-slate-400 font-semibold">Captured Price</span>
          </div>
        </div>

        {/* Status Callout */}
        {(booking.bookingStatus === 'CANCELLED_BY_HOMEMAID' || booking.bookingStatus === 'CANCELLED_BY_HOMEMATE') && (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-300 text-rose-950 space-y-2">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-rose-700" />
              <span className="font-black text-sm tracking-wide text-rose-800">
                CANCELLED BY HOMEMAID
              </span>
            </div>
            <div className="text-xs space-y-1">
              <p className="font-semibold text-rose-900">Apology from Homemaid:</p>
              <p className="leading-relaxed">
                {booking.cancellationReason ||
                  'We sincerely apologize, but no verified maid was available for your area and preferred time slot.'}
              </p>
              {booking.paymentStatus === 'REFUND_REQUIRED' && (
                <div className="pt-2 text-rose-800 font-bold">
                  Payment Status: REFUND REQUIRED. Manual refund has been queued with our accounts team.
                </div>
              )}
            </div>
          </div>
        )}

        {booking.bookingStatus === 'WAITING_FOR_MAID_ASSIGNMENT' ||
        booking.bookingStatus === 'CONFIRMED' ? (
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-950 flex items-start gap-3">
            <Clock className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="text-xs">
              <div className="font-bold text-sm">
                CONFIRMED – WAITING FOR MAID ASSIGNMENT
              </div>
              <p className="mt-0.5 text-slate-600">
                Our supervisor will match and dispatch an accredited service specialist. Helper details will update here once assigned.
              </p>
            </div>
          </div>
        ) : null}

        {/* Assigned Maid card (ONLY when admin assigns) */}
        {booking.assignedMaidName ? (
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-950 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-bold text-sm text-emerald-800">
                <UserCheck className="w-5 h-5 text-emerald-600" />
                <span>Assigned Maid: {booking.assignedMaidName}</span>
              </div>
              <span className="px-2 py-0.5 text-[10px] font-bold uppercase bg-emerald-200/80 text-emerald-800 rounded">
                Verified Helper
              </span>
            </div>
            {booking.assignedMaidPhone && (
              <div className="text-xs text-emerald-900 flex items-center gap-2">
                <span>Phone:</span>
                <a
                  href={`tel:${booking.assignedMaidPhone}`}
                  className="font-mono font-bold text-indigo-700 underline flex items-center gap-1"
                >
                  <PhoneCall className="w-3.5 h-3.5" />
                  <span>{booking.assignedMaidPhone}</span>
                </a>
              </div>
            )}
          </div>
        ) : (
          !booking.bookingStatus.startsWith('CANCELLED') && (
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 text-xs text-slate-500">
              Helper Assignment: <span className="font-semibold text-slate-700">Pending Homemaid Dispatch</span>
            </div>
          )
        )}
      </div>

      {/* Breakdown Details */}
      <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs space-y-4 text-xs">
        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
          Service Configuration & Items
        </h3>

        {/* Laundry Items breakdown */}
        {booking.laundryItems && booking.laundryItems.length > 0 && (
          <div className="space-y-2">
            <div className="font-bold text-slate-700">Selected Laundry Items:</div>
            <div className="divide-y divide-slate-100 border border-slate-100 rounded-2xl p-2 bg-slate-50/50">
              {booking.laundryItems.map((item) => (
                <div key={item.id} className="py-2 px-2 flex justify-between items-center">
                  <span>{item.name} × {item.quantity}</span>
                  <span className="font-bold text-slate-900">₹{item.pricePerItem * item.quantity}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* House cleaning breakdown */}
        {booking.houseCleaning && (
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
            <div className="font-bold text-slate-800">Cleaning Type: {booking.houseCleaning.cleaningType.toUpperCase()}</div>
            {booking.houseCleaning.simpleRooms > 0 && <div>Simple Cleaning: {booking.houseCleaning.simpleRooms} room(s)</div>}
            {booking.houseCleaning.deepRooms > 0 && <div>Deep Cleaning: {booking.houseCleaning.deepRooms} room(s)</div>}
            {booking.houseCleaning.bathrooms > 0 && <div>Bathroom Cleaning: {booking.houseCleaning.bathrooms} bathroom(s)</div>}
          </div>
        )}

        {/* Baby Sitting */}
        {booking.babySitting && (
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
            <div>Number of babies: <strong>{booking.babySitting.babyCount}</strong></div>
            <div>Duration: <strong>{booking.babySitting.hours} hours</strong></div>
          </div>
        )}

        {/* Elderly Care */}
        {booking.elderlyCare && (
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
            <div>Number of elders: <strong>{booking.elderlyCare.elderCount}</strong></div>
            <div>Duration: <strong>{booking.elderlyCare.hours} hours</strong></div>
          </div>
        )}

        {/* Water Tank */}
        {booking.waterTank && (
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
            <div>Tank Capacity: <strong>{booking.waterTank.tankCapacity.toLocaleString()} Litres</strong></div>
            <div>Number of Tanks: <strong>{booking.waterTank.tankCount}</strong></div>
            <div className="text-[11px] text-slate-500">Rate: ₹600 per 1,000L per tank</div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4 pt-3 border-t border-slate-100">
          <div>
            <span className="font-semibold text-slate-500">Schedule:</span>
            <div className="font-bold text-slate-900 mt-0.5">
              {booking.bookingDate} • {booking.bookingTime}
            </div>
          </div>

          <div>
            <span className="font-semibold text-slate-500">Payment:</span>
            <div className="font-bold text-slate-900 mt-0.5">
              {booking.paymentMethod === 'UPI' ? 'UPI Transfer' : 'Pay After Maid Arrives'}
            </div>
          </div>
        </div>

        <div className="pt-2">
          <span className="font-semibold text-slate-500">Destination Address:</span>
          <div className="font-bold text-slate-900 mt-0.5">
            {booking.location.fullAddress}
          </div>
        </div>
      </div>

      {/* Cancellation section */}
      {canCustomerCancel && (
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs space-y-3">
          <h3 className="text-sm font-bold text-slate-900">Need to cancel this booking?</h3>
          {!isCancelling ? (
            <button
              onClick={() => setIsCancelling(true)}
              className="text-xs font-bold text-rose-600 hover:text-rose-800 underline"
            >
              Cancel My Booking
            </button>
          ) : (
            <div className="space-y-3 pt-2">
              <label className="block text-xs font-bold text-slate-700">
                Reason for cancellation:
              </label>
              <textarea
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="e.g. Plans changed, rescheduling, etc."
                rows={2}
                className="w-full p-2.5 text-xs bg-slate-50 rounded-xl border border-slate-200"
              />
              {errorMsg && <div className="text-xs text-rose-600">{errorMsg}</div>}

              <div className="flex gap-2">
                <button
                  onClick={handleCancelBooking}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl"
                >
                  Confirm Cancellation
                </button>
                <button
                  onClick={() => setIsCancelling(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 text-xs font-bold rounded-xl"
                >
                  Dismiss
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
