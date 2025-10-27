import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

export default async function handler(req, res) {
  // ✅ Step 1: Strict CORS allowlist (add your domain here)
  const allowedOrigins = [
    "https://adirupprofile.vercel.app", // live domain
    "http://localhost:http://127.0.0.1:5500",            // local testing
  ];
  const origin = req.headers.origin;

  if (allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  } else {
    // ❌ Block disallowed origins explicitly
    return res.status(403).json({ error: "Origin not allowed" });
  }

  // ✅ Step 2: Basic CORS Headers
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Access-Control-Allow-Credentials", "true");

  // ✅ Step 3: Handle Preflight
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  // ✅ Step 4: Actual POST handling
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { name, email, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const result = await pool.query(
      "INSERT INTO leads (name, email, message) VALUES ($1, $2, $3) RETURNING id",
      [name, email, message]
    );

    res.status(200).json({ success: true, id: result.rows[0].id });
  } catch (err) {
    console.error("❌ Database error:", err);
    res.status(500).json({ success: false, error: "Database error" });
  }
}
