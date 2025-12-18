'use client'

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

function ConfirmEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const handleEmailConfirmation = async () => {
      try {
        // Get the token from URL
        const token_hash = searchParams.get('token_hash');
        const type = searchParams.get('type');

        if (!token_hash || type !== 'email') {
          setStatus('error');
          setMessage('Invalid confirmation link. Please check your email and try again.');
          return;
        }

        // Verify the email with Supabase
        const { error } = await supabase.auth.verifyOtp({
          token_hash,
          type: 'email',
        });

        if (error) {
          console.error('Email confirmation error:', error);
          setStatus('error');
          setMessage(error.message || 'Email confirmation failed. Please try again.');
          return;
        }

        // Success!
        setStatus('success');
        setMessage('Your email has been verified successfully!');

        // Redirect to login after 3 seconds
        setTimeout(() => {
          router.push('/login');
        }, 3000);

      } catch (error: any) {
        console.error('Confirmation error:', error);
        setStatus('error');
        setMessage('Something went wrong. Please try again.');
      }
    };

    handleEmailConfirmation();
  }, [searchParams, router]);

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
              </svg>
            </div>
            <h1 className="text-4xl font-bold text-white">Vibe Station</h1>
          </div>
        </div>

        {/* Status Card */}
        <div className="bg-neutral-900 rounded-lg p-8 shadow-2xl">
          
          {/* Loading State */}
          {status === 'loading' && (
            <div className="text-center">
              <Loader2 className="w-16 h-16 text-purple-500 mx-auto mb-4 animate-spin" />
              <h2 className="text-2xl font-bold mb-2">Verifying your email...</h2>
              <p className="text-gray-400">Please wait while we confirm your account.</p>
            </div>
          )}

          {/* Success State */}
          {status === 'success' && (
            <div className="text-center">
              <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2 text-green-500">Email Verified!</h2>
              <p className="text-gray-400 mb-6">{message}</p>
              <div className="bg-green-500/10 border border-green-500 rounded-md p-4 mb-6">
                <p className="text-green-400 text-sm">
                  Redirecting to login page in 3 seconds...
                </p>
              </div>
              <button
                onClick={() => router.push('/login')}
                className="w-full bg-green-500 hover:bg-green-400 text-black font-bold py-3 rounded-full transition"
              >
                Go to Login Now
              </button>
            </div>
          )}

          {/* Error State */}
          {status === 'error' && (
            <div className="text-center">
              <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2 text-red-500">Verification Failed</h2>
              <p className="text-gray-400 mb-6">{message}</p>
              <div className="bg-red-500/10 border border-red-500 rounded-md p-4 mb-6">
                <p className="text-red-400 text-sm">
                  If you continue to have issues, please contact support or try signing up again.
                </p>
              </div>
              <div className="flex flex-col gap-3">
                <button
                  onClick={() => router.push('/signup')}
                  className="w-full bg-white hover:bg-gray-200 text-black font-bold py-3 rounded-full transition"
                >
                  Back to Sign Up
                </button>
                <button
                  onClick={() => router.push('/login')}
                  className="w-full bg-neutral-800 hover:bg-neutral-700 text-white font-bold py-3 rounded-full transition"
                >
                  Try Logging In
                </button>
              </div>
            </div>
          )}

        </div>

        {/* Help Text */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-400">
            Need help?{' '}
            <a href="mailto:support@vibestation.com" className="text-green-500 hover:underline">
              Contact Support
            </a>
          </p>
        </div>

      </div>
    </div>
  );
}

export default function ConfirmEmailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <Loader2 className="w-16 h-16 text-purple-500 animate-spin" />
      </div>
    }>
      <ConfirmEmailContent />
    </Suspense>
  );
}