export interface IPrintReceiptDatum {
  text?: string;
  font?: "A" | "B";
  align?: "LT" | "CT" | "RT";
  style?: "NORMAL" | "B" | "I" | "U" | "U2" | "BI" | "BIU" | "BIU2" | "BU" | "BU2" | "IU" | "IU2";
  lineSpace?: number;
  feed?: number;
  drawLine?: boolean;
  size?: {
    width: number;
    height: number;
  };
  barcode?: {
    code: string,
    type?: "UPC_A" | "UPC_E" | "EAN13" | "EAN8" | "CODE39" | "ITF" | "NW7" | "CODE93" | "CODE128";
  },
  tableCustom?: {
    rows: {
      text: string;
      align?: "LEFT" | "CENTER" | "RIGHT";
      width?: number;
      style?: "A" | "B"
    }[],
    options?: {
      encoding?: string;
      size?: [
        width: number,
        height: number
      ];
    }
  }
}

export type IPrintReceiptData = IPrintReceiptDatum[];
