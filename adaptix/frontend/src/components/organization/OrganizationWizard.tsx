"use client";

import { useState } from "react";
import {
  Building2,
  Plus,
  X,
  Check,
  ChevronRight,
  Globe,
  MapPin,
  Building,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader } from "@/components/ui/loader";

interface OrganizationWizardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  parentId?: string;
  parentName?: string;
  type: "GROUP" | "HOLDING" | "UNIT" | "BRANCH";
  onSuccess: () => void;
}

export function OrganizationWizard({
  open,
  onOpenChange,
  parentId,
  parentName,
  type,
  onSuccess,
}: OrganizationWizardProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    timezone: "UTC",
    is_group: type === "GROUP" || type === "HOLDING",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const token = localStorage.getItem("access_token");
    const endpoint =
      type === "BRANCH" ? "/company/wings/" : "/company/companies/";
    const url = `${process.env.NEXT_PUBLIC_API_URL}${endpoint}`;

    const payload =
      type === "BRANCH"
        ? { name: formData.name, code: formData.code, company: parentId }
        : {
            name: formData.name,
            code: formData.code,
            timezone: formData.timezone,
            parent: parentId,
            is_group: formData.is_group,
          };

    try {
      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        toast.success(`${type} created successfully!`);
        onOpenChange(false);
        onSuccess();
        setFormData({ name: "", code: "", timezone: "UTC", is_group: false });
      } else {
        const err = await res.json();
        console.error("Wizard API Error:", err);
        toast.error(err.detail || err.message || `Failed to create ${type}`);
      }
    } catch (error) {
      console.error("Wizard Fetch Error:", error);
      toast.error("Network error. Check console for details.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[450px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5 text-indigo-600" />
              Add New {type.charAt(0) + type.slice(1).toLowerCase()}
            </DialogTitle>
            <DialogDescription>
              {parentId ? (
                <>
                  Adding under <strong>{parentName}</strong>
                </>
              ) : (
                "Create a new root level organization."
              )}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-6">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder={`e.g. ${
                  type === "BRANCH" ? "Dhaka Branch" : "Bina Industries"
                }`}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="code">Code</Label>
              <div className="relative">
                <Building className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  id="code"
                  value={formData.code}
                  onChange={(e) =>
                    setFormData({ ...formData, code: e.target.value })
                  }
                  placeholder="e.g. BIND-01"
                  className="pl-10 uppercase"
                  required
                />
              </div>
            </div>

            {type !== "BRANCH" && (
              <div className="space-y-2">
                <Label htmlFor="timezone">Timezone</Label>
                <div className="relative">
                  <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    id="timezone"
                    value={formData.timezone}
                    onChange={(e) =>
                      setFormData({ ...formData, timezone: e.target.value })
                    }
                    placeholder="UTC"
                    className="pl-10"
                  />
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-indigo-600 hover:bg-indigo-700"
              disabled={loading}
            >
              {loading ? <Loader size="sm" variant="white" /> : "Create Entity"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
