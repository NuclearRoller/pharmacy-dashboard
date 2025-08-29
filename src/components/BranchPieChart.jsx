// src/components/BranchPieChart.jsx
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";

// monthAverage is ONE object: { month: "YYYY-MM", Ahmed: N, Wael: N, ... , Total: N }
export default function BranchPieChart({ monthAverage, colors }) {
  if (!monthAverage) return <p className="text-gray-600">Loading…</p>;

  const entries = Object.entries(monthAverage)
    .filter(([k]) => k !== "month" && k !== "Total")
    .map(([name, value]) => ({ name, value: Number(value) || 0 }));

  const monthLabel = monthAverage.month || "";

  return (
    <div className="w-full h-72">
      <div className="text-center text-sm mb-2 text-gray-600">{monthLabel}</div>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={entries}
            dataKey="value"
            nameKey="name"
            innerRadius={60}
            outerRadius={90}
            paddingAngle={2}
          >
            {entries.map((e) => (
              <Cell key={e.name} fill={colors?.[e.name] || "#8884d8"} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value) =>
              Number.isFinite(value) ? value.toLocaleString() : value
            }
          />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
