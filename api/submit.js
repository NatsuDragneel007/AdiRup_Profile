import { Pool } from 'pg';

// Neon auto-integrates DATABASE_URL via environment variable on Vercel
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

export default async function handler(req, res) {
  // Allow CORS (important!)
  res.setHeader('Access-Control-Allow-Origin', 'https://adirupprofile.vercel.app');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { name, email, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  try {
    const result = await pool.query(
      'INSERT INTO leads (name, email, message) VALUES ($1, $2, $3) RETURNING id',
      [name, email, message]
    );

    res.status(200).json({ success: true, id: result.rows[0].id });
  } catch (err) {
    console.error('❌ Database error:', err);
    res.status(500).json({ success: false, error: 'Database error' });
  }
}
