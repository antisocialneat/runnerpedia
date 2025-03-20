import { createServerSupabaseClient } from '@/lib/supabase-server';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');

  if (code) {
    const supabase = await createServerSupabaseClient();
    
    // Exchange the code for a session
    await supabase.auth.exchangeCodeForSession(code);

    // Check if user exists in the database (profiles table)
    const { data: user } = await supabase.auth.getUser();
    
    if (user?.user) {
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
    }
  }

  // Redirect to the home page
  return NextResponse.redirect(new URL('/', request.url));
} 