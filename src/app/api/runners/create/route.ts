import { createServerSupabaseClient } from '@/lib/supabase-server';
import { NextRequest, NextResponse } from 'next/server';

/**
 * POST /api/runners/create
 * 
 * Creates a runner profile for the authenticated user
 * Alternative method to the server action for creating runners
 */
export async function POST(request: NextRequest) {
  const supabase = await createServerSupabaseClient();
  
  // Get current session
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) {
    return NextResponse.json(
      { error: 'Unauthorized - Not logged in' },
      { status: 401 }
    );
  }
  
  try {
    // Get user info
    const { data: userData } = await supabase.auth.getUser();
    
    if (!userData?.user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }
    
    // Check if runner profile already exists
    const { data: existingRunner } = await supabase
      .from('runners')
      .select('id')
      .eq('user_id', session.user.id)
      .maybeSingle();
      
    if (existingRunner) {
      return NextResponse.json({
        success: true,
        message: 'Runner profile already exists',
        data: existingRunner
      });
    }
    
    // Prepare runner data
    const runnerData = {
      user_id: session.user.id,
      name: userData.user.user_metadata.full_name || userData.user.email?.split('@')[0] || 'Runner',
      profile_photo: userData.user.user_metadata.avatar_url || '',
      created_at: new Date().toISOString()
    };
    
    // Create runner profile
    const { data: newRunner, error } = await supabase
      .from('runners')
      .insert(runnerData)
      .select()
      .single();
      
    if (error) {
      console.error('API: Error creating runner profile:', error);
      return NextResponse.json(
        { error: 'Failed to create runner profile', details: error },
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: 'Runner profile created successfully',
      data: newRunner
    });
  } catch (error) {
    console.error('API: Unexpected error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
} 