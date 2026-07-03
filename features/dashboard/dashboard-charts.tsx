"use client";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatStatus } from "@/lib/utils";

const colors = ["#14b8a6", "#2563eb", "#f59e0b", "#ef4444", "#22c55e", "#64748b"];
const tooltipStyle = {
  border: "1px solid var(--border)",
  borderRadius: 8,
  background: "var(--card)",
  boxShadow: "0 16px 36px rgba(15, 23, 42, 0.14)",
  color: "var(--foreground)",
};

export function CategoryChart({ data }: { data: { name: string; value: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data} margin={{ left: -20, right: 8 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
        <XAxis dataKey="name" tickFormatter={formatStatus} tick={{ fontSize: 11 }} />
        <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
        <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "rgba(37, 99, 235, 0.08)" }} formatter={(value, name) => [value, formatStatus(String(name))]} />
        <Bar dataKey="value" radius={[6, 6, 0, 0]}>
          {data.map((entry, index) => (
            <Cell key={entry.name} fill={colors[index % colors.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

export function StatusChart({ data }: { data: { name: string; value: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <PieChart>
        <Pie data={data} dataKey="value" nameKey="name" innerRadius={54} outerRadius={90} paddingAngle={4}>
          {data.map((entry, index) => (
            <Cell key={entry.name} fill={colors[index % colors.length]} />
          ))}
        </Pie>
        <Tooltip contentStyle={tooltipStyle} formatter={(value, name) => [value, formatStatus(String(name))]} />
      </PieChart>
    </ResponsiveContainer>
  );
}

export function MonthlyTrendChart({ data }: { data: { month: string; complaints: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <AreaChart data={data} margin={{ left: -20, right: 8 }}>
        <defs>
          <linearGradient id="trend" x1="0" x2="0" y1="0" y2="1">
            <stop offset="5%" stopColor="#0d9488" stopOpacity={0.35} />
            <stop offset="95%" stopColor="#0d9488" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
        <XAxis dataKey="month" tick={{ fontSize: 12 }} />
        <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
        <Tooltip contentStyle={tooltipStyle} />
        <Area type="monotone" dataKey="complaints" stroke="#0d9488" strokeWidth={2} fill="url(#trend)" />
      </AreaChart>
    </ResponsiveContainer>
  );
}
