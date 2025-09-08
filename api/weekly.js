import { sql } from "../lib/db.js";
import { weeklyStats } from "../lib/score.js";

export default async function handler(req, res) {
  try {
    if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });
    const { userId } = req.query || {};
    if (!userId) return res.status(400).json({ error: "userId is required" });

    const rows = await sql`
      select id, user_id, start_at, end_at, minutes, note, created_at
      from sleep_sessions
      where user_id = ${userId}
        and start_at >= (now() at time zone 'utc') - interval '7 days'
      order by start_at desc
    `;
    return res.status(200).json(weeklyStats(rows));
  } catch (e) {
    console.error("GET /weekly error:", e);
    return res.status(500).json({ error: "Internal error" });
  }
}
