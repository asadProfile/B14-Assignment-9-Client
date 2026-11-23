'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { fetchApi } from '@/lib/api';
import { ServiceItem } from '@/components/services/ServiceCard';
import { toast } from 'sonner';
import {
  Clock,
  Tag,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ArrowLeft,
  Sparkles,
  ShieldAlert,
} from 'lucide-react';
import Link from 'next/link';

const TIME_SLOTS = [
  '09:00 AM - 10:00 AM',
  '10:00 AM - 11:00 AM',
  '11:00 AM - 12:00 PM',
  '01:00 PM - 02:00 PM',
  '02:00 PM - 03:00 PM',
  '03:00 PM - 04:00 PM',
  '04:00 PM - 05:00 PM',
  '05:00 PM - 06:00 PM',
];

export default function ServiceDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();

  const [service, setService] = useState<ServiceItem | null>(null);
  const [isLoadingService, setIsLoadingService] = useState(true);
  const [notFoundError, setNotFoundError] = useState(false);

  // Booking Form State
  const [appointmentDate, setAppointmentDate] = useState('');
  const [timeSlot, setTimeSlot] = useState(TIME_SLOTS[0]);
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);

  // Minimum date today
  const todayStr = new Date().toISOString().split('T')[0];

  useEffect(() => {
    // Check authentication requirement: Redirect to Sign In if unauthenticated
    if (!authLoading && !user) {
      router.push(`/signin?redirect=/services/${id}`);
      return;
    }

    const loadService = async () => {
      try {
        const res = await fetchApi<ServiceItem>(`/services/${id}`);
        if (res.success && res.data) {
          setService(res.data);
        } else {
          setNotFoundError(true);
        }
      } catch {
        setNotFoundError(true);
      } finally {
        setIsLoadingService(false);
      }
    };

    if (id) {
      loadService();
    }
  }, [id, user, authLoading, router]);

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast.error('You must be signed in to book an appointment.');
      router.push(`/signin?redirect=/services/${id}`);
      return;
    }

    if (user.role === 'admin') {
      toast.error('Admins cannot submit customer appointment requests.');
      return;
    }

    if (user.isBlocked) {
      toast.error('Your account is suspended. You cannot book appointments.');
      return;
    }

    if (!appointmentDate) {
      toast.error('Please select an appointment date.');
      return;
    }

    if (!timeSlot) {
      toast.error('Please select a time slot.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetchApi('/appointments', {
        method: 'POST',
        body: JSON.stringify({
          serviceId: id,
          appointmentDate,
          timeSlot,
          message,
        }),
      });

      if (res.success) {
        toast.success('Appointment request submitted successfully!');
        setBookingSuccess(true);
      } else {
        toast.error(res.message || 'Failed to submit booking request.');
      }
    } catch (err: any) {
      toast.error(err.message || 'An unexpected error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (authLoading || isLoadingService) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center">
        <Loader2 className="w-10 h-10 text-rose-600 animate-spin mb-3" />
        <p className="text-sm font-semibold text-gray-600">Loading service details...</p>
      </div>
    );
  }

  if (notFoundError || !service) {
    return (
      <div className="max-w-xl mx-auto px-4 py-24 text-center space-y-4">
        <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900">Service Not Found</h2>
        <p className="text-sm text-gray-600 leading-relaxed">
          The requested salon service ID is invalid or the service has been removed from our catalog.
        </p>
        <Link
          href="/services"
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-bold text-white bg-rose-600 hover:bg-rose-700 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Browse Services
        </Link>
      </div>
    );
  }

  // Check if service is inactive
  const isInactive = service.status === 'inactive';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      {/* Back Link */}
      <Link
        href="/services"
        className="inline-flex items-center gap-2 text-sm font-bold text-gray-600 hover:text-rose-600 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to All Services</span>
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Left Column: Service Details */}
        <div className="lg:col-span-7 space-y-8">
          <div className="relative rounded-3xl overflow-hidden shadow-lg border border-rose-100 bg-rose-50 h-[380px] sm:h-[450px]">
            <img
              src={service.image}
              alt={service.serviceName}
              className="w-full h-full object-cover"
            />
            <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md px-3.5 py-1.5 rounded-full text-xs font-bold text-rose-700 flex items-center gap-1.5 shadow-sm">
              <Tag className="w-3.5 h-3.5 text-rose-500" />
              <span>{service.category}</span>
            </div>

            {isInactive && (
              <div className="absolute top-4 right-4 bg-amber-500 text-white px-3.5 py-1.5 rounded-full text-xs font-bold uppercase shadow-sm">
                Service Inactive
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
                {service.serviceName}
              </h1>
              <span className="text-3xl font-black text-rose-600">
                ${service.price}
              </span>
            </div>

            <div className="flex items-center gap-4 text-sm font-semibold text-gray-600 pb-4 border-b border-rose-100">
              <div className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-rose-500" />
                <span>Estimated Duration: {service.duration} mins</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-rose-500" />
                <span>Status: <span className="capitalize text-rose-700">{service.status}</span></span>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Service Description</h3>
              <p className="text-base text-gray-700 leading-relaxed whitespace-pre-line">
                {service.description}
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: Appointment Booking Form */}
        <div className="lg:col-span-5">
          <div className="bg-white rounded-3xl border border-rose-200/80 p-8 shadow-xl space-y-6 sticky top-28">
            <div>
              <div className="inline-flex items-center gap-2 text-rose-600 text-xs font-bold uppercase tracking-wider mb-1">
                <Calendar className="w-4 h-4" />
                <span>Appointment Booking</span>
              </div>
              <h2 className="text-2xl font-extrabold text-gray-900">
                Reserve Your Session
              </h2>
              <p className="text-xs text-gray-500 mt-1">
                Default request status will be <span className="font-bold text-amber-600">Pending</span>. You will pay online after salon confirmation.
              </p>
            </div>

            {bookingSuccess ? (
              <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-3">
                <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
                <h3 className="text-lg font-bold text-emerald-900">Appointment Request Sent!</h3>
                <p className="text-xs text-emerald-700 leading-relaxed">
                  Your appointment has been registered with status <span className="font-semibold">Pending</span>. The salon administrator will review and confirm your session shortly.
                </p>
                <div className="pt-2">
                  <Link
                    href="/dashboard/customer"
                    className="inline-block px-5 py-2.5 rounded-full text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 transition-colors shadow-sm"
                  >
                    View in Customer Dashboard
                  </Link>
                </div>
              </div>
            ) : isInactive ? (
              <div className="p-5 rounded-2xl bg-amber-50 border border-amber-200 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-bold text-amber-900">Service Currently Unavailable</p>
                  <p className="text-xs text-amber-700 mt-1">
                    This service is currently marked inactive by the salon. Only active services can be booked.
                  </p>
                </div>
              </div>
            ) : user?.role === 'admin' ? (
              <div className="p-5 rounded-2xl bg-rose-50 border border-rose-200 flex items-start gap-3">
                <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-bold text-rose-900">Admin Account Detected</p>
                  <p className="text-xs text-rose-700 mt-1">
                    Administrators cannot submit customer appointment requests. Please use a customer account to make bookings.
                  </p>
                </div>
              </div>
            ) : (
              <form onSubmit={handleBookingSubmit} className="space-y-4">
                {/* Appointment Date */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                    Appointment Date *
                  </label>
                  <input
                    type="date"
                    min={todayStr}
                    value={appointmentDate}
                    onChange={(e) => setAppointmentDate(e.target.value)}
                    required
                    className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:border-rose-500 focus:ring-2 focus:ring-rose-200 text-sm font-medium outline-none transition-all"
                  />
                </div>

                {/* Time Slot */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                    Available Time Slot *
                  </label>
                  <select
                    value={timeSlot}
                    onChange={(e) => setTimeSlot(e.target.value)}
                    required
                    className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:border-rose-500 focus:ring-2 focus:ring-rose-200 text-sm font-medium outline-none bg-white transition-all"
                  >
                    {TIME_SLOTS.map((slot) => (
                      <option key={slot} value={slot}>
                        {slot}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Additional Message */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                    Additional Message (Optional)
                  </label>
                  <textarea
                    rows={3}
                    placeholder="E.g., Any preferences, allergies, or specific requests..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:border-rose-500 focus:ring-2 focus:ring-rose-200 text-sm outline-none resize-none transition-all"
                  />
                </div>

                {/* Price Breakdown */}
                <div className="p-4 rounded-2xl bg-rose-50/70 border border-rose-100 flex items-center justify-between text-sm">
                  <span className="font-semibold text-gray-700">Total Due Upon Confirmation:</span>
                  <span className="font-black text-rose-600 text-lg">${service.price}</span>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-4 rounded-2xl text-base font-extrabold text-white bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 shadow-lg shadow-rose-200 hover:shadow-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Submitting Request...</span>
                    </>
                  ) : (
                    <span>Request Appointment</span>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
