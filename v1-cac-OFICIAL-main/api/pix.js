
export default async function handler(req, res) {
  // CORS configuration
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Public-Key, X-Secret-Key');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const input = req.body;
    
    if (!input) {
      return res.status(400).json({ error: 'Missing request body' });
    }

    // Using keys provided in the previous environment
    const SECRET_KEY = "sk_auto_Pg3ijza2pD71sJftYx9GZrJeM7sfbI7P";
    const PUBLIC_KEY = "pk_auto_pHnvbhcVxXZW173YZGTKOuBhab3Z8Ocy";

    const name = input.nome || 'Cliente';
    const email = input.email || 'cliente@email.com';
    let phone = (input.telefone || '11999999999').replace(/\D/g, '');
    if (phone.length === 11 || phone.length === 10) {
      phone = '55' + phone;
    }
    const document = (input.cpf || '').replace(/\D/g, '');
    const value = parseFloat(input.amount || 96.67).toFixed(2);

    const payload = {
      client_name: name,
      client_email: email,
      client_document: document,
      value: value,
      amount: value, 
      gateway_account_id: 1,
      client_mobile_phone: phone,
      external_id: `REF_${Date.now()}`,
      provider: "pix",
      payment_method: "pix",
      products: [
        {
          name: "REGISTRO TAXAS CAC",
          quantity: 1,
          value: value,
          price: value
        }
      ]
    };

    const response = await fetch("https://api.ghostspaysv1.com/api/generate-transaction", {
      method: "POST",
      headers: {
        'Content-Type': 'application/json',
        'api_key': PUBLIC_KEY,
        'secret_key': SECRET_KEY,
        'X-Public-Key': PUBLIC_KEY,
        'X-Secret-Key': SECRET_KEY
      },
      body: JSON.stringify(payload)
    });

    const responseText = await response.text();
    let data;
    try {
      data = JSON.parse(responseText);
    } catch (e) {
      console.error("Parse Error. Status:", response.status, "Raw data:", responseText);
      return res.status(response.status || 500).json({ 
        error: 'Invalid JSON from GhostsPay', 
        raw: responseText 
      });
    }

    if (!response.ok) {
      console.error("GhostsPay V1 API Error:", data);
      return res.status(response.status).json({
        error: data.message || data.error || 'The given data was invalid',
        details: data.errors || data.details || data
      });
    }

    // Return the response in a way that the frontend expects or adapted for V1
    return res.status(200).json(data);

  } catch (error) {
    console.error("API Error:", error);
    return res.status(500).json({ 
      error: 'Internal error processing PIX', 
      details: error.message 
    });
  }
}
