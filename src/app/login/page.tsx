'use client';

import { useState, useEffect } from 'react';
import { createBrowserSupabaseClient } from '@/lib/supabase-client';
import { useRouter, useSearchParams } from 'next/navigation';
import Script from 'next/script';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Handle error URL parameter
  useEffect(() => {
    const errorParam = searchParams.get('error');
    if (errorParam) {
      const errorMessages: Record<string, string> = {
        'missing_code': 'Authentication failed: Missing authorization code',
        'session_exchange': 'Could not complete authentication with Google',
        'user_fetch': 'Failed to retrieve user information',
        'unexpected': 'An unexpected error occurred during authentication'
      };
      
      setError(errorMessages[errorParam] || 'Authentication error occurred');
    }
  }, [searchParams]);

  // Function to ensure runner profile exists
  const ensureRunnerProfile = async (supabase: any, userId: string) => {
    try {
      // Check if runner profile exists
      const { data: runner } = await supabase
        .from('runners')
        .select('id')
        .eq('user_id', userId)
        .maybeSingle();
      
      if (!runner) {
        console.log('Client-side: Runner profile not found, creating one...');
        
        // Get user data
        const { data: userData } = await supabase.auth.getUser();
        
        if (!userData?.user) {
          console.error('Client-side: User data not available');
          return;
        }
        
        // Create runner profile
        const { error: insertError } = await supabase
          .from('runners')
          .insert({
            user_id: userId,
            name: userData.user.user_metadata.full_name || userData.user.email?.split('@')[0] || 'Runner',
            profile_photo: userData.user.user_metadata.avatar_url || '',
            created_at: new Date().toISOString()
          });
        
        if (insertError) {
          console.error('Client-side: Failed to create runner profile', insertError);
          
          // Try API endpoint as last resort
          const response = await fetch('/api/runners/create', {
            method: 'POST'
          });
          
          if (!response.ok) {
            console.error('Client-side: API endpoint also failed');
          } else {
            console.log('Client-side: Runner created via API endpoint');
          }
        } else {
          console.log('Client-side: Runner profile created successfully');
        }
      } else {
        console.log('Client-side: Runner profile already exists');
      }
    } catch (error) {
      console.error('Client-side: Error ensuring runner profile', error);
    }
  };

  useEffect(() => {
    // Define the callback function in the global scope
    window.handleSignInWithGoogle = async (response: any) => {
      try {
        setLoading(true);
        setError(null);

        const supabase = createBrowserSupabaseClient();
        // Use Google's IdToken for authentication
        const { data, error } = await supabase.auth.signInWithIdToken({
          provider: 'google',
          token: response.credential,
        });

        if (error) throw error;
        
        // Ensure runner profile exists (client-side fallback)
        if (data?.user) {
          await ensureRunnerProfile(supabase, data.user.id);
        }
        
        // The redirect will happen automatically via the auth callback handler
        // But we'll also redirect here for immediate feedback
        router.push('/');
      } catch (err: any) {
        setError(err.message || 'An error occurred during sign in');
        console.error('Error during Google login:', err);
      } finally {
        setLoading(false);
      }
    };

    // Initialize Google One Tap
    const initializeGoogleOneTap = () => {
      // Check if the Google API is loaded
      if (window.google && window.google.accounts) {
        window.google.accounts.id.initialize({
          client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!,
          callback: window.handleSignInWithGoogle,
          auto_select: true,
          use_fedcm_for_prompt: true // For Chrome's third-party cookie phase-out
        });
        
        window.google.accounts.id.prompt();
      }
    };

    // Initialize once the script is loaded
    if (document.readyState === 'complete') {
      initializeGoogleOneTap();
    } else {
      window.addEventListener('load', initializeGoogleOneTap);
      return () => window.removeEventListener('load', initializeGoogleOneTap);
    }
  }, [router]);

  return (
    <>
      <Script
        src="https://accounts.google.com/gsi/client"
        strategy="afterInteractive"
        onLoad={() => {
          if (window.google && window.google.accounts) {
            window.google.accounts.id.prompt();
          }
        }}
      />

      <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-slate-50 to-slate-100 px-4">
        <div className="w-full max-w-md space-y-8 rounded-xl bg-white p-8 shadow-lg">
          <div className="text-center">
            <h1 className="mt-4 text-3xl font-bold tracking-tight text-gray-900">Welcome to RunnerPedia</h1>
            <p className="mt-2 text-sm text-gray-600">
              Join our running community by signing in with your Google account
            </p>
          </div>

          {error && (
            <div className="rounded-lg bg-red-50 p-4 border border-red-200">
              <div className="flex">
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">Authentication Error</h3>
                  <div className="mt-2 text-sm text-red-700">{error}</div>
                </div>
              </div>
            </div>
          )}

          <div className="mt-8 flex flex-col items-center">
            {loading ? (
              <div className="flex flex-col items-center justify-center gap-2">
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600"></div>
                <p className="text-sm text-gray-500">Signing you in...</p>
              </div>
            ) : (
              <>
                {/* Google One Tap will display automatically, but we'll add a button as fallback */}
                <div 
                  id="g_id_onload"
                  data-client_id={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID}
                  data-context="signin"
                  data-ux_mode="popup"
                  data-callback="handleSignInWithGoogle"
                  data-auto_select="true"
                  data-itp_support="true"
                ></div>
                <div
                  className="g_id_signin"
                  data-type="standard"
                  data-shape="pill"
                  data-theme="outline"
                  data-text="signin_with"
                  data-size="large"
                  data-logo_alignment="left"
                ></div>
              </>
            )}
            
            <p className="mt-8 text-center text-xs text-gray-500">
              By signing in, you&apos;ll join our community of runners and gain access to all features
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

// Add TypeScript interfaces for window
declare global {
  interface Window {
    google: any;
    handleSignInWithGoogle: (response: any) => Promise<void>;
  }
} 