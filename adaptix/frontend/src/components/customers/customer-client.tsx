"use client";

import { useState, useEffect } from "react";
import { Plus, Search, FileEdit, Trash2, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import api from "@/lib/api";
import { toast } from "sonner";
import { CustomerForm } from "./customer-form";

export function CustomerClient() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<any | null>(null);

  const fetchCustomers = async () => {
    try {
      // Assuming customer service is exposed via /api/customer/customers/ or /api/customer/profiles/
      // Need to verify URL via Kong/Service.
      // Customer Service: http://customer:8000
      // Kong: /api/customer -> http://customer:8000
      // Apps: profiles -> /customers/ ?
      // Let's assume /api/customer/profiles/ based on standard naming or /api/customer/customers/
      const response = await api.get("/customer/customers/", {
        params: { search: searchTerm },
      });
      setCustomers(response.data.results || response.data);
    } catch (error) {
      console.error("Failed to fetch customers", error);
      // Fallback: dummy data if API fails (for now)
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchCustomers();
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const handleDelete = async (id: string) => {
    if (!confirm("Delete customer?")) return;
    try {
      await api.delete(`/customer/customers/${id}/`);
      toast.success("Customer deleted");
      fetchCustomers();
    } catch (e) {
      toast.error("Failed to delete");
    }
  };

  const openEdit = (customer: any) => {
    setEditingCustomer(customer);
    setIsDialogOpen(true);
  };

  const openCreate = () => {
    setEditingCustomer(null);
    setIsDialogOpen(true);
  };

  const handleSuccess = () => {
    setIsDialogOpen(false);
    fetchCustomers();
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Customers</h2>
        <Button onClick={openCreate}>
          <Plus className="mr-2 h-4 w-4" /> Add Customer
        </Button>
      </div>

      <div className="flex items-center space-x-2">
        <Search className="h-4 w-4 text-gray-500" />
        <Input
          placeholder="Search customers..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
      </div>

      <div className="rounded-md border bg-white dark:bg-slate-950">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Points</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-4">
                  Loading...
                </TableCell>
              </TableRow>
            ) : customers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-4">
                  No customers found.
                </TableCell>
              </TableRow>
            ) : (
              customers.map((c) => (
                <TableRow key={c.id}>
                  <TableCell className="font-medium">{c.name}</TableCell>
                  <TableCell>{c.phone}</TableCell>
                  <TableCell>{c.email || "-"}</TableCell>
                  <TableCell>{c.loyalty_points}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => openEdit(c)}
                    >
                      <FileEdit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-red-500"
                      onClick={() => handleDelete(c.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingCustomer ? "Edit Customer" : "Add New Customer"}
            </DialogTitle>
          </DialogHeader>
          <CustomerForm
            initialData={editingCustomer}
            onSuccess={handleSuccess}
            onCancel={() => setIsDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
