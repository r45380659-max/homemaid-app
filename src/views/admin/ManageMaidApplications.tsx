import React, { useState, useEffect } from 'react';
import { MaidApplication, Maid } from '../../types';
import { storage } from '../../services/storage';
import {
  FileText,
  CheckCircle2,
  XCircle,
  Phone,
  MapPin,
  Briefcase,
  UserPlus,
  RefreshCw,
  Search,
} from 'lucide-react';

export const ManageMaidApplications: React.FC = () => {
  const [applications, setApplications] = useState<MaidApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const loadApps = async () => {
    setLoading(true);
    const res = await storage.getMaidApplications();
    setApplications(res);
    setLoading(false);
  };

  useEffect(() => {
    loadApps();
  }, []);

  const handleUpdateStatus = async (id: string, status: 'APPROVED' | 'REJECTED') => {
    await storage.updateMaidApplication(id, {
      status,
      reviewedAt: new Date().toISOString(),
    });
    loadApps();
  };

  const handleConvertToMaid = async (app: MaidApplication) => {
    const newMaid: Maid = {
      id: `maid-${Date.now()}`,
      maidId: `HM-M-${Math.floor(100 + Math.random() * 900)}`,
      name: app.fullName,
      phone: app.phone,
      photoUrl: app.photoUrl,
      skills: app.servicesCanDo,
      area: app.area,
      city: app.city,
      isAvailable: true,
      isActive: true,
      rating: 5.0,
      totalJobs: 0,
      joinedDate: new Date().toISOString().split('T')[0],
    };

    await storage.saveMaid(newMaid);
    await storage.updateMaidApplication(app.id, { status: 'APPROVED', reviewedAt: new Date().toISOString() });
    alert(`Successfully added ${app.fullName} to the Maid Roster with ID: ${newMaid.maidId}!`);
    loadApps();
  };

  const filtered = applications.filter(
    (a) =>
      a.fullName.toLowerCase().includes(search.toLowerCase()) ||
      a.phone.includes(search) ||
      a.area.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            Maid Applications
          </h2>
          <p className="text-xs text-slate-500 font-medium">
            Review public applicant submissions & onboard verified helpers to the roster
          </p>
        </div>

        <button
          onClick={loadApps}
          className="flex items-center gap-1.5 px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search applicants by name, mobile, or area..."
          className="w-full pl-9 pr-4 py-2.5 bg-white text-xs rounded-xl border border-slate-200 focus:outline-none"
        />
      </div>

      {/* Applications List */}
      <div className="space-y-4">
        {loading ? (
          <div className="p-8 text-center text-xs text-slate-500">Loading applications...</div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-3xl p-8 border border-slate-200 text-center text-xs text-slate-500">
            No applicant submissions found.
          </div>
        ) : (
          filtered.map((app) => (
            <div
              key={app.id}
              className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-2xs space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-700 font-bold text-lg flex items-center justify-center">
                    {app.fullName.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-slate-900">{app.fullName}</h3>
                    <div className="text-xs text-slate-500 font-mono flex items-center gap-2">
                      <span>Ref: {app.applicationId}</span>
                      <span>•</span>
                      <span>Applied: {new Date(app.appliedAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                      app.status === 'APPROVED'
                        ? 'bg-emerald-100 text-emerald-800'
                        : app.status === 'REJECTED'
                        ? 'bg-rose-100 text-rose-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {app.status}
                  </span>
                </div>
              </div>

              {/* Applicant details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-600 bg-slate-50 p-4 rounded-2xl">
                <div>
                  <span className="font-bold text-slate-700">Phone: </span>
                  <a href={`tel:${app.phone}`} className="font-mono text-indigo-700 underline font-bold">
                    {app.phone}
                  </a>
                </div>
                <div>
                  <span className="font-bold text-slate-700">Location: </span>
                  <span>{app.area}, {app.city}</span>
                </div>
                <div>
                  <span className="font-bold text-slate-700">Services: </span>
                  <span className="font-medium text-slate-900">{app.servicesCanDo.join(', ')}</span>
                </div>
                <div>
                  <span className="font-bold text-slate-700">Experience: </span>
                  <span>{app.experience || 'Not specified'}</span>
                </div>
              </div>

              {app.description && (
                <div className="text-xs text-slate-600">
                  <span className="font-bold text-slate-700">Applicant Notes: </span>
                  <span>"{app.description}"</span>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100">
                <div className="flex items-center gap-2">
                  {app.status !== 'APPROVED' && (
                    <button
                      onClick={() => handleUpdateStatus(app.id, 'APPROVED')}
                      className="px-3.5 py-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-xl text-xs font-bold transition-colors"
                    >
                      Approve
                    </button>
                  )}
                  {app.status !== 'REJECTED' && (
                    <button
                      onClick={() => handleUpdateStatus(app.id, 'REJECTED')}
                      className="px-3.5 py-1.5 bg-rose-50 text-rose-700 hover:bg-rose-100 rounded-xl text-xs font-bold transition-colors"
                    >
                      Reject
                    </button>
                  )}
                </div>

                <button
                  onClick={() => handleConvertToMaid(app)}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Convert to Active Maid Roster</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
