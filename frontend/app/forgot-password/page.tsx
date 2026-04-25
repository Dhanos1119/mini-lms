"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { GraduationCap, ArrowLeft, Mail, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useData } from '@/contexts/DataContext';
import toast from 'react-hot-toast';

export default function ForgotPasswordPage() {
  const { users, resetTokens, setResetTokens } = useData();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());

    if (!user) {
      toast.error("Email not found");
      setIsLoading(false);
      return;
    }

    // Generate Token
    const token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    const expiry = Date.now() + 10 * 60 * 1000; // 10 minutes

    // Store Token
    setResetTokens([...resetTokens, { token, email: user.email, expiry }]);

    // Log the link
    console.log("%c[MOCK EMAIL SERVICE]", "color: #2563eb; font-weight: bold;");
    console.log(`Reset Link: http://localhost:3000/reset-password?token=${token}`);

    setIsSent(true);
    setIsLoading(false);
    toast.success("Reset link sent to your email");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col items-center justify-center p-4">
      <div className="mb-8 text-center">
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 flex items-center justify-center rounded-2xl bg-blue-600 text-white shadow-xl">
            <GraduationCap size={32} />
          </div>
        </div>
        <h1 className="text-xl font-bold text-gray-900">LMS Admin</h1>
      </div>

      <div className="bg-white p-8 sm:p-10 rounded-3xl shadow-xl border border-gray-100 max-w-md w-full animate-in fade-in zoom-in-95 duration-500">
        {!isSent ? (
          <>
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Reset Password</h2>
              <p className="text-base text-gray-500 mt-2">Enter your email address and we&apos;ll send you a link to reset your password.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-1.5 ml-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-900 text-base focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex items-center justify-center py-3.5 bg-blue-600 text-white rounded-xl font-bold text-base shadow-lg shadow-blue-500/20 hover:bg-blue-700 active:scale-[0.98] transition-all disabled:opacity-70"
              >
                {isLoading ? <Loader2 size={20} className="animate-spin" /> : "Send Reset Link"}
              </button>

              <Link 
                href="/login" 
                className="flex items-center justify-center gap-2 text-sm font-semibold text-gray-500 hover:text-gray-700 transition-colors pt-2"
              >
                <ArrowLeft size={16} />
                Back to Login
              </Link>
            </form>
          </>
        ) : (
          <div className="text-center py-4">
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center">
                <CheckCircle2 size={32} />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Email Sent!</h2>
            <p className="text-gray-500 mb-8 font-medium">A password reset link has been sent to <span className="text-gray-900 font-bold">{email}</span>. Please check your inbox.</p>
            <Link 
              href="/login" 
              className="inline-flex items-center justify-center px-8 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20"
            >
              Return to Login
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
