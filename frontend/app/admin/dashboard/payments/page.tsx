"use client";

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { PageHeader } from '@/components/PageHeader';
import { Table, Column } from '@/components/Table';
import { Search, Filter, X, AlertCircle, GraduationCap, CreditCard, User, Mail, BookOpen, Calendar, Clock, Plus } from 'lucide-react';
import toast from 'react-hot-toast';
import { useData, Payment } from '@/contexts/DataContext';

const columns: Column[] = [
  { key: 'studentName', label: 'Student Name' },
  { key: 'email', label: 'Email' },
  { key: 'batch', label: 'Batch' },
  { key: 'year', label: 'Year' },
  { key: 'amount', label: 'Amount' },
  { key: 'formattedDate', label: 'Paid Date' },
  { key: 'status', label: 'Status' },
];

function PaymentsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { payments, setPayments } = useData();

  const [searchQuery, setSearchQuery] = useState('');
  const [batchFilter, setBatchFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [yearFilter, setYearFilter] = useState('');

  const today = new Date().toISOString().split('T')[0];
  const currentYear = new Date().getFullYear();

  // Auto-open Add form via query params
  const [showAddForm, setShowAddForm] = useState(false);
  const [newPayment, setNewPayment] = useState<any>({ 
    studentName: '', 
    email: '', 
    batch: 'Batch A - React', 
    amount: '', 
    year: currentYear,
    paidDate: today, 
    status: 'Paid' 
  });

  // Modal State
  const [editItem, setEditItem] = useState<any>(null);
  const [deleteItem, setDeleteItem] = useState<any>(null);

  useEffect(() => {
    if (searchParams?.get('action') === 'add') {
      setShowAddForm(true);
    }
  }, [searchParams]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setEditItem(null);
        setDeleteItem(null);
        if (showAddForm) {
          setShowAddForm(false);
          router.replace('/admin/dashboard/payments');
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showAddForm, router]);

  const filteredPayments = payments.filter(payment => {
    const matchesSearch = payment.studentName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          payment.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesBatch = batchFilter ? payment.batch === batchFilter : true;
    const matchesStatus = statusFilter ? payment.status === statusFilter : true;
    const matchesYear = yearFilter ? payment.year.toString() === yearFilter : true;
    return matchesSearch && matchesBatch && matchesStatus && matchesYear;
  });

  const formattedPayments = filteredPayments.map(p => ({
    ...p,
    formattedDate: p.status === 'Paid' && p.paidDate 
      ? new Date(p.paidDate).toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
        })
      : '-'
  }));

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPayment.studentName || !newPayment.email || !newPayment.amount || !newPayment.batch || !newPayment.year) {
      toast.error("Please fill required fields.");
      return;
    }
    
    // Explicit Validation: Prevent duplicate year entry for the same student
    const isDuplicate = payments.some(p => p.email === newPayment.email && p.year === Number(newPayment.year));
    
    if (isDuplicate) {
      toast.error(`Already paid for ${newPayment.year}. Please edit the existing record instead.`);
      return;
    }

    const paymentData: Payment = {
      id: Date.now(),
      studentName: newPayment.studentName!,
      email: newPayment.email!,
      batch: newPayment.batch!,
      amount: Number(newPayment.amount),
      year: Number(newPayment.year),
      status: newPayment.status!,
      paidDate: newPayment.status === 'Paid' ? newPayment.paidDate! : ''
    };

    setPayments([paymentData, ...payments]);
    toast.success("Payment recorded successfully");

    setShowAddForm(false);
    setNewPayment({ studentName: '', email: '', batch: 'Batch A - React', amount: '', year: currentYear, paidDate: today, status: 'Paid' });
    router.replace('/admin/dashboard/payments');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    setPayments(payments.map(p => p.id === editItem.id ? { ...editItem, amount: Number(editItem.amount) } : p));
    setEditItem(null);
    toast.success("Payment record updated");
  };

  const confirmDelete = () => {
    if (!deleteItem) return;
    setPayments(payments.filter(p => p.id !== deleteItem.id));
    setDeleteItem(null);
    toast.success("Payment record deleted");
  };

  const inputClass = "h-11 rounded-lg border border-gray-300 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition w-full text-gray-800 placeholder-gray-400";
  const labelClass = "block text-sm font-medium text-gray-600 mb-1.5 flex items-center gap-2";

  return (
    <div className="animate-in fade-in duration-500 text-gray-900">
      <div className="mb-2">
        <p className="text-base text-gray-500 font-medium">Record and track student payments year-wise.</p>
      </div>
      <PageHeader 
        title="Payment Tracking" 
        buttonText="Record Payment"
        onButtonClick={() => {
          setShowAddForm(true);
          router.replace('/admin/dashboard/payments?action=add');
        }}
      >
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input 
              type="text" 
              placeholder="Search by name or email..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-2.5 bg-white text-gray-900 placeholder-gray-400 border border-gray-200 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-blue-500 w-full transition-all"
            />
          </div>
          <div className="relative w-full sm:w-auto">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <select 
              value={yearFilter}
              onChange={(e) => setYearFilter(e.target.value)}
              className="pl-9 pr-8 py-2.5 bg-white text-gray-900 border border-gray-200 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none w-full sm:w-auto transition-all"
            >
              <option value="">All Years</option>
              <option value="2023">2023</option>
              <option value="2024">2024</option>
              <option value="2025">2025</option>
              <option value="2026">2026</option>
            </select>
          </div>
          {(searchQuery || batchFilter || statusFilter || yearFilter) && (
            <button 
              onClick={() => { setSearchQuery(''); setBatchFilter(''); setStatusFilter(''); setYearFilter(''); }}
              className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors active:scale-95"
              title="Reset Filters"
            >
              <X size={20} />
            </button>
          )}
        </div>
      </PageHeader>

      <Table 
        columns={columns} 
        data={formattedPayments} 
        onEdit={(payment) => setEditItem(payment)}
        onDelete={(payment) => setDeleteItem(payment)}
      />

      {/* Add Payment Modal */}
      {showAddForm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-in fade-in duration-300" onClick={(e) => {
          if (e.target === e.currentTarget) {
            setShowAddForm(false);
            router.replace('/admin/dashboard/payments');
          }
        }}>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl animate-in zoom-in-95 duration-300 overflow-hidden font-sans">
            <div className="px-8 py-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-blue-600 rounded-xl text-white shadow-md shadow-blue-200">
                  <CreditCard size={24} />
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-semibold text-gray-900">Record New Payment</h2>
                  <p className="text-sm text-gray-500">Log a student payment transaction</p>
                </div>
              </div>
              <button 
                onClick={() => {
                  setShowAddForm(false);
                  router.replace('/admin/dashboard/payments');
                }} 
                className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-200/50 rounded-full transition-all active:scale-90"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="p-8 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className={labelClass}>
                    <User size={16} className="text-blue-500" />
                    Student Name *
                  </label>
                  <input type="text" autoFocus value={newPayment.studentName} onChange={e => setNewPayment({...newPayment, studentName: e.target.value})} className={inputClass} placeholder="e.g. John Doe" required />
                </div>
                <div className="space-y-1">
                  <label className={labelClass}>
                    <Mail size={16} className="text-blue-500" />
                    Email *
                  </label>
                  <input type="email" value={newPayment.email} onChange={e => setNewPayment({...newPayment, email: e.target.value})} className={inputClass} placeholder="e.g. john@example.com" required />
                </div>
                <div className="space-y-1">
                  <label className={labelClass}>
                    <BookOpen size={16} className="text-blue-500" />
                    Select Batch *
                  </label>
                  <select value={newPayment.batch} onChange={e => setNewPayment({...newPayment, batch: e.target.value})} className={inputClass} required>
                    <option value="Batch A - React">Batch A - React</option>
                    <option value="Batch B - Node.js">Batch B - Node.js</option>
                    <option value="Batch C - UI/UX">Batch C - UI/UX</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className={labelClass}>
                    <Calendar size={16} className="text-blue-500" />
                    Academic Year *
                  </label>
                  <select value={newPayment.year} onChange={e => setNewPayment({...newPayment, year: Number(e.target.value)})} className={inputClass} required>
                    <option value="2023">2023</option>
                    <option value="2024">2024</option>
                    <option value="2025">2025</option>
                    <option value="2026">2026</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className={labelClass}>
                    <CreditCard size={16} className="text-blue-500" />
                    Amount *
                  </label>
                  <input type="text" value={newPayment.amount} onChange={e => setNewPayment({...newPayment, amount: e.target.value})} className={inputClass} placeholder="e.g. 10000" required />
                </div>
                <div className="space-y-1">
                  <label className={labelClass}>
                    <Clock size={16} className="text-blue-500" />
                    Payment Date
                  </label>
                  <input 
                    type="date" 
                    value={newPayment.paidDate} 
                    onChange={e => setNewPayment({...newPayment, paidDate: e.target.value})} 
                    className={`${inputClass} disabled:bg-gray-50 disabled:text-gray-400`} 
                    required={newPayment.status === 'Paid'}
                    disabled={newPayment.status === 'Unpaid'}
                  />
                </div>
                <div className="col-span-1 md:col-span-2 space-y-1">
                  <label className={labelClass}>
                    <AlertCircle size={16} className="text-blue-500" />
                    Payment Status
                  </label>
                  <select value={newPayment.status} onChange={e => setNewPayment({...newPayment, status: e.target.value})} className={inputClass}>
                    <option value="Paid">Paid</option>
                    <option value="Unpaid">Unpaid</option>
                  </select>
                </div>
              </div>
              <div className="mt-6 flex justify-end gap-3 pt-6 border-t border-gray-100">
                <button type="button" onClick={() => {
                  setShowAddForm(false);
                  router.replace('/admin/dashboard/payments');
                }} className="px-5 py-2.5 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 active:scale-95 text-sm font-medium transition-all">Cancel</button>
                <button type="submit" className="px-5 py-2.5 text-white bg-blue-600 rounded-lg hover:bg-blue-700 active:scale-95 text-sm font-medium shadow transition-all">Record Payment</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editItem && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-in fade-in duration-300" onClick={(e) => e.target === e.currentTarget && setEditItem(null)}>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl animate-in zoom-in-95 duration-300 overflow-hidden font-sans">
            <div className="px-8 py-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-blue-600 rounded-xl text-white shadow-md shadow-blue-200">
                  <CreditCard size={24} />
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-semibold text-gray-900">Edit Payment Record</h2>
                  <p className="text-sm text-gray-500">Update transaction details</p>
                </div>
              </div>
              <button onClick={() => setEditItem(null)} className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-200/50 rounded-full transition-all active:scale-90">
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleSaveEdit} className="p-8 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className={labelClass}>
                    <User size={16} className="text-blue-500" />
                    Student Name
                  </label>
                  <input type="text" value={editItem.studentName} onChange={e => setEditItem({...editItem, studentName: e.target.value})} className={inputClass} required />
                </div>
                <div className="space-y-1">
                  <label className={labelClass}>
                    <Mail size={16} className="text-blue-500" />
                    Email
                  </label>
                  <input type="email" value={editItem.email} onChange={e => setEditItem({...editItem, email: e.target.value})} className={inputClass} required />
                </div>
                <div className="space-y-1">
                  <label className={labelClass}>
                    <Calendar size={16} className="text-blue-500" />
                    Year
                  </label>
                  <input type="number" value={editItem.year} className={`${inputClass} bg-gray-50 cursor-not-allowed`} disabled />
                </div>
                <div className="space-y-1">
                  <label className={labelClass}>
                    <BookOpen size={16} className="text-blue-500" />
                    Batch
                  </label>
                  <select value={editItem.batch} onChange={e => setEditItem({...editItem, batch: e.target.value})} className={inputClass}>
                    <option>Batch A - React</option>
                    <option>Batch B - Node.js</option>
                    <option>Batch C - UI/UX</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className={labelClass}>
                    <CreditCard size={16} className="text-blue-500" />
                    Amount
                  </label>
                  <input type="text" value={editItem.amount} onChange={e => setEditItem({...editItem, amount: e.target.value})} className={inputClass} required />
                </div>
                <div className="space-y-1">
                  <label className={labelClass}>
                    <Clock size={16} className="text-blue-500" />
                    Paid Date
                  </label>
                  <input type="date" value={editItem.paidDate} onChange={e => setEditItem({...editItem, paidDate: e.target.value})} className={inputClass} disabled={editItem.status === 'Unpaid'} />
                </div>
                <div className="col-span-1 md:col-span-2 space-y-1">
                  <label className={labelClass}>
                    <AlertCircle size={16} className="text-blue-500" />
                    Status
                  </label>
                  <select value={editItem.status} onChange={e => setEditItem({...editItem, status: e.target.value})} className={inputClass}>
                    <option>Paid</option>
                    <option>Unpaid</option>
                  </select>
                </div>
              </div>
              <div className="mt-8 flex justify-end gap-3 pt-6 border-t border-gray-100">
                <button type="button" onClick={() => setEditItem(null)} className="px-5 py-2.5 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 active:scale-95 text-sm font-medium transition-all">Cancel</button>
                <button type="submit" className="px-5 py-2.5 text-white bg-blue-600 rounded-lg hover:bg-blue-700 active:scale-95 text-sm font-medium shadow transition-all">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteItem && (
        <div className="fixed inset-0 z-[110] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200" onClick={(e) => e.target === e.currentTarget && setDeleteItem(null)}>
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-lg animate-in zoom-in-95 duration-200 font-sans">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Confirm Delete</h3>
            <p className="text-gray-500 text-sm font-medium mb-6 leading-relaxed">Are you sure you want to delete this payment record? This action cannot be undone.</p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setDeleteItem(null)} className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-xl transition-all active:scale-95">
                Cancel
              </button>
              <button onClick={confirmDelete} className="px-5 py-2.5 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-xl transition-all active:scale-95">
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function PaymentsPage() {
  return (
    <Suspense fallback={<div className="flex p-8 justify-center items-center text-gray-500">Loading payments directory...</div>}>
      <PaymentsContent />
    </Suspense>
  );
}
