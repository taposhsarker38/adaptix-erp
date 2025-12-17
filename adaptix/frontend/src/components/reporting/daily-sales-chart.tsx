"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";

export function DailySalesChart() {
  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
    // Reporting Service: /api/daily-sales/
    // Kong: /api/reporting/daily-sales/
    const fetchData = async () => {
      try {
        const res = await api.get("/reporting/daily-sales/");
        // Limit to last 7 days for chart
        const results = res.data.results || res.data;
        // Reverse if API returns newest first (default in ViewSet order_by='-date')
        // We want chart to go left->right (oldest->newest)
        setData(results.slice(0, 7).reverse());
      } catch (e) {
        console.error(e);
      }
    };
    fetchData();
  }, []);

  return (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart data={data}>
        <XAxis
          dataKey="date"
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => `$${value}`}
        />
        <Tooltip />
        <Bar dataKey="total_revenue" fill="#adfa1d" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
