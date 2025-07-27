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
    const { action, amount, serviceId, sessionId, actionType } = await request.json();

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

      case 'check-training':
        if (!serviceId) {
          return json({ error: 'Service ID required' }, { status: 400 });
        }
        const checkTrainingResult = await CreditService.canStartTraining(serviceId);
        return json(checkTrainingResult);

      case 'check-action':
        if (!serviceId || !actionType) {
          return json({ error: 'Service ID and action type required' }, { status: 400 });
        }
        const checkActionResult = await CreditService.canPerformAction(serviceId, actionType);
        return json(checkActionResult);

      case 'start-training':
        if (!serviceId) {
          return json({ error: 'Service ID required' }, { status: 400 });
        }
        const startTrainingResult = await CreditService.startDemoSession(serviceId);
        return json(startTrainingResult);

      case 'deduct-action':
        if (!sessionId || !serviceId || !actionType) {
          return json({ error: 'Session ID, service ID, and action type required' }, { status: 400 });
        }
        const deductResult = await CreditService.deductCreditsForAction(sessionId, serviceId, actionType);
        return json(deductResult);

      case 'complete-demo':
        if (!sessionId) {
          return json({ error: 'Session ID required' }, { status: 400 });
        }
        const { progressData } = await request.json();
        const completeResult = await CreditService.completeDemoSession(sessionId, progressData);
        return json(completeResult);

      case 'get-credit-usage':
        if (!sessionId) {
          return json({ error: 'Session ID required' }, { status: 400 });
        }
        const usageResult = await CreditService.getSessionCreditUsage(sessionId);
        return json({ success: true, data: usageResult });

      default:
        return json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Error in credits API:', error);
    return json({ error: 'Internal server error' }, { status: 500 });
  }
} 