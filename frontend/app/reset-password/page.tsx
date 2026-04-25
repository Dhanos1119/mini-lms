"use client";

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { GraduationCap, Lock, Loader2, AlertCircle, Eye, EyeOff, CheckCircle2 } from 'lucide-react';
import { useData } from '@/contexts/DataContext';
import toast from 'react-hot-toast';

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams?.get('token');
  const { resetTokens, setResetTokens, users, setUsers } = useData();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState("");

  const [isValidating, setIsValidating] = useState(true);
  const [tokenData, setTokenData] = useState<any>(null);

  useEffect(() => {
    // Validate Token
    const foundToken = resetTokens.find(t => t.token === token);
    if (!foundToken || Date.now() > foundToken.expiry) {
      setError("Invalid or expired reset link. Please request a new one.");
    } else {
      setTokenData(foundToken);
    }
    setIsValidating(false);
  }, [token, resetTokens]);

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
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1200));

    // Update User Password
    const updatedUsers = users.map(u => 
      u.email === tokenData.email ? { ...u, password: password } : u
    );
    setUsers(updatedUsers);

    // Remove the token after use
    setResetTokens(resetTokens.filter(t => t.token !== token));

    setIsSuccess(true);
    setIsLoading(false);
    toast.success("Password updated successfully");
  };

  if (isValidating) {
    return <div className="flex items-center justify-center p-12"><Loader2 className="animate-spin text-blue-600" size={32} /></div>;
  }

  return (
    <div className="bg-white p-8 sm:p-10 rounded-3xl shadow-xl border border-gray-100 max-w-md w-full animate-in fade-in zoom-in-95 duration-500">
      {error ? (
        <div className="text-center py-4">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center">
              <AlertCircle size={32} />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Reset link expired</h2>
          <p className="text-gray-500 mb-8 font-medium">{error}</p>
          <Link 
            href="/forgot-password" 
            className="inline-flex items-center justify-center w-full py-3.5 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20"
          >
            Request New Link
          </Link>
        </div>
      ) : isSuccess ? (
        <div className="text-center py-4">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center">
              <CheckCircle2 size={32} />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Success!</h2>
          <p className="text-gray-500 mb-8 font-medium">Your password has been reset successfully. You can now log in with your new password.</p>
          <Link 
            href="/login" 
            className="inline-flex items-center justify-center w-full py-3.5 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20"
          >
            Sign In Now
          </Link>
        </div>
      ) : (
        <>
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Set New Password</h2>
            <p className="text-base text-gray-500 mt-2">Create a secure password for your account.</p>
          </div>

          <form onSubmit={handleReset} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5 ml-1">New Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-900 text-base focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none"
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

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5 ml-1">Confirm Password</label>
              <input
                type={showPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repeat your password"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-900 text-base focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center py-3.5 bg-blue-600 text-white rounded-xl font-bold text-base shadow-lg shadow-blue-500/20 hover:bg-blue-700 active:scale-[0.98] transition-all disabled:opacity-70 mt-2"
            >
              {isLoading ? <Loader2 size={20} className="animate-spin" /> : "Update Password"}
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
      <div className="mb-8 text-center">
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 flex items-center justify-center rounded-2xl bg-blue-600 text-white shadow-xl">
            <GraduationCap size={32} />
          </div>
        </div>
        <h1 className="text-xl font-bold text-gray-900">LMS Admin</h1>
      </div>

      <Suspense fallback={<Loader2 className="animate-spin text-blue-600" size={32} />}>
        <ResetPasswordContent />
      </Suspense>
    </div>
  );
}
