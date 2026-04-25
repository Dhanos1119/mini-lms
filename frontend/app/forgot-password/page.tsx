"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { GraduationCap, ArrowLeft, Mail, Loader2, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to process request');
      }

      setIsSent(true);
      toast.success("Reset link sent to your email");
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col items-center justify-center p-4 font-sans text-gray-900">
      <div className="mb-8 text-center">
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 flex items-center justify-center rounded-2xl bg-blue-600 text-white shadow-xl shadow-blue-500/20">
            <GraduationCap size={32} />
          </div>
        </div>
        <h1 className="text-xl font-bold text-gray-900 tracking-tight">LMS Admin</h1>
        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Recovery Service</p>
      </div>

      <div className="bg-white p-8 sm:p-10 rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100 max-w-md w-full animate-in fade-in zoom-in-95 duration-500">
        {!isSent ? (
          <>
            <div className="mb-8 font-sans">
              <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Reset Password</h2>
              <p className="text-base text-gray-500 mt-2 font-medium">Enter your email address and we&apos;ll send you a link to reset your password.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-1.5">
                <label htmlFor="email" className="block text-sm font-bold text-gray-700 ml-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your registered email"
                    className="w-full pl-10 pr-4 py-3.5 rounded-xl border border-gray-200 bg-white text-gray-900 text-base focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex items-center justify-center py-4 bg-blue-600 text-white rounded-xl font-bold text-base shadow-lg shadow-blue-500/20 hover:bg-blue-700 active:scale-[0.98] transition-all disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <Loader2 size={24} className="animate-spin" />
                ) : (
                  "Send Reset Link"
                )}
              </button>

              <Link 
                href="/login" 
                className="flex items-center justify-center gap-2 text-sm font-bold text-gray-400 hover:text-blue-600 transition-colors pt-2"
              >
                <ArrowLeft size={16} />
                Back to Login
              </Link>
            </form>
          </>
        ) : (
          <div className="text-center py-4 font-sans">
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-green-100 text-green-600 rounded-2xl flex items-center justify-center shadow-lg shadow-green-100">
                <CheckCircle2 size={32} />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Email Sent!</h2>
            <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 mb-8">
              <p className="text-gray-500 font-medium">A password reset link has been sent to:</p>
              <p className="text-gray-900 font-bold mt-1 break-all">{email}</p>
            </div>
            <Link 
              href="/login" 
              className="inline-flex items-center justify-center w-full py-4 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20"
            >
              Return to Login
            </Link>
          </div>
        )}
      </div>

      <div className="mt-8 text-center">
        <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Secure LMS Portal</p>
      </div>
    </div>
  );
}
