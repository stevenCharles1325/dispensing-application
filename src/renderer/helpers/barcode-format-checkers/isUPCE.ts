export default function isUPCE(barcode: string) {
  // Check if the barcode is either 6 or 8 digits long
  if (barcode.length !== 6 && barcode.length !== 8 || !/^\d+$/.test(barcode)) {
      return false;
  }

  // Calculate and validate checksum
  let sum = 0;
  for (let i = 0; i < barcode.length - 1; i++) {
      sum += parseInt(barcode[i]) * (i % 2 === 0 ? 3 : 1);
  }
  let checksum = (10 - (sum % 10)) % 10;

  return parseInt(barcode[barcode.length - 1]) === checksum;
}
