import React, { useState, useEffect } from 'react';
import { Booking, PaymentStatus } from '../../types';
import { storage } from '../../services/storage';
import {
  CreditCard,
  Search,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Clock,
  Filter,
  RefreshCw,
  ExternalLink,
} from 'lucide-react';

export const ManagePayments: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [paymentFilter, setPaymentFilter] = useState<string>('ALL');

  const loadData = async () => {
    setLoading(true);
    const res = await storage.getBookings();
    setBookings(res);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleUpdateStatus = async (bookingId: string, status: PaymentStatus) => {
    const updated = await storage.updateBooking(bookingId, { paymentStatus: status });
    if (updated) {
      setBookings((prev) => prev.map((b) => (b.id === bookingId ? updated : b)));
    }
  };

  const filtered = bookings.filter((b) => {
    const matches =
      b.bookingId.toLowerCase().includes(search.toLowerCase()) ||
      b.paymentUpiRef?.toLowerCase().includes(search.toLowerCase()) ||
      (b.customerPhone ? b.customerPhone.includes(search) : false) ||
      b.serviceName.toLowerCase().includes(search.toLowerCase());

    if (!matches) return false;
    if (paymentFilter === 'ALL') return true;
    return b.paymentStatus === paymentFilter;
  });

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            Manage Payments & Reconciliations
          </h2>
          <p className="text-xs text-slate-500 font-medium">
            Verify UPI transaction references, monitor pending cash collections, and process manual refunds.
          </p>
        </div>

        <button
          onClick={loadData}
          className="flex items-center gap-1.5 px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by Booking Ref, UPI UTR, Phone number..."
            className="w-full pl-9 pr-4 py-2.5 bg-white text-xs rounded-xl border border-slate-200 focus:outline-none"
          />
        </div>

        <select
          value={paymentFilter}
          onChange={(e) => setPaymentFilter(e.target.value)}
          className="p-2.5 bg-white text-xs font-semibold rounded-xl border border-slate-200"
        >
          <option value="ALL">All Payment Statuses</option>
          <option value="PENDING">Pending Verification</option>
          <option value="PAY_AFTER_SERVICE_PENDING">Pay After Service Pending</option>
          <option value="PAID">Paid (Customer Self-Reported)</option>
          <option value="VERIFIED">Verified (Reconciled with Bank)</option>
          <option value="REFUND_REQUIRED">Refund Required</option>
          <option value="REFUNDED">Refunded</option>
        </select>
      </div>

      {/* Ledger list */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-xs text-slate-500">Loading payment ledger...</div>
        ) : filtered.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-500">No matching payment records found.</div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filtered.map((b) => (
              <div
                key={b.id}
                className="p-4 sm:p-5 hover:bg-slate-50/60 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-xs text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
                      {b.bookingId}
                    </span>
                    <span className="font-bold text-sm text-slate-900">{b.serviceName}</span>
                    <span className="text-xs text-slate-500">({b.paymentMethod})</span>
                  </div>

                  <div className="text-xs text-slate-600 flex flex-wrap items-center gap-x-4 gap-y-1">
                    <span>Customer: <strong className="font-mono text-slate-800">{b.customerPhone}</strong></span>
                    <span>Date: {b.bookingDate}</span>
                    {b.paymentUpiRef && (
                      <span className="font-mono bg-slate-100 px-1.5 py-0.5 rounded text-[11px] font-bold text-slate-800">
                        UTR: {b.paymentUpiRef}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between md:justify-end gap-4 shrink-0">
                  <div className="text-left md:text-right">
                    <div className="text-lg font-black text-slate-900">₹{b.amount}</div>
                    <span
                      className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                        b.paymentStatus === 'VERIFIED'
                          ? 'bg-emerald-100 text-emerald-800'
                          : b.paymentStatus === 'REFUND_REQUIRED'
                          ? 'bg-rose-100 text-rose-800'
                          : b.paymentStatus === 'REFUNDED'
                          ? 'bg-slate-100 text-slate-700'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {b.paymentStatus.replace(/_/g, ' ')}
                    </span>
                  </div>

                  {/* Quick Action buttons */}
                  <div className="flex items-center gap-1.5">
                    {b.paymentStatus !== 'VERIFIED' && (
                      <button
                        onClick={() => handleUpdateStatus(b.id, 'VERIFIED')}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors"
                      >
                        Verify
                      </button>
                    )}

                    {b.paymentStatus === 'REFUND_REQUIRED' && (
                      <button
                        onClick={() => handleUpdateStatus(b.id, 'REFUNDED')}
                        className="px-3 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold transition-colors"
                      >
                        Mark Refunded
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
