export default function isCode93(barcode: string) {
  // Regular expression to match Code 93 pattern
  let code93Regex = /^[\x00-\x7F]*\*[A-Z0-9\-\.\$\ \/]+\*[\x00-\x7F]*$/;

  return code93Regex.test(barcode);
}
