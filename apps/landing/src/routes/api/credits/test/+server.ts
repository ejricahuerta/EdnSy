import { json } from '@sveltejs/kit';
import { supabase } from '$lib/supabase';

export async function GET() {
  try {
    const { data: services, error: servicesError } = await supabase
      .schema('demo')
      .from('services')
      .select('*');

    if (servicesError) {
      return json({
        error: 'Services table error',
        details: servicesError
      }, { status: 500 });
    }

    const { data: { user } } = await supabase.auth.getUser();
    let userCredits = null;
    let userCreated = false;

    if (user) {
      // First check if user exists in demo.users table
      const { data: existingUser, error: userCheckError } = await supabase
        .schema('demo')
        .from('users')
        .select('demo_credits, total_demos_completed')
        .eq('id', user.id)
        .single();

      if (userCheckError && userCheckError.code === 'PGRST116') {
        // User doesn't exist in demo.users table, create them
        console.log('User not found in demo.users table, creating user record...');
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
          console.error('Error creating user:', createError);
          return json({
            error: 'Failed to create user record',
            details: createError
          }, { status: 500 });
        }

        userCredits = newUser;
        userCreated = true;
        console.log('User created successfully with 200 credits');
      } else if (userCheckError) {
        console.error('Error checking user:', userCheckError);
        return json({
          error: 'Error checking user existence',
          details: userCheckError
        }, { status: 500 });
      } else {
        // User exists, get their credits
        userCredits = existingUser;
        console.log('User found with existing credits');
      }
    }

    return json({
      success: true,
      services: services || [],
      userCredits,
      user: user ? { id: user.id, email: user.email } : null,
      userCreated,
      message: userCreated ? 'User created with 200 initial credits' : 'User already exists'
    });
  } catch (error) {
    console.error('Test endpoint error:', error);
    return json({
      error: 'Test failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 