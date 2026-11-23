'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { fetchApi } from '@/lib/api';
import { toast } from 'sonner';
import {
  LayoutDashboard,
  Scissors,
  CalendarCheck2,
  Users,
  Receipt,
  User as UserIcon,
  Plus,
  Edit2,
  Trash2,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  Upload,
  Loader2,
  DollarSign,
  ShieldCheck,
  ShieldAlert,
  Search,
  Filter,
} from 'lucide-react';

interface ServiceItem {
  _id: string;
  serviceName: string;
  category: string;
  description: string;
  price: number;
  duration: number;
  image: string;
  status: 'active' | 'inactive';
}

interface AppointmentAdminItem {
  _id: string;
  serviceId: {
    _id: string;
    serviceName: string;
    category: string;
    image: string;
    duration: number;
    price: number;
  };
  customerId: {
    _id: string;
    name: string;
    email: string;
    image?: string;
    phone?: string;
    isBlocked?: boolean;
  };
  appointmentDate: string;
  timeSlot: string;
  message?: string;
  servicePrice: number;
  paymentStatus: 'unpaid' | 'paid';
  status: 'pending' | 'confirmed' | 'cancelled';
  createdAt: string;
}

interface UserItem {
  _id: string;
  name: string;
  email: string;
  image?: string;
  role: string;
  isBlocked: boolean;
  phone?: string;
  createdAt: string;
}

interface TransactionItem {
  _id: string;
  customerId: {
    _id: string;
    name: string;
    email: string;
  };
  appointmentId: {
    _id: string;
    serviceId: {
      serviceName: string;
    };
    appointmentDate: string;
  };
  amount: number;
  currency: string;
  stripeSessionId: string;
  status: 'paid' | 'failed';
  createdAt: string;
}

interface AdminStats {
  totalCustomers: number;
  totalActiveServices: number;
  totalAppointments: number;
  pendingAppointments: number;
  confirmedAppointments: number;
  cancelledAppointments: number;
  successfulPayments: number;
  totalRevenue: number;
}

const CATEGORIES = [
  'Haircut & Styling',
  'Hair Coloring',
  'Hair Treatment',
  'Facial & Skincare',
  'Makeup',
  'Manicure & Pedicure',
  'Spa & Massage',
];

export default function AdminDashboardPage() {
  const { user, updateUser } = useAuth();

  const [activeTab, setActiveTab] = useState<
    'overview' | 'services' | 'appointments' | 'users' | 'transactions' | 'profile'
  >('overview');

  const [stats, setStats] = useState<AdminStats>({
    totalCustomers: 0,
    totalActiveServices: 0,
    totalAppointments: 0,
    pendingAppointments: 0,
    confirmedAppointments: 0,
    cancelledAppointments: 0,
    successfulPayments: 0,
    totalRevenue: 0,
  });

  const [services, setServices] = useState<ServiceItem[]>([]);
  const [appointments, setAppointments] = useState<AppointmentAdminItem[]>([]);
  const [users, setUsers] = useState<UserItem[]>([]);
  const [transactions, setTransactions] = useState<TransactionItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Service Modal State (Add or Edit)
  const [serviceModalOpen, setServiceModalOpen] = useState(false);
  const [editingServiceId, setEditingServiceId] = useState<string | null>(null);
  const [serviceForm, setServiceForm] = useState({
    serviceName: '',
    category: CATEGORIES[0],
    description: '',
    price: '',
    duration: '',
    image: '',
    status: 'active' as 'active' | 'inactive',
  });
  const [isSubmittingService, setIsSubmittingService] = useState(false);
  const [isUploadingServiceImg, setIsUploadingServiceImg] = useState(false);

  // Appointment Details Modal
  const [selectedAppointment, setSelectedAppointment] = useState<AppointmentAdminItem | null>(null);

  // Profile Form
  const [profileName, setProfileName] = useState(user?.name || '');
  const [profilePhone, setProfilePhone] = useState(user?.phone || '');
  const [profileImage, setProfileImage] = useState(user?.image || '');
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // Filters
  const [appointmentFilter, setAppointmentFilter] = useState<'all' | 'pending' | 'confirmed' | 'cancelled'>('all');
  const [serviceSearch, setServiceSearch] = useState('');

  const loadAllAdminData = async () => {
    setIsLoading(true);
    try {
      const [statsRes, servicesRes, appointmentsRes, usersRes, transactionsRes] = await Promise.all([
        fetchApi<AdminStats>('/dashboard/admin'),
        fetchApi<ServiceItem[]>('/services?all=true'),
        fetchApi<AppointmentAdminItem[]>('/appointments/admin/all'),
        fetchApi<UserItem[]>('/users'),
        fetchApi<TransactionItem[]>('/payments/transactions'),
      ]);

      if (statsRes.success && statsRes.stats) setStats(statsRes.stats);
      if (servicesRes.success && servicesRes.data) setServices(servicesRes.data);
      if (appointmentsRes.success && appointmentsRes.data) setAppointments(appointmentsRes.data);
      if (usersRes.success && usersRes.data) setUsers(usersRes.data);
      if (transactionsRes.success && transactionsRes.data) setTransactions(transactionsRes.data);
    } catch (err) {
      console.error('Failed to load admin data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role === 'admin') {
      setProfileName(user.name);
      setProfilePhone(user.phone || '');
      setProfileImage(user.image || '');
      loadAllAdminData();
    }
  }, [user]);

  // Open Add Service Modal
  const handleOpenAddService = () => {
    setEditingServiceId(null);
    setServiceForm({
      serviceName: '',
      category: CATEGORIES[0],
      description: '',
      price: '',
      duration: '',
      image: '',
      status: 'active',
    });
    setServiceModalOpen(true);
  };

  // Open Edit Service Modal
  const handleOpenEditService = (srv: ServiceItem) => {
    setEditingServiceId(srv._id);
    setServiceForm({
      serviceName: srv.serviceName,
      category: srv.category,
      description: srv.description,
      price: srv.price.toString(),
      duration: srv.duration.toString(),
      image: srv.image,
      status: srv.status,
    });
    setServiceModalOpen(true);
  };

  // Handle Service Form Submit (Create or Update)
  const handleSaveService = async (e: React.FormEvent) => {
    e.preventDefault();

    const priceNum = parseFloat(serviceForm.price);
    const durationNum = parseInt(serviceForm.duration, 10);

    if (isNaN(priceNum) || priceNum <= 0) {
      toast.error('Price must be a positive number.');
      return;
    }

    if (isNaN(durationNum) || durationNum <= 0) {
      toast.error('Duration must be a positive number of minutes.');
      return;
    }

    if (!serviceForm.image.trim()) {
      toast.error('Please upload or provide an image for the service.');
      return;
    }

    setIsSubmittingService(true);
    try {
      const endpoint = editingServiceId ? `/services/${editingServiceId}` : '/services';
      const method = editingServiceId ? 'PUT' : 'POST';

      const res = await fetchApi(endpoint, {
        method,
        body: JSON.stringify({
          serviceName: serviceForm.serviceName,
          category: serviceForm.category,
          description: serviceForm.description,
          price: priceNum,
          duration: durationNum,
          image: serviceForm.image,
          status: serviceForm.status,
        }),
      });

      if (res.success) {
        toast.success(editingServiceId ? 'Service updated successfully!' : 'Service created successfully!');
        setServiceModalOpen(false);
        loadAllAdminData();
      } else {
        toast.error(res.message || 'Failed to save service.');
      }
    } catch {
      toast.error('An error occurred while saving service.');
    } finally {
      setIsSubmittingService(false);
    }
  };

  // Toggle Service Active / Inactive
  const handleToggleServiceStatus = async (srv: ServiceItem) => {
    const nextStatus = srv.status === 'active' ? 'inactive' : 'active';
    try {
      const res = await fetchApi(`/services/${srv._id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: nextStatus }),
      });

      if (res.success) {
        toast.success(`Service marked as ${nextStatus}.`);
        loadAllAdminData();
      } else {
        toast.error(res.message || 'Failed to update status.');
      }
    } catch {
      toast.error('Error updating status.');
    }
  };

  // Delete Service
  const handleDeleteService = async (id: string) => {
    if (!confirm('Are you sure you want to delete this service permanently?')) return;

    try {
      const res = await fetchApi(`/services/${id}`, { method: 'DELETE' });
      if (res.success) {
        toast.success('Service deleted successfully.');
        loadAllAdminData();
      } else {
        toast.error(res.message || 'Failed to delete service.');
      }
    } catch {
      toast.error('Failed to delete service.');
    }
  };

  // Confirm Pending Appointment
  const handleConfirmAppointment = async (id: string) => {
    try {
      const res = await fetchApi(`/appointments/${id}/confirm`, { method: 'PATCH' });
      if (res.success) {
        toast.success('Appointment confirmed! Customer can now pay via Stripe.');
        loadAllAdminData();
        if (selectedAppointment?._id === id) {
          setSelectedAppointment({ ...selectedAppointment, status: 'confirmed' });
        }
      } else {
        toast.error(res.message || 'Failed to confirm appointment.');
      }
    } catch {
      toast.error('Failed to confirm appointment.');
    }
  };

  // Cancel Appointment (Pending or Confirmed)
  const handleCancelAppointment = async (id: string) => {
    if (!confirm('Are you sure you want to cancel this appointment?')) return;

    try {
      const res = await fetchApi(`/appointments/${id}/cancel`, { method: 'PATCH' });
      if (res.success) {
        toast.success('Appointment cancelled.');
        loadAllAdminData();
        if (selectedAppointment?._id === id) {
          setSelectedAppointment({ ...selectedAppointment, status: 'cancelled' });
        }
      } else {
        toast.error(res.message || 'Failed to cancel appointment.');
      }
    } catch {
      toast.error('Failed to cancel appointment.');
    }
  };

  // Block / Unblock User
  const handleToggleBlockUser = async (targetUser: UserItem) => {
    const nextBlocked = !targetUser.isBlocked;
    const actionWord = nextBlocked ? 'block' : 'unblock';

    if (!confirm(`Are you sure you want to ${actionWord} ${targetUser.name}?`)) return;

    try {
      const res = await fetchApi(`/users/${targetUser._id}/block`, {
        method: 'PATCH',
        body: JSON.stringify({ isBlocked: nextBlocked }),
      });

      if (res.success) {
        toast.success(`User successfully ${nextBlocked ? 'blocked' : 'unblocked'}.`);
        loadAllAdminData();
      } else {
        toast.error(res.message || 'Failed to update user block status.');
      }
    } catch {
      toast.error('Failed to update user block status.');
    }
  };

  // Handle Service Image Upload to ImgBB / Local
  const handleServiceImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingServiceImg(true);
    try {
      const formData = new FormData();
      formData.append('image', file);

      const res = await fetchApi('/upload', {
        method: 'POST',
        body: formData,
      });

      if (res.success && res.url) {
        setServiceForm((prev) => ({ ...prev, image: res.url }));
        toast.success('Service image uploaded successfully!');
      } else {
        toast.error(res.message || 'Upload failed.');
      }
    } catch {
      toast.error('Upload failed.');
    } finally {
      setIsUploadingServiceImg(false);
    }
  };

  // Handle Admin Profile Update
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingProfile(true);

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
        toast.success('Admin profile updated!');
        updateUser(res.user);
      } else {
        toast.error(res.message || 'Failed to update profile.');
      }
    } catch {
      toast.error('Failed to update profile.');
    } finally {
      setIsSavingProfile(false);
    }
  };

  const filteredAppointments = appointments.filter((app) => {
    if (appointmentFilter === 'all') return true;
    return app.status === appointmentFilter;
  });

  const filteredServices = services.filter((srv) => {
    if (!serviceSearch.trim()) return true;
    return (
      srv.serviceName.toLowerCase().includes(serviceSearch.toLowerCase()) ||
      srv.category.toLowerCase().includes(serviceSearch.toLowerCase())
    );
  });

  return (
    <ProtectedRoute requiredRole="admin">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        {/* Admin Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-rose-100">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-100 text-rose-800 text-xs font-bold uppercase tracking-wider mb-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Admin Control Center</span>
            </div>
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
              SalonBook Administration
            </h1>
            <p className="text-sm text-gray-500">
              Manage salon services, confirm appointments, monitor users & stripe transactions.
            </p>
          </div>

          {/* Navigation Bar / Tabs */}
          <div className="flex items-center gap-1.5 p-1.5 bg-rose-50/70 rounded-2xl border border-rose-100 overflow-x-auto scrollbar-none">
            <button
              onClick={() => setActiveTab('overview')}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                activeTab === 'overview' ? 'bg-white text-rose-700 shadow-sm' : 'text-gray-600 hover:text-rose-600'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Overview</span>
            </button>

            <button
              onClick={() => setActiveTab('services')}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                activeTab === 'services' ? 'bg-white text-rose-700 shadow-sm' : 'text-gray-600 hover:text-rose-600'
              }`}
            >
              <Scissors className="w-4 h-4" />
              <span>Services ({services.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('appointments')}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                activeTab === 'appointments' ? 'bg-white text-rose-700 shadow-sm' : 'text-gray-600 hover:text-rose-600'
              }`}
            >
              <CalendarCheck2 className="w-4 h-4" />
              <span>Appointments ({appointments.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('users')}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                activeTab === 'users' ? 'bg-white text-rose-700 shadow-sm' : 'text-gray-600 hover:text-rose-600'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Users ({users.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('transactions')}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                activeTab === 'transactions' ? 'bg-white text-rose-700 shadow-sm' : 'text-gray-600 hover:text-rose-600'
              }`}
            >
              <Receipt className="w-4 h-4" />
              <span>Transactions ({transactions.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('profile')}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                activeTab === 'profile' ? 'bg-white text-rose-700 shadow-sm' : 'text-gray-600 hover:text-rose-600'
              }`}
            >
              <UserIcon className="w-4 h-4" />
              <span>Profile</span>
            </button>
          </div>
        </div>

        {/* Content Tabs */}
        {isLoading ? (
          <div className="py-24 flex flex-col items-center justify-center">
            <Loader2 className="w-10 h-10 text-rose-600 animate-spin mb-3" />
            <p className="text-sm font-semibold text-gray-600">Loading admin control center...</p>
          </div>
        ) : (
          <div>
            {/* 1. OVERVIEW TAB */}
            {activeTab === 'overview' && (
              <div className="space-y-10">
                {/* 6 Key Metrics Cards */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                  <div className="bg-white p-5 rounded-3xl border border-rose-100 shadow-sm">
                    <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Registered Clients</p>
                    <p className="text-3xl font-black text-gray-900 mt-1">{stats.totalCustomers}</p>
                  </div>

                  <div className="bg-white p-5 rounded-3xl border border-rose-100 shadow-sm">
                    <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Active Services</p>
                    <p className="text-3xl font-black text-rose-600 mt-1">{stats.totalActiveServices}</p>
                  </div>

                  <div className="bg-white p-5 rounded-3xl border border-rose-100 shadow-sm">
                    <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Total Bookings</p>
                    <p className="text-3xl font-black text-gray-900 mt-1">{stats.totalAppointments}</p>
                  </div>

                  <div className="bg-white p-5 rounded-3xl border border-amber-100 shadow-sm">
                    <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Pending</p>
                    <p className="text-3xl font-black text-amber-600 mt-1">{stats.pendingAppointments}</p>
                  </div>

                  <div className="bg-white p-5 rounded-3xl border border-emerald-100 shadow-sm">
                    <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Confirmed</p>
                    <p className="text-3xl font-black text-emerald-600 mt-1">{stats.confirmedAppointments}</p>
                  </div>

                  <div className="bg-white p-5 rounded-3xl border border-teal-100 shadow-sm">
                    <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Total Revenue</p>
                    <p className="text-3xl font-black text-teal-600 mt-1">${stats.totalRevenue}</p>
                  </div>
                </div>

                {/* Quick Lists: Pending Appointments & Recent Transactions */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Left: Pending Appointments needing review */}
                  <div className="bg-white rounded-3xl border border-rose-100 shadow-sm p-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold text-gray-900 text-lg">Pending Requests Needing Action</h3>
                      <button
                        onClick={() => {
                          setActiveTab('appointments');
                          setAppointmentFilter('pending');
                        }}
                        className="text-xs font-bold text-rose-600 hover:underline"
                      >
                        View All
                      </button>
                    </div>

                    {appointments.filter((a) => a.status === 'pending').length === 0 ? (
                      <p className="text-sm text-gray-500 py-6 text-center">No pending appointments right now.</p>
                    ) : (
                      <div className="space-y-3">
                        {appointments
                          .filter((a) => a.status === 'pending')
                          .slice(0, 4)
                          .map((item) => (
                            <div
                              key={item._id}
                              className="p-4 rounded-2xl bg-amber-50/50 border border-amber-100 flex items-center justify-between gap-3"
                            >
                              <div>
                                <p className="font-bold text-gray-900 text-sm">
                                  {item.serviceId?.serviceName || 'Custom Service'}
                                </p>
                                <p className="text-xs text-gray-600">
                                  Client: {item.customerId?.name} ({item.customerId?.email})
                                </p>
                                <p className="text-xs text-amber-700 font-semibold mt-0.5">
                                  {item.appointmentDate} • {item.timeSlot}
                                </p>
                              </div>
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => handleConfirmAppointment(item._id)}
                                  className="px-3 py-1.5 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-sm"
                                >
                                  Confirm
                                </button>
                                <button
                                  onClick={() => handleCancelAppointment(item._id)}
                                  className="px-2.5 py-1.5 rounded-xl text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100"
                                >
                                  Reject
                                </button>
                              </div>
                            </div>
                          ))}
                      </div>
                    )}
                  </div>

                  {/* Right: Recent Paid Transactions */}
                  <div className="bg-white rounded-3xl border border-rose-100 shadow-sm p-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold text-gray-900 text-lg">Recent Verified Payments</h3>
                      <button onClick={() => setActiveTab('transactions')} className="text-xs font-bold text-rose-600 hover:underline">
                        View All
                      </button>
                    </div>

                    {transactions.length === 0 ? (
                      <p className="text-sm text-gray-500 py-6 text-center">No transactions recorded yet.</p>
                    ) : (
                      <div className="space-y-3">
                        {transactions.slice(0, 4).map((t) => (
                          <div
                            key={t._id}
                            className="p-4 rounded-2xl bg-emerald-50/40 border border-emerald-100 flex items-center justify-between gap-3"
                          >
                            <div>
                              <p className="font-bold text-gray-900 text-sm">{t.customerId?.name || 'Customer'}</p>
                              <p className="text-xs text-gray-600">
                                {t.appointmentId?.serviceId?.serviceName || 'Salon Service'}
                              </p>
                              <span className="text-[10px] font-mono text-gray-400">
                                Stripe Ref: {t.stripeSessionId.slice(-10)}
                              </span>
                            </div>
                            <div className="text-right">
                              <span className="font-black text-emerald-700 text-base">${t.amount}</span>
                              <span className="block text-[10px] font-bold text-emerald-600 uppercase">Paid</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* 2. MANAGE SERVICES TAB */}
            {activeTab === 'services' && (
              <div className="bg-white rounded-3xl border border-rose-100 shadow-sm p-6 sm:p-8 space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">Manage Salon Services</h3>
                    <p className="text-xs text-gray-500 mt-1">
                      Add new services, update pricing and durations, activate or deactivate from catalog.
                    </p>
                  </div>

                  <button
                    onClick={handleOpenAddService}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-extrabold text-white bg-rose-600 hover:bg-rose-700 shadow-md shadow-rose-200 transition-all self-start sm:self-auto"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add New Service</span>
                  </button>
                </div>

                {/* Filter and Search */}
                <div className="relative max-w-md">
                  <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search services by title or category..."
                    value={serviceSearch}
                    onChange={(e) => setServiceSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-gray-200 text-xs outline-none focus:border-rose-500"
                  />
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-rose-100 text-[11px] font-extrabold uppercase tracking-wider text-gray-500">
                        <th className="py-3 px-4">Service</th>
                        <th className="py-3 px-4">Category</th>
                        <th className="py-3 px-4">Price</th>
                        <th className="py-3 px-4">Duration</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-rose-50 text-sm">
                      {filteredServices.map((srv) => (
                        <tr key={srv._id} className="hover:bg-rose-50/30 transition-colors">
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-3">
                              <img
                                src={srv.image}
                                alt={srv.serviceName}
                                className="w-12 h-12 rounded-xl object-cover"
                              />
                              <div>
                                <p className="font-bold text-gray-900">{srv.serviceName}</p>
                                <p className="text-xs text-gray-500 line-clamp-1">{srv.description}</p>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-4 text-xs font-semibold text-gray-700">{srv.category}</td>
                          <td className="py-4 px-4 font-bold text-gray-900">${srv.price}</td>
                          <td className="py-4 px-4 text-xs text-gray-600">{srv.duration} mins</td>
                          <td className="py-4 px-4">
                            <button
                              onClick={() => handleToggleServiceStatus(srv)}
                              className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
                                srv.status === 'active'
                                  ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                              }`}
                              title="Click to toggle active / inactive"
                            >
                              {srv.status === 'active' ? 'Active' : 'Inactive'}
                            </button>
                          </td>
                          <td className="py-4 px-4 text-right space-x-2">
                            <button
                              onClick={() => handleOpenEditService(srv)}
                              className="p-2 rounded-xl text-gray-500 hover:text-rose-600 hover:bg-rose-50"
                              title="Edit Service"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteService(srv._id)}
                              className="p-2 rounded-xl text-gray-500 hover:text-red-600 hover:bg-red-50"
                              title="Delete Service"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* 3. MANAGE APPOINTMENTS TAB */}
            {activeTab === 'appointments' && (
              <div className="bg-white rounded-3xl border border-rose-100 shadow-sm p-6 sm:p-8 space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">Manage Appointments</h3>
                    <p className="text-xs text-gray-500 mt-1">
                      Review customer booking requests, confirm pending appointments, or cancel sessions.
                    </p>
                  </div>

                  {/* Filter Pills */}
                  <div className="flex items-center gap-2">
                    {(['all', 'pending', 'confirmed', 'cancelled'] as const).map((st) => (
                      <button
                        key={st}
                        onClick={() => setAppointmentFilter(st)}
                        className={`px-3.5 py-1.5 rounded-full text-xs font-bold capitalize transition-all ${
                          appointmentFilter === st
                            ? 'bg-rose-600 text-white shadow-sm'
                            : 'bg-rose-50 text-gray-700 hover:bg-rose-100'
                        }`}
                      >
                        {st}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-rose-100 text-[11px] font-extrabold uppercase tracking-wider text-gray-500">
                        <th className="py-3 px-4">Client</th>
                        <th className="py-3 px-4">Service</th>
                        <th className="py-3 px-4">Date & Time</th>
                        <th className="py-3 px-4">Price</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-4">Payment</th>
                        <th className="py-3 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-rose-50 text-sm">
                      {filteredAppointments.map((item) => (
                        <tr key={item._id} className="hover:bg-rose-50/30 transition-colors">
                          <td className="py-4 px-4">
                            <div>
                              <p className="font-bold text-gray-900">{item.customerId?.name || 'Customer'}</p>
                              <p className="text-xs text-gray-500">{item.customerId?.email}</p>
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <p className="font-semibold text-gray-900">{item.serviceId?.serviceName || 'Custom Service'}</p>
                            <span className="text-xs text-rose-600">{item.serviceId?.category}</span>
                          </td>
                          <td className="py-4 px-4">
                            <p className="font-medium text-gray-900">{item.appointmentDate}</p>
                            <p className="text-xs text-gray-500">{item.timeSlot}</p>
                          </td>
                          <td className="py-4 px-4 font-bold text-gray-900">${item.servicePrice}</td>
                          <td className="py-4 px-4">
                            <span
                              className={`px-2.5 py-1 rounded-full text-xs font-bold capitalize ${
                                item.status === 'confirmed'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : item.status === 'cancelled'
                                  ? 'bg-rose-100 text-rose-800'
                                  : 'bg-amber-100 text-amber-800'
                              }`}
                            >
                              {item.status}
                            </span>
                          </td>
                          <td className="py-4 px-4">
                            <span
                              className={`px-2 py-0.5 rounded-full text-xs font-bold uppercase ${
                                item.paymentStatus === 'paid'
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                  : 'bg-gray-100 text-gray-600'
                              }`}
                            >
                              {item.paymentStatus}
                            </span>
                          </td>
                          <td className="py-4 px-4 text-right space-x-1.5">
                            <button
                              onClick={() => setSelectedAppointment(item)}
                              className="p-1.5 rounded-xl text-gray-500 hover:text-rose-600 hover:bg-rose-50"
                              title="View Details"
                            >
                              <Eye className="w-4 h-4" />
                            </button>

                            {/* Confirm (Pending only) */}
                            {item.status === 'pending' && (
                              <button
                                onClick={() => handleConfirmAppointment(item._id)}
                                className="px-2.5 py-1 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700"
                              >
                                Confirm
                              </button>
                            )}

                            {/* Cancel (Pending or Confirmed) */}
                            {item.status !== 'cancelled' && (
                              <button
                                onClick={() => handleCancelAppointment(item._id)}
                                className="px-2.5 py-1 rounded-xl text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100"
                              >
                                Cancel
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* 4. MANAGE USERS TAB */}
            {activeTab === 'users' && (
              <div className="bg-white rounded-3xl border border-rose-100 shadow-sm p-6 sm:p-8 space-y-6">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">Manage Registered Customers</h3>
                  <p className="text-xs text-gray-500 mt-1">
                    View customer profiles and manage platform access permissions. Blocked customers cannot request appointments.
                  </p>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-rose-100 text-[11px] font-extrabold uppercase tracking-wider text-gray-500">
                        <th className="py-3 px-4">User</th>
                        <th className="py-3 px-4">Email</th>
                        <th className="py-3 px-4">Phone</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-rose-50 text-sm">
                      {users.map((u) => (
                        <tr key={u._id} className="hover:bg-rose-50/30 transition-colors">
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-3">
                              <img
                                src={u.image || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'}
                                alt={u.name}
                                className="w-10 h-10 rounded-full object-cover ring-2 ring-rose-200"
                              />
                              <div>
                                <p className="font-bold text-gray-900">{u.name}</p>
                                <span className="text-[10px] text-gray-400">ID: {u._id.slice(-6)}</span>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-4 text-gray-600">{u.email}</td>
                          <td className="py-4 px-4 text-gray-600">{u.phone || '—'}</td>
                          <td className="py-4 px-4">
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-bold ${
                                u.isBlocked
                                  ? 'bg-red-100 text-red-800'
                                  : 'bg-emerald-100 text-emerald-800'
                              }`}
                            >
                              {u.isBlocked ? 'Blocked' : 'Active'}
                            </span>
                          </td>
                          <td className="py-4 px-4 text-right">
                            <button
                              onClick={() => handleToggleBlockUser(u)}
                              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                                u.isBlocked
                                  ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                                  : 'bg-red-50 text-red-700 hover:bg-red-100'
                              }`}
                            >
                              {u.isBlocked ? 'Unblock User' : 'Block User'}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* 5. TRANSACTIONS TAB */}
            {activeTab === 'transactions' && (
              <div className="bg-white rounded-3xl border border-rose-100 shadow-sm p-6 sm:p-8 space-y-6">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">Payment Transactions</h3>
                  <p className="text-xs text-gray-500 mt-1">
                    All completed Stripe transactions verified via webhook. Immutable records.
                  </p>
                </div>

                {transactions.length === 0 ? (
                  <div className="text-center py-16 text-gray-500 space-y-2">
                    <Receipt className="w-12 h-12 text-gray-300 mx-auto" />
                    <p className="text-base font-semibold">No Transactions Yet</p>
                    <p className="text-xs">Completed payments from Stripe checkout will appear here.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-rose-100 text-[11px] font-extrabold uppercase tracking-wider text-gray-500">
                          <th className="py-3 px-4">Customer</th>
                          <th className="py-3 px-4">Service</th>
                          <th className="py-3 px-4">Appointment Date</th>
                          <th className="py-3 px-4">Amount</th>
                          <th className="py-3 px-4">Stripe Reference</th>
                          <th className="py-3 px-4">Status</th>
                          <th className="py-3 px-4 text-right">Date</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-rose-50 text-sm">
                        {transactions.map((tr) => (
                          <tr key={tr._id} className="hover:bg-rose-50/30 transition-colors">
                            <td className="py-4 px-4 font-bold text-gray-900">
                              {tr.customerId?.name || 'Customer'}
                              <span className="block text-xs font-normal text-gray-500">
                                {tr.customerId?.email}
                              </span>
                            </td>
                            <td className="py-4 px-4 font-medium text-gray-800">
                              {tr.appointmentId?.serviceId?.serviceName || 'Custom Service'}
                            </td>
                            <td className="py-4 px-4 text-xs text-gray-600">
                              {tr.appointmentId?.appointmentDate || '—'}
                            </td>
                            <td className="py-4 px-4 font-black text-emerald-700">
                              ${tr.amount} <span className="text-xs font-normal text-gray-400 uppercase">{tr.currency}</span>
                            </td>
                            <td className="py-4 px-4 font-mono text-xs text-gray-500">
                              {tr.stripeSessionId.slice(0, 18)}...
                            </td>
                            <td className="py-4 px-4">
                              <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 capitalize">
                                {tr.status}
                              </span>
                            </td>
                            <td className="py-4 px-4 text-right text-xs text-gray-500">
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

            {/* 6. ADMIN PROFILE TAB */}
            {activeTab === 'profile' && (
              <div className="max-w-2xl bg-white rounded-3xl border border-rose-100 shadow-sm p-6 sm:p-10 space-y-6">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">Admin Profile</h3>
                  <p className="text-xs text-gray-500 mt-1">
                    Manage your administrator credentials and profile details.
                  </p>
                </div>

                <form onSubmit={handleSaveProfile} className="space-y-6">
                  <div className="flex items-center gap-6">
                    <img
                      src={profileImage || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80'}
                      alt="Admin Avatar"
                      className="w-20 h-20 rounded-full object-cover ring-4 ring-rose-200"
                    />
                    <div>
                      <span className="text-xs font-bold text-rose-700 uppercase tracking-wider block">Administrator</span>
                      <p className="text-xs text-gray-500 mt-1">Role is immutable and securely assigned.</p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                      Profile Image URL
                    </label>
                    <input
                      type="url"
                      value={profileImage}
                      onChange={(e) => setProfileImage(e.target.value)}
                      className="w-full px-4 py-3 rounded-2xl border border-gray-200 text-sm outline-none focus:border-rose-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={profileName}
                      onChange={(e) => setProfileName(e.target.value)}
                      className="w-full px-4 py-3 rounded-2xl border border-gray-200 text-sm outline-none focus:border-rose-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-1.5">
                      Email Address (Read-Only)
                    </label>
                    <input
                      type="email"
                      disabled
                      value={user?.email || ''}
                      className="w-full px-4 py-3 rounded-2xl border border-gray-200 bg-gray-50 text-gray-500 text-sm cursor-not-allowed"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={profilePhone}
                      onChange={(e) => setProfilePhone(e.target.value)}
                      className="w-full px-4 py-3 rounded-2xl border border-gray-200 text-sm outline-none focus:border-rose-500"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSavingProfile}
                    className="px-8 py-3.5 rounded-2xl text-sm font-extrabold text-white bg-rose-600 hover:bg-rose-700 shadow-md transition-all disabled:opacity-50"
                  >
                    {isSavingProfile ? 'Saving...' : 'Save Profile Changes'}
                  </button>
                </form>
              </div>
            )}
          </div>
        )}

        {/* Modal: Add / Edit Service */}
        {serviceModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="max-w-xl w-full bg-white rounded-3xl shadow-2xl border border-rose-100 max-h-[90vh] overflow-y-auto p-6 sm:p-8 space-y-6">
              <div className="flex items-center justify-between border-b border-rose-100 pb-4">
                <h3 className="text-xl font-bold text-gray-900">
                  {editingServiceId ? 'Update Service' : 'Add New Salon Service'}
                </h3>
                <button
                  onClick={() => setServiceModalOpen(false)}
                  className="p-1.5 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100"
                >
                  <XCircle className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveService} className="space-y-4">
                {/* Service Name */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                    Service Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="E.g. Signature Precision Haircut & Styling"
                    value={serviceForm.serviceName}
                    onChange={(e) => setServiceForm({ ...serviceForm, serviceName: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-rose-500"
                  />
                </div>

                {/* Category & Status */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                      Category *
                    </label>
                    <select
                      value={serviceForm.category}
                      onChange={(e) => setServiceForm({ ...serviceForm, category: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-rose-500 bg-white"
                    >
                      {CATEGORIES.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                      Status *
                    </label>
                    <select
                      value={serviceForm.status}
                      onChange={(e) => setServiceForm({ ...serviceForm, status: e.target.value as any })}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-rose-500 bg-white"
                    >
                      <option value="active">Active (Visible in Catalog)</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>
                </div>

                {/* Price and Duration */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                      Price ($ USD) *
                    </label>
                    <input
                      type="number"
                      step="1"
                      min="1"
                      required
                      placeholder="55"
                      value={serviceForm.price}
                      onChange={(e) => setServiceForm({ ...serviceForm, price: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-rose-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                      Duration (Minutes) *
                    </label>
                    <input
                      type="number"
                      step="5"
                      min="5"
                      required
                      placeholder="45"
                      value={serviceForm.duration}
                      onChange={(e) => setServiceForm({ ...serviceForm, duration: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-rose-500"
                    />
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                    Description *
                  </label>
                  <textarea
                    rows={3}
                    required
                    placeholder="Detailed explanation of what the customer receives during this salon treatment..."
                    value={serviceForm.description}
                    onChange={(e) => setServiceForm({ ...serviceForm, description: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-rose-500 resize-none"
                  />
                </div>

                {/* Service Image (Upload or URL) */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700">
                    Service Image * (Upload file or paste image URL)
                  </label>
                  <div className="flex items-center gap-3">
                    <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-rose-200 text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 transition-colors">
                      <Upload className="w-3.5 h-3.5" />
                      <span>{isUploadingServiceImg ? 'Uploading...' : 'Upload Image'}</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleServiceImageUpload}
                        className="hidden"
                        disabled={isUploadingServiceImg}
                      />
                    </label>
                    <input
                      type="url"
                      placeholder="https://images.unsplash.com/..."
                      value={serviceForm.image}
                      onChange={(e) => setServiceForm({ ...serviceForm, image: e.target.value })}
                      className="flex-1 px-4 py-2 rounded-xl border border-gray-200 text-xs outline-none focus:border-rose-500"
                    />
                  </div>

                  {serviceForm.image && (
                    <div className="mt-2 flex items-center gap-3">
                      <img
                        src={serviceForm.image}
                        alt="Preview"
                        className="w-14 h-14 rounded-xl object-cover ring-2 ring-rose-200"
                      />
                      <span className="text-xs text-emerald-600 font-semibold">Image ready for saving</span>
                    </div>
                  )}
                </div>

                <div className="pt-4 flex items-center justify-end gap-3 border-t border-rose-100">
                  <button
                    type="button"
                    onClick={() => setServiceModalOpen(false)}
                    className="px-5 py-2.5 rounded-full text-xs font-semibold text-gray-600 hover:bg-gray-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingService || isUploadingServiceImg}
                    className="px-6 py-2.5 rounded-full text-xs font-extrabold text-white bg-rose-600 hover:bg-rose-700 shadow-md transition-all disabled:opacity-50 flex items-center gap-1.5"
                  >
                    {isSubmittingService ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <span>{editingServiceId ? 'Update Service' : 'Create Service'}</span>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal: View Appointment Details */}
        {selectedAppointment && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl border border-rose-100 p-6 sm:p-8 space-y-6">
              <div className="flex items-center justify-between border-b border-rose-100 pb-4">
                <h3 className="text-xl font-bold text-gray-900">Appointment Request</h3>
                <button
                  onClick={() => setSelectedAppointment(null)}
                  className="p-1.5 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100"
                >
                  <XCircle className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4 text-sm">
                <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200 space-y-1">
                  <span className="text-xs font-bold uppercase tracking-wider text-gray-500">Client Details:</span>
                  <p className="font-bold text-gray-900">{selectedAppointment.customerId?.name}</p>
                  <p className="text-xs text-gray-600">{selectedAppointment.customerId?.email}</p>
                  <p className="text-xs text-gray-600">Phone: {selectedAppointment.customerId?.phone || 'Not provided'}</p>
                </div>

                <div className="p-4 rounded-2xl bg-rose-50/50 border border-rose-100 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-gray-900">{selectedAppointment.serviceId?.serviceName}</span>
                    <span className="font-black text-rose-600">${selectedAppointment.servicePrice}</span>
                  </div>
                  <p className="text-xs text-gray-600">
                    Category: {selectedAppointment.serviceId?.category} ({selectedAppointment.serviceId?.duration} mins)
                  </p>
                  <p className="text-xs text-gray-700 font-semibold pt-1 border-t border-rose-100">
                    Date & Time: {selectedAppointment.appointmentDate} at {selectedAppointment.timeSlot}
                  </p>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span>Status: <strong className="capitalize text-gray-900">{selectedAppointment.status}</strong></span>
                  <span>Payment: <strong className="uppercase text-emerald-600">{selectedAppointment.paymentStatus}</strong></span>
                </div>

                {selectedAppointment.message && (
                  <div>
                    <span className="text-xs font-semibold text-gray-500">Client Note:</span>
                    <p className="text-xs text-gray-700 italic mt-0.5 p-2 bg-gray-50 rounded-xl">
                      "{selectedAppointment.message}"
                    </p>
                  </div>
                )}
              </div>

              <div className="pt-2 flex items-center justify-end gap-3 border-t border-rose-100">
                {selectedAppointment.status === 'pending' && (
                  <button
                    onClick={() => handleConfirmAppointment(selectedAppointment._id)}
                    className="px-5 py-2.5 rounded-full text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-sm"
                  >
                    Confirm Appointment
                  </button>
                )}
                {selectedAppointment.status !== 'cancelled' && (
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
