"use client";

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { PageHeader } from '@/components/PageHeader';
import { Table, Column } from '@/components/Table';
import { Search, Filter, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { useData, Payment } from '@/contexts/DataContext';

const columns: Column[] = [
  { key: 'studentName', label: 'Student Name' },
  { key: 'email', label: 'Email' },
  { key: 'batch', label: 'Batch' },
  { key: 'amount', label: 'Amount' },
  { key: 'formattedDate', label: 'Payment Date' },
  { key: 'status', label: 'Status' },
];

function PaymentsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { payments, setPayments } = useData();

  const [searchQuery, setSearchQuery] = useState('');
  const [batchFilter, setBatchFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const today = new Date().toISOString().split('T')[0];

  // Auto-open Add form via query params
  const [showAddForm, setShowAddForm] = useState(false);
  const [newPayment, setNewPayment] = useState<Partial<Payment>>({ 
    studentName: '', 
    email: '', 
    batch: '', 
    amount: '', 
    paymentDate: today, 
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
    return matchesSearch && matchesBatch && matchesStatus;
  });

  const formattedPayments = filteredPayments.map(p => ({
    ...p,
    formattedDate: p.status === 'Paid' && p.paymentDate 
      ? new Date(p.paymentDate).toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
        })
      : '-'
  }));

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPayment.studentName || !newPayment.email || !newPayment.amount || !newPayment.batch) {
      toast.error("Please fill required fields.");
      return;
    }
    
    const paymentToAdd = {
      id: Date.now(),
      studentName: newPayment.studentName!,
      email: newPayment.email!,
      batch: newPayment.batch!,
      amount: newPayment.amount!,
      status: newPayment.status!,
      paymentDate: newPayment.status === 'Paid' ? newPayment.paymentDate! : ''
    };

    setPayments([paymentToAdd, ...payments]);
    setShowAddForm(false);
    setNewPayment({ studentName: '', email: '', batch: '', amount: '', paymentDate: today, status: 'Paid' });
    toast.success("Payment added successfully");
    router.replace('/admin/dashboard/payments');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    setPayments(payments.map(p => p.id === editItem.id ? editItem : p));
    setEditItem(null);
    toast.success("Payment updated successfully");
  };

  const confirmDelete = () => {
    if (!deleteItem) return;
    setPayments(payments.filter(p => p.id !== deleteItem.id));
    setDeleteItem(null);
    toast.success("Payment deleted successfully");
  };

  return (
    <div className="animate-in fade-in duration-500">
      <div className="mb-2">
        <p className="text-base text-gray-500 font-medium">Record and track student payments.</p>
      </div>
      <PageHeader 
        title="Payments" 
        buttonText="Add Payment"
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
              value={batchFilter}
              onChange={(e) => setBatchFilter(e.target.value)}
              className="pl-9 pr-8 py-2.5 bg-white text-gray-900 border border-gray-200 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none w-full sm:w-auto transition-all"
            >
              <option value="">All Batches</option>
              <option value="Batch A - React">Batch A - React</option>
              <option value="Batch B - Node.js">Batch B - Node.js</option>
              <option value="Batch C - UI/UX">Batch C - UI/UX</option>
            </select>
          </div>
          <div className="relative w-full sm:w-auto">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="pl-9 pr-8 py-2.5 bg-white text-gray-900 border border-gray-200 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none w-full sm:w-auto transition-all"
            >
              <option value="">All Statuses</option>
              <option value="Paid">Paid</option>
              <option value="Unpaid">Unpaid</option>
            </select>
          </div>
          {(searchQuery || batchFilter || statusFilter) && (
            <button 
              onClick={() => { setSearchQuery(''); setBatchFilter(''); setStatusFilter(''); }}
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
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200" onClick={(e) => {
          if (e.target === e.currentTarget) {
            setShowAddForm(false);
            router.replace('/admin/dashboard/payments');
          }
        }}>
          <div className="bg-white rounded-xl shadow-lg w-full max-w-lg p-6 animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-gray-900">Add New Payment</h3>
              <button onClick={() => {
                setShowAddForm(false);
                router.replace('/admin/dashboard/payments');
              }} className="text-gray-400 hover:text-gray-600 transition-colors hover:scale-110 active:scale-95">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleAddSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-base font-medium text-gray-700 mb-1">Student Name *</label>
                  <input type="text" autoFocus value={newPayment.studentName} onChange={e => setNewPayment({...newPayment, studentName: e.target.value})} className="w-full px-4 py-2.5 border border-gray-200 bg-white text-gray-900 rounded-xl text-base focus:ring-2 focus:ring-blue-500 outline-none" required />
                </div>
                <div>
                  <label className="block text-base font-medium text-gray-700 mb-1">Email *</label>
                  <input type="email" value={newPayment.email} onChange={e => setNewPayment({...newPayment, email: e.target.value})} className="w-full px-4 py-2.5 border border-gray-200 bg-white text-gray-900 rounded-xl text-base focus:ring-2 focus:ring-blue-500 outline-none" required />
                </div>
                <div className="col-span-2">
                  <label className="block text-base font-medium text-gray-700 mb-1">Batch *</label>
                  <select value={newPayment.batch} onChange={e => setNewPayment({...newPayment, batch: e.target.value})} className="w-full px-4 py-2.5 border border-gray-200 bg-white text-gray-900 rounded-xl text-base focus:ring-2 focus:ring-blue-500 outline-none" required>
                    <option value="" disabled>Select a batch</option>
                    <option value="Batch A - React">Batch A - React</option>
                    <option value="Batch B - Node.js">Batch B - Node.js</option>
                    <option value="Batch C - UI/UX">Batch C - UI/UX</option>
                  </select>
                </div>
                <div>
                  <label className="block text-base font-medium text-gray-700 mb-1">Amount *</label>
                  <input type="text" value={newPayment.amount} onChange={e => setNewPayment({...newPayment, amount: e.target.value})} className="w-full px-4 py-2.5 border border-gray-200 bg-white text-gray-900 rounded-xl text-base focus:ring-2 focus:ring-blue-500 outline-none" placeholder="$0.00" required />
                </div>
                <div>
                  <label className="block text-base font-medium text-gray-700 mb-1">Payment Date {newPayment.status === 'Paid' ? '*' : ''}</label>
                  <input 
                    type="date" 
                    value={newPayment.paymentDate} 
                    onChange={e => setNewPayment({...newPayment, paymentDate: e.target.value})} 
                    className="w-full px-4 py-2.5 border border-gray-200 bg-white text-gray-900 rounded-xl text-base focus:ring-2 focus:ring-blue-500 outline-none disabled:bg-gray-100 disabled:text-gray-400" 
                    required={newPayment.status === 'Paid'}
                    disabled={newPayment.status === 'Unpaid'}
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-base font-medium text-gray-700 mb-1">Status</label>
                  <select value={newPayment.status} onChange={e => setNewPayment({...newPayment, status: e.target.value})} className="w-full px-4 py-2.5 border border-gray-200 bg-white text-gray-900 rounded-xl text-base focus:ring-2 focus:ring-blue-500 outline-none">
                    <option value="Paid">Paid</option>
                    <option value="Unpaid">Unpaid</option>
                  </select>
                </div>
              </div>
              <div className="mt-8 flex justify-end gap-3 pt-4 border-t border-gray-100">
                <button type="button" onClick={() => {
                  setShowAddForm(false);
                  router.replace('/admin/dashboard/payments');
                }} className="px-5 py-2.5 text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 active:scale-95 text-base font-medium transition-all">Cancel</button>
                <button type="submit" className="px-5 py-2.5 text-white bg-blue-600 rounded-xl hover:bg-blue-700 active:scale-95 text-base font-medium transition-all">Add Payment</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteItem && (
        <div className="fixed inset-0 z-[70] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200" onClick={(e) => e.target === e.currentTarget && setDeleteItem(null)}>
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-lg animate-in zoom-in-95 duration-200">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Confirm Delete</h3>
            <p className="text-gray-500 text-base mb-6">Are you sure you want to delete this payment? This action cannot be undone.</p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setDeleteItem(null)} className="px-5 py-2.5 text-base font-medium text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-xl transition-all hover:scale-105 active:scale-95">
                Cancel
              </button>
              <button onClick={confirmDelete} className="px-5 py-2.5 text-base font-medium text-white bg-red-500 hover:bg-red-600 rounded-xl transition-all hover:scale-105 active:scale-95">
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editItem && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200" onClick={(e) => e.target === e.currentTarget && setEditItem(null)}>
          <div className="bg-white rounded-xl shadow-lg w-full max-w-lg p-6 animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-gray-900">Edit Payment</h3>
              <button onClick={() => setEditItem(null)} className="text-gray-400 hover:text-gray-600 transition-colors hover:scale-110 active:scale-95">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-base font-medium text-gray-700 mb-1">Student Name</label>
                  <input type="text" value={editItem.studentName} onChange={e => setEditItem({...editItem, studentName: e.target.value})} className="w-full px-4 py-2.5 border border-gray-200 bg-white text-gray-900 rounded-xl text-base focus:ring-2 focus:ring-blue-500 outline-none" required />
                </div>
                <div>
                  <label className="block text-base font-medium text-gray-700 mb-1">Email</label>
                  <input type="email" value={editItem.email} onChange={e => setEditItem({...editItem, email: e.target.value})} className="w-full px-4 py-2.5 border border-gray-200 bg-white text-gray-900 rounded-xl text-base focus:ring-2 focus:ring-blue-500 outline-none" required />
                </div>
                <div className="col-span-2">
                  <label className="block text-base font-medium text-gray-700 mb-1">Batch</label>
                  <select value={editItem.batch} onChange={e => setEditItem({...editItem, batch: e.target.value})} className="w-full px-4 py-2.5 border border-gray-200 bg-white text-gray-900 rounded-xl text-base focus:ring-2 focus:ring-blue-500 outline-none">
                    <option>Batch A - React</option>
                    <option>Batch B - Node.js</option>
                    <option>Batch C - UI/UX</option>
                  </select>
                </div>
                <div>
                  <label className="block text-base font-medium text-gray-700 mb-1">Amount</label>
                  <input type="text" value={editItem.amount} onChange={e => setEditItem({...editItem, amount: e.target.value})} className="w-full px-4 py-2.5 border border-gray-200 bg-white text-gray-900 rounded-xl text-base focus:ring-2 focus:ring-blue-500 outline-none" placeholder="$0.00" required />
                </div>
                <div>
                  <label className="block text-base font-medium text-gray-700 mb-1">Payment Date</label>
                  <input type="date" value={editItem.paymentDate} onChange={e => setEditItem({...editItem, paymentDate: e.target.value})} className="w-full px-4 py-2.5 border border-gray-200 bg-white text-gray-900 rounded-xl text-base focus:ring-2 focus:ring-blue-500 outline-none disabled:bg-gray-100 disabled:text-gray-400" disabled={editItem.status === 'Unpaid'} />
                </div>
                <div className="col-span-2">
                  <label className="block text-base font-medium text-gray-700 mb-1">Status</label>
                  <select value={editItem.status} onChange={e => setEditItem({...editItem, status: e.target.value})} className="w-full px-4 py-2.5 border border-gray-200 bg-white text-gray-900 rounded-xl text-base focus:ring-2 focus:ring-blue-500 outline-none">
                    <option>Paid</option>
                    <option>Unpaid</option>
                  </select>
                </div>
              </div>
              <div className="mt-8 flex justify-end gap-3 pt-4 border-t border-gray-100">
                <button type="button" onClick={() => setEditItem(null)} className="px-5 py-2.5 text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 active:scale-95 text-base font-medium transition-all">Cancel</button>
                <button type="submit" className="px-5 py-2.5 text-white bg-blue-600 rounded-xl hover:bg-blue-700 active:scale-95 text-base font-medium transition-all">Save Changes</button>
              </div>
            </form>
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
