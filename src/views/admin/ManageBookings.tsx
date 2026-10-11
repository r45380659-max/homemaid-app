import React, { useState, useEffect } from 'react';
import { Booking, Maid, BookingStatus, PaymentStatus } from '../../types';
import { storage } from '../../services/storage';
import {
  CalendarCheck2,
  Search,
  Filter,
  UserCheck,
  Clock,
  Phone,
  MapPin,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RotateCcw,
  CreditCard,
  ChevronDown,
  Edit3,
  RefreshCw,
  ExternalLink,
} from 'lucide-react';

export const ManageBookings: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [maids, setMaids] = useState<Maid[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [cancelReasonText, setCancelReasonText] = useState('');

  const loadData = async () => {
    setLoading(true);
    const [bRes, mRes] = await Promise.all([
      storage.getBookings(),
      storage.getMaids(),
    ]);
    setBookings(bRes);
    setMaids(mRes);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleUpdateStatus = async (bookingId: string, newStatus: BookingStatus) => {
    const updated = await storage.updateBooking(bookingId, { bookingStatus: newStatus });
    if (updated) {
      setBookings((prev) => prev.map((b) => (b.id === bookingId ? updated : b)));
      if (selectedBooking?.id === bookingId) setSelectedBooking(updated);
    }
  };

  const handleUpdatePaymentStatus = async (bookingId: string, newStatus: PaymentStatus) => {
    const updated = await storage.updateBooking(bookingId, { paymentStatus: newStatus });
    if (updated) {
      setBookings((prev) => prev.map((b) => (b.id === bookingId ? updated : b)));
      if (selectedBooking?.id === bookingId) setSelectedBooking(updated);
    }
  };

  const handleAssignMaid = async (bookingId: string, maid: Maid) => {
    const updated = await storage.updateBooking(bookingId, {
      assignedMaidId: maid.id,
      assignedMaidName: maid.name,
      assignedMaidPhone: maid.phone,
      bookingStatus: 'MAID_ASSIGNED',
    });
    if (updated) {
      setBookings((prev) => prev.map((b) => (b.id === bookingId ? updated : b)));
      if (selectedBooking?.id === bookingId) setSelectedBooking(updated);
      setIsAssignModalOpen(false);
    }
  };

  const handleCancelBooking = async () => {
    if (!selectedBooking) return;
    const reason = cancelReasonText.trim() || 'No maid currently available in this service area for the requested slot.';
    const isPaid = selectedBooking.paymentStatus === 'PAID' || selectedBooking.paymentStatus === 'VERIFIED';

    const updated = await storage.updateBooking(selectedBooking.id, {
      bookingStatus: 'CANCELLED_BY_HOMEMATE',
      cancellationReason: reason,
      cancelledBy: 'HOMEMATE',
      paymentStatus: isPaid ? 'REFUND_REQUIRED' : selectedBooking.paymentStatus,
    });

    if (updated) {
      setBookings((prev) => prev.map((b) => (b.id === selectedBooking.id ? updated : b)));
      setSelectedBooking(updated);
      setIsCancelModalOpen(false);
      setCancelReasonText('');
    }
  };

  const handleReopenBooking = async (bookingId: string) => {
    const updated = await storage.updateBooking(bookingId, {
      bookingStatus: 'WAITING_FOR_MAID_ASSIGNMENT',
      cancellationReason: null,
      cancelledBy: null,
    });
    if (updated) {
      setBookings((prev) => prev.map((b) => (b.id === bookingId ? updated : b)));
      if (selectedBooking?.id === bookingId) setSelectedBooking(updated);
    }
  };

  const filtered = bookings.filter((b) => {
    const matchesSearch =
      b.bookingId.toLowerCase().includes(search.toLowerCase()) ||
      b.serviceName.toLowerCase().includes(search.toLowerCase()) ||
      b.customerName?.toLowerCase().includes(search.toLowerCase()) ||
      b.customerPhone?.includes(search) ||
      b.location.fullAddress.toLowerCase().includes(search.toLowerCase());

    if (!matchesSearch) return false;
    if (statusFilter === 'ALL') return true;
    return b.bookingStatus === statusFilter;
  });

  return (
    <div className="space-y-6 pb-20">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            Manage Bookings
          </h2>
          <p className="text-xs text-slate-500 font-medium">
            Review requests, assign accredited maids, update statuses & verify payments
          </p>
        </div>

        <button
          onClick={loadData}
          className="flex items-center gap-1.5 px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Filter and search */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by Booking Ref, Service, Customer Phone, Address..."
            className="w-full pl-9 pr-4 py-2.5 bg-white text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="p-2.5 bg-white text-xs font-semibold rounded-xl border border-slate-200 focus:outline-none"
        >
          <option value="ALL">All Statuses</option>
          <option value="WAITING_FOR_MAID_ASSIGNMENT">Waiting Maid Assignment</option>
          <option value="MAID_ASSIGNED">Maid Assigned</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="COMPLETED">Completed</option>
          <option value="CANCELLED_BY_HOMEMATE">Cancelled by Homemaid</option>
          <option value="CANCELLED_BY_CUSTOMER">Cancelled by Customer</option>
        </select>
      </div>

      {/* Bookings Table / List */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-xs text-slate-500">Loading bookings...</div>
        ) : filtered.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-500">No bookings match the criteria.</div>
        ) : (
          <div className="overflow-x-auto divide-y divide-slate-100">
            {filtered.map((b) => (
              <div
                key={b.id}
                className="p-4 sm:p-5 hover:bg-slate-50/80 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                {/* Details */}
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono font-bold text-xs text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
                      {b.bookingId}
                    </span>
                    <span className="font-bold text-sm text-slate-900">{b.serviceName}</span>

                    {/* Status Pill */}
                    <span
                      className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                        b.bookingStatus === 'COMPLETED'
                          ? 'bg-emerald-100 text-emerald-800'
                          : b.bookingStatus.startsWith('CANCELLED')
                          ? 'bg-rose-100 text-rose-800'
                          : b.bookingStatus === 'MAID_ASSIGNED'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {b.bookingStatus.replace(/_/g, ' ')}
                    </span>
                  </div>

                  <div className="text-xs text-slate-600 flex flex-wrap items-center gap-x-4 gap-y-1">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>{b.bookingDate} at {b.bookingTime}</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      <span className="truncate max-w-xs">{b.location.area}, {b.location.city}</span>
                    </span>
                    <span className="font-mono text-slate-500">{b.customerPhone}</span>
                  </div>

                  {b.assignedMaidName && (
                    <div className="text-xs text-emerald-800 font-semibold flex items-center gap-1.5">
                      <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Assigned Maid: {b.assignedMaidName} ({b.assignedMaidPhone})</span>
                    </div>
                  )}

                  {b.cancellationReason && (
                    <div className="text-xs text-rose-700 italic">
                      Reason: "{b.cancellationReason}"
                    </div>
                  )}
                </div>

                {/* Amount & Actions */}
                <div className="flex items-center justify-between md:justify-end gap-3 shrink-0">
                  <div className="text-left md:text-right">
                    <div className="text-base font-black text-slate-900">₹{b.amount}</div>
                    <div className="text-[11px] font-bold text-slate-500">
                      {b.paymentStatus}
                    </div>
                  </div>

                  <button
                    onClick={() => setSelectedBooking(b)}
                    className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors"
                  >
                    Action & Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Booking Action Modal */}
      {selectedBooking && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
          <div className="bg-white w-full max-w-xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <span className="text-[11px] font-mono font-bold text-indigo-700">
                  {selectedBooking.bookingId}
                </span>
                <h3 className="text-lg font-bold text-slate-900">
                  {selectedBooking.serviceName}
                </h3>
              </div>
              <button
                onClick={() => setSelectedBooking(null)}
                className="text-slate-400 hover:text-slate-700 p-1"
              >
                ✕
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-5 text-xs text-slate-700">
              {/* Customer & Location */}
              <div className="p-4 bg-slate-50 rounded-2xl space-y-2">
                <div className="font-bold text-slate-800 text-sm">Customer & Location:</div>
                <div>Phone: <strong className="font-mono text-slate-900">{selectedBooking.customerPhone}</strong></div>
                <div>Address: <strong>{selectedBooking.location.fullAddress}</strong></div>
                <div>Schedule: <strong>{selectedBooking.bookingDate} at {selectedBooking.bookingTime}</strong></div>
              </div>

              {/* Status Management */}
              <div className="space-y-2">
                <label className="block font-bold text-slate-800 uppercase tracking-wider text-[11px]">
                  Change Booking Status
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {[
                    'WAITING_FOR_MAID_ASSIGNMENT',
                    'MAID_ASSIGNED',
                    'IN_PROGRESS',
                    'COMPLETED',
                  ].map((st) => (
                    <button
                      key={st}
                      disabled={selectedBooking.bookingStatus.startsWith('CANCELLED')}
                      onClick={() => handleUpdateStatus(selectedBooking.id, st as any)}
                      className={`p-2.5 rounded-xl border font-bold text-[11px] transition-colors ${
                        selectedBooking.bookingStatus === st
                          ? 'border-indigo-600 bg-indigo-50 text-indigo-900'
                          : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      {st.replace(/_/g, ' ')}
                    </button>
                  ))}
                </div>
              </div>

              {/* Maid Assignment Control */}
              <div className="p-4 bg-indigo-50/50 rounded-2xl border border-indigo-100 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800 text-sm">Maid Assignment</span>
                  {selectedBooking.assignedMaidName ? (
                    <span className="text-xs font-bold text-emerald-700">
                      Assigned: {selectedBooking.assignedMaidName}
                    </span>
                  ) : (
                    <span className="text-xs text-amber-700 font-semibold">Unassigned</span>
                  )}
                </div>

                {selectedBooking.bookingStatus.startsWith('CANCELLED') ? (
                  <div className="text-xs text-rose-700 font-semibold">
                    A cancelled booking cannot be assigned unless an admin explicitly reopens it below.
                  </div>
                ) : (
                  <button
                    onClick={() => setIsAssignModalOpen(true)}
                    className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs"
                  >
                    {selectedBooking.assignedMaidName ? 'Reassign Another Maid' : 'Assign Maid from Roster'}
                  </button>
                )}
              </div>

              {/* Payment Verification Control */}
              <div className="p-4 bg-slate-50 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800 text-sm">Payment Status & Verification</span>
                  <span className="font-black text-slate-900">₹{selectedBooking.amount}</span>
                </div>

                {selectedBooking.paymentUpiRef && (
                  <div className="p-2.5 bg-white rounded-xl border border-slate-200 font-mono text-[11px]">
                    Customer Submitted UTR: <strong>{selectedBooking.paymentUpiRef}</strong>
                  </div>
                )}

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {(['PENDING', 'PAID', 'VERIFIED', 'REFUND_REQUIRED', 'REFUNDED'] as const).map((pst) => (
                    <button
                      key={pst}
                      onClick={() => handleUpdatePaymentStatus(selectedBooking.id, pst)}
                      className={`p-2 rounded-xl border text-[11px] font-bold ${
                        selectedBooking.paymentStatus === pst
                          ? 'bg-emerald-600 text-white border-emerald-600'
                          : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      {pst.replace(/_/g, ' ')}
                    </button>
                  ))}
                </div>
              </div>

              {/* Cancellation or Reopening */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                {selectedBooking.bookingStatus.startsWith('CANCELLED') ? (
                  <button
                    onClick={() => handleReopenBooking(selectedBooking.id)}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Reopen This Booking</span>
                  </button>
                ) : (
                  <button
                    onClick={() => setIsCancelModalOpen(true)}
                    className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl"
                  >
                    Cancel / Reject Request
                  </button>
                )}

                <button
                  onClick={() => setSelectedBooking(null)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 text-xs font-bold rounded-xl"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Assign Maid Sub-Modal */}
      {isAssignModalOpen && selectedBooking && (
        <div className="fixed inset-0 z-60 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-3xl p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-slate-900">
              Assign Maid for {selectedBooking.serviceName}
            </h3>
            <p className="text-xs text-slate-500">
              Select an accredited helper available for {selectedBooking.location.area}:
            </p>

            <div className="max-h-60 overflow-y-auto divide-y divide-slate-100">
              {maids.filter((m) => m.isActive).map((maid) => (
                <div
                  key={maid.id}
                  onClick={() => handleAssignMaid(selectedBooking.id, maid)}
                  className="py-3 px-2 hover:bg-slate-50 rounded-xl cursor-pointer flex items-center justify-between"
                >
                  <div>
                    <div className="font-bold text-sm text-slate-900">{maid.name}</div>
                    <div className="text-xs text-slate-500">
                      ID: {maid.maidId} • {maid.area} • Skills: {maid.skills.join(', ')}
                    </div>
                  </div>
                  <span className="text-xs font-bold text-indigo-600">Assign →</span>
                </div>
              ))}
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setIsAssignModalOpen(false)}
                className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-bold"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cancel with Reason Sub-Modal */}
      {isCancelModalOpen && selectedBooking && (
        <div className="fixed inset-0 z-60 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-3xl p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-slate-900 text-rose-700">
              Cancel Booking by Homemaid
            </h3>
            <p className="text-xs text-slate-600">
              Customer will see: <strong>“CANCELLED BY HOMEMAID”</strong> along with your reason and an apology.
            </p>

            <textarea
              value={cancelReasonText}
              onChange={(e) => setCancelReasonText(e.target.value)}
              placeholder="e.g. No verified maid is available in your area for the requested slot."
              rows={3}
              className="w-full p-3 text-xs bg-slate-50 rounded-xl border border-slate-200"
            />

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setIsCancelModalOpen(false)}
                className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-bold"
              >
                Dismiss
              </button>
              <button
                onClick={handleCancelBooking}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold"
              >
                Confirm Cancellation
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
