import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { CompanyDetails } from "@/types/invoice";
import { saveCompanyDetails, getCompanyDetails } from "@/utils/storage";
import { toast } from "sonner";
import { Building2, Save } from "lucide-react";

interface CompanyDetailsFormProps {
  onSave: (details: CompanyDetails) => void;
  initialData?: CompanyDetails | null;
}

export const CompanyDetailsForm = ({ onSave, initialData }: CompanyDetailsFormProps) => {
  const { register, handleSubmit, reset, formState: { errors } } = useForm<CompanyDetails>({
    defaultValues: initialData || undefined,
  });

  useEffect(() => {
    const saved = getCompanyDetails();
    if (saved) {
      reset(saved);
    }
  }, [reset]);

  const onSubmit = (data: CompanyDetails) => {
    saveCompanyDetails(data);
    onSave(data);
    toast.success("Company details saved!");
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="form-section animate-fade-in">
      <div className="flex items-center gap-2 mb-4">
        <Building2 className="h-5 w-5 text-primary" />
        <h2 className="text-lg font-semibold text-foreground">Your Company Details</h2>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2">
          <Label className="form-label">Company Name *</Label>
          <Input {...register("name", { required: true })} placeholder="TELEWINGS INFRATECH" />
        </div>
        
        <div className="md:col-span-2">
          <Label className="form-label">Address *</Label>
          <Input {...register("address", { required: true })} placeholder="Coimbatore - 641041" />
        </div>
        
        <div>
          <Label className="form-label">GSTIN *</Label>
          <Input {...register("gstin", { required: true })} placeholder="33CWFPK4736G1ZL" className="font-mono" />
        </div>
        
        <div>
          <Label className="form-label">PAN</Label>
          <Input {...register("pan")} placeholder="CWFPK4736G" className="font-mono" />
        </div>
        
        <div>
          <Label className="form-label">State *</Label>
          <Input {...register("state", { required: true })} placeholder="Tamilnadu" />
        </div>
        
        <div>
          <Label className="form-label">State Code *</Label>
          <Input {...register("stateCode", { required: true })} placeholder="33" className="font-mono" />
        </div>
        
        <div className="md:col-span-2 border-t pt-4 mt-2">
          <h3 className="text-sm font-medium text-muted-foreground mb-3">Bank Details</h3>
        </div>
        
        <div>
          <Label className="form-label">Account Holder Name</Label>
          <Input {...register("accountHolderName")} placeholder="TELEWINGS INFRATECH" />
        </div>
        
        <div>
          <Label className="form-label">Bank Name</Label>
          <Input {...register("bankName")} placeholder="South Indian Bank" />
        </div>
        
        <div>
          <Label className="form-label">Account Number</Label>
          <Input {...register("accountNumber")} placeholder="0111073000003910" className="font-mono" />
        </div>
        
        <div>
          <Label className="form-label">Branch & IFSC Code</Label>
          <Input {...register("ifscCode")} placeholder="SIBL0000565" className="font-mono" />
        </div>
      </div>
      
      <Button type="submit" className="mt-4 btn-primary">
        <Save className="h-4 w-4 mr-2" />
        Save Company Details
      </Button>
    </form>
  );
};
