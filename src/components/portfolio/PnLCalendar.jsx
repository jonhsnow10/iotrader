import React, { useMemo } from 'react';

/**
 * Daily PnL map: { 'YYYY-MM-DD': number }
 * Can be from trade history or passed as stub empty object.
 */
export function PnLCalendar({ selectedDate, dailyPnL = {} }) {
  const year = selectedDate.getFullYear();
  const month = selectedDate.getMonth();

  const daysOfWeek = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

  const getDaysInMonth = () => {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    return { daysInMonth, startingDayOfWeek };
  };

  const formatPnL = (value) => {
    const v = Number(value);
    if (v === 0) return '0.00';
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
      signDisplay: 'never',
    }).format(Math.abs(v));
  };

  const renderCalendarDays = useMemo(() => {
    const days = [];
    const { daysInMonth, startingDayOfWeek } = getDaysInMonth();
    const prevMonth = new Date(year, month, 0);
    const prevMonthDays = prevMonth.getDate();

    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      const day = prevMonthDays - i;
      days.push(
        <div
          key={`prev-${i}`}
          className="w-full h-full border border-white/45 rounded-[2px] flex flex-col items-center justify-center opacity-50 py-0.5 sm:py-1 select-none"
        >
          <div className="text-white font-medium leading-none text-[10px] sm:text-[12px]">{day}</div>
          <div className="text-white/50 leading-none mt-0.5 text-[8px] sm:text-[10px]">0.00</div>
        </div>
      );
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const dateKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const pnl = dailyPnL[dateKey] ?? 0;
      const isPositive = pnl >= 0;

      days.push(
        <div
          key={day}
          className="w-full h-full border border-white/45 rounded-[2px] flex flex-col items-center justify-center hover:bg-white/5 transition-colors cursor-pointer py-0.5 sm:py-1 select-none"
        >
          <div className="text-white font-medium leading-none text-[10px] sm:text-[12px]">{day}</div>
          <div
            className={`leading-none mt-0.5 text-[8px] sm:text-[10px] ${
              pnl === 0 ? 'text-white/50' : isPositive ? 'text-[#22c55e]' : 'text-[#ef4444]'
            }`}
          >
            {formatPnL(pnl)}
          </div>
        </div>
      );
    }

    const totalCells = startingDayOfWeek + daysInMonth;
    const remainingDays = Math.max(0, 35 - totalCells);
    for (let day = 1; day <= remainingDays; day++) {
      days.push(
        <div
          key={`next-${day}`}
          className="w-full h-full border border-white/45 rounded-[2px] flex flex-col items-center justify-center opacity-50 py-0.5 sm:py-1 select-none"
        >
          <div className="text-white font-medium leading-none text-[10px] sm:text-[12px]">{day}</div>
          <div className="text-white/50 leading-none mt-0.5 text-[8px] sm:text-[10px]">0.00</div>
        </div>
      );
    }

    return days;
  }, [year, month, dailyPnL]);

  return (
    <div className="w-full h-full flex flex-col">
      <div className="grid grid-cols-7 w-full gap-x-px">
        {daysOfWeek.map((day, index) => (
          <div
            key={`${day}-${index}`}
            className="text-center text-white/80 font-medium leading-none pb-0.5 text-[10px] sm:text-[12px]"
          >
            {day}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 w-full gap-px auto-rows-[30px] sm:auto-rows-[38px] lg:auto-rows-[44px]">
        {renderCalendarDays}
      </div>
    </div>
  );
}
