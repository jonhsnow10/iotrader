import React, { useState, useRef, useEffect } from 'react';

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

export function MonthYearSelector({ selectedDate, onDateChange }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [tempYear, setTempYear] = useState(selectedDate.getFullYear());
  const [tempMonth, setTempMonth] = useState(selectedDate.getMonth());
  const modalRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (modalRef.current && !modalRef.current.contains(e.target)) {
        setIsModalOpen(false);
      }
    };
    if (isModalOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'unset';
    };
  }, [isModalOpen]);

  const handlePrevMonth = () => {
    const newDate = new Date(selectedDate);
    newDate.setMonth(newDate.getMonth() - 1);
    onDateChange(newDate);
  };

  const handleNextMonth = () => {
    const newDate = new Date(selectedDate);
    newDate.setMonth(newDate.getMonth() + 1);
    onDateChange(newDate);
  };

  const handleConfirm = () => {
    onDateChange(new Date(tempYear, tempMonth, 1));
    setIsModalOpen(false);
  };

  const handleCancel = () => {
    setTempYear(selectedDate.getFullYear());
    setTempMonth(selectedDate.getMonth());
    setIsModalOpen(false);
  };

  const monthName = MONTHS[selectedDate.getMonth()];
  const year = selectedDate.getFullYear();

  return (
    <>
      <div className="flex items-center gap-2 md:gap-3">
        <button
          type="button"
          onClick={handlePrevMonth}
          className="text-white text-base md:text-lg hover:opacity-80 transition-opacity"
        >
          &lt;
        </button>
        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="px-4 md:px-6 py-1.5 md:py-2 bg-transparent border border-white rounded-lg text-white text-xs md:text-sm font-medium hover:opacity-80 transition-opacity min-w-[140px] md:min-w-[180px]"
        >
          {monthName} {year}
        </button>
        <button
          type="button"
          onClick={handleNextMonth}
          className="text-white text-base md:text-lg hover:opacity-80 transition-opacity"
        >
          &gt;
        </button>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div
            ref={modalRef}
            className="relative w-full max-w-2xl mx-4 bg-[#000] rounded-xl shadow-2xl border border-white/20 p-8"
          >
            <div className="flex items-center justify-between mb-6">
              <button type="button" onClick={() => setTempYear(tempYear - 1)} className="text-white text-xl hover:opacity-80">
                &lt;
              </button>
              <h2 className="text-white text-2xl font-semibold">{tempYear}</h2>
              <button type="button" onClick={() => setTempYear(tempYear + 1)} className="text-white text-xl hover:opacity-80">
                &gt;
              </button>
            </div>
            <div className="grid grid-cols-3 gap-4 mb-6">
              {MONTHS.map((month, index) => (
                <button
                  key={month}
                  type="button"
                  onClick={() => setTempMonth(index)}
                  className={`px-6 py-3 rounded-lg text-base font-medium transition-all ${
                    tempMonth === index
                      ? 'bg-[var(--color-accent-primary)] text-black'
                      : 'bg-transparent border border-white/40 text-white hover:bg-white/10'
                  }`}
                >
                  {month}
                </button>
              ))}
            </div>
            <div className="flex gap-4">
              <button
                type="button"
                onClick={handleCancel}
                className="flex-1 px-6 py-3 bg-transparent border border-white/40 text-white text-base font-semibold rounded-lg hover:bg-white/10 transition-all"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                className="flex-1 px-6 py-3 bg-[var(--color-accent-primary)] text-black text-base font-semibold rounded-lg hover:opacity-90 transition-all"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
