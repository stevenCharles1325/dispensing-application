import isCode128 from "./barcode-format-checkers/isCODE128";
import isCode39 from "./barcode-format-checkers/isCODE39";
import isCode93 from "./barcode-format-checkers/isCODE93";
import isEAN13 from "./barcode-format-checkers/isEAN13";
import isEAN8 from "./barcode-format-checkers/isEAN8";
import isITF from "./barcode-format-checkers/isITF";
import isNW7 from "./barcode-format-checkers/isNW7";
import isUPCA from "./barcode-format-checkers/isUPCA";
import isUPCE from "./barcode-format-checkers/isUPCE";

export default function getBarcodeFormat(barcode: string) {
  if (!barcode || !barcode?.length || typeof barcode !== 'string') return null;

  if (isUPCA(barcode)) return 'UPC_A';
  if (isUPCE(barcode)) return 'UPC_E';
  if (isEAN13(barcode)) return 'EAN13';
  if (isEAN8(barcode)) return 'EAN8';
  if (isCode39(barcode)) return 'CODE39';
  if (isCode93(barcode)) return 'CODE93';
  if (isCode128(barcode)) return 'CODE128';
  if (isITF(barcode)) return 'ITF';
  if (isNW7(barcode)) return 'NW7';

  return null;
}
