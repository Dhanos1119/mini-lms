"use client";

import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  BookOpen, 
  Bell, 
  CreditCard, 
  User as UserIcon, 
  LogOut, 
  GraduationCap, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  FileUp,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  Phone,
  Mail,
  Edit2,
  Save,
  Lock,
  X,
  Calendar,
  Download,
  FileText,
  Eye,
  Wallet,
  Book,
  Megaphone,
  ListTodo
} from 'lucide-react';
import Link from 'next/link';
import { useData } from '@/contexts/DataContext';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';

export default function UserDashboardPage() {
  const router = useRouter();
  const { students, assignments, announcements, payments, users, setUsers } = useData();
  const [activeTab, setActiveTab] = useState('overview');
  const [isLoaded, setIsLoaded] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    // Auth Check
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    const userEmail = localStorage.getItem('userEmail');

    if (!token || role !== 'STUDENT') {
      router.push('/login');
      return;
    }

    // Find user in mock users or just set from local storage info
    const user = users.find(u => u.email === userEmail) || { email: userEmail, name: 'Student User', role: 'STUDENT' };
    setCurrentUser(user);
    setIsLoaded(true);
  }, [router, users]);

  const studentProfile = students.find(s => s.email === currentUser?.email) || students[0];

  // Profile Edit State
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({
    name: '',
    phone: ''
  });

  useEffect(() => {
    if (studentProfile) {
      setProfileForm({
        name: studentProfile.name,
        phone: studentProfile.phone || ''
      });
    }
  }, [studentProfile]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('userEmail');
    toast.success("Logged out successfully");
    router.push('/login');
  };

  if (!isLoaded || !currentUser) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="animate-pulse flex flex-col items-center gap-4">
        <GraduationCap size={48} className="text-blue-200" />
        <div className="h-4 w-32 bg-gray-200 rounded"></div>
      </div>
    </div>;
  }
  
  // Multi-year Payment Calculations
  const studentPayments = payments.filter(p => p.email === currentUser.email).sort((a, b) => b.year - a.year);
  const paidYears = studentPayments.filter(p => p.status === 'Paid');
  const totalPaidYears = paidYears.length;
  const totalAmountPaid = paidYears.reduce((sum, p) => sum + p.amount, 0);
  const courseDuration = studentProfile?.courseDuration || 1;
  const outstandingYears = Math.max(0, courseDuration - totalPaidYears);

  // Filter assignments exactly by batch
  const studentAssignments = assignments.filter(a => a.batch === studentProfile?.batch);
  const studentAnnouncements = announcements.filter(a => a.batch === studentProfile?.batch || a.batch === 'All Batches');

  const totalAssignments = studentAssignments.length;
  const totalAnnouncements = studentAnnouncements.length;

  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Profile updated successfully");
    setIsEditingProfile(false);
  };

  const handleDownload = (fileUrl: string, fileName: string) => {
    if (!fileUrl) {
      toast.error("No file attached to this assignment.");
      return;
    }
    const link = document.createElement("a");
    link.href = fileUrl;
    link.download = fileName || "assignment_file";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success(`Downloading ${fileName}...`);
  };

  // Dynamic Avatar Logic
  const firstLetter = currentUser.email.charAt(0).toUpperCase();

  return (
    <div className="min-h-screen bg-gray-50 flex overflow-hidden font-sans text-gray-900 leading-normal">
      {/* User Sidebar */}
      <aside className="w-72 bg-white border-r border-gray-200 hidden lg:flex flex-col sticky top-0 h-screen transition-all">
        <div className="p-8 border-b border-gray-100 mb-2">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-600 rounded-xl text-white shadow-lg shadow-blue-200">
              <GraduationCap size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 leading-tight">My LMS</h2>
              <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest mt-0.5">Student Area</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-4 space-y-1.5 mt-4">
          {[
            { id: 'overview', icon: LayoutDashboard, label: 'Overview' },
            { id: 'assignments', icon: BookOpen, label: 'Assignments' },
            { id: 'announcements', icon: Bell, label: 'Announcements' },
            { id: 'payments', icon: CreditCard, label: 'Payments' },
            { id: 'profile', icon: UserIcon, label: 'My Profile' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3.5 px-4 py-3.5 rounded-2xl font-bold transition-all group ${
                activeTab === item.id 
                ? 'bg-blue-600 text-white shadow-xl shadow-blue-200 ring-4 ring-blue-50' 
                : 'text-gray-500 hover:bg-blue-50 hover:text-blue-600 font-semibold'
              }`}
            >
              <item.icon size={22} className={activeTab === item.id ? 'text-white' : 'text-gray-400 group-hover:text-blue-600 transition-all group-hover:scale-110'} />
              <span className="text-base">{item.label}</span>
              {item.id === 'announcements' && studentAnnouncements.length > 0 && activeTab !== 'announcements' && (
                <span className="ml-auto w-5 h-5 bg-red-500 text-white text-[10px] flex items-center justify-center rounded-full border-2 border-white shadow-sm">
                  {studentAnnouncements.length}
                </span>
              )}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-50 mb-4 px-6">
                  <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-4 rounded-2xl text-gray-400 font-bold hover:bg-red-50 hover:text-red-600 transition-all group"
          >
            <LogOut size={22} className="group-hover:scale-110 transition-all" />
            <span className="text-base">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto">
        <header className="bg-white/80 border-b border-gray-100 h-24 flex items-center justify-between px-10 sticky top-0 z-50 backdrop-blur-xl">
          <div className="flex flex-col">
            <h1 className="text-2xl font-bold text-gray-900 capitalize tracking-tight">{activeTab}</h1>
            <div className="flex items-center gap-2 mt-1">
              <span className="w-2 h-2 rounded-full bg-green-500 shadow-sm shadow-green-200"></span>
              <p className="text-sm text-gray-500 font-semibold">{studentProfile?.batch}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-5">
            <div className="hidden md:flex flex-col items-end">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md uppercase tracking-widest border border-blue-100">
                  {courseDuration} Year Program
                </span>
                <span className="text-base font-bold text-gray-900 leading-none">{studentProfile?.name}</span>
              </div>
              <span className="text-xs font-bold text-blue-500 mt-1.5 uppercase tracking-widest bg-blue-50 px-2 py-0.5 rounded-md">STUDENT</span>
            </div>
            <div className="relative group cursor-pointer active:scale-95 transition-all">
              <div className="w-12 h-12 bg-gradient-to-tr from-blue-600 to-indigo-600 text-white rounded-2xl flex items-center justify-center font-black text-lg shadow-lg shadow-blue-200 ring-4 ring-white transition-all group-hover:rotate-3 group-hover:shadow-xl">
                {firstLetter}
              </div>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
            </div>
          </div>
        </header>

        <div className="p-10 max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-2 duration-700">
          {activeTab === 'overview' && (
            <div className="space-y-10">
              {/* Yearly Payment Focus Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
                 {/* Total Paid Years */}
                 <div className="bg-white p-7 rounded-[28px] shadow-sm hover:shadow-xl border border-gray-100 flex flex-col justify-between transition-all duration-300 hover:scale-[1.02] group cursor-default">
                  <div className="w-12 h-12 rounded-full bg-green-50 text-green-600 flex items-center justify-center mb-6 group-hover:bg-green-600 group-hover:text-white transition-all duration-500">
                    <CheckCircle className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Yearly Payment Progress</h4>
                    <div className="flex items-baseline gap-3 mt-2">
                      <p className="text-3xl font-black text-gray-900">{totalPaidYears} / {courseDuration}</p>
                      <p className="text-xs font-bold text-gray-400">Academic years paid</p>
                    </div>
                  </div>
                </div>

                {/* Total Amount Paid */}
                <div className="bg-white p-7 rounded-[28px] shadow-sm hover:shadow-xl border border-gray-100 flex flex-col justify-between transition-all duration-300 hover:scale-[1.02] group cursor-default">
                  <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mb-6 group-hover:bg-blue-600 group-hover:text-white transition-all duration-500">
                    <Wallet className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Total Amount Paid</h4>
                    <div className="flex items-baseline gap-3 mt-2">
                      <p className="text-3xl font-black text-gray-900">{totalAmountPaid}</p>
                      <p className="text-xs font-bold text-gray-400">Accumulated dues</p>
                    </div>
                  </div>
                </div>

                {/* Outstanding Years */}
                <div className="bg-white p-7 rounded-[28px] shadow-sm hover:shadow-xl border border-gray-100 flex flex-col justify-between transition-all duration-300 hover:scale-[1.02] group cursor-default">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-6 transition-all duration-500 ${
                    outstandingYears === 0 ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
                  }`}>
                    <Clock className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Remaining Years</h4>
                    <div className="flex items-baseline gap-3 mt-2">
                      <p className={`text-3xl font-black ${outstandingYears === 0 ? 'text-green-600' : 'text-red-500'}`}>
                        {outstandingYears}
                      </p>
                      <p className="text-xs font-bold text-gray-400">Outstanding duration</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Announcements & Tasks Grid */}
              <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">
                <div className="xl:col-span-2 space-y-6">
                  <div className="flex items-center justify-between border-b border-gray-200 pb-4">
                    <h3 className="text-xl font-bold text-gray-900 flex items-center gap-3">
                      <div className="w-1.5 h-6 bg-blue-600 rounded-full"></div>
                      Recent Announcements
                    </h3>
                  </div>
                  <div className="grid gap-5">
                    {studentAnnouncements.slice(0, 3).map((ann, i) => (
                      <div key={i} className="bg-white p-6 rounded-[24px] border border-gray-50 shadow-sm hover:shadow-md hover:translate-x-1 transition-all group flex flex-col sm:flex-row gap-5">
                        <div className={`w-12 h-12 shrink-0 rounded-2xl flex items-center justify-center ${ann.batch === 'All Batches' ? 'bg-purple-50 text-purple-600' : 'bg-blue-50 text-blue-600'}`}>
                          <Megaphone className="w-5 h-5" />
                        </div>
                        <div className="flex-1">
                          <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
                            <span className={`text-[10px] font-black px-2.5 py-1 rounded-md uppercase tracking-[0.1em] ${ann.batch === 'All Batches' ? 'bg-purple-100 text-purple-600' : 'bg-blue-100 text-blue-600'}`}>
                              {ann.batch}
                            </span>
                            <span className="text-[11px] font-bold text-gray-400 flex items-center gap-1.5">
                              <Calendar size={12} /> {ann.date}
                            </span>
                          </div>
                          <h4 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors">{ann.title}</h4>
                          <p className="text-gray-500 mt-2 leading-relaxed text-sm line-clamp-2">{ann.content}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="flex items-center justify-between border-b border-gray-200 pb-4">
                    <h3 className="text-xl font-bold text-gray-900">Summary Track</h3>
                  </div>
                  <div className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm space-y-6 relative overflow-hidden">
                    <div className="flex items-center justify-between mb-2">
                       <h4 className="text-sm font-bold text-gray-900">Academic Overview</h4>
                       <span className="px-2 py-1 bg-blue-50 text-blue-600 rounded-lg text-[10px] font-black uppercase">Live</span>
                    </div>
                    <div className="space-y-4">
                       <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
                          <div className="flex items-center gap-3">
                             <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-blue-600 shadow-sm">
                                <Book size={18} />
                             </div>
                             <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Assignments</span>
                          </div>
                          <span className="text-lg font-black text-gray-900">{totalAssignments}</span>
                       </div>
                       <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
                          <div className="flex items-center gap-3">
                             <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-purple-600 shadow-sm">
                                <Bell size={18} />
                             </div>
                             <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">News Alerts</span>
                          </div>
                          <span className="text-lg font-black text-gray-900">{totalAnnouncements}</span>
                       </div>
                    </div>
                    <button 
                      onClick={() => setActiveTab('assignments')}
                      className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold text-xs uppercase tracking-widest transition-all shadow-lg shadow-blue-100 active:scale-95"
                    >
                      Explore Resources
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'assignments' && (
            <div className="space-y-6">
              <div className="flex flex-col border-b border-gray-100 pb-6 mb-8">
                <h3 className="text-2xl font-bold text-gray-900 tracking-tight">Academic Resources</h3>
                <p className="text-sm text-gray-500 mt-1 font-medium">Access and download your course assignments.</p>
              </div>
              <div className="bg-white rounded-[32px] border border-gray-100 shadow-xl overflow-hidden">
                <table className="w-full text-left">
                  <thead className="bg-gray-50/80 border-b border-gray-100">
                    <tr>
                      <th className="px-8 py-6 text-xs font-black text-gray-400 uppercase tracking-[0.2em]">Resource Title</th>
                      <th className="px-8 py-6 text-xs font-black text-gray-400 uppercase tracking-[0.2em]">Release Date</th>
                      <th className="px-8 py-6 text-xs font-black text-gray-400 uppercase tracking-[0.2em] text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {studentAssignments.map((a, i) => {
                      return (
                        <tr key={i} className="hover:bg-blue-50/30 transition-all group">
                          <td className="px-8 py-8">
                            <div className="flex items-center gap-4">
                               <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-white group-hover:text-blue-600 transition-all border border-transparent group-hover:border-blue-100 shadow-sm">
                                  <FileText size={24} />
                               </div>
                               <div>
                                  <h5 className="text-lg font-bold text-gray-900 tracking-tight">{a.title}</h5>
                                  <p className="text-sm text-gray-500 mt-1 font-medium line-clamp-1 max-w-md">{a.description}</p>
                               </div>
                            </div>
                          </td>
                          <td className="px-8 py-8">
                            <span className="text-gray-900 font-bold bg-gray-50 px-3 py-1.5 rounded-lg text-sm">{a.dueDate}</span>
                          </td>
                          <td className="px-8 py-8 text-right">
                            <div className="flex justify-end items-center gap-4">
                              {a.fileUrl ? (
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 flex items-center justify-center rounded-xl bg-red-50 text-red-500 shadow-sm border border-red-100">
                                    <FileText className="w-5 h-5" />
                                  </div>
                                  <button 
                                    onClick={() => handleDownload(a.fileUrl!, a.fileName!)}
                                    className="flex items-center gap-2 text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-4 py-2.5 rounded-xl text-sm font-black transition-all group/btn"
                                  >
                                    <Download className="w-4 h-4 group-hover/btn:translate-y-0.5 transition-transform" />
                                    Download
                                  </button>
                                </div>
                              ) : (
                                <span className="text-xs font-black text-gray-400 uppercase tracking-widest bg-gray-50 px-3 py-1.5 rounded-lg">No file</span>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'announcements' && (
            <div className="max-w-4xl mx-auto space-y-10">
               <div className="flex flex-col border-b border-gray-100 pb-6">
                <h3 className="text-2xl font-bold text-gray-900 tracking-tight text-center">News & Announcements</h3>
                <p className="text-sm text-gray-500 mt-1 font-medium text-center">Stay updated with the latest alerts from your instructors and the institution.</p>
              </div>
              <div className="grid gap-6">
                {studentAnnouncements.map((ann, i) => (
                  <div key={i} className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-md relative overflow-hidden group hover:shadow-xl transition-all">
                    <div className={`absolute left-0 top-0 bottom-0 w-2 ${ann.batch === 'All Batches' ? 'bg-purple-500' : 'bg-blue-500'}`} />
                    <div className="flex justify-between items-start mb-6">
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-inner ${ann.batch === 'All Batches' ? 'bg-purple-50 text-purple-600' : 'bg-blue-50 text-blue-600'}`}>
                          <Megaphone size={24} />
                        </div>
                        <div>
                          <p className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em]">{ann.date}</p>
                          <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded ${ann.batch === 'All Batches' ? 'bg-purple-100 text-purple-600' : 'bg-blue-100 text-blue-600'}`}>
                            {ann.batch}
                          </span>
                        </div>
                      </div>
                    </div>
                    <h4 className="text-2xl font-black text-gray-900 mb-4 group-hover:text-blue-600 transition-colors tracking-tight">{ann.title}</h4>
                    <p className="text-gray-600 leading-relaxed text-lg font-medium">{ann.content}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'payments' && (
            <div className="space-y-10">
               <div className="flex flex-col border-b border-gray-100 pb-6 mb-8">
                <h3 className="text-2xl font-bold text-gray-900 tracking-tight">Yearly Payment Tracking</h3>
                <p className="text-sm text-gray-500 mt-1 font-medium">Detailed tracking of your academic dues by year.</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm hover:shadow-lg transition-all">
                  <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-4">Paid Years</p>
                  <p className="text-4xl font-black text-gray-900">{totalPaidYears} / {courseDuration}</p>
                </div>
                <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-8 rounded-[32px] shadow-2xl shadow-blue-200">
                  <p className="text-[11px] font-black text-blue-100 uppercase tracking-widest mb-4">Total Amount Paid</p>
                  <p className="text-4xl font-black text-white">{totalAmountPaid}</p>
                </div>
                <div className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm hover:shadow-lg transition-all">
                  <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-4">Outstanding Years</p>
                  <p className="text-4xl font-black text-red-500">{outstandingYears}</p>
                </div>
              </div>

              <div className="bg-white rounded-[32px] border border-gray-100 shadow-2xl overflow-hidden">
                <div className="px-10 py-8 bg-gray-50/50 border-b border-gray-100 flex justify-between items-center">
                  <h4 className="text-xl font-bold text-gray-900 flex items-center gap-3">
                    <div className="p-2 bg-blue-100 text-blue-600 rounded-xl">
                       <Calendar size={20} />
                    </div>
                    Academic Year | Amount | Status
                  </h4>
                </div>
                <table className="w-full text-left">
                  <thead className="bg-white border-b border-gray-100">
                    <tr>
                      <th className="px-10 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Academic Year</th>
                      <th className="px-10 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] text-center">Amount</th>
                      <th className="px-10 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] text-center">Payment Date</th>
                      <th className="px-10 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50 text-base">
                    {paidYears.map((p, i) => (
                      <tr key={i} className="hover:bg-blue-50/20 transition-all group">
                        <td className="px-10 py-7 text-gray-900 font-black text-xl tracking-tighter">{p.year}</td>
                        <td className="px-10 py-7 text-gray-900 font-black text-center">{p.amount}</td>
                        <td className="px-10 py-7 text-gray-400 font-bold text-sm text-center">{p.paidDate}</td>
                        <td className="px-10 py-7 text-right">
                          <span className={`px-5 py-2 rounded-2xl text-[11px] font-black inline-flex items-center gap-2 shadow-sm uppercase tracking-widest bg-green-50 text-green-600 ring-1 ring-green-200`}>
                             <div className={`w-2 h-2 rounded-full bg-green-600`} />
                             Paid
                          </span>
                        </td>
                      </tr>
                    ))}
                    {paidYears.length === 0 && (
                       <tr>
                         <td colSpan={4} className="px-10 py-20 text-center text-gray-300 font-bold uppercase tracking-[0.2em]">No payment records available.</td>
                       </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'profile' && (
            <div className="max-w-3xl mx-auto space-y-10">
              <div className="flex justify-between items-center bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm overflow-hidden relative">
                 <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50/50 rounded-full blur-3xl -mr-32 -mt-32"></div>
                 <div>
                    <h1 className="text-2xl font-bold text-gray-900 tracking-tight">My Profile</h1>
                    <p className="text-sm text-gray-500 font-medium mt-1">Manage your personal information</p>
                 </div>
                 <button 
                  onClick={() => setIsEditingProfile(!isEditingProfile)}
                  className={`relative z-10 flex items-center gap-2 px-8 py-3.5 rounded-2xl text-sm font-black transition-all active:scale-95 shadow-lg ${
                    isEditingProfile ? 'bg-gray-100 text-gray-700 shadow-none' : 'bg-blue-600 text-white shadow-blue-200'
                  }`}
                >
                  {isEditingProfile ? <X size={18} /> : <Edit2 size={18} />}
                  {isEditingProfile ? "Discard" : "Update Profile"}
                </button>
              </div>

              <div className="bg-white p-10 rounded-[24px] border border-gray-100 shadow-md relative overflow-hidden group">
                 <div className="flex flex-col sm:flex-row items-center gap-8 border-b border-gray-100 pb-10 mb-10">
                    <div className="w-16 h-16 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600 text-2xl font-bold shadow-inner">
                       {firstLetter}
                    </div>
                    <div className="text-center sm:text-left">
                       <h4 className="text-3xl font-bold text-gray-900 leading-none tracking-tight">
                          {isEditingProfile ? (profileForm.name || studentProfile?.name) : studentProfile?.name}
                       </h4>
                       <div className="flex items-center gap-3 mt-3">
                          <span className="text-blue-600 font-black uppercase tracking-widest text-[11px] bg-blue-50 px-3 py-1 rounded-md">{studentProfile?.batch}</span>
                          <span className="text-gray-500 font-medium uppercase tracking-widest text-xs">STUDENT</span>
                       </div>
                    </div>
                 </div>

                 <form onSubmit={handleUpdateProfile} className="space-y-8">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                       <div className="space-y-3">
                          <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Full Name</label>
                          <div className="relative group">
                            <input 
                              type="text" 
                              disabled={!isEditingProfile}
                              value={profileForm.name}
                              onChange={(e) => setProfileForm({...profileForm, name: e.target.value})}
                              className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-lg text-gray-800 text-sm font-medium focus:bg-white focus:border-blue-500 transition-all outline-none disabled:opacity-75 disabled:cursor-not-allowed"
                            />
                          </div>
                       </div>
                       <div className="space-y-3">
                          <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Phone Number</label>
                          <input 
                            type="tel" 
                            disabled={!isEditingProfile}
                            value={profileForm.phone}
                            onChange={(e) => setProfileForm({...profileForm, phone: e.target.value})}
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-lg text-gray-800 text-sm font-medium focus:bg-white focus:border-blue-500 transition-all outline-none disabled:opacity-75 disabled:cursor-not-allowed"
                          />
                       </div>
                       <div className="space-y-3">
                          <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Email</label>
                          <div className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-lg text-gray-800 text-sm font-medium cursor-not-allowed opacity-75">
                            {currentUser.email}
                          </div>
                       </div>
                       <div className="space-y-3">
                          <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Batch</label>
                          <div className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-lg text-gray-800 text-sm font-medium cursor-not-allowed opacity-75">
                            {studentProfile?.batch}
                          </div>
                       </div>
                    </div>

                    {isEditingProfile && (
                      <div className="pt-6 animate-in slide-in-from-bottom-4 duration-300">
                        <button 
                          type="submit"
                          className="flex items-center justify-center gap-3 px-8 py-3 bg-blue-600 text-white rounded-lg font-bold text-sm shadow-lg shadow-blue-500/20 hover:bg-blue-700 active:scale-[0.98] transition-all"
                        >
                          <Save size={18} /> Edit Profile
                        </button>
                      </div>
                    )}
                 </form>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
