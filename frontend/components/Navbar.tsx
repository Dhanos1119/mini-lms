"use client";

import React from 'react';
import { Menu, LogOut, User } from 'lucide-react';

interface NavbarProps {
  onMenuClick: () => void;
}

export function Navbar({ onMenuClick }: NavbarProps) {
  return (
    <nav className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-30 w-full h-16 flex items-center justify-between px-4 sm:px-6 lg:px-8 shadow-sm transition-all">
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 -ml-2 rounded-xl text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition duration-200 ease-in-out"
          aria-label="Toggle menu"
        >
          <Menu size={24} />
        </button>
        <div className="flex items-center gap-2">
          <div className="bg-blue-600 w-8 h-8 rounded-lg flex items-center justify-center shadow-md">
            <span className="text-white font-bold text-lg leading-none">M</span>
          </div>
          <h1 className="text-xl font-bold text-gray-900 tracking-tight hidden sm:block">
            Mini LMS Admin
          </h1>
        </div>
      </div>

      <div className="flex items-center gap-3 sm:gap-6">
        <div className="flex items-center gap-3 bg-gray-50 px-3 py-1.5 rounded-full border border-gray-100 hover:shadow-sm transition-shadow cursor-pointer">
          <span className="text-sm font-medium text-gray-700 hidden sm:block">Admin User</span>
          <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shadow-inner">
            <User size={16} />
          </div>
        </div>
        <div className="w-px h-6 bg-gray-200 hidden sm:block"></div>
        <button className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-red-600 transition-colors p-2 rounded-lg hover:bg-red-50">
          <LogOut size={20} />
          <span className="hidden sm:inline">Logout</span>
        </button>
      </div>
    </nav>
  );
}
