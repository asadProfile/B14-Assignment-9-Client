'use client';

import React, { Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { XCircle, ArrowLeft, RefreshCw, Loader2 } from 'lucide-react';

function PaymentCancelContent() {
  const searchParams = useSearchParams();
  const appointmentId = searchParams.get('appointment_id');

  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-16 bg-gradient-to-b from-rose-50/50 to-white">
      <div className="max-w-md w-full bg-white rounded-3xl border border-rose-100 shadow-2xl p-8 sm:p-10 text-center space-y-6">
        <div className="w-20 h-20 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto">
          <XCircle className="w-10 h-10" />
        </div>

        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-rose-600">
            Payment Incomplete
          </span>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight mt-1">
            Payment Cancelled
          </h1>
          <p className="text-sm text-gray-600 mt-2 leading-relaxed">
            You cancelled the checkout process. No charges were made to your payment card. Your confirmed appointment remains reserved and ready for payment whenever you wish.
          </p>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/dashboard/customer"
            className="w-full sm:w-auto px-6 py-3.5 rounded-full text-sm font-extrabold text-white bg-rose-600 hover:bg-rose-700 shadow-md transition-all flex items-center justify-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Return to Dashboard</span>
          </Link>
          <Link
            href="/services"
            className="w-full sm:w-auto px-6 py-3.5 rounded-full text-sm font-semibold text-gray-700 hover:bg-gray-100 transition-colors"
          >
            Browse Services
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function PaymentCancelPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[70vh] flex flex-col items-center justify-center">
          <Loader2 className="w-8 h-8 text-rose-600 animate-spin" />
        </div>
      }
    >
      <PaymentCancelContent />
    </Suspense>
  );
}
