import React, { useState, useEffect } from 'react';
import { Booking } from '../../types';
import { storage } from '../../services/storage';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../i18n/LanguageContext';
import {
  CalendarCheck2,
  Clock,
  MapPin,
  UserCheck,
  AlertCircle,
  ChevronRight,
  RefreshCw,
  Search,
  Filter,
} from 'lucide-react';

interface MyBookingsProps {
  onSelectBooking: (booking: Booking) => void;
  onBookNew: () => void;
}

export const MyBookings: React.FC<MyBookingsProps> = ({ onSelectBooking, onBookNew }) => {
  const { currentUser } = useAuth();
  const { t } = useLanguage();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'ALL' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED'>('ALL');

  const loadBookings = async () => {
    setLoading(true);
    // If user is logged in, filter by user; otherwise return current device bookings
    const res = await storage.getBookings(currentUser?.uid);
    setBookings(res);
    setLoading(false);
  };

  useEffect(() => {
    loadBookings();
  }, [currentUser]);

  const filteredBookings = bookings.filter((b) => {
    if (filter === 'ACTIVE') {
      return ['CONFIRMED', 'WAITING_FOR_MAID_ASSIGNMENT', 'MAID_ASSIGNED', 'IN_PROGRESS'].includes(
        b.bookingStatus
      );
    }
    if (filter === 'COMPLETED') {
      return b.bookingStatus === 'COMPLETED';
    }
    if (filter === 'CANCELLED') {
      return b.bookingStatus === 'CANCELLED_BY_CUSTOMER' || b.bookingStatus === 'CANCELLED_BY_HOMEMATE';
    }
    return true;
  });

  const getStatusBadge = (b: Booking) => {
    if (b.bookingStatus === 'CANCELLED_BY_HOMEMAID' || b.bookingStatus === 'CANCELLED_BY_HOMEMATE') {
      return (
        <span className="px-3 py-1 rounded-full text-xs font-black bg-rose-100 text-rose-800 border border-rose-200">
          CANCELLED BY HOMEMAID
        </span>
      );
    }
    if (b.bookingStatus === 'CANCELLED_BY_CUSTOMER') {
      return (
        <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200">
          CANCELLED BY YOU
        </span>
      );
    }
    if (b.bookingStatus === 'COMPLETED') {
      return (
        <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
          COMPLETED
        </span>
      );
    }
    if (b.bookingStatus === 'IN_PROGRESS') {
      return (
        <span className="px-3 py-1 rounded-full text-xs font-bold bg-indigo-100 text-indigo-800 border border-indigo-200">
          IN PROGRESS
        </span>
      );
    }
    if (b.bookingStatus === 'MAID_ASSIGNED') {
      return (
        <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-200">
          MAID ASSIGNED
        </span>
      );
    }
    return (
      <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">
        CONFIRMED – WAITING FOR MAID ASSIGNMENT
      </span>
    );
  };

  const getPaymentBadge = (b: Booking) => {
    switch (b.paymentStatus) {
      case 'VERIFIED':
        return <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded text-[11px]">Payment: Verified</span>;
      case 'PAID':
        return <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded text-[11px]">Payment: Paid</span>;
      case 'REFUND_REQUIRED':
        return <span className="text-rose-700 font-bold bg-rose-50 px-2 py-0.5 rounded text-[11px]">Refund Required</span>;
      case 'REFUNDED':
        return <span className="text-slate-600 font-bold bg-slate-100 px-2 py-0.5 rounded text-[11px]">Refunded</span>;
      case 'PAY_AFTER_SERVICE_PENDING':
        return <span className="text-blue-700 font-bold bg-blue-50 px-2 py-0.5 rounded text-[11px]">Pay After Service</span>;
      default:
        return <span className="text-amber-700 font-bold bg-amber-50 px-2 py-0.5 rounded text-[11px]">Verification Pending</span>;
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-20">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            {t('myBookings')}
          </h2>
          <p className="text-xs text-slate-500 font-medium">
            Track real-time status and helper assignments
          </p>
        </div>

        <button
          onClick={loadBookings}
          className="p-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 transition-colors"
          title="Refresh bookings"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 p-1 bg-slate-100 rounded-2xl overflow-x-auto">
        {(['ALL', 'ACTIVE', 'COMPLETED', 'CANCELLED'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              filter === tab
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {tab === 'ALL' ? 'All Bookings' : tab.charAt(0) + tab.slice(1).toLowerCase()}
          </button>
        ))}
      </div>

      {/* Booking List */}
      {loading ? (
        <div className="space-y-4">
          <div className="h-32 bg-slate-100 rounded-3xl animate-pulse" />
          <div className="h-32 bg-slate-100 rounded-3xl animate-pulse" />
        </div>
      ) : filteredBookings.length === 0 ? (
        <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-xs text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
            <CalendarCheck2 className="w-7 h-7" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">No bookings found</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
              You haven't scheduled any home care services in this category yet.
            </p>
          </div>
          <button
            onClick={onBookNew}
            className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md transition-all inline-block"
          >
            Explore Services & Book Now
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredBookings.map((b) => (
            <div
              key={b.id}
              onClick={() => onSelectBooking(b)}
              className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 hover:border-indigo-300 shadow-2xs hover:shadow-md transition-all cursor-pointer space-y-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <span className="text-[11px] font-mono text-slate-400 font-semibold">
                    {b.bookingId}
                  </span>
                  <h3 className="text-lg font-bold text-slate-900 mt-0.5">
                    {b.serviceName}
                  </h3>
                </div>

                <div className="text-right">
                  <div className="text-lg font-black text-slate-900">₹{b.amount}</div>
                  <div className="text-[11px] text-slate-400">Captured Price</div>
                </div>
              </div>

              {/* Status Badge */}
              <div className="flex flex-wrap items-center gap-2">
                {getStatusBadge(b)}
                {getPaymentBadge(b)}
              </div>

              {/* Cancellation Reason if cancelled by Homemaid */}
              {(b.bookingStatus === 'CANCELLED_BY_HOMEMAID' || b.bookingStatus === 'CANCELLED_BY_HOMEMATE') && (
                <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-950 space-y-1">
                  <div className="font-bold flex items-center gap-1.5 text-rose-800">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>Apology from Homemaid:</span>
                  </div>
                  <p>
                    {b.cancellationReason ||
                      'We sincerely apologize, but no verified maid is currently available for your requested time slot.'}
                  </p>
                  {b.paymentStatus === 'PAID' && (
                    <p className="font-semibold text-rose-900 pt-1">
                      Status: Refund Required. Our finance team will manually process your refund.
                    </p>
                  )}
                </div>
              )}

              {/* Assigned Maid info (ONLY shown after admin assignment) */}
              {b.assignedMaidName && (
                <div className="p-3 rounded-2xl bg-emerald-50/70 border border-emerald-100 flex items-center justify-between text-xs text-emerald-950">
                  <div className="flex items-center gap-2">
                    <UserCheck className="w-4 h-4 text-emerald-700" />
                    <span>
                      Assigned Professional: <strong>{b.assignedMaidName}</strong>
                    </span>
                  </div>
                  {b.assignedMaidPhone && (
                    <span className="font-mono text-[11px] text-emerald-800">
                      {b.assignedMaidPhone}
                    </span>
                  )}
                </div>
              )}

              {/* Date & Location */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 text-xs text-slate-500">
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span>{b.bookingDate} at {b.bookingTime}</span>
                </div>

                <div className="flex items-center gap-1 text-indigo-600 font-bold">
                  <span>View Details</span>
                  <ChevronRight className="w-4 h-4" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
