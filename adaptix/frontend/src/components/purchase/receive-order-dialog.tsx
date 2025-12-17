"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import api from "@/lib/api";
import { toast } from "sonner";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DialogDescription } from "@/components/ui/dialog";

const formSchema = z.object({
  warehouse_id: z.string().min(1, "Warehouse is required"),
});

type FormValues = z.infer<typeof formSchema>;

interface ReceiveOrderDialogProps {
  orderId: string | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const ReceiveOrderDialog: React.FC<ReceiveOrderDialogProps> = ({
  orderId,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [loading, setLoading] = React.useState(false);
  const [warehouses, setWarehouses] = React.useState<any[]>([]);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      warehouse_id: "",
    },
  });

  React.useEffect(() => {
    // Load warehouses when dialog opens
    if (isOpen) {
      api
        .get("/inventory/warehouses/")
        .then((res) => {
          const items = Array.isArray(res.data.data)
            ? res.data.data
            : Array.isArray(res.data)
            ? res.data
            : [];
          setWarehouses(items);
        })
        .catch((err) => {
          console.error(err);
          toast.error("Failed to load warehouses");
        });
    }
  }, [isOpen]);

  const onSubmit = async (values: FormValues) => {
    if (!orderId) return;

    try {
      setLoading(true);
      await api.post(`/purchase/orders/${orderId}/receive/`, {
        warehouse_id: parseInt(values.warehouse_id),
      });

      toast.success("Order received and stock updated");
      onSuccess();
      onClose();
      form.reset();
    } catch (error: any) {
      console.error(error);
      toast.error(error.response?.data?.detail || "Something went wrong.");
      if (error.response?.data?.errors) {
        error.response.data.errors.forEach((e: string) => toast.error(e));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Receive Order</DialogTitle>
          <DialogDescription>
            Select the warehouse where these items will be stored. Stock levels
            will be updated immediately.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="warehouse_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Destination Warehouse</FormLabel>
                  <Select
                    disabled={loading}
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select Warehouse" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {warehouses.map((w) => (
                        <SelectItem key={w.id} value={String(w.id)}>
                          {w.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-2 pt-4">
              <Button
                disabled={loading}
                variant="outline"
                onClick={onClose}
                type="button"
              >
                Cancel
              </Button>
              <Button disabled={loading} type="submit">
                Receive Inventory
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
