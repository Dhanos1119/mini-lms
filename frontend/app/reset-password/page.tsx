"use client";

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { GraduationCap, Loader2, AlertCircle, Eye, EyeOff, CheckCircle2, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams?.get('token');

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    setIsLoading(true);
    
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          token, 
          newPassword: password 
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to reset password');
      }

      setIsSuccess(true);
      toast.success("Password updated successfully");
    } catch (err: any) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white p-8 sm:p-10 rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100 max-w-md w-full animate-in fade-in zoom-in-95 duration-500 font-sans text-gray-900">
      {error ? (
        <div className="text-center py-4 font-sans">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center shadow-lg shadow-red-100">
              <AlertCircle size={32} />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2 tracking-tight">Link Expired</h2>
          <p className="text-gray-500 mb-8 font-medium">{error}</p>
          <Link 
            href="/forgot-password" 
            className="inline-flex items-center justify-center w-full py-4 bg-gray-900 text-white rounded-xl font-bold hover:bg-gray-800 transition-all shadow-lg"
          >
            Request New Link
          </Link>
        </div>
      ) : isSuccess ? (
        <div className="text-center py-4 font-sans">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-green-100 text-green-600 rounded-2xl flex items-center justify-center shadow-lg shadow-green-100">
              <CheckCircle2 size={32} />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2 tracking-tight">Success!</h2>
          <p className="text-gray-500 mb-8 font-medium">Your password has been reset successfully. You can now log in with your new password.</p>
          <Link 
            href="/login" 
            className="inline-flex items-center justify-center w-full py-4 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20"
          >
            Sign In Now
          </Link>
        </div>
      ) : (
        <>
          <div className="mb-8 font-sans">
            <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Set New Password</h2>
            <p className="text-base text-gray-500 mt-2 font-medium">Create a secure password for your account.</p>
          </div>

          <form onSubmit={handleReset} className="space-y-5 font-sans">
            <div className="space-y-1.5">
              <label className="block text-sm font-bold text-gray-700 ml-1">New Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className="w-full px-4 py-3.5 rounded-xl border border-gray-200 bg-white text-gray-900 text-base focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-sm font-bold text-gray-700 ml-1">Confirm Password</label>
              <input
                type={showPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repeat your password"
                className="w-full px-4 py-3.5 rounded-xl border border-gray-200 bg-white text-gray-900 text-base focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center py-4 bg-blue-600 text-white rounded-xl font-bold text-base shadow-lg shadow-blue-500/20 hover:bg-blue-700 active:scale-[0.98] transition-all disabled:opacity-70 disabled:cursor-not-allowed mt-2"
            >
              {isLoading ? (
                <Loader2 size={24} className="animate-spin" />
              ) : (
                <>
                  <ShieldCheck size={20} className="mr-2" />
                  Update Password
                </>
              )}
            </button>
          </form>
        </>
      )}
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col items-center justify-center p-4">
      <div className="mb-8 text-center font-sans">
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 flex items-center justify-center rounded-2xl bg-blue-600 text-white shadow-xl shadow-blue-500/20">
            <GraduationCap size={32} />
          </div>
        </div>
        <h1 className="text-xl font-bold text-gray-900 tracking-tight">LMS Admin</h1>
        <p className="text-xs font-black text-gray-400 uppercase tracking-widest mt-1">Security Vault</p>
      </div>

      <Suspense fallback={
        <div className="bg-white p-12 rounded-3xl shadow-xl flex flex-col items-center gap-4">
          <Loader2 className="animate-spin text-blue-600" size={48} />
          <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Loading recovery interface...</p>
        </div>
      }>
        <ResetPasswordContent />
      </Suspense>

      <div className="mt-8 text-center">
        <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Protected by 256-bit encryption</p>
      </div>
    </div>
  );
}
