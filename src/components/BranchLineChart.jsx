import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

export default function BranchLineChart({ branch, color, isMonthlyAverage, monthlyData, dailyData }) {
  const data = isMonthlyAverage ? monthlyData : dailyData;
  if (!data || data.length === 0) return <p>No data</p>;

  return (
    <div className="bg-gray-50 rounded-xl p-4">
      <h3 className="font-semibold mb-2">{branch}</h3>
      <ResponsiveContainer width="100%" height={250}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey={isMonthlyAverage ? "month" : "date"} />
          <YAxis />
          <Tooltip />
          <Line
            type="monotone"
            dataKey={branch}
            stroke={color}
            dot={{ r: 4 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
