// api/submit.js
import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.NEON_DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    const { name, email, message } = await req.json();

    if (!name || !email || !message) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    await pool.query(`
      CREATE TABLE IF NOT EXISTS leads (
        id SERIAL PRIMARY KEY,
        name TEXT,
        email TEXT,
        message TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);

    await pool.query("INSERT INTO leads (name, email, message) VALUES ($1, $2, $3)", [
      name,
      email,
      message,
    ]);

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error("Error inserting data:", err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}
