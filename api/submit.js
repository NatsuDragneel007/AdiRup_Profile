// For Vercel: export default async function handler(req, res) { ... }
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const data = req.body || await new Promise((r) => {
      let body = '';
      req.on('data', (chunk) => body += chunk);
      req.on('end', () => r(JSON.parse(body || '{}')));
    });

    // Basic validation
    if (!data.name || !data.email) {
      return res.status(400).json({ error: 'Name and email required' });
    }

    // Log to Vercel function console (visible in deploy logs)
    console.log('[New lead]', JSON.stringify(data));

    // Optional quick dev storage: append to a local JSON file.
    // NOTE: Vercel's filesystem is ephemeral — this is only useful for local testing.
    try {
      const fs = require('fs');
      const path = require('path');
      const file = path.join(process.cwd(), 'submissions.json');
      let arr = [];
      if (fs.existsSync(file)) {
        const raw = fs.readFileSync(file, 'utf8');
        arr = JSON.parse(raw || '[]');
      }
      arr.push({ ...data, receivedAt: new Date().toISOString() });
      fs.writeFileSync(file, JSON.stringify(arr, null, 2));
    } catch (err) {
      // ignore filesystem errors on serverless production
      console.log('FS write skipped or failed (expected on Vercel prod):', err.message || err);
    }

    // === FUTURE: if you want to send immediately to an n8n webhook, replace below with a fetch() to your webhook URL
    // Example:
    // await fetch('https://YOUR_N8N_WEBHOOK_URL', { method: 'POST', body: JSON.stringify(data), headers: { 'Content-Type': 'application/json' } });

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('submit error', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
