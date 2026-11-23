import React from 'react';
import Link from 'next/link';
import { Clock, Tag, ArrowRight } from 'lucide-react';

export interface ServiceItem {
  _id: string;
  serviceName: string;
  category: string;
  description: string;
  price: number;
  duration: number;
  image: string;
  status: 'active' | 'inactive';
}

interface ServiceCardProps {
  service: ServiceItem;
}

export const ServiceCard: React.FC<ServiceCardProps> = ({ service }) => {
  return (
    <div className="group bg-white rounded-3xl overflow-hidden border border-rose-100/80 shadow-sm hover:shadow-xl hover:border-rose-300 transition-all duration-300 flex flex-col h-full transform hover:-translate-y-1">
      {/* Service Image with Category Pill & Price */}
      <div className="relative h-56 w-full overflow-hidden bg-rose-50">
        <img
          src={service.image}
          alt={service.serviceName}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />

        {/* Category Badge */}
        <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-rose-700 flex items-center gap-1 shadow-sm">
          <Tag className="w-3 h-3 text-rose-500" />
          {service.category}
        </div>

        {/* Price Tag */}
        <div className="absolute bottom-3 right-3 bg-rose-600 text-white font-extrabold px-3 py-1.5 rounded-2xl text-base shadow-md">
          ${service.price}
        </div>
      </div>

      {/* Content */}
      <div className="p-6 flex flex-col flex-1 justify-between">
        <div className="space-y-2.5">
          <div className="flex items-center gap-2 text-xs font-medium text-gray-500">
            <Clock className="w-3.5 h-3.5 text-rose-500" />
            <span>{service.duration} mins session</span>
          </div>

          <h3 className="text-xl font-bold text-gray-900 line-clamp-1 group-hover:text-rose-600 transition-colors">
            {service.serviceName}
          </h3>

          <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed">
            {service.description}
          </p>
        </div>

        {/* View Details Button */}
        <div className="pt-5 mt-4 border-t border-rose-50">
          <Link
            href={`/services/${service._id}`}
            className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-2xl text-sm font-bold text-rose-600 bg-rose-50 hover:bg-rose-600 hover:text-white transition-all duration-200 group/btn"
          >
            <span>View Details</span>
            <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </div>
  );
};
