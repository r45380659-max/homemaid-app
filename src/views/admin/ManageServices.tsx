import React, { useState, useEffect } from 'react';
import { ServiceDefinition } from '../../types';
import { storage } from '../../services/storage';
import {
  Sparkles,
  Plus,
  Edit2,
  Trash2,
  Power,
  RefreshCw,
  CheckCircle2,
  XCircle,
} from 'lucide-react';

export const ManageServices: React.FC = () => {
  const [services, setServices] = useState<ServiceDefinition[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingService, setEditingService] = useState<ServiceDefinition | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form states
  const [id, setId] = useState('');
  const [name, setName] = useState('');
  const [tagline, setTagline] = useState('');
  const [description, setDescription] = useState('');
  const [basePriceDescription, setBasePriceDescription] = useState('₹300 / service');
  const [colorName, setColorName] = useState<'purple' | 'green' | 'pink' | 'blue' | 'cyan'>('purple');
  const [isActive, setIsActive] = useState(true);

  const loadServices = async () => {
    setLoading(true);
    const res = await storage.getServices();
    setServices(res);
    setLoading(false);
  };

  useEffect(() => {
    loadServices();
  }, []);

  const openAddModal = () => {
    setEditingService(null);
    setId(`svc-${Date.now()}`);
    setName('');
    setTagline('');
    setDescription('');
    setBasePriceDescription('₹300 / service');
    setColorName('purple');
    setIsActive(true);
    setIsModalOpen(true);
  };

  const openEditModal = (s: ServiceDefinition) => {
    setEditingService(s);
    setId(s.id);
    setName(s.name);
    setTagline(s.tagline);
    setDescription(s.description);
    setBasePriceDescription(s.basePriceDescription);
    setColorName(s.colorName);
    setIsActive(s.isActive);
    setIsModalOpen(true);
  };

  const handleSaveService = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const getColorClasses = (col: string) => {
      switch (col) {
        case 'green':
          return {
            bgClass: 'bg-emerald-50 hover:bg-emerald-100/70',
            borderClass: 'border-emerald-200',
            badgeBg: 'bg-emerald-100 text-emerald-700',
            textClass: 'text-emerald-900',
            accentClass: 'bg-emerald-600',
          };
        case 'pink':
          return {
            bgClass: 'bg-rose-50 hover:bg-rose-100/70',
            borderClass: 'border-rose-200',
            badgeBg: 'bg-rose-100 text-rose-700',
            textClass: 'text-rose-900',
            accentClass: 'bg-rose-600',
          };
        case 'blue':
          return {
            bgClass: 'bg-blue-50 hover:bg-blue-100/70',
            borderClass: 'border-blue-200',
            badgeBg: 'bg-blue-100 text-blue-700',
            textClass: 'text-blue-900',
            accentClass: 'bg-blue-600',
          };
        case 'cyan':
          return {
            bgClass: 'bg-cyan-50 hover:bg-cyan-100/70',
            borderClass: 'border-cyan-200',
            badgeBg: 'bg-cyan-100 text-cyan-700',
            textClass: 'text-cyan-900',
            accentClass: 'bg-cyan-600',
          };
        default:
          return {
            bgClass: 'bg-purple-50 hover:bg-purple-100/70',
            borderClass: 'border-purple-200',
            badgeBg: 'bg-purple-100 text-purple-700',
            textClass: 'text-purple-900',
            accentClass: 'bg-purple-600',
          };
      }
    };

    const colorStyle = getColorClasses(colorName);

    const updatedService: ServiceDefinition = {
      id: editingService ? editingService.id : id,
      name: name.trim(),
      tagline: tagline.trim(),
      description: description.trim(),
      basePriceDescription: basePriceDescription.trim(),
      colorName,
      ...colorStyle,
      iconName: editingService?.iconName || 'Sparkles',
      isActive,
    };

    let updatedList = [...services];
    if (editingService) {
      updatedList = updatedList.map((s) => (s.id === editingService.id ? updatedService : s));
    } else {
      updatedList.push(updatedService);
    }

    await storage.saveServices(updatedList);
    setServices(updatedList);
    setIsModalOpen(false);
  };

  const handleToggleActive = async (s: ServiceDefinition) => {
    const updated = services.map((item) =>
      item.id === s.id ? { ...item, isActive: !item.isActive } : item
    );
    await storage.saveServices(updated);
    setServices(updated);
  };

  const handleDeleteService = async (serviceId: string) => {
    if (
      ['laundry', 'house_cleaning', 'baby_sitting', 'elderly_care', 'water_tank'].includes(
        serviceId
      )
    ) {
      alert('Default core services cannot be deleted. You can toggle Disable to deactivate them.');
      return;
    }

    if (!confirm('Are you sure you want to delete this custom service?')) return;
    const updated = services.filter((s) => s.id !== serviceId);
    await storage.saveServices(updated);
    setServices(updated);
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            Manage Services Catalog
          </h2>
          <p className="text-xs text-slate-500 font-medium">
            Active services load on Customer Home. Deactivated services disappear for new bookings.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="flex items-center gap-1.5 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-600/20 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Custom Service</span>
        </button>
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {services.map((s) => (
          <div
            key={s.id}
            className={`p-6 rounded-3xl border transition-all ${
              s.isActive
                ? 'bg-white border-slate-200 shadow-2xs hover:shadow-md'
                : 'bg-slate-50 border-slate-200 opacity-60'
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${s.badgeBg}`}>
                  {s.basePriceDescription}
                </span>
                <h3 className="text-lg font-bold text-slate-900 mt-2">{s.name}</h3>
                <p className="text-xs text-slate-500 font-medium">{s.tagline}</p>
              </div>

              <button
                onClick={() => handleToggleActive(s)}
                className={`p-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors ${
                  s.isActive
                    ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                    : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                }`}
                title="Toggle Active on Customer Home"
              >
                <Power className="w-4 h-4" />
                <span>{s.isActive ? 'Active' : 'Disabled'}</span>
              </button>
            </div>

            <p className="text-xs text-slate-600 mt-3 line-clamp-2 leading-relaxed">
              {s.description}
            </p>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
              <button
                onClick={() => openEditModal(s)}
                className="font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span>Edit Details</span>
              </button>

              {!['laundry', 'house_cleaning', 'baby_sitting', 'elderly_care', 'water_tank'].includes(
                s.id
              ) && (
                <button
                  onClick={() => handleDeleteService(s.id)}
                  className="font-bold text-rose-600 hover:text-rose-800 flex items-center gap-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete</span>
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Edit / Add Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-3xl p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-slate-900">
              {editingService ? 'Edit Service' : 'Add New Service'}
            </h3>

            <form onSubmit={handleSaveService} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Service Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Garden Landscaping"
                  className="w-full p-2.5 bg-slate-50 text-xs rounded-xl border border-slate-200"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Tagline</label>
                <input
                  type="text"
                  value={tagline}
                  onChange={(e) => setTagline(e.target.value)}
                  placeholder="Short one-line subtitle"
                  className="w-full p-2.5 bg-slate-50 text-xs rounded-xl border border-slate-200"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Price Unit Description</label>
                <input
                  type="text"
                  value={basePriceDescription}
                  onChange={(e) => setBasePriceDescription(e.target.value)}
                  placeholder="e.g. From ₹350 / visit"
                  className="w-full p-2.5 bg-slate-50 text-xs rounded-xl border border-slate-200"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Theme Pastel Color</label>
                <select
                  value={colorName}
                  onChange={(e) => setColorName(e.target.value as any)}
                  className="w-full p-2.5 bg-slate-50 text-xs rounded-xl border border-slate-200 font-semibold"
                >
                  <option value="purple">Purple (Lavender - like Laundry)</option>
                  <option value="green">Green (Mint - like Cleaning)</option>
                  <option value="pink">Pink (Peach - like Baby Sitting)</option>
                  <option value="blue">Blue (like Elderly Care)</option>
                  <option value="cyan">Cyan (Turquoise - like Water Tank)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Full Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Detailed breakdown of what is included..."
                  rows={3}
                  className="w-full p-2.5 bg-slate-50 text-xs rounded-xl border border-slate-200"
                />
              </div>

              <div className="pt-1">
                <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-800">
                  <input
                    type="checkbox"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="w-4 h-4 rounded text-indigo-600"
                  />
                  <span>Active & Visible on Customer Home</span>
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
                  Save Service
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
