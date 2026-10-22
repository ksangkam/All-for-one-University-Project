const toSatang = (value, name) => {
  if (typeof value !== 'number' || !Number.isFinite(value) || value < 0) throw new RangeError(`${name} must be a non-negative finite number`);
  return Math.round((value + Number.EPSILON) * 100);
};

export function calculatePricing({ dailyPrice, rentalDays, deposit = 0, protectionSelected = false }) {
  if (!Number.isInteger(rentalDays) || rentalDays <= 0) throw new RangeError('rentalDays must be a positive integer');
  const daily = toSatang(dailyPrice, 'dailyPrice');
  const depositSatang = toSatang(deposit, 'deposit');
  const rentalTotal = daily * rentalDays;
  const protectionFee = protectionSelected ? Math.round(rentalTotal * 0.05) : 0;
  const platformFee = Math.round(rentalTotal * 0.12);
  const communityFund = Math.round(platformFee * 0.02);
  return {
    rentalDays, dailyPrice: daily, rentalTotal, deposit: depositSatang,
    protectionFee, platformFee, communityFund,
    totalDue: rentalTotal + protectionFee + depositSatang,
    ownerNet: rentalTotal - platformFee,
  };
}

export function rentalDaysBetween(start, end) {
  const a = new Date(`${start}T00:00:00Z`);
  const b = new Date(`${end}T00:00:00Z`);
  if (!Number.isFinite(a.getTime()) || !Number.isFinite(b.getTime()) || b <= a) throw new RangeError('Return date must be after pickup date');
  return Math.round((b - a) / 86400000);
}

export const formatBaht = (satang) => new Intl.NumberFormat('th-TH', { maximumFractionDigits: 2 }).format(satang / 100);
