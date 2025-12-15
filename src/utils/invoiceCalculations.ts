import { InvoiceItem, TaxBreakdown } from "@/types/invoice";

export const calculateItemAmount = (quantity: number, rate: number): number => {
  return quantity * rate;
};

export const calculateTaxBreakdown = (items: InvoiceItem[]): TaxBreakdown[] => {
  const hsnGroups: Record<string, TaxBreakdown> = {};

  items.forEach((item) => {
    const key = `${item.hsnSac}-${item.gstRate}`;
    if (!hsnGroups[key]) {
      hsnGroups[key] = {
        hsnSac: item.hsnSac,
        taxableValue: 0,
        cgstRate: item.gstRate / 2,
        cgstAmount: 0,
        sgstRate: item.gstRate / 2,
        sgstAmount: 0,
        totalTax: 0,
      };
    }
    hsnGroups[key].taxableValue += item.amount;
    hsnGroups[key].cgstAmount += (item.amount * item.gstRate) / 200;
    hsnGroups[key].sgstAmount += (item.amount * item.gstRate) / 200;
    hsnGroups[key].totalTax +=
      hsnGroups[key].cgstAmount + hsnGroups[key].sgstAmount;
  });

  return Object.values(hsnGroups);
};

export const calculateSubtotal = (items: InvoiceItem[]): number => {
  return items.reduce((sum, item) => sum + item.amount, 0);
};

export const calculateTotalCGST = (items: InvoiceItem[]): number => {
  return items
    .filter(item => item.gstType !== 'IGST')
    .reduce((sum, item) => sum + (item.amount * item.gstRate) / 200, 0);
};

export const calculateTotalSGST = (items: InvoiceItem[]): number => {
  return items
    .filter(item => item.gstType !== 'IGST')
    .reduce((sum, item) => sum + (item.amount * item.gstRate) / 200, 0);
};

export const calculateTotalIGST = (items: InvoiceItem[]): number => {
  return items
    .filter(item => item.gstType === 'IGST')
    .reduce((sum, item) => sum + (item.amount * item.gstRate) / 100, 0);
};

export const calculateGrandTotal = (
  items: InvoiceItem[],
  pAndF: number = 0,
  roundOff: number = 0
): number => {
  const subtotal = calculateSubtotal(items);
  const cgst = calculateTotalCGST(items);
  const sgst = calculateTotalSGST(items);
  const igst = calculateTotalIGST(items);
  return subtotal + cgst + sgst + igst + pAndF + roundOff;
};

export const numberToWords = (num: number): string => {
  // Round to 2 decimal places first to avoid floating point issues
  num = Math.round(num * 100) / 100;
  
  const ones = [
    "", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine",
    "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen",
    "Seventeen", "Eighteen", "Nineteen",
  ];
  const tens = [
    "", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety",
  ];

  if (num === 0) return "Zero";

  const convertLessThanHundred = (n: number): string => {
    if (n === 0) return "";
    if (n < 20) return ones[n];
    return tens[Math.floor(n / 10)] + (n % 10 ? " " + ones[n % 10] : "");
  };

  const convertLessThanThousand = (n: number): string => {
    if (n === 0) return "";
    if (n < 100) return convertLessThanHundred(n);
    const hundreds = Math.floor(n / 100);
    const remainder = n % 100;
    return ones[hundreds] + " Hundred" + (remainder ? " and " + convertLessThanHundred(remainder) : "");
  };

  const convert = (n: number): string => {
    if (n === 0) return "";
    
    const crore = Math.floor(n / 10000000);
    const lakh = Math.floor((n % 10000000) / 100000);
    const thousand = Math.floor((n % 100000) / 1000);
    const remainder = n % 1000;

    let result = "";
    if (crore) result += convertLessThanThousand(crore) + " Crore ";
    if (lakh) result += convertLessThanThousand(lakh) + " Lakh ";
    if (thousand) result += convertLessThanThousand(thousand) + " Thousand ";
    if (remainder) {
      if (crore || lakh || thousand) {
        if (remainder < 100) {
          result += "and ";
        }
      }
      result += convertLessThanThousand(remainder);
    }

    return result.trim();
  };

  const rupees = Math.floor(num);
  const paise = Math.round((num * 100) % 100);

  let result = "Rupees " + convert(rupees);
  if (paise > 0) {
    result += " and " + convert(paise) + " Paise";
  }
  result += " Only";

  return result;
};

export const formatCurrency = (amount: number): string => {
  return amount.toFixed(2);
};

export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  const day = date.getDate().toString().padStart(2, "0");
  const monthNames = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
  ];
  const month = monthNames[date.getMonth()];
  const year = date.getFullYear().toString().slice(-2);
  return `${day}-${month}-${year}`;
};
