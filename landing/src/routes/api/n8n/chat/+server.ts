import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request }) => {
  try {
    const { message, websiteUrl, conversationHistory } = await request.json();
    
    // Get n8n webhook URL from environment variable
    const n8nWebhookUrl = process.env.N8N_CHAT_WEBHOOK_URL || 'http://localhost:5678/webhook/chat';
    
    console.log('Calling n8n chat webhook:', n8nWebhookUrl);
    console.log('Chat data:', { message, websiteUrl, conversationHistory });
    
    // Call n8n webhook for chat response
    const response = await fetch(n8nWebhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message,
        websiteUrl,
        conversationHistory,
        timestamp: new Date().toISOString()
      })
    });
    
    if (!response.ok) {
      throw new Error(`n8n chat webhook failed: ${response.status} ${response.statusText}`);
    }
    
    const result = await response.json();
    console.log('n8n chat response:', result);
    
    return json({
      success: true,
      response: result.response || result.message || "I'm sorry, I couldn't process your request.",
      data: result
    });
    
  } catch (error) {
    console.error('Error calling n8n chat:', error);
    return json({
      success: false,
      response: "I'm sorry, I'm having trouble connecting to my training. Please try again later.",
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}; 