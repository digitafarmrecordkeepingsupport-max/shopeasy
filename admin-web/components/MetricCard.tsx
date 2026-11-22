import React from 'react';

interface MetricCardProps {
  title: string;
  value: string | number;
  trend: string;
  icon: React.ReactNode;
  variant?: 'purple' | 'blue' | 'green' | 'orange';
}

export default function MetricCard({
  title,
  value,
  trend,
  icon,
  variant = 'purple',
}: MetricCardProps) {
  const variantStyles = {
    purple: {
      cardBg: 'bg-[#F9F7FE]',
      iconBg: 'bg-[#F0EAFB] text-[#6515D5]',
    },
    blue: {
      cardBg: 'bg-[#F2F8FF]',
      iconBg: 'bg-[#E1EFFF] text-[#2563EB]',
    },
    green: {
      cardBg: 'bg-[#F2FCF5]',
      iconBg: 'bg-[#DCFCE7] text-[#16A34A]',
    },
    orange: {
      cardBg: 'bg-[#FFFDF4]',
      iconBg: 'bg-[#FEF3C7] text-[#D97706]',
    },
  };

  const style = variantStyles[variant] || variantStyles.purple;

  return (
    <div className={`${style.cardBg} rounded-2xl p-5 border border-[#EAE6F3] shadow-sm flex items-center justify-between`}>
      <div className="flex items-center space-x-4">
        {/* Icon box */}
        <div className={`w-14 h-14 rounded-2xl ${style.iconBg} flex items-center justify-center shrink-0 shadow-sm`}>
          {icon}
        </div>

        {/* Content */}
        <div>
          <div className="text-xs font-semibold text-[#77738A]">{title}</div>
          <div className="text-2xl font-black text-[#171428] mt-0.5 tracking-tight">{value}</div>
        </div>
      </div>

      {/* Trend pill */}
      <div className="text-xs font-bold text-[#16A34A] bg-[#DCFCE7]/70 px-2.5 py-1 rounded-full flex items-center space-x-1 shrink-0">
        <span>{trend}</span>
      </div>
    </div>
  );
}
