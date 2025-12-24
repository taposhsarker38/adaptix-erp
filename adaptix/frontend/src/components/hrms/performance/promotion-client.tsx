"use client";

import { useState, useEffect } from "react";
import { Plus, FileEdit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import api from "@/lib/api";
import { toast } from "sonner";
import { DataTable } from "@/components/ui/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { AlertModal } from "@/components/modals/alert-modal";
import { PromotionForm } from "./promotion-form";
import { format } from "date-fns";

export function PromotionClient() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any | null>(null);
  const [openAlert, setOpenAlert] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      const response = await api.get("/hrms/performance/promotions/");
      setData(response.data.results || response.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const onDelete = (id: string) => {
    setDeleteId(id);
    setOpenAlert(true);
  };

  const confirmDelete = async () => {
    try {
      await api.delete(`/hrms/performance/promotions/${deleteId}/`);
      toast.success("Deleted successfully");
      fetchData();
    } catch (e) {
      toast.error("Failed to delete");
    } finally {
      setOpenAlert(false);
      setDeleteId(null);
    }
  };

  const columns: ColumnDef<any>[] = [
    {
      accessorKey: "employee_name",
      header: "Employee",
      cell: ({ row }) => {
        const emp = row.original.employee_details;
        // Fallback if backend doesn't send details
        if (!emp)
          return (
            <span className="text-muted-foreground">
              ID: {row.original.employee}
            </span>
          );
        return (
          <span className="font-medium">
            {emp.user?.first_name} {emp.user?.last_name}
          </span>
        );
      },
    },
    {
      accessorKey: "previous_designation",
      header: "Previous Role",
    },
    {
      accessorKey: "new_designation",
      header: "New Role",
    },
    {
      accessorKey: "promotion_date",
      header: "Effective Date",
      cell: ({ row }) =>
        format(new Date(row.original.promotion_date), "MMM d, yyyy"),
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <div className="text-right">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              setEditingItem(row.original);
              setIsDialogOpen(true);
            }}
          >
            <FileEdit className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="text-red-500"
            onClick={() => onDelete(row.original.id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4 pt-4">
      <AlertModal
        isOpen={openAlert}
        onClose={() => setOpenAlert(false)}
        onConfirm={confirmDelete}
        loading={loading}
      />
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Promotions History</h3>
        <Button
          onClick={() => {
            setEditingItem(null);
            setIsDialogOpen(true);
          }}
        >
          <Plus className="mr-2 h-4 w-4" /> Add Promotion
        </Button>
      </div>

      <div className="rounded-md border bg-white dark:bg-slate-950">
        <DataTable columns={columns} data={data} searchKey="employee_name" />
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingItem ? "Edit Promotion" : "Record Promotion"}
            </DialogTitle>
          </DialogHeader>
          <PromotionForm
            initialData={editingItem}
            onSuccess={() => {
              setIsDialogOpen(false);
              fetchData();
            }}
            onCancel={() => setIsDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
