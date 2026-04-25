"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { GraduationCap, Eye, EyeOff, Loader2, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const handleLogin = async (roleType: 'ADMIN' | 'STUDENT') => {
    if (!formData.email || !formData.password) {
      setError("Please fill in all fields.");
      return;
    }

    setIsLoading(true);
    setError("");
    
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      // Check if role matches the button clicked
      if (data.role !== roleType) {
        throw new Error(`This account does not have ${roleType === 'ADMIN' ? 'Administrator' : 'Student'} privileges.`);
      }

      // Store auth info
      localStorage.setItem('token', data.token);
      localStorage.setItem('role', data.role);
      localStorage.setItem('userEmail', formData.email);

      toast.success(`Welcome back, ${roleType === 'ADMIN' ? 'Administrator' : 'Student'}!`);
      
      // Redirect based on role
      router.push(roleType === 'ADMIN' ? '/admin/dashboard' : '/user/dashboard');
    } catch (err: any) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8">
      {/* Branding Section */}
      <div className="mb-10 text-center animate-in fade-in slide-in-from-top-4 duration-700">
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 flex items-center justify-center rounded-2xl bg-blue-600 text-white shadow-xl shadow-blue-500/20 hover:scale-105 transition-transform duration-300">
            <GraduationCap size={32} />
          </div>
        </div>
        <h1 className="text-xl font-bold text-gray-900 tracking-tight">LMS Admin</h1>
        <p className="text-sm font-medium text-gray-500">Learning Management System</p>
      </div>

      {/* Login Card */}
      <div className="bg-white p-8 sm:p-10 rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100 max-w-md w-full animate-in fade-in zoom-in-95 duration-500">
        <div className="mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">Sign In</h2>
          <p className="text-base text-gray-500 mt-2">Enter your credentials to access your dashboard.</p>
        </div>

        <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 text-red-600 rounded-xl text-sm animate-in fade-in zoom-in-95">
              <AlertCircle size={16} />
              {error}
            </div>
          )}

          <div>
            <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-1.5 ml-1">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              placeholder="admin@gmail.com"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-900 text-base placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-1.5 ml-1">
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                placeholder="••••••••"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-900 text-base placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all pr-12"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-gray-400 hover:text-gray-600 transition-colors"
                title={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center">
              <input
                id="remember"
                type="checkbox"
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 transition-all cursor-pointer"
              />
              <label htmlFor="remember" className="ml-2 text-sm text-gray-600 font-medium cursor-pointer">
                Remember me
              </label>
            </div>
            <Link href="/forgot-password" className="text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors">
              Forgot password?
            </Link>
          </div>

          <div className="space-y-3 pt-4">
            <button
              type="button"
              disabled={isLoading}
              onClick={() => handleLogin('ADMIN')}
              className="w-full flex items-center justify-center py-3.5 px-4 bg-blue-600 text-white rounded-xl font-bold text-base shadow-lg shadow-blue-500/20 hover:bg-blue-700 active:scale-[0.98] transition-all disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                "Sign in as Admin"
              )}
            </button>
            
            <button
              type="button"
              disabled={isLoading}
              onClick={() => handleLogin('STUDENT')}
              className="w-full flex items-center justify-center py-3.5 px-4 bg-white text-gray-700 border-2 border-gray-100 rounded-xl font-bold text-base hover:bg-gray-50 hover:border-gray-200 active:scale-[0.98] transition-all disabled:opacity-70 disabled:cursor-not-allowed"
            >
              Sign in as Student
            </button>
          </div>
        </form>
      </div>

      {/* Footer Info */}
      <div className="mt-8 text-gray-400 text-sm font-medium">
        &copy; {new Date().getFullYear()} Mini LMS. All rights reserved.
      </div>
    </div>
  );
}
