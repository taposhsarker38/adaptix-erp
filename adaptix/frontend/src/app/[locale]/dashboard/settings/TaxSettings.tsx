"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import {
  Percent,
  MapPin,
  Settings2,
  Plus,
  Trash2,
  RefreshCcw,
  PlusCircle,
  Tag,
  Globe,
  Loader2,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import api from "@/lib/api";
import { toast } from "sonner";

interface TaxRate {
  id: string;
  name: string;
  rate: number;
}

interface TaxZone {
  id: string;
  name: string;
  code: string;
}

interface TaxRule {
  id: string;
  name: string;
  tax_zone_code: string;
  rate_id: string;
  product_category_id: string | null;
  priority: number;
}

export function TaxSettings() {
  const t = useTranslations("Taxes");
  const [rates, setRates] = useState<TaxRate[]>([]);
  const [zones, setZones] = useState<TaxZone[]>([]);
  const [rules, setRules] = useState<TaxRule[]>([]);
  const [loading, setLoading] = useState(true);

  // Form States
  const [rateForm, setRateForm] = useState({ name: "", rate: "" });
  const [zoneForm, setZoneForm] = useState({ name: "", code: "" });
  const [isRateModalOpen, setIsRateModalOpen] = useState(false);
  const [isZoneModalOpen, setIsZoneModalOpen] = useState(false);

  const parseError = (error: any) => {
    console.error("API Error Response:", error.response);
    const status = error.response?.status;
    if (status === 404)
      return "API Endpoint not found (404). Please check backend routing.";

    const data = error.response?.data;
    if (!data) return t("saveError");

    if (typeof data === "string") return data;
    if (data.detail) return data.detail;
    if (data.message) return data.message;

    // Handle DRF validation errors (e.g., { name: ["This field is required"] })
    return Object.keys(data)
      .map((key) => {
        const val = data[key];
        return `${key}: ${Array.isArray(val) ? val.join(", ") : val}`;
      })
      .join(" | ");
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const [ratesRes, zonesRes, rulesRes] = await Promise.all([
        api.get("/accounting/tax/rates/"),
        api.get("/accounting/tax/zones/"),
        api.get("/accounting/tax/rules/"),
      ]);
      setRates(ratesRes.data.results || ratesRes.data);
      setZones(zonesRes.data.results || zonesRes.data);
      setRules(rulesRes.data.results || rulesRes.data);
    } catch (error) {
      console.error("Failed to fetch tax data", error);
      toast.error(parseError(error));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateRate = async () => {
    if (!rateForm.name || !rateForm.rate) {
      toast.error("Please fill all required fields");
      return;
    }
    try {
      await api.post("/accounting/tax/rates/", {
        name: rateForm.name,
        rate: parseFloat(rateForm.rate),
      });
      toast.success(t("saveSuccess"));
      setRateForm({ name: "", rate: "" });
      setIsRateModalOpen(false);
      fetchData();
    } catch (error: any) {
      toast.error(parseError(error));
    }
  };

  const handleCreateZone = async () => {
    if (!zoneForm.name || !zoneForm.code) {
      toast.error("Please fill all required fields");
      return;
    }
    try {
      await api.post("/accounting/tax/zones/", {
        name: zoneForm.name,
        code: zoneForm.code,
      });
      toast.success(t("saveSuccess"));
      setZoneForm({ name: "", code: "" });
      setIsZoneModalOpen(false);
      fetchData();
    } catch (error: any) {
      toast.error(parseError(error));
    }
  };

  const handleDelete = async (
    type: "rates" | "zones" | "rules",
    id: string
  ) => {
    try {
      await api.delete(`/accounting/tax/${type}/${id}/`);
      toast.success("Deleted successfully");
      fetchData();
    } catch (error) {
      toast.error(parseError(error));
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <Loader2 className="h-10 w-10 text-violet-500 animate-spin" />
        <p className="text-muted-foreground animate-pulse">
          Loading configurations...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">{t("title")}</h2>
          <p className="text-muted-foreground text-sm">{t("description")}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={fetchData}>
            <RefreshCcw className="h-4 w-4" />
          </Button>

          {/* Add Rate Modal */}
          <Dialog open={isRateModalOpen} onOpenChange={setIsRateModalOpen}>
            <DialogTrigger asChild>
              <Button className="bg-violet-600 hover:bg-violet-700 text-white gap-2 shadow-lg shadow-violet-500/20">
                <Plus className="h-4 w-4" /> {t("addRate")}
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>{t("addRateTitle")}</DialogTitle>
                <DialogDescription>
                  Enter the details for the new tax rate.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="name" className="text-right">
                    {t("name")}
                  </Label>
                  <Input
                    id="name"
                    value={rateForm.name}
                    onChange={(e) =>
                      setRateForm({ ...rateForm, name: e.target.value })
                    }
                    className="col-span-3"
                    placeholder={t("placeholderName")}
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="rate" className="text-right">
                    {t("rate")}
                  </Label>
                  <Input
                    id="rate"
                    type="number"
                    value={rateForm.rate}
                    onChange={(e) =>
                      setRateForm({ ...rateForm, rate: e.target.value })
                    }
                    className="col-span-3"
                    placeholder={t("placeholderRate")}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  onClick={handleCreateRate}
                  className="bg-violet-600 hover:bg-violet-700 text-white w-full"
                >
                  {t("save")}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Tabs defaultValue="rates" className="w-full">
        <TabsList className="bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
          <TabsTrigger value="rates" className="rounded-lg gap-2">
            <Percent className="h-4 w-4" /> {t("rates")}
          </TabsTrigger>
          <TabsTrigger value="zones" className="rounded-lg gap-2">
            <MapPin className="h-4 w-4" /> {t("zones")}
          </TabsTrigger>
          <TabsTrigger value="rules" className="rounded-lg gap-2">
            <Settings2 className="h-4 w-4" /> {t("rules")}
          </TabsTrigger>
        </TabsList>

        <AnimatePresence mode="wait">
          <TabsContent value="rates" className="mt-6">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <Card className="border-border/40 bg-card/50 backdrop-blur-sm shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg">{t("rates")}</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/50 hover:bg-muted/50">
                        <TableHead className="w-75">{t("name")}</TableHead>
                        <TableHead>{t("rate")}</TableHead>
                        <TableHead>{t("status")}</TableHead>
                        <TableHead className="text-right">
                          {t("actions")}
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {rates.map((rate) => (
                        <TableRow
                          key={rate.id}
                          className="hover:bg-muted/30 transition-colors"
                        >
                          <TableCell className="font-medium">
                            {rate.name}
                          </TableCell>
                          <TableCell>{rate.rate}%</TableCell>
                          <TableCell>
                            <Badge className="bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 border-none">
                              {t("active")}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-muted-foreground hover:text-destructive"
                              onClick={() => handleDelete("rates", rate.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                      {rates.length === 0 && (
                        <TableRow>
                          <TableCell
                            colSpan={4}
                            className="text-center py-8 text-muted-foreground italic"
                          >
                            No tax rates found. Add one to get started.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          <TabsContent value="zones" className="mt-6">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className="border-border/40 bg-card/50 backdrop-blur-sm shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">{t("zones")}</CardTitle>
                    <CardDescription className="text-xs">
                      Geographical regions for automated tax calculations.
                    </CardDescription>
                  </div>

                  {/* Add Zone Modal */}
                  <Dialog
                    open={isZoneModalOpen}
                    onOpenChange={setIsZoneModalOpen}
                  >
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm" className="gap-2 h-8">
                        <Plus className="h-3 w-3" /> {t("addZone")}
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                      <DialogHeader>
                        <DialogTitle>{t("addZoneTitle")}</DialogTitle>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="zone-name" className="text-right">
                            {t("name")}
                          </Label>
                          <Input
                            id="zone-name"
                            value={zoneForm.name}
                            onChange={(e) =>
                              setZoneForm({ ...zoneForm, name: e.target.value })
                            }
                            className="col-span-3"
                          />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="code" className="text-right">
                            {t("code")}
                          </Label>
                          <Input
                            id="code"
                            value={zoneForm.code}
                            onChange={(e) =>
                              setZoneForm({ ...zoneForm, code: e.target.value })
                            }
                            className="col-span-3"
                            placeholder="e.g. BD-DHK"
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button
                          onClick={handleCreateZone}
                          className="bg-violet-600 hover:bg-violet-700 text-white w-full"
                        >
                          {t("save")}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {zones.map((zone) => (
                      <div
                        key={zone.id}
                        className="p-4 rounded-xl border border-border/40 bg-muted/20 hover:bg-muted/30 transition-all group relative overflow-hidden"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <Badge className="bg-sky-500/10 text-sky-500 border-none text-[10px]">
                            {zone.code}
                          </Badge>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => handleDelete("zones", zone.id)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                        <h3 className="font-bold text-sm">{zone.name}</h3>
                      </div>
                    ))}
                    {zones.length === 0 && (
                      <div className="col-span-full text-center py-12 border-2 border-dashed border-border rounded-xl">
                        <Globe className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                        <p className="text-muted-foreground text-sm">
                          No zones configured yet.
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          <TabsContent value="rules" className="mt-6">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className="border-border/40 bg-card/50 backdrop-blur-sm shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg">{t("rules")}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-12">
                    <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                      <Settings2 className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <h3 className="text-md font-medium">No rules defined</h3>
                    <p className="text-xs text-muted-foreground max-w-62.5 mx-auto mt-1">
                      Start by adding a tax rule to correlate products with
                      zones.
                    </p>
                    <Button
                      className="mt-4 bg-violet-600 hover:bg-violet-700 text-white gap-2 h-9 px-4 disabled:opacity-50"
                      disabled
                    >
                      <Plus className="h-4 w-4" /> {t("addRule")}
                    </Button>
                    <p className="text-[10px] text-muted-foreground mt-2 italic">
                      Rules logic coming soon
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>
        </AnimatePresence>
      </Tabs>
    </div>
  );
}
