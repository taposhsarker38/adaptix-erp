"use client";

import * as React from "react";
import { DataTable } from "@/components/ui/data-table";
import { ColumnDef } from "@tanstack/react-table";
import api from "@/lib/api";
import { toast } from "sonner";

export const PermissionClient: React.FC = () => {
  const [data, setData] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await api.get("/auth/permissions/");
        setData(response.data.data || []);
      } catch (error) {
        toast.error("Failed to load permissions");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const columns: ColumnDef<any>[] = [
    {
      accessorKey: "name",
      header: "Name",
    },
    {
      accessorKey: "codename",
      header: "Code",
      cell: ({ row }) => (
        <code className="bg-muted px-1 py-0.5 rounded">
          {row.original.codename}
        </code>
      ),
    },
  ];

  if (loading) {
    return <div>Loading permissions...</div>;
  }

  return (
    <>
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Permissions</h2>
      </div>
      <div className="mt-8">
        <DataTable searchKey="name" columns={columns} data={data} />
      </div>
    </>
  );
};
