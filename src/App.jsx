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
  const [monthStart, setMonthStart] = useState(0); // current month index
  const [lineMode, setLineMode] = useState("averages"); // "averages" | "totals"
  const [dayWindow, setDayWindow] = useState(30); // used when lineMode === "totals"

  // Softened brand colors
  const branchColors = {
    Ahmed: "#9CA3AF",  // soft gray
    Wael:  "#93C5FD",  // soft blue
    Gihan: "#FDE68A",  // soft yellow
    Nahia: "#F9A8D4",  // soft pink
    Faisal:"#FDBA74",  // soft orange
    Alaa:  "#D8B4FE",  // soft purple
  };

  const csvUrl =
    "https://docs.google.com/spreadsheets/d/e/2PACX-1vQOfzffnX62Ifzn7nw_BrorPy-YSOdUbRr85ZvbynG67pJaVaco95dM8j5Q4t5IYNNaUsqKII0jaYay/pub?output=csv";

  // --- 1) Parse numbers safely (remove commas) ---
  const parsedData = useMemo(() => {
    if (!salesData || salesData.length === 0) return [];
    return salesData.map((row) => {
      const out = { Date: row.Date };
      Object.keys(row).forEach((k) => {
        if (k !== "Date") {
          const num = Number(String(row[k] || "0").replace(/,/g, ""));
          out[k] = Number.isFinite(num) ? num : 0;
        }
      });
      return out;
    });
  }, [salesData]);

  const branchNames = useMemo(() => {
    if (parsedData.length === 0) return [];
    return Object.keys(parsedData[0]).filter((k) => k !== "Date" && k !== "Total");
  }, [parsedData]);

  // --- 2) Monthly averages map -> array (rounded to nearest 5) ---
  const monthlyAverages = useMemo(() => {
    if (parsedData.length === 0) return [];

    const map = {};
    parsedData.forEach((row) => {
      const monthKey = dayjs(row.Date).format("YYYY-MM");
      if (!map[monthKey]) map[monthKey] = { count: 0 };
      map[monthKey].count += 1;
      branchNames.forEach((b) => {
        map[monthKey][b] = (map[monthKey][b] || 0) + (row[b] || 0);
      });
    });

    return Object.keys(map)
      .sort()
      .map((m) => {
        const entry = { month: m };
        branchNames.forEach((b) => {
          const avg = (map[m][b] || 0) / (map[m].count || 1);
          entry[b] = Math.round(avg / 5) * 5;
        });
        entry.Total =
          Math.round(
            branchNames.reduce((sum, b) => sum + (entry[b] || 0), 0) / 5
          ) * 5;
        return entry;
      });
  }, [parsedData, branchNames]);

  // --- Default: show the last available month ---
  useEffect(() => {
    if (monthlyAverages.length > 0 && monthStart === 0) {
      setMonthStart(monthlyAverages.length - 1);
    }
  }, [monthlyAverages, monthStart]);

  // Go back or forward one month
  const prevMonth = () => setMonthStart((s) => Math.max(s - 1, 0));
  const nextMonth = () =>
    setMonthStart((s) => Math.min(s + 1, monthlyAverages.length - 1));

  // Currently selected month
  const selectedMonth = monthlyAverages[monthStart];

  // --- 3) Daily totals slice for "totals" mode ---
  const dailyTotalsSlice = useMemo(() => {
    if (parsedData.length === 0) return [];
    const slice = parsedData.slice(-dayWindow).map((row) => {
      const entry = { date: row.Date, Total: row.Total || 0 };
      branchNames.forEach((b) => (entry[b] = row[b] || 0));
      return entry;
    });
    return slice;
  }, [parsedData, dayWindow, branchNames]);

  return (
    <div className="min-h-screen bg-gray-100 p-6 space-y-6">
      <h1 className="text-3xl font-bold text-blue-600">Pharmacy Dashboard</h1>

      {/* Live CSV fetcher */}
      <LiveCSV csvUrl={csvUrl} onDataLoaded={setSalesData} />

      {/* ==== TOP RECTANGLE: Pie (left) + Leaderboard (right) on Monthly Averages ==== */}
      {selectedMonth ? (
        <div className="bg-white rounded-2xl shadow p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xl font-semibold">
              Monthly Averages ({selectedMonth.month})
            </h2>
            <div className="flex items-center gap-2">
              <button
                className="px-3 py-1 rounded-lg bg-blue-500 text-white hover:brightness-110"
                onClick={prevMonth}
                disabled={monthStart === 0}
              >
                ← Previous
              </button>
              <button
                className="px-3 py-1 rounded-lg bg-blue-500 text-white hover:brightness-110"
                onClick={nextMonth}
                disabled={monthStart === monthlyAverages.length - 1}
              >
                Next →
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-50 rounded-xl p-4">
              <BranchPieChart monthAverage={selectedMonth} colors={branchColors} />
            </div>
            <div className="bg-gray-50 rounded-xl p-4">
              <Leaderboard monthAverage={selectedMonth} colors={branchColors} />
            </div>
          </div>
        </div>
      ) : (
        <p className="text-gray-600">Loading monthly averages…</p>
      )}

      {/* ==== BIG LINE CHART (All branches) with global controls ==== */}
      <div className="bg-white rounded-2xl shadow p-4 space-y-2">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <h2 className="text-xl font-semibold">All Branches</h2>
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm">View:</span>
              <select
                value={lineMode}
                onChange={(e) => setLineMode(e.target.value)}
                className="border rounded px-2 py-1"
              >
                <option value="averages">Averages (last 6m)</option>
                <option value="totals">Daily Totals</option>
              </select>
            </div>

            {lineMode === "totals" && (
              <div className="flex items-center gap-2">
                <span className="text-sm">Days:</span>
                <input
                  type="range"
                  min="7"
                  max={Math.max(7, parsedData.length)}
                  value={dayWindow}
                  onChange={(e) => setDayWindow(Number(e.target.value))}
                />
                <span className="text-sm">{dayWindow}</span>
              </div>
            )}
          </div>
        </div>

        <SalesChart
          data={lineMode === "averages" ? monthlyAverages.slice(-6) : dailyTotalsSlice}
          colors={branchColors}
          isMonthlyAverage={lineMode === "averages"}
        />
      </div>

      {/* ==== GRID OF BRANCH LINE CHARTS ==== */}
      <div className="bg-white rounded-2xl shadow p-4">
        <h2 className="text-xl font-semibold mb-3">Branch Charts</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {branchNames.map((branch) => (
            <BranchLineChart
              key={branch}
              branch={branch}
              color={branchColors[branch]}
              isMonthlyAverage={lineMode === "averages"}
              monthlyData={monthlyAverages.slice(-6)}
              dailyData={dailyTotalsSlice}
            />
          ))}
        </div>
      </div>

      {/* ==== TOTAL DAILY SALES (always totals) ==== */}
      <div className="bg-white rounded-2xl shadow p-4">
        <h2 className="text-xl font-semibold mb-2">Total Daily Sales</h2>
        <TotalSalesChart data={dailyTotalsSlice} />
      </div>
    </div>
  );
}
