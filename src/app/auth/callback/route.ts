import { createServerSupabaseClient } from '@/lib/supabase-server';
import { handleOAuthCallback } from '@/app/actions/auth';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');

  try {
    if (!code) {
      console.error('Auth callback: No code parameter provided');
      return NextResponse.redirect(new URL('/login?error=missing_code', request.url));
    }

    const supabase = await createServerSupabaseClient();
    
    // Exchange the code for a session
    const { error: sessionError } = await supabase.auth.exchangeCodeForSession(code);
    
    if (sessionError) {
      console.error('Auth callback: Session exchange error', sessionError);
      return NextResponse.redirect(new URL('/login?error=session_exchange', request.url));
    }

    // Check if user exists in the database (profiles table)
    const { data: user, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user?.user) {
      console.error('Auth callback: Failed to get user', userError);
      return NextResponse.redirect(new URL('/login?error=user_fetch', request.url));
    }
    
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.user.id)
        .single();
      
      // If profile doesn't exist, create one
      if (!profile) {
        const { error } = await supabase
          .from('profiles')
          .insert([
            { 
              id: user.user.id,
              email: user.user.email,
              full_name: user.user.user_metadata.full_name || '',
              avatar_url: user.user.user_metadata.avatar_url || '',
              created_at: new Date().toISOString()
            },
          ]);
        
        if (error) {
          console.error('Error creating profile:', error);
        }
      }
      
      // Use the server action to handle creating a runner record
      await handleOAuthCallback(user.user.id);
      
      // Verify the runner was created
      const { data: runnerCheck } = await supabase
        .from('runners')
        .select('id')
        .eq('user_id', user.user.id)
        .maybeSingle();
      
      // If the runner still doesn't exist, try the API endpoint as a fallback
      if (!runnerCheck) {
        console.log('Auth callback: Runner not created by server action, trying API endpoint');
        
        // Call our API endpoint directly
        const apiUrl = new URL('/api/runners/create', request.url);
        const apiResponse = await fetch(apiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            // Pass the auth cookie
            'Cookie': request.headers.get('cookie') || ''
          }
        });
        
        if (!apiResponse.ok) {
          console.error('Auth callback: API endpoint failed to create runner', 
            await apiResponse.text());
        } else {
          console.log('Auth callback: Runner created via API endpoint');
        }
      }
      
      // Log successful completion
      console.log('Auth callback completed successfully for user:', user.user.id);
    } catch (profileError) {
      console.error('Auth callback: Error in profile/runner creation:', profileError);
      // Continue with redirect even if profile creation fails
    }

    // Redirect to the home page
    return NextResponse.redirect(new URL('/', request.url));
  } catch (error) {
    console.error('Auth callback: Unexpected error:', error);
    return NextResponse.redirect(new URL('/login?error=unexpected', request.url));
  }
} 