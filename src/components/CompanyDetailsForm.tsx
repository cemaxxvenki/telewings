import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { CompanyDetails } from "@/types/invoice";
import { saveCompanyDetails, getCompanyDetails } from "@/utils/storage";
import { toast } from "sonner";
import { Building2, Save, Upload, X } from "lucide-react";

interface CompanyDetailsFormProps {
  onSave: (details: CompanyDetails) => void;
  initialData?: CompanyDetails | null;
}

export const CompanyDetailsForm = ({ onSave, initialData }: CompanyDetailsFormProps) => {
  const { register, handleSubmit, reset, setValue, watch } = useForm<CompanyDetails>({
    defaultValues: initialData || undefined,
  });
  const [logo, setLogo] = useState<string | undefined>(initialData?.logo);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const saved = getCompanyDetails();
    if (saved) {
      reset(saved);
      setLogo(saved.logo);
    }
  }, [reset]);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 500 * 1024) {
        toast.error("Logo size should be less than 500KB");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setLogo(base64);
        setValue("logo", base64);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeLogo = () => {
    setLogo(undefined);
    setValue("logo", undefined);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const onSubmit = (data: CompanyDetails) => {
    data.logo = logo;
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
      
      {/* Logo Upload */}
      <div className="mb-6">
        <Label className="form-label">Company Logo</Label>
        <div className="flex items-center gap-4 mt-2">
          {logo ? (
            <div className="relative">
              <img src={logo} alt="Company Logo" className="h-16 w-auto max-w-32 object-contain border rounded" />
              <Button
                type="button"
                variant="destructive"
                size="icon"
                className="absolute -top-2 -right-2 h-6 w-6"
                onClick={removeLogo}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          ) : (
            <div className="h-16 w-32 border-2 border-dashed rounded flex items-center justify-center text-muted-foreground text-xs">
              No logo
            </div>
          )}
          <div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleLogoUpload}
              className="hidden"
            />
            <Button type="button" variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
              <Upload className="h-4 w-4 mr-2" />
              Upload Logo
            </Button>
            <p className="text-xs text-muted-foreground mt-1">Max 500KB, PNG/JPG recommended</p>
          </div>
        </div>
      </div>
      
      <div className="space-y-4">
        <div>
          <Label className="form-label">Company Name *</Label>
          <Input {...register("name", { required: true })} placeholder="TELEWINGS INFRATECH" />
        </div>
        
        <div>
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
        
        <div>
          <Label className="form-label">Mobile No.</Label>
          <Input {...register("mobile")} placeholder="9876543210" className="font-mono" />
        </div>
        
        <div className="border-t pt-4 mt-2">
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