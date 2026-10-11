import React, { useState } from 'react';
import { ArrowLeft, ArrowRight, Calendar, Clock, ChevronLeft, ChevronRight } from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';

interface DateTimeStepProps {
  initialDate?: string;
  initialTime?: string;
  onBack: () => void;
  onProceed: (dateTime: { bookingDate: string; bookingTime: string }) => void;
}

export const DateTimeStep: React.FC<DateTimeStepProps> = ({
  initialDate,
  initialTime,
  onBack,
  onProceed,
}) => {
  const { t } = useLanguage();

  // Dynamic calendar setup
  const now = new Date();
  const [currentYear, setCurrentYear] = useState<number>(now.getFullYear());
  const [currentMonth, setCurrentMonth] = useState<number>(now.getMonth()); // 0-indexed

  // Format date helper: YYYY-MM-DD
  const formatDateString = (d: Date) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };

  const todayStr = formatDateString(now);

  const [selectedDate, setSelectedDate] = useState<string>(initialDate || todayStr);
  const [selectedTime, setSelectedTime] = useState<string>(initialTime || '10:00 AM');

  // Operating hours: 8:00 AM to 10:00 PM
  const timeSlots = [
    { value: '08:00 AM', hour24: 8 },
    { value: '09:00 AM', hour24: 9 },
    { value: '10:00 AM', hour24: 10 },
    { value: '11:00 AM', hour24: 11 },
    { value: '12:00 PM', hour24: 12 },
    { value: '01:00 PM', hour24: 13 },
    { value: '02:00 PM', hour24: 14 },
    { value: '03:00 PM', hour24: 15 },
    { value: '04:00 PM', hour24: 16 },
    { value: '05:00 PM', hour24: 17 },
    { value: '06:00 PM', hour24: 18 },
    { value: '07:00 PM', hour24: 19 },
    { value: '08:00 PM', hour24: 20 },
    { value: '09:00 PM', hour24: 21 },
  ];

  // Month names
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Calendar days generation
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfWeek = new Date(currentYear, currentMonth, 1).getDay(); // 0 is Sunday

  const daysArray: (number | null)[] = [];
  for (let i = 0; i < firstDayOfWeek; i++) {
    daysArray.push(null);
  }
  for (let d = 1; d <= daysInMonth; d++) {
    daysArray.push(d);
  }

  const handlePrevMonth = () => {
    if (currentYear === now.getFullYear() && currentMonth <= now.getMonth()) {
      return; // don't go to past month
    }
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const isDateInPast = (day: number) => {
    const testDate = new Date(currentYear, currentMonth, day);
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    return testDate < startOfToday;
  };

  const handleDaySelect = (day: number) => {
    if (isDateInPast(day)) return;
    const formatted = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    setSelectedDate(formatted);
  };

  // Check if slot is in the past for today
  const isSlotPast = (slotHour24: number) => {
    if (selectedDate !== todayStr) return false;
    return slotHour24 <= now.getHours();
  };

  const handleProceedClick = () => {
    if (!selectedDate) {
      alert('Please select a service date.');
      return;
    }
    if (!selectedTime) {
      alert('Please select a preferred time slot.');
      return;
    }
    onProceed({ bookingDate: selectedDate, bookingTime: selectedTime });
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
          Step 3 of 4: Date & Time
        </span>
      </div>

      {/* Calendar Card */}
      <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                {monthNames[currentMonth]} {currentYear}
              </h3>
              <p className="text-xs text-slate-500">Real dynamic booking schedule</p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={handlePrevMonth}
              disabled={currentYear === now.getFullYear() && currentMonth <= now.getMonth()}
              className="p-2 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={handleNextMonth}
              className="p-2 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Days grid */}
        <div className="grid grid-cols-7 gap-1 sm:gap-2 text-center text-xs">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
            <div key={d} className="font-bold text-slate-400 py-1 uppercase tracking-wider text-[11px]">
              {d}
            </div>
          ))}

          {daysArray.map((day, idx) => {
            if (day === null) {
              return <div key={`empty-${idx}`} className="p-2" />;
            }

            const isPast = isDateInPast(day);
            const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const isSelected = selectedDate === dateStr;
            const isToday = dateStr === todayStr;

            return (
              <button
                key={day}
                type="button"
                disabled={isPast}
                onClick={() => handleDaySelect(day)}
                className={`p-2.5 sm:p-3 rounded-2xl font-bold transition-all relative flex flex-col items-center justify-center ${
                  isSelected
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                    : isPast
                    ? 'text-slate-300 cursor-not-allowed bg-slate-50/50'
                    : isToday
                    ? 'border-2 border-indigo-600 text-indigo-700 bg-indigo-50/40 hover:bg-indigo-50'
                    : 'text-slate-800 hover:bg-slate-100 border border-transparent'
                }`}
              >
                <span>{day}</span>
                {isToday && !isSelected && (
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 mt-0.5" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Operating Hours & Time Slots Card */}
      <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Operating Hours (8:00 AM – 10:00 PM)
              </h3>
              <p className="text-xs text-slate-500">Pick preferred arrival time slot</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {timeSlots.map((slot) => {
            const isPast = isSlotPast(slot.hour24);
            const isSelected = selectedTime === slot.value;

            return (
              <button
                key={slot.value}
                type="button"
                disabled={isPast}
                onClick={() => setSelectedTime(slot.value)}
                className={`py-3 px-3 rounded-2xl border text-xs sm:text-sm font-bold text-center transition-all ${
                  isSelected
                    ? 'border-indigo-600 bg-indigo-50 text-indigo-900 ring-2 ring-indigo-500/20'
                    : isPast
                    ? 'border-slate-100 bg-slate-50 text-slate-300 cursor-not-allowed'
                    : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700'
                }`}
              >
                <div>{slot.value}</div>
                {isPast && <div className="text-[10px] font-normal text-slate-400">Past slot</div>}
              </button>
            );
          })}
        </div>
      </div>

      {/* Floating Bottom Proceed */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 p-4 shadow-xl">
        <div className="max-w-2xl mx-auto flex items-center justify-between gap-4">
          <div className="text-xs">
            <span className="font-semibold text-slate-500">Scheduled: </span>
            <span className="font-bold text-slate-900">{selectedDate} at {selectedTime}</span>
          </div>

          <button
            type="button"
            onClick={handleProceedClick}
            className="px-6 sm:px-8 py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm sm:text-base flex items-center gap-2 shadow-lg shadow-indigo-600/30 transition-all active:scale-98"
          >
            <span>Proceed to Payment</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
