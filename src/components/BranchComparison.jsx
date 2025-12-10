import { useState } from "react";

export default function BranchComparison({
  monthlyAverages,
  branchNames,
  branchNamesArabic,
  branchColors,
}) {
  if (!monthlyAverages || !monthlyAverages.length) return null;

  const latest = monthlyAverages[monthlyAverages.length - 1];

  const [branchA, setBranchA] = useState(branchNames[0]);
  const [branchB, setBranchB] = useState(branchNames[1] || branchNames[0]);

  const valueA = latest[branchA] || 0;
  const valueB = latest[branchB] || 0;

  return (
    <div className="bg-white rounded-2xl shadow p-4 mt-6">
      <h2
        className="text-xl font-semibold mb-4"
        style={{ fontFamily: "Cairo, sans-serif" }}
      >
        مقارنة بين فرعين
      </h2>

      {/* SELECTORS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <label className="text-sm text-gray-600">اختر الفرع الأول</label>
          <select
            value={branchA}
            onChange={(e) => setBranchA(e.target.value)}
            className="mt-1 w-full p-2 border rounded-lg"
          >
            {branchNames.map((b) => (
              <option key={b} value={b}>
                {branchNamesArabic[b]}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-sm text-gray-600">اختر الفرع الثاني</label>
          <select
            value={branchB}
            onChange={(e) => setBranchB(e.target.value)}
            className="mt-1 w-full p-2 border rounded-lg"
          >
            {branchNames.map((b) => (
              <option key={b} value={b}>
                {branchNamesArabic[b]}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* COMPARISON CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Branch A */}
        <div
          className="p-4 rounded-xl bg-gray-50 shadow-inner"
          style={{ borderRight: `12px solid ${branchColors[branchA]}` }}
        >
          <h3
            className="text-lg font-bold mb-2"
            style={{ color: branchColors[branchA], fontFamily: "Cairo, sans-serif" }}
          >
            {branchNamesArabic[branchA]}
          </h3>
          <p className="text-2xl font-semibold">{valueA.toLocaleString()}</p>
        </div>

        {/* Branch B */}
        <div
          className="p-4 rounded-xl bg-gray-50 shadow-inner"
          style={{ borderRight: `12px solid ${branchColors[branchB]}` }}
        >
          <h3
            className="text-lg font-bold mb-2"
            style={{ color: branchColors[branchB], fontFamily: "Cairo, sans-serif" }}
          >
            {branchNamesArabic[branchB]}
          </h3>
          <p className="text-2xl font-semibold">{valueB.toLocaleString()}</p>
        </div>
      </div>

      {/* DIFFERENCE */}
      <div className="mt-6 p-4 bg-blue-50 rounded-xl text-center">
        <p className="text-lg font-semibold" style={{ fontFamily: "Cairo, sans-serif" }}>
          الفرق بين الفرعين:
        </p>
        <p className="text-2xl font-bold mt-1">
          {(valueA - valueB).toLocaleString()}
        </p>
      </div>
    </div>
  );
}
