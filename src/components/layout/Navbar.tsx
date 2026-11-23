'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Sparkles, Menu, X, ChevronDown, User, LayoutDashboard, LogOut, Scissors } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Determine dashboard link based on role
  const dashboardLink = user?.role === 'admin' ? '/dashboard/admin' : '/dashboard/customer';

  const navLinks = [
    { name: 'Home', href: '/' },
    { name: 'Browse Services', href: '/services' },
  ];

  const handleLogout = () => {
    setDropdownOpen(false);
    setMobileMenuOpen(false);
    logout();
    router.push('/');
  };

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-rose-100 shadow-sm transition-all duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-rose-600 to-pink-500 flex items-center justify-center text-white shadow-md shadow-rose-200 group-hover:scale-105 transition-transform duration-200">
            <Scissors className="w-5 h-5 -rotate-45" />
          </div>
          <div>
            <span className="text-2xl font-extrabold tracking-tight bg-gradient-to-r from-rose-700 via-rose-600 to-pink-600 bg-clip-text text-transparent">
              SalonBook
            </span>
            <span className="hidden sm:block text-[10px] tracking-widest uppercase font-semibold text-rose-400">
              Luxury Beauty & Spa
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.name}
                href={link.href}
                className={`px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 ${
                  isActive
                    ? 'bg-rose-50 text-rose-700'
                    : 'text-gray-700 hover:text-rose-600 hover:bg-rose-50/50'
                }`}
              >
                {link.name}
              </Link>
            );
          })}

          {user && (
            <Link
              href={dashboardLink}
              className={`px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 ${
                pathname.startsWith('/dashboard')
                  ? 'bg-rose-50 text-rose-700'
                  : 'text-gray-700 hover:text-rose-600 hover:bg-rose-50/50'
              }`}
            >
              Dashboard
            </Link>
          )}
        </nav>

        {/* Right Side: Auth buttons or User Profile Dropdown */}
        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-3 p-1.5 pr-3 rounded-full border border-rose-200 hover:border-rose-300 hover:bg-rose-50/40 transition-all duration-200 focus:outline-none"
              >
                <img
                  src={
                    user.image ||
                    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'
                  }
                  alt={user.name}
                  className="w-9 h-9 rounded-full object-cover ring-2 ring-rose-400"
                />
                <div className="text-left">
                  <p className="text-sm font-bold text-gray-800 leading-tight line-clamp-1 max-w-[120px]">
                    {user.name}
                  </p>
                  <span className="text-[11px] font-semibold text-rose-600 capitalize">
                    {user.role}
                  </span>
                </div>
                <ChevronDown
                  className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${
                    dropdownOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {/* Dropdown Menu */}
              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-rose-100 py-2 animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="px-4 py-3 border-b border-rose-100">
                    <p className="text-sm font-bold text-gray-900">{user.name}</p>
                    <p className="text-xs text-gray-500 truncate">{user.email}</p>
                    <span className="inline-block mt-1 px-2 py-0.5 text-[10px] font-bold uppercase rounded-md bg-rose-100 text-rose-700">
                      {user.role}
                    </span>
                  </div>

                  <Link
                    href={dashboardLink}
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-rose-50 hover:text-rose-700 transition-colors"
                  >
                    <LayoutDashboard className="w-4 h-4 text-rose-500" />
                    Dashboard
                  </Link>

                  <Link
                    href={`${dashboardLink}#profile`}
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-rose-50 hover:text-rose-700 transition-colors"
                  >
                    <User className="w-4 h-4 text-rose-500" />
                    My Profile
                  </Link>

                  <div className="border-t border-rose-100 mt-1 pt-1">
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link
                href="/signin"
                className="px-5 py-2.5 text-sm font-bold text-gray-700 hover:text-rose-600 transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/signup"
                className="px-6 py-2.5 rounded-full text-sm font-bold text-white bg-gradient-to-r from-rose-600 to-pink-500 hover:from-rose-700 hover:to-pink-600 shadow-md shadow-rose-200 transition-all hover:shadow-lg hover:-translate-y-0.5"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Menu Button */}
        <div className="md:hidden flex items-center">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-xl text-gray-700 hover:bg-rose-50 hover:text-rose-600 focus:outline-none"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-rose-100 px-4 pt-2 pb-6 space-y-3">
          <div className="flex flex-col gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`px-4 py-2.5 rounded-xl text-sm font-semibold ${
                  pathname === link.href ? 'bg-rose-50 text-rose-700' : 'text-gray-700 hover:bg-rose-50/50'
                }`}
              >
                {link.name}
              </Link>
            ))}

            {user && (
              <Link
                href={dashboardLink}
                onClick={() => setMobileMenuOpen(false)}
                className={`px-4 py-2.5 rounded-xl text-sm font-semibold ${
                  pathname.startsWith('/dashboard')
                    ? 'bg-rose-50 text-rose-700'
                    : 'text-gray-700 hover:bg-rose-50/50'
                }`}
              >
                Dashboard ({user.role})
              </Link>
            )}
          </div>

          <div className="pt-3 border-t border-rose-100">
            {user ? (
              <div className="space-y-3">
                <div className="flex items-center gap-3 px-2">
                  <img
                    src={
                      user.image ||
                      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'
                    }
                    alt={user.name}
                    className="w-10 h-10 rounded-full object-cover ring-2 ring-rose-400"
                  />
                  <div>
                    <p className="font-bold text-gray-900">{user.name}</p>
                    <p className="text-xs text-gray-500">{user.email}</p>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2.5 rounded-xl text-sm font-bold text-red-600 bg-red-50 hover:bg-red-100 flex items-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <Link
                  href="/signin"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-center py-2.5 rounded-xl text-sm font-bold text-gray-700 border border-gray-200 hover:bg-gray-50"
                >
                  Sign In
                </Link>
                <Link
                  href="/signup"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-center py-2.5 rounded-xl text-sm font-bold text-white bg-rose-600 hover:bg-rose-700 shadow-sm"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
