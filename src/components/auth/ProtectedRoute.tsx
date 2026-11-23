'use client';

import React, { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { ShieldAlert, Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'customer' | 'admin';
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requiredRole }) => {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push(`/signin?redirect=${encodeURIComponent(pathname)}`);
    }
  }, [user, isLoading, pathname, router]);

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-6">
        <Loader2 className="w-10 h-10 text-rose-600 animate-spin mb-3" />
        <p className="text-sm font-semibold text-gray-600">Verifying authentication...</p>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect via useEffect
  }

  // Check if user is blocked
  if (user.isBlocked) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white p-8 rounded-3xl shadow-xl border border-red-200 text-center space-y-4">
          <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Account Suspended</h2>
          <p className="text-sm text-gray-600 leading-relaxed">
            Your account has been suspended by an administrator. You cannot access protected features or book appointments.
          </p>
          <p className="text-xs text-gray-400">
            Please contact salon support at <span className="font-semibold">support@salonbook.com</span> if you believe this is an error.
          </p>
        </div>
      </div>
    );
  }

  // Check Role requirement
  if (requiredRole && user.role !== requiredRole) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white p-8 rounded-3xl shadow-xl border border-amber-200 text-center space-y-4">
          <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Access Restricted</h2>
          <p className="text-sm text-gray-600 leading-relaxed">
            You do not have permission to access the {requiredRole} dashboard. You are currently logged in as a <span className="font-semibold capitalize text-rose-600">{user.role}</span>.
          </p>
          <div className="pt-2">
            <button
              onClick={() => router.push(user.role === 'admin' ? '/dashboard/admin' : '/dashboard/customer')}
              className="px-6 py-2.5 rounded-full text-sm font-bold text-white bg-rose-600 hover:bg-rose-700 shadow-md transition-all"
            >
              Go to Your Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
