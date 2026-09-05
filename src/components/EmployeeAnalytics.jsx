import { useState, useEffect, useMemo } from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  BarChart, Bar, PieChart, Pie, Cell, ResponsiveContainer
} from "recharts";
import { parseSalaryCSV, getEmployeeStats } from "../utils/parseSalaryData";

const COLORS = ['#10B981', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#14B8A6', '#F97316'];

export default function EmployeeAnalytics({ csvUrl }) {
  const [csvText, setCsvText] = useState("");
  const [selectedEmployee, setSelectedEmployee] = useState(null);
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
    return getEmployeeStats(employees);
  }, [employees]);

  const kpis = useMemo(() => {
    if (!employeeStats.length) return null;
    
    const totalEmployees = employeeStats.length;
    const raisedEmployees = employeeStats.filter(e => e.monthsWithoutRaise === 0).length;
    const noRaiseEmployees = employeeStats.filter(e => e.monthsWithoutRaise >= 3).length;
    const totalPayroll = employeeStats.reduce((sum, e) => sum + e.currentSalary, 0);
    
    return { totalEmployees, raisedEmployees, noRaiseEmployees, totalPayroll };
  }, [employeeStats]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-xl text-gray-600">Loading employee data...</div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-3xl font-bold text-blue-600" style={{ fontFamily: "Cairo, sans-serif" }}>
        Employee Analytics
      </h2>

      {/* KPI Cards */}
      {kpis && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-xl shadow-md">
            <div className="text-sm text-gray-600 mb-1">Total Employees</div>
            <div className="text-2xl font-bold text-blue-600">{kpis.totalEmployees}</div>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-md">
            <div className="text-sm text-gray-600 mb-1">Got Raise Recently</div>
            <div className="text-2xl font-bold text-green-600">{kpis.raisedEmployees}</div>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-md">
            <div className="text-sm text-gray-600 mb-1">No Raise (3+ months)</div>
            <div className="text-2xl font-bold text-red-600">{kpis.noRaiseEmployees}</div>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-md">
            <div className="text-sm text-gray-600 mb-1">Total Payroll (Current)</div>
            <div className="text-2xl font-bold text-green-600">
              {kpis.totalPayroll.toLocaleString()}
            </div>
          </div>
        </div>
      )}

      {/* Employee Table */}
      <div className="bg-white rounded-2xl shadow p-4 overflow-x-auto">
        <h3 className="text-xl font-semibold mb-3" style={{ fontFamily: "Cairo, sans-serif" }}>
          Employee Status
        </h3>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b-2 border-gray-200">
              <th className="text-left p-2">Name</th>
              <th className="text-left p-2">Current Rate</th>
              <th className="text-left p-2">Last Raise</th>
              <th className="text-left p-2">Months Without Raise</th>
              <th className="text-left p-2">Current Hours</th>
              <th className="text-left p-2">Current Salary</th>
              <th className="text-left p-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {employeeStats.map(emp => (
              <tr 
                key={emp.name} 
                className="border-b hover:bg-gray-50 cursor-pointer"
                onClick={() => setSelectedEmployee(emp.name)}
              >
                <td className="p-2 font-medium">{emp.name}</td>
                <td className="p-2">{emp.currentRate.toLocaleString()}</td>
                <td className="p-2">{emp.lastRaiseDate}</td>
                <td className="p-2">
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    emp.monthsWithoutRaise >= 3 ? 'bg-red-100 text-red-700' : 
                    emp.monthsWithoutRaise >= 2 ? 'bg-yellow-100 text-yellow-700' : 
                    'bg-green-100 text-green-700'
                  }`}>
                    {emp.monthsWithoutRaise} months
                  </span>
                </td>
                <td className="p-2">{emp.currentHours}</td>
                <td className="p-2">{emp.currentSalary.toLocaleString()}</td>
                <td className="p-2">
                  {emp.monthsWithoutRaise >= 3 ? '🔴 Review' : 
                   emp.monthsWithoutRaise >= 2 ? '⚠️ Watch' : 
                   '✅ Active'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Selected Employee Charts */}
      {selectedEmployee && (
        <div className="bg-white rounded-2xl shadow p-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold" style={{ fontFamily: "Cairo, sans-serif" }}>
              {selectedEmployee} - History
            </h3>
            <button 
              onClick={() => setSelectedEmployee(null)}
              className="px-3 py-1 bg-gray-200 rounded-lg hover:bg-gray-300"
            >
              Close
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
                {/* Salary Trend */}
                <div className="bg-gray-50 rounded-xl p-4">
                  <h4 className="font-semibold mb-2">Salary Trend</h4>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="salary" stroke="#3B82F6" name="Salary" />
                      <Line type="monotone" dataKey="baseRate" stroke="#10B981" name="Base Rate" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                
                {/* Hours per Month */}
                <div className="bg-gray-50 rounded-xl p-4">
                  <h4 className="font-semibold mb-2">Hours per Month</h4>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="hours" fill="#F59E0B" name="Hours" />
                      <Bar dataKey="deductions" fill="#EF4444" name="Deductions" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
}
