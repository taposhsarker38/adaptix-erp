"use client";

import * as React from "react";
import { Plus, Pencil, ArrowUpDown } from "lucide-react";
import api from "@/lib/api";
import { toast } from "sonner";
import { format } from "date-fns";

import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { CategoryForm } from "@/components/products/category-form";
import { ColumnDef } from "@tanstack/react-table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal } from "lucide-react";

export const CategoryClient: React.FC = () => {
  const [data, setData] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [open, setOpen] = React.useState(false);
  const [selectedItem, setSelectedItem] = React.useState<any>(null);

  const fetchData = React.useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get("/product/categories/");
      const items = Array.isArray(res.data.data)
        ? res.data.data
        : Array.isArray(res.data)
        ? res.data
        : [];
      setData(items);
    } catch (error) {
      console.error("Failed to fetch categories", error);
      toast.error("Failed to load categories");
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchData();
  }, [fetchData]);

  const onEdit = (item: any) => {
    setSelectedItem(item);
    setOpen(true);
  };

  const onCreate = () => {
    setSelectedItem(null);
    setOpen(true);
  };

  const handleModalClose = () => {
    setOpen(false);
    fetchData();
  };

  const columns: ColumnDef<any>[] = [
    {
      accessorKey: "name",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="px-0 font-medium"
          >
            Name
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
    },
    {
      accessorKey: "description",
      header: "Description",
    },
    {
      accessorKey: "created_at",
      header: "Created At",
      cell: ({ row }) => {
        try {
          return format(new Date(row.original.created_at), "PP");
        } catch (e) {
          return "N/A";
        }
      },
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
                <Pencil className="mr-2 h-4 w-4" /> Edit
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  if (loading) {
    return <div>Loading categories...</div>;
  }

  return (
    <>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Categories</h2>
          <p className="text-muted-foreground">Manage product categories.</p>
        </div>
        <Button onClick={onCreate}>
          <Plus className="mr-2 h-4 w-4" /> Add Category
        </Button>
      </div>
      <div className="mt-8">
        <DataTable searchKey="name" columns={columns} data={data} />
      </div>
      <CategoryForm
        initialData={selectedItem}
        isOpen={open}
        onClose={handleModalClose}
      />
    </>
  );
};
