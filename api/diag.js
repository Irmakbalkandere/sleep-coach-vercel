export default function handler(req, res) {
  const isProd = process.env.VERCEL_ENV === "production";
  if (isProd) return res.status(404).end();
  res.status(200).json({ hasDatabaseUrl: !!process.env.DATABASE_URL, env: process.env.VERCEL_ENV || "dev" });
}
