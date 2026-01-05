"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { InspectionList } from "./inspection-list";
import { QualityStandardList } from "./standard-list";
import { QCAnalytics } from "./qc-analytics";
import { qualityApi } from "@/lib/api/quality";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";

export function QualityClient() {
  const [inspections, setInspections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const data = await qualityApi.getInspections();
      setInspections(data);
    } catch (e) {
      console.error("Failed to fetch inspections for analytics");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Quality Control</h1>
          <p className="text-muted-foreground">
            Manage quality standards and inspections.
          </p>
        </div>
      </div>

      <Tabs defaultValue="inspections" className="space-y-4">
        <TabsList>
          <TabsTrigger value="inspections">Inspections</TabsTrigger>
          <TabsTrigger value="standards">Quality Standards</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="inspections" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Inspection Log</CardTitle>
              <CardDescription>
                Recent quality inspections and their results.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <InspectionList />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="standards" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Quality Standards</CardTitle>
              <CardDescription>
                Define acceptance criteria for products.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <QualityStandardList />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Continuous Improvement Metrics</CardTitle>
              <CardDescription>
                Real-time quality performance and defect analysis.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="h-[300px] flex items-center justify-center">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <QCAnalytics data={inspections} />
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
