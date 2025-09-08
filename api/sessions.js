import { sql } from "../lib/db.js";
import { randomUUID } from "node:crypto";

// CORS
function setCors(res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,DELETE,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type,X-Api-Token");
}

// Body (obj/string/buffer/stream)
function readBody(req) {
  return new Promise((resolve) => {
    try {
      if (req.body && typeof req.body === "object" && !Buffer.isBuffer(req.body)) return resolve(req.body);
      if (typeof req.body === "string") { try { return resolve(JSON.parse(req.body)); } catch { return resolve({}); } }
      if (Buffer.isBuffer(req.body)) { try { return resolve(JSON.parse(req.body.toString("utf8"))); } catch { return resolve({}); } }
      let raw = ""; req.on("data", c => raw += c);
      req.on("end", () => { if (!raw) return resolve({}); try { resolve(JSON.parse(raw)); } catch { resolve({}); } });
      req.on("error", () => resolve({}));
    } catch { resolve({}); }
  });
}

export default async function handler(req, res) {
  setCors(res);
  if (req.method === "OPTIONS") return res.status(204).end();
  try {
    if (req.method === "POST") {
      // 🔐 Token zorunlu
      const token = req.headers["x-api-token"];
      if (!process.env.API_TOKEN || token !== process.env.API_TOKEN) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      const { userId, start, end, note = "" } = await readBody(req);
      if (!userId || !start || !end) return res.status(400).json({ error: "Missing userId/start/end" });

      const startDate = new Date(start);
      const endDate = new Date(end);
      const minutes = Math.floor((endDate - startDate) / 60000);
      if (!Number.isFinite(minutes) || minutes <= 0) return res.status(400).json({ error: "Invalid times" });

      const id = randomUUID();
      const rows = await sql`
        insert into sleep_sessions (id, user_id, start_at, end_at, minutes, note)
        values (${id}, ${userId}, ${startDate.toISOString()}, ${endDate.toISOString()}, ${minutes}, ${note})
        returning id, user_id, start_at, end_at, minutes, note, created_at
      `;
      return res.status(201).json(rows[0]);
    }

    if (req.method === "GET") {
      const { userId } = req.query || {};
      if (!userId) return res.status(400).json({ error: "userId is required" });
      const rows = await sql`
        select id, user_id, start_at, end_at, minutes, note, created_at
        from sleep_sessions
        where user_id = ${userId}
        order by created_at desc
        limit 200
      `;
      return res.status(200).json(rows);
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch (e) {
    console.error("POST/GET /sessions error:", e);
    return res.status(500).json({ error: "Internal error" });
  }
}
