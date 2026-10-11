import React, { useState, useEffect } from 'react';
import {
  ServiceDefinition,
  LaundryItemQuantity,
  HouseCleaningOptions,
  BabySittingOptions,
  ElderlyCareOptions,
  WaterTankOptions,
  PriceSettings,
} from '../../types';
import { storage, INITIAL_LAUNDRY_ITEMS } from '../../services/storage';
import { useLanguage } from '../../i18n/LanguageContext';
import { Plus, Minus, ArrowRight, ArrowLeft, AlertCircle, Info, Sparkles } from 'lucide-react';

interface ServiceCustomizerProps {
  service: ServiceDefinition;
  onBack: () => void;
  onProceed: (details: {
    capturedPrice: number;
    laundryItems?: LaundryItemQuantity[];
    houseCleaning?: HouseCleaningOptions;
    babySitting?: BabySittingOptions;
    elderlyCare?: ElderlyCareOptions;
    waterTank?: WaterTankOptions;
  }) => void;
}

export const ServiceCustomizer: React.FC<ServiceCustomizerProps> = ({
  service,
  onBack,
  onProceed,
}) => {
  const { t } = useLanguage();
  const [prices, setPrices] = useState<PriceSettings | null>(null);

  // 1. Laundry items state
  const [laundryQuantities, setLaundryQuantities] = useState<Record<string, number>>({});

  // 2. House Cleaning state
  const [cleaningType, setCleaningType] = useState<'simple' | 'deep' | 'both'>('deep');
  const [simpleRooms, setSimpleRooms] = useState<number>(0);
  const [deepRooms, setDeepRooms] = useState<number>(2);
  const [bathrooms, setBathrooms] = useState<number>(1);

  // 3. Baby Sitting state
  const [babyCount, setBabyCount] = useState<number>(1);
  const [babyHours, setBabyHours] = useState<number>(3);

  // 4. Elderly Care state
  const [elderCount, setElderCount] = useState<number>(1);
  const [elderHours, setElderHours] = useState<number>(4);

  // 5. Water Tank state
  const [tankCapacity, setTankCapacity] = useState<number>(1000);
  const [tankCount, setTankCount] = useState<number>(1);
  const [tankError, setTankError] = useState<string>('');

  useEffect(() => {
    storage.getPrices().then((p) => {
      setPrices(p);
      if (service.id === 'laundry') {
        const initial: Record<string, number> = {};
        p.laundry.forEach((item) => {
          initial[item.id] = 0;
        });
        // Default 2 T-shirts and 1 Pant for ease
        if (initial['tshirt'] !== undefined) initial['tshirt'] = 2;
        if (initial['pants'] !== undefined) initial['pants'] = 1;
        setLaundryQuantities(initial);
      }
    });
  }, [service.id]);

  // Dynamic Price Calculations
  let calculatedTotal = 0;

  if (service.id === 'laundry' && prices) {
    prices.laundry.forEach((item) => {
      const q = laundryQuantities[item.id] || 0;
      calculatedTotal += q * item.price;
    });
  } else if (service.id === 'house_cleaning' && prices) {
    if (cleaningType === 'simple') {
      calculatedTotal = simpleRooms * prices.houseCleaning.simplePerRoom + bathrooms * prices.houseCleaning.bathroomPerUnit;
    } else if (cleaningType === 'deep') {
      calculatedTotal = deepRooms * prices.houseCleaning.deepPerRoom + bathrooms * prices.houseCleaning.bathroomPerUnit;
    } else {
      calculatedTotal =
        simpleRooms * prices.houseCleaning.simplePerRoom +
        deepRooms * prices.houseCleaning.deepPerRoom +
        bathrooms * prices.houseCleaning.bathroomPerUnit;
    }
  } else if (service.id === 'baby_sitting' && prices) {
    calculatedTotal = babyCount * babyHours * prices.babySitting.perBabyPerHour;
  } else if (service.id === 'elderly_care' && prices) {
    calculatedTotal = elderCount * elderHours * prices.elderlyCare.perElderPerHour;
  } else if (service.id === 'water_tank' && prices) {
    if (tankCapacity >= 1000 && tankCapacity <= 10000 && tankCount >= 1) {
      calculatedTotal = (tankCapacity / 1000) * tankCount * prices.waterTank.perThousandLitresPerTank;
    } else {
      calculatedTotal = 0;
    }
  }

  // Validate Water Tank Capacity changes
  const handleTankCapacityChange = (val: number) => {
    setTankCapacity(val);
    if (val < 1000) {
      setTankError('Tank capacity must be at least 1,000 litres.');
    } else if (val > 10000) {
      setTankError('Tank capacity cannot be more than 10,000 litres.');
    } else {
      setTankError('');
    }
  };

  const handleProceedClick = () => {
    if (service.id === 'laundry') {
      const selectedItems: LaundryItemQuantity[] = [];
      prices?.laundry.forEach((item) => {
        const q = laundryQuantities[item.id] || 0;
        if (q > 0) {
          selectedItems.push({
            id: item.id,
            name: item.name,
            pricePerItem: item.price,
            quantity: q,
          });
        }
      });
      if (selectedItems.length === 0) {
        alert('Please select at least 1 laundry item to proceed.');
        return;
      }
      onProceed({
        capturedPrice: calculatedTotal,
        laundryItems: selectedItems,
      });
    } else if (service.id === 'house_cleaning') {
      const totalRooms = cleaningType === 'simple' ? simpleRooms : cleaningType === 'deep' ? deepRooms : simpleRooms + deepRooms;
      if (totalRooms === 0 && bathrooms === 0) {
        alert('Please specify at least 1 room or 1 bathroom.');
        return;
      }
      onProceed({
        capturedPrice: calculatedTotal,
        houseCleaning: {
          cleaningType,
          simpleRooms: cleaningType === 'deep' ? 0 : simpleRooms,
          deepRooms: cleaningType === 'simple' ? 0 : deepRooms,
          bathrooms,
        },
      });
    } else if (service.id === 'baby_sitting') {
      if (babyCount < 1 || babyHours < 1) {
        alert('Please specify at least 1 baby and 1 hour.');
        return;
      }
      onProceed({
        capturedPrice: calculatedTotal,
        babySitting: { babyCount, hours: babyHours },
      });
    } else if (service.id === 'elderly_care') {
      if (elderCount < 1 || elderHours < 1) {
        alert('Please specify at least 1 elder and 1 hour.');
        return;
      }
      onProceed({
        capturedPrice: calculatedTotal,
        elderlyCare: { elderCount, hours: elderHours },
      });
    } else if (service.id === 'water_tank') {
      if (tankCapacity < 1000) {
        setTankError('Tank capacity must be at least 1,000 litres.');
        return;
      }
      if (tankCapacity > 10000) {
        setTankError('Tank capacity cannot be more than 10,000 litres.');
        return;
      }
      if (tankCount < 1) {
        alert('Please enter at least 1 tank.');
        return;
      }
      onProceed({
        capturedPrice: calculatedTotal,
        waterTank: { tankCapacity, tankCount },
      });
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-20">
      {/* Header with back button */}
      <div className="flex items-center justify-between gap-4">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white border border-slate-200 px-3 py-1.5 rounded-xl shadow-2xs transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>

        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
          Step 1 of 4: Service Customization
        </span>
      </div>

      {/* Service Banner */}
      <div className={`p-6 rounded-3xl border shadow-xs ${service.bgClass} ${service.borderClass}`}>
        <div className="flex items-start justify-between gap-3">
          <div>
            <span className={`text-xs font-bold px-3 py-1 rounded-full ${service.badgeBg}`}>
              {service.basePriceDescription}
            </span>
            <h2 className={`text-2xl font-black mt-2 ${service.textClass}`}>
              {service.name}
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 font-medium mt-1">
              {service.tagline}
            </p>
          </div>
        </div>
      </div>

      {/* 1. LAUNDRY DETAILS */}
      {service.id === 'laundry' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs space-y-6">
          <div className="p-3.5 rounded-2xl bg-purple-50/70 border border-purple-100 text-xs text-purple-950 font-semibold flex items-center gap-2">
            <Info className="w-4 h-4 text-purple-600 shrink-0" />
            <span>Home Pickup → Cleaning at Homemaid → Home Delivery</span>
          </div>

          <div>
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3">
              Select Laundry Items & Quantities
            </h3>

            <div className="divide-y divide-slate-100">
              {(prices?.laundry || INITIAL_LAUNDRY_ITEMS).map((item) => {
                const count = laundryQuantities[item.id] || 0;
                return (
                  <div
                    key={item.id}
                    className="py-3.5 flex items-center justify-between gap-4"
                  >
                    <div>
                      <div className="font-bold text-sm text-slate-900">{item.name}</div>
                      <div className="text-xs text-slate-500 font-medium">₹{item.price} per item</div>
                    </div>

                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() =>
                          setLaundryQuantities((prev) => ({
                            ...prev,
                            [item.id]: Math.max(0, (prev[item.id] || 0) - 1),
                          }))
                        }
                        className="w-9 h-9 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 flex items-center justify-center text-slate-700 transition-colors"
                      >
                        <Minus className="w-4 h-4" />
                      </button>

                      <span className="w-6 text-center font-bold text-sm text-slate-900">
                        {count}
                      </span>

                      <button
                        type="button"
                        onClick={() =>
                          setLaundryQuantities((prev) => ({
                            ...prev,
                            [item.id]: (prev[item.id] || 0) + 1,
                          }))
                        }
                        className="w-9 h-9 rounded-xl border border-purple-200 bg-purple-50 hover:bg-purple-100 flex items-center justify-center text-purple-700 transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* 2. HOUSE CLEANING DETAILS */}
      {service.id === 'house_cleaning' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs space-y-6">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Choose Cleaning Intensity
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => setCleaningType('simple')}
                className={`p-3.5 rounded-2xl border text-left transition-all ${
                  cleaningType === 'simple'
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-950 font-bold ring-2 ring-emerald-500/20'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-800'
                }`}
              >
                <div className="text-sm font-bold">Simple Cleaning</div>
                <div className="text-[11px] text-slate-500 mt-1">Brooming & dusting only (₹250 / room)</div>
              </button>

              <button
                type="button"
                onClick={() => setCleaningType('deep')}
                className={`p-3.5 rounded-2xl border text-left transition-all ${
                  cleaningType === 'deep'
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-950 font-bold ring-2 ring-emerald-500/20'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-800'
                }`}
              >
                <div className="text-sm font-bold">Deep Cleaning</div>
                <div className="text-[11px] text-slate-500 mt-1">Intensive scrubbing (₹400 / room)</div>
              </button>

              <button
                type="button"
                onClick={() => setCleaningType('both')}
                className={`p-3.5 rounded-2xl border text-left transition-all ${
                  cleaningType === 'both'
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-950 font-bold ring-2 ring-emerald-500/20'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-800'
                }`}
              >
                <div className="text-sm font-bold">Custom Combo</div>
                <div className="text-[11px] text-slate-500 mt-1">Mix simple & deep rooms</div>
              </button>
            </div>
          </div>

          {/* Rooms selector */}
          <div className="space-y-4 pt-2">
            {(cleaningType === 'simple' || cleaningType === 'both') && (
              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                <div>
                  <div className="font-bold text-sm text-slate-900">Simple Cleaning Rooms</div>
                  <div className="text-xs text-slate-500">₹250 per room</div>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setSimpleRooms((r) => Math.max(0, r - 1))}
                    className="w-9 h-9 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-700"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-6 text-center font-bold text-sm text-slate-900">{simpleRooms}</span>
                  <button
                    type="button"
                    onClick={() => setSimpleRooms((r) => r + 1)}
                    className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {(cleaningType === 'deep' || cleaningType === 'both') && (
              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                <div>
                  <div className="font-bold text-sm text-slate-900">Deep Cleaning Rooms</div>
                  <div className="text-xs text-slate-500">₹400 per room</div>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setDeepRooms((r) => Math.max(0, r - 1))}
                    className="w-9 h-9 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-700"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-6 text-center font-bold text-sm text-slate-900">{deepRooms}</span>
                  <button
                    type="button"
                    onClick={() => setDeepRooms((r) => r + 1)}
                    className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* Bathroom Cleaning */}
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
              <div>
                <div className="font-bold text-sm text-slate-900">Bathroom Cleaning</div>
                <div className="text-xs text-slate-500">₹400 per bathroom</div>
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setBathrooms((b) => Math.max(0, b - 1))}
                  className="w-9 h-9 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-700"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-6 text-center font-bold text-sm text-slate-900">{bathrooms}</span>
                <button
                  type="button"
                  onClick={() => setBathrooms((b) => b + 1)}
                  className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. BABY SITTING DETAILS */}
      {service.id === 'baby_sitting' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs space-y-6">
          <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-100 text-xs text-rose-950 font-semibold flex items-center gap-2">
            <Info className="w-4 h-4 text-rose-600 shrink-0" />
            <span>Rate: ₹250 per baby per hour (Formula: babies × hours × ₹250)</span>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100">
              <div>
                <div className="font-bold text-sm text-slate-900">How many babies need care?</div>
                <div className="text-xs text-slate-500">Number of children</div>
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setBabyCount((c) => Math.max(1, c - 1))}
                  className="w-9 h-9 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-700"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-6 text-center font-bold text-sm text-slate-900">{babyCount}</span>
                <button
                  type="button"
                  onClick={() => setBabyCount((c) => c + 1)}
                  className="w-9 h-9 rounded-xl bg-rose-600 text-white flex items-center justify-center"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100">
              <div>
                <div className="font-bold text-sm text-slate-900">For how many hours?</div>
                <div className="text-xs text-slate-500">Duration of sitting service</div>
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setBabyHours((h) => Math.max(1, h - 1))}
                  className="w-9 h-9 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-700"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-6 text-center font-bold text-sm text-slate-900">{babyHours} hrs</span>
                <button
                  type="button"
                  onClick={() => setBabyHours((h) => h + 1)}
                  className="w-9 h-9 rounded-xl bg-rose-600 text-white flex items-center justify-center"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. ELDERLY CARE DETAILS */}
      {service.id === 'elderly_care' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs space-y-6">
          <div className="p-3.5 rounded-2xl bg-blue-50 border border-blue-100 text-xs text-blue-950 font-semibold flex items-center gap-2">
            <Info className="w-4 h-4 text-blue-600 shrink-0" />
            <span>Rate: ₹300 per elder per hour (Formula: elders × hours × ₹300)</span>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100">
              <div>
                <div className="font-bold text-sm text-slate-900">How many elders need care?</div>
                <div className="text-xs text-slate-500">Number of senior family members</div>
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setElderCount((c) => Math.max(1, c - 1))}
                  className="w-9 h-9 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-700"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-6 text-center font-bold text-sm text-slate-900">{elderCount}</span>
                <button
                  type="button"
                  onClick={() => setElderCount((c) => c + 1)}
                  className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100">
              <div>
                <div className="font-bold text-sm text-slate-900">For how many hours?</div>
                <div className="text-xs text-slate-500">Duration of companionship & assistance</div>
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setElderHours((h) => Math.max(1, h - 1))}
                  className="w-9 h-9 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-700"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-6 text-center font-bold text-sm text-slate-900">{elderHours} hrs</span>
                <button
                  type="button"
                  onClick={() => setElderHours((h) => h + 1)}
                  className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 5. WATER TANK CLEANING DETAILS */}
      {service.id === 'water_tank' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs space-y-6">
          <div className="p-3.5 rounded-2xl bg-cyan-50 border border-cyan-100 text-xs text-cyan-950 font-semibold flex items-center gap-2">
            <Info className="w-4 h-4 text-cyan-600 shrink-0" />
            <span>Price: ₹600 per 1,000 litres per tank. Formula: (capacity ÷ 1,000) × tanks × ₹600</span>
          </div>

          <div className="space-y-5">
            {/* Question 1: What is the capacity of your tank? */}
            <div>
              <label className="block text-sm font-bold text-slate-900 mb-1">
                1. What is the capacity of your tank? (Numeric in litres, 1,000 – 10,000)
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="500"
                  min="1000"
                  max="10000"
                  value={tankCapacity}
                  onChange={(e) => handleTankCapacityChange(Number(e.target.value))}
                  className={`w-full p-3.5 text-base font-bold rounded-2xl border transition-all ${
                    tankError
                      ? 'border-rose-400 bg-rose-50/50 text-rose-900 focus:ring-2 focus:ring-rose-500/20'
                      : 'border-slate-200 bg-slate-50 focus:bg-white text-slate-900 focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500'
                  }`}
                />
                <span className="absolute right-4 top-3.5 font-bold text-sm text-slate-400">
                  Litres
                </span>
              </div>

              {/* Exact Validation Error Messages as specified in prompt */}
              {tankError ? (
                <div className="mt-2 text-xs font-bold text-rose-600 flex items-center gap-1.5 animate-shake">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{tankError}</span>
                </div>
              ) : (
                <div className="mt-2 flex flex-wrap gap-2 text-xs text-slate-500">
                  <span>Quick pick:</span>
                  {[1000, 2000, 3000, 5000, 10000].map((litres) => (
                    <button
                      key={litres}
                      type="button"
                      onClick={() => handleTankCapacityChange(litres)}
                      className={`px-2.5 py-0.5 rounded-lg border text-xs font-semibold ${
                        tankCapacity === litres
                          ? 'bg-cyan-600 text-white border-cyan-600'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
                      }`}
                    >
                      {litres.toLocaleString()}L
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Question 2: How many tanks do you have? */}
            <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100">
              <div>
                <label className="block text-sm font-bold text-slate-900">
                  2. How many tanks do you have?
                </label>
                <div className="text-xs text-slate-500">Numeric quantity, minimum 1</div>
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setTankCount((c) => Math.max(1, c - 1))}
                  className="w-9 h-9 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-700"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-8 text-center font-bold text-sm text-slate-900">{tankCount}</span>
                <button
                  type="button"
                  onClick={() => setTankCount((c) => c + 1)}
                  className="w-9 h-9 rounded-xl bg-cyan-600 text-white flex items-center justify-center"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Formula breakdown */}
            <div className="p-3 bg-slate-100/70 rounded-2xl text-xs text-slate-600 space-y-1">
              <div className="font-semibold text-slate-800">Rate Calculation:</div>
              <div>({tankCapacity.toLocaleString()}L ÷ 1,000) × {tankCount} tank(s) × ₹600 = <strong className="text-slate-900">₹{calculatedTotal}</strong></div>
            </div>
          </div>
        </div>
      )}

      {/* Floating Bottom Total & Proceed Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 p-4 shadow-xl">
        <div className="max-w-2xl mx-auto flex items-center justify-between gap-4">
          <div>
            <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Calculated Total
            </div>
            <div className="text-xl sm:text-2xl font-black text-slate-900">
              ₹{calculatedTotal}
            </div>
          </div>

          <button
            type="button"
            disabled={calculatedTotal <= 0 || Boolean(tankError)}
            onClick={handleProceedClick}
            className={`px-6 sm:px-8 py-3.5 rounded-2xl font-bold text-sm sm:text-base flex items-center gap-2 shadow-lg transition-all ${
              calculatedTotal > 0 && !tankError
                ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-600/30 active:scale-98'
                : 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
            }`}
          >
            <span>Proceed to Location</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
