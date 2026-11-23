'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { fetchApi } from '@/lib/api';
import { ServiceCard, ServiceItem } from '@/components/services/ServiceCard';
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Star,
  Users,
  CalendarCheck,
  HeartHandshake,
  Loader2,
} from 'lucide-react';

interface CategoryCount {
  category: string;
  count: number;
}

export default function HomePage() {
  const [featuredServices, setFeaturedServices] = useState<ServiceItem[]>([]);
  const [categories, setCategories] = useState<CategoryCount[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadHomeData = async () => {
      try {
        const [servicesRes, categoriesRes] = await Promise.all([
          fetchApi<ServiceItem[]>('/services/featured'),
          fetchApi<CategoryCount[]>('/services/categories'),
        ]);

        if (servicesRes.success && servicesRes.data) {
          setFeaturedServices(servicesRes.data);
        }
        if (categoriesRes.success && categoriesRes.data) {
          setCategories(categoriesRes.data);
        }
      } catch (err) {
        console.error('Failed to load home page data', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadHomeData();
  }, []);

  const defaultCategories = [
    { category: 'Haircut & Styling', icon: '✂️', desc: 'Precision styling tailored to you' },
    { category: 'Hair Coloring', icon: '🎨', desc: 'Balayage, highlights & tints' },
    { category: 'Hair Treatment', icon: '✨', desc: 'Restorative keratin & hydration' },
    { category: 'Facial & Skincare', icon: '🌸', desc: 'Rejuvenating organic treatments' },
    { category: 'Makeup', icon: '💄', desc: 'Bridal & glamour artistry' },
    { category: 'Manicure & Pedicure', icon: '💅', desc: 'Deluxe spa nail care' },
    { category: 'Spa & Massage', icon: '🌿', desc: 'Aromatherapy & stone massage' },
  ];

  return (
    <div className="space-y-24 pb-20">
      {/* 1. Banner Section */}
      <section className="relative min-h-[580px] lg:min-h-[640px] flex items-center justify-center bg-slate-900 overflow-hidden">
        {/* Salon-themed Background Image */}
        <div
          className="absolute inset-0 bg-cover bg-center opacity-30 transform scale-105 transition-transform duration-1000"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=2000&q=80')`,
          }}
        />
        {/* Gradients */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/80 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-rose-950/60 via-transparent to-pink-950/50" />

        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6 pt-12 pb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-rose-500/20 border border-rose-400/30 text-rose-300 text-xs sm:text-sm font-semibold tracking-wide uppercase">
            <Sparkles className="w-4 h-4 text-rose-400" />
            <span>Elevate Your Beauty Experience</span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black text-white tracking-tight leading-tight">
            Indulge in Luxury <br />
            <span className="bg-gradient-to-r from-rose-400 via-pink-400 to-amber-200 bg-clip-text text-transparent">
              Salon Care & Styling
            </span>
          </h1>

          <p className="max-w-2xl mx-auto text-base sm:text-xl text-gray-300 leading-relaxed font-normal">
            Book appointment slots with world-class stylists, estheticians, and massage therapists. Experience five-star salon services tailored just for you.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link
              href="/services"
              className="w-full sm:w-auto px-8 py-4 rounded-full text-base font-extrabold text-white bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 shadow-xl shadow-rose-900/40 hover:shadow-rose-600/50 transition-all transform hover:-translate-y-1 flex items-center justify-center gap-2"
            >
              <span>Explore Salon Services</span>
              <ArrowRight className="w-5 h-5" />
            </Link>

            <Link
              href="/signin"
              className="w-full sm:w-auto px-8 py-4 rounded-full text-base font-bold text-white bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 transition-all flex items-center justify-center"
            >
              Sign In to Your Account
            </Link>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-3 gap-6 pt-10 max-w-xl mx-auto border-t border-white/10 text-white">
            <div>
              <p className="text-2xl sm:text-3xl font-black text-rose-400">99.8%</p>
              <p className="text-xs text-gray-400">Client Satisfaction</p>
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-black text-pink-400">15+</p>
              <p className="text-xs text-gray-400">Master Stylists</p>
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-black text-amber-300">24/7</p>
              <p className="text-xs text-gray-400">Online Booking</p>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Dynamic Section 1: Featured Salon Services */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
          <div>
            <div className="inline-flex items-center gap-2 text-rose-600 text-xs font-bold uppercase tracking-wider mb-2">
              <Sparkles className="w-4 h-4" />
              <span>Handpicked Perfection</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
              Featured Salon Services
            </h2>
            <p className="text-gray-600 text-sm sm:text-base mt-1">
              Browse our most sought-after salon treatments and styling sessions.
            </p>
          </div>

          <Link
            href="/services"
            className="inline-flex items-center gap-2 text-sm font-bold text-rose-600 hover:text-rose-700 group"
          >
            <span>View All Services</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {isLoading ? (
          <div className="py-20 flex flex-col items-center justify-center">
            <Loader2 className="w-10 h-10 text-rose-600 animate-spin mb-3" />
            <p className="text-sm font-semibold text-gray-600">Loading featured salon services...</p>
          </div>
        ) : featuredServices.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredServices.map((service) => (
              <ServiceCard key={service._id} service={service} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-rose-50/50 rounded-3xl border border-rose-100">
            <p className="text-gray-600 font-medium">No active services currently available.</p>
          </div>
        )}
      </section>

      {/* 3. Dynamic Section 2: Salon Service Categories */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 text-rose-600 text-xs font-bold uppercase tracking-wider mb-2">
            <span>Explore By Specialty</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
            Salon Service Categories
          </h2>
          <p className="text-gray-600 text-sm sm:text-base mt-2">
            Find the exact beauty treatment you desire, designed by expert professionals.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {defaultCategories.map((item) => {
            const countObj = categories.find((c) => c.category === item.category);
            const count = countObj ? countObj.count : null;

            return (
              <Link
                key={item.category}
                href={`/services?category=${encodeURIComponent(item.category)}`}
                className="group p-6 rounded-3xl bg-white border border-rose-100/80 shadow-sm hover:shadow-xl hover:border-rose-300 transition-all duration-300 text-center flex flex-col items-center justify-center transform hover:-translate-y-1"
              >
                <div className="w-14 h-14 rounded-2xl bg-rose-50 text-2xl flex items-center justify-center mb-3 group-hover:scale-110 group-hover:bg-rose-600 group-hover:text-white transition-all duration-300">
                  {item.icon}
                </div>
                <h3 className="text-base font-bold text-gray-900 group-hover:text-rose-600 transition-colors">
                  {item.category}
                </h3>
                <p className="text-xs text-gray-500 mt-1 line-clamp-1">{item.desc}</p>
                {count !== null && (
                  <span className="mt-3 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-50 text-rose-600">
                    {count} {count === 1 ? 'service' : 'services'}
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      </section>

      {/* 4. Additional Section: Why Choose SalonBook */}
      <section className="bg-gradient-to-b from-rose-50/70 to-white py-16 border-y border-rose-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
              Why Choose SalonBook?
            </h2>
            <p className="text-gray-600 text-sm sm:text-base mt-2">
              We redefine modern salon booking with luxury, reliability, and guaranteed satisfaction.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-3xl border border-rose-100 shadow-sm hover:shadow-md transition-shadow text-center space-y-4">
              <div className="w-14 h-14 bg-rose-100 text-rose-600 rounded-2xl flex items-center justify-center mx-auto">
                <Star className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Certified Stylists</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Every salon specialist in our network is licensed, thoroughly vetted, and trained in modern beauty trends.
              </p>
            </div>

            <div className="bg-white p-8 rounded-3xl border border-rose-100 shadow-sm hover:shadow-md transition-shadow text-center space-y-4">
              <div className="w-14 h-14 bg-pink-100 text-pink-600 rounded-2xl flex items-center justify-center mx-auto">
                <CalendarCheck className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Seamless Online Booking</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Choose your preferred date and time slot in seconds. Receive instant confirmation and appointment reminders.
              </p>
            </div>

            <div className="bg-white p-8 rounded-3xl border border-rose-100 shadow-sm hover:shadow-md transition-shadow text-center space-y-4">
              <div className="w-14 h-14 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center mx-auto">
                <ShieldCheck className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Secure Stripe Checkout</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Pay securely for your confirmed appointments using encrypted Stripe Checkout with card protection.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Additional Section: Customer Testimonials */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-1.5 text-amber-500 mb-2">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-4 h-4 fill-amber-400" />
            ))}
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
            Loved by Thousands of Clients
          </h2>
          <p className="text-gray-600 text-sm sm:text-base mt-2">
            Read authentic reviews from happy customers who rely on SalonBook for their regular appointments.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-8 rounded-3xl bg-white border border-rose-100 shadow-sm space-y-4">
            <p className="text-sm text-gray-700 italic leading-relaxed">
              "Booking my balayage and haircut took less than 2 minutes. The stylist was punctual, talented, and the salon atmosphere was pure bliss!"
            </p>
            <div className="flex items-center gap-3 pt-2">
              <img
                src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=120&q=80"
                alt="Emma Watson"
                className="w-10 h-10 rounded-full object-cover ring-2 ring-rose-300"
              />
              <div>
                <p className="text-sm font-bold text-gray-900">Emma Thornton</p>
                <p className="text-xs text-rose-600 font-semibold">Hair Coloring Client</p>
              </div>
            </div>
          </div>

          <div className="p-8 rounded-3xl bg-white border border-rose-100 shadow-sm space-y-4">
            <p className="text-sm text-gray-700 italic leading-relaxed">
              "The facial skincare treatment completely rejuvenated my skin. Paying via Stripe after confirmation was so smooth. Highly recommend!"
            </p>
            <div className="flex items-center gap-3 pt-2">
              <img
                src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80"
                alt="David Chen"
                className="w-10 h-10 rounded-full object-cover ring-2 ring-rose-300"
              />
              <div>
                <p className="text-sm font-bold text-gray-900">David Chen</p>
                <p className="text-xs text-rose-600 font-semibold">Skincare Client</p>
              </div>
            </div>
          </div>

          <div className="p-8 rounded-3xl bg-white border border-rose-100 shadow-sm space-y-4">
            <p className="text-sm text-gray-700 italic leading-relaxed">
              "As someone with a hectic work schedule, being able to view available slots and get my appointment confirmed seamlessly is a lifesaver."
            </p>
            <div className="flex items-center gap-3 pt-2">
              <img
                src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&q=80"
                alt="Sophia Martinez"
                className="w-10 h-10 rounded-full object-cover ring-2 ring-rose-300"
              />
              <div>
                <p className="text-sm font-bold text-gray-900">Sophia Martinez</p>
                <p className="text-xs text-rose-600 font-semibold">Spa & Massage Client</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
