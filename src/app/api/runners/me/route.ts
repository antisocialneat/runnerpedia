import { createServerSupabaseClient } from '@/lib/supabase-server';
import { NextResponse } from 'next/server';

/**
 * GET /api/runners/me
 * 
 * Returns the currently authenticated user's runner profile
 * Useful for testing if the Google OAuth login correctly inserted data
 */
export async function GET() {
  const supabase = await createServerSupabaseClient();
  
  // Get current session
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) {
    return NextResponse.json(
      { error: 'Unauthorized - Not logged in' },
      { status: 401 }
    );
  }
  
  // Get runner profile for the authenticated user
  const { data: runnerProfile, error } = await supabase
    .from('runners')
    .select('*')
    .eq('user_id', session.user.id)
    .single();
  
  if (error) {
    console.error('Error fetching runner profile:', error);
    return NextResponse.json(
      { error: 'Failed to fetch runner profile' },
      { status: 500 }
    );
  }
  
  // Return the runner profile
  return NextResponse.json({
    success: true,
    data: runnerProfile
  });
} 