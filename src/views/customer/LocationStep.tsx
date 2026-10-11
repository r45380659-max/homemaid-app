import React, { useState, useEffect } from 'react';
import { BookingLocation } from '../../types';
import { storage } from '../../services/storage';
import { useLanguage } from '../../i18n/LanguageContext';
import {
  MapPin,
  Navigation,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ArrowLeft,
  Search,
  Building,
  Home,
  Compass,
} from 'lucide-react';

interface LocationStepProps {
  initialLocation?: BookingLocation | null;
  onBack: () => void;
  onProceed: (location: BookingLocation) => void;
}

export const LocationStep: React.FC<LocationStepProps> = ({
  initialLocation,
  onBack,
  onProceed,
}) => {
  const { t } = useLanguage();
  const [serviceAreas, setServiceAreas] = useState<string[]>(['Bangrasia', 'Katara Hills', 'Bagsewaniya', 'Bhopal']);

  const [houseNo, setHouseNo] = useState<string>('');
  const [street, setStreet] = useState<string>('');
  const [area, setArea] = useState<string>(initialLocation?.area || 'Katara Hills');
  const [city, setCity] = useState<string>(initialLocation?.city || 'Bhopal');
  const [pincode, setPincode] = useState<string>(initialLocation?.pincode || '462043');
  const [landmark, setLandmark] = useState<string>(initialLocation?.landmark || '');
  
  const [lat, setLat] = useState<number | null>(initialLocation?.latitude || null);
  const [lng, setLng] = useState<number | null>(initialLocation?.longitude || null);
  const [isLocating, setIsLocating] = useState<boolean>(false);
  const [locationStatusMsg, setLocationStatusMsg] = useState<string>('');
  const [pinOnMap, setPinOnMap] = useState<boolean>(false);

  useEffect(() => {
    storage.getAppSettings().then((s) => {
      if (s.serviceAreas && s.serviceAreas.length > 0) {
        setServiceAreas(s.serviceAreas);
      }
    });

    if (initialLocation?.fullAddress) {
      setHouseNo(initialLocation.fullAddress);
    }
  }, [initialLocation]);

  // Check if current area is serviceable
  const isAreaServiceable = serviceAreas.some(
    (sa) =>
      sa.toLowerCase().includes(area.toLowerCase()) ||
      area.toLowerCase().includes(sa.toLowerCase()) ||
      sa.toLowerCase().includes(city.toLowerCase()) ||
      city.toLowerCase().includes(sa.toLowerCase())
  );

  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      setLocationStatusMsg('Geolocation is not supported by your browser.');
      return;
    }

    setIsLocating(true);
    setLocationStatusMsg('Requesting real device GPS coordinates...');

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const deviceLat = pos.coords.latitude;
        const deviceLng = pos.coords.longitude;
        setLat(deviceLat);
        setLng(deviceLng);
        setLocationStatusMsg(`GPS captured: ${deviceLat.toFixed(5)}, ${deviceLng.toFixed(5)}`);

        // Attempt reverse geocoding via public OpenStreetMap Nominatim
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${deviceLat}&lon=${deviceLng}&format=json`
          );
          if (res.ok) {
            const data = await res.json();
            if (data.address) {
              const detectedCity = data.address.city || data.address.town || data.address.state_district || 'Bhopal';
              const detectedArea = data.address.suburb || data.address.neighbourhood || data.address.residential || 'Katara Hills';
              setCity(detectedCity);
              setArea(detectedArea);
              if (data.address.postcode) setPincode(data.address.postcode);
              if (data.display_name) {
                setStreet(data.display_name.split(',').slice(0, 3).join(', '));
              }
            }
          }
        } catch (err) {
          console.warn('Reverse geocode fallback:', err);
        } finally {
          setIsLocating(false);
        }
      },
      (err) => {
        setIsLocating(false);
        if (err.code === 1) {
          setLocationStatusMsg('Location permission denied. Please enter address manually.');
        } else {
          setLocationStatusMsg('Unable to retrieve device GPS. Please enter address manually.');
        }
      },
      { enableHighAccuracy: true, timeout: 12000 }
    );
  };

  const handleProceedClick = () => {
    const fullAddressCombined = [houseNo, street, landmark, area, city, pincode]
      .filter(Boolean)
      .join(', ');

    if (!houseNo.trim()) {
      alert('Please enter your Flat / House number or building name.');
      return;
    }
    if (!area.trim()) {
      alert('Please enter or select your Area / Locality.');
      return;
    }

    const loc: BookingLocation = {
      fullAddress: fullAddressCombined,
      area: area.trim(),
      city: city.trim(),
      pincode: pincode.trim(),
      landmark: landmark.trim(),
      latitude: lat,
      longitude: lng,
      isServiceable: isAreaServiceable,
    };

    onProceed(loc);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-20">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white border border-slate-200 px-3 py-1.5 rounded-xl shadow-2xs transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>

        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
          Step 2 of 4: Service Location
        </span>
      </div>

      {/* Location Service Area Badge */}
      <div
        className={`p-4 rounded-3xl border flex items-start gap-3 transition-colors ${
          isAreaServiceable
            ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
            : 'bg-amber-50 border-amber-200 text-amber-950'
        }`}
      >
        {isAreaServiceable ? (
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
        ) : (
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        )}

        <div>
          <div className="font-bold text-sm">
            {isAreaServiceable
              ? 'Homemaid is available in your area.'
              : "Homemaid is not available in this area yet. We're coming soon!"}
          </div>
          <p className="text-xs mt-0.5 text-slate-600">
            Current service areas: <span className="font-semibold">{serviceAreas.join(', ')}</span>.
          </p>
        </div>
      </div>

      {/* Geolocation triggers */}
      <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
          Select Location Method
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            type="button"
            onClick={handleGetCurrentLocation}
            disabled={isLocating}
            className="flex items-center gap-3 p-4 rounded-2xl border border-indigo-200 bg-indigo-50/50 hover:bg-indigo-50 text-indigo-900 font-bold text-xs sm:text-sm text-left transition-colors"
          >
            <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0">
              <Navigation className={`w-5 h-5 ${isLocating ? 'animate-spin' : ''}`} />
            </div>
            <div>
              <div>Use My Current Location</div>
              <div className="text-[11px] font-normal text-indigo-700/80">
                {isLocating ? 'Acquiring GPS...' : 'Real device GPS permission'}
              </div>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setPinOnMap(!pinOnMap)}
            className="flex items-center gap-3 p-4 rounded-2xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-800 font-bold text-xs sm:text-sm text-left transition-colors"
          >
            <div className="w-10 h-10 rounded-xl bg-slate-800 text-white flex items-center justify-center shrink-0">
              <MapPin className="w-5 h-5 text-rose-400" />
            </div>
            <div>
              <div>Select on Google Maps</div>
              <div className="text-[11px] font-normal text-slate-500">
                {pinOnMap ? 'Hide map pin' : 'Interactive pin coordinates'}
              </div>
            </div>
          </button>
        </div>

        {locationStatusMsg && (
          <div className="text-xs p-3 rounded-xl bg-slate-100 text-slate-700 font-mono">
            {locationStatusMsg}
          </div>
        )}

        {/* Map pin view when toggled */}
        {pinOnMap && (
          <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50 space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-600">
              <span className="font-bold flex items-center gap-1.5">
                <Compass className="w-4 h-4 text-indigo-600" />
                <span>Map Coordinate Pinpoint</span>
              </span>
              <span>
                Coordinates: {lat ? `${lat.toFixed(4)}, ${lng?.toFixed(4)}` : 'Click to drop pin'}
              </span>
            </div>

            {/* Interactive simulated coordinate canvas */}
            <div
              onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                // Approximate Bhopal coordinates range: 23.18 to 23.28 Lat, 77.38 to 77.48 Lng
                const calcLat = 23.2599 + (y / rect.height - 0.5) * 0.08;
                const calcLng = 77.4126 + (x / rect.width - 0.5) * 0.08;
                setLat(calcLat);
                setLng(calcLng);
                setLocationStatusMsg(`Pin set at ${calcLat.toFixed(5)}, ${calcLng.toFixed(5)}`);
              }}
              className="relative h-44 rounded-2xl bg-gradient-to-br from-indigo-100 via-slate-200 to-emerald-100 border border-slate-300 overflow-hidden cursor-crosshair flex items-center justify-center select-none"
            >
              {/* Map grid lines */}
              <div className="absolute inset-0 opacity-20 bg-[linear-gradient(to_right,#808080_1px,transparent_1px),linear-gradient(to_bottom,#808080_1px,transparent_1px)] bg-[size:24px_24px]" />

              <div className="absolute top-2 left-2 px-2 py-1 bg-white/90 backdrop-blur-xs rounded-lg text-[10px] font-semibold text-slate-700 shadow-2xs">
                Tap anywhere to position service pin
              </div>

              {/* Pin representation */}
              <div className="relative z-10 flex flex-col items-center animate-bounce">
                <div className="w-8 h-8 rounded-full bg-rose-600 text-white flex items-center justify-center shadow-lg border-2 border-white">
                  <MapPin className="w-4 h-4 fill-white" />
                </div>
                <div className="w-2 h-2 rounded-full bg-slate-900/40 blur-2xs mt-0.5" />
              </div>

              <div className="absolute bottom-2 right-2 px-2.5 py-1 bg-slate-900/80 text-white rounded-lg text-[10px] font-mono">
                Bhopal Grid: {lat?.toFixed(4) || '23.2599'}, {lng?.toFixed(4) || '77.4126'}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Manual Address Form Fallback */}
      <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
          Address Details
        </h3>

        <div className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Flat / House No. / Building Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={houseNo}
              onChange={(e) => setHouseNo(e.target.value)}
              placeholder="e.g. Flat 302, Palm Heights"
              className="w-full p-3 bg-slate-50 focus:bg-white text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Street / Road / Sector
            </label>
            <input
              type="text"
              value={street}
              onChange={(e) => setStreet(e.target.value)}
              placeholder="e.g. Near Sagar Public School, Sector C"
              className="w-full p-3 bg-slate-50 focus:bg-white text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Area / Locality <span className="text-rose-500">*</span>
              </label>
              <select
                value={area}
                onChange={(e) => setArea(e.target.value)}
                className="w-full p-3 bg-slate-50 focus:bg-white text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-semibold text-slate-800"
              >
                {serviceAreas.map((sa) => (
                  <option key={sa} value={sa}>
                    {sa}
                  </option>
                ))}
                <option value="Other Area">Other / Coming Soon</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">City</label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full p-3 bg-slate-50 focus:bg-white text-sm rounded-xl border border-slate-200 focus:outline-none font-semibold text-slate-800"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Pincode</label>
              <input
                type="text"
                value={pincode}
                onChange={(e) => setPincode(e.target.value)}
                placeholder="e.g. 462043"
                className="w-full p-3 bg-slate-50 focus:bg-white text-sm rounded-xl border border-slate-200 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Landmark (Optional)</label>
              <input
                type="text"
                value={landmark}
                onChange={(e) => setLandmark(e.target.value)}
                placeholder="e.g. Opposite Water Tank"
                className="w-full p-3 bg-slate-50 focus:bg-white text-sm rounded-xl border border-slate-200 focus:outline-none"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Floating Bottom Proceed */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 p-4 shadow-xl">
        <div className="max-w-2xl mx-auto flex items-center justify-between gap-4">
          <div className="text-xs">
            <span className="font-semibold text-slate-500">Service Location: </span>
            <span className="font-bold text-slate-900">{area}, {city}</span>
          </div>

          <button
            type="button"
            onClick={handleProceedClick}
            className="px-6 sm:px-8 py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm sm:text-base flex items-center gap-2 shadow-lg shadow-indigo-600/30 transition-all active:scale-98"
          >
            <span>Proceed to Date & Time</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
