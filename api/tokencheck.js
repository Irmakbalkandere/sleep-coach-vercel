export default function handler(req, res) {
  const isProd = process.env.VERCEL_ENV === "production";
  if (isProd) return res.status(404).end();
  res.status(200).json({ hasApiToken: !!process.env.API_TOKEN });
}