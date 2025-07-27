import { supabase } from '$lib/supabase';

export interface UserCredits {
  demo_credits: number;
  total_demos_completed: number;
}

export interface ServiceInfo {
  id: string;
  title: string;
  training_cost: number;
  response_cost: number;
  action_cost: number;
  estimated_time: number;
  difficulty: string;
  benefits: string[];
}

export type ActionType = 'training' | 'response' | 'sms' | 'email';

export class CreditService {
  // Get user's current credit balance
  static async getUserCredits(): Promise<UserCredits | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      // First check if user exists in demo.users table
      const { data, error } = await supabase
        .schema('demo')
        .from('users')
        .select('demo_credits, total_demos_completed')
        .eq('id', user.id)
        .single();

      if (error && error.code === 'PGRST116') {
        // User doesn't exist in demo.users table, create them with initial credits
        console.log('User not found in demo.users table, creating user record with 200 credits...');
        const { data: newUser, error: createError } = await supabase
          .schema('demo')
          .from('users')
          .insert({
            id: user.id,
            email: user.email,
            demo_credits: 200,
            total_demos_completed: 0
          })
          .select('demo_credits, total_demos_completed')
          .single();

        if (createError) {
          console.error('Error creating user record:', createError);
          return null;
        }

        console.log('User created successfully with 200 credits');
        return newUser;
      } else if (error) {
        console.error('Error fetching user credits:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in getUserCredits:', error);
      return null;
    }
  }

  // Get service information including credit costs
  static async getServiceInfo(serviceId: string): Promise<ServiceInfo | null> {
    try {
      const { data, error } = await supabase
        .schema('demo')
        .from('services')
        .select('*')
        .eq('id', serviceId)
        .single();

      if (error) {
        console.error('Error fetching service info:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in getServiceInfo:', error);
      return null;
    }
  }

  // Check if user has enough credits for training a service
  static async canStartTraining(serviceId: string): Promise<{ canStart: boolean; userCredits: number; trainingCost: number }> {
    try {
      const [userCredits, serviceInfo] = await Promise.all([
        this.getUserCredits(),
        this.getServiceInfo(serviceId)
      ]);

      if (!userCredits) {
        return { canStart: false, userCredits: 0, trainingCost: 0 };
      }

      // If service info is not found, use default costs based on service ID
      let trainingCost = 0;
      if (!serviceInfo) {
        console.log('Service info not found in canStartTraining, using default costs');
        // Default costs based on service ID
        const defaultCosts: Record<string, number> = {
          'ai-assistant': 5,
          'automation-tasks': 7,
          'data-insights': 10,
          'business-operations': 15
        };
        
        trainingCost = defaultCosts[serviceId] || 0;
      } else {
        trainingCost = serviceInfo.training_cost;
      }

      return {
        canStart: userCredits.demo_credits >= trainingCost,
        userCredits: userCredits.demo_credits,
        trainingCost: trainingCost
      };
    } catch (error) {
      console.error('Error in canStartTraining:', error);
      return { canStart: false, userCredits: 0, trainingCost: 0 };
    }
  }

  // Check if user has enough credits for a specific action
  static async canPerformAction(serviceId: string, actionType: ActionType): Promise<{ canPerform: boolean; userCredits: number; actionCost: number }> {
    try {
      const [userCredits, serviceInfo] = await Promise.all([
        this.getUserCredits(),
        this.getServiceInfo(serviceId)
      ]);

      if (!userCredits) {
        return { canPerform: false, userCredits: 0, actionCost: 0 };
      }

      // If service info is not found, use default costs based on service ID
      let actionCost = 0;
      if (!serviceInfo) {
        // Default costs based on service ID
        const defaultCosts: Record<string, { training: number; response: number }> = {
          'ai-assistant': { training: 5, response: 1 },
          'automation-tasks': { training: 7, response: 1 },
          'data-insights': { training: 10, response: 1 },
          'business-operations': { training: 15, response: 1 }
        };
        
        const defaultCost = defaultCosts[serviceId];
        if (defaultCost) {
          actionCost = actionType === 'training' ? defaultCost.training : defaultCost.response;
        }
      } else {
        switch (actionType) {
          case 'training':
            actionCost = serviceInfo.training_cost;
            break;
          case 'response':
            actionCost = serviceInfo.response_cost;
            break;
          case 'sms':
            actionCost = serviceInfo.action_cost;
            break;
          case 'email':
            actionCost = serviceInfo.action_cost;
            break;
          default:
            actionCost = 0;
        }
      }

      return {
        canPerform: userCredits.demo_credits >= actionCost,
        userCredits: userCredits.demo_credits,
        actionCost
      };
    } catch (error) {
      console.error('Error in canPerformAction:', error);
      return { canPerform: false, userCredits: 0, actionCost: 0 };
    }
  }

  // Start a demo session and deduct training credits
  static async startDemoSession(serviceId: string): Promise<{ success: boolean; sessionId?: string; error?: string }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return { success: false, error: 'User not authenticated' };
      }

      // Check if user can start training
      const { canStart, userCredits, trainingCost } = await this.canStartTraining(serviceId);
      if (!canStart) {
        return { 
          success: false, 
          error: `Insufficient credits. You have ${userCredits} credits, but training costs ${trainingCost} credits.` 
        };
      }

      // Get current user credits for update
      const currentCredits = await this.getUserCredits();
      if (!currentCredits) {
        return { success: false, error: 'Failed to get user credits' };
      }

      // Create demo session
      const { data: sessionData, error: sessionError } = await supabase
        .schema('demo')
        .from('sessions')
        .insert({
          user_id: user.id,
          service_id: serviceId,
          credits_used: trainingCost,
          progress_data: {}
        })
        .select('id')
        .single();

      if (sessionError) {
        console.error('Error creating demo session:', sessionError);
        return { success: false, error: 'Failed to create demo session' };
      }

      // Deduct training credits from user
      const { error: updateError } = await supabase
        .schema('demo')
        .from('users')
        .update({ 
          demo_credits: currentCredits.demo_credits - trainingCost,
          total_demos_completed: currentCredits.total_demos_completed + 1
        })
        .eq('id', user.id);

      if (updateError) {
        console.error('Error updating user credits:', updateError);
        return { success: false, error: 'Failed to update credits' };
      }

      // Record training credit usage
      const { error: usageError } = await supabase
        .schema('demo')
        .from('credit_usage')
        .insert({
          session_id: sessionData.id,
          user_id: user.id,
          service_id: serviceId,
          action_type: 'training',
          credits_used: trainingCost
        });

      if (usageError) {
        console.error('Error recording credit usage:', usageError);
        // Don't fail the session creation for this error
      }

      return { success: true, sessionId: sessionData.id };
    } catch (error) {
      console.error('Error in startDemoSession:', error);
      return { success: false, error: 'An unexpected error occurred' };
    }
  }

  // Deduct credits for a specific action
  static async deductCreditsForAction(sessionId: string, serviceId: string, actionType: ActionType): Promise<{ success: boolean; error?: string }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return { success: false, error: 'User not authenticated' };
      }

      // Check if user can perform the action
      const { canPerform, userCredits, actionCost } = await this.canPerformAction(serviceId, actionType);
      if (!canPerform) {
        return { 
          success: false, 
          error: `Insufficient credits. You have ${userCredits} credits, but this action costs ${actionCost} credits.` 
        };
      }

      // Deduct credits from user
      const { error: updateError } = await supabase
        .schema('demo')
        .from('users')
        .update({ 
          demo_credits: userCredits - actionCost
        })
        .eq('id', user.id);

      if (updateError) {
        console.error('Error updating user credits:', updateError);
        return { success: false, error: 'Failed to update credits' };
      }

      // Record credit usage
      const { error: usageError } = await supabase
        .schema('demo')
        .from('credit_usage')
        .insert({
          session_id: sessionId,
          user_id: user.id,
          service_id: serviceId,
          action_type: actionType,
          credits_used: actionCost
        });

      if (usageError) {
        console.error('Error recording credit usage:', usageError);
        return { success: false, error: 'Failed to record credit usage' };
      }

      return { success: true };
    } catch (error) {
      console.error('Error in deductCreditsForAction:', error);
      return { success: false, error: 'An unexpected error occurred' };
    }
  }

  // Complete a demo session
  static async completeDemoSession(sessionId: string, progressData: any = {}): Promise<{ success: boolean; error?: string }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return { success: false, error: 'User not authenticated' };
      }

      const { error } = await supabase
        .schema('demo')
        .from('sessions')
        .update({
          completed_at: new Date().toISOString(),
          progress_data: progressData
        })
        .eq('id', sessionId)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error completing demo session:', error);
        return { success: false, error: 'Failed to complete demo session' };
      }

      return { success: true };
    } catch (error) {
      console.error('Error in completeDemoSession:', error);
      return { success: false, error: 'An unexpected error occurred' };
    }
  }

  // Get user's demo history
  static async getDemoHistory(): Promise<any[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .schema('demo')
        .from('sessions')
        .select(`
          *,
          services (
            title,
            description,
            industry
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching demo history:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in getDemoHistory:', error);
      return [];
    }
  }

  // Get credit usage history for a session
  static async getSessionCreditUsage(sessionId: string): Promise<any[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .schema('demo')
        .from('credit_usage')
        .select('*')
        .eq('session_id', sessionId)
        .eq('user_id', user.id)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching credit usage:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in getSessionCreditUsage:', error);
      return [];
    }
  }

  // Add credits to user (for admin purposes or rewards)
  static async addCredits(amount: number): Promise<{ success: boolean; error?: string }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return { success: false, error: 'User not authenticated' };
      }

      // First get current credits
      const { data: currentUser } = await supabase
        .schema('demo')
        .from('users')
        .select('demo_credits')
        .eq('id', user.id)
        .single();

      if (!currentUser) {
        return { success: false, error: 'User not found' };
      }

      const { error } = await supabase
        .schema('demo')
        .from('users')
        .update({ 
          demo_credits: currentUser.demo_credits + amount
        })
        .eq('id', user.id);

      if (error) {
        console.error('Error adding credits:', error);
        return { success: false, error: 'Failed to add credits' };
      }

      return { success: true };
    } catch (error) {
      console.error('Error in addCredits:', error);
      return { success: false, error: 'An unexpected error occurred' };
    }
  }
} 