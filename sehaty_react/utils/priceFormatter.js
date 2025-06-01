/**
 * Formats a price number to always show 2 decimal places
 * @param {number} price - The price to format
 * @returns {string} The formatted price string
 */
export const formatPrice = (price) => {
  if (typeof price !== 'number') {
    price = parseFloat(price);
  }
  return price.toFixed(2);
};

/**
 * Formats a price with currency symbol
 * @param {number} price - The price to format
 * @param {string} currency - The currency symbol (default: 'EGP')
 * @returns {string} The formatted price string with currency
 */
export const formatPriceWithCurrency = (price, currency = 'EGP') => {
  return `${currency} ${formatPrice(price)}`;
}; 