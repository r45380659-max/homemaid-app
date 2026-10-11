import React, { useState, useEffect } from 'react';
import { PriceSettings, LaundryRate } from '../../types';
import { storage } from '../../services/storage';
import {
  DollarSign,
  Save,
  CheckCircle2,
  Shirt,
  Sparkles,
  HeartHandshake,
  UserCheck,
  Droplets,
  RotateCcw,
} from 'lucide-react';

export const ManagePrices: React.FC = () => {
  const [prices, setPrices] = useState<PriceSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    storage.getPrices().then((res) => {
      setPrices(res);
      setLoading(false);
    });
  }, []);

  const handleSaveAll = async () => {
    if (!prices) return;
    await storage.savePrices(prices);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const updateLaundryItemPrice = (id: string, price: number) => {
    if (!prices) return;
    const updated = prices.laundry.map((item) =>
      item.id === id ? { ...item, price: Math.max(0, price) } : item
    );
    setPrices({ ...prices, laundry: updated });
  };

  if (loading || !prices) {
    return <div className="p-8 text-center text-xs text-slate-500">Loading price settings...</div>;
  }

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            Manage Service Pricing
          </h2>
          <p className="text-xs text-slate-500 font-medium">
            Granular per-item and hourly rates. Existing bookings retain original captured price.
          </p>
        </div>

        <button
          onClick={handleSaveAll}
          className="flex items-center gap-1.5 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-600/20 transition-all self-start sm:self-auto"
        >
          <Save className="w-4 h-4" />
          <span>Save All Rates</span>
        </button>
      </div>

      {savedSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>All price updates successfully saved to persistent database!</span>
        </div>
      )}

      {/* 1. Laundry Pickup & Delivery Rates */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
          <Shirt className="w-5 h-5 text-purple-600" />
          <h3 className="font-bold text-base text-slate-900">
            Laundry Pickup & Delivery Item Rates (Per Item)
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {prices.laundry.map((item) => (
            <div key={item.id} className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
              <label className="block text-xs font-bold text-slate-800 mb-1">{item.name}</label>
              <div className="relative flex items-center">
                <span className="absolute left-3 text-xs font-bold text-slate-500">₹</span>
                <input
                  type="number"
                  min="0"
                  value={item.price}
                  onChange={(e) => updateLaundryItemPrice(item.id, Number(e.target.value))}
                  className="w-full pl-7 pr-3 py-2 bg-white text-sm font-bold text-slate-900 rounded-xl border border-slate-200"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 2. House Cleaning Rates */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
          <Sparkles className="w-5 h-5 text-emerald-600" />
          <h3 className="font-bold text-base text-slate-900">
            House Cleaning Rates (Per Room / Per Bathroom)
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
            <label className="block text-xs font-bold text-slate-800">
              Simple Cleaning (Per Room)
            </label>
            <p className="text-[11px] text-slate-500">Brooming & dusting only</p>
            <div className="relative flex items-center pt-2">
              <span className="absolute left-3 text-xs font-bold text-slate-500">₹</span>
              <input
                type="number"
                min="0"
                value={prices.houseCleaning.simplePerRoom}
                onChange={(e) =>
                  setPrices({
                    ...prices,
                    houseCleaning: {
                      ...prices.houseCleaning,
                      simplePerRoom: Number(e.target.value),
                    },
                  })
                }
                className="w-full pl-7 pr-3 py-2.5 bg-white text-base font-bold text-slate-900 rounded-xl border border-slate-200"
              />
            </div>
          </div>

          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
            <label className="block text-xs font-bold text-slate-800">
              Deep Cleaning (Per Room)
            </label>
            <p className="text-[11px] text-slate-500">Intensive scrubbing & sanitizing</p>
            <div className="relative flex items-center pt-2">
              <span className="absolute left-3 text-xs font-bold text-slate-500">₹</span>
              <input
                type="number"
                min="0"
                value={prices.houseCleaning.deepPerRoom}
                onChange={(e) =>
                  setPrices({
                    ...prices,
                    houseCleaning: {
                      ...prices.houseCleaning,
                      deepPerRoom: Number(e.target.value),
                    },
                  })
                }
                className="w-full pl-7 pr-3 py-2.5 bg-white text-base font-bold text-slate-900 rounded-xl border border-slate-200"
              />
            </div>
          </div>

          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
            <label className="block text-xs font-bold text-slate-800">
              Bathroom Cleaning (Per Bathroom)
            </label>
            <p className="text-[11px] text-slate-500">Tile descaling & disinfection</p>
            <div className="relative flex items-center pt-2">
              <span className="absolute left-3 text-xs font-bold text-slate-500">₹</span>
              <input
                type="number"
                min="0"
                value={prices.houseCleaning.bathroomPerUnit}
                onChange={(e) =>
                  setPrices({
                    ...prices,
                    houseCleaning: {
                      ...prices.houseCleaning,
                      bathroomPerUnit: Number(e.target.value),
                    },
                  })
                }
                className="w-full pl-7 pr-3 py-2.5 bg-white text-base font-bold text-slate-900 rounded-xl border border-slate-200"
              />
            </div>
          </div>
        </div>
      </div>

      {/* 3 & 4. Baby Sitting and Elderly Care */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Baby sitting */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <HeartHandshake className="w-5 h-5 text-rose-600" />
            <h3 className="font-bold text-base text-slate-900">Baby Sitting Rate</h3>
          </div>
          <p className="text-xs text-slate-500">Formula: babies × hours × rate</p>
          <div className="relative flex items-center">
            <span className="absolute left-3 text-xs font-bold text-slate-500">₹</span>
            <input
              type="number"
              min="0"
              value={prices.babySitting.perBabyPerHour}
              onChange={(e) =>
                setPrices({
                  ...prices,
                  babySitting: { perBabyPerHour: Number(e.target.value) },
                })
              }
              className="w-full pl-7 pr-3 py-2.5 bg-slate-50 text-base font-bold text-slate-900 rounded-xl border border-slate-200"
            />
            <span className="absolute right-3 text-xs text-slate-400 font-semibold">/ baby / hour</span>
          </div>
        </div>

        {/* Elderly Care */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <UserCheck className="w-5 h-5 text-blue-600" />
            <h3 className="font-bold text-base text-slate-900">Elderly Care Rate</h3>
          </div>
          <p className="text-xs text-slate-500">Formula: elders × hours × rate</p>
          <div className="relative flex items-center">
            <span className="absolute left-3 text-xs font-bold text-slate-500">₹</span>
            <input
              type="number"
              min="0"
              value={prices.elderlyCare.perElderPerHour}
              onChange={(e) =>
                setPrices({
                  ...prices,
                  elderlyCare: { perElderPerHour: Number(e.target.value) },
                })
              }
              className="w-full pl-7 pr-3 py-2.5 bg-slate-50 text-base font-bold text-slate-900 rounded-xl border border-slate-200"
            />
            <span className="absolute right-3 text-xs text-slate-400 font-semibold">/ elder / hour</span>
          </div>
        </div>
      </div>

      {/* 5. Water Tank Cleaning Rate */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
          <Droplets className="w-5 h-5 text-cyan-600" />
          <h3 className="font-bold text-base text-slate-900">
            Water Tank Cleaning Rate (Per 1,000 Litres Per Tank)
          </h3>
        </div>
        <p className="text-xs text-slate-500">
          Formula: (capacity ÷ 1,000) × tanks × rate. Min 1,000L to Max 10,000L.
        </p>

        <div className="max-w-xs relative flex items-center">
          <span className="absolute left-3 text-xs font-bold text-slate-500">₹</span>
          <input
            type="number"
            min="0"
            value={prices.waterTank.perThousandLitresPerTank}
            onChange={(e) =>
              setPrices({
                ...prices,
                waterTank: {
                  ...prices.waterTank,
                  perThousandLitresPerTank: Number(e.target.value),
                },
              })
            }
            className="w-full pl-7 pr-3 py-2.5 bg-slate-50 text-base font-bold text-slate-900 rounded-xl border border-slate-200"
          />
          <span className="absolute right-3 text-xs text-slate-400 font-semibold">/ 1,000L / tank</span>
        </div>
      </div>
    </div>
  );
};
