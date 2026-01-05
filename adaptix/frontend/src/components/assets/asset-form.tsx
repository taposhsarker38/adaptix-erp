"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useEffect, useState } from "react";
import api from "@/lib/api";
import { toast } from "sonner";
import { handleApiError, handleApiSuccess } from "@/lib/api-handler";

const assetSchema = z.object({
  name: z.string().min(2, "Name required"),
  code: z.string().optional(),
  company_uuid: z.string().min(1, "Company required"),
  category: z.string().min(1, "Category required"),
  purchase_date: z.string(),
  purchase_cost: z.coerce.number().min(0),
  current_value: z.coerce.number().min(0).optional(),
  status: z.enum(["draft", "active", "maintenance", "retired", "disposed"]),
  notes: z.string().optional(),
  location_type: z.enum(["factory", "branch", "headoffice", "corporate"]),
  wing_uuid: z.string().optional(),
});

type AssetFormValues = z.infer<typeof assetSchema>;

interface AssetFormProps {
  initialData?: any | null;
  onSuccess: () => void;
  onCancel: () => void;
}

export function AssetForm({
  initialData,
  onSuccess,
  onCancel,
}: AssetFormProps) {
  const [categories, setCategories] = useState<any[]>([]);
  const [companies, setCompanies] = useState<any[]>([]);

  const form = useForm<AssetFormValues>({
    resolver: zodResolver(assetSchema) as any, // Cast to any to bypass strict resolver type mismatch
    defaultValues: {
      name: initialData?.name || "",
      code: initialData?.code || "",
      category: initialData?.category ? String(initialData.category) : "",
      purchase_date:
        initialData?.purchase_date || new Date().toISOString().split("T")[0],
      purchase_cost: initialData?.purchase_cost
        ? Number(initialData.purchase_cost)
        : 0,
      current_value: initialData?.current_value
        ? Number(initialData.current_value)
        : 0,
      status: initialData?.status || "draft",
      notes: initialData?.notes || "",
      company_uuid: initialData?.company_uuid
        ? String(initialData.company_uuid)
        : "",
      location_type: initialData?.location_type || "headoffice",
      wing_uuid: initialData?.wing_uuid ? String(initialData.wing_uuid) : "",
    },
  });

  const [wings, setWings] = useState<any[]>([]);

  const [isCurrentValueManuallyEdited, setIsCurrentValueManuallyEdited] =
    useState(false);

  const purchaseCostValue = form.watch("purchase_cost");

  // Sync Current Value with Purchase Cost for new assets until manually edited
  useEffect(() => {
    if (!initialData && !isCurrentValueManuallyEdited) {
      form.setValue("current_value", purchaseCostValue);
    }
  }, [purchaseCostValue, form, initialData, isCurrentValueManuallyEdited]);

  useEffect(() => {
    // Fetch Categories
    api.get("/asset/categories/").then((res) => {
      setCategories(res.data.results || res.data);
    });

    // Fetch Companies
    api.get("/company/companies/").then((res) => {
      setCompanies(res.data.results || res.data);
    });

    // Fetch Wings (Branches/Units)
    api.get("/company/wings/").then((res) => {
      setWings(res.data.results || res.data);
    });
  }, []); // Fetch only once on mount

  useEffect(() => {
    if (initialData) {
      setIsCurrentValueManuallyEdited(true);
    }
  }, [initialData]);

  const locationTypeValue = form.watch("location_type");

  const onSubmit = async (values: AssetFormValues) => {
    try {
      const payload = {
        ...values,
        wing_uuid:
          values.location_type === "branch" && values.wing_uuid
            ? values.wing_uuid
            : null,
      };

      if (initialData) {
        await api.put(`/asset/assets/${initialData.id}/`, payload);
      } else {
        await api.post("/asset/assets/", payload);
      }
      handleApiSuccess(initialData ? "Asset updated" : "Asset created");
      onSuccess();
    } catch (error: any) {
      handleApiError(error, form);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Asset Name</FormLabel>
                <FormControl>
                  <Input placeholder="MacBook Pro" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="code"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Asset Tag / Code</FormLabel>
                <FormControl>
                  <Input
                    placeholder="System Generated (e.g. AST-0001)"
                    {...field}
                  />
                </FormControl>
                <p className="text-[10px] text-muted-foreground mt-1 italic">
                  * Leaves blank for auto-generation.
                </p>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="company_uuid"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Company / Organization</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Company" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {companies.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Category</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Category" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {categories.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Status</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="maintenance">Maintenance</SelectItem>
                    <SelectItem value="retired">Retired</SelectItem>
                    <SelectItem value="disposed">Disposed</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="location_type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Location Type</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Location Type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="headoffice">Head Office</SelectItem>
                    <SelectItem value="branch">Branch</SelectItem>
                    <SelectItem value="factory">Factory</SelectItem>
                    <SelectItem value="corporate">Corporate</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {locationTypeValue === "branch" && (
          <div className="grid grid-cols-1 gap-4">
            <FormField
              control={form.control}
              name="wing_uuid"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Branch / Unit</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select Branch" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {wings.map((w) => (
                        <SelectItem key={w.id} value={w.id}>
                          {w.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        )}

        <div className="grid grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="purchase_date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Purchase Date</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="purchase_cost"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Cost ($)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.01"
                    {...field}
                    onFocus={(e) => e.target.select()}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="current_value"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Current Value ($)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.01"
                    {...field}
                    onChange={(e) => {
                      field.onChange(e);
                      setIsCurrentValueManuallyEdited(true);
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes</FormLabel>
              <FormControl>
                <Textarea placeholder="Details..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end space-x-2 pt-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit">
            {initialData ? "Update Asset" : "Create Asset"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
