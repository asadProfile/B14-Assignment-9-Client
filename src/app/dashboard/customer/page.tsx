'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { fetchApi } from '@/lib/api';
import { toast } from 'sonner';
import {
  Calendar,
  Clock,
  CreditCard,
  XCircle,
  Eye,
  CheckCircle,
  AlertCircle,
  User as UserIcon,
  LayoutDashboard,
  CalendarDays,
  Sparkles,
  Loader2,
  Upload,
  ArrowRight,
  ShieldCheck,
  Receipt,
} from 'lucide-react';

interface AppointmentItem {
  _id: string;
  serviceId: {
    _id: string;
    serviceName: string;
    category: string;
    image: string;
    duration: number;
    price: number;
  };
  appointmentDate: string;
  timeSlot: string;
  message?: string;
  servicePrice: number;
  paymentStatus: 'unpaid' | 'paid';
  status: 'pending' | 'confirmed' | 'cancelled';
  createdAt: string;
}

interface CustomerStats {
  totalAppointments: number;
  pendingAppointments: number;
  confirmedAppointments: number;
  cancelledAppointments: number;
}

interface TransactionItem {
  _id: string;
  appointmentId?: {
    _id: string;
    appointmentDate: string;
    timeSlot: string;
    serviceId?: {
      serviceName: string;
      category: string;
    };
  };
  amount: number;
  currency: string;
  stripeSessionId: string;
  status: string;
  createdAt: string;
}

export default function CustomerDashboardPage() {
  const { user, updateUser } = useAuth();

  const [activeTab, setActiveTab] = useState<'overview' | 'appointments' | 'payments' | 'profile'>('overview');
  const [stats, setStats] = useState<CustomerStats>({
    totalAppointments: 0,
    pendingAppointments: 0,
    confirmedAppointments: 0,
    cancelledAppointments: 0,
  });
  const [appointments, setAppointments] = useState<AppointmentItem[]>([]);
  const [transactions, setTransactions] = useState<TransactionItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modal State for Viewing Appointment Details
  const [selectedAppointment, setSelectedAppointment] = useState<AppointmentItem | null>(null);

  // Profile Form State
  const [profileName, setProfileName] = useState(user?.name || '');
  const [profilePhone, setProfilePhone] = useState(user?.phone || '');
  const [profileImage, setProfileImage] = useState(user?.image || '');
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  // Action Loading states
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      const [statsRes, appointmentsRes, transactionsRes] = await Promise.all([
        fetchApi<CustomerStats>('/dashboard/customer'),
        fetchApi<AppointmentItem[]>('/appointments/my'),
        fetchApi<TransactionItem[]>('/payments/my-transactions'),
      ]);

      if (statsRes.success && statsRes.stats) {
        setStats(statsRes.stats);
      }
      if (appointmentsRes.success && appointmentsRes.data) {
        setAppointments(appointmentsRes.data);
      }
      if (transactionsRes.success && transactionsRes.data) {
        setTransactions(transactionsRes.data);
      }
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      setProfileName(user.name);
      setProfilePhone(user.phone || '');
      setProfileImage(user.image || '');
      loadDashboardData();
    }
  }, [user]);

  // Handle Cancel Appointment (Pending Only)
  const handleCancelAppointment = async (id: string) => {
    if (!confirm('Are you sure you want to cancel this pending appointment?')) return;

    setActionLoadingId(id);
    try {
      const res = await fetchApi(`/appointments/${id}/cancel`, {
        method: 'PATCH',
      });

      if (res.success) {
        toast.success('Appointment cancelled successfully.');
        loadDashboardData();
        if (selectedAppointment?._id === id) {
          setSelectedAppointment(null);
        }
      } else {
        toast.error(res.message || 'Failed to cancel appointment.');
      }
    } catch {
      toast.error('An error occurred while cancelling.');
    } finally {
      setActionLoadingId(null);
    }
  };

  // Handle Pay Now for Confirmed Appointment
  const handlePayNow = async (appointmentId: string) => {
    setActionLoadingId(appointmentId);
    try {
      const res = await fetchApi<{ url: string; sessionId: string }>('/payments/create-checkout-session', {
        method: 'POST',
        body: JSON.stringify({ appointmentId }),
      });

      if (res.success && res.url) {
        toast.info('Redirecting to Stripe Checkout...');
        window.location.href = res.url;
      } else {
        toast.error(res.message || 'Failed to initiate payment.');
      }
    } catch (err: any) {
      toast.error(err.message || 'Payment initiation failed.');
    } finally {
      setActionLoadingId(null);
    }
  };

  // Handle Profile Update
  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdatingProfile(true);

    try {
      const res = await fetchApi('/auth/profile', {
        method: 'PUT',
        body: JSON.stringify({
          name: profileName.trim(),
          phone: profilePhone.trim(),
          image: profileImage.trim(),
        }),
      });

      if (res.success && res.user) {
        toast.success('Profile updated successfully!');
        updateUser(res.user);
      } else {
        toast.error(res.message || 'Failed to update profile.');
      }
    } catch {
      toast.error('Failed to update profile.');
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  // Handle Image Upload for Profile
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append('image', file);

      const res = await fetchApi('/upload', {
        method: 'POST',
        body: formData,
      });

      if (res.success && res.url) {
        setProfileImage(res.url);
        toast.success('Image uploaded! Click Save Profile to apply.');
      } else {
        toast.error(res.message || 'Upload failed.');
      }
    } catch {
      toast.error('Upload failed.');
    } finally {
      setIsUploadingImage(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
            <CheckCircle className="w-3.5 h-3.5" /> Confirmed
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800">
            <XCircle className="w-3.5 h-3.5" /> Cancelled
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800">
            <Clock className="w-3.5 h-3.5" /> Pending
          </span>
        );
    }
  };

  const getPaymentBadge = (paymentStatus: string) => {
    if (paymentStatus === 'paid') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
          <ShieldCheck className="w-3 h-3" /> Paid
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-gray-100 text-gray-700 border border-gray-200">
        Unpaid
      </span>
    );
  };

  return (
    <ProtectedRoute requiredRole="customer">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Dashboard Title & Welcome */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-8 border-b border-rose-100">
          <div>
            <span className="text-xs font-bold tracking-wider uppercase text-rose-600">
              Customer Portal
            </span>
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
              Hello, {user?.name}
            </h1>
            <p className="text-sm text-gray-500 mt-0.5">
              Manage your requested appointments, schedule payments, and edit profile.
            </p>
          </div>

          {/* Tab Navigation Controls */}
          <div className="flex items-center gap-2 p-1.5 bg-rose-50/70 rounded-2xl border border-rose-100 self-start sm:self-auto">
            <button
              onClick={() => setActiveTab('overview')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'overview'
                  ? 'bg-white text-rose-700 shadow-sm'
                  : 'text-gray-600 hover:text-rose-600'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Overview</span>
            </button>

            <button
              onClick={() => setActiveTab('appointments')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'appointments'
                  ? 'bg-white text-rose-700 shadow-sm'
                  : 'text-gray-600 hover:text-rose-600'
              }`}
            >
              <CalendarDays className="w-4 h-4" />
              <span>My Appointments</span>
            </button>

            <button
              onClick={() => setActiveTab('payments')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'payments'
                  ? 'bg-white text-rose-700 shadow-sm'
                  : 'text-gray-600 hover:text-rose-600'
              }`}
            >
              <Receipt className="w-4 h-4" />
              <span>Payment History ({transactions.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('profile')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'profile'
                  ? 'bg-white text-rose-700 shadow-sm'
                  : 'text-gray-600 hover:text-rose-600'
              }`}
            >
              <UserIcon className="w-4 h-4" />
              <span>My Profile</span>
            </button>
          </div>
        </div>

        {/* Content Body */}
        {isLoading ? (
          <div className="py-24 flex flex-col items-center justify-center">
            <Loader2 className="w-10 h-10 text-rose-600 animate-spin mb-3" />
            <p className="text-sm font-semibold text-gray-600">Loading your salon dashboard...</p>
          </div>
        ) : (
          <div className="pt-8">
            {/* TAB 1: OVERVIEW */}
            {activeTab === 'overview' && (
              <div className="space-y-10">
                {/* 4 Stats Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="bg-white p-6 rounded-3xl border border-rose-100 shadow-sm flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                        Total Requests
                      </p>
                      <p className="text-3xl font-black text-gray-900 mt-1">
                        {stats.totalAppointments}
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center">
                      <Calendar className="w-6 h-6" />
                    </div>
                  </div>

                  <div className="bg-white p-6 rounded-3xl border border-amber-100 shadow-sm flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                        Pending
                      </p>
                      <p className="text-3xl font-black text-amber-600 mt-1">
                        {stats.pendingAppointments}
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center">
                      <Clock className="w-6 h-6" />
                    </div>
                  </div>

                  <div className="bg-white p-6 rounded-3xl border border-emerald-100 shadow-sm flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                        Confirmed
                      </p>
                      <p className="text-3xl font-black text-emerald-600 mt-1">
                        {stats.confirmedAppointments}
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center">
                      <CheckCircle className="w-6 h-6" />
                    </div>
                  </div>

                  <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                        Cancelled
                      </p>
                      <p className="text-3xl font-black text-gray-600 mt-1">
                        {stats.cancelledAppointments}
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-gray-50 text-gray-500 rounded-2xl flex items-center justify-center">
                      <XCircle className="w-6 h-6" />
                    </div>
                  </div>
                </div>

                {/* Recent Appointments Preview */}
                <div className="bg-white rounded-3xl border border-rose-100 shadow-sm p-6 sm:p-8 space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">Recent Appointments</h3>
                      <p className="text-xs text-gray-500">Your latest bookings and upcoming salon sessions</p>
                    </div>
                    <button
                      onClick={() => setActiveTab('appointments')}
                      className="text-xs font-bold text-rose-600 hover:text-rose-700 flex items-center gap-1"
                    >
                      <span>View All</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {appointments.length === 0 ? (
                    <div className="text-center py-12 text-gray-500 space-y-2">
                      <p className="text-sm">You haven't requested any appointments yet.</p>
                      <a
                        href="/services"
                        className="inline-block text-xs font-bold text-rose-600 hover:underline"
                      >
                        Explore services to book your first visit →
                      </a>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {appointments.slice(0, 3).map((item) => (
                        <div
                          key={item._id}
                          className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-rose-50/40 border border-rose-100 hover:bg-rose-50/70 transition-colors"
                        >
                          <div className="flex items-center gap-4">
                            <img
                              src={item.serviceId?.image || 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=150&q=80'}
                              alt={item.serviceId?.serviceName || 'Service'}
                              className="w-14 h-14 rounded-2xl object-cover"
                            />
                            <div>
                              <h4 className="font-bold text-gray-900 text-sm">
                                {item.serviceId?.serviceName || 'Custom Service'}
                              </h4>
                              <p className="text-xs text-gray-500 flex items-center gap-2 mt-0.5">
                                <span>{item.appointmentDate}</span>
                                <span>•</span>
                                <span>{item.timeSlot}</span>
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-3 self-end sm:self-auto">
                            <span className="font-black text-rose-600 text-sm">${item.servicePrice}</span>
                            {getStatusBadge(item.status)}
                            {getPaymentBadge(item.paymentStatus)}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB 2: MY APPOINTMENTS */}
            {activeTab === 'appointments' && (
              <div className="bg-white rounded-3xl border border-rose-100 shadow-sm p-6 sm:p-8 space-y-6">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">My Appointments</h3>
                  <p className="text-xs text-gray-500 mt-1">
                    Track all your requests, pay for confirmed appointments via Stripe, or cancel pending requests.
                  </p>
                </div>

                {appointments.length === 0 ? (
                  <div className="text-center py-16 text-gray-500 space-y-3">
                    <p className="text-base font-semibold">No appointments found.</p>
                    <p className="text-xs">Browse our catalog to select a luxury salon service.</p>
                    <a
                      href="/services"
                      className="inline-block px-5 py-2.5 rounded-full text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 shadow-md"
                    >
                      Browse Services
                    </a>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-rose-100 text-[11px] font-extrabold uppercase tracking-wider text-gray-500">
                          <th className="py-4 px-4">Service</th>
                          <th className="py-4 px-4">Date & Time</th>
                          <th className="py-4 px-4">Price</th>
                          <th className="py-4 px-4">Status</th>
                          <th className="py-4 px-4">Payment</th>
                          <th className="py-4 px-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-rose-50 text-sm">
                        {appointments.map((item) => {
                          const canCancel = item.status === 'pending';
                          const canPay = item.status === 'confirmed' && item.paymentStatus === 'unpaid';

                          return (
                            <tr key={item._id} className="hover:bg-rose-50/30 transition-colors">
                              {/* Service Info */}
                              <td className="py-4 px-4">
                                <div className="flex items-center gap-3">
                                  <img
                                    src={item.serviceId?.image || 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=150&q=80'}
                                    alt={item.serviceId?.serviceName || 'Service'}
                                    className="w-12 h-12 rounded-xl object-cover shrink-0"
                                  />
                                  <div>
                                    <p className="font-bold text-gray-900 leading-tight">
                                      {item.serviceId?.serviceName || 'Salon Service'}
                                    </p>
                                    <span className="text-[11px] font-semibold text-rose-600">
                                      {item.serviceId?.category}
                                    </span>
                                  </div>
                                </div>
                              </td>

                              {/* Date & Time */}
                              <td className="py-4 px-4">
                                <p className="font-medium text-gray-900">{item.appointmentDate}</p>
                                <p className="text-xs text-gray-500">{item.timeSlot}</p>
                              </td>

                              {/* Price */}
                              <td className="py-4 px-4 font-bold text-gray-900">
                                ${item.servicePrice}
                              </td>

                              {/* Appointment Status */}
                              <td className="py-4 px-4">
                                {getStatusBadge(item.status)}
                              </td>

                              {/* Payment Status */}
                              <td className="py-4 px-4">
                                {getPaymentBadge(item.paymentStatus)}
                              </td>

                              {/* Actions */}
                              <td className="py-4 px-4 text-right space-x-2">
                                {/* Details Button */}
                                <button
                                  onClick={() => setSelectedAppointment(item)}
                                  className="p-2 rounded-xl text-gray-500 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                                  title="View Details"
                                >
                                  <Eye className="w-4 h-4" />
                                </button>

                                {/* Pay Now Button (Only when Confirmed and Unpaid) */}
                                {canPay && (
                                  <button
                                    onClick={() => handlePayNow(item._id)}
                                    disabled={actionLoadingId === item._id}
                                    className="px-3.5 py-1.5 rounded-xl text-xs font-extrabold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-sm transition-all disabled:opacity-50 inline-flex items-center gap-1.5"
                                  >
                                    {actionLoadingId === item._id ? (
                                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                    ) : (
                                      <>
                                        <CreditCard className="w-3.5 h-3.5" />
                                        <span>Pay Now</span>
                                      </>
                                    )}
                                  </button>
                                )}

                                {/* Cancel Button (Only when Pending) */}
                                {canCancel && (
                                  <button
                                    onClick={() => handleCancelAppointment(item._id)}
                                    disabled={actionLoadingId === item._id}
                                    className="px-3 py-1.5 rounded-xl text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 transition-colors disabled:opacity-50"
                                    title="Cancel Pending Request"
                                  >
                                    {actionLoadingId === item._id ? (
                                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                    ) : (
                                      'Cancel'
                                    )}
                                  </button>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* TAB 3: PAYMENT HISTORY */}
            {activeTab === 'payments' && (
              <div className="bg-white rounded-3xl border border-rose-100 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-rose-50">
                  <h3 className="text-xl font-bold text-gray-900">Payment History</h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Your verified Stripe sandbox receipts and completed salon transactions.
                  </p>
                </div>

                {transactions.length === 0 ? (
                  <div className="py-16 text-center space-y-2 text-gray-500">
                    <Receipt className="w-12 h-12 text-rose-200 mx-auto" />
                    <p className="text-sm font-semibold">No payments completed yet.</p>
                    <p className="text-xs">Once an appointment is confirmed and paid via Stripe, your receipt appears here.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-rose-50/50 text-[11px] font-bold uppercase tracking-wider text-gray-500 border-b border-rose-100">
                          <th className="py-4 px-6">Service</th>
                          <th className="py-4 px-6">Appointment Date</th>
                          <th className="py-4 px-6">Stripe Session ID</th>
                          <th className="py-4 px-6">Amount</th>
                          <th className="py-4 px-6">Status</th>
                          <th className="py-4 px-6">Paid On</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-rose-50 text-sm">
                        {transactions.map((tr) => (
                          <tr key={tr._id} className="hover:bg-rose-50/20 transition-colors">
                            <td className="py-4 px-6 font-bold text-gray-900">
                              {tr.appointmentId?.serviceId?.serviceName || 'Salon Service'}
                            </td>
                            <td className="py-4 px-6 text-xs text-gray-600">
                              {tr.appointmentId
                                ? `${tr.appointmentId.appointmentDate} (${tr.appointmentId.timeSlot})`
                                : 'N/A'}
                            </td>
                            <td className="py-4 px-6 font-mono text-xs text-gray-500 max-w-[200px] truncate">
                              {tr.stripeSessionId}
                            </td>
                            <td className="py-4 px-6 font-black text-emerald-700">
                              ${tr.amount} {tr.currency?.toUpperCase()}
                            </td>
                            <td className="py-4 px-6">
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 uppercase">
                                <CheckCircle className="w-3 h-3" /> {tr.status}
                              </span>
                            </td>
                            <td className="py-4 px-6 text-xs text-gray-500">
                              {new Date(tr.createdAt).toLocaleDateString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* TAB 4: MY PROFILE */}
            {activeTab === 'profile' && (
              <div className="max-w-2xl bg-white rounded-3xl border border-rose-100 shadow-sm p-6 sm:p-10 space-y-6">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">My Profile</h3>
                  <p className="text-xs text-gray-500 mt-1">
                    Update your personal contact details and profile avatar.
                  </p>
                </div>

                <form onSubmit={handleProfileSubmit} className="space-y-6">
                  {/* Avatar Upload */}
                  <div className="flex items-center gap-6">
                    <img
                      src={
                        profileImage ||
                        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80'
                      }
                      alt="Avatar"
                      className="w-20 h-20 rounded-full object-cover ring-4 ring-rose-200"
                    />
                    <div className="space-y-2">
                      <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-rose-200 text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 transition-colors">
                        <Upload className="w-3.5 h-3.5" />
                        <span>{isUploadingImage ? 'Uploading...' : 'Change Avatar'}</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                          disabled={isUploadingImage}
                        />
                      </label>
                      <p className="text-[11px] text-gray-500">Supports JPG, PNG up to 5MB.</p>
                    </div>
                  </div>

                  {/* Profile Image URL input */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                      Profile Image URL
                    </label>
                    <input
                      type="url"
                      placeholder="https://images.unsplash.com/..."
                      value={profileImage}
                      onChange={(e) => setProfileImage(e.target.value)}
                      className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:border-rose-500 focus:ring-2 focus:ring-rose-200 text-sm outline-none transition-all"
                    />
                  </div>

                  {/* Name */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={profileName}
                      onChange={(e) => setProfileName(e.target.value)}
                      className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:border-rose-500 focus:ring-2 focus:ring-rose-200 text-sm outline-none transition-all"
                    />
                  </div>

                  {/* Email (Read-Only) */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-1.5">
                      Email Address (Cannot Be Changed)
                    </label>
                    <input
                      type="email"
                      disabled
                      value={user?.email || ''}
                      className="w-full px-4 py-3 rounded-2xl border border-gray-200 bg-gray-50 text-gray-500 text-sm cursor-not-allowed"
                    />
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      placeholder="+1 (555) 000-0000"
                      value={profilePhone}
                      onChange={(e) => setProfilePhone(e.target.value)}
                      className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:border-rose-500 focus:ring-2 focus:ring-rose-200 text-sm outline-none transition-all"
                    />
                  </div>

                  {/* Role Info Note */}
                  <div className="p-3.5 rounded-2xl bg-gray-50 border border-gray-200 text-xs text-gray-600 flex items-center justify-between">
                    <span>Account Role: <strong className="capitalize text-gray-800">{user?.role}</strong></span>
                    <span>Status: <strong className="text-emerald-600 font-bold">{user?.isBlocked ? 'Blocked' : 'Active'}</strong></span>
                  </div>

                  <button
                    type="submit"
                    disabled={isUpdatingProfile}
                    className="px-8 py-3.5 rounded-2xl text-sm font-extrabold text-white bg-rose-600 hover:bg-rose-700 shadow-md transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {isUpdatingProfile ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      'Save Changes'
                    )}
                  </button>
                </form>
              </div>
            )}
          </div>
        )}

        {/* Modal: View Appointment Details */}
        {selectedAppointment && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl border border-rose-100 overflow-hidden space-y-6 p-6 sm:p-8">
              <div className="flex items-center justify-between border-b border-rose-100 pb-4">
                <h3 className="text-xl font-bold text-gray-900">Appointment Details</h3>
                <button
                  onClick={() => setSelectedAppointment(null)}
                  className="p-1.5 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100"
                >
                  <XCircle className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4 text-sm">
                <div className="flex items-center gap-3">
                  <img
                    src={selectedAppointment.serviceId?.image}
                    alt={selectedAppointment.serviceId?.serviceName}
                    className="w-16 h-16 rounded-2xl object-cover"
                  />
                  <div>
                    <h4 className="font-bold text-gray-900 text-base">
                      {selectedAppointment.serviceId?.serviceName}
                    </h4>
                    <p className="text-xs text-rose-600 font-semibold">
                      {selectedAppointment.serviceId?.category} ({selectedAppointment.serviceId?.duration} mins)
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 p-4 rounded-2xl bg-rose-50/50 border border-rose-100 text-xs">
                  <div>
                    <span className="text-gray-500 block">Date</span>
                    <strong className="text-gray-900 text-sm">{selectedAppointment.appointmentDate}</strong>
                  </div>
                  <div>
                    <span className="text-gray-500 block">Time Slot</span>
                    <strong className="text-gray-900 text-sm">{selectedAppointment.timeSlot}</strong>
                  </div>
                  <div>
                    <span className="text-gray-500 block">Service Fee</span>
                    <strong className="text-rose-600 text-sm font-black">${selectedAppointment.servicePrice}</strong>
                  </div>
                  <div>
                    <span className="text-gray-500 block">Booking Status</span>
                    <div className="mt-0.5">{getStatusBadge(selectedAppointment.status)}</div>
                  </div>
                </div>

                <div>
                  <span className="text-xs text-gray-500 block mb-1">Payment Status:</span>
                  <div>{getPaymentBadge(selectedAppointment.paymentStatus)}</div>
                </div>

                {selectedAppointment.message && (
                  <div>
                    <span className="text-xs text-gray-500 block mb-1">Your Message:</span>
                    <p className="p-3 bg-gray-50 rounded-xl text-xs text-gray-700 italic">
                      "{selectedAppointment.message}"
                    </p>
                  </div>
                )}

                <div className="text-[11px] text-gray-400">
                  Requested on: {new Date(selectedAppointment.createdAt).toLocaleString()}
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-3 border-t border-rose-100">
                {selectedAppointment.status === 'confirmed' && selectedAppointment.paymentStatus === 'unpaid' && (
                  <button
                    onClick={() => handlePayNow(selectedAppointment._id)}
                    className="px-5 py-2.5 rounded-full text-xs font-extrabold text-white bg-emerald-600 hover:bg-emerald-700 shadow-sm"
                  >
                    Pay ${selectedAppointment.servicePrice}
                  </button>
                )}

                {selectedAppointment.status === 'pending' && (
                  <button
                    onClick={() => handleCancelAppointment(selectedAppointment._id)}
                    className="px-4 py-2.5 rounded-full text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100"
                  >
                    Cancel Appointment
                  </button>
                )}

                <button
                  onClick={() => setSelectedAppointment(null)}
                  className="px-4 py-2.5 rounded-full text-xs font-semibold text-gray-600 hover:bg-gray-100"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
