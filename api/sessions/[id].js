import { sql } from "../../lib/db.js";

function setCors(res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,DELETE,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type,X-Api-Token");
}

export default async function handler(req, res) {
  setCors(res);
  if (req.method === "OPTIONS") return res.status(204).end();
  try {
    if (req.method !== "DELETE") return res.status(405).json({ error: "Method not allowed" });

    const token = req.headers["x-api-token"];
    if (!process.env.API_TOKEN || token !== process.env.API_TOKEN) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { id, userId } = { ...req.query };
    if (!id || !userId) return res.status(400).json({ error: "id and userId are required" });

    await sql`delete from sleep_sessions where id = ${id} and user_id = ${userId}`;
    return res.status(204).end();
  } catch (e) {
    console.error("DELETE /sessions/:id error:", e);
    return res.status(500).json({ error: "Internal error" });
  }
}