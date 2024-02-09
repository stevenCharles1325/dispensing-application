import IStorage from "../storage/storage.interface";

interface IPrintDataAttr {
  id?: string;
  class?: string;
  style?: string;
}

export interface IPrintData {
  element: string;
  attributes?: IPrintDataAttr,
  htmlText?: string;
  htmlTextPosition?: string;
  children?: IPrintData[];
}

export interface IPrintOptions {
  printer?: string;
  pages?: string;
  subset?: string;
  orientation?: string;
  scale?: string;
  monochrome?: boolean;
  side?: string;
  bin?: string;
  paperSize?: string;
  silent?: boolean;
  printDialog?: boolean;
  sumatraPdfPath?: string;
  copies?: number;
  globalStorage?: IStorage;
  [key: string]: any;
}


