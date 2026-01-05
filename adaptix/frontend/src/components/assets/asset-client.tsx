"use client";

import { useState, useEffect } from "react";
import {
  Plus,
  Search,
  FileEdit,
  Trash2,
  Calculator,
  Monitor,
  X,
  Filter,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { AssetForm } from "./asset-form";
import { AlertModal } from "@/components/modals/alert-modal";

export function AssetClient() {
  const [assets, setAssets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAsset, setEditingAsset] = useState<any | null>(null);

  const [openAlert, setOpenAlert] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [companies, setCompanies] = useState<any[]>([]);
  const [wings, setWings] = useState<any[]>([]);
  const [filterCompany, setFilterCompany] = useState<string>("");
  const [filterDate, setFilterDate] = useState<string>("");

  const fetchAssets = async () => {
    try {
      const params = new URLSearchParams();
      if (filterCompany && filterCompany !== "all")
        params.append("company_uuid", filterCompany);
      if (filterDate) params.append("purchase_date", filterDate);
      params.append("t", Date.now().toString());

      const response = await api.get(`/asset/assets/?${params.toString()}`);
      setAssets(response.data.results || response.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssets();
    api.get("/company/companies/").then((res) => {
      setCompanies(res.data.results || res.data);
    });
    api.get("/company/wings/").then((res) => {
      setWings(res.data.results || res.data);
    });
  }, [filterCompany, filterDate]); // Re-fetch when filters change

  const onDelete = (id: string) => {
    setDeleteId(id);
    setOpenAlert(true);
  };

  const confirmDelete = async () => {
    try {
      setLoading(true);
      await api.delete(`/asset/assets/${deleteId}/`);
      toast.success("Asset deleted");
      fetchAssets();
    } catch (e) {
      toast.error("Failed to delete");
    } finally {
      setLoading(false);
      setOpenAlert(false);
      setDeleteId(null);
    }
  };

  const handleDepreciate = async (id: string) => {
    try {
      await api.post(`/asset/assets/${id}/calculate-depreciation/`);
      toast.success("Depreciation calculated & posted");
      fetchAssets(); // Update current values
    } catch (e: any) {
      toast.error(e.response?.data?.error || "Failed to depreciate");
    }
  };

  const openEdit = (asset: any) => {
    setEditingAsset(asset);
    setIsDialogOpen(true);
  };

  const openCreate = () => {
    setEditingAsset(null);
    setIsDialogOpen(true);
  };

  const handleSuccess = () => {
    setIsDialogOpen(false);
    fetchAssets();
  };

  return (
    <div className="space-y-4">
      <AlertModal
        isOpen={openAlert}
        onClose={() => setOpenAlert(false)}
        onConfirm={confirmDelete}
        loading={loading}
      />
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Asset Management</h2>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 bg-white dark:bg-slate-900 border rounded-md px-2 py-1">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <Select value={filterCompany} onValueChange={setFilterCompany}>
              <SelectTrigger className="w-[180px] border-none shadow-none focus:ring-0">
                <SelectValue placeholder="All Organizations" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Organizations</SelectItem>
                {companies.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              type="date"
              className="w-[150px] border-none shadow-none focus-visible:ring-0"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
            />
            {(filterCompany || filterDate) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setFilterCompany("");
                  setFilterDate("");
                }}
                className="h-8 px-2 hover:bg-slate-100"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
          <Button onClick={openCreate}>
            <Plus className="mr-2 h-4 w-4" /> Add Asset
          </Button>
        </div>
      </div>

      <div className="rounded-md border bg-white dark:bg-slate-950">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Code</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Organization</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Purchased</TableHead>
              <TableHead>Location</TableHead>
              <TableHead className="text-right">Cost</TableHead>
              <TableHead className="text-right">Current Value</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={10} className="text-center py-4">
                  Loading...
                </TableCell>
              </TableRow>
            ) : assets.length === 0 ? (
              <TableRow>
                <TableCell colSpan={10} className="text-center py-4">
                  No assets found.
                </TableCell>
              </TableRow>
            ) : (
              assets.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-mono text-xs">
                    {item.code}
                  </TableCell>
                  <TableCell className="font-medium">{item.name}</TableCell>
                  <TableCell>
                    {companies.find((c) => c.id === item.company_uuid)
                      ?.name || (
                      <span className="text-muted-foreground text-[10px italic]">
                        {item.company_uuid?.substring(0, 8)}...
                      </span>
                    )}
                  </TableCell>
                  <TableCell>{item.category_name || "N/A"}</TableCell>
                  <TableCell>
                    {format(new Date(item.purchase_date), "MMM d, yyyy")}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="capitalize text-xs font-semibold">
                        {item.location_type}
                      </span>
                      {item.wing_uuid && (
                        <span className="text-[10px] text-blue-600 font-medium">
                          {wings.find((w) => w.id === item.wing_uuid)?.name ||
                            "Unknown Branch"}
                        </span>
                      )}
                      {item.location && (
                        <span className="text-[10px] text-muted-foreground">
                          {item.location}
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    ${item.purchase_cost}
                  </TableCell>
                  <TableCell className="text-right font-bold">
                    ${item.current_value}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        item.status === "active" ? "default" : "secondary"
                      }
                    >
                      {item.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      title="Run Depreciation"
                      onClick={() => handleDepreciate(item.id)}
                    >
                      <Calculator className="h-4 w-4 text-blue-500" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => openEdit(item)}
                    >
                      <FileEdit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-red-500"
                      onClick={() => onDelete(item.id)}
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
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingAsset ? "Edit Asset" : "Add Asset"}
            </DialogTitle>
          </DialogHeader>
          <AssetForm
            key={editingAsset?.id || "new"}
            initialData={editingAsset}
            onSuccess={handleSuccess}
            onCancel={() => setIsDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
