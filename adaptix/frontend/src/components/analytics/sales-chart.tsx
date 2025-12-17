"use client";

import {
  Bar,
  BarChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";

interface SalesChartProps {
  data: any[];
}

export function SalesChart({ data }: SalesChartProps) {
  // Transform data if necessary, ensuring date is formatted nicely
  const chartData = data
    .map((item) => ({
      name: new Date(item.date).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
      total: parseFloat(item.total_revenue),
    }))
    .reverse(); // API returns descending usually

  return (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart data={chartData}>
        <XAxis
          dataKey="name"
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
        <Tooltip
          cursor={{ fill: "transparent" }}
          contentStyle={{
            borderRadius: "8px",
            border: "none",
            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
          }}
        />
        <Bar
          dataKey="total"
          fill="currentColor"
          radius={[4, 4, 0, 0]}
          className="fill-primary"
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
