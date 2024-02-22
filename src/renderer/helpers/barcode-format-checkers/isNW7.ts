export default function isNW7(barcode: string) {
  // Regular expression to match Codabar pattern
  let codabarRegex = /^[A-D][0-9\-\$\:\.\/\+\%]+[A-D]$/;

  return codabarRegex.test(barcode);
}
