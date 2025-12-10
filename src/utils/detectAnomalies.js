// Detect spikes, drops, and zero-sales anomalies
export default function detectAnomalies(data, branchNames) {
  if (!data || data.length < 2) return [];

  const anomalies = [];

  for (let i = 1; i < data.length; i++) {
    const today = data[i];
    const yesterday = data[i - 1];

    branchNames.forEach(branch => {
      const t = today[branch] || 0;
      const y = yesterday[branch] || 0;

      if (y === 0 && t === 0) return;
      if (y === 0 && t > 0) return; // normal start spike

      const change = (t - y) / (y || 1);

      // ZERO-SALES DAY
      if (t === 0) {
        anomalies.push({
          type: "zero",
          branch,
          date: today.date || today.Date,
          change: 0,
        });
        return;
      }

      // SPIKE (> +20%)
      if (change > 0.2) {
        anomalies.push({
          type: "spike",
          branch,
          date: today.date || today.Date,
          change,
        });
      }

      // DROP (< -20%)
      if (change < -0.2) {
        anomalies.push({
          type: "drop",
          branch,
          date: today.date || today.Date,
          change,
        });
      }
    });
  }

  return anomalies;
}
