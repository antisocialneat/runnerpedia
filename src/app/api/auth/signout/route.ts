import { createServerSupabaseClient } from '@/lib/supabase-server';
import { NextResponse } from 'next/server';

export async function POST() {
  const supabase = await createServerSupabaseClient();
  
  // Sign out the user
  await supabase.auth.signOut();
  
  return NextResponse.json({ success: true });
} 