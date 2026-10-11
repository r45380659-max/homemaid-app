import React, { useState } from 'react';
import { SUPPORTED_LANGUAGES, LanguageInfo } from '../i18n/languages';
import { useLanguage } from '../i18n/LanguageContext';
import { Check, Search, Globe, X } from 'lucide-react';

interface LanguageSelectorModalProps {
  isFirstLaunch?: boolean;
  isOpen: boolean;
  onClose?: () => void;
}

export const LanguageSelectorModal: React.FC<LanguageSelectorModalProps> = ({
  isFirstLaunch = false,
  isOpen,
  onClose,
}) => {
  const { language, setLanguage, setHasChosenInitialLanguage } = useLanguage();
  const [selectedCode, setSelectedCode] = useState<string>(language);
  const [searchQuery, setSearchQuery] = useState<string>('');

  if (!isOpen) return null;

  const filteredLanguages = SUPPORTED_LANGUAGES.filter(
    (l) =>
      l.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.nativeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.region.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelect = (lang: LanguageInfo) => {
    setSelectedCode(lang.code);
  };

  const handleConfirm = () => {
    setLanguage(selectedCode);
    setHasChosenInitialLanguage(true);
    if (onClose) onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-5 sm:p-6 border-b border-slate-100 bg-gradient-to-r from-indigo-50/50 via-white to-indigo-50/30">
          <div className="flex items-center justify-between gap-2 mb-2">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-xs">
                <Globe className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-slate-900">
                  {isFirstLaunch ? 'Choose Your Language' : 'Change Language'}
                </h2>
                <p className="text-xs text-slate-500 font-medium">
                  All 22 Scheduled Indian Languages + English
                </p>
              </div>
            </div>

            {!isFirstLaunch && onClose && (
              <button
                onClick={onClose}
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Search bar */}
          <div className="relative mt-3">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by language (e.g. Hindi, தமிழ், বাংলা, Marathi)..."
              className="w-full pl-9 pr-4 py-2.5 bg-slate-100/80 focus:bg-white text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
            />
          </div>
        </div>

        {/* Language Grid List */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 divide-y divide-slate-100">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {filteredLanguages.map((lang) => {
              const isSelected = selectedCode === lang.code;
              return (
                <button
                  key={lang.code}
                  onClick={() => handleSelect(lang)}
                  className={`flex items-center justify-between p-3 rounded-2xl border text-left transition-all ${
                    isSelected
                      ? 'border-indigo-600 bg-indigo-50/70 text-indigo-950 shadow-2xs'
                      : 'border-slate-100 hover:border-slate-200 hover:bg-slate-50/80 text-slate-800'
                  }`}
                >
                  <div className="min-w-0 pr-2">
                    <div className="font-bold text-base tracking-tight truncate">
                      {lang.nativeName}
                    </div>
                    <div className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
                      <span className="font-medium text-slate-700">{lang.name}</span>
                      <span>•</span>
                      <span className="truncate text-[11px] text-slate-400">{lang.region}</span>
                    </div>
                  </div>

                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center border shrink-0 transition-colors ${
                      isSelected
                        ? 'bg-indigo-600 border-indigo-600 text-white'
                        : 'border-slate-300 bg-white'
                    }`}
                  >
                    {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  </div>
                </button>
              );
            })}
          </div>

          {filteredLanguages.length === 0 && (
            <div className="text-center py-8 text-slate-500 text-sm">
              No matching language found for "{searchQuery}".
            </div>
          )}
        </div>

        {/* Confirm Footer */}
        <div className="p-4 sm:p-6 border-t border-slate-100 bg-slate-50 flex items-center justify-between gap-3">
          <div className="text-xs text-slate-500">
            Selected: <span className="font-bold text-slate-800">
              {SUPPORTED_LANGUAGES.find((l) => l.code === selectedCode)?.nativeName} ({SUPPORTED_LANGUAGES.find((l) => l.code === selectedCode)?.name})
            </span>
          </div>

          <button
            onClick={handleConfirm}
            className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md shadow-indigo-600/20 transition-all flex items-center gap-2"
          >
            <span>Continue</span>
            <span>→</span>
          </button>
        </div>
      </div>
    </div>
  );
};
