import { createServerSupabaseClient } from './supabase-server';
import { redirect } from 'next/navigation';

/**
 * Get the current user from the session
 * If not authenticated, redirect to the login page
 */
export async function getCurrentUser() {
  const supabase = await createServerSupabaseClient();
  
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) {
    redirect('/login');
  }
  
  return session.user;
}

/**
 * Get the current session without redirecting
 */
export async function getSession() {
  const supabase = await createServerSupabaseClient();
  const { data: { session } } = await supabase.auth.getSession();
  return session;
} 