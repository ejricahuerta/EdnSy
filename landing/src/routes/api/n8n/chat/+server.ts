import { json } from '@sveltejs/kit';
import { N8N_DEMO_CHAT_API_URL } from '$env/static/private';

// Validate environment variables
if (!N8N_DEMO_CHAT_API_URL) {
  console.error('❌ Missing required N8N environment variable: N8N_DEMO_CHAT_API_URL');
  if (import.meta.env.PROD) {
    throw new Error('Missing required N8N environment variable');
  }
}

export async function POST({ request }) {
  try {
    const body = await request.json();
    // Validate request body
    if (!body || typeof body !== 'object') {
      return json({ error: 'Invalid request body' }, { status: 400 });
    }
    const response = await fetch(N8N_DEMO_CHAT_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'n8n': 'EDNSY'
      },
      body: JSON.stringify(body)
    });
    // Log and parse the N8N response
    const text = await response.text();
    let result;
    try {
      result = JSON.parse(text);
    } catch {
      result = { raw: text };
    }
    if (!response.ok) {
      console.error('N8N chat webhook failed:', response.status, result);
      return json({
        success: false,
        message: `AI service unavailable (code ${response.status})`,
        details: result
      }, { status: 500 });
    }
    // Return the real N8N response to the frontend
    return json(result);
  } catch (error) {
    console.error('Error in n8n chat API:', error);
    return json({ error: 'Failed to process request', details: error instanceof Error ? error.message : error }, { status: 500 });
  }
} 