"use client";

import { useState, useEffect } from "react";
import {
  Plus,
  Search,
  FileEdit,
  Trash2,
  Award,
  ShieldCheck,
  ShieldAlert,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import api from "@/lib/api";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CustomerForm } from "./customer-form";
import { LoyaltyView } from "./loyalty-view";
import { DataTable } from "@/components/ui/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { AlertModal } from "@/components/modals/alert-modal";
import { Badge } from "@/components/ui/badge";
import { jwtDecode } from "jwt-decode";

export function CustomerClient() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<any | null>(null);
  const [loyaltyCustomer, setLoyaltyCustomer] = useState<any | null>(null);
  const [isLoyaltyOpen, setIsLoyaltyOpen] = useState(false);
  const [attributeSets, setAttributeSets] = useState<any[]>([]);
  const [branches, setBranches] = useState<any[]>([]);

  const [openAlert, setOpenAlert] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Advanced Filters
  const [selectedBranch, setSelectedBranch] = useState("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Permission Logic
  const [canCreateCustomer, setCanCreateCustomer] = useState(false);
  const [canDeleteCustomer, setCanDeleteCustomer] = useState(false);
  const [userBranchUuid, setUserBranchUuid] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (token) {
      try {
        const decoded: any = jwtDecode(token);
        const perms = decoded.permissions || [];
        const isSuper = decoded.is_superuser;

        // Create: Check superuser OR explicit permission OR branch admin (legacy fallback)
        if (
          isSuper ||
          perms.includes("create_customer") ||
          decoded.branch_uuid
        ) {
          setCanCreateCustomer(true);
        } else {
          setCanCreateCustomer(false);
        }

        // Delete: Check superuser OR explicit permission
        if (isSuper || perms.includes("delete_customer")) {
          setCanDeleteCustomer(true);
        } else {
          setCanDeleteCustomer(false);
        }

        if (decoded.branch_uuid) {
          setUserBranchUuid(decoded.branch_uuid);
        }
      } catch (e) {
        console.error("Token decode failed", e);
      }
    }
  }, []);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const params: any = { search: searchTerm };
      if (selectedBranch !== "all") params.branch_id = selectedBranch;
      if (startDate && endDate) {
        params.start_date = startDate;
        params.end_date = endDate;
      }

      const [customersRes, attrSetsRes, companiesRes, wingsRes] =
        await Promise.all([
          api.get("/customer/customers/", { params }),
          api.get("/customer/attribute-sets/"),
          api.get("/company/companies/"),
          api.get("/company/wings/"),
        ]);
      setCustomers(customersRes.data.results || customersRes.data);
      setAttributeSets(attrSetsRes.data.results || attrSetsRes.data);

      const getItems = (res: any) => res.data?.results || res.data || [];
      const mergingCompanies = getItems(companiesRes).map((c: any) => ({
        ...c,
        uuid: c.uuid || c.id,
        type: "Unit",
      }));
      const mergingWings = getItems(wingsRes).map((w: any) => ({
        ...w,
        uuid: w.uuid || w.id,
        type: "Branch",
      }));

      const mergedBranches = [...mergingCompanies, ...mergingWings];
      setBranches(mergedBranches);
    } catch (error) {
      console.error("Failed to fetch customers", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchCustomers();
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm, selectedBranch, startDate, endDate]);

  const onDelete = (id: string) => {
    setDeleteId(id);
    setOpenAlert(true);
  };

  const confirmDelete = async () => {
    try {
      setLoading(true);
      await api.delete(`/customer/customers/${deleteId}/`);
      toast.success("Customer deleted");
      fetchCustomers();
    } catch (e) {
      toast.error("Failed to delete");
    } finally {
      setLoading(false);
      setOpenAlert(false);
      setDeleteId(null);
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

  const columns: ColumnDef<any>[] = [
    {
      accessorKey: "name",
      header: "Name",
      cell: ({ row }) => (
        <span className="font-medium">{row.original.name}</span>
      ),
    },
    {
      accessorKey: "phone",
      header: "Phone",
    },
    {
      accessorKey: "email",
      header: "Email",
      cell: ({ row }) => row.original.email || "-",
    },
    {
      accessorKey: "loyalty_points",
      header: "Points",
    },
    {
      accessorKey: "tier",
      header: "Tier",
      cell: ({ row }) => {
        const tier = row.original.tier || "SILVER";
        const colors: Record<string, string> = {
          SILVER: "bg-slate-400 hover:bg-slate-500",
          GOLD: "bg-yellow-500 hover:bg-yellow-600",
          PLATINUM: "bg-cyan-500 hover:bg-cyan-600",
          ELITE: "bg-purple-600 hover:bg-purple-700",
        };
        return <Badge className={colors[tier] || colors.SILVER}>{tier}</Badge>;
      },
    },
    {
      accessorKey: "branch_name",
      header: "Branch",
      cell: ({ row }) => (
        <Badge variant="outline" className="font-normal capitalize">
          {row.original.branch_name || "General"}
        </Badge>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const isVerified =
          row.original.is_email_verified || row.original.is_phone_verified;
        return isVerified ? (
          <Badge
            variant="outline"
            className="text-emerald-600 bg-emerald-50 border-emerald-200 gap-1 pr-2"
          >
            <ShieldCheck className="h-3 w-3" /> Verified
          </Badge>
        ) : (
          <Badge
            variant="outline"
            className="text-slate-500 bg-slate-50 border-slate-200 gap-1 pr-2"
          >
            <ShieldAlert className="h-3 w-3" /> Unverified
          </Badge>
        );
      },
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <div className="text-right">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => openEdit(row.original)}
          >
            <FileEdit className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="text-amber-500 hover:text-amber-600"
            onClick={() => {
              setLoyaltyCustomer(row.original);
              setIsLoyaltyOpen(true);
            }}
          >
            <Award className="h-4 w-4" />
          </Button>
          {canDeleteCustomer && (
            <Button
              variant="ghost"
              size="icon"
              className="text-red-500"
              onClick={() => onDelete(row.original.id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <AlertModal
        isOpen={openAlert}
        onClose={() => setOpenAlert(false)}
        onConfirm={confirmDelete}
        loading={loading}
      />

      {/* Action Bar - Clean horizontal layout */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
          <span className="font-medium text-slate-900 dark:text-white">
            {customers.length}
          </span>
          <span>customers found</span>
        </div>
        {canCreateCustomer && (
          <Button
            onClick={openCreate}
            className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white shadow-md shadow-cyan-500/20"
          >
            <Plus className="mr-2 h-4 w-4" /> Add Customer
          </Button>
        )}
      </div>

      {/* Enhanced Filter Bar */}
      <div className="flex flex-wrap items-center gap-3 p-4 bg-slate-50/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-lg">
        <div className="relative flex-1 min-w-[250px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search by name, phone or email..."
            className="pl-10 bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-700 focus:ring-cyan-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="w-[180px]">
          <Select value={selectedBranch} onValueChange={setSelectedBranch}>
            <SelectTrigger className="bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-700">
              <SelectValue placeholder="All Branches" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Branches</SelectItem>
              {branches.map((b) => (
                <SelectItem key={b.uuid} value={b.uuid}>
                  {b.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <Input
            type="date"
            className="w-[140px] bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-700"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
          <span className="text-slate-400 text-sm">to</span>
          <Input
            type="date"
            className="w-[140px] bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-700"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>

        {(searchTerm || selectedBranch !== "all" || startDate || endDate) && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setSearchTerm("");
              setSelectedBranch("all");
              setStartDate("");
              setEndDate("");
            }}
            className="text-slate-500 hover:text-slate-700"
          >
            Clear filters
          </Button>
        )}
      </div>

      <div className="rounded-md border bg-white dark:bg-slate-950">
        <DataTable
          columns={columns}
          data={customers}
          pdfTitle="Customer Information Master Report"
          enableExport={true}
          exportFileName="customer_list"
          isLoading={loading}
        />
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-cyan-500" />
              {editingCustomer ? "Edit Customer" : "Add New Customer"}
            </DialogTitle>
          </DialogHeader>
          <div className="px-6 py-4 max-h-[70vh] overflow-y-auto">
            <CustomerForm
              key={editingCustomer?.id || "new-customer"}
              initialData={editingCustomer}
              attributeSets={attributeSets}
              branches={branches}
              userBranchUuid={userBranchUuid}
              onSuccess={handleSuccess}
              onCancel={() => setIsDialogOpen(false)}
            />
          </div>
        </DialogContent>
      </Dialog>

      <Sheet open={isLoyaltyOpen} onOpenChange={setIsLoyaltyOpen}>
        <SheetContent className="overflow-y-auto sm:max-w-xl">
          <SheetHeader className="mb-6">
            <SheetTitle>Loyalty Program</SheetTitle>
            <SheetDescription>
              Managing rewards for {loyaltyCustomer?.name}
            </SheetDescription>
          </SheetHeader>

          {loyaltyCustomer && <LoyaltyView customerId={loyaltyCustomer.id} />}
        </SheetContent>
      </Sheet>
    </div>
  );
}
