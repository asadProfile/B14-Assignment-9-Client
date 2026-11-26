'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { fetchApi } from '@/lib/api';
import { toast } from 'sonner';
import { Scissors, Mail, Lock, Loader2, ArrowRight } from 'lucide-react';

function SignInContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get('redirect');
  const tokenFromUrl = searchParams.get('token');
  const errorFromUrl = searchParams.get('error');
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Helper to determine proper dashboard redirect based on user role
  const getDestinationUrl = (targetUrl: string | null, role: 'admin' | 'customer') => {
    if (!targetUrl) {
      return role === 'admin' ? '/dashboard/admin' : '/dashboard/customer';
    }
    // Prevent customer from being routed to the restricted admin dashboard
    if (targetUrl.startsWith('/dashboard/admin') && role !== 'admin') {
      return '/dashboard/customer';
    }
    // Prevent admin from being routed to the customer dashboard
    if (targetUrl.startsWith('/dashboard/customer') && role === 'admin') {
      return '/dashboard/admin';
    }
    return targetUrl;
  };

  // Check for Google OAuth callback token or errors in URL
  useEffect(() => {
    if (errorFromUrl) {
      toast.error(decodeURIComponent(errorFromUrl));
    }

    if (tokenFromUrl) {
      const handleTokenLogin = async () => {
        setIsLoading(true);
        try {
          const res = await fetchApi<{ user: any }>('/auth/me', {
            headers: { Authorization: `Bearer ${tokenFromUrl}` },
          });

          if (res.success && res.user) {
            toast.success('Signed in with Google!');
            login(tokenFromUrl, res.user);
            router.push(getDestinationUrl(redirectUrl, res.user.role));
          } else {
            toast.error('Failed to verify Google sign-in session.');
          }
        } catch {
          toast.error('Error during Google sign-in.');
        } finally {
          setIsLoading(false);
        }
      };

      handleTokenLogin();
    }
  }, [tokenFromUrl, errorFromUrl, redirectUrl]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      toast.error('Please enter both email and password.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetchApi('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });

      if (res.success && res.token && res.user) {
        toast.success(res.message || 'Signed in successfully!');
        login(res.token, res.user);
        router.push(getDestinationUrl(redirectUrl, res.user.role));
      } else {
        toast.error(res.message || 'Invalid email or password.');
      }
    } catch (err: any) {
      toast.error(err.message || 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    try {
      // 1. Pass current origin to server so it redirects back accurately (localhost or Vercel domain)
      const clientOrigin = typeof window !== 'undefined' ? window.location.origin : '';
      const urlCheck = await fetchApi<{ configured: boolean; url: string }>(
        `/auth/google/url?client_url=${encodeURIComponent(clientOrigin)}`
      );

      if (urlCheck.success && urlCheck.configured && urlCheck.url) {
        // Redirect to live Google OAuth consent screen
        window.location.href = urlCheck.url;
        return;
      }

      // 2. Fallback: Authenticate demo Google user if keys are not yet provided
      const res = await fetchApi('/auth/google', {
        method: 'POST',
        body: JSON.stringify({
          email: 'google.verified@example.com',
          name: 'Google Verified User',
          image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
        }),
      });

      if (res.success && res.token && res.user) {
        toast.success('Signed in with Google!');
        login(res.token, res.user);
        router.push(getDestinationUrl(redirectUrl, res.user.role));
      } else {
        toast.error(res.message || 'Google sign in failed.');
      }
    } catch (err: any) {
      toast.error(err.message || 'Google sign in failed.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-16 bg-gradient-to-b from-rose-50/50 to-white">
      <div className="max-w-md w-full bg-white rounded-3xl border border-rose-100 shadow-xl p-8 sm:p-10 space-y-8">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 bg-gradient-to-tr from-rose-600 to-pink-500 rounded-2xl flex items-center justify-center text-white mx-auto shadow-md shadow-rose-200">
            <Scissors className="w-6 h-6 -rotate-45" />
          </div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Welcome Back</h1>
          <p className="text-sm text-gray-600">
            Sign in to manage your salon appointments and payments.
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-11 pr-4 py-3 rounded-2xl border border-gray-200 focus:border-rose-500 focus:ring-2 focus:ring-rose-200 text-sm outline-none transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-11 pr-4 py-3 rounded-2xl border border-gray-200 focus:border-rose-500 focus:ring-2 focus:ring-rose-200 text-sm outline-none transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 rounded-2xl text-sm font-extrabold text-white bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 shadow-md shadow-rose-200 hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <span>Sign In</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="relative flex items-center justify-center">
          <div className="border-t border-gray-200 w-full" />
          <span className="bg-white px-3 text-xs text-gray-400 font-semibold uppercase">Or</span>
        </div>

        {/* Google Authentication */}
        <button
          onClick={handleGoogleLogin}
          type="button"
          disabled={isLoading}
          className="w-full py-3 px-4 rounded-2xl border border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-sm font-bold text-gray-700 transition-all flex items-center justify-center gap-3"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          <span>Continue with Google</span>
        </button>

        {/* Footer Link */}
        <p className="text-center text-xs text-gray-600">
          Don't have an account yet?{' '}
          <Link href="/signup" className="font-bold text-rose-600 hover:text-rose-700">
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function SignInPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[80vh] flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-rose-600 animate-spin" />
        </div>
      }
    >
      <SignInContent />
    </Suspense>
  );
}
