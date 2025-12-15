import { CompanyDetails, CustomerDetails, SavedItem, SavedInvoice } from "@/types/invoice";

const COMPANY_KEY = "gst_invoice_company";
const CUSTOMERS_KEY = "gst_invoice_customers";
const ITEMS_KEY = "gst_invoice_items";
const INVOICE_COUNTER_KEY = "gst_invoice_counter";
const SAVED_INVOICES_KEY = "gst_saved_invoices";
const AUTH_KEY = "gst_invoice_auth";

export const saveCompanyDetails = (company: CompanyDetails): void => {
  localStorage.setItem(COMPANY_KEY, JSON.stringify(company));
};

export const getCompanyDetails = (): CompanyDetails | null => {
  const data = localStorage.getItem(COMPANY_KEY);
  return data ? JSON.parse(data) : null;
};

export const saveCustomer = (customer: CustomerDetails): void => {
  const customers = getCustomers();
  const existingIndex = customers.findIndex((c) => c.id === customer.id);
  if (existingIndex >= 0) {
    customers[existingIndex] = customer;
  } else {
    customer.id = crypto.randomUUID();
    customers.push(customer);
  }
  localStorage.setItem(CUSTOMERS_KEY, JSON.stringify(customers));
};

export const getCustomers = (): CustomerDetails[] => {
  const data = localStorage.getItem(CUSTOMERS_KEY);
  return data ? JSON.parse(data) : [];
};

export const deleteCustomer = (id: string): void => {
  const customers = getCustomers().filter((c) => c.id !== id);
  localStorage.setItem(CUSTOMERS_KEY, JSON.stringify(customers));
};

export const saveItem = (item: SavedItem): void => {
  const items = getSavedItems();
  const existingIndex = items.findIndex((i) => i.id === item.id);
  if (existingIndex >= 0) {
    items[existingIndex] = item;
  } else {
    item.id = crypto.randomUUID();
    items.push(item);
  }
  localStorage.setItem(ITEMS_KEY, JSON.stringify(items));
};

export const getSavedItems = (): SavedItem[] => {
  const data = localStorage.getItem(ITEMS_KEY);
  return data ? JSON.parse(data) : [];
};

export const deleteItem = (id: string): void => {
  const items = getSavedItems().filter((i) => i.id !== id);
  localStorage.setItem(ITEMS_KEY, JSON.stringify(items));
};

export const getNextInvoiceNumber = (): string => {
  const currentYear = new Date().getFullYear();
  const nextYear = currentYear + 1;
  const fiscalYear = `${currentYear.toString().slice(-2)}-${nextYear.toString().slice(-2)}`;
  
  const counterData = localStorage.getItem(INVOICE_COUNTER_KEY);
  let counter = 1;
  
  if (counterData) {
    const parsed = JSON.parse(counterData);
    if (parsed.fiscalYear === fiscalYear) {
      counter = parsed.counter + 1;
    }
  }
  
  localStorage.setItem(INVOICE_COUNTER_KEY, JSON.stringify({ fiscalYear, counter }));
  return `${fiscalYear}/${counter.toString().padStart(3, "0")}`;
};

// Saved Invoices Management
export const saveInvoice = (invoice: SavedInvoice): void => {
  const invoices = getSavedInvoices();
  const existingIndex = invoices.findIndex((i) => i.id === invoice.id);
  if (existingIndex >= 0) {
    invoices[existingIndex] = { ...invoice, updatedAt: new Date().toISOString() };
  } else {
    invoices.push(invoice);
  }
  localStorage.setItem(SAVED_INVOICES_KEY, JSON.stringify(invoices));
};

export const getSavedInvoices = (): SavedInvoice[] => {
  const data = localStorage.getItem(SAVED_INVOICES_KEY);
  return data ? JSON.parse(data) : [];
};

export const getInvoiceById = (id: string): SavedInvoice | null => {
  const invoices = getSavedInvoices();
  return invoices.find((i) => i.id === id) || null;
};

export const deleteInvoiceById = (id: string): void => {
  const invoices = getSavedInvoices().filter((i) => i.id !== id);
  localStorage.setItem(SAVED_INVOICES_KEY, JSON.stringify(invoices));
};

// Authentication
export const isAuthenticated = (): boolean => {
  return localStorage.getItem(AUTH_KEY) === "true";
};

export const setAuthenticated = (value: boolean): void => {
  if (value) {
    localStorage.setItem(AUTH_KEY, "true");
  } else {
    localStorage.removeItem(AUTH_KEY);
  }
};
