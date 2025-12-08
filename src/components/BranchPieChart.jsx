// src/components/BranchPieChart.jsx
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";

const branchNamesArabic = {
  Ahmed: "أحمد",
  Wael: "وائل",
  Gihan: "جيهان",
  Nahia: "ناهيا",
  Faisal: "فيصل",
  Alaa: "الاء",
  Mahmoud: "محمود",
};

export default function BranchPieChart({ monthAverage, colors }) {
  if (!monthAverage) return <p className="text-gray-600">Loading…</p>;

  const entries = Object.entries(monthAverage)
    .filter(([k]) => k !== "month" && k !== "Total")
    .map(([name, value]) => ({
      nameArabic: branchNamesArabic[name] || name,
      name,
      value: Number(value) || 0,
    }));

  const monthLabel = monthAverage.month || "";

  return (
    <div className="w-full h-72">
      <div className="text-center text-sm mb-2 text-gray-600">{monthLabel}</div>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={entries}
            dataKey="value"
            nameKey="nameArabic"
            innerRadius={60}
            outerRadius={90}
            paddingAngle={2}
          >
            {entries.map((e) => (
              <Cell key={e.name} fill={colors?.[e.name] || "#ccc"} />
            ))}
          </Pie>

          <Tooltip
            formatter={(value, _name, item) =>
              [`${value.toLocaleString()}`, item.payload.nameArabic]
            }
          />

          <Legend
            formatter={(value, entry) => {
              const item = entry?.payload;
              return item?.nameArabic || value;
            }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
