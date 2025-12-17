"use client";

import { useState, useEffect } from "react";
import { Plus, Search, FileEdit, Trash2, FolderTree } from "lucide-react";
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
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

// --- Schema & Form for Account ---
const accountSchema = z.object({
  name: z.string().min(1),
  code: z.string().min(1),
  group_type: z.string(), // simplified for now, ideally link to group ID
});

export function ChartOfAccountClient() {
  const [accounts, setAccounts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [groups, setGroups] = useState<any[]>([]);

  const fetchAccounts = async () => {
    try {
      // Assuming /api/accounting/accounts/ based on urls.py and kong assumption
      // Kong: accounting-service -> /api/accounting
      // urls: router.register(r'accounts', ...) -> /accounts/
      // API: /api/accounting/accounts/
      const res = await api.get("/accounting/accounts/");
      setAccounts(res.data.results || res.data);
    } catch (e) {
      console.error(e);
      // Fallback/Mock
    } finally {
      setLoading(false);
    }
  };

  const fetchGroups = async () => {
    try {
      const res = await api.get("/accounting/groups/");
      setGroups(res.data.results || res.data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchAccounts();
    fetchGroups();
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold">Chart of Accounts</h3>
        <Button>
          <Plus className="mr-2 h-4 w-4" /> New Account
        </Button>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Code</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Group</TableHead>
              <TableHead className="text-right">Balance</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={4}>Loading...</TableCell>
              </TableRow>
            ) : accounts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4}>No accounts found.</TableCell>
              </TableRow>
            ) : (
              accounts.map((acc) => (
                <TableRow key={acc.id}>
                  <TableCell className="font-mono">{acc.code}</TableCell>
                  <TableCell>{acc.name}</TableCell>
                  <TableCell>
                    {/* Resolve Group Name via ID if possible, or just ignore for now */}
                    {groups.find((g) => g.id === acc.group)?.name || acc.group}
                  </TableCell>
                  <TableCell className="text-right font-mono">
                    {acc.current_balance}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
