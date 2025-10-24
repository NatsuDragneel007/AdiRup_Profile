// Vercel serverless function: /api/submit.js
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

    // === Send to n8n webhook ===
    const webhookUrl = "http://localhost:5678/webhook-test/5b2f93b3-4829-4ee3-8a72-dc96119afcd5"; // <-- replace with your webhook
    await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: data.name,
        email: data.email,
        projectType: data.projectType,
        message: data.message,
        submittedAt: new Date().toISOString()
      })
    });

    // Return success
    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error("submit error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}
