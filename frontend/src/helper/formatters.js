/**
 * Formats a numeric value into the Indian Rupee standard format (e.g. ₹50,000, ₹1,25,000, ₹10,00,000)
 * @param {number|string} amount
 * @param {boolean} includeSymbol
 * @returns {string}
 */
export const formatINR = (amount, includeSymbol = true) => {
  if (amount === null || amount === undefined || isNaN(Number(amount))) {
    return includeSymbol ? "₹0" : "0";
  }
  const num = Number(amount);
  const formatted = num.toLocaleString("en-IN", {
    maximumFractionDigits: 2,
    minimumFractionDigits: 0,
  });
  return includeSymbol ? `₹${formatted}` : formatted;
};

/**
 * Formats large amounts into Lakhs or Crores shorthand (e.g. ₹1.25 L, ₹10.5 Cr)
 * @param {number|string} amount
 * @returns {string}
 */
export const formatINRLarge = (amount) => {
  const num = Number(amount) || 0;
  if (num >= 10000000) {
    return `₹${(num / 10000000).toFixed(2)} Cr`;
  }
  if (num >= 100000) {
    return `₹${(num / 100000).toFixed(2)} L`;
  }
  return formatINR(num);
};

export default formatINR;
