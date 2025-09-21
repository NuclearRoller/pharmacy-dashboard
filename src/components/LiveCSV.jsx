// src/components/LiveCSV.jsx
import { useEffect } from "react";
import Papa from "papaparse";

export default function LiveCSV({ csvUrl, onDataLoaded }) {
  useEffect(() => {
    if (!csvUrl) return;

    console.info("[LiveCSV] fetching CSV:", csvUrl);

    Papa.parse(csvUrl, {
      download: true,
      header: true,
      skipEmptyLines: true,
      transformHeader: (h) => {
        if (!h) return h;
        // remove BOM + trim
        return h.replace(/\uFEFF/g, "").trim();
      },
      complete: (results) => {
        console.info("[LiveCSV] parse complete — rows:", results.data.length);
        if (results && results.data && results.data.length > 0) {
          console.log("[LiveCSV] first row (raw):", results.data[0]);
          console.log("[LiveCSV] keys:", Object.keys(results.data[0]));
        } else {
          console.warn("[LiveCSV] no rows parsed");
        }
        onDataLoaded && onDataLoaded(results.data);
      },
      error: (err) => {
        console.error("[LiveCSV] parse error:", err);
      },
    });
  }, [csvUrl, onDataLoaded]);

  return null;
}
