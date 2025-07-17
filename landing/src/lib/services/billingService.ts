// billingService: Handles Stripe billing portal API calls

export async function openBillingPortal() {
  const res = await fetch('/api/billing/portal', { method: 'POST' });
  if (!res.ok) throw new Error('Failed to open billing portal');
  return await res.json();
} 