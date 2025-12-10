import { useState } from "react";
import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function BranchComparison({
  monthlyAverages,
  branchNames,
  branchNamesArabic,
  branchColors,
}) {
  if (!monthlyAverages || !monthlyAverages.length) return null;

  const months = monthlyAverages.map((m) => m.month);
  const [branchA, setBranchA] = useState(branchNames[0]);
  const [branchB, setBranchB] = useState(branchNames[1] || branchNames[0]);
  const [selectedMonth, setSelectedMonth] = useState(months[months.length - 1]);

  const dataForMonth =
    monthlyAverages.find((m) => m.month === selectedMonth) || {};

  const valueA = Number(dataForMonth[branchA] || 0);
  const valueB = Number(dataForMonth[branchB] || 0);

  // % difference
  const percentDiff =
    valueB === 0 ? 0 : Math.round(((valueA - valueB) / valueB) * 100);

  const comparisonSentence =
    valueA > valueB
      ? `${branchNamesArabic[branchA]} يتفوق على ${branchNamesArabic[branchB]} بنسبة ${percentDiff}% في شهر ${selectedMonth}.`
      : valueA < valueB
      ? `${branchNamesArabic[branchB]} يتفوق على ${branchNamesArabic[branchA]} بنسبة ${Math.abs(
          percentDiff
        )}% في شهر ${selectedMonth}.`
      : `لا يوجد فرق بين الفرعين في شهر ${selectedMonth}.`;

  return (
    <div className="bg-white rounded-2xl shadow p-5 mt-6">
      <h2
        className="text-xl font-semibold mb-4"
        style={{ fontFamily: "Cairo, sans-serif" }}
      >
        مقارنة بين فرعين
      </h2>

      {/* Month Selector */}
      <div className="mb-4">
        <label className="text-sm text-gray-600">اختر الشهر</label>
        <select
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
          className="mt-1 w-full p-2 border rounded-lg"
        >
          {months.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>
      </div>

      {/* Branch Selectors */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <label className="text-sm text-gray-600">الفرع الأول</label>
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
          <label className="text-sm text-gray-600">الفرع الثاني</label>
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

      {/* Comparison Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Branch A */}
        <div
          className="p-4 rounded-xl bg-gray-50 shadow-inner"
          style={{ borderRight: `10px solid ${branchColors[branchA]}` }}
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
          style={{ borderRight: `10px solid ${branchColors[branchB]}` }}
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

      {/* Comparison Sentence */}
      <div className="mt-6 p-4 bg-blue-50 rounded-xl text-center">
        <p
          className="text-lg font-semibold"
          style={{ fontFamily: "Cairo, sans-serif" }}
        >
          {comparisonSentence}
        </p>
      </div>

      {/* Combined Chart */}
      <div className="w-full h-72 mt-8">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={monthlyAverages}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Line
              type="monotone"
              dataKey={branchA}
              stroke={branchColors[branchA]}
              strokeWidth={3}
              dot={false}
            />
            <Line
              type="monotone"
              dataKey={branchB}
              stroke={branchColors[branchB]}
              strokeWidth={3}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
