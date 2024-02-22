export default function isUPCA(barcode: string) {
  // Check if the barcode is exactly 12 digits long
  if (barcode.length !== 12 || !/^\d+$/.test(barcode)) {
      return false;
  }

  // Calculate and validate checksum
  let sum = 0;
  for (let i = 0; i < 11; i += 2) {
      sum += parseInt(barcode[i]);
  }
  for (let i = 1; i < 12; i += 2) {
      sum += parseInt(barcode[i]) * 3;
  }
  let checksum = (10 - (sum % 10)) % 10;

  return parseInt(barcode[11]) === checksum;
}
