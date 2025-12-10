// src/App.jsx
import { useState, useEffect, useMemo } from "react";
import dayjs from "dayjs";

import LiveCSV from "./components/LiveCSV";
import SalesChart from "./components/SalesChart";
import BranchLineChart from "./components/BranchLineChart";
import BranchPieChart from "./components/BranchPieChart";
import Leaderboard from "./components/Leaderboard";
import TotalSalesChart from "./components/TotalSalesChart";
import BranchComparison from "./components/BranchComparison";

export default function App() {
  const [salesData, setSalesData] = useState([]);
  const [monthIndex, setMonthIndex] = useState(0);
  const [lineMode, setLineMode] = useState("averages");
  const [dayWindow, setDayWindow] = useState(30);

const branchColors = {
  Ahmed : "#9CA3AF",
  Wael  : "#93C5FD",
  Gihan : "#FDE68A",
  Nahia : "#F9A8D4",
  Faisal: "#FDBA74",
  Alaa  : "#D8B4FE",
  Mahmoud:"#10B981",   // ← any colour you like
};

const branchNamesArabic = {
  Ahmed : "أحمد",
  Wael  : "وائل",
  Gihan : "جيهان",
  Nahia : "ناهيا",
  Faisal: "فيصل",
  Alaa  : "الاء",
  Mahmoud:"محمود",     // ← Arabic name
};

  const csvUrl =
    "https://docs.google.com/spreadsheets/d/e/2PACX-1vQOfzffnX62Ifzn7nw_BrorPy-YSOdUbRr85ZvbynG67pJaVaco95dM8j5Q4t5IYNNaUsqKII0jaYay/pub?output=csv";

  // --- Parse numbers safely + filter junk columns ---
  const parsedData = useMemo(() => {
    if (!salesData.length) return [];
    return salesData.map(row => {
      const out = { Date: row.Date };
      Object.keys(row).forEach(k => {
        if (k && k !== "Date" && k !== "Total" && !k.startsWith("_")) {
          const num = Number(String(row[k] || "0").replace(/,/g, ""));
          out[k] = Number.isFinite(num) ? num : 0;
        }
      });
      out.Total = Number(String(row.Total || "0").replace(/,/g, "")) || 0;
      return out;
    });
  }, [salesData]);

  const branchNames = useMemo(() => {
    if (!parsedData.length) return [];
    return Object.keys(parsedData[0]).filter(k => k !== "Date" && k !== "Total");
  }, [parsedData]);

  // --- Monthly averages ---
  const monthlyAverages = useMemo(() => {
    if (!parsedData.length) return [];
    const map = {};
    parsedData.forEach(row => {
      const monthKey = dayjs(row.Date).format("YYYY-MM");
      if (!map[monthKey]) map[monthKey] = { count: 0 };
      map[monthKey].count += 1;
      branchNames.forEach(b => {
        map[monthKey][b] = (map[monthKey][b] || 0) + (row[b] || 0);
      });
    });

    return Object.keys(map)
      .sort()
      .map(m => {
        const entry = { month: m };
        branchNames.forEach(b => {
          const avg = (map[m][b] || 0) / (map[m].count || 1);
          entry[b] = Math.round(avg / 5) * 5;
        });
        entry.Total = Math.round(
          branchNames.reduce((sum, b) => sum + (entry[b] || 0), 0) / 5
        ) * 5;
        return entry;
      });
  }, [parsedData, branchNames]);

  // --- Set default latest month ---
  useEffect(() => {
    if (monthlyAverages.length) setMonthIndex(monthlyAverages.length - 1);
  }, [monthlyAverages]);

  // --- Daily totals slice ---
  const dailyTotalsSlice = useMemo(() => {
    if (!parsedData.length) return [];
    return parsedData.slice(-dayWindow).map(row => {
      const entry = { date: row.Date, Total: row.Total || 0 };
      branchNames.forEach(b => (entry[b] = row[b] || 0));
      return entry;
    });
  }, [parsedData, dayWindow, branchNames]);

  // --- KPI Cards ---
  const kpis = useMemo(() => {
    if (!monthlyAverages.length) {
      return {
        totalSales: 0,
        percentGrowth: 0,
        best: { branch: null, avg: 0 },
        worst: { branch: null, avg: 0 },
      };
    }

    const current = monthlyAverages[monthlyAverages.length - 1];
    const previous = monthlyAverages[monthlyAverages.length - 2] || {};

    const totalSales = branchNames.reduce((sum, b) => sum + (current[b] || 0), 0);
    const prevTotal = branchNames.reduce((sum, b) => sum + (previous[b] || 0), 0);
    const percentGrowth = prevTotal ? ((totalSales - prevTotal) / prevTotal) * 100 : 0;

    let best = { branch: null, avg: -Infinity };
    let worst = { branch: null, avg: Infinity };

    branchNames.forEach(b => {
      const avg = current[b] || 0;
      if (avg > best.avg) best = { branch: b, avg };
      if (avg < worst.avg) worst = { branch: b, avg };
    });

    if (!best.branch) best = { branch: null, avg: 0 };
    if (!worst.branch) worst = { branch: null, avg: 0 };

    return { totalSales, percentGrowth, best, worst };
  }, [monthlyAverages, branchNames]);

  // --- Commentary ---
  const commentary = useMemo(() => {
    if (!monthlyAverages.length) return [];
    const latest = monthlyAverages[monthlyAverages.length - 1];
    const prev = monthlyAverages[monthlyAverages.length - 2] || {};

    let improvements = branchNames.map(b => ({
      branch: b,
      change: latest[b] - (prev[b] || 0),
      avg: latest[b],
    }));

    const highestPerf = improvements.reduce((a, b) => (a.avg > b.avg ? a : b));
    const highestGrowth = improvements.reduce((a, b) => (a.change > b.change ? a : b));
    const lowestGrowth = improvements.reduce((a, b) => (a.change < b.change ? a : b));

    const overallChange = branchNames.reduce((sum, b) => sum + (latest[b] - (prev[b] || 0)), 0);
    const overallText =
      overallChange >= 0
        ? "تحسن الأداء هذا الشهر مقارنة بالشهر الماضي"
        : "انخفاض الأداء هذا الشهر مقارنة بالشهر الماضي";

    return [
      { text: "أعلى فرع أداءً: ", branch: highestPerf.branch, number: highestPerf.avg },
      { text: "أعلى نمو: ", branch: highestGrowth.branch, number: highestGrowth.change },
      { text: "أدنى نمو: ", branch: lowestGrowth.branch, number: lowestGrowth.change },
      { text: overallText, branch: null, number: null },
    ];
  }, [monthlyAverages, branchNames]);

  // --- Pie chart navigation ---
  const prevMonth = () => setMonthIndex(i => Math.max(i - 1, 0));
  const nextMonth = () => setMonthIndex(i => Math.min(i + 1, monthlyAverages.length - 1));

  return (
    <div className="min-h-screen p-6 space-y-6 bg-gray-100 font-sans">
      <h1 className="text-3xl font-bold text-blue-600 mb-4" style={{ fontFamily: "Cairo, sans-serif" }}>
        لوحة تحكم الصيدلية
      </h1>
      <LiveCSV csvUrl={csvUrl} onDataLoaded={setSalesData} />

      {/* ===== KPI CARDS ===== */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl shadow-md">
          <div className="text-sm text-gray-600 mb-1">إجمالي المبيعات هذا الشهر</div>
          <div className="text-2xl font-bold text-green-600">{kpis.totalSales.toLocaleString()}</div>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-md">
          <div className="text-sm text-gray-600 mb-1">نسبة النمو مقارنة بالشهر الماضي</div>
          <div className="text-2xl font-bold text-green-600">{kpis.percentGrowth.toFixed(1)}%</div>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-md">
          <div className="text-sm text-gray-600 mb-1">أفضل أداء فرع</div>
          <div className="text-2xl font-bold" style={{ color: branchColors[kpis.best.branch] }}>
            {kpis.best.branch ? branchNamesArabic[kpis.best.branch] : "-"} ({kpis.best.avg})
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-md">
          <div className="text-sm text-gray-600 mb-1">أقل أداء فرع</div>
          <div className="text-2xl font-bold" style={{ color: branchColors[kpis.worst.branch] }}>
            {kpis.worst.branch ? branchNamesArabic[kpis.worst.branch] : "-"} ({kpis.worst.avg})
          </div>
        </div>
      </div>

      {/* ===== COMMENTARY CARD ===== */}
      {commentary.length > 0 && (
        <div className="bg-white p-4 rounded-xl shadow-md space-y-1">
          <h2 className="text-xl font-semibold mb-2" style={{ fontFamily: "Cairo, sans-serif" }}>ملخص الأداء</h2>
          {commentary.map((line, idx) => (
            <p
              key={idx}
              className="animate-fade-in"
              style={{
                animationDelay: `${idx * 0.3}s`,
                color: line.branch ? branchColors[line.branch] : "#000",
                fontFamily: "Cairo, sans-serif",
              }}
            >
              {line.text}
              {line.branch && ` ${branchNamesArabic[line.branch]}`}
              {line.number != null && `: ${line.number}`}
            </p>
          ))}
        </div>
      )}

      {/* ===== PIE + LEADERBOARD ===== */}
      {monthlyAverages.length > 0 && (
        <div className="bg-white rounded-2xl shadow p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xl font-semibold" style={{ fontFamily: "Cairo, sans-serif" }}>المتوسطات الشهرية</h2>
            <div className="flex items-center gap-2">
              <button
                className="px-3 py-1 rounded-lg bg-blue-500 text-white hover:brightness-110"
                onClick={prevMonth}
              >
                ← الشهر السابق
              </button>
              <button
                className="px-3 py-1 rounded-lg bg-blue-500 text-white hover:brightness-110"
                onClick={nextMonth}
              >
                الشهر التالي →
              </button>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-50 rounded-xl p-4">
              <BranchPieChart monthAverage={monthlyAverages[monthIndex]} colors={branchColors} />
            </div>
            <div className="bg-gray-50 rounded-xl p-4">
              <Leaderboard monthAverage={monthlyAverages[monthIndex]} colors={branchColors} />
            </div>
          </div>
        </div>
      )}

      {/* ===== BIG LINE CHART ===== */}
      <div className="bg-white rounded-2xl shadow p-4 space-y-2">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <h2 className="text-xl font-semibold" style={{ fontFamily: "Cairo, sans-serif" }}>جميع الفروع</h2>
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm">عرض:</span>
              <select
                value={lineMode}
                onChange={e => setLineMode(e.target.value)}
                className="border rounded px-2 py-1"
              >
                <option value="averages">المتوسطات (آخر 6 أشهر)</option>
                <option value="totals">المبيعات اليومية</option>
              </select>
            </div>
            {lineMode === "totals" && (
              <div className="flex items-center gap-2">
                <span className="text-sm">أيام:</span>
                <input
                  type="range"
                  min="7"
                  max={Math.max(7, parsedData.length)}
                  value={dayWindow}
                  onChange={e => setDayWindow(Number(e.target.value))}
                />
                <span className="text-sm">{dayWindow}</span>
              </div>
            )}
          </div>
        </div>

        <SalesChart
          data={lineMode === "averages" ? monthlyAverages : dailyTotalsSlice}
          colors={branchColors}
          isMonthlyAverage={lineMode === "averages"}
        />
      </div>

      {/* ===== BRANCH LINE CHARTS ===== */}
      <div className="bg-white rounded-2xl shadow p-4">
        <h2 className="text-xl font-semibold mb-3" style={{ fontFamily: "Cairo, sans-serif" }}>مخططات الفروع</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {branchNames.map(branch => (
            <BranchLineChart
              key={branch}
              branch={branch}
              title={branchNamesArabic[branch]}
              color={branchColors[branch]}
              isMonthlyAverage={lineMode === "averages"}
              monthlyData={monthlyAverages}
              dailyData={dailyTotalsSlice}
            />
          ))}
        </div>
      </div>

      {/* ===== TOTAL DAILY SALES ===== */}
      <div className="bg-white rounded-2xl shadow p-4">
        <h2 className="text-xl font-semibold mb-2" style={{ fontFamily: "Cairo, sans-serif" }}>إجمالي المبيعات اليومية</h2>
        <TotalSalesChart data={dailyTotalsSlice} />
      </div>
      {/* ===== BRANCH COMPARISON (BOTTOM) ===== */}
<BranchComparison
  monthlyAverages={monthlyAverages}
  branchNames={branchNames}
  branchNamesArabic={branchNamesArabic}
  branchColors={branchColors}
/>

    </div>
  );
}
