import { useState } from 'react';
import { Calculator, ArrowRight } from 'lucide-react';
import { useCurrency } from '../../context/CurrencyContext';
import Button from './Button';

export default function PlotCalculator() {
  const { formatPrice, currentCurrency } = useCurrency();
  const [katha, setKatha] = useState(3);
  const pricePerKathaUSD = 8500;
  const [downPaymentPercent, setDownPaymentPercent] = useState(20);
  const [months, setMonths] = useState(36);

  const totalPriceUSD = katha * pricePerKathaUSD;
  const downPaymentUSD = (totalPriceUSD * downPaymentPercent) / 100;
  const remainingUSD = totalPriceUSD - downPaymentUSD;
  const monthlyInstallmentUSD = months > 0 ? remainingUSD / months : 0;

  return (
    <div className="p-6 md:p-8 rounded-3xl bg-white shadow-premium border border-emerald-brand/10">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 rounded-2xl bg-emerald-brand/10 text-emerald-brand">
          <Calculator size={24} />
        </div>
        <div>
          <h3 className="text-xl font-bold text-deep-green">Plot Investment Estimator</h3>
          <p className="text-xs text-slate-500">Calculate plot prices and easy monthly installments in Bangladeshi Taka (৳)</p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Controls */}
        <div className="space-y-5">
          <div>
            <label className="block text-xs font-semibold text-deep-green mb-2">
              Plot Size (Katha): <span className="text-emerald-brand font-bold text-sm">{katha} Katha</span>
            </label>
            <div className="flex gap-2">
              {[3, 5, 7.5, 10].map((size) => (
                <button
                  key={size}
                  type="button"
                  onClick={() => setKatha(size)}
                  className={`flex-1 py-2 rounded-xl text-xs font-semibold border transition-all ${
                    katha === size
                      ? 'bg-emerald-brand text-white border-emerald-brand shadow-sm'
                      : 'border-slate-200 text-slate-700 hover:border-emerald-brand bg-white'
                  }`}
                >
                  {size} Katha
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-deep-green mb-2">
              Down Payment: <span className="text-emerald-brand font-bold text-sm">{downPaymentPercent}%</span>
            </label>
            <div className="flex gap-2">
              {[15, 20, 30, 50].map((pct) => (
                <button
                  key={pct}
                  type="button"
                  onClick={() => setDownPaymentPercent(pct)}
                  className={`flex-1 py-2 rounded-xl text-xs font-semibold border transition-all ${
                    downPaymentPercent === pct
                      ? 'bg-emerald-brand text-white border-emerald-brand shadow-sm'
                      : 'border-slate-200 text-slate-700 hover:border-emerald-brand bg-white'
                  }`}
                >
                  {pct}%
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-deep-green mb-2">
              Installment Period: <span className="text-emerald-brand font-bold text-sm">{months} Months</span>
            </label>
            <div className="flex gap-2">
              {[12, 24, 36, 60].map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setMonths(m)}
                  className={`flex-1 py-2 rounded-xl text-xs font-semibold border transition-all ${
                    months === m
                      ? 'bg-emerald-brand text-white border-emerald-brand shadow-sm'
                      : 'border-slate-200 text-slate-700 hover:border-emerald-brand bg-white'
                  }`}
                >
                  {m} Mos
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Results Card */}
        <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-col justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Estimated Breakdown</span>
            <div className="mt-3 space-y-3">
              <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                <span className="text-xs text-slate-600 font-medium">Total Estimated Price</span>
                <span className="text-base font-bold text-deep-green">{formatPrice(totalPriceUSD)}</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                <span className="text-xs text-slate-600 font-medium">Initial Booking ({downPaymentPercent}%)</span>
                <span className="text-sm font-semibold text-emerald-brand">{formatPrice(downPaymentUSD)}</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                <span className="text-xs text-slate-600 font-medium">Monthly Installment ({months} mos)</span>
                <span className="text-lg font-bold text-emerald-brand">{formatPrice(monthlyInstallmentUSD)} <span className="text-xs font-normal text-slate-500">/mo</span></span>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-200">
            <Button
              type="button"
              variant="primary"
              size="sm"
              className="w-full"
              onClick={() => {
                const estimatorData = {
                  katha,
                  downPaymentPercent,
                  months,
                  totalPriceUSD,
                  downPaymentUSD,
                  monthlyInstallmentUSD,
                  currencyCode: currentCurrency.code,
                  formattedTotal: formatPrice(totalPriceUSD),
                  formattedDownPayment: formatPrice(downPaymentUSD),
                  formattedMonthly: formatPrice(monthlyInstallmentUSD),
                };
                try {
                  sessionStorage.setItem('estimatorPlan', JSON.stringify(estimatorData));
                  window.dispatchEvent(new CustomEvent('applyEstimatorPlan', { detail: estimatorData }));
                } catch {
                  // ignore storage errors
                }
                const bookingElem = document.getElementById('booking');
                if (bookingElem) {
                  bookingElem.scrollIntoView({ behavior: 'smooth' });
                } else {
                  window.location.hash = 'booking';
                }
              }}
            >
              Apply for this Plot Plan <ArrowRight size={16} />
            </Button>
            <p className="text-[10px] text-center text-slate-400 mt-2">
              * Rates are indicative. Official pricing depends on plot orientation and block availability.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
