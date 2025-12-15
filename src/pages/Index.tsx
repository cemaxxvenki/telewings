import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CompanyDetailsForm } from "@/components/CompanyDetailsForm";
import { CustomerSelector } from "@/components/CustomerSelector";
import { InvoiceItemsTable } from "@/components/InvoiceItemsTable";
import { InvoicePreview } from "@/components/InvoicePreview";
import { InvoiceHistory } from "@/components/InvoiceHistory";
import { LoginPage } from "@/components/LoginPage";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CompanyDetails, CustomerDetails, InvoiceData, InvoiceItem, SavedInvoice } from "@/types/invoice";
import { getCompanyDetails, getNextInvoiceNumber, saveInvoice, isAuthenticated, setAuthenticated } from "@/utils/storage";
import { toast } from "sonner";
import { FileText, Download, Eye, Settings, ReceiptText, Save, History, LogOut } from "lucide-react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

const Index = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeTab, setActiveTab] = useState("invoice");
  const [company, setCompany] = useState<CompanyDetails | null>(null);
  const [customer, setCustomer] = useState<CustomerDetails | null>(null);
  const [invoiceType, setInvoiceType] = useState<'TAX' | 'PROFORMA'>('TAX');
  const [invoiceNo, setInvoiceNo] = useState("");
  const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().split("T")[0]);
  const [items, setItems] = useState<InvoiceItem[]>([]);
  const [pAndF, setPAndF] = useState(0);
  const [roundOff, setRoundOff] = useState(0);
  const [showPreview, setShowPreview] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [editingInvoiceId, setEditingInvoiceId] = useState<string | null>(null);

  // Optional fields
  const [deliveryNote, setDeliveryNote] = useState("");
  const [paymentTerms, setPaymentTerms] = useState("");
  const [supplierRef, setSupplierRef] = useState("");
  const [buyerOrderNo, setBuyerOrderNo] = useState("");
  const [buyerOrderDate, setBuyerOrderDate] = useState("");
  const [dispatchDocNo, setDispatchDocNo] = useState("");
  const [dispatchThrough, setDispatchThrough] = useState("");
  const [destination, setDestination] = useState("");

  useEffect(() => {
    setIsLoggedIn(isAuthenticated());
  }, []);

  useEffect(() => {
    if (isLoggedIn) {
      const savedCompany = getCompanyDetails();
      if (savedCompany) {
        setCompany(savedCompany);
      }
      if (!editingInvoiceId) {
        setInvoiceNo(getNextInvoiceNumber());
      }
    }
  }, [isLoggedIn, editingInvoiceId]);

  const handleLogin = () => {
    setAuthenticated(true);
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    setAuthenticated(false);
    setIsLoggedIn(false);
  };

  const invoiceData: InvoiceData = {
    invoiceType,
    invoiceNo,
    invoiceDate,
    deliveryNote,
    paymentTerms,
    supplierRef,
    buyerOrderNo,
    buyerOrderDate,
    dispatchDocNo,
    dispatchThrough,
    destination,
    company: company || {
      name: "",
      address: "",
      gstin: "",
      state: "",
      stateCode: "",
    },
    customer: customer || {
      name: "",
      address: "",
      gstin: "",
    },
    items,
    pAndF,
    roundOff,
  };

  const handleSaveInvoice = () => {
    if (!company) {
      toast.error("Please fill in company details first");
      setActiveTab("settings");
      return;
    }
    if (!customer) {
      toast.error("Please select or add a customer");
      return;
    }
    if (items.length === 0) {
      toast.error("Please add at least one item");
      return;
    }

    const savedInvoice: SavedInvoice = {
      id: editingInvoiceId || crypto.randomUUID(),
      invoiceData,
      createdAt: editingInvoiceId ? new Date().toISOString() : new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    saveInvoice(savedInvoice);
    toast.success(editingInvoiceId ? "Invoice updated!" : "Invoice saved!");
    
    // Reset form for new invoice
    resetForm();
  };

  const resetForm = () => {
    setEditingInvoiceId(null);
    setInvoiceNo(getNextInvoiceNumber());
    setInvoiceDate(new Date().toISOString().split("T")[0]);
    setCustomer(null);
    setItems([]);
    setPAndF(0);
    setRoundOff(0);
    setDeliveryNote("");
    setPaymentTerms("");
    setSupplierRef("");
    setBuyerOrderNo("");
    setBuyerOrderDate("");
    setDispatchDocNo("");
    setDispatchThrough("");
    setDestination("");
    setInvoiceType('TAX');
  };

  const handleEditInvoice = (savedInvoice: SavedInvoice) => {
    const data = savedInvoice.invoiceData;
    setEditingInvoiceId(savedInvoice.id);
    setInvoiceType(data.invoiceType || 'TAX');
    setInvoiceNo(data.invoiceNo);
    setInvoiceDate(data.invoiceDate);
    setCustomer(data.customer);
    setItems(data.items);
    setPAndF(data.pAndF);
    setRoundOff(data.roundOff);
    setDeliveryNote(data.deliveryNote || "");
    setPaymentTerms(data.paymentTerms || "");
    setSupplierRef(data.supplierRef || "");
    setBuyerOrderNo(data.buyerOrderNo || "");
    setBuyerOrderDate(data.buyerOrderDate || "");
    setDispatchDocNo(data.dispatchDocNo || "");
    setDispatchThrough(data.dispatchThrough || "");
    setDestination(data.destination || "");
    setActiveTab("invoice");
    toast.info(`Editing invoice ${data.invoiceNo}`);
  };

  const handleGeneratePDF = async () => {
    if (!company) {
      toast.error("Please fill in company details first");
      setActiveTab("settings");
      return;
    }
    if (!customer) {
      toast.error("Please select or add a customer");
      return;
    }
    if (items.length === 0) {
      toast.error("Please add at least one item");
      return;
    }

    setIsGenerating(true);
    setShowPreview(true);

    // Wait for preview to render
    await new Promise((resolve) => setTimeout(resolve, 500));

    try {
      const element = document.getElementById("invoice-preview");
      if (!element) {
        throw new Error("Invoice preview not found");
      }

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: "#ffffff",
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const imgWidth = 210;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);
      pdf.save(`Invoice_${invoiceNo.replace(/\//g, "_")}.pdf`);

      toast.success("PDF generated successfully!");
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast.error("Failed to generate PDF");
    } finally {
      setIsGenerating(false);
    }
  };

  if (!isLoggedIn) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-primary text-primary-foreground py-4 px-6 shadow-lg">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ReceiptText className="h-8 w-8" />
            <div>
              <h1 className="text-2xl font-bold">GST Invoice Generator</h1>
              <p className="text-sm opacity-90">Create professional GST compliant invoices</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="secondary"
              onClick={() => setShowPreview(!showPreview)}
              className="hidden md:flex"
            >
              <Eye className="h-4 w-4 mr-2" />
              {showPreview ? "Hide Preview" : "Show Preview"}
            </Button>
            <Button
              variant="secondary"
              onClick={handleSaveInvoice}
            >
              <Save className="h-4 w-4 mr-2" />
              {editingInvoiceId ? "Update" : "Save"}
            </Button>
            <Button
              onClick={handleGeneratePDF}
              disabled={isGenerating}
              className="bg-accent hover:bg-accent/90 text-accent-foreground"
            >
              <Download className="h-4 w-4 mr-2" />
              {isGenerating ? "Generating..." : "Download PDF"}
            </Button>
            <Button
              variant="outline"
              onClick={handleLogout}
              className="text-primary-foreground border-primary-foreground/30 hover:bg-primary-foreground/10"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6">
        <div className="space-y-6">
          {/* Form Section */}
          <div className="space-y-6">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="invoice" className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Invoice
                </TabsTrigger>
                <TabsTrigger value="history" className="flex items-center gap-2">
                  <History className="h-4 w-4" />
                  History
                </TabsTrigger>
                <TabsTrigger value="settings" className="flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  Company Settings
                </TabsTrigger>
              </TabsList>

              <TabsContent value="invoice" className="space-y-6 mt-6">
                {editingInvoiceId && (
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex items-center justify-between">
                    <span className="text-amber-800">Editing invoice: {invoiceNo}</span>
                    <Button variant="outline" size="sm" onClick={resetForm}>
                      Cancel Edit & Create New
                    </Button>
                  </div>
                )}

                {/* Invoice Details */}
                <div className="form-section animate-fade-in">
                  <div className="flex items-center gap-2 mb-4">
                    <FileText className="h-5 w-5 text-primary" />
                    <h2 className="text-lg font-semibold text-foreground">Invoice Details</h2>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <Label className="form-label">Invoice Type *</Label>
                      <Select value={invoiceType} onValueChange={(value: 'TAX' | 'PROFORMA') => setInvoiceType(value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="TAX">Tax Invoice</SelectItem>
                          <SelectItem value="PROFORMA">Proforma Invoice</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="form-label">Invoice No. *</Label>
                      <Input
                        value={invoiceNo}
                        onChange={(e) => setInvoiceNo(e.target.value)}
                        className="font-mono"
                      />
                    </div>
                    <div>
                      <Label className="form-label">Invoice Date *</Label>
                      <Input
                        type="date"
                        value={invoiceDate}
                        onChange={(e) => setInvoiceDate(e.target.value)}
                      />
                    </div>
                    <div>
                      <Label className="form-label">Destination</Label>
                      <Input
                        value={destination}
                        onChange={(e) => setDestination(e.target.value)}
                        placeholder="CBE"
                      />
                    </div>
                    <div>
                      <Label className="form-label">Delivery Note</Label>
                      <Input
                        value={deliveryNote}
                        onChange={(e) => setDeliveryNote(e.target.value)}
                      />
                    </div>
                    <div>
                      <Label className="form-label">Payment Terms</Label>
                      <Input
                        value={paymentTerms}
                        onChange={(e) => setPaymentTerms(e.target.value)}
                      />
                    </div>
                    <div>
                      <Label className="form-label">Dispatch Through</Label>
                      <Input
                        value={dispatchThrough}
                        onChange={(e) => setDispatchThrough(e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                {/* Customer Selection */}
                <CustomerSelector onSelect={setCustomer} selectedCustomer={customer} />

                {/* Items Table */}
                <InvoiceItemsTable items={items} onItemsChange={setItems} />

                {/* Additional Charges */}
                <div className="form-section animate-fade-in">
                  <h3 className="text-lg font-semibold text-foreground mb-4">Additional Charges</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="form-label">P&F (Packing & Forwarding)</Label>
                      <Input
                        type="number"
                        value={pAndF}
                        onChange={(e) => setPAndF(Number(e.target.value))}
                        min={0}
                        step={0.01}
                        className="font-mono"
                      />
                    </div>
                    <div>
                      <Label className="form-label">Round Off</Label>
                      <Input
                        type="number"
                        value={roundOff}
                        onChange={(e) => setRoundOff(Number(e.target.value))}
                        step={0.01}
                        className="font-mono"
                      />
                    </div>
                  </div>
                </div>

                {/* Mobile Preview Button */}
                <div className="lg:hidden">
                  <Button
                    variant="outline"
                    onClick={() => setShowPreview(!showPreview)}
                    className="w-full"
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    {showPreview ? "Hide Preview" : "Show Preview"}
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="history" className="mt-6">
                <InvoiceHistory onEdit={handleEditInvoice} />
              </TabsContent>

              <TabsContent value="settings" className="mt-6">
                <CompanyDetailsForm onSave={setCompany} initialData={company} />
              </TabsContent>
            </Tabs>
          </div>

          {/* Preview Section - Now at bottom */}
          {showPreview && (
            <div>
              <div className="form-section overflow-auto">
                <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                  <Eye className="h-5 w-5 text-primary" />
                  Invoice Preview
                </h3>
                <div className="border border-border rounded overflow-hidden">
                  <InvoicePreview data={invoiceData} />
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Index;
