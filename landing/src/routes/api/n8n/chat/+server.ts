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

    if (!response.ok) {
      console.error(`N8N API error: ${response.status} ${response.statusText}`);
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    return json(result);
  } catch (error) {
    console.error('Error in n8n chat API:', error);
    return json({ error: 'Failed to process request' }, { status: 500 });
  }
} 