import React from 'react';
import Link from 'next/link';
import { Trophy } from 'lucide-react';
import { formatNaira } from '../lib/utils';
import { Product } from '../types';

interface TopSellingProductsProps {
  products: Array<Product & { growth?: string }>;
}

export default function TopSellingProducts({ products }: TopSellingProductsProps) {
  return (
    <div className="bg-white rounded-2xl p-6 border border-[#EAE6F3] shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2.5">
          <div className="text-[#F59E0B]">
            <Trophy size={20} />
          </div>
          <h3 className="text-base font-black text-[#171428]">Top Selling Products</h3>
        </div>
        <Link
          href="/products"
          className="text-xs font-bold text-[#6515D5] hover:text-[#4A0D9B] transition"
        >
          See All →
        </Link>
      </div>

      <div className="space-y-3.5">
        {products.map((prod) => (
          <div
            key={prod.id}
            className="flex items-center justify-between p-2.5 rounded-xl hover:bg-[#F9F7FE] transition border border-transparent hover:border-[#F0EBF8]"
          >
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-xl bg-[#F7F5FC] overflow-hidden border border-[#EAE6F3] shrink-0">
                <img
                  src={prod.image_urls[0]}
                  alt={prod.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <div className="text-sm font-bold text-[#171428] line-clamp-1">{prod.name}</div>
                <div className="text-xs font-black text-[#6515D5] mt-0.5">{formatNaira(prod.price)}</div>
              </div>
            </div>

            {prod.growth && (
              <span className="text-xs font-bold text-[#16A34A] bg-[#DCFCE7]/70 px-2 py-0.5 rounded-md shrink-0">
                {prod.growth}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
