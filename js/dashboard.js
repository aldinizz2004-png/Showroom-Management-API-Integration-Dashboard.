const EMPTY_STATS = {
  total: 0,
  available: 0,
  reserved: 0,
  sold: 0,
  totalValue: 0,
  averagePrice: 0,
};

export const calculateStats = (vehicles) => {
  if (vehicles.length === 0) return { ...EMPTY_STATS };

  const totals = vehicles.reduce(
    (acc, { status, price }) => ({
      ...acc,
      [status]: (acc[status] ?? 0) + 1,
      totalValue: acc.totalValue + price,
    }),
    { ...EMPTY_STATS }
  );

  return { ...totals, total: vehicles.length, averagePrice: totals.totalValue / vehicles.length };
};

const currency = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
});

export const renderStats = (stats) => {
  const { total, available, reserved, sold, totalValue, averagePrice } = stats;
  const values = {
    statTotal: total,
    statAvailable: available,
    statReserved: reserved,
    statSold: sold,
    statValue: currency.format(totalValue),
    statAverage: currency.format(averagePrice),
  };

  Object.entries(values).forEach(([id, value]) => {
    document.getElementById(id).textContent = value;
  });
};
