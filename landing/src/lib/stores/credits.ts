import { writable } from 'svelte/store';

export interface CreditUsage {
  id: string;
  feature: string;
  creditsUsed: number;
  timestamp: Date;
  description: string;
}

export interface CreditsState {
  totalCredits: number;
  remainingCredits: number;
  usageHistory: CreditUsage[];
  isLoading: boolean;
  error: string | null;
}

function createCreditsStore() {
  const { subscribe, set, update } = writable<CreditsState>({
    totalCredits: 0,
    remainingCredits: 0,
    usageHistory: [],
    isLoading: false,
    error: null
  });

  return {
    subscribe,
    
    // Fetch credits from API
    async fetchCredits() {
      update(state => ({ ...state, isLoading: true, error: null }));
      
      try {
        const response = await fetch('http://localhost:5235/user/credits', {
          credentials: 'include'
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch credits');
        }
        
        const data = await response.json();
        
        set({
          totalCredits: data.totalCredits || 0,
          remainingCredits: data.remainingCredits || 0,
          usageHistory: data.usageHistory || [],
          isLoading: false,
          error: null
        });
      } catch (error) {
        update(state => ({
          ...state,
          isLoading: false,
          error: error instanceof Error ? error.message : 'Failed to fetch credits'
        }));
      }
    },
    
    // Deduct credits for feature usage
    async useCredits(feature: string, creditsToUse: number, description: string) {
      update(state => {
        if (state.remainingCredits < creditsToUse) {
          return {
            ...state,
            error: 'Insufficient credits'
          };
        }
        
        const newUsage: CreditUsage = {
          id: Date.now().toString(),
          feature,
          creditsUsed: creditsToUse,
          timestamp: new Date(),
          description
        };
        
        return {
          ...state,
          remainingCredits: state.remainingCredits - creditsToUse,
          usageHistory: [newUsage, ...state.usageHistory],
          error: null
        };
      });
      
      // Send usage to API
      try {
        await fetch('http://localhost:5235/user/credits/use', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ feature, creditsUsed: creditsToUse, description })
        });
      } catch (error) {
        console.error('Failed to record credit usage:', error);
      }
    },
    
    // Check if user has enough credits
    hasEnoughCredits(requiredCredits: number): boolean {
      let currentState: CreditsState;
      subscribe(state => { currentState = state; })();
      return currentState.remainingCredits >= requiredCredits;
    },
    
    // Get low credit warning
    getLowCreditWarning(): string | null {
      let currentState: CreditsState;
      subscribe(state => { currentState = state; })();
      
      if (currentState.remainingCredits <= 10) {
        return 'Low credits remaining. Consider upgrading your account.';
      } else if (currentState.remainingCredits <= 25) {
        return 'Credits running low.';
      }
      
      return null;
    },
    
    // Reset store
    reset() {
      set({
        totalCredits: 0,
        remainingCredits: 0,
        usageHistory: [],
        isLoading: false,
        error: null
      });
    }
  };
}

export const credits = createCreditsStore(); 