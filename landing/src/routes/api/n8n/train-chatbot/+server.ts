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
    const { websiteUrl, action } = await request.json();
    
    // Validate required fields
    if (!websiteUrl || !action) {
      return json({ 
        success: false, 
        message: 'Missing required fields: websiteUrl and action' 
      }, { status: 400 });
    }
    
    // Validate websiteUrl format
    try {
      new URL(websiteUrl);
    } catch {
      return json({ 
        success: false, 
        message: 'Invalid website URL format' 
      }, { status: 400 });
    }
    
    // Use the same n8n URL for training
    const n8nWebhookUrl = N8N_DEMO_CHAT_API_URL;
    
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
      console.error(`N8N webhook failed: ${response.status} ${response.statusText}`);
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