import React, { useEffect, useState } from 'react';
import { Booking } from '../../types';
import { storage } from '../../services/storage';
import {
  CalendarCheck2,
  Clock,
  UserCheck,
  CheckCircle2,
  XCircle,
  CreditCard,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Users,
  FileText,
  DollarSign,
  Settings,
} from 'lucide-react';

interface AdminDashboardProps {
  onNavigateSection: (section: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onNavigateSection }) => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    storage.getBookings().then((res) => {
      setBookings(res);
      setLoading(false);
    });
  }, []);

  // Compute exact metrics required by Section 12:
  // - Total bookings
  // - Pending, confirmed, assigned, completed and cancelled bookings
  // - Payments received
  // - Pending payments
  // - Verified payments
  // - Refund required
  // - Refunded amounts
  const totalBookings = bookings.length;
  const waitingAssignment = bookings.filter((b) => b.bookingStatus === 'WAITING_FOR_MAID_ASSIGNMENT' || b.bookingStatus === 'CONFIRMED').length;
  const assignedCount = bookings.filter((b) => b.bookingStatus === 'MAID_ASSIGNED').length;
  const inProgressCount = bookings.filter((b) => b.bookingStatus === 'IN_PROGRESS').length;
  const completedCount = bookings.filter((b) => b.bookingStatus === 'COMPLETED').length;
  const cancelledCount = bookings.filter(
    (b) => b.bookingStatus === 'CANCELLED_BY_CUSTOMER' || b.bookingStatus === 'CANCELLED_BY_HOMEMATE'
  ).length;

  // Payments metrics
  const paymentsReceived = bookings
    .filter((b) => b.paymentStatus === 'PAID' || b.paymentStatus === 'VERIFIED')
    .reduce((sum, b) => sum + b.amount, 0);

  const pendingPayments = bookings
    .filter((b) => b.paymentStatus === 'PENDING' || b.paymentStatus === 'PAY_AFTER_SERVICE_PENDING')
    .reduce((sum, b) => sum + b.amount, 0);

  const verifiedPayments = bookings
    .filter((b) => b.paymentStatus === 'VERIFIED')
    .reduce((sum, b) => sum + b.amount, 0);

  const refundRequired = bookings
    .filter((b) => b.paymentStatus === 'REFUND_REQUIRED')
    .reduce((sum, b) => sum + b.amount, 0);

  const refundedAmounts = bookings
    .filter((b) => b.paymentStatus === 'REFUNDED')
    .reduce((sum, b) => sum + b.amount, 0);

  return (
    <div className="space-y-6 sm:space-y-8 pb-20">
      {/* Top Welcome */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-amber-400 bg-amber-400/10 px-2.5 py-0.5 rounded-md border border-amber-400/20">
            Operations Command Center
          </span>
          <h2 className="text-2xl sm:text-3xl font-black mt-2 tracking-tight">
            Homemaid Admin Dashboard
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Real-time bookings, helper dispatches, verification logs, and financial reconciliations.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigateSection('manage_bookings')}
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md transition-colors"
          >
            Manage Bookings
          </button>
        </div>
      </div>

      {/* Booking Status Metrics */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
          Bookings Performance
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total</div>
            <div className="text-2xl font-black text-slate-900 mt-1">{totalBookings}</div>
            <div className="text-[11px] text-slate-500 mt-0.5">All time requests</div>
          </div>

          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 shadow-2xs">
            <div className="text-[11px] font-bold text-amber-800 uppercase tracking-wider">Waiting Maid</div>
            <div className="text-2xl font-black text-amber-950 mt-1">{waitingAssignment}</div>
            <div className="text-[11px] text-amber-700 mt-0.5">Needs assignment</div>
          </div>

          <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200 shadow-2xs">
            <div className="text-[11px] font-bold text-blue-800 uppercase tracking-wider">Maid Assigned</div>
            <div className="text-2xl font-black text-blue-950 mt-1">{assignedCount}</div>
            <div className="text-[11px] text-blue-700 mt-0.5">Ready for arrival</div>
          </div>

          <div className="p-4 rounded-2xl bg-purple-50 border border-purple-200 shadow-2xs">
            <div className="text-[11px] font-bold text-purple-800 uppercase tracking-wider">In Progress</div>
            <div className="text-2xl font-black text-purple-950 mt-1">{inProgressCount}</div>
            <div className="text-[11px] text-purple-700 mt-0.5">Active on-site</div>
          </div>

          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 shadow-2xs">
            <div className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider">Completed</div>
            <div className="text-2xl font-black text-emerald-950 mt-1">{completedCount}</div>
            <div className="text-[11px] text-emerald-700 mt-0.5">Satisfied service</div>
          </div>

          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 shadow-2xs">
            <div className="text-[11px] font-bold text-rose-800 uppercase tracking-wider">Cancelled</div>
            <div className="text-2xl font-black text-rose-950 mt-1">{cancelledCount}</div>
            <div className="text-[11px] text-rose-700 mt-0.5">Customer / Admin</div>
          </div>
        </div>
      </div>

      {/* Financial Breakdown Metrics */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
          Payment Financial Ledger
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-1">
            <div className="flex items-center gap-1.5 text-slate-500 font-bold text-xs">
              <TrendingUp className="w-4 h-4 text-emerald-600" />
              <span>Payments Received</span>
            </div>
            <div className="text-xl sm:text-2xl font-black text-slate-900">₹{paymentsReceived}</div>
            <p className="text-[11px] text-slate-400">Total gross receipts</p>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-1">
            <div className="flex items-center gap-1.5 text-slate-500 font-bold text-xs">
              <Clock className="w-4 h-4 text-amber-500" />
              <span>Pending Payments</span>
            </div>
            <div className="text-xl sm:text-2xl font-black text-amber-900">₹{pendingPayments}</div>
            <p className="text-[11px] text-slate-400">UPI & Pay After Service</p>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-1">
            <div className="flex items-center gap-1.5 text-slate-500 font-bold text-xs">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Verified Payments</span>
            </div>
            <div className="text-xl sm:text-2xl font-black text-emerald-700">₹{verifiedPayments}</div>
            <p className="text-[11px] text-slate-400">Reconciled with bank UTR</p>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-1">
            <div className="flex items-center gap-1.5 text-slate-500 font-bold text-xs">
              <AlertTriangle className="w-4 h-4 text-rose-500" />
              <span>Refund Required</span>
            </div>
            <div className="text-xl sm:text-2xl font-black text-rose-700">₹{refundRequired}</div>
            <p className="text-[11px] text-slate-400">Requires manual refund</p>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-1">
            <div className="flex items-center gap-1.5 text-slate-500 font-bold text-xs">
              <RotateCcw className="w-4 h-4 text-slate-500" />
              <span>Refunded Amounts</span>
            </div>
            <div className="text-xl sm:text-2xl font-black text-slate-600">₹{refundedAmounts}</div>
            <p className="text-[11px] text-slate-400">Settled refunds</p>
          </div>
        </div>
      </div>

      {/* Admin Modules Quick Launch */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
          Operations Management Modules
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <button
            onClick={() => onNavigateSection('manage_bookings')}
            className="p-5 rounded-3xl bg-white border border-slate-200 hover:border-indigo-400 shadow-2xs hover:shadow-md transition-all text-left flex items-start justify-between group"
          >
            <div>
              <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:scale-105 transition-transform mb-3">
                <CalendarCheck2 className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-base text-slate-900">Manage Bookings</h4>
              <p className="text-xs text-slate-500 mt-1">
                Assign maids, change statuses, verify payments, cancel with reasons.
              </p>
            </div>
            <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all" />
          </button>

          <button
            onClick={() => onNavigateSection('manage_maids')}
            className="p-5 rounded-3xl bg-white border border-slate-200 hover:border-indigo-400 shadow-2xs hover:shadow-md transition-all text-left flex items-start justify-between group"
          >
            <div>
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-105 transition-transform mb-3">
                <Users className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-base text-slate-900">Manage Maids</h4>
              <p className="text-xs text-slate-500 mt-1">
                Maid roster, internal IDs, skills, availability, and area assignments.
              </p>
            </div>
            <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all" />
          </button>

          <button
            onClick={() => onNavigateSection('manage_applications')}
            className="p-5 rounded-3xl bg-white border border-slate-200 hover:border-indigo-400 shadow-2xs hover:shadow-md transition-all text-left flex items-start justify-between group"
          >
            <div>
              <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center group-hover:scale-105 transition-transform mb-3">
                <FileText className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-base text-slate-900">Maid Applications</h4>
              <p className="text-xs text-slate-500 mt-1">
                Review public job applicants and convert approved candidates into maids.
              </p>
            </div>
            <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all" />
          </button>

          <button
            onClick={() => onNavigateSection('manage_services')}
            className="p-5 rounded-3xl bg-white border border-slate-200 hover:border-indigo-400 shadow-2xs hover:shadow-md transition-all text-left flex items-start justify-between group"
          >
            <div>
              <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center group-hover:scale-105 transition-transform mb-3">
                <Sparkles className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-base text-slate-900">Manage Services</h4>
              <p className="text-xs text-slate-500 mt-1">
                Enable/disable services, edit descriptions, add custom home services.
              </p>
            </div>
            <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all" />
          </button>

          <button
            onClick={() => onNavigateSection('manage_prices')}
            className="p-5 rounded-3xl bg-white border border-slate-200 hover:border-indigo-400 shadow-2xs hover:shadow-md transition-all text-left flex items-start justify-between group"
          >
            <div>
              <div className="w-10 h-10 rounded-xl bg-cyan-50 text-cyan-600 flex items-center justify-center group-hover:scale-105 transition-transform mb-3">
                <DollarSign className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-base text-slate-900">Manage Prices</h4>
              <p className="text-xs text-slate-500 mt-1">
                Configure laundry per-item rates, room cleaning, babysitting, water tank.
              </p>
            </div>
            <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all" />
          </button>

          <button
            onClick={() => onNavigateSection('admin_settings')}
            className="p-5 rounded-3xl bg-white border border-slate-200 hover:border-indigo-400 shadow-2xs hover:shadow-md transition-all text-left flex items-start justify-between group"
          >
            <div>
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-105 transition-transform mb-3">
                <Settings className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-base text-slate-900">Admin Settings</h4>
              <p className="text-xs text-slate-500 mt-1">
                UPI details, customer care phone, operational hours, service areas.
              </p>
            </div>
            <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all" />
          </button>
        </div>
      </div>
    </div>
  );
};
