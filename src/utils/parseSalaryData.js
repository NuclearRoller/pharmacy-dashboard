import Papa from "papaparse";

function monthToDate(monthStr) {
  if (!monthStr) return null;
  const months = {
    "JANUARY": 0, "FEBRUARY": 1, "MARCH": 2, "APRIL": 3, "MAY": 4, "JUNE": 5,
    "JULY": 6, "AUGUST": 7, "SEPTEMBER": 8, "OCTOBER": 9, "NOVEMBER": 10, "DECEMBER": 11
  };
  
  const parts = monthStr.trim().split(" ");
  if (parts.length !== 2) return null;
  
  const month = months[parts[0].toUpperCase()];
  const year = parseInt(parts[1]);
  
  if (month === undefined || isNaN(year)) return null;
  
  return new Date(year, month, 1);
}

function formatMonth(monthStr) {
  const date = monthToDate(monthStr);
  if (!date) return monthStr;
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

export function parseSalaryCSV(csvText) {
  const result = Papa.parse(csvText, {
    header: false,
    skipEmptyLines: true, // Changed to true to skip empty rows
  });

  const rows = result.data;
  const employees = {};
  const months = [];
  
  let currentMonth = null;

  rows.forEach((row) => {
    if (!row || row.length === 0) return;
    
    const firstCell = (row[0] || "").trim();
    
    // Skip completely empty rows
    if (!firstCell && row.every(cell => !cell || cell.trim() === "")) return;
    
    // Check if this is a month header (e.g., "AUGUST 2026")
    // More lenient: just check if first cell matches month pattern
    if (firstCell && firstCell.match(/[A-Za-z]+ \d{4}/)) {
      currentMonth = formatMonth(firstCell);
      if (!months.includes(currentMonth)) {
        months.push(currentMonth);
      }
      return;
    }
    
    // Skip header rows
    if (firstCell?.toUpperCase() === "NAME" || firstCell?.toUpperCase() === "TOTAL HOURS") {
      return;
    }
    
    // Check if this is an employee row
    if (currentMonth && firstCell) {
      const name = firstCell;
      const hours = parseFloat(row[1]) || 0;
      const baseRate = parseFloat(row[2]) || 0;
      const deductions = parseFloat(row[3]) || 0;
      const salary = parseFloat(row[4]) || 0;
      
      // Skip "LEFT" employees
      if (name.includes("(LEFT)") || name.includes("LEFT")) return;
      
      if (!employees[name]) {
        employees[name] = {
          name: name,
          history: [],
        };
      }
      
      employees[name].history.push({
        month: currentMonth,
        hours: hours,
        baseRate: baseRate,
        deductions: deductions,
        salary: salary,
      });
    }
  });

  return { employees: Object.values(employees), months };
}

export function getEmployeeStats(employees, months) {
  const stats = [];
  
  employees.forEach(emp => {
    const sortedHistory = [...emp.history].sort((a, b) => {
      return (a.month || "").localeCompare(b.month || "");
    });
    
    const current = sortedHistory[sortedHistory.length - 1] || {};
    
    stats.push({
      name: emp.name,
      currentRate: current.baseRate || 0,
      currentHours: current.hours || 0,
      currentDeductions: current.deductions || 0,
      currentSalary: current.salary || 0,
      history: sortedHistory,
    });
  });
  
  return stats;
}
