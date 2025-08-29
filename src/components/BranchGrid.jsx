// src/components/BranchGrid.jsx
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import dayjs from "dayjs";

export default function BranchGrid({ data, viewMode, daysRange, colors }) {
  if (!data || data.length === 0) return null;

  // group by branch
  const branches = [...new Set(data.map((d) => d.branch))];

  // helper for averages per month (last 6 months)
  const getMonthlyAverages = (branch) => {
    const now = dayjs();
    const sixMonthsAgo = now.subtract(6, "month");
    const branchData = data.filter(
      (d) => d.branch === branch && d.date.isAfter(sixMonthsAgo)
    );

    const grouped = {};
    branchData.forEach((d) => {
      const month = d.date.format("YYYY-MM");
      if (!grouped[month]) grouped[month] = [];
      grouped[month].push(d.sales);
    });

    return Object.entries(grouped).map(([month, sales]) => ({
      date: month,
      value:
        Math.round(sales.reduce((a, b) => a + b, 0) / sales.length / 5) * 5,
    }));
  };

  // helper for totals (last N days)
  const getDailyTotals = (branch) => {
    const cutoff = dayjs().subtract(daysRange, "day");
    const branchData = data.filter(
      (d) => d.branch === branch && d.date.isAfter(cutoff)
    );

    return branchData.map((d) => ({
      date: d.date.format("MM-DD"),
      value: d.sales,
    }));
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {branches.map((branch, idx) => {
        const chartData =
          viewMode === "average"
            ? getMonthlyAverages(branch)
            : getDailyTotals(branch);

        return (
          <div key={branch} className="bg-white p-4 rounded-xl shadow-md">
            <h3 className="text-md font-semibold mb-2 text-center">{branch}</h3>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke={colors[idx % colors.length]}
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        );
      })}
    </div>
  );
}
