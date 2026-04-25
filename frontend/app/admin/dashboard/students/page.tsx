"use client";

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { PageHeader } from '@/components/PageHeader';
import { Table, Column } from '@/components/Table';
import { Search, Filter, X } from 'lucide-react';
import toast from 'react-hot-toast';

import { useData } from '@/contexts/DataContext';

const columns: Column[] = [
  { key: 'name', label: 'Name' },
  { key: 'email', label: 'Email' },
  { key: 'batch', label: 'Batch' },
  { key: 'status', label: 'Status' },
];

function StudentsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { students, setStudents } = useData();
  const [searchQuery, setSearchQuery] = useState('');
  const [batchFilter, setBatchFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Modal States
  const [showAddForm, setShowAddForm] = useState(false);
  const [editItem, setEditItem] = useState<any>(null);
  const [viewItem, setViewItem] = useState<any>(null);
  const [deleteItem, setDeleteItem] = useState<any>(null);
  const [viewTab, setViewTab] = useState('info'); // info, payments, assignments

  const [newStudent, setNewStudent] = useState({ name: '', email: '', phone: '', batch: '', status: 'Active' });

  // Handle Query Params
  useEffect(() => {
    if (searchParams?.get('action') === 'add') {
      setShowAddForm(true);
    }
  }, [searchParams]);

  // ESC key to close modals
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setEditItem(null);
        setViewItem(null);
        setDeleteItem(null);
        if (showAddForm) {
          setShowAddForm(false);
          router.replace('/admin/dashboard/students');
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showAddForm, router]);

  const filteredStudents = students.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          student.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesBatch = batchFilter ? student.batch === batchFilter : true;
    const matchesStatus = statusFilter ? student.status === statusFilter : true;
    return matchesSearch && matchesBatch && matchesStatus;
  });

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStudent.name || !newStudent.email || !newStudent.batch) {
      toast.error("Please fill required fields.");
      return;
    }
    const studentToAdd = {
      id: Date.now(),
      ...newStudent,
      paymentStatus: 'Unpaid',
      totalPaid: '$0.00',
      assignments: []
    };
    setStudents([studentToAdd, ...students]);
    setShowAddForm(false);
    setNewStudent({ name: '', email: '', phone: '', batch: '', status: 'Active' });
    toast.success("Student added successfully");
    router.replace('/admin/dashboard/students'); // Clear query param
    window.scrollTo({ top: 0, behavior: 'smooth' }); // Optional scroll tracking
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    setStudents(students.map(s => s.id === editItem.id ? editItem : s));
    setEditItem(null);
    toast.success("Student updated successfully");
  };

  const confirmDelete = () => {
    if (!deleteItem) return;
    setStudents(students.filter(s => s.id !== deleteItem.id));
    setDeleteItem(null);
    toast.success("Student deleted successfully");
  };

  return (
    <div className="animate-in fade-in duration-500">
      <div className="mb-2">
        <p className="text-base text-gray-500 font-medium">Manage and view all enrolled students.</p>
      </div>
      <PageHeader 
        title="Students Management" 
        buttonText="Add Student"
        onButtonClick={() => {
          setShowAddForm(true);
          router.replace('/admin/dashboard/students?action=add');
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
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
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
        data={filteredStudents} 
        onView={(student) => { setViewItem(student); setViewTab('info'); }}
        onEdit={(student) => setEditItem(student)}
        onDelete={(student) => setDeleteItem(student)}
      />

      {/* Add Student Modal */}
      {showAddForm && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200" onClick={(e) => {
          if (e.target === e.currentTarget) {
            setShowAddForm(false);
            router.replace('/admin/dashboard/students');
          }
        }}>
          <div className="bg-white rounded-xl shadow-lg w-full max-w-lg p-6 animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-gray-900">Add New Student</h3>
              <button onClick={() => {
                setShowAddForm(false);
                router.replace('/admin/dashboard/students');
              }} className="text-gray-400 hover:text-gray-600 transition-colors hover:scale-110 active:scale-95">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleAddSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-base font-medium text-gray-700 mb-1">Full Name *</label>
                  <input type="text" autoFocus value={newStudent.name} onChange={e => setNewStudent({...newStudent, name: e.target.value})} className="w-full px-4 py-2.5 border border-gray-200 bg-white text-gray-900 rounded-xl text-base focus:ring-2 focus:ring-blue-500 outline-none" required />
                </div>
                <div>
                  <label className="block text-base font-medium text-gray-700 mb-1">Email *</label>
                  <input type="email" value={newStudent.email} onChange={e => setNewStudent({...newStudent, email: e.target.value})} className="w-full px-4 py-2.5 border border-gray-200 bg-white text-gray-900 rounded-xl text-base focus:ring-2 focus:ring-blue-500 outline-none" required />
                </div>
                <div>
                  <label className="block text-base font-medium text-gray-700 mb-1">Phone Number</label>
                  <input type="tel" value={newStudent.phone} onChange={e => setNewStudent({...newStudent, phone: e.target.value})} className="w-full px-4 py-2.5 border border-gray-200 bg-white text-gray-900 rounded-xl text-base focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
                <div>
                  <label className="block text-base font-medium text-gray-700 mb-1">Batch *</label>
                  <select value={newStudent.batch} onChange={e => setNewStudent({...newStudent, batch: e.target.value})} className="w-full px-4 py-2.5 border border-gray-200 bg-white text-gray-900 rounded-xl text-base focus:ring-2 focus:ring-blue-500 outline-none" required>
                    <option value="" disabled>Select a batch</option>
                    <option value="Batch A - React">Batch A - React</option>
                    <option value="Batch B - Node.js">Batch B - Node.js</option>
                    <option value="Batch C - UI/UX">Batch C - UI/UX</option>
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="block text-base font-medium text-gray-700 mb-1">Status</label>
                  <select value={newStudent.status} onChange={e => setNewStudent({...newStudent, status: e.target.value})} className="w-full px-4 py-2.5 border border-gray-200 bg-white text-gray-900 rounded-xl text-base focus:ring-2 focus:ring-blue-500 outline-none">
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="block text-base font-medium text-gray-700 mb-1">Notes (Optional)</label>
                  <textarea rows={2} className="w-full px-4 py-2.5 border border-gray-200 bg-white text-gray-900 rounded-xl text-base focus:ring-2 focus:ring-blue-500 outline-none"></textarea>
                </div>
              </div>
              <div className="mt-8 flex justify-end gap-3 pt-4 border-t border-gray-100">
                <button type="button" onClick={() => {
                  setShowAddForm(false);
                  router.replace('/admin/dashboard/students');
                }} className="px-5 py-2.5 text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 active:scale-95 text-base font-medium transition-all">Cancel</button>
                <button type="submit" className="px-5 py-2.5 text-white bg-blue-600 rounded-xl hover:bg-blue-700 active:scale-95 text-base font-medium transition-all">Add Student</button>
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
            <p className="text-gray-500 text-base mb-6">Are you sure you want to delete this item? This action cannot be undone.</p>
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
              <h3 className="text-2xl font-bold text-gray-900">Edit Student</h3>
              <button onClick={() => setEditItem(null)} className="text-gray-400 hover:text-gray-600 transition-colors hover:scale-110 active:scale-95">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-base font-medium text-gray-700 mb-1">Name</label>
                  <input type="text" value={editItem.name} onChange={e => setEditItem({...editItem, name: e.target.value})} className="w-full px-4 py-2.5 border border-gray-200 bg-white text-gray-900 rounded-xl text-base focus:ring-2 focus:ring-blue-500 outline-none" required />
                </div>
                <div>
                  <label className="block text-base font-medium text-gray-700 mb-1">Email</label>
                  <input type="email" value={editItem.email} onChange={e => setEditItem({...editItem, email: e.target.value})} className="w-full px-4 py-2.5 border border-gray-200 bg-white text-gray-900 rounded-xl text-base focus:ring-2 focus:ring-blue-500 outline-none" required />
                </div>
                <div>
                  <label className="block text-base font-medium text-gray-700 mb-1">Phone</label>
                  <input type="tel" value={editItem.phone} onChange={e => setEditItem({...editItem, phone: e.target.value})} className="w-full px-4 py-2.5 border border-gray-200 bg-white text-gray-900 rounded-xl text-base focus:ring-2 focus:ring-blue-500 outline-none" required />
                </div>
                <div>
                  <label className="block text-base font-medium text-gray-700 mb-1">Batch</label>
                  <select value={editItem.batch} onChange={e => setEditItem({...editItem, batch: e.target.value})} className="w-full px-4 py-2.5 border border-gray-200 bg-white text-gray-900 rounded-xl text-base focus:ring-2 focus:ring-blue-500 outline-none">
                    <option>Batch A - React</option>
                    <option>Batch B - Node.js</option>
                    <option>Batch C - UI/UX</option>
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="block text-base font-medium text-gray-700 mb-1">Status</label>
                  <select value={editItem.status} onChange={e => setEditItem({...editItem, status: e.target.value})} className="w-full px-4 py-2.5 border border-gray-200 bg-white text-gray-900 rounded-xl text-base focus:ring-2 focus:ring-blue-500 outline-none">
                    <option>Active</option>
                    <option>Inactive</option>
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

      {/* View Modal */}
      {viewItem && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200" onClick={(e) => e.target === e.currentTarget && setViewItem(null)}>
          <div className="bg-white rounded-xl shadow-lg w-full max-w-lg p-6 animate-in zoom-in-95 duration-200 overflow-hidden">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-gray-900">Student Profile</h3>
              <button onClick={() => setViewItem(null)} className="text-gray-400 hover:text-gray-600 transition-colors hover:scale-110 active:scale-95">
                <X size={20} />
              </button>
            </div>
            
            {/* Tabs */}
            <div className="flex gap-4 border-b border-gray-100 mb-6">
              {['info', 'payments', 'assignments'].map(tab => (
                <button 
                  key={tab} 
                  onClick={() => setViewTab(tab)}
                  className={`pb-2 text-base font-medium transition-colors capitalize ${viewTab === tab ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-900'}`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div className="min-h-[200px]">
              {viewTab === 'info' && (
                <div className="space-y-4 animate-in slide-in-from-right-4 duration-300">
                  <div className="flex items-center gap-4 bg-gray-50 p-4 rounded-xl border border-gray-100">
                    <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-2xl font-bold uppercase">
                      {viewItem.name.charAt(0)}
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900">{viewItem.name}</h4>
                      <p className="text-sm text-gray-500">{viewItem.status}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-y-4 gap-x-6 text-base">
                    <div><span className="block text-gray-500 mb-1">Email</span><span className="font-medium text-gray-900">{viewItem.email}</span></div>
                    <div><span className="block text-gray-500 mb-1">Phone</span><span className="font-medium text-gray-900">{viewItem.phone}</span></div>
                    <div><span className="block text-gray-500 mb-1">Batch</span><span className="font-medium text-gray-900">{viewItem.batch}</span></div>
                  </div>
                </div>
              )}

              {viewTab === 'payments' && (
                <div className="space-y-4 animate-in slide-in-from-right-4 duration-300">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                      <span className="block text-blue-600/70 text-sm mb-1 font-semibold uppercase tracking-wider">Payment Status</span>
                      <span className={`font-bold text-xl ${viewItem.paymentStatus === 'Paid' ? 'text-green-600' : 'text-red-500'}`}>{viewItem.paymentStatus}</span>
                    </div>
                    <div className="bg-green-50 p-4 rounded-xl border border-green-100">
                      <span className="block text-green-600/70 text-sm mb-1 font-semibold uppercase tracking-wider">Total Paid</span>
                      <span className="font-bold text-xl text-green-700">{viewItem.totalPaid}</span>
                    </div>
                  </div>
                </div>
              )}

              {viewTab === 'assignments' && (
                <div className="space-y-3 animate-in slide-in-from-right-4 duration-300 max-h-64 overflow-y-auto pr-2">
                  {viewItem.assignments.map((assignment: any, i: number) => (
                    <div key={i} className="bg-gray-50 border border-gray-100 p-3 rounded-xl flex items-center justify-between">
                      <span className="font-medium text-gray-800 text-base">{assignment.title}</span>
                      <span className={`text-sm font-bold px-2 py-1 rounded-md ${assignment.status === 'Completed' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                        {assignment.status}
                      </span>
                    </div>
                  ))}
                  {viewItem.assignments.length === 0 && <p className="text-gray-500 text-base">No assignments found.</p>}
                </div>
              )}
            </div>
            
            <div className="mt-8 pt-4 border-t border-gray-100 flex justify-end">
              <button onClick={() => setViewItem(null)} className="px-6 py-2.5 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-xl text-base font-medium transition-colors active:scale-95">Close Profile</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function StudentsPage() {
  return (
    <Suspense fallback={<div className="flex p-8 justify-center items-center text-gray-500">Loading students directory...</div>}>
      <StudentsContent />
    </Suspense>
  );
}
