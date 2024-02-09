import { PrinterContext } from "UI/providers/PrinterProvider";
import { useContext } from "react";

export default function usePrinter () {
  const printer = useContext(PrinterContext);

  return printer;
}
