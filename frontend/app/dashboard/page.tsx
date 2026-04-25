"use client";

import React from 'react';
import { DashboardCard } from '@/components/DashboardCard';
import { Users, BookOpen, FileText, CreditCard, Plus, Clock, ArrowRight } from 'lucide-react';

const summaryData = [
  { title: 'Total Students', value: '1,248', icon: Users, bgColor: 'bg-blue-50', iconColor: 'text-blue-600' },
  { title: 'Total Batches', value: '32', icon: BookOpen, bgColor: 'bg-orange-50', iconColor: 'text-orange-500' },
  { title: 'Total Assignments', value: '450', icon: FileText, bgColor: 'bg-green-50', iconColor: 'text-green-500' },
  { title: 'Payments Recorded', value: '$24,500', icon: CreditCard, bgColor: 'bg-purple-50', iconColor: 'text-purple-500' },
];

const recentActivity = [
  { id: 1, action: 'New student added', target: 'John Doe', time: '10 mins ago', type: 'student' },
  { id: 2, action: 'Assignment created', target: 'Math Final Exam', time: '2 hours ago', type: 'assignment' },
  { id: 3, action: 'Payment recorded', target: '$150 from Jane Smith', time: '5 hours ago', type: 'payment' },
];

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Dashboard Overview</h1>
          <p className="text-gray-500 mt-1">Welcome back, Admin. Here&apos;s what&apos;s happening today.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="hidden sm:flex bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors shadow-sm items-center gap-2">
            View Reports
          </button>
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors shadow-md shadow-blue-500/20 flex items-center gap-2">
            <Plus size={18} />
            Quick Add
          </button>
        </div>
      </div>

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
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Recent Activity</h2>
              <button className="text-sm font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1 group">
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
                    <p className="text-sm font-medium text-gray-900">
                      {activity.action} <span className="font-semibold text-blue-600 ml-1">{activity.target}</span>
                    </p>
                    <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 h-full">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Quick Actions</h2>
            <div className="flex flex-col gap-4">
              <button className="w-full flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-blue-50 border border-gray-100 group transition-all duration-200">
                <div className="flex items-center gap-3">
                  <div className="bg-white p-2 rounded-lg shadow-sm text-blue-600 group-hover:scale-110 transition-transform">
                    <Users size={18} />
                  </div>
                  <span className="font-medium text-gray-700 group-hover:text-blue-700">Add Student</span>
                </div>
                <ArrowRight size={18} className="text-gray-400 group-hover:text-blue-600 transition-colors" />
              </button>

              <button className="w-full flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-green-50 border border-gray-100 group transition-all duration-200">
                <div className="flex items-center gap-3">
                  <div className="bg-white p-2 rounded-lg shadow-sm text-green-600 group-hover:scale-110 transition-transform">
                    <FileText size={18} />
                  </div>
                  <span className="font-medium text-gray-700 group-hover:text-green-700">Create Assignment</span>
                </div>
                <ArrowRight size={18} className="text-gray-400 group-hover:text-green-600 transition-colors" />
              </button>

              <button className="w-full flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-purple-50 border border-gray-100 group transition-all duration-200">
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
