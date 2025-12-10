import { InvoiceData, TaxBreakdown } from "@/types/invoice";
import {
  calculateSubtotal,
  calculateTotalCGST,
  calculateTotalSGST,
  calculateGrandTotal,
  calculateTaxBreakdown,
  numberToWords,
  formatCurrency,
  formatDate,
} from "@/utils/invoiceCalculations";

interface InvoicePreviewProps {
  data: InvoiceData;
}

export const InvoicePreview = ({ data }: InvoicePreviewProps) => {
  const subtotal = calculateSubtotal(data.items);
  const cgst = calculateTotalCGST(data.items);
  const sgst = calculateTotalSGST(data.items);
  const grandTotal = calculateGrandTotal(data.items, data.pAndF, data.roundOff);
  const taxBreakdown = calculateTaxBreakdown(data.items);
  const totalTax = cgst + sgst;

  return (
    <div
      id="invoice-preview"
      className="bg-white text-black p-6 max-w-[210mm] mx-auto text-sm"
      style={{ fontFamily: "Arial, sans-serif" }}
    >
      {/* Header */}
      <div className="text-center border-b-2 border-black pb-2 mb-2">
        <p className="text-xs font-bold">
          {data.invoiceType === 'proforma' ? 'PROFORMA INVOICE' : 'TAX INVOICE'} (ORIGINAL FOR RECEIPIENT)
        </p>
      </div>

      {/* Company Header - Logo on Left, Name and Address on Right */}
      <div className="border border-black p-2 mb-0">
        <div className="flex items-start gap-4">
          {data.company.logo && (
            <img src={data.company.logo} alt="Company Logo" className="h-24 w-auto object-contain flex-shrink-0" />
          )}
          <div className="flex-1">
            <h1 className="text-xl font-bold">{data.company.name}</h1>
            <div className="text-xs mt-1">{data.company.address}</div>
            <div className="text-xs">
              <span className="font-semibold">GSTIN: </span>{data.company.gstin}
              <span className="ml-4 font-semibold">State: </span>{data.company.state}
              <span className="ml-2 font-semibold">Code: </span>{data.company.stateCode}
            </div>
            {data.company.mobile && (
              <div className="text-xs">
                <span className="font-semibold">Mobile: </span>{data.company.mobile}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Invoice Details Grid */}
      <div className="grid grid-cols-2 border-x border-b border-black text-xs">
        {/* Left Column - Customer Details Merged */}
        <div className="border-r border-black p-1">
          <div className="font-bold bg-gray-100 p-1 -m-1 mb-1 border-b border-black text-center align-middle">Buyer (Bill to)</div>
          <div className="font-semibold text-center align-middle">{data.customer.name}</div>
          <div className="text-center align-middle">{data.customer.address}</div>
          <div className="text-center align-middle"><span className="font-semibold">GSTIN: </span>{data.customer.gstin}</div>
          {data.customer.state && (
            <div className="text-center align-middle">
              <span className="font-semibold">State: </span>{data.customer.state}
              {data.customer.stateCode && (
                <><span className="ml-2 font-semibold">Code: </span>{data.customer.stateCode}</>
              )}
            </div>
          )}
          {data.customer.mobile && (
            <div className="text-center align-middle"><span className="font-semibold">Mobile: </span>{data.customer.mobile}</div>
          )}
        </div>

        {/* Right Column - Invoice Details */}
        <div>
          <div className="border-b border-black p-1 text-center align-middle">
            <span className="font-semibold">Invoice No.: </span>
            <span>{data.invoiceNo}</span>
          </div>
          <div className="border-b border-black p-1 text-center align-middle">
            <span className="font-semibold">Dated: </span>
            <span>{formatDate(data.invoiceDate)}</span>
          </div>
          <div className="border-b border-black p-1 text-center align-middle">
            <span className="font-semibold">Delivery Note: </span>
            <span>{data.deliveryNote || ""}</span>
          </div>
          <div className="border-b border-black p-1 text-center align-middle">
            <span className="font-semibold">Mode/Terms of Payment: </span>
            <span>{data.paymentTerms || ""}</span>
          </div>
          <div className="border-b border-black p-1 text-center align-middle">
            <span className="font-semibold">Buyer's Order No.: </span>
            <span>{data.buyerOrderNo || ""}</span>
            <span className="ml-2 font-semibold">Dated: </span>
            <span>{data.buyerOrderDate || ""}</span>
          </div>
          <div className="border-b border-black p-1 text-center align-middle">
            <span className="font-semibold">Dispatch Doc No.: </span>
            <span>{data.dispatchDocNo || ""}</span>
          </div>
          <div className="border-b border-black p-1 text-center align-middle">
            <span className="font-semibold">Dispatch through: </span>
            <span>{data.dispatchThrough || ""}</span>
          </div>
          <div className="p-1 text-center align-middle">
            <span className="font-semibold">Destination: </span>
            <span>{data.destination || ""}</span>
          </div>
        </div>
      </div>

      {/* Items Table */}
      <table className="w-full border-x border-b border-black text-xs border-collapse">
        <thead>
          <tr className="bg-gray-100">
            <th className="border border-black p-1 w-10 text-center align-middle">Sl No.</th>
            <th className="border border-black p-1 text-center align-middle">Description of Goods</th>
            <th className="border border-black p-1 w-16 text-center align-middle">HSN/SAC</th>
            <th className="border border-black p-1 w-16 text-center align-middle">GST Rate</th>
            <th className="border border-black p-1 w-14 text-center align-middle">Quantity</th>
            <th className="border border-black p-1 w-16 text-center align-middle">Rate per</th>
            <th className="border border-black p-1 w-20 text-center align-middle">Amount</th>
          </tr>
        </thead>
        <tbody>
          {data.items.map((item) => (
            <tr key={item.id}>
              <td className="border border-black p-1 text-center align-middle">{item.slNo}</td>
              <td className="border border-black p-1 text-left align-middle">{item.description}</td>
              <td className="border border-black p-1 text-center align-middle">{item.hsnSac}</td>
              <td className="border border-black p-1 text-center align-middle">{item.gstRate}%</td>
              <td className="border border-black p-1 text-center align-middle">{item.quantity}</td>
              <td className="border border-black p-1 text-center align-middle">{item.rate}</td>
              <td className="border border-black p-1 text-center align-middle">{formatCurrency(item.amount)}</td>
            </tr>
          ))}
          {/* Empty rows for spacing */}
          {data.items.length < 5 &&
            Array(5 - data.items.length)
              .fill(0)
              .map((_, i) => (
                <tr key={`empty-${i}`}>
                  <td className="border border-black p-1 align-middle">&nbsp;</td>
                  <td className="border border-black p-1 align-middle">&nbsp;</td>
                  <td className="border border-black p-1 align-middle">&nbsp;</td>
                  <td className="border border-black p-1 align-middle">&nbsp;</td>
                  <td className="border border-black p-1 align-middle">&nbsp;</td>
                  <td className="border border-black p-1 align-middle">&nbsp;</td>
                  <td className="border border-black p-1 align-middle">&nbsp;</td>
                </tr>
              ))}
        </tbody>
      </table>

      {/* Totals */}
      <div className="grid grid-cols-7 border-x border-b border-black text-xs">
        <div className="col-span-6 border-r border-black p-1 text-center align-middle font-semibold">CGST:</div>
        <div className="p-1 text-center align-middle">{formatCurrency(cgst)}</div>
      </div>
      <div className="grid grid-cols-7 border-x border-b border-black text-xs">
        <div className="col-span-6 border-r border-black p-1 text-center align-middle font-semibold">SGST:</div>
        <div className="p-1 text-center align-middle">{formatCurrency(sgst)}</div>
      </div>
      <div className="grid grid-cols-7 border-x border-b border-black text-xs">
        <div className="col-span-6 border-r border-black p-1 text-center align-middle font-semibold">P&F:</div>
        <div className="p-1 text-center align-middle">{formatCurrency(data.pAndF)}</div>
      </div>
      <div className="grid grid-cols-7 border-x border-b border-black text-xs">
        <div className="col-span-6 border-r border-black p-1 text-center align-middle font-semibold">Round off:</div>
        <div className="p-1 text-center align-middle">{formatCurrency(data.roundOff)}</div>
      </div>
      <div className="grid grid-cols-7 border-x border-b border-black text-xs font-bold bg-gray-100">
        <div className="col-span-6 border-r border-black p-1 text-center align-middle">Total:</div>
        <div className="p-1 text-center align-middle">{formatCurrency(grandTotal)}</div>
      </div>

      {/* Amount in Words */}
      <div className="border-x border-b border-black p-1 text-xs">
        <span className="font-semibold">Amount Chargeable (in words): </span>
        <span className="font-bold">{numberToWords(grandTotal)}</span>
      </div>

      {/* Tax Breakdown Table - Combined Totals */}
      <table className="w-full border-x border-b border-black text-xs border-collapse mt-2">
        <thead>
          <tr className="bg-gray-100">
            <th className="border border-black p-1 text-center align-middle">Taxable Value</th>
            <th className="border border-black p-1 text-center align-middle">Central Tax (CGST)</th>
            <th className="border border-black p-1 text-center align-middle">State Tax (SGST)</th>
            <th className="border border-black p-1 text-center align-middle">Total Tax Amount</th>
          </tr>
        </thead>
        <tbody>
          <tr className="font-semibold">
            <td className="border border-black p-1 text-center align-middle">{formatCurrency(subtotal)}</td>
            <td className="border border-black p-1 text-center align-middle">{formatCurrency(cgst)}</td>
            <td className="border border-black p-1 text-center align-middle">{formatCurrency(sgst)}</td>
            <td className="border border-black p-1 text-center align-middle">{formatCurrency(totalTax)}</td>
          </tr>
        </tbody>
      </table>

      {/* Tax Amount in Words */}
      <div className="border-x border-b border-black p-1 text-xs">
        <span className="font-semibold">Tax Amount (in words): </span>
        <span>{numberToWords(totalTax)}</span>
      </div>

      {/* Declaration */}
      <div className="border-x border-b border-black p-2 text-xs">
        <div className="font-bold mb-1">Declaration:</div>
        <div>We declare that this invoice shows the actual price of the goods described and that all particulars are true and correct.</div>
      </div>

      {/* Footer Grid - Bank Details, Customer Seal, Company Signature */}
      <div className="grid grid-cols-3 border-x border-b border-black text-xs">
        {/* Bank Details */}
        <div className="border-r border-black p-2">
          <div className="mb-1">
            <span className="font-semibold">Company's PAN: </span>
            <span>{data.company.pan}</span>
          </div>
          <div className="font-bold mt-2">Company's Bank Details</div>
          <div>
            <span className="font-semibold">A/c Holder's Name: </span>
            <span>{data.company.accountHolderName}</span>
          </div>
          <div>
            <span className="font-semibold">Bank Name: </span>
            <span>{data.company.bankName}</span>
          </div>
          <div>
            <span className="font-semibold">A/c No.: </span>
            <span>{data.company.accountNumber}</span>
          </div>
          <div>
            <span className="font-semibold">BRANCH & IFSC CODE: </span>
            <span>{data.company.ifscCode}</span>
          </div>
        </div>

        {/* Customer's Seal and Signature Column */}
        <div className="border-r border-black p-2 flex flex-col justify-between min-h-[120px]">
          <div className="font-semibold text-center">Customer's Seal and Signature</div>
          <div className="flex-1"></div>
        </div>

        {/* Company Signature Column */}
        <div className="p-2 flex flex-col justify-between min-h-[120px]">
          <div className="text-right font-bold">For {data.company.name}</div>
          <div className="flex-1 flex items-center justify-center">
            {data.company.seal && (
              <img src={data.company.seal} alt="Company Seal" className="h-16 w-auto object-contain" />
            )}
          </div>
          <div className="text-right border-t border-black pt-1">Authorised Signatory</div>
        </div>
      </div>

      {/* Footer Note */}
      <div className="text-center text-xs text-gray-500 mt-2">
        This is a Computer Generated Invoice
      </div>
    </div>
  );
};