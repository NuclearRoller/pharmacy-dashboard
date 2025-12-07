// src/components/Leaderboard.jsx
import { motion } from "framer-motion";

// Arabic font should be imported globally in index.css like:
// @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700&display=swap');

const branchNamesArabic = {
  Ahmed: "أحمد",
  Wael: "وائل",
  Gihan: "جيهان",
  Nahia: "ناهيا",
  Faisal: "فيصل",
  Alaa: "الاء",
 Mahmoud: "محمود",
};

export default function Leaderboard({ monthAverage, colors }) {
  if (!monthAverage) return <p className="text-gray-600">Loading…</p>;

  // Sort branches by value descending
  const rows = Object.entries(monthAverage)
    .filter(([k]) => k !== "month" && k !== "Total")
    .map(([name, value]) => ({ name, value: Number(value) || 0 }))
    .sort((a, b) => b.value - a.value);

  return (
    <div className="font-[Cairo]">
      <div className="text-sm text-gray-600 text-center mb-2">
        {monthAverage.month || ""}
      </div>
      <div className="space-y-3">
        {rows.map((r, idx) => (
          <motion.div
            key={r.name}
            className="rounded-xl p-3 flex items-center justify-between shadow-md"
            style={{ backgroundColor: (colors && colors[r.name]) || "#E5E7EB" }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
          >
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-full bg-white/70 text-gray-800 flex items-center justify-center text-sm font-bold">
                {idx + 1}
              </div>
              <div className="font-semibold text-gray-900">
                {branchNamesArabic[r.name] || r.name}
              </div>
            </div>
            <div className="font-mono text-gray-900 text-lg font-semibold">
              {Number.isFinite(r.value) ? r.value.toLocaleString() : r.value}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
