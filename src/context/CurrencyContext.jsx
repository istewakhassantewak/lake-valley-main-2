import { createContext, useContext, useState, useEffect } from 'react';

const CurrencyContext = createContext();

export const CURRENCIES = {
  BDT: { code: 'BDT', symbol: '৳', name: 'Bangladeshi Taka', rate: 118.0, flag: '🇧🇩' },
  USD: { code: 'USD', symbol: '$', name: 'US Dollar', rate: 1.0, flag: '🇺🇸' },
  EUR: { code: 'EUR', symbol: '€', name: 'Euro', rate: 0.92, flag: '🇪🇺' },
  GBP: { code: 'GBP', symbol: '£', name: 'British Pound', rate: 0.78, flag: '🇬🇧' },
  AED: { code: 'AED', symbol: 'AED', name: 'UAE Dirham', rate: 3.67, flag: '🇦🇪' },
};

export function CurrencyProvider({ children }) {
  const [currency, setCurrencyState] = useState(() => {
    return 'BDT';
  });

  useEffect(() => {
    localStorage.setItem('lake_valley_currency', 'BDT');
  }, [currency]);

  const setCurrency = (code) => {
    if (CURRENCIES[code]) {
      setCurrencyState(code);
    }
  };

  const formatPrice = (amountUSD) => {
    if (typeof amountUSD !== 'number' || isNaN(amountUSD)) return '৳ 0';
    const curr = CURRENCIES[currency] || CURRENCIES.BDT;
    const converted = amountUSD * (curr.rate || 118.0);

    return `৳ ${Math.round(converted).toLocaleString('en-IN')}`;
  };

  return (
    <CurrencyContext.Provider value={{ currency: 'BDT', setCurrency, formatPrice, currentCurrency: CURRENCIES.BDT }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const ctx = useContext(CurrencyContext);
  if (!ctx) {
    throw new Error('useCurrency must be used within CurrencyProvider');
  }
  return ctx;
}
