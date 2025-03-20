'use client';

import { useState, useEffect } from 'react';
import { createBrowserSupabaseClient } from '@/lib/supabase-client';
import { useRouter } from 'next/navigation';
import Script from 'next/script';

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Define the callback function in the global scope
    window.handleSignInWithGoogle = async (response: any) => {
      try {
        setLoading(true);
        setError(null);

        const supabase = createBrowserSupabaseClient();
        // Remove the nonce parameter since we're using Google's built-in security
        const { data, error } = await supabase.auth.signInWithIdToken({
          provider: 'google',
          token: response.credential,
        });

        if (error) throw error;
        
        // Redirect to home page on successful login
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

      <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-4">
        <div className="w-full max-w-md space-y-8 rounded-lg bg-white p-6 shadow-md">
          <div className="text-center">
            <h1 className="mt-6 text-3xl font-bold tracking-tight text-gray-900">Welcome to RunnerPedia</h1>
            <p className="mt-2 text-sm text-gray-600">
              Sign in or register with your Google account
            </p>
          </div>

          {error && (
            <div className="rounded-md bg-red-50 p-4">
              <div className="flex">
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">Authentication Error</h3>
                  <div className="mt-2 text-sm text-red-700">{error}</div>
                </div>
              </div>
            </div>
          )}

          <div className="mt-8">
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