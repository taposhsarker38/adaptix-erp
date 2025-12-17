"use client";

import * as React from "react";
import { Plus, Pencil, ArrowUpDown, FileText } from "lucide-react";
import api from "@/lib/api";
import { toast } from "sonner";
import { format } from "date-fns";

import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { PurchaseOrderForm } from "@/components/purchase/purchase-order-form";
import { ReceiveOrderDialog } from "@/components/purchase/receive-order-dialog";
import { ColumnDef } from "@tanstack/react-table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export const PurchaseOrderClient: React.FC = () => {
  const [data, setData] = React.useState<any[]>([]);
  const [vendors, setVendors] = React.useState<any[]>([]);
  const [products, setProducts] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [open, setOpen] = React.useState(false);
  const [selectedOrder, setSelectedOrder] = React.useState<any>(null);

  const [openReceive, setOpenReceive] = React.useState(false);
  const [receiveOrderId, setReceiveOrderId] = React.useState<string | null>(
    null
  );

  const fetchData = React.useCallback(async () => {
    try {
      setLoading(true);
      const [ordersRes, vendorsRes, productsRes] = await Promise.all([
        api.get("/purchase/orders/"),
        api.get("/purchase/vendors/"),
        api.get("/product/products/"), // Assuming product service
      ]);

      const orders = Array.isArray(ordersRes.data.data)
        ? ordersRes.data.data
        : Array.isArray(ordersRes.data)
        ? ordersRes.data
        : [];

      const vends = Array.isArray(vendorsRes.data.data)
        ? vendorsRes.data.data
        : Array.isArray(vendorsRes.data)
        ? vendorsRes.data
        : [];

      const prods = Array.isArray(productsRes.data.data)
        ? productsRes.data.data
        : Array.isArray(productsRes.data)
        ? productsRes.data
        : [];

      setData(orders);
      setVendors(vends);
      setProducts(prods);
    } catch (error) {
      console.error("Failed to fetch purchase data", error);
      toast.error("Failed to load purchase orders");
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchData();
  }, [fetchData]);

  const onEdit = (order: any) => {
    setSelectedOrder(order);
    setOpen(true);
  };

  const onCreate = () => {
    setSelectedOrder(null);
    setOpen(true);
  };

  const handleModalClose = () => {
    setOpen(false);
    fetchData();
  };

  const onReceive = (order: any) => {
    setReceiveOrderId(order.id);
    setOpenReceive(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-800 hover:bg-green-200";
      case "ordered":
        return "bg-blue-100 text-blue-800 hover:bg-blue-200";
      case "received":
        return "bg-purple-100 text-purple-800 hover:bg-purple-200";
      case "rejected":
        return "bg-red-100 text-red-800 hover:bg-red-200";
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-200";
    }
  };

  const columns: ColumnDef<any>[] = [
    {
      accessorKey: "reference_number",
      header: "Reference",
    },
    {
      accessorKey: "vendor.name",
      header: "Vendor",
      cell: ({ row }) => row.original.vendor?.name || "N/A",
    },
    {
      accessorKey: "date_issued",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="px-0 font-medium"
          >
            Date
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => format(new Date(row.original.date_issued), "PP"),
    },
    {
      accessorKey: "total_amount",
      header: "Total Amount",
      cell: ({ row }) => {
        const amount = parseFloat(row.getValue("total_amount"));
        const formatted = new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: "USD", // Should be company currency default
        }).format(amount);
        return <div className="font-medium">{formatted}</div>;
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <Badge
          className={getStatusColor(row.original.status)}
          variant="secondary"
        >
          {row.original.status.replace("_", " ").toUpperCase()}
        </Badge>
      ),
    },
    {
      id: "actions",
      cell: ({ row }) => {
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem
                onClick={() => onEdit(row.original)}
                className="cursor-pointer"
              >
                <Pencil className="mr-2 h-4 w-4" /> View / Edit
              </DropdownMenuItem>
              {row.original.status === "ordered" && (
                <DropdownMenuItem
                  onClick={() => onReceive(row.original)}
                  className="cursor-pointer text-blue-600"
                >
                  <ArrowUpDown className="mr-2 h-4 w-4" /> Receive Order
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  if (loading) {
    return <div>Loading orders...</div>;
  }

  return (
    <>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Purchase Orders</h2>
          <p className="text-muted-foreground">Manage inventory procurement.</p>
        </div>
        <Button onClick={onCreate}>
          <Plus className="mr-2 h-4 w-4" /> Create Order
        </Button>
      </div>
      <div className="mt-8">
        <DataTable searchKey="reference_number" columns={columns} data={data} />
      </div>
      <PurchaseOrderForm
        vendors={vendors}
        products={products}
        initialData={selectedOrder}
        isOpen={open}
        onClose={handleModalClose}
      />
      <ReceiveOrderDialog
        orderId={receiveOrderId}
        isOpen={openReceive}
        onClose={() => setOpenReceive(false)}
        onSuccess={handleModalClose}
      />
    </>
  );
};
