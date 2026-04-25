import React from 'react';
import { LucideIcon } from 'lucide-react';

interface DashboardCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  bgColor?: string;
  iconColor?: string;
}

export function DashboardCard({ 
  title, 
  value, 
  icon: Icon, 
  bgColor = "bg-blue-50", 
  iconColor = "text-blue-600" 
}: DashboardCardProps) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col justify-between hover:shadow-md transition-shadow duration-300">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-gray-500 text-base font-semibold tracking-wide uppercase">{title}</h3>
        <div className={`p-3 rounded-full ${bgColor} ${iconColor}`}>
          <Icon size={20} strokeWidth={2.5} />
        </div>
      </div>
      <div>
        <p className="text-3xl font-bold text-gray-900">{value}</p>
      </div>
    </div>
  );
}
