import { json } from '@sveltejs/kit';
import { CreditService } from '$lib/services/creditService';

export async function GET() {
  try {
    const credits = await CreditService.getUserCredits();
    
    if (!credits) {
      return json({ error: 'User not authenticated' }, { status: 401 });
    }

    return json(credits);
  } catch (error) {
    console.error('Error fetching credits:', error);
    return json({ error: 'Failed to fetch credits' }, { status: 500 });
  }
}

export async function POST({ request }) {
  try {
    const { action, amount, demoId } = await request.json();

    switch (action) {
      case 'add':
        if (!amount || amount <= 0) {
          return json({ error: 'Invalid amount' }, { status: 400 });
        }
        const addResult = await CreditService.addCredits(amount);
        if (!addResult.success) {
          return json({ error: addResult.error }, { status: 400 });
        }
        return json({ success: true, message: `Added ${amount} credits` });

      case 'check-demo':
        if (!demoId) {
          return json({ error: 'Demo ID required' }, { status: 400 });
        }
        const checkResult = await CreditService.canStartDemo(demoId);
        return json(checkResult);

      case 'start-demo':
        if (!demoId) {
          return json({ error: 'Demo ID required' }, { status: 400 });
        }
        const startResult = await CreditService.startDemoSession(demoId);
        return json(startResult);

      case 'complete-demo':
        const { sessionId, progressData } = await request.json();
        if (!sessionId) {
          return json({ error: 'Session ID required' }, { status: 400 });
        }
        const completeResult = await CreditService.completeDemoSession(sessionId, progressData);
        return json(completeResult);

      default:
        return json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Error in credits API:', error);
    return json({ error: 'Internal server error' }, { status: 500 });
  }
} 