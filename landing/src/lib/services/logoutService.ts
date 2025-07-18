// logoutService: Handles user logout functionality
import { clearUser } from '$lib/stores/user';

export async function logout(redirectTo: string = '/') {
  // Clear user store
  clearUser();
  
  // Small delay to show loading state
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Clear JWT cookie and redirect via server endpoint
  const redirectParam = redirectTo !== '/' ? `?redirect=${redirectTo}` : '';
  window.location.href = `/logout${redirectParam}`;
} 