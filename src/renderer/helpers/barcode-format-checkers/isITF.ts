export default function isITF(barcode: string) {
  // Check if the barcode has an even number of digits and consists only of numeric characters
  if (barcode.length % 2 !== 0 || !/^\d+$/.test(barcode)) {
      return false;
  }

  return true;
}
