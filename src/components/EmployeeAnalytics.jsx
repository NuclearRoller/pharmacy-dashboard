import { useState, useEffect, useMemo } from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  BarChart, Bar, PieChart, Pie, Cell, ResponsiveContainer, AreaChart, Area
} from "recharts";
import { parseSalaryCSV, getEmployeeStats } from "../utils/parseSalaryData";
import { motion, AnimatePresence } from "framer-motion";

const COLORS = ['#10B981', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#14B8A6', '#F97316', '#6366F1', '#84CC16', '#06B6D4', '#D946EF'];

export default function EmployeeAnalytics({ csvUrl }) {
  const [csvText, setCsvText] = useState("");
  const [selectedEmployee, setSelectedEmployee] = useState(null);
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
    return parseSalaryCSV(csvText);
  }, [csvText]);

  const employeeStats = useMemo(() => {
    if (!employees.length) return [];
    return getEmployeeStats(employees, months);
  }, [employees, months]);

  // Set default month to latest
  useEffect(() => {
    if (months.length) setMonthIndex(months.length - 1);
  }, [months]);

  // Get current month data
  const currentMonthData = useMemo(() => {
    if (!employeeStats.length || !months.length) return [];
    const currentMonth = months[monthIndex];
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
      });
  }, [employeeStats, months, monthIndex]);

  const kpis = useMemo(() => {
    if (!currentMonthData.length) return null;
    
    const totalEmployees = currentMonthData.length;
    const totalPayroll = currentMonthData.reduce((sum, e) => sum + e.salary, 0);
    const totalHours = currentMonthData.reduce((sum, e) => sum + e.hours, 0);
    const totalDeductions = currentMonthData.reduce((sum, e) => sum + e.deductions, 0);
    
    // Average salary
    const avgSalary = totalPayroll / totalEmployees;
    
    // Highest paid
    const highestPaid = currentMonthData.reduce((max, e) => e.salary > max.salary ? e : max);
    
    // Most hours
    const mostHours = currentMonthData.reduce((max, e) => e.hours > max.hours ? e : max);
    
    return { 
      totalEmployees, 
      totalPayroll, 
      totalHours, 
      totalDeductions,
      avgSalary,
      highestPaid,
      mostHours
    };
  }, [currentMonthData]);

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
    <div className="p-6 space-y-6" style={{ fontFamily: "Cairo, sans-serif" }}>
      <h2 className="text-3xl font-bold text-blue-600 mb-4">
        تحليلات الموظفين
      </h2>

      {/* Month Navigation */}
      {months.length > 0 && (
        <div className="flex items-center justify-between bg-white p-4 rounded-xl shadow">
          <button
            onClick={prevMonth}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:brightness-110"
          >
            ← الشهر السابق
          </button>
          <h3 className="text-xl font-semibold">
            {months[monthIndex]}
          </h3>
          <button
            onClick={nextMonth}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:brightness-110"
          >
            الشهر التالي →
          </button>
        </div>
      )}

      {/* KPI Cards */}
      {kpis && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4"
        >
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-4 rounded-xl shadow-lg text-white">
            <div className="text-sm opacity-90 mb-1">إجمالي الموظفين</div>
            <div className="text-3xl font-bold">{kpis.totalEmployees}</div>
          </div>
          <div className="bg-gradient-to-br from-green-500 to-green-600 p-4 rounded-xl shadow-lg text-white">
            <div className="text-sm opacity-90 mb-1">إجمالي الرواتب</div>
            <div className="text-3xl font-bold">{kpis.totalPayroll.toLocaleString()}</div>
          </div>
          <div className="bg-gradient-to-br from-orange-500 to-orange-600 p-4 rounded-xl shadow-lg text-white">
            <div className="text-sm opacity-90 mb-1">إجمالي الساعات</div>
            <div className="text-3xl font-bold">{kpis.totalHours}</div>
          </div>
          <div className="bg-gradient-to-br from-red-500 to-red-600 p-4 rounded-xl shadow-lg text-white">
            <div className="text-sm opacity-90 mb-1">إجمالي الخصومات</div>
            <div className="text-3xl font-bold">{kpis.totalDeductions.toLocaleString()}</div>
          </div>
          <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-4 rounded-xl shadow-lg text-white">
            <div className="text-sm opacity-90 mb-1">متوسط الراتب</div>
            <div className="text-3xl font-bold">{kpis.avgSalary.toLocaleString()}</div>
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
          الراتب الأساسي
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
      </div>

      {/* All Employees Comparison Chart */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="bg-white rounded-2xl shadow p-4"
      >
        <h3 className="text-xl font-semibold mb-3">
          مقارنة الموظفين - {chartMode === "baseRate" ? "الراتب الأساسي" : "إجمالي الراتب"}
        </h3>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={currentMonthData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
            <YAxis />
            <Tooltip />
            <Bar 
              dataKey={chartMode === "baseRate" ? "baseRate" : "salary"} 
              fill="#3B82F6" 
              name={chartMode === "baseRate" ? "الراتب الأساسي" : "إجمالي الراتب"}
              radius={[8, 8, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Employee Table */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="bg-white rounded-2xl shadow p-4 overflow-x-auto"
      >
        <h3 className="text-xl font-semibold mb-3">حالة الموظفين</h3>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b-2 border-gray-200">
              <th className="text-right p-2">الاسم</th>
              <th className="text-right p-2">الراتب الأساسي</th>
              <th className="text-right p-2">الساعات</th>
              <th className="text-right p-2">الخصومات</th>
              <th className="text-right p-2">إجمالي الراتب</th>
              <th className="text-right p-2">الحالة</th>
            </tr>
          </thead>
          <tbody>
            {currentMonthData.map((emp, idx) => (
              <motion.tr 
                key={emp.name}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: idx * 0.02 }}
                className="border-b hover:bg-gray-50 cursor-pointer"
                onClick={() => setSelectedEmployee(emp.name)}
              >
                <td className="p-2 font-medium">{emp.name}</td>
                <td className="p-2">{emp.baseRate.toLocaleString()}</td>
                <td className="p-2">{emp.hours}</td>
                <td className="p-2 text-red-600">{emp.deductions.toLocaleString()}</td>
                <td className="p-2 font-bold">{emp.salary.toLocaleString()}</td>
                <td className="p-2">
                  {emp.salary > 0 ? '✅ نشط' : '⏳ بانتظار البيانات'}
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </motion.div>

      {/* Selected Employee Charts */}
      <AnimatePresence>
        {selectedEmployee && (
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            transition={{ duration: 0.3 }}
            className="bg-white rounded-2xl shadow p-4"
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">
                {selectedEmployee} - السجل
              </h3>
              <button 
                onClick={() => setSelectedEmployee(null)}
                className="px-3 py-1 bg-gray-200 rounded-lg hover:bg-gray-300"
              >
                إغلاق
              </button>
            </div>
            
            {(() => {
              const emp = employeeStats.find(e => e.name === selectedEmployee);
              if (!emp) return null;
              
              const chartData = emp.history.map(h => ({
                month: h.month,
                baseRate: h.baseRate,
                hours: h.hours,
                salary: h.salary,
                deductions: h.deductions,
              }));
              
              return (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gray-50 rounded-xl p-4">
                    <h4 className="font-semibold mb-2">الراتب الأساسي</h4>
                    <ResponsiveContainer width="100%" height={300}>
                      <AreaChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip />
                        <Area 
                          type="monotone" 
                          dataKey="baseRate" 
                          stroke="#10B981" 
                          fill="#10B981" 
                          fillOpacity={0.3}
                          name="الراتب الأساسي"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                  
                  <div className="bg-gray-50 rounded-xl p-4">
                    <h4 className="font-semibold mb-2">إجمالي الراتب</h4>
                    <ResponsiveContainer width="100%" height={300}>
                      <AreaChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip />
                        <Area 
                          type="monotone" 
                          dataKey="salary" 
                          stroke="#3B82F6" 
                          fill="#3B82F6" 
                          fillOpacity={0.3}
                          name="إجمالي الراتب"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                  
                  <div className="bg-gray-50 rounded-xl p-4">
                    <h4 className="font-semibold mb-2">الساعات</h4>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="hours" fill="#F59E0B" name="الساعات" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  
                  <div className="bg-gray-50 rounded-xl p-4">
                    <h4 className="font-semibold mb-2">الخصومات</h4>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="deductions" fill="#EF4444" name="الخصومات" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              );
            })()}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
