export default function isCode128(barcode: string) {
  // Regular expression to match Code 128 pattern
  let code128Regex = /^[\x00-\x7F]*[\x7F-\xFF][\x00-\x7F]*$/;

  return code128Regex.test(barcode);
}
