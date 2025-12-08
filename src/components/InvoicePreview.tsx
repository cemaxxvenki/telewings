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
        <p className="text-xs font-bold">TAX INVOICE (ORIGINAL FOR RECEIPIENT)</p>
      </div>

      {/* Company Name with Logo */}
      <div className="flex items-center justify-center gap-4 border-b border-black pb-2 mb-2">
        {data.company.logo && (
          <img src={data.company.logo} alt="Company Logo" className="h-12 w-auto object-contain" />
        )}
        <h1 className="text-xl font-bold">{data.company.name}</h1>
      </div>

      {/* Invoice Details Grid */}
      <div className="grid grid-cols-2 border border-black text-xs">
        {/* Left Column */}
        <div className="border-r border-black">
          <div className="border-b border-black p-1">
            <span className="font-semibold">{data.company.address}</span>
          </div>
          <div className="border-b border-black p-1">
            <span className="font-semibold">GSTIN: </span>
            <span>{data.company.gstin}</span>
          </div>
          <div className="border-b border-black p-1">
            <span className="font-semibold">Supplier's Ref.: </span>
            <span>{data.supplierRef || ""}</span>
          </div>
          <div className="p-1">
            <span className="font-semibold">State: </span>
            <span>{data.company.state}</span>
            <span className="ml-4 font-semibold">Code: </span>
            <span>{data.company.stateCode}</span>
          </div>
        </div>

        {/* Right Column */}
        <div>
          <div className="border-b border-black p-1">
            <span className="font-semibold">Invoice No.: </span>
            <span>{data.invoiceNo}</span>
          </div>
          <div className="border-b border-black p-1">
            <span className="font-semibold">Dated: </span>
            <span>{formatDate(data.invoiceDate)}</span>
          </div>
          <div className="border-b border-black p-1">
            <span className="font-semibold">Delivery Note: </span>
            <span>{data.deliveryNote || ""}</span>
          </div>
          <div className="p-1">
            <span className="font-semibold">Mode/Terms of Payment: </span>
            <span>{data.paymentTerms || ""}</span>
          </div>
        </div>
      </div>

      {/* Buyer Details */}
      <div className="grid grid-cols-2 border-x border-b border-black text-xs">
        <div className="border-r border-black">
          <div className="bg-gray-100 p-1 font-bold border-b border-black">
            {data.customer.name}
          </div>
          <div className="p-1 border-b border-black">{data.customer.address}</div>
          <div className="p-1">
            <span className="font-semibold">GSTIN: </span>
            <span>{data.customer.gstin}</span>
          </div>
        </div>
        <div>
          <div className="border-b border-black p-1">
            <span className="font-semibold">Buyer's Order No.: </span>
            <span>{data.buyerOrderNo || ""}</span>
            <span className="ml-2 font-semibold">Dated: </span>
            <span>{data.buyerOrderDate || ""}</span>
          </div>
          <div className="border-b border-black p-1">
            <span className="font-semibold">Dispatch Doc No.: </span>
            <span>{data.dispatchDocNo || ""}</span>
          </div>
          <div className="border-b border-black p-1">
            <span className="font-semibold">Dispatch through: </span>
            <span>{data.dispatchThrough || ""}</span>
          </div>
          <div className="p-1">
            <span className="font-semibold">Destination: </span>
            <span>{data.destination || ""}</span>
          </div>
        </div>
      </div>

      {/* Items Table */}
      <table className="w-full border-x border-b border-black text-xs border-collapse">
        <thead>
          <tr className="bg-gray-100">
            <th className="border border-black p-1 w-10">Sl No.</th>
            <th className="border border-black p-1">Description of Goods</th>
            <th className="border border-black p-1 w-16">HSN/SAC</th>
            <th className="border border-black p-1 w-16">GST Rate</th>
            <th className="border border-black p-1 w-14">Quantity</th>
            <th className="border border-black p-1 w-16">Rate per</th>
            <th className="border border-black p-1 w-20">Amount</th>
          </tr>
        </thead>
        <tbody>
          {data.items.map((item) => (
            <tr key={item.id}>
              <td className="border border-black p-1 text-center">{item.slNo}</td>
              <td className="border border-black p-1">{item.description}</td>
              <td className="border border-black p-1 text-center">{item.hsnSac}</td>
              <td className="border border-black p-1 text-center">{item.gstRate}%</td>
              <td className="border border-black p-1 text-right">{item.quantity}</td>
              <td className="border border-black p-1 text-right">{item.rate}</td>
              <td className="border border-black p-1 text-right">{formatCurrency(item.amount)}</td>
            </tr>
          ))}
          {/* Empty rows for spacing */}
          {data.items.length < 5 &&
            Array(5 - data.items.length)
              .fill(0)
              .map((_, i) => (
                <tr key={`empty-${i}`}>
                  <td className="border border-black p-1">&nbsp;</td>
                  <td className="border border-black p-1">&nbsp;</td>
                  <td className="border border-black p-1">&nbsp;</td>
                  <td className="border border-black p-1">&nbsp;</td>
                  <td className="border border-black p-1">&nbsp;</td>
                  <td className="border border-black p-1">&nbsp;</td>
                  <td className="border border-black p-1">&nbsp;</td>
                </tr>
              ))}
        </tbody>
      </table>

      {/* Totals */}
      <div className="grid grid-cols-7 border-x border-b border-black text-xs">
        <div className="col-span-6 border-r border-black p-1 text-right font-semibold">CGST:</div>
        <div className="p-1 text-right">{formatCurrency(cgst)}</div>
      </div>
      <div className="grid grid-cols-7 border-x border-b border-black text-xs">
        <div className="col-span-6 border-r border-black p-1 text-right font-semibold">SGST:</div>
        <div className="p-1 text-right">{formatCurrency(sgst)}</div>
      </div>
      <div className="grid grid-cols-7 border-x border-b border-black text-xs">
        <div className="col-span-6 border-r border-black p-1 text-right font-semibold">P&F:</div>
        <div className="p-1 text-right">{formatCurrency(data.pAndF)}</div>
      </div>
      <div className="grid grid-cols-7 border-x border-b border-black text-xs">
        <div className="col-span-6 border-r border-black p-1 text-right font-semibold">Round off:</div>
        <div className="p-1 text-right">{formatCurrency(data.roundOff)}</div>
      </div>
      <div className="grid grid-cols-7 border-x border-b border-black text-xs font-bold bg-gray-100">
        <div className="col-span-6 border-r border-black p-1 text-right">Total:</div>
        <div className="p-1 text-right">{formatCurrency(grandTotal)}</div>
      </div>

      {/* Amount in Words */}
      <div className="border-x border-b border-black p-1 text-xs">
        <span className="font-semibold">Amount Chargeable (in words): </span>
        <span className="font-bold">{numberToWords(grandTotal)}</span>
      </div>

      {/* Tax Breakdown Table */}
      <table className="w-full border-x border-b border-black text-xs border-collapse mt-2">
        <thead>
          <tr className="bg-gray-100">
            <th className="border border-black p-1">HSN/SAC</th>
            <th className="border border-black p-1">Taxable Value</th>
            <th className="border border-black p-1">Central Tax</th>
            <th className="border border-black p-1">State Tax</th>
            <th className="border border-black p-1">Total Tax</th>
          </tr>
        </thead>
        <tbody>
          {taxBreakdown.map((tax, idx) => (
            <tr key={idx}>
              <td className="border border-black p-1 text-center">{tax.hsnSac}</td>
              <td className="border border-black p-1 text-right">{formatCurrency(tax.taxableValue)}</td>
              <td className="border border-black p-1 text-right">
                {tax.cgstRate}% - {formatCurrency(tax.cgstAmount)}
              </td>
              <td className="border border-black p-1 text-right">
                {tax.sgstRate}% - {formatCurrency(tax.sgstAmount)}
              </td>
              <td className="border border-black p-1 text-right">{formatCurrency(tax.totalTax)}</td>
            </tr>
          ))}
          <tr className="font-bold">
            <td className="border border-black p-1 text-center">Total</td>
            <td className="border border-black p-1 text-right">{formatCurrency(subtotal)}</td>
            <td className="border border-black p-1 text-right">{formatCurrency(cgst)}</td>
            <td className="border border-black p-1 text-right">{formatCurrency(sgst)}</td>
            <td className="border border-black p-1 text-right">{formatCurrency(totalTax)}</td>
          </tr>
        </tbody>
      </table>

      {/* Tax Amount in Words */}
      <div className="border-x border-b border-black p-1 text-xs">
        <span className="font-semibold">Tax Amount (in words): </span>
        <span>{numberToWords(totalTax)}</span>
      </div>

      {/* Footer Grid */}
      <div className="grid grid-cols-2 border-x border-b border-black text-xs">
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
        <div className="p-2 flex flex-col justify-between">
          <div className="text-center text-xs text-gray-500">Customer's Seal and Signature</div>
          <div className="text-right mt-8">
            <div className="font-bold">For {data.company.name}</div>
            <div className="mt-8 border-t border-black pt-1">Authorised Signatory</div>
          </div>
        </div>
      </div>

      {/* Footer Note */}
      <div className="text-center text-xs text-gray-500 mt-2">
        This is a Computer Generated Invoice
      </div>
    </div>
  );
};
