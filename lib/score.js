export function weeklyStats(rows) {
  const days = new Set(rows.map(r => new Date(r.start_at).toISOString().slice(0,10))).size;
  const total = rows.reduce((s, r) => s + Number(r.minutes || 0), 0);
  const avgMinutes = rows.length ? Math.round(total / rows.length) : 0;
  // basit bir skor: 7-9 saat hedefine yakınlık
  const target = 8 * 60;
  const diff = Math.abs(avgMinutes - target);
  const sleepScore = Math.max(0, 100 - Math.min(100, Math.round(diff / 5)));
  return { days, avgMinutes, sleepScore };
}
