'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { fetchApi } from '@/lib/api';
import { toast } from 'sonner';
import { Scissors, User, Mail, Lock, Image as ImageIcon, Loader2, ArrowRight, Upload } from 'lucide-react';

export default function SignUpPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Validate password rules: Min 6 characters, one uppercase, one lowercase
  const validatePassword = (pass: string): { valid: boolean; message?: string } => {
    if (pass.length < 6) return { valid: false, message: 'Password must be at least 6 characters long.' };
    if (!/[A-Z]/.test(pass)) return { valid: false, message: 'Password must include at least one uppercase letter.' };
    if (!/[a-z]/.test(pass)) return { valid: false, message: 'Password must include at least one lowercase letter.' };
    return { valid: true };
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImageFile(file);
    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append('image', file);

      const res = await fetchApi('/upload', {
        method: 'POST',
        body: formData,
      });

      if (res.success && res.url) {
        setImageUrl(res.url);
        toast.success('Profile image uploaded!');
      } else {
        toast.error(res.message || 'Image upload failed. You can also paste an image URL.');
      }
    } catch {
      toast.error('Image upload failed.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error('Please enter your full name.');
      return;
    }

    if (!email.trim()) {
      toast.error('Please enter your email address.');
      return;
    }

    const passCheck = validatePassword(password);
    if (!passCheck.valid) {
      toast.error(passCheck.message);
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetchApi('/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          password,
          image: imageUrl || undefined,
        }),
      });

      if (res.success && res.token && res.user) {
        toast.success(res.message || 'Account created successfully!');
        login(res.token, res.user);
        router.push('/dashboard/customer');
      } else {
        toast.error(res.message || 'Registration failed.');
      }
    } catch (err: any) {
      toast.error(err.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-16 bg-gradient-to-b from-rose-50/50 to-white">
      <div className="max-w-md w-full bg-white rounded-3xl border border-rose-100 shadow-xl p-8 sm:p-10 space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 bg-gradient-to-tr from-rose-600 to-pink-500 rounded-2xl flex items-center justify-center text-white mx-auto shadow-md shadow-rose-200">
            <Scissors className="w-6 h-6 -rotate-45" />
          </div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Create Account</h1>
          <p className="text-sm text-gray-600">
            Join SalonBook to schedule and pay for your salon appointments.
          </p>
        </div>

        {/* Registration Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Full Name */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
              Full Name *
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                placeholder="Jane Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full pl-11 pr-4 py-3 rounded-2xl border border-gray-200 focus:border-rose-500 focus:ring-2 focus:ring-rose-200 text-sm outline-none transition-all"
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
              Email Address *
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                placeholder="jane@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-11 pr-4 py-3 rounded-2xl border border-gray-200 focus:border-rose-500 focus:ring-2 focus:ring-rose-200 text-sm outline-none transition-all"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
              Password *
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                placeholder="At least 6 chars, 1 upper & 1 lower"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-11 pr-4 py-3 rounded-2xl border border-gray-200 focus:border-rose-500 focus:ring-2 focus:ring-rose-200 text-sm outline-none transition-all"
              />
            </div>
            <p className="text-[11px] text-gray-500 mt-1">
              Must contain ≥6 characters, 1 uppercase, and 1 lowercase letter.
            </p>
          </div>

          {/* Profile Image (Upload or URL) */}
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-700">
              Profile Image (Upload or URL)
            </label>

            <div className="flex items-center gap-3">
              <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-rose-200 text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 transition-colors">
                <Upload className="w-3.5 h-3.5" />
                <span>{isUploading ? 'Uploading...' : 'Upload Image'}</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                  disabled={isUploading}
                />
              </label>

              <span className="text-xs text-gray-400 uppercase font-semibold">or URL</span>

              <div className="relative flex-1">
                <ImageIcon className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="url"
                  placeholder="https://..."
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-gray-200 text-xs outline-none focus:border-rose-500"
                />
              </div>
            </div>

            {imageUrl && (
              <div className="flex items-center gap-2 text-xs text-emerald-600 font-semibold">
                <img src={imageUrl} alt="Preview" className="w-8 h-8 rounded-full object-cover ring-1 ring-emerald-400" />
                <span>Image loaded successfully</span>
              </div>
            )}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isLoading || isUploading}
            className="w-full py-3.5 rounded-2xl text-sm font-extrabold text-white bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 shadow-md shadow-rose-200 hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <span>Create Customer Account</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Footer Link */}
        <p className="text-center text-xs text-gray-600">
          Already have an account?{' '}
          <Link href="/signin" className="font-bold text-rose-600 hover:text-rose-700">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}
