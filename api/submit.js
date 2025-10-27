import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

export default async function handler(req, res) {
  // Dynamic CORS allowlist
  const allowedOrigins = [
    'https://adirupprofile.vercel.app',
    'http://localhost:3000',
  ];
  const origin = req.headers.origin;

  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }

  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { name, email, message } = req.body;
    if (!name || !email || !message) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const result = await pool.query(
      'INSERT INTO leads (name, email, message) VALUES ($1, $2, $3) RETURNING id',
      [name, email, message]
    );

    return res.status(200).json({ success: true, id: result.rows[0].id });
  } catch (err) {
    console.error('❌ Database error:', err);
    return res.status(500).json({ success: false, error: 'Database error' });
  }
}
