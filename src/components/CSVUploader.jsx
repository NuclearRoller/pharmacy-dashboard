import React, { useState } from "react";
import Papa from "papaparse";

export default function CSVUploader({ onDataLoaded }) {
  const [fileName, setFileName] = useState("");

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setFileName(file.name);

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: function (results) {
        onDataLoaded(results.data); // send parsed data back to parent
      },
    });
  };

  return (
    <div className="mb-6">
      <label className="block mb-2 font-semibold">Upload CSV:</label>
      <input
        type="file"
        accept=".csv"
        onChange={handleFileChange}
        className="px-3 py-2 border rounded-lg"
      />
      {fileName && <p className="mt-2 text-sm text-gray-600">Loaded: {fileName}</p>}
    </div>
  );
}
