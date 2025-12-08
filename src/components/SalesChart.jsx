// src/components/SalesChart.jsx
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const branchNamesArabic = {
  Ahmed: "أحمد",
  Wael: "وائل",
  Gihan: "جيهان",
  Nahia: "ناهيا",
  Faisal: "فيصل",
  Alaa: "الاء",
  Mahmoud: "محمود",
};

export default function SalesChart({ data, colors = {}, isMonthlyAverage = true }) {
  if (!data || !data.length) return <p className="text-gray-600">No chart data</p>;

  const xKey = isMonthlyAverage ? "month" : "date";

  // FIX: detect all branches across ALL rows (not only row 0)
  const seriesKeys = Array.from(
    new Set(
      data.flatMap((row) =>
        Object.keys(row).filter(
          (k) =>
            k !== xKey &&
            k !== "Total" &&
            k !== "total" &&
            k !== "month" &&
            k !== "date"
        )
      )
    )
  );

  const formatTick = (v) => (Number.isFinite(v) ? v.toLocaleString() : v);

  return (
    <div className="w-full h-80">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey={xKey} />
          <YAxis tickFormatter={formatTick} />

          <Tooltip
            formatter={(value, name) => [
              Number.isFinite(value) ? value.toLocaleString() : value,
              branchNamesArabic[name] || name,
            ]}
          />

          <Legend
            formatter={(value) => branchNamesArabic[value] || value}
          />

          {seriesKeys.map((key) => (
            <Line
              key={key}
              type="monotone"
              dataKey={key}
              stroke={colors[key] || "#ccc"}  // FIXED fallback
              strokeWidth={2}
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
              isAnimationActive={false}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
