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

/**
 * SalesChart - multi-branch line chart
 * props:
 *  - data: array of objects (either monthly: { month, Ahmed, Wael, ... } or daily: { date, Ahmed, ... })
 *  - colors: { Ahmed: "#...", Wael: "#...", ... }
 *  - isMonthlyAverage: boolean (true -> x axis = "month", false -> x axis = "date")
 */
export default function SalesChart({ data, colors = {}, isMonthlyAverage = true }) {
  if (!data || !data.length) return <p className="text-gray-600">No chart data</p>;

  const xKey = isMonthlyAverage ? "month" : "date";

  // Build list of series keys — explicitly exclude the xKey, "Total", and any non-series keys
  const seriesKeys = Object.keys(data[0]).filter(
    (k) =>
      k !== xKey &&
      k !== "Total" &&
      k !== "total" &&
      k !== "month" &&
      k !== "date"
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
            formatter={(value) => (Number.isFinite(value) ? value.toLocaleString() : value)}
          />
          <Legend />
          {seriesKeys.map((key) => (
            <Line
              key={key}
              type="monotone"
              dataKey={key}
              stroke={colors[key] || "#8884d8"}
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
