"use client";

import { useState, useEffect } from "react";
import { Brain, Sparkles, TrendingUp, Package, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import api from "@/lib/api";
import { toast } from "sonner";
import { format } from "date-fns";

export function AIClient() {
  const [module, setModule] = useState("sales-forecast");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any[]>([]);

  const fetchForecast = async () => {
    try {
      const res = await api.get("/intelligence/forecast/sales/");
      setData(res.data);
    } catch (e) {
      console.error(e);
      // toast.error("Failed to fetch forecast data");
    }
  };

  const generateForecast = async () => {
    setLoading(true);
    try {
      await api.post("/intelligence/forecast/sales/");
      toast.success("Forecast generated successfully!");
      fetchForecast();
    } catch (e: any) {
      toast.error(
        e.response?.data?.message || "Generation failed (Need more data?)"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (module === "sales-forecast") {
      fetchForecast();
    } else {
      setData([]);
    }
  }, [module]);

  const renderContent = () => {
    switch (module) {
      case "sales-forecast":
        return (
          <div className="space-y-4">
            <div className="flex justify-between items-center bg-blue-50 dark:bg-slate-900 p-4 rounded-lg border">
              <div>
                <h3 className="font-semibold flex items-center">
                  <TrendingUp className="mr-2 h-4 w-4" /> Sales Prediction
                </h3>
                <p className="text-sm text-muted-foreground">
                  Uses Facebook Prophet to predict next 30 days of revenue.
                </p>
              </div>
              <Button onClick={generateForecast} disabled={loading}>
                {loading ? (
                  <Sparkles className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Sparkles className="mr-2 h-4 w-4" />
                )}
                {loading ? "Generating..." : "Generate AI Forecast"}
              </Button>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>30-Day Revenue Forecast</CardTitle>
              </CardHeader>
              <CardContent className="h-[400px]">
                {data.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={data}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        dataKey="date"
                        tickFormatter={(val) => format(new Date(val), "MMM d")}
                      />
                      <YAxis />
                      <Tooltip
                        labelFormatter={(val) => format(new Date(val), "PPP")}
                      />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="predicted_sales"
                        stroke="#2563eb"
                        name="Predicted Sales"
                        strokeWidth={2}
                      />
                      <Line
                        type="monotone"
                        dataKey="upper"
                        stroke="#82ca9d"
                        strokeDasharray="5 5"
                        name="Confidence Upper"
                        dot={false}
                      />
                      <Line
                        type="monotone"
                        dataKey="lower"
                        stroke="#8884d8"
                        strokeDasharray="5 5"
                        name="Confidence Lower"
                        dot={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full text-muted-foreground">
                    No forecast data. Click "Generate" to start.
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        );
      case "inventory-opt":
        return (
          <div className="flex flex-col items-center justify-center h-64 text-center space-y-4">
            <Package className="h-12 w-12 text-muted-foreground" />
            <div>
              <h3 className="font-semibold text-lg">Inventory Optimization</h3>
              <p className="text-muted-foreground max-w-sm">
                AI analysis to prevent stockouts and overstocking. Coming soon.
              </p>
            </div>
          </div>
        );
      case "hr-retention":
        return (
          <div className="flex flex-col items-center justify-center h-64 text-center space-y-4">
            <Users className="h-12 w-12 text-muted-foreground" />
            <div>
              <h3 className="font-semibold text-lg">Employee Retention</h3>
              <p className="text-muted-foreground max-w-sm">
                Predict turnover risk factors using historical HR data. Coming
                soon.
              </p>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold tracking-tight">
            Adaptix Intelligence
          </h2>
          <p className="text-muted-foreground">
            AI-powered insights and predictions for your business.
          </p>
        </div>

        <div className="w-[250px]">
          <Select value={module} onValueChange={setModule}>
            <SelectTrigger>
              <SelectValue placeholder="Select Module" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="sales-forecast">Sales Forecasting</SelectItem>
              <SelectItem value="inventory-opt">
                Inventory Optimization
              </SelectItem>
              <SelectItem value="hr-retention">
                HR Retention Analysis
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {renderContent()}
    </div>
  );
}
