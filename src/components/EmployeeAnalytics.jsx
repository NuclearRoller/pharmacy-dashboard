import { useState, useEffect, useMemo } from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  BarChart, Bar, ResponsiveContainer, AreaChart, Area
} from "recharts";
import { parseSalaryCSV, getEmployeeStats } from "../utils/parseSalaryData";
import { motion, AnimatePresence } from "framer-motion";

export default function EmployeeAnalytics({ csvUrl }) {
  const [csvText, setCsvText] = useState("");
  const [selectedEmployee, setSelectedEmployee] = useState("");
  const [chartMode, setChartMode] = useState("baseRate");
  const [monthIndex, setMonthIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(csvUrl)
      .then(res => res.text())
      .then(text => {
        setCsvText(text);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching CSV:", err);
        setLoading(false);
      });
  }, [csvUrl]);

  const { employees, months } = useMemo(() => {
    if (!csvText) return { employees: [], months: [] };
    const result = parseSalaryCSV(csvText);
    return result;
  }, [csvText]);

  const employeeStats = useMemo(() => {
    if (!employees.length) return [];
    return getEmployeeStats(employees, months);
  }, [employees, months]);

  useEffect(() => {
    if (months.length) setMonthIndex(months.length - 1);
    if (employeeStats.length && !selectedEmployee) {
      setSelectedEmployee(employeeStats[0].name);
    }
  }, [months, employeeStats]);

  const currentMonth = months[monthIndex] || "";

  const currentMonthData = useMemo(() => {
    if (!employeeStats.length || !currentMonth) return [];
    return employeeStats
      .filter(emp => emp.history.some(h => h.month === currentMonth))
      .map(emp => {
        const monthData = emp.history.find(h => h.month === currentMonth);
        return {
          name: emp.name,
          baseRate: monthData?.baseRate || 0,
          hours: monthData?.hours || 0,
          deductions: monthData?.deductions || 0,
          salary: monthData?.salary || 0,
        };
      })
      .sort((a, b) => b.salary - a.salary);
  }, [employeeStats, currentMonth]);

  const kpis = useMemo(() => {
    if (!currentMonthData.length) return null;
    
    const totalEmployees = currentMonthData.length;
    const totalPayroll = currentMonthData.reduce((sum, e) => sum + e.salary, 0);
    const totalHours = currentMonthData.reduce((sum, e) => sum + e.hours, 0);
    const totalDeductions = currentMonthData.reduce((sum, e) => sum + e.deductions, 0);
    const avgSalary = totalPayroll / totalEmployees;
    const highestPaid = currentMonthData[0] || { name: "-", salary: 0 };
    const mostHours = currentMonthData.reduce((max, e) => e.hours > max.hours ? e : max, currentMonthData[0] || { name: "-", hours: 0 });
    
    return { totalEmployees, totalPayroll, totalHours, totalDeductions, avgSalary, highestPaid, mostHours };
  }, [currentMonthData]);

  const selectedEmployeeData = useMemo(() => {
    if (!selectedEmployee || !employeeStats.length) return null;
    const emp = employeeStats.find(e => e.name === selectedEmployee);
    if (!emp) return null;
    return emp.history.map(h => ({
      month: h.month,
      baseRate: h.baseRate,
      hours: h.hours,
      salary: h.salary,
      deductions: h.deductions,
    }));
  }, [selectedEmployee, employeeStats]);

  const prevMonth = () => setMonthIndex(i => Math.max(i - 1, 0));
  const nextMonth = () => setMonthIndex(i => Math.min(i + 1, months.length - 1));

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-xl text-gray-600">جاري تحميل بيانات الموظفين...</div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6" style={{ fontFamily: "Cairo, sans-serif" }} dir="rtl">
      <h2 className="text-3xl font-bold text-blue-600 mb-4">
        تحليلات الموظفين
      </h2>

      {/* Month Navigation - Scrollable */}
      {months.length > 0 && (
        <div className="bg-white p-4 rounded-xl shadow">
          <div className="flex items-center justify-between mb-2">
            <button
              onClick={prevMonth}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:brightness-110"
            >
              → الشهر السابق
            </button>
            <h3 className="text-xl font-semibold">{currentMonth}</h3>
            <button
              onClick={nextMonth}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:brightness-110"
            >
              الشهر التالي ←
            </button>
          </div>
          {/* Scrollable month pills */}
          <div className="flex gap-2 overflow-x-auto pb-2">
            {months.map((m, idx) => (
              <button
                key={m}
                onClick={() => setMonthIndex(idx)}
                className={`px-3 py-1 rounded-full whitespace-nowrap text-sm transition ${
                  idx === monthIndex
                    ? "bg-blue-500 text-white"
                    : "bg-gray-200 hover:bg-gray-300"
                }`}
              >
                {m}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* KPI Cards */}
      {kpis && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
        >
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-4 rounded-xl shadow-lg text-white">
            <div className="text-sm opacity-90 mb-1">إجمالي الموظفين</div>
            <div className="text-3xl font-bold">{kpis.totalEmployees}</div>
          </div>
          <div className="bg-gradient-to-br from-green-500 to-green-600 p-4 rounded-xl shadow-lg text-white">
            <div className="text-sm opacity-90 mb-1">إجمالي الرواتب</div>
            <div className="text-2xl font-bold">{kpis.totalPayroll.toLocaleString()}</div>
          </div>
          <div className="bg-gradient-to-br from-orange-500 to-orange-600 p-4 rounded-xl shadow-lg text-white">
            <div className="text-sm opacity-90 mb-1">إجمالي الساعات</div>
            <div className="text-3xl font-bold">{kpis.totalHours}</div>
          </div>
          <div className="bg-gradient-to-br from-red-500 to-red-600 p-4 rounded-xl shadow-lg text-white">
            <div className="text-sm opacity-90 mb-1">إجمالي الخصومات</div>
            <div className="text-2xl font-bold">{kpis.totalDeductions.toLocaleString()}</div>
          </div>
          <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-4 rounded-xl shadow-lg text-white">
            <div className="text-sm opacity-90 mb-1">متوسط الراتب</div>
            <div className="text-2xl font-bold">{kpis.avgSalary.toLocaleString()}</div>
          </div>
          <div className="bg-gradient-to-br from-pink-500 to-pink-600 p-4 rounded-xl shadow-lg text-white">
            <div className="text-sm opacity-90 mb-1">أعلى راتب</div>
            <div className="text-lg font-bold">{kpis.highestPaid.name}</div>
            <div className="text-2xl font-bold">{kpis.highestPaid.salary.toLocaleString()}</div>
          </div>
          <div className="bg-gradient-to-br from-teal-500 to-teal-600 p-4 rounded-xl shadow-lg text-white">
            <div className="text-sm opacity-90 mb-1">أكثر ساعات</div>
            <div className="text-lg font-bold">{kpis.mostHours.name}</div>
            <div className="text-2xl font-bold">{kpis.mostHours.hours} ساعة</div>
          </div>
        </motion.div>
      )}

      {/* Chart Mode Toggle */}
      <div className="flex gap-4 justify-center">
        <button
          onClick={() => setChartMode("baseRate")}
          className={`px-6 py-3 rounded-xl font-bold transition ${
            chartMode === "baseRate"
              ? "bg-blue-500 text-white shadow-lg"
              : "bg-white text-gray-700 hover:bg-gray-100"
          }`}
        >
          الساعة الشهرية
        </button>
        <button
          onClick={() => setChartMode("salary")}
          className={`px-6 py-3 rounded-xl font-bold transition ${
            chartMode === "salary"
              ? "bg-blue-500 text-white shadow-lg"
              : "bg-white text-gray-700 hover:bg-gray-100"
          }`}
        >
          إجمالي الراتب
        </button>
        <button
          onClick={() => setChartMode("deductions")}
          className={`px-6 py-3 rounded-xl font-bold transition ${
            chartMode === "deductions"
              ? "bg-blue-500 text-white shadow-lg"
              : "bg-white text-gray-700 hover:bg-gray-100"
          }`}
        >
          الخصومات
        </button>
      </div>

      {/* Employee Comparison Chart */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="bg-white rounded-2xl shadow p-4"
      >
        <h3 className="text-xl font-semibold mb-3">
          مقارنة الموظفين - {chartMode === "baseRate" ? "الساعة الشهرية" : chartMode === "salary" ? "إجمالي الراتب" : "الخصومات"}
        </h3>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={currentMonthData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
            <YAxis />
            <Tooltip />
            <Bar 
              dataKey={chartMode} 
              fill={chartMode === "baseRate" ? "#10B981" : chartMode === "salary" ? "#3B82F6" : "#EF4444"} 
              name={chartMode === "baseRate" ? "الساعة الشهرية" : chartMode === "salary" ? "إجمالي الراتب" : "الخصومات"}
              radius={[8, 8, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Leaderboard */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.15 }}
        className="bg-white rounded-2xl shadow p-4"
      >
        <h3 className="text-xl font-semibold mb-3">أعلى الرواتب</h3>
        <div className="space-y-2">
          {currentMonthData.slice(0, 10).map((emp, idx) => (
            <div 
              key={emp.name}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{idx === 0 ? "🥇" : idx === 1 ? "🥈" : idx === 2 ? "🥉" : `${idx + 1}`}</span>
                <span className="font-medium">{emp.name}</span>
              </div>
              <span className="font-bold text-green-600">{emp.salary.toLocaleString()}</span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Employee Dropdown */}
      <div className="bg-white p-4 rounded-xl shadow">
        <label className="block text-sm font-medium mb-2">اختر موظف:</label>
        <select
          value={selectedEmployee}
          onChange={(e) => setSelectedEmployee(e.target.value)}
          className="w-full md:w-64 p-2 border rounded-lg"
        >
          {employeeStats.map(emp => (
            <option key={emp.name} value={emp.name}>{emp.name}</option>
          ))}
        </select>
      </div>

      {/* Selected Employee Charts */}
      <AnimatePresence>
        {selectedEmployeeData && (
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            transition={{ duration: 0.3 }}
            className="bg-white rounded-2xl shadow p-4"
          >
            <h3 className="text-xl font-semibold mb-4">
              {selectedEmployee} - السجل
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-50 rounded-xl p-4">
                <h4 className="font-semibold mb-2">الساعة الشهرية</h4>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={selectedEmployeeData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Area type="monotone" dataKey="baseRate" stroke="#10B981" fill="#10B981" fillOpacity={0.3} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              
              <div className="bg-gray-50 rounded-xl p-4">
                <h4 className="font-semibold mb-2">إجمالي الراتب</h4>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={selectedEmployeeData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Area type="monotone" dataKey="salary" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.3} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              
              <div className="bg-gray-50 rounded-xl p-4">
                <h4 className="font-semibold mb-2">الساعات</h4>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={selectedEmployeeData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="hours" fill="#F59E0B" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              
              <div className="bg-gray-50 rounded-xl p-4">
                <h4 className="font-semibold mb-2">الخصومات</h4>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={selectedEmployeeData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="deductions" fill="#EF4444" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
