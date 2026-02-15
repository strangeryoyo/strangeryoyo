
export const formatCurrency = (value: number): string => {
  if (value < 1000) return value.toFixed(2);
  const suffixes = ['', 'k', 'M', 'B', 'T', 'Q', 'Qi', 'Sx', 'Sp', 'Oc', 'No', 'Dc'];
  const suffixNum = Math.floor(("" + value.toFixed(0)).length / 3);
  let shortValue = parseFloat((suffixNum !== 0 ? (value / Math.pow(1000, suffixNum)) : value).toPrecision(3));
  if (shortValue % 1 !== 0) {
    shortValue = parseFloat(shortValue.toFixed(2));
  }
  return shortValue + suffixes[suffixNum];
};

export const calculateUpgradeCost = (baseCost: number, count: number, exponent: number): number => {
  return Math.floor(baseCost * Math.pow(exponent, count));
};
