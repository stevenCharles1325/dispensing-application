export default function isEAN8(barcode: string) {
  // Check if the barcode is exactly 8 digits long
  if (barcode.length !== 8 || !/^\d+$/.test(barcode)) {
      return false;
  }

  // Calculate and validate checksum
  let sum = 0;
  for (let i = 0; i < 7; i++) {
      sum += parseInt(barcode[i]) * (i % 2 === 0 ? 3 : 1);
  }
  let checksum = (10 - (sum % 10)) % 10;

  return parseInt(barcode[7]) === checksum;
}
