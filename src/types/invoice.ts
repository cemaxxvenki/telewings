// Invoice types for GST invoice generator

export interface CompanyDetails {
  id?: string;
  name: string;
  address: string;
  gstin: string;
  state: string;
  stateCode: string;
  pan?: string;
  bankName?: string;
  accountNumber?: string;
  accountHolderName?: string;
  ifscCode?: string;
  branch?: string;
  logo?: string;
  mobile?: string;
}

export interface CustomerDetails {
  id?: string;
  name: string;
  address: string;
  gstin: string;
  state?: string;
  stateCode?: string;
}

export interface InvoiceItem {
  id: string;
  slNo: number;
  description: string;
  hsnSac: string;
  gstRate: number;
  quantity: number;
  rate: number;
  amount: number;
}

export interface InvoiceData {
  invoiceNo: string;
  invoiceDate: string;
  deliveryNote?: string;
  paymentTerms?: string;
  supplierRef?: string;
  otherRef?: string;
  buyerOrderNo?: string;
  buyerOrderDate?: string;
  dispatchDocNo?: string;
  deliveryNoteDate?: string;
  dispatchThrough?: string;
  destination?: string;
  termsOfDelivery?: string;
  company: CompanyDetails;
  customer: CustomerDetails;
  items: InvoiceItem[];
  pAndF: number;
  roundOff: number;
}

export interface TaxBreakdown {
  hsnSac: string;
  taxableValue: number;
  cgstRate: number;
  cgstAmount: number;
  sgstRate: number;
  sgstAmount: number;
  totalTax: number;
}

export interface SavedItem {
  id: string;
  description: string;
  hsnSac: string;
  gstRate: number;
  rate: number;
}
