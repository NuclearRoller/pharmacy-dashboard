// src/components/Leaderboard.jsx
// Shows a ranked list for ONE monthAverage object
export default function Leaderboard({ monthAverage, colors }) {
  if (!monthAverage) return <p className="text-gray-600">Loading…</p>;

  const rows = Object.entries(monthAverage)
    .filter(([k]) => k !== "month" && k !== "Total")
    .map(([name, value]) => ({ name, value: Number(value) || 0 }))
    .sort((a, b) => b.value - a.value);

  return (
    <div>
      <div className="text-sm text-gray-600 text-center mb-2">
        {monthAverage.month || ""}
      </div>
      <div className="space-y-2">
        {rows.map((r, idx) => (
          <div
            key={r.name}
            className="rounded-xl p-3 flex items-center justify-between shadow"
            style={{ backgroundColor: (colors && colors[r.name]) || "#E5E7EB" }}
          >
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-full bg-white/70 text-gray-800 flex items-center justify-center text-sm font-bold">
                {idx + 1}
              </div>
              <div className="font-semibold text-gray-900">{r.name}</div>
            </div>
            <div className="font-mono text-gray-900">
              {Number.isFinite(r.value) ? r.value.toLocaleString() : r.value}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
