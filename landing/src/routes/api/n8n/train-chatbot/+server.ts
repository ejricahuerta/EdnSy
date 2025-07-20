import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request }) => {
  try {
    const { websiteUrl, action } = await request.json();
    
    // Get n8n webhook URL from environment variable
    const n8nWebhookUrl = process.env.N8N_WEBHOOK_URL || 'http://localhost:5678/webhook/train-chatbot';
    
    console.log('Calling n8n webhook:', n8nWebhookUrl);
    console.log('Training data:', { websiteUrl, action });
    
    // Call n8n webhook
    const response = await fetch(n8nWebhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        websiteUrl,
        action,
        timestamp: new Date().toISOString()
      })
    });
    
    if (!response.ok) {
      throw new Error(`n8n webhook failed: ${response.status} ${response.statusText}`);
    }
    
    const result = await response.json();
    console.log('n8n response:', result);
    
    return json({
      success: true,
      message: 'Chatbot training initiated successfully',
      data: result
    });
    
  } catch (error) {
    console.error('Error calling n8n:', error);
    return json({
      success: false,
      message: 'Failed to train chatbot',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}; 