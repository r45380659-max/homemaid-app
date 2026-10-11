import React, { useState, useEffect } from 'react';
import { Maid } from '../../types';
import { storage } from '../../services/storage';
import {
  Users,
  Plus,
  Search,
  Phone,
  MapPin,
  CheckCircle2,
  XCircle,
  Edit2,
  UserCheck,
  Star,
  RefreshCw,
} from 'lucide-react';

export const ManageMaids: React.FC = () => {
  const [maids, setMaids] = useState<Maid[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [editingMaid, setEditingMaid] = useState<Maid | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form states
  const [name, setName] = useState('');
  const [maidId, setMaidId] = useState('');
  const [phone, setPhone] = useState('');
  const [area, setArea] = useState('Katara Hills');
  const [city, setCity] = useState('Bhopal');
  const [skillsStr, setSkillsStr] = useState('House Cleaning, Laundry');
  const [isAvailable, setIsAvailable] = useState(true);
  const [isActive, setIsActive] = useState(true);

  const loadMaids = async () => {
    setLoading(true);
    const res = await storage.getMaids();
    setMaids(res);
    setLoading(false);
  };

  useEffect(() => {
    loadMaids();
  }, []);

  const openAddModal = () => {
    setEditingMaid(null);
    setName('');
    setMaidId(`HM-M-${Math.floor(100 + Math.random() * 900)}`);
    setPhone('+91 ');
    setArea('Katara Hills');
    setCity('Bhopal');
    setSkillsStr('House Cleaning, Laundry');
    setIsAvailable(true);
    setIsActive(true);
    setIsModalOpen(true);
  };

  const openEditModal = (m: Maid) => {
    setEditingMaid(m);
    setName(m.name);
    setMaidId(m.maidId);
    setPhone(m.phone);
    setArea(m.area);
    setCity(m.city);
    setSkillsStr(m.skills.join(', '));
    setIsAvailable(m.isAvailable);
    setIsActive(m.isActive);
    setIsModalOpen(true);
  };

  const handleSaveMaid = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const skillsArray = skillsStr.split(',').map((s) => s.trim()).filter(Boolean);

    const savedMaid: Maid = {
      id: editingMaid ? editingMaid.id : `maid-${Date.now()}`,
      maidId: maidId.trim(),
      name: name.trim(),
      phone: phone.trim(),
      area: area.trim(),
      city: city.trim(),
      skills: skillsArray,
      isAvailable,
      isActive,
      joinedDate: editingMaid ? editingMaid.joinedDate : new Date().toISOString().split('T')[0],
      rating: editingMaid?.rating || 5.0,
      totalJobs: editingMaid?.totalJobs || 0,
    };

    await storage.saveMaid(savedMaid);
    setIsModalOpen(false);
    loadMaids();
  };

  const toggleStatus = async (m: Maid) => {
    const updated = { ...m, isActive: !m.isActive };
    await storage.saveMaid(updated);
    loadMaids();
  };

  const filtered = maids.filter(
    (m) =>
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.maidId.toLowerCase().includes(search.toLowerCase()) ||
      m.area.toLowerCase().includes(search.toLowerCase()) ||
      m.phone.includes(search)
  );

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            Manage Maids & Specialists
          </h2>
          <p className="text-xs text-slate-500 font-medium">
            Accredited service roster (Admin Only — Hidden from customers until assigned)
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="flex items-center gap-1.5 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-600/20 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Maid</span>
        </button>
      </div>

      {/* Search bar */}
      <div className="relative">
        <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search maids by name, internal Maid ID, area, or phone..."
          className="w-full pl-9 pr-4 py-2.5 bg-white text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
        />
      </div>

      {/* Maids Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((m) => (
          <div
            key={m.id}
            className={`p-5 rounded-3xl border transition-all ${
              m.isActive
                ? 'bg-white border-slate-200 shadow-2xs hover:shadow-md'
                : 'bg-slate-50 border-slate-200 opacity-60'
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold text-lg">
                  {m.name.charAt(0)}
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">{m.name}</h3>
                  <span className="font-mono text-[11px] text-slate-500 font-semibold">
                    {m.maidId}
                  </span>
                </div>
              </div>

              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                  m.isActive
                    ? m.isAvailable
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-amber-100 text-amber-800'
                    : 'bg-rose-100 text-rose-800'
                }`}
              >
                {m.isActive ? (m.isAvailable ? 'Available' : 'Busy') : 'Deactivated'}
              </span>
            </div>

            <div className="mt-4 space-y-1.5 text-xs text-slate-600">
              <div className="flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-slate-400" />
                <span className="font-mono">{m.phone}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                <span>{m.area}, {m.city}</span>
              </div>
              <div className="pt-1">
                <span className="text-[11px] font-semibold text-slate-400">Skills: </span>
                <span className="text-slate-800 font-medium">{m.skills.join(', ')}</span>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
              <button
                onClick={() => openEditModal(m)}
                className="font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span>Edit Profile</span>
              </button>

              <button
                onClick={() => toggleStatus(m)}
                className={`font-bold text-[11px] ${
                  m.isActive ? 'text-rose-600 hover:text-rose-800' : 'text-emerald-600 hover:text-emerald-800'
                }`}
              >
                {m.isActive ? 'Deactivate' : 'Reactivate'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-3xl p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-slate-900">
              {editingMaid ? 'Edit Maid Profile' : 'Add New Maid'}
            </h3>

            <form onSubmit={handleSaveMaid} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Sunita Sharma"
                  className="w-full p-2.5 bg-slate-50 text-xs rounded-xl border border-slate-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Internal Maid ID *</label>
                  <input
                    type="text"
                    required
                    value={maidId}
                    onChange={(e) => setMaidId(e.target.value)}
                    placeholder="e.g. HM-M-104"
                    className="w-full p-2.5 bg-slate-50 text-xs rounded-xl border border-slate-200 font-mono"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Phone Number *</label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full p-2.5 bg-slate-50 text-xs rounded-xl border border-slate-200 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Operating Area</label>
                  <select
                    value={area}
                    onChange={(e) => setArea(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 text-xs rounded-xl border border-slate-200 font-semibold"
                  >
                    <option value="Katara Hills">Katara Hills</option>
                    <option value="Bangrasia">Bangrasia</option>
                    <option value="Bagsewaniya">Bagsewaniya</option>
                    <option value="Bhopal">Bhopal</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">City</label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 text-xs rounded-xl border border-slate-200 font-semibold"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Skills (comma separated)
                </label>
                <input
                  type="text"
                  value={skillsStr}
                  onChange={(e) => setSkillsStr(e.target.value)}
                  placeholder="House Cleaning, Laundry, Baby Sitting"
                  className="w-full p-2.5 bg-slate-50 text-xs rounded-xl border border-slate-200"
                />
              </div>

              <div className="flex items-center gap-6 pt-2">
                <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-800">
                  <input
                    type="checkbox"
                    checked={isAvailable}
                    onChange={(e) => setIsAvailable(e.target.checked)}
                    className="w-4 h-4 rounded text-indigo-600"
                  />
                  <span>Currently Available</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-800">
                  <input
                    type="checkbox"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="w-4 h-4 rounded text-indigo-600"
                  />
                  <span>Active Profile</span>
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold"
                >
                  Save Maid
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
