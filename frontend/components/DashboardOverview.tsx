"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardCard } from '@/components/DashboardCard';
import { 
  Users, 
  BookOpen, 
  FileText, 
  CreditCard, 
  Clock, 
  ArrowRight, 
  X, 
  TrendingUp, 
  UserCheck, 
  Calendar, 
  CheckSquare
} from 'lucide-react';
import { useData } from '@/contexts/DataContext';

const recentActivity = [
  { id: 1, action: 'New student added', target: 'John Doe', time: '10 mins ago' },
  { id: 2, action: 'Assignment created', target: 'Math Final Exam', time: '2 hours ago' },
  { id: 3, action: 'Payment recorded', target: '$150 from Jane Smith', time: '5 hours ago' },
];

export function DashboardOverview() {
  const router = useRouter();
  const { students, batches, assignments, payments, setShowAssignmentModal } = useData();
  const [showReports, setShowReports] = useState(false);

  // Compute total paid revenue dynamically
  const paidPayments = payments.filter(p => p.status === "Paid");
  const unpaidPayments = payments.filter(p => p.status === "Unpaid");
  
  const totalRevenue = paidPayments.reduce((sum, p) => {
    return sum + (p.amount || 0);
  }, 0);

  const activeStudents = students.filter(s => s.status === 'Active').length;
  const inactiveStudents = students.filter(s => s.status === 'Inactive').length;

  const gradingAssignments = assignments.filter(a => a.status === 'Grading').length;
  const activeAssignments = assignments.filter(a => a.status === 'Active').length;
  const upcomingAssignments = assignments.filter(a => a.status === 'Upcoming').length;

  const summaryData = [
    { title: 'Total Students', value: students.length.toString(), icon: Users, bgColor: 'bg-blue-50', iconColor: 'text-blue-600' },
    { title: 'Total Batches', value: batches.length.toString(), icon: BookOpen, bgColor: 'bg-orange-50', iconColor: 'text-orange-500' },
    { title: 'Total Assignments', value: assignments.length.toString(), icon: FileText, bgColor: 'bg-green-50', iconColor: 'text-green-500' },
    { title: 'Payments Recorded', value: `$${totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, icon: CreditCard, bgColor: 'bg-purple-50', iconColor: 'text-purple-500' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Dashboard Overview</h1>
          <p className="text-gray-500 mt-1">Welcome back, Admin. Here&apos;s what&apos;s happening today.</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setShowReports(true)}
            className="flex bg-white border border-gray-200 text-gray-700 px-4 py-2.5 rounded-xl text-lg font-medium hover:bg-gray-50 hover:border-gray-300 active:scale-95 transition-all shadow-sm items-center gap-2"
          >
            <TrendingUp size={18} className="text-blue-600" />
            View Reports
          </button>
        </div>
      </div>

      {/* Reports Modal */}
      {showReports && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-md animate-in fade-in duration-300" onClick={(e) => e.target === e.currentTarget && setShowReports(false)}>
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-300">
            <div className="sticky top-0 bg-white/80 backdrop-blur-md px-8 py-6 border-b border-gray-100 flex justify-between items-center z-10">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-blue-600 rounded-xl text-white">
                  <TrendingUp size={24} />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Dashboard Reports</h2>
              </div>
              <button 
                onClick={() => setShowReports(false)}
                className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-all active:scale-90"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                
                {/* Revenue Summary */}
                <div className="bg-purple-50/50 rounded-2xl p-6 border border-purple-100">
                  <div className="flex items-center gap-3 mb-4">
                    <CreditCard className="text-purple-600" size={20} />
                    <h3 className="text-lg font-bold text-gray-900">Revenue Summary</h3>
                  </div>
                  <div className="space-y-4">
                    <div className="flex justify-between items-end">
                      <span className="text-gray-500 text-base">Total Revenue (Paid)</span>
                      <span className="text-2xl font-bold text-purple-600">${totalRevenue.toLocaleString()}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-3 pt-2">
                      <div className="bg-white p-3 rounded-xl border border-purple-100/50">
                        <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">Paid</p>
                        <p className="text-lg font-bold text-gray-900">{paidPayments.length}</p>
                      </div>
                      <div className="bg-white p-3 rounded-xl border border-purple-100/50">
                        <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">Unpaid</p>
                        <p className="text-lg font-bold text-gray-900">{unpaidPayments.length}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Students Overview */}
                <div className="bg-blue-50/50 rounded-2xl p-6 border border-blue-100">
                  <div className="flex items-center gap-3 mb-4">
                    <UserCheck className="text-blue-600" size={20} />
                    <h3 className="text-lg font-bold text-gray-900">Students Overview</h3>
                  </div>
                  <div className="space-y-4">
                    <div className="flex justify-between items-end">
                      <span className="text-gray-500 text-base">Total Enrolled</span>
                      <span className="text-2xl font-bold text-blue-600">{students.length}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-3 pt-2">
                      <div className="bg-white p-3 rounded-xl border border-blue-100/50">
                        <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">Active</p>
                        <p className="text-lg font-bold text-gray-900">{activeStudents}</p>
                      </div>
                      <div className="bg-white p-3 rounded-xl border border-blue-100/50">
                        <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">Inactive</p>
                        <p className="text-lg font-bold text-gray-900">{inactiveStudents}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Batch Overview */}
                <div className="bg-orange-50/50 rounded-2xl p-6 border border-orange-100">
                  <div className="flex items-center gap-3 mb-4">
                    <Calendar className="text-orange-600" size={20} />
                    <h3 className="text-lg font-bold text-gray-900">Batch Overview</h3>
                  </div>
                  <div className="space-y-4">
                    <div className="flex justify-between items-end mb-2">
                      <span className="text-gray-500 text-base">Total Batches</span>
                      <span className="text-2xl font-bold text-orange-600">{batches.length}</span>
                    </div>
                    <div className="bg-white rounded-xl border border-orange-100/50 divide-y divide-orange-50">
                      {batches.map(batch => {
                        const count = students.filter(s => s.batch === batch.name).length;
                        return (
                          <div key={batch.id} className="flex justify-between items-center p-3">
                            <span className="text-base font-medium text-gray-700">{batch.name}</span>
                            <span className="text-sm font-bold bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full">{count} Students</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Assignments Overview */}
                <div className="bg-green-50/50 rounded-2xl p-6 border border-green-100">
                  <div className="flex items-center gap-3 mb-4">
                    <CheckSquare className="text-green-600" size={20} />
                    <h3 className="text-lg font-bold text-gray-900">Assignments</h3>
                  </div>
                  <div className="space-y-4">
                    <div className="flex justify-between items-end">
                      <span className="text-gray-500 text-base">Total Created</span>
                      <span className="text-2xl font-bold text-green-600">{assignments.length}</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 pt-2">
                      <div className="bg-white p-2.5 rounded-xl border border-green-100/50 text-center">
                        <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Active</p>
                        <p className="text-base font-bold text-gray-900">{activeAssignments}</p>
                      </div>
                      <div className="bg-white p-2.5 rounded-xl border border-green-100/50 text-center">
                        <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Grading</p>
                        <p className="text-base font-bold text-gray-900">{gradingAssignments}</p>
                      </div>
                      <div className="bg-white p-2.5 rounded-xl border border-green-100/50 text-center">
                        <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Upcoming</p>
                        <p className="text-base font-bold text-gray-900">{upcomingAssignments}</p>
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            </div>

            <div className="p-6 border-t border-gray-100 bg-gray-50/50 flex justify-end">
              <button 
                onClick={() => setShowReports(false)}
                className="px-8 py-3 bg-white border border-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-50 active:scale-95 transition-all shadow-sm"
              >
                Close Report
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Summary Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {summaryData.map((item, index) => (
          <DashboardCard
            key={index}
            title={item.title}
            value={item.value}
            icon={item.icon}
            bgColor={item.bgColor}
            iconColor={item.iconColor}
          />
        ))}
      </div>

      {/* Main Content Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Recent Activity */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 h-full">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Recent Activity</h2>
              <button className="text-lg font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1 group">
                View all <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
            
            <div className="space-y-6">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-start gap-4">
                  <div className="mt-1 bg-gray-50 p-2 rounded-full border border-gray-100">
                    <Clock size={16} className="text-gray-400" />
                  </div>
                  <div className="flex-1 border-b border-gray-50 pb-4 last:border-0 last:pb-0">
                    <p className="text-lg font-medium text-gray-900">
                      {activity.action} <span className="font-semibold text-blue-600 ml-1">{activity.target}</span>
                    </p>
                    <p className="text-base text-gray-500 mt-1">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 h-full">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Quick Actions</h2>
            <div className="flex flex-col gap-4">
              <button onClick={() => router.push('/admin/dashboard/students?action=add')} className="w-full flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-blue-50 border border-gray-100 group transition-all duration-200">
                <div className="flex items-center gap-3">
                  <div className="bg-white p-2 rounded-lg shadow-sm text-blue-600 group-hover:scale-110 transition-transform">
                    <Users size={18} />
                  </div>
                  <span className="font-medium text-gray-700 group-hover:text-blue-700">Add Student</span>
                </div>
                <ArrowRight size={18} className="text-gray-400 group-hover:text-blue-600 transition-colors" />
              </button>

              <button onClick={() => setShowAssignmentModal(true)} className="w-full flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-green-50 border border-gray-100 group transition-all duration-200">
                <div className="flex items-center gap-3">
                  <div className="bg-white p-2 rounded-lg shadow-sm text-green-600 group-hover:scale-110 transition-transform">
                    <FileText size={18} />
                  </div>
                  <span className="font-medium text-gray-700 group-hover:text-green-700">Create Assignment</span>
                </div>
                <ArrowRight size={18} className="text-gray-400 group-hover:text-green-600 transition-colors" />
              </button>

              <button onClick={() => router.push('/admin/dashboard/payments?action=add')} className="w-full flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-purple-50 border border-gray-100 group transition-all duration-200">
                <div className="flex items-center gap-3">
                  <div className="bg-white p-2 rounded-lg shadow-sm text-purple-600 group-hover:scale-110 transition-transform">
                    <CreditCard size={18} />
                  </div>
                  <span className="font-medium text-gray-700 group-hover:text-purple-700">Add Payment</span>
                </div>
                <ArrowRight size={18} className="text-gray-400 group-hover:text-purple-600 transition-colors" />
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
