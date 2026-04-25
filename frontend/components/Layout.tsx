"use client";

import React, { useState } from 'react';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => setSidebarOpen(!isSidebarOpen);

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <Navbar onMenuClick={toggleSidebar} />
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setSidebarOpen} />
      <main className="lg:ml-72 mt-16 p-4 sm:p-6 min-h-[calc(100vh-4rem)] transition-all duration-200">
        {children}
      </main>
    </div>
  );
}
