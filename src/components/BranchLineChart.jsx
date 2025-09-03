// src/components/BranchLineChart.jsx
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

export default function BranchLineChart({
  branch,
  title,
  color,
  isMonthlyAverage,
  monthlyData,
  dailyData,
}) {
  const data = isMonthlyAverage ? monthlyData : dailyData;

  return (
    <div className="bg-gray-50 p-3 rounded-xl shadow">
      <h3
        className="text-lg font-semibold mb-2"
        style={{ color, fontFamily: "Cairo, sans-serif" }}
      >
        {title} {/* Arabic branch name */}
      </h3>
      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey={isMonthlyAverage ? "month" : "date"} />
          <YAxis />
          <Tooltip />
          <Line
            type="monotone"
            dataKey={branch}
            stroke={color}
            strokeWidth={2}
            dot={{ r: 4 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
