import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CustomerDetails } from "@/types/invoice";
import { getCustomers, saveCustomer, deleteCustomer } from "@/utils/storage";
import { toast } from "sonner";
import { Users, Plus, Trash2, Save } from "lucide-react";

interface CustomerSelectorProps {
  onSelect: (customer: CustomerDetails) => void;
  selectedCustomer?: CustomerDetails | null;
}

export const CustomerSelector = ({ onSelect, selectedCustomer }: CustomerSelectorProps) => {
  const [customers, setCustomers] = useState<CustomerDetails[]>([]);
  const [showForm, setShowForm] = useState(false);
  const { register, handleSubmit, reset, setValue } = useForm<CustomerDetails>();

  useEffect(() => {
    loadCustomers();
  }, []);

  useEffect(() => {
    if (selectedCustomer) {
      reset(selectedCustomer);
    }
  }, [selectedCustomer, reset]);

  const loadCustomers = () => {
    setCustomers(getCustomers());
  };

  const onSubmit = (data: CustomerDetails) => {
    saveCustomer(data);
    loadCustomers();
    onSelect(data);
    toast.success("Customer saved!");
    setShowForm(false);
  };

  const handleDelete = (id: string) => {
    deleteCustomer(id);
    loadCustomers();
    toast.success("Customer deleted!");
  };

  const handleSelectCustomer = (customerId: string) => {
    const customer = customers.find((c) => c.id === customerId);
    if (customer) {
      reset(customer);
      onSelect(customer);
    }
  };

  return (
    <div className="form-section animate-fade-in">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold text-foreground">Customer Details</h2>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => {
            setShowForm(!showForm);
            if (!showForm) reset({});
          }}
        >
          <Plus className="h-4 w-4 mr-1" />
          New Customer
        </Button>
      </div>

      {customers.length > 0 && (
        <div className="mb-4">
          <Label className="form-label">Select Saved Customer</Label>
          <Select onValueChange={handleSelectCustomer}>
            <SelectTrigger>
              <SelectValue placeholder="Choose a customer..." />
            </SelectTrigger>
            <SelectContent>
              {customers.map((customer) => (
                <SelectItem key={customer.id} value={customer.id!}>
                  {customer.name} - {customer.gstin}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <Label className="form-label">Customer Name *</Label>
            <Input {...register("name", { required: true })} placeholder="SG TELECOM" />
          </div>

          <div className="md:col-span-2">
            <Label className="form-label">Address *</Label>
            <Input
              {...register("address", { required: true })}
              placeholder="118, SRI SENTHUR GARDEN, PHASE 2..."
            />
          </div>

          <div>
            <Label className="form-label">GSTIN *</Label>
            <Input {...register("gstin", { required: true })} placeholder="33BJFPG4170C1ZS" className="font-mono" />
          </div>

          <div>
            <Label className="form-label">State</Label>
            <Input {...register("state")} placeholder="Tamilnadu" />
          </div>
        </div>

        <div className="flex gap-2 mt-4">
          <Button type="submit" className="btn-primary">
            <Save className="h-4 w-4 mr-2" />
            Save Customer
          </Button>
        </div>
      </form>

      {customers.length > 0 && (
        <div className="mt-4 border-t pt-4">
          <Label className="form-label text-muted-foreground">Saved Customers</Label>
          <div className="space-y-2 mt-2 max-h-32 overflow-y-auto">
            {customers.map((customer) => (
              <div
                key={customer.id}
                className="flex items-center justify-between p-2 bg-secondary rounded text-sm"
              >
                <span>{customer.name}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDelete(customer.id!)}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
