"use client";

import React, { useState, useEffect } from 'react';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';
import { useData } from '@/contexts/DataContext';
import { CreateAssignmentModal } from './CreateAssignmentModal';
import { useRouter } from 'next/navigation';
import { Loader2, ShieldCheck } from 'lucide-react';

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const { showAssignmentModal, setShowAssignmentModal } = useData();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');

    if (!token || role?.toUpperCase() !== 'ADMIN') {
      router.push('/login');
    } else {
      setIsAuthorized(true);
    }
  }, [router]);

  const toggleSidebar = () => setSidebarOpen(!isSidebarOpen);

  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <div className="bg-white p-8 rounded-3xl shadow-xl flex flex-col items-center gap-6 animate-in zoom-in-95 duration-500">
          <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-600 shadow-lg shadow-blue-100">
            <ShieldCheck size={32} />
          </div>
          <div className="text-center">
            <h2 className="text-xl font-bold text-gray-900 mb-1">Checking Authorization</h2>
            <p className="text-sm font-medium text-gray-400 uppercase tracking-widest">Validating admin session...</p>
          </div>
          <Loader2 className="animate-spin text-blue-600" size={32} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <Navbar onMenuClick={toggleSidebar} />
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setSidebarOpen} />
      <main className="lg:ml-72 mt-16 p-4 sm:p-6 min-h-[calc(100vh-4rem)] transition-all duration-200">
        {children}
      </main>

      {showAssignmentModal && (
        <CreateAssignmentModal onClose={() => setShowAssignmentModal(false)} />
      )}
    </div>
  );
}
