import { useState, useRef, useEffect } from 'react';
import { Globe, ChevronDown } from 'lucide-react';
import { useCurrency, CURRENCIES } from '../../context/CurrencyContext';

export default function CurrencySelector({ isDark = false }) {
  const { currency, setCurrency, currentCurrency } = useCurrency();
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-xs font-semibold transition-all ${
          isDark
            ? 'border-white/20 text-white hover:bg-white/10'
            : 'border-emerald-brand/20 text-deep-green hover:border-emerald-brand bg-white/90 shadow-sm'
        }`}
        aria-label="Select currency"
        aria-expanded={open}
      >
        <Globe size={14} className="text-emerald-brand" />
        <span>{currentCurrency.flag} {currentCurrency.code}</span>
        <ChevronDown size={12} className={`transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-48 rounded-2xl bg-white shadow-premium border border-emerald-brand/10 z-50 py-2">
          <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100">
            Select Currency
          </div>
          <div className="py-1">
            {Object.values(CURRENCIES).map((item) => (
              <button
                key={item.code}
                type="button"
                onClick={() => {
                  setCurrency(item.code);
                  setOpen(false);
                }}
                className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-emerald-brand/10 transition-colors ${
                  currency === item.code ? 'font-bold text-emerald-brand bg-emerald-brand/5' : 'text-slate-800'
                }`}
              >
                <span className="flex items-center gap-2">
                  <span>{item.flag}</span>
                  <span>{item.name}</span>
                </span>
                <span className="text-slate-400 font-mono">{item.symbol}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
