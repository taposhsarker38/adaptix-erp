"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import api from "@/lib/api";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

const formSchema = z.object({
  payment_method: z.enum(["cash", "card"]),
  amount_tendered: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface CheckoutDialogProps {
  items: any[];
  total: number;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const CheckoutDialog: React.FC<CheckoutDialogProps> = ({
  items,
  total,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [loading, setLoading] = React.useState(false);
  const router = useRouter();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      payment_method: "cash",
      amount_tendered: "",
    },
  });

  const paymentMethod = form.watch("payment_method");
  const amountTendered = parseFloat(form.watch("amount_tendered") || "0");
  const change = Math.max(0, amountTendered - total);

  const onSubmit = async (values: FormValues) => {
    try {
      setLoading(true);

      const payload = {
        items: items.map((item) => ({
          product_uuid: item.id,
          quantity: item.quantity,
          unit_price: item.sales_price,
          tax_amount: 0, // Simplified for now
          discount_amount: 0,
        })),
        module_type: "pos",
        status: "closed", // Directly close for now
        // Payment details would go here
      };

      await api.post("/pos/orders/", payload);

      toast.success(`Sale completed! Change: $${change.toFixed(2)}`);
      onSuccess();
      onClose();
      form.reset();
    } catch (error: any) {
      console.error(error);
      toast.error(error.response?.data?.detail || "Transaction failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Checkout</DialogTitle>
        </DialogHeader>

        <div className="py-4">
          <div className="text-center mb-6">
            <p className="text-sm text-muted-foreground">Total Amount</p>
            <p className="text-4xl font-bold">
              {new Intl.NumberFormat("en-US", {
                style: "currency",
                currency: "USD",
              }).format(total)}
            </p>
          </div>

          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-3">
              <Label>Payment Method</Label>
              <RadioGroup
                defaultValue="cash"
                onValueChange={(val) =>
                  form.setValue("payment_method", val as "cash" | "card")
                }
                className="grid grid-cols-2 gap-4"
              >
                <div>
                  <RadioGroupItem
                    value="cash"
                    id="cash"
                    className="peer sr-only"
                  />
                  <Label
                    htmlFor="cash"
                    className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                  >
                    <span className="text-xl">💵</span>
                    Cash
                  </Label>
                </div>
                <div>
                  <RadioGroupItem
                    value="card"
                    id="card"
                    className="peer sr-only"
                  />
                  <Label
                    htmlFor="card"
                    className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                  >
                    <span className="text-xl">💳</span>
                    Card
                  </Label>
                </div>
              </RadioGroup>
            </div>

            {paymentMethod === "cash" && (
              <div className="space-y-2">
                <Label>Amount Tendered</Label>
                <Input
                  type="number"
                  placeholder="0.00"
                  {...form.register("amount_tendered")}
                />
                {amountTendered > 0 && (
                  <div className="flex justify-between text-sm px-1">
                    <span>Change due:</span>
                    <span
                      className={
                        change < 0 ? "text-red-500" : "text-green-600 font-bold"
                      }
                    >
                      ${change.toFixed(2)}
                    </span>
                  </div>
                )}
              </div>
            )}

            <Button
              disabled={
                loading || (paymentMethod === "cash" && amountTendered < total)
              }
              className="w-full h-12 text-lg"
              type="submit"
            >
              Complete Sale
            </Button>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
};
