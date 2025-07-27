import { json } from '@sveltejs/kit';
import { N8N_DEMO_CHAT_API_URL } from '$env/static/private';

// Validate environment variables
if (!N8N_DEMO_CHAT_API_URL) {
  console.error('❌ Missing required N8N environment variable: N8N_DEMO_CHAT_API_URL');
  if (import.meta.env.PROD) {
    throw new Error('Missing required N8N environment variable');
  }
}

export async function POST({ request, locals }) {
  try {
    const body = await request.json();
    // Validate request body
    if (!body || typeof body !== 'object') {
      return json({ error: 'Invalid request body' }, { status: 400 });
    }
    
    // Get session and user data from server context
    const { session, user } = await locals.safeGetSession();
    
    // Also try getting session directly from supabase client
    const { data: { session: directSession } } = await locals.supabase.auth.getSession();
    const { data: { user: directUser } } = await locals.supabase.auth.getUser();
    
    // Try multiple ways to get session and user IDs
    const sessionId = session?.access_token || directSession?.access_token || null;
    const userId = user?.id || directUser?.id || session?.user?.id || directSession?.user?.id || null;
    
    // Debug logging
    console.log('🔍 Session data:', { 
      hasSession: !!session, 
      hasUser: !!user,
      hasDirectSession: !!directSession,
      hasDirectUser: !!directUser,
      sessionId: sessionId ? 'present' : 'null',
      userId: userId ? 'present' : 'null',
      sessionKeys: session ? Object.keys(session) : [],
      userKeys: user ? Object.keys(user) : [],
      sessionAccessToken: session?.access_token ? 'present' : 'null',
      userEmail: user?.email || 'null',
      sessionUser: session?.user?.id || 'null'
    });
    
    // Try alternative ways to get session ID
    const alternativeSessionId = session?.access_token || session?.user?.id || user?.id || null;
    console.log('🔍 Alternative session ID:', alternativeSessionId);
    
    // Log the full session and user objects for debugging
    console.log('🔍 Full session object:', JSON.stringify(session, null, 2));
    console.log('🔍 Full user object:', JSON.stringify(user, null, 2));
    console.log('🔍 Full direct session object:', JSON.stringify(directSession, null, 2));
    console.log('🔍 Full direct user object:', JSON.stringify(directUser, null, 2));
    
    const response = await fetch(N8N_DEMO_CHAT_API_URL, {
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