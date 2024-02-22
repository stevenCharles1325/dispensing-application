export default function isCode39(barcode: string) {
  // Regular expression to match Code 39 pattern
  let code39Regex = /^[0-9A-Z\-\.\*\$\/\+\%\s]+$/;

  return code39Regex.test(barcode);
}
