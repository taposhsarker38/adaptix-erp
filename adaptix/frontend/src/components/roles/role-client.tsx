"use client";

import * as React from "react";
import { Plus, Pencil, Trash, ArrowUpDown } from "lucide-react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { RoleForm } from "@/components/roles/role-form";
import { ColumnDef } from "@tanstack/react-table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal } from "lucide-react";

interface RoleClientProps {}

export const RoleClient: React.FC<RoleClientProps> = () => {
  const router = useRouter();
  const [data, setData] = React.useState<any[]>([]);
  const [permissions, setPermissions] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [open, setOpen] = React.useState(false);
  const [selectedRole, setSelectedRole] = React.useState<any>(null);

  const fetchData = React.useCallback(async () => {
    try {
      setLoading(true);
      const [roleRes, permRes] = await Promise.all([
        api.get("/auth/roles/"),
        api.get("/auth/permissions/"),
      ]);
      setData(Array.isArray(roleRes.data.data) ? roleRes.data.data : []);
      setPermissions(Array.isArray(permRes.data.data) ? permRes.data.data : []);
    } catch (error) {
      console.error("Failed to fetch data", error);
      toast.error("Failed to load roles");
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchData();
  }, [fetchData]);

  const onEdit = (role: any) => {
    setSelectedRole(role);
    setOpen(true);
  };

  const onDelete = async (id: number) => {
    try {
      await api.delete(`/auth/roles/${id}/`);
      toast.success("Role deleted");
      fetchData(); // Refresh data
    } catch (error) {
      toast.error("Make sure to remove all users using this role first.");
    }
  };

  const onCreate = () => {
    setSelectedRole(null);
    setOpen(true);
  };

  const handleModalClose = () => {
    setOpen(false);
    fetchData(); // Refresh on close (after save)
  };

  const columns: ColumnDef<any>[] = [
    {
      accessorKey: "name",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="hover:bg-transparent px-0 font-medium whitespace-nowrap"
          >
            Name
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
    },
    {
      accessorKey: "permissions",
      header: "Permissions",
      cell: ({ row }) => (
        <div className="flex items-center gap-x-2">
          <span className="bg-primary/10 text-primary px-2 py-1 rounded-md text-sm font-medium">
            {row.original.permissions?.length || 0}
          </span>
        </div>
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
              <DropdownMenuItem onClick={() => onEdit(row.original)}>
                <Pencil className="mr-2 h-4 w-4" /> Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onDelete(row.original.id)}
                className="text-red-600"
              >
                <Trash className="mr-2 h-4 w-4" /> Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  if (loading) {
    return <div>Loading roles...</div>;
  }

  return (
    <>
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Roles</h2>
        <Button onClick={onCreate}>
          <Plus className="mr-2 h-4 w-4" /> Add Role
        </Button>
      </div>
      <div className="mt-8">
        <DataTable searchKey="name" columns={columns} data={data} />
      </div>
      <RoleForm
        permissions={permissions}
        initialData={selectedRole}
        isOpen={open}
        onClose={handleModalClose}
      />
    </>
  );
};
