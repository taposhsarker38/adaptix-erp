"use client";

import { useState } from "react";
import {
  useLeaves,
  useLeavePolicies,
  useLeaveAllocations,
  useLeaveTypes,
  useEmployees,
} from "@/hooks/useHRMS";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  Calendar,
  CheckCircle2,
  XCircle,
  Clock,
  Settings2,
  PlayCircle,
  AlertCircle,
  ShieldCheck,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { LeaveAllocation, LeavePolicy } from "@/lib/types";

export default function LeavesPage() {
  const { data: leaves, isLoading: leavesLoading, createLeave } = useLeaves();
  const { data: policies, createPolicy } = useLeavePolicies();
  const {
    data: allocations,
    runEntitlement,
    bulkApprove,
  } = useLeaveAllocations();
  const { data: leaveTypes } = useLeaveTypes();

  const [activeTab, setActiveTab] = useState("requests");
  const [isPolicyModalOpen, setIsPolicyModalOpen] = useState(false);
  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);
  const [selectedAllocations, setSelectedAllocations] = useState<string[]>([]);

  const [policyForm, setPolicyForm] = useState({
    name: "",
    leave_type: "",
    allocation_days: "12",
    tenure_months_required: "0",
    gender_requirement: "ALL",
  });

  const [leaveForm, setLeaveForm] = useState({
    employee: "",
    leave_type: "",
    start_date: "",
    end_date: "",
    reason: "",
  });

  const { data: employees } = useEmployees();

  // Helper to get company_uuid from context
  const getCompanyUuid = () => {
    return (
      allocations?.[0]?.company_uuid ||
      employees?.[0]?.company_uuid ||
      "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11"
    );
  };

  const handleRunEntitlement = async () => {
    try {
      const company_uuid = getCompanyUuid();
      const res = await runEntitlement(company_uuid);
      toast.success(
        `Entitlement run complete. Created ${res.allocations_created} draft allocations.`
      );
    } catch (err) {
      toast.error("Failed to run entitlement engine.");
    }
  };

  const handleBulkApprove = async () => {
    if (selectedAllocations.length === 0) {
      toast.error("Please select at least one allocation to approve.");
      return;
    }
    try {
      await bulkApprove(selectedAllocations);
      toast.success(
        `Successfully approved ${selectedAllocations.length} allocations.`
      );
      setSelectedAllocations([]);
    } catch (err) {
      toast.error("Bulk approval failed.");
    }
  };

  const getStatusBadge = (status: string) => {
    const s = status.toLowerCase();
    if (s === "approved")
      return (
        <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-emerald-200 font-medium">
          <CheckCircle2 className="w-3 h-3 mr-1" /> Approved
        </Badge>
      );
    if (s === "rejected" || s === "cancelled")
      return (
        <Badge
          variant="destructive"
          className="bg-rose-100 text-rose-700 hover:bg-rose-100 border-rose-200 font-medium"
        >
          <XCircle className="w-3 h-3 mr-1" /> {status}
        </Badge>
      );
    return (
      <Badge
        variant="secondary"
        className="bg-amber-100 text-amber-700 hover:bg-amber-100 border-amber-200 font-medium"
      >
        <Clock className="w-3 h-3 mr-1" /> {status}
      </Badge>
    );
  };

  return (
    <div className="p-6 space-y-6 bg-slate-50/50 min-h-screen">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 flex items-center gap-3">
            <div className="p-2 bg-purple-600 rounded-lg">
              <Calendar className="h-6 w-6 text-white" />
            </div>
            HRMS Leave Management
          </h1>
          <p className="text-slate-500 mt-1">
            Dynamic policy-driven leave entitlements for your workforce.
          </p>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleRunEntitlement}
            className="border-blue-200 text-blue-700 hover:bg-blue-50 shadow-sm flex items-center gap-2"
          >
            <PlayCircle className="h-4 w-4" />
            Sync Entitlement
          </Button>
          <Button
            className="bg-purple-600 hover:bg-purple-700 text-white shadow-lg shadow-purple-500/20"
            onClick={() => setIsLeaveModalOpen(true)}
          >
            <Plus className="mr-2 h-4 w-4" />
            New Application
          </Button>
        </div>
      </div>

      <Tabs
        defaultValue="requests"
        value={activeTab}
        onValueChange={setActiveTab}
        className="w-full"
      >
        <TabsList className="bg-white border rounded-xl p-1 mb-6 shadow-sm inline-flex">
          <TabsTrigger
            value="requests"
            className="px-6 rounded-lg data-[state=active]:bg-purple-50 data-[state=active]:text-purple-700 font-semibold transition-all"
          >
            Leave Requests
          </TabsTrigger>
          <TabsTrigger
            value="allocations"
            className="px-6 rounded-lg data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 font-semibold transition-all"
          >
            Balance Approval
          </TabsTrigger>
          <TabsTrigger
            value="policies"
            className="px-6 rounded-lg data-[state=active]:bg-emerald-50 data-[state=active]:text-emerald-700 font-semibold transition-all"
          >
            Entitlement Policies
          </TabsTrigger>
        </TabsList>

        <TabsContent value="requests" className="space-y-4 outline-none">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <Table>
              <TableHeader className="bg-slate-50">
                <TableRow>
                  <TableHead className="font-semibold text-slate-900">
                    Employee
                  </TableHead>
                  <TableHead className="font-semibold text-slate-900">
                    Type
                  </TableHead>
                  <TableHead className="font-semibold text-slate-900">
                    Period
                  </TableHead>
                  <TableHead className="font-semibold text-slate-900">
                    Status
                  </TableHead>
                  <TableHead className="font-semibold text-slate-900 text-right">
                    Action
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {leaves?.map((leave) => (
                  <TableRow
                    key={leave.id}
                    className="hover:bg-slate-50/50 transition-colors"
                  >
                    <TableCell className="font-bold text-slate-800">
                      {leave.employee_name}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="secondary"
                        className="bg-slate-100 text-slate-700 border-none"
                      >
                        {leave.leave_type_name}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-slate-600">
                      {new Date(leave.start_date).toLocaleDateString()} &rarr;{" "}
                      {new Date(leave.end_date).toLocaleDateString()}
                    </TableCell>
                    <TableCell>{getStatusBadge(leave.status)}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-slate-400 hover:text-purple-600 hover:bg-purple-50"
                      >
                        View Detail
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {(!leaves || leaves.length === 0) && (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="text-center py-12 text-slate-400 italic"
                    >
                      No leave applications found in the system
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="allocations" className="space-y-4 outline-none">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-amber-50 border border-amber-100 p-4 rounded-xl">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-100 rounded-full">
                <AlertCircle className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <h4 className="font-bold text-amber-900 text-sm">
                  Draft Entitlements Pending
                </h4>
                <p className="text-xs text-amber-700">
                  The policy engine has calculated new balances. Please review
                  and approve them to make them active.
                </p>
              </div>
            </div>
            <Button
              size="sm"
              onClick={handleBulkApprove}
              disabled={selectedAllocations.length === 0}
              className="bg-blue-600 hover:bg-blue-700 shadow-md"
            >
              Bulk Approve Selected ({selectedAllocations.length})
            </Button>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <Table>
              <TableHeader className="bg-slate-50">
                <TableRow>
                  <TableHead className="w-10">
                    <input
                      type="checkbox"
                      className="rounded border-slate-300"
                      onChange={(e) => {
                        if (e.target.checked)
                          setSelectedAllocations(
                            allocations
                              ?.filter((a) => a.status === "DRAFT")
                              .map((a) => a.id) || []
                          );
                        else setSelectedAllocations([]);
                      }}
                    />
                  </TableHead>
                  <TableHead className="font-semibold text-slate-900">
                    Employee
                  </TableHead>
                  <TableHead className="font-semibold text-slate-900">
                    Leave Type
                  </TableHead>
                  <TableHead className="font-semibold text-slate-900 text-right">
                    Annual Entitlement
                  </TableHead>
                  <TableHead className="font-semibold text-slate-900 text-center">
                    Status
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {allocations
                  ?.filter((a) => a.status === "DRAFT")
                  .map((a) => (
                    <TableRow
                      key={a.id}
                      className={`${
                        selectedAllocations.includes(a.id)
                          ? "bg-blue-50/50"
                          : ""
                      } hover:bg-slate-50/50 transition-colors`}
                    >
                      <TableCell title="Select for approval">
                        <input
                          type="checkbox"
                          className="rounded border-slate-300"
                          checked={selectedAllocations.includes(a.id)}
                          onChange={() => {
                            setSelectedAllocations((prev) =>
                              prev.includes(a.id)
                                ? prev.filter((x) => x !== a.id)
                                : [...prev, a.id]
                            );
                          }}
                        />
                      </TableCell>
                      <TableCell className="font-bold text-slate-800">
                        {a.employee_name}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="border-slate-200">
                          {a.leave_type_name}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-mono text-right font-bold text-blue-600">
                        {a.total_allocated} Days
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge className="bg-amber-100 text-amber-700 border-amber-200 py-0.5">
                          DRAFT
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                {(!allocations ||
                  allocations.filter((a) => a.status === "DRAFT").length ===
                    0) && (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="text-center py-12 text-slate-400 italic"
                    >
                      No draft allocations ready for approval
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="policies" className="space-y-4 outline-none">
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-bold text-slate-900 text-lg">
              Leave Entitlement Policies
            </h3>
            <Button
              size="sm"
              onClick={() => setIsPolicyModalOpen(true)}
              className="bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-500/20"
            >
              <Plus className="h-4 w-4 mr-1" /> Add Rule
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {policies?.map((policy) => (
              <div
                key={policy.id}
                className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative group"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="p-3 bg-emerald-50 rounded-xl group-hover:bg-emerald-100 transition-colors">
                    <ShieldCheck className="h-6 w-6 text-emerald-600" />
                  </div>
                  <Badge
                    className={
                      policy.is_active
                        ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                        : "bg-slate-50 text-slate-400 border-slate-100"
                    }
                  >
                    {policy.is_active ? "Active" : "Paused"}
                  </Badge>
                </div>

                <h4 className="font-bold text-slate-900 text-lg group-hover:text-emerald-700 transition-colors">
                  {policy.name}
                </h4>
                <p className="text-sm font-medium text-slate-400 mb-6">
                  {policy.leave_type_name}
                </p>

                <div className="space-y-3 bg-slate-50 rounded-xl p-4 border border-slate-100">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-500 font-medium text-xs uppercase tracking-wider">
                      Benefit
                    </span>
                    <span className="font-bold text-emerald-600 text-base">
                      {policy.allocation_days} Days
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-500 font-medium text-xs uppercase tracking-wider">
                      Eligibility
                    </span>
                    <span className="text-slate-700 font-bold">
                      {policy.tenure_months_required}m Tenure
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-500 font-medium text-xs uppercase tracking-wider">
                      Target
                    </span>
                    <span className="text-slate-700 font-bold capitalize">
                      {policy.gender_requirement.toLowerCase()}
                    </span>
                  </div>
                </div>

                <div className="mt-6 flex justify-end gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 hover:bg-slate-100"
                  >
                    <Settings2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
            {(!policies || policies.length === 0) && (
              <div
                className="col-span-full border-2 border-dashed border-slate-200 rounded-3xl p-16 text-center group cursor-pointer hover:border-emerald-300 transition-colors"
                onClick={() => setIsPolicyModalOpen(true)}
              >
                <div className="mx-auto w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4 group-hover:bg-emerald-100 transition-colors">
                  <Plus className="h-8 w-8 text-slate-400 group-hover:text-emerald-600" />
                </div>
                <h5 className="font-bold text-slate-900 mb-1">
                  Define your first leave rule
                </h5>
                <p className="text-slate-400 text-sm max-w-xs mx-auto">
                  Create dynamic rules for CL, ML, AL, or any custom leave type
                  based on employee tenure.
                </p>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Policy Modal */}
      <Dialog open={isPolicyModalOpen} onOpenChange={setIsPolicyModalOpen}>
        <DialogContent className="sm:max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-emerald-600" />
              Define Leave Rule
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-5 py-4">
            <div className="space-y-2">
              <Label className="text-slate-700 font-semibold">Rule Name</Label>
              <Input
                placeholder="e.g. Standard Annual Leave 2024"
                value={policyForm.name}
                onChange={(e) =>
                  setPolicyForm({ ...policyForm, name: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label className="text-slate-700 font-semibold">
                Leave Category
              </Label>
              <Select
                value={policyForm.leave_type}
                onValueChange={(v) =>
                  setPolicyForm({ ...policyForm, leave_type: v })
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select type (CL, ML, AL...)" />
                </SelectTrigger>
                <SelectContent>
                  {leaveTypes?.map((type) => (
                    <SelectItem key={type.id} value={type.id}>
                      {type.name} ({type.code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-slate-700 font-semibold">
                  Days Granted
                </Label>
                <Input
                  type="number"
                  placeholder="12"
                  value={policyForm.allocation_days}
                  onChange={(e) =>
                    setPolicyForm({
                      ...policyForm,
                      allocation_days: e.target.value,
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label className="text-slate-700 font-semibold">
                  Min. Tenure (Mo)
                </Label>
                <Input
                  type="number"
                  placeholder="6"
                  value={policyForm.tenure_months_required}
                  onChange={(e) =>
                    setPolicyForm({
                      ...policyForm,
                      tenure_months_required: e.target.value,
                    })
                  }
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-slate-700 font-semibold">
                Gender Exclusivity
              </Label>
              <Select
                value={policyForm.gender_requirement}
                onValueChange={(v) =>
                  setPolicyForm({ ...policyForm, gender_requirement: v })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Universal (All Genders)</SelectItem>
                  <SelectItem value="MALE">Male Workforce Only</SelectItem>
                  <SelectItem value="FEMALE">Female Workforce Only</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setIsPolicyModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={async () => {
                try {
                  if (!policyForm.leave_type) {
                    toast.error("Please select a leave category.");
                    return;
                  }
                  const company_uuid = getCompanyUuid();
                  await createPolicy({ ...policyForm, company_uuid });
                  toast.success("New leave rule implemented successfully.");
                  setIsPolicyModalOpen(false);
                } catch (err) {
                  toast.error("Error creating leave rule.");
                }
              }}
              className="bg-emerald-600 hover:bg-emerald-700 shadow-md"
            >
              Deploy Rule
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* New Application Modal */}
      <Dialog open={isLeaveModalOpen} onOpenChange={setIsLeaveModalOpen}>
        <DialogContent className="sm:max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
              <Calendar className="h-5 w-5 text-purple-600" />
              New Leave Application
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label className="text-slate-700 font-semibold">Employee</Label>
              <Select
                value={leaveForm.employee}
                onValueChange={(v) =>
                  setLeaveForm({ ...leaveForm, employee: v })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select employee" />
                </SelectTrigger>
                <SelectContent>
                  {employees?.map((emp) => (
                    <SelectItem key={emp.id} value={emp.id}>
                      {emp.first_name} {emp.last_name} ({emp.employee_id})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-slate-700 font-semibold">Leave Type</Label>
              <Select
                value={leaveForm.leave_type}
                onValueChange={(v) =>
                  setLeaveForm({ ...leaveForm, leave_type: v })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select leave type" />
                </SelectTrigger>
                <SelectContent>
                  {leaveTypes?.map((type) => (
                    <SelectItem key={type.id} value={type.id}>
                      {type.name} ({type.code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-slate-700 font-semibold">
                  Start Date
                </Label>
                <Input
                  type="date"
                  value={leaveForm.start_date}
                  onChange={(e) =>
                    setLeaveForm({ ...leaveForm, start_date: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label className="text-slate-700 font-semibold">End Date</Label>
                <Input
                  type="date"
                  value={leaveForm.end_date}
                  onChange={(e) =>
                    setLeaveForm({ ...leaveForm, end_date: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-slate-700 font-semibold">Reason</Label>
              <Input
                placeholder="Briefly explain the reason for leave..."
                value={leaveForm.reason}
                onChange={(e) =>
                  setLeaveForm({ ...leaveForm, reason: e.target.value })
                }
              />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setIsLeaveModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              className="bg-purple-600 hover:bg-purple-700 shadow-md"
              onClick={async () => {
                try {
                  if (
                    !leaveForm.employee ||
                    !leaveForm.leave_type ||
                    !leaveForm.start_date ||
                    !leaveForm.end_date
                  ) {
                    toast.error("Please fill in all required fields.");
                    return;
                  }
                  const company_uuid = getCompanyUuid();
                  await createLeave({ ...leaveForm, company_uuid });
                  toast.success("Leave application submitted successfully.");
                  setIsLeaveModalOpen(false);
                  setLeaveForm({
                    employee: "",
                    leave_type: "",
                    start_date: "",
                    end_date: "",
                    reason: "",
                  });
                } catch (err) {
                  toast.error("Failed to submit leave application.");
                }
              }}
            >
              Submit Application
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
