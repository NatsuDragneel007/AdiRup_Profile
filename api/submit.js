import { sql } from '@vercel/postgres';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { name, email, projectType, message } = req.body;
    console.log('Received form data:', req.body);

    if (!name || !email) {
      return res.status(400).json({ error: 'Name and email are required' });
    }

    const result = await sql`
      INSERT INTO leads (name, email, project_type, message)
      VALUES (${name}, ${email}, ${projectType}, ${message});
    `;
    console.log('Insert success:', result);

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('❌ Error inserting lead:', err.message);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
