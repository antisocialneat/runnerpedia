'use server';

import { createServerSupabaseClient } from '@/lib/supabase-server';
import { redirect } from 'next/navigation';

/**
 * Server action to get the current user's session
 * @returns The user session if authenticated, otherwise null
 */
export async function getSessionAction() {
  const supabase = await createServerSupabaseClient();
  const { data: { session } } = await supabase.auth.getSession();
  return session;
}

/**
 * Server action to handle OAuth callback and create/update runner profile
 * This ensures data insertion happens securely on the server
 * @param userId - The user's ID from Supabase Auth
 */
export async function handleOAuthCallback(userId: string) {
  if (!userId) {
    console.error('handleOAuthCallback: userId is empty or null');
    return;
  }
  
  try {
    console.log('handleOAuthCallback: Starting for user ID', userId);
    
    const supabase = await createServerSupabaseClient();
    
    // Get user data
    const { data: userData, error: userError } = await supabase.auth.getUser();
    
    if (userError) {
      console.error('handleOAuthCallback: Error getting user data', userError);
      return;
    }
    
    if (!userData?.user) {
      console.error('handleOAuthCallback: User not found');
      return;
    }
    
    console.log('handleOAuthCallback: User data retrieved successfully', userData.user);
    
    // Check if user exists in runners table with explicit check for no data
    const { data: runnerData, error: runnerError } = await supabase
      .from('runners')
      .select('id')
      .eq('user_id', userId)
      .maybeSingle();
    
    if (runnerError) {
      console.error('handleOAuthCallback: Error checking runner existence', runnerError);
      return;
    }
    
    // If runner doesn't exist, create a new record
    if (!runnerData) {
      console.log('handleOAuthCallback: Runner not found, creating new record');
      
      // Prepare runner data with explicit type conversion
      const runnerToInsert = {
        user_id: userId,
        name: userData.user.user_metadata.full_name || userData.user.email?.split('@')[0] || 'Runner',
        profile_photo: userData.user.user_metadata.avatar_url || '',
        created_at: new Date().toISOString()
      };
      
      console.log('handleOAuthCallback: Runner data to insert', runnerToInsert);
      
      // Try direct RPC call as an alternative approach
      const { error: insertError } = await supabase
        .from('runners')
        .insert(runnerToInsert);
      
      if (insertError) {
        console.error('handleOAuthCallback: Error creating runner profile', insertError);
        
        // Fallback to service role if available (this requires a server environment variable)
        if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
          console.log('handleOAuthCallback: Attempting insert with service role');
          const adminSupabase = await createServerSupabaseClient();
          
          const { error: serviceRoleError } = await adminSupabase
            .from('runners')
            .insert(runnerToInsert);
            
          if (serviceRoleError) {
            console.error('handleOAuthCallback: Service role insert also failed', serviceRoleError);
            return;
          } else {
            console.log('handleOAuthCallback: Runner profile created with service role');
          }
        } else {
          return;
        }
      } else {
        console.log('handleOAuthCallback: Runner profile created successfully');
      }
    } else {
      console.log('handleOAuthCallback: Runner profile already exists', runnerData);
    }
    
    // Verify the runner was created
    const { data: verifyRunner } = await supabase
      .from('runners')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();
      
    if (verifyRunner) {
      console.log('handleOAuthCallback: Verified runner exists', verifyRunner);
    } else {
      console.log('handleOAuthCallback: WARNING - Could not verify runner creation');
    }
    
    console.log('handleOAuthCallback: Completed successfully');
  } catch (error) {
    console.error('handleOAuthCallback: Unexpected error', error);
  }
  
  // Server action completes without redirect - the callback route will handle redirection
}

/**
 * Signs out the user
 */
export async function signOut() {
  const supabase = await createServerSupabaseClient();
  await supabase.auth.signOut();
  redirect('/login');
} 