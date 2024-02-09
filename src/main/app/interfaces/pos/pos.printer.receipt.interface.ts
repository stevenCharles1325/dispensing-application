interface IPrintReceiptDatum {
  text?: string;
  font?: "A" | "B";
  align?: "LT" | "CT" | "RT";
  style?: "NORMAL" | "B" | "I" | "U" | "U2" | "BI" | "BIU" | "BIU2" | "BU" | "BU2" | "IU" | "IU2";
  lineSpace?: number;
  feed?: number;
  drawLine?: boolean;
  size?: {
    width: 1 | 2;
    height: 1 | 2;
  };
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
