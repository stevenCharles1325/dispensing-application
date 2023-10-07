/* eslint-disable no-param-reassign */
/* eslint-disable no-plusplus */

type FormatCurrencyParams = (
  amount: number,
  currency?: 'peso' | 'dollar',
  decimalPlaces?: number
) => string;

const formatCurrency: FormatCurrencyParams = (
  amount = 0,
  currency = 'peso',
  decimalPlaces = 1
) => {
  const currencySign = {
    peso: '₱',
    dollar: '$',
  };

  const selectedCurrency = currencySign[currency];

  // Ensure amount is a number
  if (Number.isNaN(amount)) {
    return 'Invalid amount';
  }

  // Define the abbreviations for thousands, millions, billions, etc.
  const abbreviations = ['', 'K', 'M', 'B', 'T'];

  // Determine the appropriate abbreviation and divide the amount
  let abbreviationIndex = 0;
  while (amount >= 1000 && abbreviationIndex < abbreviations.length) {
    amount /= 1000;
    abbreviationIndex++;
  }

  // Round the amount to the specified decimal places
  const roundedAmount = parseFloat(amount.toString()).toFixed(decimalPlaces);

  // Combine the rounded amount with the currency symbol and abbreviation
  const formattedAmount = `${selectedCurrency}${roundedAmount}${
    abbreviations[abbreviationIndex] || ''
  }`;

  return formattedAmount;
};

export default formatCurrency;
