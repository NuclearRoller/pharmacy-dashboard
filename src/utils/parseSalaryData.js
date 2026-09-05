import Papa from "papaparse";

export function parseSalaryCSV(csvText) {
  const result = Papa.parse(csvText, {
    header: false,
    skipEmptyLines: false,
  });

  const rows = result.data;
  const employees = {};
  const months = [];
  
  let currentMonth = null;
  let currentHeaders = null;

  rows.forEach((row, index) => {
    const firstCell = row[0]?.trim() || "";
    
    // Check if this is a month header (e.g., "AUGUST 2026")
    if (firstCell && firstCell.match(/[A-Za-z]+ \d{4}/) && row.length === 1) {
      currentMonth = firstCell.toUpperCase();
      if (!months.includes(currentMonth)) {
        months.push(currentMonth);
      }
      return;
    }
    
    // Check if this is the column headers row
    if (firstCell?.toUpperCase() === "NAME" && currentMonth) {
      currentHeaders = row;
      return;
    }
    
    // Check if this is an employee row
    if (currentMonth && firstCell && firstCell.toUpperCase() !== "NAME") {
      const name = firstCell;
      const hours = parseFloat(row[1]) || 0;
      const baseRate = parseFloat(row[2]) || 0;
      const deductions = parseFloat(row[3]) || 0;
      const salary = parseFloat(row[4]) || 0;
      
      // Skip "LEFT" employees
      if (name.includes("(LEFT)")) return;
      
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

export function getEmployeeStats(employees) {
  const stats = [];
  
  employees.forEach(emp => {
    const sortedHistory = emp.history.sort((a, b) => {
      return new Date(a.month) - new Date(b.month);
    });
    
    const current = sortedHistory[sortedHistory.length - 1] || {};
    const previous = sortedHistory[sortedHistory.length - 2] || {};
    const lastThreeMonths = sortedHistory.slice(-3);
    
    // Check for raises in last 3 months
    let lastRaiseDate = null;
    let monthsWithoutRaise = 0;
    
    for (let i = sortedHistory.length - 1; i > 0; i--) {
      if (sortedHistory[i].baseRate > sortedHistory[i - 1].baseRate) {
        lastRaiseDate = sortedHistory[i].month;
        break;
      }
    }
    
    if (lastRaiseDate) {
      const lastRaiseIndex = months.findIndex(m => m === lastRaiseDate);
      monthsWithoutRaise = months.length - 1 - lastRaiseIndex;
    } else {
      monthsWithoutRaise = sortedHistory.length - 1;
    }
    
    stats.push({
      name: emp.name,
      currentRate: current.baseRate || 0,
      previousRate: previous.baseRate || 0,
      currentHours: current.hours || 0,
      currentDeductions: current.deductions || 0,
      currentSalary: current.salary || 0,
      averageSalary: sortedHistory.reduce((sum, h) => sum + h.salary, 0) / (sortedHistory.length || 1),
      totalHours: sortedHistory.reduce((sum, h) => sum + h.hours, 0),
      averageHours: sortedHistory.reduce((sum, h) => sum + h.hours, 0) / (sortedHistory.length || 1),
      lastRaiseDate: lastRaiseDate || "Never",
      monthsWithoutRaise: monthsWithoutRaise,
      history: sortedHistory,
    });
  });
  
  return stats;
}
