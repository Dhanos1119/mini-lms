"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Users, BookOpen, FileText, CreditCard, X, GraduationCap } from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

const menuItems = [
  { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
  { name: 'Students', href: '/admin/dashboard/students', icon: Users },
  { name: 'Batches', href: '/admin/dashboard/batches', icon: BookOpen },
  { name: 'Assignments', href: '/admin/dashboard/assignments', icon: FileText },
  { name: 'Payments', href: '/admin/dashboard/payments', icon: CreditCard },
];

export function Sidebar({ isOpen, setIsOpen }: SidebarProps) {
  const pathname = usePathname();

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-40 lg:hidden transition-all duration-300"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar Content */}
      <aside
        className={`fixed left-0 top-0 h-full w-72 bg-white border-r border-gray-200 shadow-2xl lg:shadow-none z-50 transform transition-transform duration-300 ease-in-out flex flex-col ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0`}
      >
        <div className="flex items-center justify-between px-4 py-4 border-b border-gray-100 bg-white">
          <div className="flex items-start gap-3 overflow-hidden pr-2">
            <div className="w-10 h-10 flex-shrink-0 flex items-center justify-center rounded-xl bg-blue-600 text-white shadow-md hover:scale-105 transition-all duration-200 mt-0.5">
              <GraduationCap size={20} />
            </div>
            <div className="flex flex-col">
              <h1 className="text-lg font-semibold text-gray-900 break-words leading-tight">
                LMS Admin
              </h1>
              <p className="text-sm text-gray-500 break-words whitespace-normal leading-snug mt-0.5">
                Learning Management System
              </p>
            </div>
          </div>
          <button 
            className="lg:hidden flex-shrink-0 p-2 -mr-2 text-gray-500 hover:text-gray-900 rounded-lg hover:bg-gray-100 transition-colors"
            onClick={() => setIsOpen(false)}
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-6 px-4">
          <nav className="space-y-1.5">
            {menuItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                    isActive 
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20 font-medium'
                      : 'text-gray-600 hover:bg-gray-100/80 hover:text-gray-900 font-medium'
                  }`}
                  onClick={() => setIsOpen(false)}
                >
                  <Icon 
                    size={20} 
                    className={`${isActive ? 'text-white' : 'text-gray-400 group-hover:text-gray-600'} transition-colors`} 
                  />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>
        
        {/* Optional bottom section for settings or footer info could go here */}
        <div className="p-4 border-t border-gray-100">
          <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 flex flex-col items-center text-center">
            <p className="text-sm text-gray-500 mb-2 font-medium">Mini LMS v1.0.0</p>
            <p className="text-[10px] text-gray-400">Powered by Next.js & Tailwind</p>
          </div>
        </div>
      </aside>
    </>
  );
}
