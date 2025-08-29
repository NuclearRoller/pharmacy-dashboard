import React, { useEffect, useState } from "react";
import axios from "axios";
import Papa from "papaparse";

function App() {
  const [data, setData] = useState([]);

  useEffect(() => {
    const sheetUrl = "https://docs.google.com/spreadsheets/d/e/2PACX-1vQOfzffnX62Ifzn7nw_BrorPy-YSOdUbRr85ZvbynG67pJaVaco95dM8j5Q4t5IYNNaUsqKII0jaYay/pub?output=csv"; // paste the CSV link here
    axios.get(sheetUrl)
      .then(res => {
        const parsed = Papa.parse(res.data, { header: true });
        setData(parsed.data);
      })
      .catch(err => console.error(err));
  }, []);

  return (
    <div style={{ padding: "2rem", fontFamily: "Arial" }}>
      <h1>Pharmacy Dashboard</h1>
      {data.length === 0 ? (
        <p>Loading data…</p>
      ) : (
        <table border="1" cellPadding="5">
          <thead>
            <tr>
              <th>Branch</th>
              <th>Total Sales</th>
              <th>Daily Avg</th>
              <th>Last Month Avg</th>
              <th>Emoji</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row, i) => (
              <tr key={i}>
                <td>{row.Branch}</td>
                <td>{row["Total Sales"]}</td>
                <td>{row["Daily Avg"]}</td>
                <td>{row["Last Month Avg"]}</td>
                <td>{row.Emoji}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default App;
