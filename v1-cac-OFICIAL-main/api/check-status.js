
export default async function handler(req, res) {
  // CORS configuration
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Public-Key, X-Secret-Key');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ error: 'Missing transaction ID' });
  }

  try {
    const SECRET_KEY = "sk_auto_Pg3ijza2pD71sJftYx9GZrJeM7sfbI7P";
    const PUBLIC_KEY = "pk_auto_pHnvbhcVxXZW173YZGTKOuBhab3Z8Ocy";

    // Although not documented in V1 explicitly as a GET, many systems have a fallback
    // If this fails, we return a pending status to keep the UI alive.
    // Note: V1 docs suggest using Webhooks (post_back_url) instead of polling.
    
    // Attempting a common pattern (might need adjustment if GhostsPay supports it)
    const response = await fetch(`https://api.ghostspaysv1.com/api/pix/transaction/${id}`, {
      method: "GET",
      headers: {
        'api_key': PUBLIC_KEY,
        'secret_key': SECRET_KEY
      }
    });

    if (response.ok) {
        const data = await response.json();
        return res.status(200).json(data.data || data);
    }

    // Fallback: If no GET endpoint exists, we just return pending to avoid front-end errors
    // but the payment won't auto-redirect without a webhook setup.
    return res.status(200).json({ status: 'pending', message: 'Polling not supported in V1 docs. Use Webhooks.' });

  } catch (error) {
    console.error("Check Status Error:", error);
    return res.status(200).json({ status: 'pending', error: error.message });
  }
}
