'use client';

import React, { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { fetchApi } from '@/lib/api';
import { CheckCircle2, ShieldCheck, ArrowRight, Loader2, Calendar, Receipt } from 'lucide-react';

function PaymentSuccessContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');

  const [isLoading, setIsLoading] = useState(true);
  const [paymentData, setPaymentData] = useState<{
    appointment?: any;
    transaction?: any;
  } | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    const verifyPayment = async () => {
      if (!sessionId) {
        setIsLoading(false);
        return;
      }

      try {
        const res = await fetchApi('/payments/sync-session', {
          method: 'POST',
          body: JSON.stringify({ sessionId }),
        });

        if (res.success) {
          setPaymentData({
            appointment: res.appointment,
            transaction: res.transaction,
          });
        } else {
          setErrorMsg(res.message || 'Could not verify payment session.');
        }
      } catch (err: any) {
        setErrorMsg(err.message || 'Error communicating with server.');
      } finally {
        setIsLoading(false);
      }
    };

    verifyPayment();
  }, [sessionId]);

  if (isLoading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 space-y-3">
        <Loader2 className="w-10 h-10 text-emerald-600 animate-spin" />
        <p className="text-sm font-semibold text-gray-700">Verifying payment confirmation with Stripe...</p>
      </div>
    );
  }

  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-16 bg-gradient-to-b from-emerald-50/50 to-white">
      <div className="max-w-lg w-full bg-white rounded-3xl border border-emerald-100 shadow-2xl p-8 sm:p-10 text-center space-y-6">
        <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
          <CheckCircle2 className="w-10 h-10" />
        </div>

        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-emerald-600">
            Payment Confirmed
          </span>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight mt-1">
            Thank You for Your Booking!
          </h1>
          <p className="text-sm text-gray-600 mt-2">
            Your appointment has been successfully paid and secured. A confirmation email has been dispatched.
          </p>
        </div>

        {/* Payment Summary Box */}
        {paymentData?.appointment && (
          <div className="p-5 rounded-2xl bg-emerald-50/60 border border-emerald-100 text-left space-y-3 text-sm">
            <div className="flex items-center justify-between pb-2 border-b border-emerald-100">
              <span className="text-xs font-bold uppercase text-gray-500">Service</span>
              <strong className="text-gray-900 font-bold">
                {paymentData.appointment.serviceId?.serviceName || 'Salon Service'}
              </strong>
            </div>

            <div className="flex items-center justify-between pb-2 border-b border-emerald-100">
              <span className="text-xs font-bold uppercase text-gray-500">Date & Slot</span>
              <span className="text-gray-800 text-xs font-semibold">
                {paymentData.appointment.appointmentDate} ({paymentData.appointment.timeSlot})
              </span>
            </div>

            <div className="flex items-center justify-between pb-2 border-b border-emerald-100">
              <span className="text-xs font-bold uppercase text-gray-500">Amount Paid</span>
              <strong className="text-emerald-700 font-black text-base">
                ${paymentData.transaction?.amount || paymentData.appointment.servicePrice} USD
              </strong>
            </div>

            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>Stripe Reference</span>
              <span className="font-mono text-[11px] truncate max-w-[180px]">
                {sessionId}
              </span>
            </div>
          </div>
        )}

        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/dashboard/customer"
            className="w-full sm:w-auto px-6 py-3.5 rounded-full text-sm font-extrabold text-white bg-emerald-600 hover:bg-emerald-700 shadow-md transition-all flex items-center justify-center gap-2"
          >
            <span>Go to My Appointments</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/"
            className="w-full sm:w-auto px-6 py-3.5 rounded-full text-sm font-semibold text-gray-700 hover:bg-gray-100 transition-colors"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[70vh] flex flex-col items-center justify-center">
          <Loader2 className="w-10 h-10 text-emerald-600 animate-spin" />
        </div>
      }
    >
      <PaymentSuccessContent />
    </Suspense>
  );
}
