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

const branchNamesArabic = {
  Ahmed: "أحمد",
  Wael: "وائل",
  Gihan: "جيهان",
  Nahia: "ناهيا",
  Faisal: "فيصل",
  Alaa: "الاء",
   Mahmoud: "محمود",
};

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
        {title}
      </h3>

      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey={isMonthlyAverage ? "month" : "date"} />
          <YAxis />
          <Tooltip
            formatter={(v) => v.toLocaleString()}
            labelFormatter={() => branchNamesArabic[branch]}
          />
          <Line
            type="monotone"
            dataKey={branch}
            stroke={color}
            strokeWidth={2}
            dot={{ r: 3, stroke: color }}
            activeDot={{ r: 5 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
