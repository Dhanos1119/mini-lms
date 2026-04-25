"use client";

import React from 'react';
import { BookOpen, Clock, CheckCircle, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function UserDashboardPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      {/* Simple User Navbar */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-30 w-full h-16 flex items-center justify-between px-4 sm:px-6 lg:px-8 shadow-sm">
        <div className="flex items-center gap-2">
          <div className="bg-blue-600 w-8 h-8 rounded-lg flex items-center justify-center shadow-md">
            <span className="text-white font-bold text-lg leading-none">M</span>
          </div>
          <h1 className="text-xl font-bold text-gray-900 tracking-tight hidden sm:block">
            My Learning
          </h1>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium text-gray-700 hidden sm:block">Student User</span>
          <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shadow-inner font-bold">
            U
          </div>
          <Link href="/login" className="text-sm font-medium text-gray-500 hover:text-red-600 transition-colors">
            Logout
          </Link>
        </div>
      </nav>

      <main className="flex-1 w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8 animate-in fade-in duration-500">
        
        {/* Welcome Section */}
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">Welcome back, Student!</h2>
            <p className="mt-2 text-gray-500">You have 2 pending assignments and 1 upcoming class.</p>
          </div>
          <button className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl text-sm font-semibold transition-colors shadow-sm shadow-blue-500/20">
            Resume Course
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center gap-4">
            <div className="p-4 bg-orange-50 rounded-full text-orange-500">
              <Clock size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">Hours Learned</p>
              <p className="text-2xl font-bold text-gray-900">45h</p>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center gap-4">
            <div className="p-4 bg-blue-50 rounded-full text-blue-600">
              <BookOpen size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">Active Courses</p>
              <p className="text-2xl font-bold text-gray-900">3</p>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center gap-4">
            <div className="p-4 bg-green-50 rounded-full text-green-500">
              <CheckCircle size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">Completed</p>
              <p className="text-2xl font-bold text-gray-900">12</p>
            </div>
          </div>
        </div>

        {/* Course List Placeholder */}
        <div>
          <h3 className="text-xl font-bold text-gray-900 mb-4">My Courses</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((course) => (
              <div key={course} className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow group">
                <div className="h-40 bg-gray-100 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-purple-500/20 mix-blend-multiply group-hover:scale-105 transition-transform duration-500" />
                </div>
                <div className="p-6">
                  <span className="text-xs font-semibold text-blue-600 uppercase tracking-wider">Web Development</span>
                  <h4 className="text-lg font-bold text-gray-900 mt-2 mb-2">Modern React Patterns</h4>
                  <div className="w-full bg-gray-100 rounded-full h-2.5 mb-4">
                    <div className="bg-blue-600 h-2.5 rounded-full w-[45%]"></div>
                  </div>
                  <div className="flex items-center justify-between mt-4">
                    <span className="text-sm text-gray-500 font-medium">45% Complete</span>
                    <button className="text-blue-600 hover:text-blue-800 p-2 rounded-lg hover:bg-blue-50 transition-colors">
                      <ArrowRight size={20} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
