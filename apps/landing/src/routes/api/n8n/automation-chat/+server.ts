import { json } from '@sveltejs/kit';

const AUTOMATION_WEBHOOK_URL = 'https://n8n.ednsy.com/webhook/2d689383-2a6f-4c6d-b60b-d369eacbc45e/chat-automation';

export async function POST({ request, locals }) {
  try {
    const body = await request.json();
    // Validate request body
    if (!body || typeof body !== 'object') {
      return json({ error: 'Invalid request body' }, { status: 400 });
    }
    
    // Get session and user data from server context
    const { session, user } = await locals.safeGetSession();
    
    // Try multiple ways to get session and user IDs
    const sessionId = session?.access_token || null;
    const userId = user?.id || session?.user?.id || null;
    
    // Debug logging
    console.log('🔍 Automation Session data:', { 
      hasSession: !!session, 
      hasUser: !!user, 
      sessionId: sessionId ? 'present' : 'null',
      userId: userId ? 'present' : 'null',
      sessionKeys: session ? Object.keys(session) : [],
      userKeys: user ? Object.keys(user) : []
    });
    
    const response = await fetch(AUTOMATION_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'n8n': 'EDNSY'
      },
      body: JSON.stringify({
        ...body,
        sessionId, // Add session ID to n8n request
        userId     // Add user ID to n8n request
      })
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
      console.error('N8N automation webhook failed:', response.status, result);
      return json({
        success: false,
        message: `Automation service unavailable (code ${response.status})`,
        details: result
      }, { status: 500 });
    }
    
    // Return the real N8N response to the frontend
    return json(result);
  } catch (error) {
    console.error('Error in n8n automation API:', error);
    return json({ 
      error: 'Failed to process request', 
      details: error instanceof Error ? error.message : error 
    }, { status: 500 });
  }
} 