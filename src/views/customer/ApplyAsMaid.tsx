import React, { useState } from 'react';
import { MaidApplication } from '../../types';
import { storage } from '../../services/storage';
import {
  Sparkles,
  ArrowLeft,
  CheckCircle2,
  Phone,
  User,
  MapPin,
  Briefcase,
  FileText,
  Camera,
  ShieldCheck,
} from 'lucide-react';

interface ApplyAsMaidProps {
  onBack: () => void;
}

export const ApplyAsMaid: React.FC<ApplyAsMaidProps> = ({ onBack }) => {
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [area, setArea] = useState('Katara Hills');
  const [city, setCity] = useState('Bhopal');
  const [selectedServices, setSelectedServices] = useState<string[]>(['House Cleaning']);
  const [skillsDetails, setSkillsDetails] = useState('');
  const [experience, setExperience] = useState('2 Years');
  const [description, setDescription] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [applicationId, setApplicationId] = useState('');

  const serviceOptions = [
    'House Cleaning',
    'Laundry & Ironing',
    'Baby Sitting',
    'Elderly Care',
    'Cooking / Kitchen Help',
    'Water Tank Cleaning Assistant',
  ];

  const toggleService = (svc: string) => {
    setSelectedServices((prev) =>
      prev.includes(svc) ? prev.filter((s) => s !== svc) : [...prev, svc]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      alert('Please enter your full name.');
      return;
    }
    if (!phone.trim() || phone.replace(/\D/g, '').length < 10) {
      alert('Please enter a valid 10-digit mobile number.');
      return;
    }
    if (selectedServices.length === 0) {
      alert('Please select at least 1 service you can perform.');
      return;
    }

    setSubmitting(true);
    const newId = `HM-APP-${Math.floor(1000 + Math.random() * 9000)}`;
    const newApp: MaidApplication = {
      id: `app-${Date.now()}`,
      applicationId: newId,
      fullName: fullName.trim(),
      phone: phone.trim(),
      area: area.trim(),
      city: city.trim(),
      servicesCanDo: selectedServices,
      skillsDetails: skillsDetails.trim() || 'General house maintenance',
      experience: experience.trim() || undefined,
      description: description.trim() || undefined,
      photoUrl: photoUrl.trim() || undefined,
      status: 'PENDING',
      appliedAt: new Date().toISOString(),
    };

    await storage.submitMaidApplication(newApp);
    setSubmitting(false);
    setApplicationId(newId);
    setSubmitted(true);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-20">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white border border-slate-200 px-3 py-1.5 rounded-xl shadow-2xs transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>

        <span className="text-xs font-bold uppercase tracking-wider text-purple-700 bg-purple-100 px-3 py-1 rounded-full">
          Public Career Application
        </span>
      </div>

      {submitted ? (
        <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-md text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-900">
              Application Submitted Successfully!
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-md mx-auto">
              Thank you for applying to work with Homemaid. Our supervisor will contact you at <strong>{phone}</strong> for document verification and interview.
            </p>
          </div>

          <div className="p-4 bg-slate-50 rounded-2xl inline-block border border-slate-200 text-xs">
            <span className="text-slate-500 font-semibold">Application Reference ID: </span>
            <strong className="font-mono text-indigo-700 text-sm">{applicationId}</strong>
          </div>

          <div className="pt-4">
            <button
              onClick={onBack}
              className="px-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md"
            >
              Return to Home
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-xs space-y-6">
          {/* Headline */}
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-50 text-purple-700 text-xs font-bold mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Join Bhopal's Leading Home Care Team</span>
            </div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">
              Apply as a Homemaid Service Specialist
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Guaranteed weekly direct bank payouts, background verification assistance, and respectful households.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Full Name <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3 top-3.5 text-slate-400" />
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Maya Bai / Sunita Sharma"
                  className="w-full pl-9 pr-3 py-3 bg-slate-50 focus:bg-white text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Mobile Number (for calling & SMS) <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 absolute left-3 top-3.5 text-slate-400" />
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full pl-9 pr-3 py-3 bg-slate-50 focus:bg-white text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Area / Locality <span className="text-rose-500">*</span></label>
                <select
                  value={area}
                  onChange={(e) => setArea(e.target.value)}
                  className="w-full p-3 bg-slate-50 text-sm rounded-xl border border-slate-200 font-semibold"
                >
                  <option value="Katara Hills">Katara Hills</option>
                  <option value="Bangrasia">Bangrasia</option>
                  <option value="Bagsewaniya">Bagsewaniya</option>
                  <option value="Bhopal City">Bhopal City</option>
                  <option value="Other Area">Other Bhopal Area</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">City</label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full p-3 bg-slate-50 text-sm rounded-xl border border-slate-200 font-semibold"
                />
              </div>
            </div>

            {/* Services they can do */}
            <div>
              <label className="block font-bold text-slate-700 mb-2">
                Services you can perform: <span className="text-rose-500">*</span>
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {serviceOptions.map((svc) => {
                  const isChecked = selectedServices.includes(svc);
                  return (
                    <button
                      key={svc}
                      type="button"
                      onClick={() => toggleService(svc)}
                      className={`p-3 rounded-xl border text-left flex items-center justify-between transition-all ${
                        isChecked
                          ? 'border-indigo-600 bg-indigo-50/70 text-indigo-950 font-bold'
                          : 'border-slate-200 bg-slate-50/50 text-slate-700'
                      }`}
                    >
                      <span className="text-xs">{svc}</span>
                      <div
                        className={`w-4 h-4 rounded-md border flex items-center justify-center ${
                          isChecked ? 'bg-indigo-600 border-indigo-600 text-white' : 'border-slate-300'
                        }`}
                      >
                        {isChecked && <CheckCircle2 className="w-3 h-3" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Skills & Experience */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Experience (Years / Months)</label>
                <input
                  type="text"
                  value={experience}
                  onChange={(e) => setExperience(e.target.value)}
                  placeholder="e.g. 3 years in apartment cleaning"
                  className="w-full p-3 bg-slate-50 text-sm rounded-xl border border-slate-200"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Photo URL (Optional)</label>
                <input
                  type="url"
                  value={photoUrl}
                  onChange={(e) => setPhotoUrl(e.target.value)}
                  placeholder="https://... (profile photo link)"
                  className="w-full p-3 bg-slate-50 text-sm rounded-xl border border-slate-200"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Additional Details / Languages Spoken
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Mention any special skills, timings you are available, or references..."
                rows={3}
                className="w-full p-3 bg-slate-50 text-sm rounded-xl border border-slate-200"
              />
            </div>

            <div className="pt-3">
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3.5 px-6 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md shadow-indigo-600/20 transition-all active:scale-98"
              >
                {submitting ? 'Submitting Application...' : 'Submit Maid Application'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
