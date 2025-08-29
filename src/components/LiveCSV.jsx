// src/components/LiveCSV.jsx
import { useEffect } from "react";
import Papa from "papaparse";

export default function LiveCSV({ csvUrl, onDataLoaded, refreshMs = 60000 }) {
  useEffect(() => {
    let mounted = true;

    const fetchCSV = async () => {
      try {
        const res = await fetch(csvUrl, { cache: "no-store" });
        const text = await res.text();
        const parsed = Papa.parse(text, { header: true });
        if (mounted) onDataLoaded(parsed.data.filter((r) => r.Date));
      } catch (e) {
        console.error("CSV fetch error:", e);
      }
    };

    fetchCSV();
    const id = setInterval(fetchCSV, refreshMs);
    return () => {
      mounted = false;
      clearInterval(id);
    };
  }, [csvUrl, onDataLoaded, refreshMs]);

  return null;
}
