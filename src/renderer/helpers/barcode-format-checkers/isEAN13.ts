export default function isEAN13(barcode: string) {
  // Check if the barcode is exactly 13 digits long
  if (barcode.length !== 13 || !/^\d+$/.test(barcode)) {
      return false;
  }

  // Calculate and validate checksum
  let sum = 0;
  for (let i = 0; i < 12; i++) {
      sum += parseInt(barcode[i]) * (i % 2 === 0 ? 1 : 3);
  }
  let checksum = (10 - (sum % 10)) % 10;

  return parseInt(barcode[12]) === checksum;
}
