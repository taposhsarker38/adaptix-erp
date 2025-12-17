"use client";

import * as React from "react";
import { ArrowUpDown, Filter } from "lucide-react";
import api from "@/lib/api";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { ColumnDef } from "@tanstack/react-table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { StockAdjustmentDialog } from "@/components/inventory/stock-adjustment-dialog";

export const StockClient: React.FC = () => {
  const [data, setData] = React.useState<any[]>([]);
  const [warehouses, setWarehouses] = React.useState<any[]>([]);
  const [products, setProducts] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);

  const [openAdjust, setOpenAdjust] = React.useState(false);

  const [filters, setFilters] = React.useState({
    warehouse: "all",
    product: "all",
  });

  const fetchData = React.useCallback(async () => {
    try {
      setLoading(true);

      // Fetch filters metadata
      const [whRes, prodRes] = await Promise.all([
        api.get("/inventory/warehouses/"),
        api.get("/product/products/"),
      ]);

      const whs = Array.isArray(whRes.data.data)
        ? whRes.data.data
        : Array.isArray(whRes.data)
        ? whRes.data
        : [];
      setWarehouses(whs);

      const prods = Array.isArray(prodRes.data.data)
        ? prodRes.data.data
        : Array.isArray(prodRes.data)
        ? prodRes.data
        : [];
      setProducts(prods);

      // Build query
      const params = new URLSearchParams();
      if (filters.warehouse && filters.warehouse !== "all")
        params.append("warehouse", filters.warehouse);
      if (filters.product && filters.product !== "all")
        params.append("product_uuid", filters.product);

      const res = await api.get(`/inventory/stocks/?${params.toString()}`);
      const items = Array.isArray(res.data.data)
        ? res.data.data
        : Array.isArray(res.data)
        ? res.data
        : [];

      // Enrich stock data with product names (since stock API might return UUIDs)
      // Ideally API should replicate product name or expand it.
      // If API returns simple Stock object (product_uuid, quantity), we map it here.
      // Assuming API returns {product_uuid: "...", quantity: 10, ...}

      const enriched = items.map((item: any) => {
        const prod = prods.find((p: any) => p.id === item.product_uuid) || {};
        const wh = whs.find((w: any) => w.id === item.warehouse) || {}; // warehouse ID might be integer or uuid
        return {
          ...item,
          product_name: prod.name || item.product_uuid,
          product_sku: prod.sku || "N/A",
          warehouse_name: wh.name || item.warehouse,
        };
      });

      setData(enriched);
    } catch (error) {
      console.error("Failed to fetch stock", error);
      toast.error("Failed to load stock data");
    } finally {
      setLoading(false);
    }
  }, [filters]);

  React.useEffect(() => {
    fetchData();
  }, [fetchData]);

  const columns: ColumnDef<any>[] = [
    {
      accessorKey: "product_name",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="px-0 font-medium"
          >
            Product
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
    },
    {
      accessorKey: "product_sku",
      header: "SKU",
    },
    {
      accessorKey: "warehouse_name",
      header: "Warehouse",
    },
    {
      accessorKey: "quantity",
      header: "Quantity",
      cell: ({ row }) => (
        <span className="font-bold">{row.original.quantity}</span>
      ),
    },
    {
      accessorKey: "avg_cost",
      header: "Avg Cost",
      cell: ({ row }) => <span>${row.original.avg_cost}</span>,
    },
  ];

  if (loading && data.length === 0) {
    return <div>Loading stock...</div>;
  }

  return (
    <>
      <div className="flex flex-col gap-4 mb-4">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-sm text-muted-foreground">
              View current stock levels.
            </p>
          </div>
          <Button onClick={() => setOpenAdjust(true)}>
            <ArrowUpDown className="mr-2 h-4 w-4" /> Adjust Stock
          </Button>
        </div>

        <div className="flex flex-wrap gap-4 items-center bg-secondary/20 p-4 rounded-md">
          <div className="flex flex-col space-y-1.5">
            <span className="text-xs font-semibold">Warehouse</span>
            <Select
              value={filters.warehouse}
              onValueChange={(val) =>
                setFilters((prev) => ({ ...prev, warehouse: val }))
              }
            >
              <SelectTrigger className="w-[200px] bg-background">
                <SelectValue placeholder="All Warehouses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Warehouses</SelectItem>
                {warehouses.map((w) => (
                  <SelectItem key={w.id} value={String(w.id)}>
                    {w.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col space-y-1.5">
            <span className="text-xs font-semibold">Product</span>
            <Select
              value={filters.product}
              onValueChange={(val) =>
                setFilters((prev) => ({ ...prev, product: val }))
              }
            >
              <SelectTrigger className="w-[200px] bg-background">
                <SelectValue placeholder="All Products" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Products</SelectItem>
                {products.map((p) => (
                  <SelectItem key={p.id} value={String(p.id)}>
                    {p.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button variant="outline" className="mt-auto" onClick={fetchData}>
            Refresh
          </Button>
        </div>
      </div>

      <DataTable searchKey="product_name" columns={columns} data={data} />

      <StockAdjustmentDialog
        warehouses={warehouses}
        products={products}
        isOpen={openAdjust}
        onClose={() => setOpenAdjust(false)}
        onSuccess={fetchData}
      />
    </>
  );
};
