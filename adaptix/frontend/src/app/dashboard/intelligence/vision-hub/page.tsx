"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Camera,
  Users,
  ShoppingCart,
  AlertTriangle,
  TrendingUp,
  MapPin,
  Eye,
  UserCheck,
  ShieldAlert,
  ArrowRightLeft,
  Briefcase,
  Search,
  Calendar,
  Filter,
  Download,
  FileText,
  Clock,
  ChevronRight,
  Plus,
  Coffee,
  Plane,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

interface Branch {
  id: string;
  name: string;
  code: string;
}

interface VisionStats {
  env_type: "RETAIL" | "FACTORY" | "OFFICE";
  active_cameras: number;
  on_site_now: number;
  absent_count: number;
  conversion_rate: number;
  security_status: "SECURE" | "ALERT";
}

interface TrafficPoint {
  hour: number;
  entries: number;
  exits: number;
}

interface PresenceLog {
  id: number;
  person_id: string;
  person_type: string;
  camera: string;
  direction: string;
  timestamp: string;
  source: string;
  metadata: any;
}

interface PresenceResponse {
  env_type: string;
  logs: PresenceLog[];
}

interface MovementSession {
  person_id: string;
  out_time: string;
  in_time: string;
  duration_minutes: number;
  is_long_absence: boolean;
  status: string;
}

export default function VisionHubPage() {
  const [activeTab, setActiveTab] = useState("retail");
  const [filterDate, setFilterDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [branches, setBranches] = useState<Branch[]>([]);
  const [selectedBranch, setSelectedBranch] = useState("all");
  const [stats, setStats] = useState<VisionStats | null>(null);
  const [traffic, setTraffic] = useState<TrafficPoint[]>([]);
  const [logs, setLogs] = useState<PresenceLog[]>([]);
  const [movements, setMovements] = useState<MovementSession[]>([]);
  const [envType, setEnvType] = useState<string>("OFFICE");
  const [isLoading, setIsLoading] = useState(true);
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);

  // Dynamic Label Generation
  const visitorLabel = envType === "RETAIL" ? "Customer" : "Visitor";

  // Manual Form State
  const [manualType, setManualType] = useState<"footfall" | "presence">(
    "footfall"
  );
  const [manualForm, setManualForm] = useState({
    entries: "0",
    exits: "0",
    person_id: "",
    person_type: "VISITOR",
    direction: "IN",
    leave_status: "Regular Break",
    timestamp: new Date().toISOString().slice(0, 16),
  });

  // 1. Fetch Branches
  useEffect(() => {
    fetch("/api/company/wings/")
      .then((res) => res.json())
      .then((data) => {
        setBranches(data);
        if (data.length > 0) setSelectedBranch(data[0].id);
      })
      .catch((err) => console.error("Error fetching branches:", err));
  }, []);

  // 2. Fetch All Data
  const refreshData = () => {
    if (selectedBranch === "all") return;

    setIsLoading(true);
    const statsUrl = `/api/intelligence/vision/stats/?branch_uuid=${selectedBranch}`;
    const trafficUrl = `/api/intelligence/vision/traffic/?branch_uuid=${selectedBranch}&date=${filterDate}`;
    const logsUrl = `/api/intelligence/vision/presence-analytics/?branch_uuid=${selectedBranch}`;
    const movementsUrl = `/api/intelligence/vision/movement-tracking/?branch_uuid=${selectedBranch}`;

    Promise.all([
      fetch(statsUrl).then((r) => r.json()),
      fetch(trafficUrl).then((r) => r.json()),
      fetch(logsUrl).then((r) => r.json()),
      fetch(movementsUrl).then((r) => r.json()),
    ])
      .then(
        ([statsData, trafficData, logsResponse, movementsData]: [
          VisionStats,
          TrafficPoint[],
          PresenceResponse,
          MovementSession[]
        ]) => {
          setStats(statsData);
          setTraffic(trafficData);
          setLogs(logsResponse.logs);
          setMovements(movementsData);
          setEnvType(statsData.env_type || logsResponse.env_type || "OFFICE");
          setIsLoading(false);
        }
      )
      .catch((err) => {
        console.error("Error fetching vision data:", err);
        setIsLoading(false);
      });
  };

  useEffect(() => {
    refreshData();
  }, [selectedBranch, filterDate]);

  const handleManualSubmit = async () => {
    try {
      const payload = {
        entry_type: manualType,
        branch_uuid: selectedBranch,
        ...manualForm,
      };

      // Auto-adjust person_type for retail if it's default VISITOR
      if (
        manualType === "presence" &&
        envType === "RETAIL" &&
        manualForm.person_type === "VISITOR"
      ) {
        payload.person_type = "CUSTOMER";
      }

      const response = await fetch("/api/intelligence/vision/manual-entry/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        toast.success(`Manual ${manualType} entry saved`);
        setIsManualModalOpen(false);
        refreshData();
      } else {
        toast.error("Failed to save manual entry");
      }
    } catch (error) {
      toast.error("An error occurred");
    }
  };

  return (
    <div className="p-6 space-y-6 bg-slate-50/50 min-h-screen">
      {/* Header with Global Filters */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-2">
            <Eye className="h-8 w-8 text-blue-600" />
            AI Vision Hub
          </h1>
          <p className="text-slate-500 mt-1">
            Unified visual intelligence across all business sites.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Dialog open={isManualModalOpen} onOpenChange={setIsManualModalOpen}>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                className="bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100 flex items-center gap-2"
              >
                <AlertTriangle className="h-4 w-4" />
                Manual Log Fallback
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Manual Vision Entry</DialogTitle>
                <DialogDescription>
                  Log activity manually if CCTV or power is unavailable.
                </DialogDescription>
              </DialogHeader>
              <Tabs
                defaultValue="footfall"
                onValueChange={(v) => setManualType(v as any)}
              >
                <TabsList className="grid w-full grid-cols-2 mb-4">
                  <TabsTrigger value="footfall">Footfall (Traffic)</TabsTrigger>
                  <TabsTrigger value="presence">Presence (ID)</TabsTrigger>
                </TabsList>
                <TabsContent value="footfall" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Entries Count</Label>
                      <Input
                        type="number"
                        value={manualForm.entries}
                        onChange={(e) =>
                          setManualForm({
                            ...manualForm,
                            entries: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Exits Count</Label>
                      <Input
                        type="number"
                        value={manualForm.exits}
                        onChange={(e) =>
                          setManualForm({
                            ...manualForm,
                            exits: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>
                </TabsContent>
                <TabsContent value="presence" className="space-y-4">
                  <div className="space-y-2">
                    <Label>Person ID / Name</Label>
                    <Input
                      placeholder={`Employee ID or '${visitorLabel}'`}
                      value={manualForm.person_id}
                      onChange={(e) =>
                        setManualForm({
                          ...manualForm,
                          person_id: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Type</Label>
                      <Select
                        value={manualForm.person_type}
                        onValueChange={(v) =>
                          setManualForm({ ...manualForm, person_type: v })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="EMPLOYEE">Employee</SelectItem>
                          <SelectItem
                            value={
                              envType === "RETAIL" ? "CUSTOMER" : "VISITOR"
                            }
                          >
                            {visitorLabel}
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Direction</Label>
                      <Select
                        value={manualForm.direction}
                        onValueChange={(v) =>
                          setManualForm({ ...manualForm, direction: v })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="IN">Entry (IN)</SelectItem>
                          <SelectItem value="OUT">Exit (OUT)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  {manualForm.direction === "OUT" &&
                    manualForm.person_type === "EMPLOYEE" && (
                      <div className="space-y-2">
                        <Label>Movement Reason</Label>
                        <Select
                          value={manualForm.leave_status}
                          onValueChange={(v) =>
                            setManualForm({ ...manualForm, leave_status: v })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Regular Break">
                              Regular Break
                            </SelectItem>
                            <SelectItem value="Short Leave">
                              Short Leave
                            </SelectItem>
                            <SelectItem value="Official Duty">
                              Official Duty
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                </TabsContent>
                <div className="space-y-2 mt-4">
                  <Label>Event Timestamp</Label>
                  <Input
                    type="datetime-local"
                    value={manualForm.timestamp}
                    onChange={(e) =>
                      setManualForm({
                        ...manualForm,
                        timestamp: e.target.value,
                      })
                    }
                  />
                </div>
              </Tabs>
              <DialogFooter className="mt-6">
                <Button
                  variant="outline"
                  onClick={() => setIsManualModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleManualSubmit}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Save Manual Entry
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <div className="flex flex-wrap items-center gap-2 bg-white p-2 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex items-center gap-2 px-3 border-r border-slate-100">
              <Filter className="h-4 w-4 text-slate-400" />
              <select
                className="bg-transparent border-none text-sm font-medium focus:ring-0 cursor-pointer"
                value={selectedBranch}
                onChange={(e) => setSelectedBranch(e.target.value)}
              >
                <option value="all">Select Branch</option>
                {branches.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-2 px-3">
              <Calendar className="h-4 w-4 text-slate-400" />
              <input
                type="date"
                className="bg-transparent border-none text-sm font-medium focus:ring-0 cursor-pointer"
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      <Tabs
        defaultValue="retail"
        className="w-full"
        onValueChange={setActiveTab}
      >
        <div className="flex justify-between items-center mb-6">
          <TabsList className="bg-slate-100/50 p-1">
            <TabsTrigger
              value="retail"
              className="flex items-center gap-2 py-2 px-4"
            >
              <ShoppingCart className="h-4 w-4" />
              Retail & POS
            </TabsTrigger>
            <TabsTrigger
              value="factory"
              className="flex items-center gap-2 py-2 px-4"
            >
              <Briefcase className="h-4 w-4" />
              Site Presence
            </TabsTrigger>
            <TabsTrigger
              value="movements"
              className="flex items-center gap-2 py-2 px-4"
            >
              <Clock className="h-4 w-4" />
              Absence Tracking
            </TabsTrigger>
            <TabsTrigger
              value="reports"
              className="flex items-center gap-2 py-2 px-4"
            >
              <FileText className="h-4 w-4" />
              Intelligence Reports
            </TabsTrigger>
          </TabsList>

          <div className="flex gap-2">
            <Badge
              variant="outline"
              className="bg-green-50 text-green-700 border-green-200 py-1.5 px-3"
            >
              <div className="h-2 w-2 rounded-full bg-green-500 mr-2 animate-pulse" />
              Vision Engine Live
            </Badge>
          </div>
        </div>

        {/* Global Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-white border-none shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Active Monitoring
                  </p>
                  <h3 className="text-2xl font-bold mt-1 text-slate-900">
                    {stats?.active_cameras ?? 0} Cameras
                  </h3>
                </div>
                <div className="p-3 bg-blue-50 rounded-xl">
                  <Camera className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-none shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    {activeTab === "retail" ? "Daily Reach" : "On-Site Now"}
                  </p>
                  <h3 className="text-2xl font-bold mt-1 text-slate-900">
                    {stats?.on_site_now ?? 0}
                  </h3>
                </div>
                <div className="p-3 bg-indigo-50 rounded-xl">
                  <Users className="h-6 w-6 text-indigo-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card
            className={`bg-white border-none shadow-sm hover:shadow-md transition-shadow ${
              (stats?.absent_count ?? 0) > 0 ? "ring-2 ring-rose-500/20" : ""
            }`}
          >
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    {envType === "RETAIL" ? "Break Absences" : "Total Absences"}
                  </p>
                  <h3
                    className={`text-2xl font-bold mt-1 ${
                      (stats?.absent_count ?? 0) > 0
                        ? "text-rose-600"
                        : "text-slate-900"
                    }`}
                  >
                    {stats?.absent_count ?? 0}
                  </h3>
                </div>
                <div
                  className={`p-3 rounded-xl ${
                    (stats?.absent_count ?? 0) > 0
                      ? "bg-rose-50"
                      : "bg-amber-50"
                  }`}
                >
                  <Coffee
                    className={`h-6 w-6 ${
                      (stats?.absent_count ?? 0) > 0
                        ? "text-rose-600"
                        : "text-amber-600"
                    }`}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-none shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Security State
                  </p>
                  <h3
                    className={`text-2xl font-bold mt-1 ${
                      stats?.security_status === "ALERT"
                        ? "text-rose-600"
                        : "text-slate-900"
                    }`}
                  >
                    {stats?.security_status ?? "OPTIMAL"}
                  </h3>
                </div>
                <div className="p-3 bg-rose-50 rounded-xl">
                  <ShieldAlert className="h-6 w-6 text-rose-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tab Contents */}
        <TabsContent value="retail" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2 bg-white border-none shadow-sm overflow-hidden">
              <CardHeader className="border-b bg-slate-50/50 flex flex-row items-center justify-between pb-3">
                <CardTitle className="text-lg font-bold flex items-center gap-2">
                  <ShoppingCart className="h-5 w-5 text-blue-500" />
                  Live Hybrid Checkout Integration
                </CardTitle>
                <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 border-none">
                  Active Sync
                </Badge>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-slate-100">
                  <div className="p-4 bg-blue-50/30 border-l-4 border-blue-500 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 bg-white rounded-xl border border-blue-200 shadow-sm flex items-center justify-center font-bold text-blue-600 text-xs">
                        LIVE
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-0.5">
                          <p className="font-bold text-slate-900">
                            Waiting for Detections
                          </p>
                          <Badge variant="outline" className="text-[10px] h-4">
                            API Connected
                          </Badge>
                        </div>
                        <p className="text-xs text-slate-500">
                          Scan barcode/QR or wait for CCTV automated cart...
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white border-none shadow-sm">
              <CardHeader className="border-b bg-slate-50/50">
                <CardTitle className="text-lg font-bold flex items-center gap-2">
                  <ArrowRightLeft className="h-5 w-5 text-indigo-500" />
                  Traffic Flux
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-6">
                  <div className="flex justify-between items-end h-32 gap-1">
                    {traffic.length > 0 ? (
                      traffic.map((tp, i) => (
                        <div
                          key={i}
                          className="flex-1 bg-indigo-100 rounded-t-lg relative group transition-all hover:bg-indigo-300"
                        >
                          <div
                            className="absolute inset-x-0 bottom-0 bg-indigo-500 rounded-t-lg transition-all"
                            style={{
                              height: `${Math.min(
                                100,
                                (tp.entries / 10) * 100
                              )}%`,
                            }}
                          ></div>
                        </div>
                      ))
                    ) : (
                      <div className="flex-1 h-32 flex items-center justify-center text-xs text-slate-400 italic">
                        No movement data
                      </div>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-50 p-3 rounded-lg text-center">
                      <p className="text-xs text-slate-500 mb-1">
                        Total Entries
                      </p>
                      <p className="text-xl font-bold text-emerald-600">
                        {traffic.reduce((a, b) => a + b.entries, 0)}
                      </p>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-lg text-center">
                      <p className="text-xs text-slate-500 mb-1">Total Exits</p>
                      <p className="text-xl font-bold text-rose-600">
                        {traffic.reduce((a, b) => a + b.exits, 0)}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="factory" className="space-y-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-slate-900">
              Site Activity Report
            </h2>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                Export CSV
              </Button>
            </div>
          </div>

          <Card className="bg-white border-none shadow-sm">
            <CardContent className="p-0">
              <Table>
                <TableHeader className="bg-slate-50">
                  <TableRow>
                    <TableHead>Identified Person</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Camera / Source</TableHead>
                    <TableHead>Event Time</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {logs.map((log) => (
                    <TableRow key={log.id} className="hover:bg-slate-50/50">
                      <TableCell className="font-semibold">
                        <div className="flex items-center gap-2">
                          <div
                            className={`h-2 w-2 rounded-full ${
                              log.person_type === "UNAUTHORIZED"
                                ? "bg-rose-500 animate-pulse"
                                : "bg-emerald-500"
                            }`}
                          />
                          {log.person_id}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="secondary"
                          className={`${
                            log.person_type === "EMPLOYEE"
                              ? "bg-blue-50 text-blue-700"
                              : log.person_type === "CUSTOMER"
                              ? "bg-emerald-50 text-emerald-700"
                              : log.person_type === "VISITOR"
                              ? "bg-amber-50 text-amber-700"
                              : "bg-rose-50 text-rose-700"
                          }`}
                        >
                          {log.person_type}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-slate-500 flex flex-col gap-0.5">
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" /> {log.camera}
                        </span>
                        {log.source === "MANUAL" && (
                          <div className="flex gap-1">
                            <Badge
                              variant="outline"
                              className="text-[10px] w-fit text-amber-600 border-amber-200"
                            >
                              Manual Entry
                            </Badge>
                            {log.metadata?.leave_status === "Short Leave" && (
                              <Badge className="bg-indigo-50 text-indigo-700 border-indigo-100 text-[10px] h-4">
                                Short Leave
                              </Badge>
                            )}
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="text-slate-500 font-mono text-xs">
                        {new Date(log.timestamp).toLocaleTimeString()}
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={
                            log.direction === "IN"
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-amber-100 text-amber-700"
                          }
                        >
                          {log.direction}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                  {logs.length === 0 && (
                    <TableRow>
                      <TableCell
                        colSpan={5}
                        className="text-center py-8 text-slate-400 italic"
                      >
                        No activity logs found for this site
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="movements" className="space-y-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-slate-900">
              Employee Breakdown & Break Tracker
            </h2>
          </div>

          <Card className="bg-white border-none shadow-sm">
            <CardContent className="p-0">
              <Table>
                <TableHeader className="bg-slate-50">
                  <TableRow>
                    <TableHead>Employee ID</TableHead>
                    <TableHead>Last Departure</TableHead>
                    <TableHead>Return Time</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Type / Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {movements.map((m, i) => (
                    <TableRow key={i} className="hover:bg-slate-50/50">
                      <TableCell className="font-bold">{m.person_id}</TableCell>
                      <TableCell className="text-slate-500">
                        {new Date(m.out_time).toLocaleTimeString()}
                      </TableCell>
                      <TableCell className="text-slate-500">
                        {new Date(m.in_time).toLocaleTimeString()}
                      </TableCell>
                      <TableCell>
                        <span
                          className={`font-mono ${
                            m.is_long_absence
                              ? "text-rose-600 font-bold"
                              : "text-slate-700"
                          }`}
                        >
                          {m.duration_minutes} mins
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={`${
                            m.status === "Short Leave"
                              ? "bg-indigo-50 text-indigo-700 border-indigo-200"
                              : m.is_long_absence
                              ? "bg-rose-50 text-rose-700 border-rose-200"
                              : "bg-slate-50 text-slate-600"
                          }`}
                        >
                          {m.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                  {movements.length === 0 && (
                    <TableRow>
                      <TableCell
                        colSpan={5}
                        className="text-center py-8 text-slate-400 italic"
                      >
                        No movement sessions recorded for today
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-6">
          <Card className="bg-white border-none shadow-sm">
            <CardHeader>
              <CardTitle className="text-xl font-bold flex items-center gap-2">
                <TrendingUp className="h-6 w-6 text-blue-600" />
                Long-term Intelligence Insights
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-500 italic">
                Historical analytics aggregation in progress...
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
