import React, { useState } from 'react';

interface DayData {
  date: Date;
  day: string;
  high: number;
  low: number;
  condition: string;
  icon: string;
  rainChance: number;
}

interface DayPickerProps {
  days: DayData[];
  onDaySelect?: (date: Date) => void;
  selectedDate?: Date;
}

const DayPicker: React.FC<DayPickerProps> = ({ days, onDaySelect, selectedDate }) => {
  const [selected, setSelected] = useState<number>(0);

  // Sync local state with selectedDate prop from parent
  React.useEffect(() => {
    if (selectedDate) {
      const index = days.findIndex(d => 
        d.date.getDate() === selectedDate.getDate() &&
        d.date.getMonth() === selectedDate.getMonth() &&
        d.date.getFullYear() === selectedDate.getFullYear()
      );
      if (index >= 0) setSelected(index);
    }
  }, [selectedDate, days]);

  const handleDayClick = (index: number, date: Date) => {
    setSelected(index);
    if (onDaySelect) {
      onDaySelect(date);
    }
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  return (
    <div className="w-full">
      {/* Horizontal scrollable container - Fixed height to prevent vertical overflow */}
      <div className="overflow-x-auto pb-2 scrollbar-hide max-h-64" style={{ scrollBehavior: 'smooth', scrollSnapType: 'x proximity' }} role="region" aria-label="7-day forecast day selector">
        <div className="flex gap-3 min-w-max px-4" role="list">
          {days.map((dayData, index) => {
            const isSelected = selected === index || (selectedDate && isToday(dayData.date));
            const dayName = isToday(dayData.date) ? 'Today' : dayData.day.slice(0, 3);

            return (
              <button
                key={index}
                onClick={() => handleDayClick(index, dayData.date)}
                style={{ scrollSnapAlign: 'center' }}
                aria-pressed={isSelected}
                aria-label={`${dayName}: ${dayData.high}° high, ${dayData.low}° low — ${dayData.condition}`}
                role="listitem"
                className={`flex flex-col items-center justify-center px-4 py-4 rounded-2xl transition-all duration-300 whitespace-nowrap flex-shrink-0 ${
                  isSelected
                    ? 'bg-gradient-to-br from-orange-500/80 to-orange-600/80 border border-orange-400/50 shadow-lg shadow-orange-500/30'
                    : 'bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20'
                }`}
              >
                {/* Day Name */}
                <p className={`text-sm font-semibold mb-2 ${isSelected ? 'text-white' : 'text-gray-400'}`}>
                  {dayName}
                </p>

                {/* Weather Icon */}
                <div className={`text-3xl mb-2 transition-transform ${isSelected ? 'scale-110' : ''}`}>
                  {dayData.icon}
                </div>

                {/* Temperature Range */}
                <div className="flex items-center gap-2 mb-2">
                  <span className={`text-lg font-bold ${isSelected ? 'text-white' : 'text-orange-400'}`}>
                    {dayData.high}°
                  </span>
                  <span className={`text-sm ${isSelected ? 'text-gray-200' : 'text-gray-500'}`}>
                    {dayData.low}°
                  </span>
                </div>

                {/* Rain Chance Indicator */}
                <div className="flex items-center gap-1">
                  <span className="text-xs text-cyan-400">💧</span>
                  <span className={`text-xs ${isSelected ? 'text-white' : 'text-gray-400'}`}>
                    {dayData.rainChance}%
                  </span>
                </div>

                {/* Condition Label */}
                <p className={`text-xs mt-2 capitalize ${isSelected ? 'text-gray-100' : 'text-gray-500'}`}>
                  {dayData.condition}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Custom scrollbar hide CSS */}
      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
};

export default DayPicker;
