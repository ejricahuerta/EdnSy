import { json } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';

// Get N8N API URL with fallback
const getN8nApiUrl = () => env.N8N_DEMO_CHAT_API_URL || 'https://your-n8n-instance.com/webhook/your-webhook-id/chat';

export async function POST({ request, locals }) {
  try {
    const { website, action } = await request.json();
    // Validate required fields
    if (!website || !action) {
      return json({ 
        success: false, 
        message: 'Missing required fields: website and action' 
      }, { status: 400 });
    }
    // Validate website format
    try {
      new URL(website);
    } catch {
      return json({ 
        success: false, 
        message: 'Invalid website URL format' 
      }, { status: 400 });
    }
    
    // Get session and user data from server context
    const { session, user } = await locals.safeGetSession();
    
    // Try multiple ways to get session and user IDs
    const sessionId = session?.access_token || null;
    const userId = user?.id || session?.user?.id || null;
    
    // Debug logging
    console.log('🔍 Train Chatbot Session data:', { 
      hasSession: !!session, 
      hasUser: !!user, 
      sessionId: sessionId ? 'present' : 'null',
      userId: userId ? 'present' : 'null',
      sessionKeys: session ? Object.keys(session) : [],
      userKeys: user ? Object.keys(user) : []
    });

    // Use the same n8n URL for training
    const n8nWebhookUrl = getN8nApiUrl();
    console.log('Calling n8n webhook:', n8nWebhookUrl);
    console.log('Training data:', { website, action, sessionId, userId });
    // Call n8n webhook
    const response = await fetch(n8nWebhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        website,
        action,
        sessionId, // Add session ID to n8n request
        userId,    // Add user ID to n8n request
        timestamp: new Date().toISOString()
      })
    });
    // Log the N8N response for debugging
    const text = await response.text();
    let result;
    try {
      result = JSON.parse(text);
    } catch {
      result = { raw: text };
    }
    if (!response.ok) {
      console.error('N8N webhook failed:', response.status, result);
      return json({
        success: false,
        message: `AI service unavailable (code ${response.status})`,
        details: result
      }, { status: 500 });
    }
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
} 