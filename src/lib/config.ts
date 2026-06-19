export const EXCHANGE_CONFIG = {
  
  INR_TO_USD: 0.012,
  USD_TO_INR: 83.33,
  DEFAULT_CURRENCY_SYMBOL: {
    INR: '₹',
    USD: '$',
    GBP: '£',
    EUR: '€'
  }
};

export function formatCompensation(amount: string | number | bigint, currency: 'INR' | 'USD'): string {
  const numAmount = Number(amount);
  if (!numAmount || numAmount <= 0) return '—';

  if (currency === 'USD') {
   
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(numAmount);
  } else {
   
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(numAmount);
  }
}