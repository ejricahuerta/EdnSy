import { json } from '@sveltejs/kit';

const AUTOMATION_WEBHOOK_URL = 'https://n8n.ednsy.com/webhook/2d689383-2a6f-4c6d-b60b-d369eacbc45e/chat-automation';

export async function POST({ request, locals }) {
  try {
    const { website, emailAddress, phone, action } = await request.json();
    
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
    console.log('🔍 Train Automation Session data:', { 
      hasSession: !!session, 
      hasUser: !!user, 
      sessionId: sessionId ? 'present' : 'null',
      userId: userId ? 'present' : 'null',
      sessionKeys: session ? Object.keys(session) : [],
      userKeys: user ? Object.keys(user) : []
    });
    
    console.log('Calling automation n8n webhook:', AUTOMATION_WEBHOOK_URL);
    console.log('Training data:', { website, emailAddress, phone, action, sessionId, userId });
    
    // Call n8n webhook for training
    const response = await fetch(AUTOMATION_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'n8n': 'EDNSY'
      },
      body: JSON.stringify({
        website,
        emailAddress,
        phone,
        action,
        sessionId, // Add session ID to n8n request
        userId,    // Add user ID to n8n request
        timestamp: new Date().toISOString(),
        demo: 'automation-tasks'
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
      console.error('N8N automation webhook failed:', response.status, result);
      return json({
        success: false,
        message: `Automation service unavailable (code ${response.status})`,
        details: result
      }, { status: 500 });
    }
    
    return json({
      success: true,
      message: 'Automation training initiated successfully',
      data: result
    });
  } catch (error) {
    console.error('Error calling automation n8n:', error);
    return json({
      success: false,
      message: 'Failed to train automation',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 