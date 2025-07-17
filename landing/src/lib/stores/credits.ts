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
    totalCredits: 100,
    remainingCredits: 85,
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
        // TODO: Replace with actual API call
        // const response = await fetch('/api/credits');
        // const data = await response.json();
        
        // Mock data for now
        const mockData = {
          totalCredits: 100,
          remainingCredits: 85,
          usageHistory: [
            {
              id: '1',
              feature: 'Chatbot Demo',
              creditsUsed: 5,
              timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
              description: 'Used AI chat demo'
            },
            {
              id: '2',
              feature: 'Data Insights Demo',
              creditsUsed: 10,
              timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
              description: 'Analyzed sample data'
            },
            {
              id: '3',
              feature: 'Daily Task Demo',
              creditsUsed: 3,
              timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
              description: 'Created task automation'
            }
          ]
        };
        
        set({
          totalCredits: mockData.totalCredits,
          remainingCredits: mockData.remainingCredits,
          usageHistory: mockData.usageHistory,
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
      
      // TODO: Send usage to API
      // await fetch('/api/credits/use', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ feature, creditsUsed: creditsToUse, description })
      // });
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
        totalCredits: 100,
        remainingCredits: 85,
        usageHistory: [],
        isLoading: false,
        error: null
      });
    }
  };
}

export const credits = createCreditsStore(); 