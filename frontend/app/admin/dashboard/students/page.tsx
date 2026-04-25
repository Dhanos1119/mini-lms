"use client";

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { PageHeader } from '@/components/PageHeader';
import { Table, Column } from '@/components/Table';
import { Search, Filter, X, AlertCircle, GraduationCap, User, Mail, Phone, BookOpen, Clock, Plus } from 'lucide-react';
import toast from 'react-hot-toast';

import { useData } from '@/contexts/DataContext';

const columns: Column[] = [
  { key: 'name', label: 'Name' },
  { key: 'email', label: 'Email' },
  { key: 'batch', label: 'Batch' },
  { key: 'courseDurationDisplay', label: 'Course Duration' },
  { key: 'status', label: 'Status' },
];

function StudentsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { students, setStudents, users, setUsers } = useData();
  const [searchQuery, setSearchQuery] = useState('');
  const [batchFilter, setBatchFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Modal States
  const [showAddForm, setShowAddForm] = useState(false);
  const [editItem, setEditItem] = useState<any>(null);
  const [viewItem, setViewItem] = useState<any>(null);
  const [deleteItem, setDeleteItem] = useState<any>(null);
  const [viewTab, setViewTab] = useState('info'); // info, academic, financial

  const [newStudent, setNewStudent] = useState({ name: '', email: '', phone: '', batch: '', status: 'Active', courseDuration: 4 });

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

  const formattedStudents = filteredStudents.map(s => ({
    ...s,
    courseDurationDisplay: `${s.courseDuration || 0} Years`
  }));

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStudent.name || !newStudent.email || !newStudent.batch) {
      toast.error("Please fill required fields.");
      return;
    }

    // Auto-generate password
    const autoPassword = "STU" + Math.random().toString(36).substring(2, 8).toUpperCase();

    const studentToAdd = {
      ...newStudent,
      id: Date.now(),
      joinedYear: new Date().getFullYear(),
      totalPaid: 0,
      courseDuration: Number(newStudent.courseDuration)
    };

    // Auto-create User account
    const newUser = {
      id: Date.now(),
      email: newStudent.email,
      password: autoPassword,
      role: 'user' as const,
      name: newStudent.name
    };

    setStudents([studentToAdd, ...students]);
    setUsers([...users, newUser]);

    setShowAddForm(false);
    setNewStudent({ name: '', email: '', phone: '', batch: '', status: 'Active', courseDuration: 4 });
    toast.success("Student added & login credentials sent");
    router.replace('/admin/dashboard/students');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    setStudents(students.map(s => s.id === editItem.id ? { ...editItem, courseDuration: Number(editItem.courseDuration) } : s));
    setEditItem(null);
    toast.success("Student updated successfully");
  };

  const confirmDelete = () => {
    if (!deleteItem) return;
    setStudents(students.filter(s => s.id !== deleteItem.id));
    setDeleteItem(null);
    toast.success("Student deleted successfully");
  };

  const inputClass = "h-11 rounded-lg border border-gray-300 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition w-full text-gray-800 placeholder-gray-400";
  const labelClass = "block text-sm font-medium text-gray-600 mb-1.5 flex items-center gap-2";

  return (
    <div className="animate-in fade-in duration-500 text-gray-900">
      <div className="mb-2">
        <p className="text-base text-gray-500 font-medium font-sans">Manage and view all enrolled students with course-wise tracking.</p>
      </div>
      <PageHeader 
        title="Students Repository" 
        buttonText="Add Student"
        onButtonClick={() => {
          setShowAddForm(true);
          router.replace('/admin/dashboard/students?action=add');
        }}
      >
        <div className="flex flex-col sm:flex-row items-center gap-3 font-sans">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input 
              type="text" 
              placeholder="Search students..." 
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
        data={formattedStudents} 
        onView={(student) => { setViewItem(student); setViewTab('info'); }}
        onEdit={(student) => setEditItem(student)}
        onDelete={(student) => setDeleteItem(student)}
      />

      {/* Add Student Modal */}
      {showAddForm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-in fade-in duration-300" onClick={(e) => {
          if (e.target === e.currentTarget) {
            setShowAddForm(false);
            router.replace('/admin/dashboard/students');
          }
        }}>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl animate-in zoom-in-95 duration-300 overflow-hidden font-sans">
            <div className="px-8 py-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-blue-600 rounded-xl text-white shadow-md shadow-blue-200">
                  <Plus size={24} />
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-semibold text-gray-900">Add New Student</h2>
                  <p className="text-sm text-gray-500">Enroll a new student to a batch</p>
                </div>
              </div>
              <button 
                onClick={() => {
                  setShowAddForm(false);
                  router.replace('/admin/dashboard/students');
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
                    Full Name *
                  </label>
                  <input 
                    type="text" 
                    autoFocus 
                    placeholder="e.g. John Doe"
                    value={newStudent.name} 
                    onChange={e => setNewStudent({...newStudent, name: e.target.value})} 
                    className={inputClass} 
                    required 
                  />
                </div>
                <div className="space-y-1">
                  <label className={labelClass}>
                    <Mail size={16} className="text-blue-500" />
                    Email Address *
                  </label>
                  <input 
                    type="email" 
                    placeholder="e.g. john@example.com"
                    value={newStudent.email} 
                    onChange={e => setNewStudent({...newStudent, email: e.target.value})} 
                    className={inputClass} 
                    required 
                  />
                </div>
                <div className="space-y-1">
                  <label className={labelClass}>
                    <Phone size={16} className="text-blue-500" />
                    Phone Number
                  </label>
                  <input 
                    type="tel" 
                    placeholder="e.g. +1234567890"
                    value={newStudent.phone} 
                    onChange={e => setNewStudent({...newStudent, phone: e.target.value})} 
                    className={inputClass} 
                  />
                </div>
                <div className="space-y-1">
                  <label className={labelClass}>
                    <BookOpen size={16} className="text-blue-500" />
                    Select Batch *
                  </label>
                  <select 
                    value={newStudent.batch} 
                    onChange={e => setNewStudent({...newStudent, batch: e.target.value})} 
                    className={inputClass} 
                    required
                  >
                    <option value="" disabled>Select a batch</option>
                    <option value="Batch A - React">Batch A - React</option>
                    <option value="Batch B - Node.js">Batch B - Node.js</option>
                    <option value="Batch C - UI/UX">Batch C - UI/UX</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className={labelClass}>
                    <Clock size={16} className="text-blue-500" />
                    Course Duration *
                  </label>
                  <select 
                    value={newStudent.courseDuration} 
                    onChange={e => setNewStudent({...newStudent, courseDuration: Number(e.target.value)})} 
                    className={inputClass} 
                    required
                  >
                    <option value={1}>1 Year</option>
                    <option value={2}>2 Years</option>
                    <option value={3}>3 Years</option>
                    <option value={4}>4 Years</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className={labelClass}>
                    <AlertCircle size={16} className="text-blue-500" />
                    Status
                  </label>
                  <select 
                    value={newStudent.status} 
                    onChange={e => setNewStudent({...newStudent, status: e.target.value})} 
                    className={inputClass}
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-3 pt-6 border-t border-gray-100">
                <button 
                  type="button" 
                  onClick={() => {
                    setShowAddForm(false);
                    router.replace('/admin/dashboard/students');
                  }} 
                  className="px-5 py-2.5 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 active:scale-95 text-sm font-medium transition-all"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-5 py-2.5 text-white bg-blue-600 rounded-lg hover:bg-blue-700 active:scale-95 text-sm font-medium shadow transition-all"
                >
                  Add Student
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteItem && (
        <div className="fixed inset-0 z-[110] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200" onClick={(e) => e.target === e.currentTarget && setDeleteItem(null)}>
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-lg animate-in zoom-in-95 duration-200 font-sans">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Confirm Removal</h3>
            <p className="text-gray-500 text-sm font-medium mb-6 leading-relaxed">Are you sure you want to remove this student account? This will permanently delete their access and data.</p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setDeleteItem(null)} className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-xl transition-all active:scale-95">
                Cancel
              </button>
              <button onClick={confirmDelete} className="px-5 py-2.5 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-xl shadow-lg shadow-red-100 transition-all active:scale-95">
                Remove Account
              </button>
            </div>
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
                  <User size={24} />
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-semibold text-gray-900">Modify Student Profile</h2>
                  <p className="text-sm text-gray-500">Update existing student details</p>
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
                    Name
                  </label>
                  <input type="text" value={editItem.name} onChange={e => setEditItem({...editItem, name: e.target.value})} className={inputClass} required />
                </div>
                <div className="space-y-1">
                  <label className={labelClass}>
                    <Mail size={16} className="text-blue-500" />
                    Email
                  </label>
                  <input type="email" value={editItem.email} className={`${inputClass} bg-gray-50 cursor-not-allowed`} disabled />
                </div>
                <div className="space-y-1">
                  <label className={labelClass}>
                    <Phone size={16} className="text-blue-500" />
                    Phone
                  </label>
                  <input type="tel" value={editItem.phone} onChange={e => setEditItem({...editItem, phone: e.target.value})} className={inputClass} />
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
                    <Clock size={16} className="text-blue-500" />
                    Course Duration
                  </label>
                  <select value={editItem.courseDuration} onChange={e => setEditItem({...editItem, courseDuration: Number(e.target.value)})} className={inputClass}>
                    <option value={1}>1 Year</option>
                    <option value={2}>2 Years</option>
                    <option value={3}>3 Years</option>
                    <option value={4}>4 Years</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className={labelClass}>
                    <AlertCircle size={16} className="text-blue-500" />
                    Status
                  </label>
                  <select value={editItem.status} onChange={e => setEditItem({...editItem, status: e.target.value})} className={inputClass}>
                    <option>Active</option>
                    <option>Inactive</option>
                  </select>
                </div>
              </div>
              <div className="mt-8 flex justify-end gap-3 pt-6 border-t border-gray-100">
                <button type="button" onClick={() => setEditItem(null)} className="px-5 py-2.5 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 active:scale-95 text-sm font-medium">Cancel</button>
                <button type="submit" className="px-5 py-2.5 text-white bg-blue-600 rounded-lg hover:bg-blue-700 active:scale-95 text-sm font-medium shadow">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Modal */}
      {viewItem && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-in fade-in duration-300" onClick={(e) => e.target === e.currentTarget && setViewItem(null)}>
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-xl p-0 animate-in zoom-in-95 duration-200 overflow-hidden font-sans">
             <div className="h-32 bg-gradient-to-r from-blue-600 to-indigo-700 relative">
                <button onClick={() => setViewItem(null)} className="absolute top-4 right-4 p-2 bg-black/10 text-white hover:bg-black/20 rounded-full transition-all">
                   <X size={20} />
                </button>
                <div className="absolute -bottom-10 left-8">
                   <div className="w-24 h-24 rounded-3xl bg-white border-4 border-white shadow-xl flex items-center justify-center text-3xl font-black text-blue-600 uppercase">
                      {viewItem.name.charAt(0)}
                   </div>
                </div>
             </div>

             <div className="pt-14 px-8 pb-8">
                <div className="flex justify-between items-start mb-8">
                   <div>
                      <h3 className="text-3xl font-black text-gray-900 tracking-tight">{viewItem.name}</h3>
                      <div className="flex items-center gap-3 mt-1">
                         <span className="text-xs font-black text-blue-600 uppercase tracking-widest bg-blue-50 px-2 py-0.5 rounded">{viewItem.batch}</span>
                         <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                         <span className="text-xs font-bold text-gray-400 capitalize">{viewItem.status} Account</span>
                      </div>
                   </div>
                   <div className="flex flex-col items-end">
                      <span className="px-4 py-1.5 bg-gray-50 text-gray-900 rounded-2xl text-[11px] font-black uppercase tracking-widest border border-gray-100">{viewItem.courseDuration} Year Program</span>
                   </div>
                </div>
                
                {/* Tabs */}
                <div className="flex gap-8 border-b border-gray-100 mb-8">
                  {['info', 'academic', 'financial'].map(tab => (
                    <button 
                      key={tab} 
                      onClick={() => setViewTab(tab)}
                      className={`pb-4 text-xs font-black uppercase tracking-[0.2em] transition-all relative ${viewTab === tab ? 'text-blue-600' : 'text-gray-400 hover:text-gray-900'}`}
                    >
                      {tab}
                      {viewTab === tab && <div className="absolute bottom-0 left-0 right-0 h-1 bg-blue-600 rounded-full"></div>}
                    </button>
                  ))}
                </div>

                {/* Tab Content */}
                <div className="min-h-[240px]">
                  {viewTab === 'info' && (
                    <div className="grid grid-cols-2 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
                      <div className="space-y-1">
                         <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Email Address</span>
                         <p className="text-sm font-bold text-gray-900 break-all">{viewItem.email}</p>
                      </div>
                      <div className="space-y-1">
                         <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Contact Phone</span>
                         <p className="text-sm font-bold text-gray-900">{viewItem.phone || "(Not provided)"}</p>
                      </div>
                      <div className="space-y-1">
                         <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Registration Status</span>
                         <p className="text-sm font-bold text-green-600 uppercase italic">Verified Member</p>
                      </div>
                    </div>
                  )}

                  {viewTab === 'academic' && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
                      <div className="p-5 bg-blue-50 border border-blue-100 rounded-2xl flex items-center justify-between">
                         <div>
                            <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Selected Batch</p>
                            <h5 className="text-lg font-black text-blue-900">{viewItem.batch}</h5>
                         </div>
                         <GraduationCap className="text-blue-200" size={40} />
                      </div>
                      <div>
                         <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Recent Progress Indicators</p>
                         <div className="space-y-2">
                            <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 flex justify-between">
                               <span className="text-xs font-bold text-gray-600">Assigned Modules</span>
                               <span className="text-xs font-black text-gray-900">Full Access</span>
                            </div>
                         </div>
                      </div>
                    </div>
                  )}

                  {viewTab === 'financial' && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-emerald-50 p-6 rounded-2xl border border-emerald-100 text-center">
                          <span className="block text-emerald-600/70 text-[10px] mb-2 font-black uppercase tracking-widest">Financial Standing</span>
                          <span className={`font-black text-2xl uppercase tracking-tighter ${viewItem.paymentStatus === 'Paid' ? 'text-emerald-600' : 'text-red-500'}`}>{viewItem.paymentStatus}</span>
                        </div>
                        <div className="bg-indigo-50 p-6 rounded-2xl border border-indigo-100 text-center">
                          <span className="block text-indigo-600/70 text-[10px] mb-2 font-black uppercase tracking-widest">Lifetime Dues Paid</span>
                          <span className="font-black text-2xl text-indigo-900 tracking-tighter">${viewItem.totalPaid.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
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
