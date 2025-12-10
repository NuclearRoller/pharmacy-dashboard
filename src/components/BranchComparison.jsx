export default function BranchComparison({ monthlyAverages, branchNames, branchNamesArabic, branchColors }) {
  if (!monthlyAverages.length) return null;

  const latest = monthlyAverages[monthlyAverages.length - 1];

  // Make an array of branches sorted from highest → lowest
  const sorted = [...branchNames]
    .map(b => ({
      branch: b,
      value: latest[b] || 0,
    }))
    .sort((a, b) => b.value - a.value);

  return (
    <div className="bg-white rounded-2xl shadow p-4 mt-6">
      <h2 className="text-xl font-semibold mb-3" style={{ fontFamily: "Cairo, sans-serif" }}>
        مقارنة أداء الفروع
      </h2>

      <div className="space-y-2">
        {sorted.map((item, idx) => (
          <div
            key={item.branch}
            className="flex items-center justify-between p-2 rounded-xl bg-gray-50"
            style={{ borderRight: `10px solid ${branchColors[item.branch]}` }}
          >
            <div className="text-lg font-bold" style={{ color: branchColors[item.branch], fontFamily: "Cairo, sans-serif" }}>
              {idx + 1}. {branchNamesArabic[item.branch]}
            </div>
            <div className="text-lg font-semibold">{item.value}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
