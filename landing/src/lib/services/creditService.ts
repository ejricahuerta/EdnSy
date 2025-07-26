import { supabase } from '$lib/supabase';

export interface UserCredits {
  demo_credits: number;
  total_demos_completed: number;
}

export interface DemoInfo {
  id: string;
  title: string;
  credit_cost: number;
  estimated_time: number;
  difficulty: string;
  benefits: string[];
}

export class CreditService {
  // Get user's current credit balance
  static async getUserCredits(): Promise<UserCredits | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data, error } = await supabase
        .from('users')
        .select('demo_credits, total_demos_completed')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('Error fetching user credits:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in getUserCredits:', error);
      return null;
    }
  }

  // Get demo information including credit cost
  static async getDemoInfo(demoId: string): Promise<DemoInfo | null> {
    try {
      const { data, error } = await supabase
        .from('demos')
        .select('*')
        .eq('id', demoId)
        .single();

      if (error) {
        console.error('Error fetching demo info:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in getDemoInfo:', error);
      return null;
    }
  }

  // Check if user has enough credits for a demo
  static async canStartDemo(demoId: string): Promise<{ canStart: boolean; userCredits: number; demoCost: number }> {
    try {
      const [userCredits, demoInfo] = await Promise.all([
        this.getUserCredits(),
        this.getDemoInfo(demoId)
      ]);

      if (!userCredits || !demoInfo) {
        return { canStart: false, userCredits: 0, demoCost: 0 };
      }

      return {
        canStart: userCredits.demo_credits >= demoInfo.credit_cost,
        userCredits: userCredits.demo_credits,
        demoCost: demoInfo.credit_cost
      };
    } catch (error) {
      console.error('Error in canStartDemo:', error);
      return { canStart: false, userCredits: 0, demoCost: 0 };
    }
  }

  // Start a demo session and deduct credits
  static async startDemoSession(demoId: string): Promise<{ success: boolean; sessionId?: string; error?: string }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return { success: false, error: 'User not authenticated' };
      }

      // Check if user can start the demo
      const { canStart, userCredits, demoCost } = await this.canStartDemo(demoId);
      if (!canStart) {
        return { 
          success: false, 
          error: `Insufficient credits. You have ${userCredits} credits, but this demo costs ${demoCost} credits.` 
        };
      }

      // Get current user credits for update
      const currentCredits = await this.getUserCredits();
      if (!currentCredits) {
        return { success: false, error: 'Failed to get user credits' };
      }

      // Create demo session
      const { data: sessionData, error: sessionError } = await supabase
        .from('demo_sessions')
        .insert({
          user_id: user.id,
          demo_id: demoId,
          credits_used: demoCost,
          progress_data: {}
        })
        .select('id')
        .single();

      if (sessionError) {
        console.error('Error creating demo session:', sessionError);
        return { success: false, error: 'Failed to create demo session' };
      }

      // Deduct credits from user
      const { error: updateError } = await supabase
        .from('users')
        .update({ 
          demo_credits: currentCredits.demo_credits - demoCost,
          total_demos_completed: currentCredits.total_demos_completed + 1
        })
        .eq('id', user.id);

      if (updateError) {
        console.error('Error updating user credits:', updateError);
        return { success: false, error: 'Failed to update credits' };
      }

      return { success: true, sessionId: sessionData.id };
    } catch (error) {
      console.error('Error in startDemoSession:', error);
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
        .from('demo_sessions')
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
        .from('demo_sessions')
        .select(`
          *,
          demos (
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

  // Add credits to user (for admin purposes or rewards)
  static async addCredits(amount: number): Promise<{ success: boolean; error?: string }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return { success: false, error: 'User not authenticated' };
      }

      // First get current credits
      const { data: currentUser } = await supabase
        .from('users')
        .select('demo_credits')
        .eq('id', user.id)
        .single();

      if (!currentUser) {
        return { success: false, error: 'User not found' };
      }

      const { error } = await supabase
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