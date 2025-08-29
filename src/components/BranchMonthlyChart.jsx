// src/components/BranchMonthlyChart.jsx
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function BranchMonthlyChart({ data, branch }) {
  const formatNumber = (num) => {
    if (num >= 1000) return (num / 1000).toFixed(1) + "K";
    return num;
  };

  return (
    <div className="w-full h-64 bg-white p-4 rounded-2xl shadow">
      <h4 className="text-md font-semibold mb-2">{branch.name} Monthly Avg</h4>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis tickFormatter={formatNumber} />
          <Tooltip formatter={formatNumber} />
          <Line type="monotone" dataKey="value" stroke={branch.color} strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 6 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
