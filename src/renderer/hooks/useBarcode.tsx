import { useContext } from "react";
import { BarcodeContext } from "UI/providers/BarcodeProvider";

export default function useBarcode () {
  const barcode = useContext(BarcodeContext);

  return barcode;
}
