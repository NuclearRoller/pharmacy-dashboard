// src/App.jsx
import { useState, useEffect, useMemo } from "react";
import dayjs from "dayjs";

import LiveCSV from "./components/LiveCSV";
import SalesChart from "./components/SalesChart";
import BranchLineChart from "./components/BranchLineChart";
import BranchPieChart from "./components/BranchPieChart";
import Leaderboard from "./components/Leaderboard";
import TotalSalesChart from "./components/TotalSalesChart";

export default function App() {
  const [salesData, setSalesData] = useState([]);
  const [monthIndex, setMonthIndex] = useState(0);
  const [lineMode, setLineMode] = useState("averages"); // "averages" | "totals"
  const [dayWindow, setDayWindow] = useState(30);

  // Soft branch colors
  const branchColors = {
    Ahmed: "#9CA3AF",
    Wael: "#93C5FD",
    Gihan: "#FDE68A",
    Nahia: "#F9A8D4",
    Faisal: "#FDBA74",
    Alaa: "#D8B4FE",
  };

  const branchNamesArabic = {
    Ahmed: "أحمد",
    Wael: "وائل",
    Gihan: "جيهان",
    Nahia: "ناهيا",
    Faisal: "فيصل",
    Alaa: "الاء",
  };

  const csvUrl =
    "https://docs.google.com/spreadsheets/d/e/2PACX-1vQOfzffnX62Ifzn7nw_BrorPy-YSOdUbRr85ZvbynG67pJaVaco95dM8j5Q4t5IYNNaUsqKII0jaYay/pub?output=csv";

  // ---------------------
  // 1) Robust normalized parsedData
  // ---------------------
  // salesData is the raw result from PapaParse (LiveCSV). We normalize headers here.
  const parsedData = useMemo(() => {
    if (!salesData || salesData.length === 0) return [];

    const rows = salesData.map((rawRow) => {
      // Normalize keys: remove BOM, trim, ignore empty header columns
      const normalized = {};
      Object.entries(rawRow).forEach(([rawKey, rawVal]) => {
        if (!rawKey && rawKey !== "") return; // skip really weird keys
        const key = String(rawKey || "").replace(/\uFEFF/g, "").trim();
        if (key === "" || key === null) return; // ignore empty headers (those ,, ,)
        normalized[key] = rawVal;
      });

      // Find the Date header case-insensitive (handle " date ", "Date", etc.)
      const dateKey =
        Object.keys(normalized).find((k) => k.trim().toLowerCase() === "date") ||
        Object.keys(normalized).find((k) =>
          k.trim().toLowerCase().includes("date")
        );

      const out = {};
      out.Date = dateKey ? String(normalized[dateKey]).trim() : "";

      // For other keys, parse numbers if possible (remove quotes/commas)
      Object.keys(normalized).forEach((k) => {
        if (k === dateKey) return;
        const raw = normalized[k] == null ? "" : String(normalized[k]).trim();
        const cleaned = raw.replace(/"/g, "").replace(/,/g, "");
        const num = Number(cleaned);
        out[k] = Number.isFinite(num) ? num : (cleaned === "" ? 0 : cleaned);
      });

      return out;
    });

    console.log("[App] parsedData sample:", rows[0] || null);
    return rows;
  }, [salesData]);

  // ---------------------
  // 2) Build branchNames from normalized header keys (exclude Date and Total)
  // ---------------------
  const branchNames = useMemo(() => {
    if (!parsedData.length) return [];
    const keys = Object.keys(parsedData[0]).filter(
      (k) => typeof k === "string" && k !== "Date" && k !== "Total" && k.trim() !== ""
    );
    console.log("[App] branchNames:", keys);
    return keys;
  }, [parsedData]);

  // ---------------------
  // 3) Monthly averages (safe)
  // ---------------------
  const monthlyAverages = useMemo(() => {
    if (!parsedData.length || branchNames.length === 0) return [];

    const map = {}; // { "2025-04": { count: N, Ahmed: sum, ... } }
    parsedData.forEach((row) => {
      // Validate and parse date; if invalid, skip row
      const d = row.Date;
      if (!d) return;
      const monthKey = dayjs(d).isValid() ? dayjs(d).format("YYYY-MM") : null;
      if (!monthKey) return;

      if (!map[monthKey]) map[monthKey] = { count: 0 };
      map[monthKey].count += 1;

      branchNames.forEach((b) => {
        const val = Number(row[b]) || 0;
        map[monthKey][b] = (map[monthKey][b] || 0) + val;
      });
    });

    const months = Object.keys(map).sort();
    const out = months.map((m) => {
      const entry = { month: m };
      branchNames.forEach((b) => {
        const avg = (map[m][b] || 0) / (map[m].count || 1);
        entry[b] = Math.round(avg / 5) * 5; // rounding to nearest 5 (you had that)
      });
      // total monthly average
      entry.Total = Math.round(
        branchNames.reduce((s, b) => s + (entry[b] || 0), 0) / 5
      ) * 5;
      return entry;
    });

    console.log("[App] monthlyAverages sample:", out.slice(-2));
    return out;
  }, [parsedData, branchNames]);

  // Ensure monthIndex defaults to latest month
  useEffect(() => {
    if (monthlyAverages.length) {
      setMonthIndex((i) =>
        monthlyAverages.length - 1 >= 0 ? monthlyAverages.length - 1 : 0
      );
    }
  }, [monthlyAverages]);

  // ---------------------
  // 4) Daily totals slice (for totals view and bottom chart)
  // ---------------------
  const dailyTotalsSlice = useMemo(() => {
    if (!parsedData.length || branchNames.length === 0) return [];
    // last `dayWindow` rows
    const slice = parsedData.slice(-dayWindow).map((row) => {
      const entry = { date: row.Date };
      branchNames.forEach((b) => {
        entry[b] = Number(row[b]) || 0;
      });
      entry.Total = Number(row.Total) || branchNames.reduce((s, b) => s + (entry[b] || 0), 0);
      return entry;
    });
    return slice;
  }, [parsedData, dayWindow, branchNames]);

  // ---------------------
  // 5) KPIs (safe defaults)
  // ---------------------
  const kpis = useMemo(() => {
    if (!monthlyAverages.length || branchNames.length === 0) {
      return {
        totalSales: 0,
        percentGrowth: 0,
        best: { branch: null, avg: 0 },
        worst: { branch: null, avg: 0 },
      };
    }

    const current = monthlyAverages[monthlyAverages.length - 1];
    const previous = monthlyAverages[monthlyAverages.length - 2] || {};

    const totalSales = branchNames.reduce((sum, b) => sum + (Number(current[b]) || 0), 0);
    const prevTotal = branchNames.reduce((sum, b) => sum + (Number(previous[b]) || 0), 0);
    const percentGrowth = prevTotal ? ((totalSales - prevTotal) / prevTotal) * 100 : 0;

    // best & worst
    let best = { branch: branchNames[0], avg: Number(current[branchNames[0]] || 0) };
    let worst = { branch: branchNames[0], avg: Number(current[branchNames[0]] || 0) };
    branchNames.forEach((b) => {
      const v = Number(current[b] || 0);
      if (v > best.avg) best = { branch: b, avg: v };
      if (v < worst.avg) worst = { branch: b, avg: v };
    });

    return { totalSales, percentGrowth, best, worst };
  }, [monthlyAverages, branchNames]);

  // ---------------------
  // 6) Commentary (independent summary)
  // ---------------------
  const commentary = useMemo(() => {
    if (!monthlyAverages.length || branchNames.length === 0) return [];
    const latest = monthlyAverages[monthlyAverages.length - 1];
    const prev = monthlyAverages[monthlyAverages.length - 2] || {};

    const improvements = branchNames.map((b) => ({
      branch: b,
      change: Number(latest[b] || 0) - Number(prev[b] || 0),
      avg: Number(latest[b] || 0),
    }));

    const highestPerf = improvements.reduce((a, b) => (a.avg > b.avg ? a : b));
    const highestGrowth = improvements.reduce((a, b) => (a.change > b.change ? a : b));
    const lowestGrowth = improvements.reduce((a, b) => (a.change < b.change ? a : b));

    const overallChange = branchNames.reduce((sum, b) => sum + (Number(latest[b] || 0) - Number(prev[b] || 0)), 0);
    const overallText = overallChange >= 0 ? "تحسن الأداء هذا الشهر مقارنة بالشهر الماضي" : "انخفاض الأداء هذا الشهر مقارنة بالشهر الماضي";

    return [
      { text: "أعلى فرع أداءً: ", branch: highestPerf.branch, number: highestPerf.avg },
      { text: "أعلى نمو: ", branch: highestGrowth.branch, number: highestGrowth.change },
      { text: "أدنى نمو: ", branch: lowestGrowth.branch, number: lowestGrowth.change },
      { text: overallText, branch: null, number: null },
    ];
  }, [monthlyAverages, branchNames]);

  // ---------------------
  // 7) Pie month navigation (safe bounds)
  // ---------------------
  const prevMonth = () =>
    setMonthIndex((i) => {
      if (monthlyAverages.length === 0) return 0;
      return Math.max(i - 1, 0);
    });

  const nextMonth = () =>
    setMonthIndex((i) => {
      if (monthlyAverages.length === 0) return 0;
      return Math.min(i + 1, monthlyAverages.length - 1);
    });

  // ---------------------
  // UI
  // ---------------------
  return (
    <div className="min-h-screen p-6 space-y-6 bg-gray-100 font-sans">
      <h1 className="text-3xl font-bold text-blue-600 mb-4" style={{ fontFamily: "Cairo, sans-serif" }}>
        لوحة تحكم الصيدلية
      </h1>

      {/* Live CSV fetcher - will call setSalesData */}
      <LiveCSV csvUrl={csvUrl} onDataLoaded={setSalesData} />

      {/* KPI cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl shadow-md">
          <div className="text-sm text-gray-600 mb-1">إجمالي المبيعات هذا الشهر</div>
          <div className="text-2xl font-bold text-green-600">{Number(kpis.totalSales).toLocaleString()}</div>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-md">
          <div className="text-sm text-gray-600 mb-1">نسبة النمو مقارنة بالشهر الماضي</div>
          <div className="text-2xl font-bold text-green-600">{Number(kpis.percentGrowth).toFixed(1)}%</div>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-md">
          <div className="text-sm text-gray-600 mb-1">أفضل أداء فرع</div>
          <div className="text-2xl font-bold" style={{ color: branchColors[kpis.best.branch] || "#111" }}>
            {kpis.best.branch ? branchNamesArabic[kpis.best.branch] || kpis.best.branch : "-"} ({kpis.best.avg})
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-md">
          <div className="text-sm text-gray-600 mb-1">أقل أداء فرع</div>
          <div className="text-2xl font-bold" style={{ color: branchColors[kpis.worst.branch] || "#111" }}>
            {kpis.worst.branch ? branchNamesArabic[kpis.worst.branch] || kpis.worst.branch : "-"} ({kpis.worst.avg})
          </div>
        </div>
      </div>

      {/* Commentary */}
      {commentary.length > 0 && (
        <div className="bg-white p-4 rounded-xl shadow-md space-y-1">
          <h2 className="text-xl font-semibold mb-2" style={{ fontFamily: "Cairo, sans-serif" }}>ملخص الأداء</h2>
          {commentary.map((line, idx) => (
            <p key={idx} className="animate-fade-in" style={{ animationDelay: `${idx * 0.25}s`, color: line.branch ? branchColors[line.branch] : "#111", fontFamily: "Cairo, sans-serif" }}>
              {line.text}
              {line.branch && ` ${branchNamesArabic[line.branch] || line.branch}`}
              {line.number != null && `: ${Number(line.number).toLocaleString()}`}
            </p>
          ))}
        </div>
      )}

      {/* Monthly averages: Pie + Leaderboard (use monthIndex safely) */}
      {monthlyAverages.length > 0 && (
        <div className="bg-white rounded-2xl shadow p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xl font-semibold" style={{ fontFamily: "Cairo, sans-serif" }}>المتوسطات الشهرية</h2>
            <div className="flex items-center gap-2">
              <button className="px-3 py-1 rounded-lg bg-blue-500 text-white hover:brightness-110" onClick={prevMonth}>← الشهر السابق</button>
              <button className="px-3 py-1 rounded-lg bg-blue-500 text-white hover:brightness-110" onClick={nextMonth}>الشهر التالي →</button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-50 rounded-xl p-4">
              <BranchPieChart monthAverage={monthlyAverages[Math.max(0, Math.min(monthIndex, monthlyAverages.length - 1))]} colors={branchColors} />
            </div>
            <div className="bg-gray-50 rounded-xl p-4">
              <Leaderboard monthAverage={monthlyAverages[Math.max(0, Math.min(monthIndex, monthlyAverages.length - 1))]} colors={branchColors} />
            </div>
          </div>
        </div>
      )}

      {/* Big all-branches chart with controls */}
      <div className="bg-white rounded-2xl shadow p-4 space-y-2">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <h2 className="text-xl font-semibold" style={{ fontFamily: "Cairo, sans-serif" }}>جميع الفروع</h2>
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm">عرض:</span>
              <select value={lineMode} onChange={(e) => setLineMode(e.target.value)} className="border rounded px-2 py-1">
                <option value="averages">المتوسطات (آخر أشهر)</option>
                <option value="totals">المبيعات اليومية</option>
              </select>
            </div>

            {lineMode === "totals" && (
              <div className="flex items-center gap-2">
                <span className="text-sm">أيام:</span>
                <input type="range" min="7" max={Math.max(7, parsedData.length)} value={dayWindow} onChange={(e) => setDayWindow(Number(e.target.value))} />
                <span className="text-sm">{dayWindow}</span>
              </div>
            )}
          </div>
        </div>

        <SalesChart data={lineMode === "averages" ? monthlyAverages : dailyTotalsSlice} colors={branchColors} isMonthlyAverage={lineMode === "averages"} />
      </div>

      {/* Branch line charts grid */}
      <div className="bg-white rounded-2xl shadow p-4">
        <h2 className="text-xl font-semibold mb-3" style={{ fontFamily: "Cairo, sans-serif" }}>مخططات الفروع</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {branchNames.map((branch) => (
            <BranchLineChart
              key={branch}
              branch={branch}
              title={branchNamesArabic[branch] || branch}
              color={branchColors[branch] || "#333"}
              isMonthlyAverage={lineMode === "averages"}
              monthlyData={monthlyAverages}
              dailyData={dailyTotalsSlice}
            />
          ))}
        </div>
      </div>

      {/* Total daily sales */}
      <div className="bg-white rounded-2xl shadow p-4">
        <h2 className="text-xl font-semibold mb-2" style={{ fontFamily: "Cairo, sans-serif" }}>إجمالي المبيعات اليومية</h2>
        <TotalSalesChart data={dailyTotalsSlice} />
      </div>
    </div>
  );
}
