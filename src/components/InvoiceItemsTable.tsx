import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { InvoiceItem, SavedItem } from "@/types/invoice";
import { getSavedItems, saveItem, deleteItem } from "@/utils/storage";
import { calculateItemAmount, formatCurrency } from "@/utils/invoiceCalculations";
import { toast } from "sonner";
import { Plus, Trash2, Save, Package } from "lucide-react";

interface InvoiceItemsTableProps {
  items: InvoiceItem[];
  onItemsChange: (items: InvoiceItem[]) => void;
}

const GST_RATES = [0, 5, 12, 18, 28];

export const InvoiceItemsTable = ({ items, onItemsChange }: InvoiceItemsTableProps) => {
  const [savedItems, setSavedItems] = useState<SavedItem[]>([]);

  useEffect(() => {
    setSavedItems(getSavedItems());
  }, []);

  const addItem = () => {
    const newItem: InvoiceItem = {
      id: crypto.randomUUID(),
      slNo: items.length + 1,
      description: "",
      hsnSac: "",
      gstRate: 18,
      quantity: 1,
      rate: 0,
      amount: 0,
    };
    onItemsChange([...items, newItem]);
  };

  const updateItem = (id: string, field: keyof InvoiceItem, value: string | number) => {
    const updatedItems = items.map((item) => {
      if (item.id === id) {
        const updated = { ...item, [field]: value };
        if (field === "quantity" || field === "rate") {
          updated.amount = calculateItemAmount(
            field === "quantity" ? Number(value) : item.quantity,
            field === "rate" ? Number(value) : item.rate
          );
        }
        return updated;
      }
      return item;
    });
    onItemsChange(updatedItems);
  };

  const removeItem = (id: string) => {
    const updatedItems = items
      .filter((item) => item.id !== id)
      .map((item, index) => ({ ...item, slNo: index + 1 }));
    onItemsChange(updatedItems);
  };

  const handleSelectSavedItem = (itemId: string, targetId: string) => {
    const savedItem = savedItems.find((i) => i.id === itemId);
    if (savedItem) {
      const updatedItems = items.map((item) => {
        if (item.id === targetId) {
          const updated = {
            ...item,
            description: savedItem.description,
            hsnSac: savedItem.hsnSac,
            gstRate: savedItem.gstRate,
            rate: savedItem.rate,
            amount: calculateItemAmount(item.quantity, savedItem.rate),
          };
          return updated;
        }
        return item;
      });
      onItemsChange(updatedItems);
    }
  };

  const saveCurrentItem = (item: InvoiceItem) => {
    if (!item.description) {
      toast.error("Please enter item description first");
      return;
    }
    const savedItem: SavedItem = {
      id: crypto.randomUUID(),
      description: item.description,
      hsnSac: item.hsnSac,
      gstRate: item.gstRate,
      rate: item.rate,
    };
    saveItem(savedItem);
    setSavedItems(getSavedItems());
    toast.success("Item saved for future use!");
  };

  return (
    <div className="form-section animate-fade-in">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Package className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold text-foreground">Invoice Items</h2>
        </div>
        <Button type="button" onClick={addItem} className="btn-primary">
          <Plus className="h-4 w-4 mr-1" />
          Add Item
        </Button>
      </div>

      <div className="overflow-x-auto">
        <table className="invoice-table">
          <thead>
            <tr>
              <th className="w-12">Sl No.</th>
              <th className="min-w-[200px]">Description of Goods</th>
              <th className="w-24">HSN/SAC</th>
              <th className="w-24">GST Rate</th>
              <th className="w-20">Qty</th>
              <th className="w-24">Rate</th>
              <th className="w-28">Amount</th>
              <th className="w-20">Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id}>
                <td className="text-center font-mono">{item.slNo}</td>
                <td>
                  <div className="space-y-1">
                    {savedItems.length > 0 && (
                      <Select onValueChange={(val) => handleSelectSavedItem(val, item.id)}>
                        <SelectTrigger className="h-7 text-xs">
                          <SelectValue placeholder="Load saved..." />
                        </SelectTrigger>
                        <SelectContent>
                          {savedItems.map((saved) => (
                            <SelectItem key={saved.id} value={saved.id}>
                              {saved.description}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                    <Input
                      value={item.description}
                      onChange={(e) => updateItem(item.id, "description", e.target.value)}
                      placeholder="Enter item description"
                      className="text-sm"
                    />
                  </div>
                </td>
                <td>
                  <Input
                    value={item.hsnSac}
                    onChange={(e) => updateItem(item.id, "hsnSac", e.target.value)}
                    placeholder="8544"
                    className="font-mono text-sm"
                  />
                </td>
                <td>
                  <Select
                    value={item.gstRate.toString()}
                    onValueChange={(val) => updateItem(item.id, "gstRate", Number(val))}
                  >
                    <SelectTrigger className="text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {GST_RATES.map((rate) => (
                        <SelectItem key={rate} value={rate.toString()}>
                          {rate}%
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </td>
                <td>
                  <Input
                    type="number"
                    value={item.quantity}
                    onChange={(e) => updateItem(item.id, "quantity", Number(e.target.value))}
                    min={1}
                    className="font-mono text-sm"
                  />
                </td>
                <td>
                  <Input
                    type="number"
                    value={item.rate}
                    onChange={(e) => updateItem(item.id, "rate", Number(e.target.value))}
                    min={0}
                    step={0.01}
                    className="font-mono text-sm"
                  />
                </td>
                <td className="font-mono text-right">{formatCurrency(item.amount)}</td>
                <td>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => saveCurrentItem(item)}
                      title="Save item for reuse"
                    >
                      <Save className="h-4 w-4 text-accent" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeItem(item.id)}
                      className="text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {items.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          No items added. Click "Add Item" to start.
        </div>
      )}
    </div>
  );
};
