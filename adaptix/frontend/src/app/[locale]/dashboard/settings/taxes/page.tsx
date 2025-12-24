"use client";

import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import {
  Percent,
  MapPin,
  Settings2,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Clock,
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

export default function TaxesSettingsPage() {
  const t = useTranslations("Taxes");

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-violet-500 to-indigo-600 bg-clip-text text-transparent">
            {t("title")}
          </h1>
          <p className="text-muted-foreground mt-1">{t("description")}</p>
        </div>
        <div className="flex gap-2">
          <Button className="bg-violet-600 hover:bg-violet-700 text-white gap-2 shadow-lg shadow-violet-500/20">
            <Plus className="h-4 w-4" /> {t("addRate")}
          </Button>
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
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <Card className="border-border/40 bg-card/50 backdrop-blur-sm shadow-xl">
                <CardHeader>
                  <CardTitle>{t("rates")}</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/50">
                        <TableHead>{t("name")}</TableHead>
                        <TableHead>{t("rate")}</TableHead>
                        <TableHead>{t("status")}</TableHead>
                        <TableHead className="text-right">
                          {t("actions")}
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow className="hover:bg-muted/30">
                        <TableCell className="font-medium">
                          Standard VAT
                        </TableCell>
                        <TableCell>15%</TableCell>
                        <TableCell>
                          <Badge className="bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 border-none">
                            {t("active")}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-slate-400 hover:text-white"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          <TabsContent value="zones" className="mt-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className="border-border/40 bg-card/50 backdrop-blur-sm shadow-xl">
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>{t("zones")}</CardTitle>
                    <CardDescription>
                      Define geographical regions for tax application.
                    </CardDescription>
                  </div>
                  <Button variant="outline" size="sm" className="gap-2">
                    <Plus className="h-4 w-4" /> {t("addZone")}
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="p-4 rounded-xl border border-border/40 bg-muted/20 hover:bg-muted/30 transition-all group">
                      <div className="flex items-center justify-between mb-2">
                        <Badge className="bg-sky-500/10 text-sky-500 border-none">
                          BD-DHK
                        </Badge>
                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                          >
                            <Settings2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                      <h3 className="font-bold">Dhaka Region</h3>
                      <p className="text-xs text-muted-foreground mt-1">
                        Bangladesh
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          <TabsContent value="rules" className="mt-6">
            {/* Rules Content Here */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className="border-border/40 bg-card/50 backdrop-blur-sm shadow-xl">
                <CardHeader>
                  <CardTitle>{t("rules")}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-12">
                    <Settings2 className="h-12 w-12 text-slate-500 mx-auto mb-4" />
                    <h3 className="text-lg font-medium">No rules defined</h3>
                    <p className="text-muted-foreground">
                      Start by adding a tax rule for your zones.
                    </p>
                    <Button className="mt-4 bg-violet-600 hover:bg-violet-700 text-white gap-2">
                      <Plus className="h-4 w-4" /> {t("addRule")}
                    </Button>
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
